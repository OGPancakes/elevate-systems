import OpenAI from "openai";
import { menuItems } from "@/lib/elevate-orders-data";
import { listRecords, upsertRecord, type ConversationRecord } from "@/lib/supabase-admin";

export type VoiceOrderState = {
  callSid: string;
  fulfillment?: "Pickup" | "Delivery";
  address?: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  offeredItemIds?: string[];
  allergyNotes?: string;
  awaiting?: "fulfillment" | "address" | "confirmation";
  history: Array<{ role: "user" | "assistant"; content: string }>;
  completed: boolean;
};

export type VoiceTurn = {
  message: string;
  state: VoiceOrderState;
  hangup: boolean;
  eventDetail: string;
};

export const xmlEscape = (value: string) =>
  value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  })[character] ?? character);

const sessionId = (callSid: string) => `twilio-${callSid}`;
const stateRole = "voice-state";
const voiceName = "Polly.Joanna-Generative";
const stateGlobal = globalThis as typeof globalThis & {
  elevateOrdersVoiceStates?: Map<string, VoiceOrderState>;
};
const stateStore = stateGlobal.elevateOrdersVoiceStates ?? new Map<string, VoiceOrderState>();
stateGlobal.elevateOrdersVoiceStates = stateStore;

const blankState = (callSid: string): VoiceOrderState => ({
  callSid,
  items: [],
  awaiting: "fulfillment",
  history: [],
  completed: false,
});

export async function loadVoiceState(callSid: string) {
  try {
    const records = await listRecords<ConversationRecord>(
      "bot_conversations",
      `session_id=eq.${encodeURIComponent(sessionId(callSid))}&select=*&limit=1`,
    );
    const saved = records[0]?.messages.find((message) => message.role === stateRole);
    const state = saved ? JSON.parse(saved.content) as VoiceOrderState : stateStore.get(callSid) ?? blankState(callSid);
    stateStore.set(callSid, state);
    return state;
  } catch {
    return stateStore.get(callSid) ?? blankState(callSid);
  }
}

export async function saveVoiceState(state: VoiceOrderState) {
  stateStore.set(state.callSid, state);
  try {
    const records = await listRecords<ConversationRecord>(
      "bot_conversations",
      `session_id=eq.${encodeURIComponent(sessionId(state.callSid))}&select=*&limit=1`,
    );
    const messages = [
      { role: stateRole, content: JSON.stringify(state) },
      ...(records[0]?.messages ?? []).filter((message) => message.role !== stateRole),
    ].slice(0, 30);
    await upsertRecord<ConversationRecord>("bot_conversations", {
      session_id: sessionId(state.callSid),
      messages,
      updated_at: new Date().toISOString(),
    }, "session_id");
  } catch {
    // The call remains usable with turn-local state if durable storage is offline.
  }
}

const findMentionedItems = (text: string) => {
  const lower = text.toLowerCase();
  const aliases: Record<string, string[]> = {
    "italian-stack": ["italian stack", "italian sub", "italian sandwich"],
    "turkey-club": ["turkey club", "turkey sandwich"],
    "hot-honey-pie": ["hot honey", "pepperoni pizza", "pepperoni pie"],
    "garden-pie": ["garden pie", "veggie pizza", "vegetable pizza"],
    "chicken-bowl": ["chicken bowl", "charred chicken"],
    "market-bowl": ["veggie bowl", "market bowl", "vegetable bowl"],
    "garlic-knots": ["garlic knots", "garlic knot"],
    "crispy-potatoes": ["crispy potatoes", "potatoes", "potato side"],
    "blood-orange": ["blood orange", "orange soda", "soda"],
  };
  return menuItems.filter((item) =>
    [item.name.toLowerCase(), ...(aliases[item.id] ?? [])].some((name) => lower.includes(name)),
  );
};

const quantityFrom = (text: string, itemName: string) => {
  const lower = text.toLowerCase();
  const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
  const itemWord = itemName.toLowerCase().split(" ").find((word) => word.length > 4) ?? itemName.toLowerCase();
  const match = lower.match(new RegExp(`(?:^|\\s)(\\d+|one|two|three|four|five)(?:\\s+\\w+){0,2}\\s+${itemWord}`));
  if (!match) return 1;
  return Number(match[1]) || words[match[1]] || 1;
};

const orderSummary = (state: VoiceOrderState) => {
  const items = state.items.map((item) => `${item.quantity} ${item.name}`).join(", ");
  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fulfillment = state.fulfillment === "Delivery" ? `for delivery to ${state.address}` : "for pickup";
  const allergy = state.allergyNotes ? ` I also have your allergy alert saved: ${state.allergyNotes.replace(/\.$/, "")}.` : "";
  return `${items}, ${fulfillment}. Your estimated total before tax is ${total.toFixed(2)} dollars.${allergy}`;
};

const detectAllergy = (text: string) => {
  if (!/\b(allerg(?:y|ic)|celiac|cannot have|can't have|intoleran|avoid)\b/i.test(text)) return undefined;
  const allergens = ["gluten", "wheat", "dairy", "milk", "egg", "peanut", "tree nut", "soy", "sesame", "shellfish"];
  const found = allergens.filter((allergen) => text.toLowerCase().includes(allergen));
  return `${found.length ? found.join(", ").toUpperCase() : "GUEST-REPORTED"} ALLERGY - confirm ingredients and prevent cross-contact.`;
};

const fallbackNaturalReply = (text: string, state: VoiceOrderState) => {
  const lower = text.toLowerCase();
  if (/\b(how are you|how's your day|hows your day|how is your day)\b/.test(lower)) {
    return "I'm doing great, thanks for asking! I'm excited to help you find something really good today. What are you in the mood for?";
  }
  if (/\b(menu|what do you have|what do you serve)\b/.test(lower)) {
    return "Absolutely! We have stacked sandwiches, hot pizzas, fresh bowls, crispy sides, and drinks. Are you feeling more like pizza, a sandwich, or a bowl?";
  }
  return "Totally! Tell me what sounds good, or ask me about any item, ingredient, or allergy.";
};

export const answerGuest = (input: string) => fallbackNaturalReply(input, blankState("sms-demo"));

async function naturalizeReply(text: string, state: VoiceOrderState, requiredMessage?: string) {
  if (requiredMessage || !process.env.OPENAI_API_KEY) return requiredMessage ?? fallbackNaturalReply(text, state);

  const menu = menuItems.map((item) =>
    `${item.name}, $${item.price.toFixed(2)}: ${item.description} Ingredients: ${item.ingredients.join(", ")}. Allergens: ${item.allergens.join(", ") || "none listed"}.`,
  ).join("\n");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_VOICE_MODEL || "gpt-4o-mini",
      instructions: `You are June, the AI phone ordering assistant for Juniper & Stone.
Sound like a bright, upbeat young adult woman: friendly, excited, natural, and genuinely conversational.
You may answer brief small talk such as how your day is, then smoothly return to helping with the order.
Use contractions and varied phrasing. Avoid robotic lists, repeated greetings, and saying "I heard".
Keep each spoken turn to 1-3 short sentences. End with one useful question.
Never invent menu facts. Never claim an allergy is safe from cross-contact.
The caller has currently chosen: ${state.items.map((item) => `${item.quantity} ${item.name}`).join(", ") || "nothing yet"}.
Fulfillment: ${state.fulfillment ?? "not chosen"}. Allergy note: ${state.allergyNotes ?? "none"}.

MENU:
${menu}`,
      input: [
        ...state.history.slice(-8),
        { role: "user", content: text },
      ],
    });
    return response.output_text.trim() || fallbackNaturalReply(text, state);
  } catch {
    return fallbackNaturalReply(text, state);
  }
}

export async function processVoiceTurn(input: string, state: VoiceOrderState): Promise<VoiceTurn> {
  const text = input.trim();
  const lower = text.toLowerCase();
  let requiredMessage: string | undefined;
  let hangup = false;
  let eventDetail = text ? `Guest said: "${text.slice(0, 90)}"` : "June is listening for the guest";

  if (state.awaiting === "confirmation" && /^(yes|yeah|yep|correct|confirm|place it|that's right|thats right|sounds good)\b/i.test(text)) {
    state.completed = true;
    state.awaiting = undefined;
    requiredMessage = `Perfect! Your order is confirmed ${state.fulfillment === "Delivery" ? "for delivery" : "for pickup"}. Thanks for calling Juniper and Stone, and enjoy your meal!`;
    eventDetail = `Order confirmed: ${orderSummary(state)}`;
    hangup = true;
  } else {
    const acceptsRecommendation = /^(yes|yeah|yep|sure|okay|ok|add it|add that|i'll take that|ill take that|sounds good|that works)\b/i.test(text);
    if (acceptsRecommendation && state.offeredItemIds?.length) {
      const offered = menuItems.filter((item) => state.offeredItemIds?.includes(item.id));
      for (const item of offered) {
        const existing = state.items.find((selected) => selected.id === item.id);
        if (existing) existing.quantity += 1;
        else state.items.push({ id: item.id, name: item.name, price: item.price, quantity: 1 });
      }
      state.offeredItemIds = [];
      requiredMessage = `You got it! I've added ${offered.map((item) => item.name).join(" and ")}. Anything else today?`;
    }

    if (/\b(delivery)\b/i.test(text)) {
      state.fulfillment = "Delivery";
      state.awaiting = "address";
      requiredMessage = /\b(how are you|how's your day|hows your day|how is your day)\b/i.test(text)
        ? "I'm doing great, thanks for asking! Delivery sounds perfect. What address should we bring it to?"
        : "Delivery sounds great! What address should we bring it to?";
    } else if (/\b(pickup|pick up)\b/i.test(text)) {
      state.fulfillment = "Pickup";
      state.awaiting = undefined;
      requiredMessage = /\b(how are you|how's your day|hows your day|how is your day)\b/i.test(text)
        ? "I'm doing great, thanks for asking! Pickup it is. What sounds good today?"
        : "Perfect, pickup it is! What sounds good today?";
    } else if (state.awaiting === "address" && text.length > 5) {
      state.address = text;
      state.awaiting = undefined;
      requiredMessage = "Got it, thank you! Now, what would you like to order?";
    }

    const allergy = detectAllergy(text);
    if (allergy) state.allergyNotes = allergy;

    const mentioned = findMentionedItems(text);
    if (mentioned.length && /\b(add|want|take|get|order|i'll have|ill have|give me|yes)\b/i.test(text)) {
      for (const item of mentioned) {
        const quantity = quantityFrom(text, item.name);
        const existing = state.items.find((selected) => selected.id === item.id);
        if (existing) existing.quantity += quantity;
        else state.items.push({ id: item.id, name: item.name, price: item.price, quantity });
      }
      const names = mentioned.map((item) => item.name).join(" and ");
      requiredMessage = allergy
        ? `Awesome, I've added ${names}, and I saved your allergy alert. Shared-kitchen cross-contact is possible, so the restaurant will need to confirm it with you. Would you like anything else?`
        : `Awesome, I've added ${names}. Would you like anything else with that?`;
    }

    if (!mentioned.length && !requiredMessage) {
      if (/\b(meaty|meat|hearty|filling)\b/i.test(text)) {
        state.offeredItemIds = ["italian-stack", "crispy-potatoes"];
        requiredMessage = "Oh, I've got you! The Italian Stack with Crispy Potatoes is hearty, savory, and seriously satisfying. Want me to add both?";
      } else if (/\b(spicy|hot|kick)\b/i.test(text)) {
        state.offeredItemIds = ["hot-honey-pie", "garlic-knots"];
        requiredMessage = "You should try the Hot Honey Pepperoni with Garlic Knots. It's sweet, spicy, and such a good combo. Want me to add both?";
      } else if (/\b(vegetarian|veggie|no meat)\b/i.test(text)) {
        state.offeredItemIds = ["market-bowl", "blood-orange"];
        requiredMessage = "The Market Veggie Bowl with a Blood Orange Soda is fresh, filling, and really good together. Want me to add both?";
      }
    }

    if (/\b(done|that's all|thats all|finish|checkout|complete order|place the order|nothing else)\b/i.test(text)) {
      if (!state.items.length) {
        requiredMessage = "I can finish that for you, but your order is still empty. What would you like to add?";
      } else if (!state.fulfillment) {
        state.awaiting = "fulfillment";
        requiredMessage = "Absolutely! Before I confirm it, is this for pickup or delivery?";
      } else if (state.fulfillment === "Delivery" && !state.address) {
        state.awaiting = "address";
        requiredMessage = "Almost done! What delivery address should I use?";
      } else {
        state.awaiting = "confirmation";
        requiredMessage = `${orderSummary(state)}. Does everything sound right?`;
      }
    }
  }

  const message = await naturalizeReply(text, state, requiredMessage);
  const nextHistory: VoiceOrderState["history"] = [
    ...state.history,
    { role: "user", content: text },
    { role: "assistant", content: message },
  ];
  state.history = nextHistory.slice(-12);
  await saveVoiceState(state);
  return { message, state, hangup, eventDetail };
}

export const voiceGather = (origin: string, prompt: string) => `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech dtmf" action="${xmlEscape(origin)}/api/voice/respond" method="POST" speechTimeout="auto" timeout="4" actionOnEmptyResult="true" hints="${xmlEscape(menuItems.map((item) => item.name).join(", "))}">
    <Say voice="${voiceName}" language="en-US">${xmlEscape(prompt)}</Say>
  </Gather>
</Response>`;

export const voiceHangup = (prompt: string) => `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voiceName}" language="en-US">${xmlEscape(prompt)}</Say>
  <Hangup/>
</Response>`;
