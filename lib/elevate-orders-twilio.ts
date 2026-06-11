import { menuItems } from "@/lib/elevate-orders-data";

export const xmlEscape = (value: string) =>
  value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  })[character] ?? character);

const findMenuItem = (text: string) => {
  const lower = text.toLowerCase();
  return menuItems.find((item) => lower.includes(item.name.toLowerCase()))
    ?? menuItems.find((item) => item.name.toLowerCase().split(" ").some((word) => word.length > 4 && lower.includes(word)));
};

export const answerGuest = (input: string) => {
  const text = input.trim().toLowerCase();
  const item = findMenuItem(text);

  if (!text) return "I did not catch that. You can ask about the menu, ingredients, allergies, or say an item you would like.";
  if (/\b(done|finish|checkout|complete)\b/.test(text)) {
    return "Your Elevate Orders voice test is complete. No charge or live kitchen order was placed during this demo.";
  }
  if (item && /\b(ingredient|allergen|allergy|contain|gluten|dairy|egg|nut|soy|sesame)\b/.test(text)) {
    const allergens = item.allergens.length ? item.allergens.join(", ") : "no listed major allergens";
    return `${item.name} contains ${item.ingredients.join(", ")}. Its listed allergens are ${allergens}. Please speak with the restaurant before ordering for an allergy because shared-kitchen cross-contact is possible.`;
  }
  if (/\b(gluten|celiac)\b/.test(text)) {
    const choices = menuItems.filter((menuItem) => menuItem.glutenFree).slice(0, 2);
    return `The menu lists ${choices.map((choice) => choice.name).join(" and ")} without gluten ingredients. Shared-kitchen cross-contact is still possible, so the restaurant must confirm allergy safety.`;
  }
  if (/\b(menu|have|serve|options)\b/.test(text)) {
    return `Popular choices include ${menuItems.slice(0, 4).map((menuItem) => `${menuItem.name} for ${menuItem.price.toFixed(2)} dollars`).join(", ")}. Ask me about any item's ingredients.`;
  }
  if (item || /\b(add|order|want|take|get)\b/.test(text)) {
    const choice = item ?? menuItems.find((menuItem) => text.includes(menuItem.category.toLowerCase()));
    if (choice) {
      return `I heard ${choice.name} for ${choice.price.toFixed(2)} dollars. I added it to this voice demo. Say another item, ask about ingredients, or say done.`;
    }
  }
  if (/\b(delivery|pickup)\b/.test(text)) {
    return `Great, I noted ${text.includes("delivery") ? "delivery" : "pickup"} for this demo. What would you like to order?`;
  }

  return "I can help with sandwiches, pizza, bowls, sides, and drinks. Try saying, tell me the menu, or ask what is in a specific item.";
};

export const voiceGather = (origin: string, prompt: string) => `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech dtmf" action="${xmlEscape(origin)}/api/voice/respond" method="POST" speechTimeout="auto" timeout="5">
    <Say voice="Polly.Joanna">${xmlEscape(prompt)}</Say>
  </Gather>
  <Say voice="Polly.Joanna">I did not hear a response. Let us try once more.</Say>
  <Redirect method="POST">${xmlEscape(origin)}/api/voice/incoming</Redirect>
</Response>`;

