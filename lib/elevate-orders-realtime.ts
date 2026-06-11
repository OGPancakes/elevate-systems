import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { menuItems } from "@/lib/elevate-orders-data";
import type { Order } from "@/lib/elevate-orders-types";
import { listRecords, upsertRecord, type ConversationRecord } from "@/lib/supabase-admin";

type RealtimeLineItem = {
  menuItemId: string;
  quantity: number;
  notes?: string;
};

export type RealtimeOrderDraft = {
  callId: string;
  caller: string;
  customerName?: string;
  phone?: string;
  type?: "Pickup" | "Delivery";
  address?: string;
  notes?: string;
  allergyNotes?: string;
  items: RealtimeLineItem[];
  completed: boolean;
  updatedAt: string;
};

type OpenAIWebhookEvent = {
  id: string;
  type: string;
  data?: {
    call_id?: string;
    sip_headers?: Array<{ name: string; value: string }>;
  };
};

const realtimeGlobal = globalThis as typeof globalThis & {
  elevateOrdersRealtimeDrafts?: Map<string, RealtimeOrderDraft>;
  elevateOrdersRealtimeOrders?: Map<string, Order>;
};

const draftStore = realtimeGlobal.elevateOrdersRealtimeDrafts ?? new Map<string, RealtimeOrderDraft>();
const orderStore = realtimeGlobal.elevateOrdersRealtimeOrders ?? new Map<string, Order>();
realtimeGlobal.elevateOrdersRealtimeDrafts = draftStore;
realtimeGlobal.elevateOrdersRealtimeOrders = orderStore;

const draftSessionId = (callId: string) => `realtime-state-${callId}`;
const orderSessionId = (callId: string) => `realtime-order-${callId}`;
const draftRole = "realtime-order-state";
const orderRole = "realtime-order";

const callerFromSipHeaders = (headers: Array<{ name: string; value: string }> | undefined) => {
  const from = Array.isArray(headers)
    ? headers.find((header) => header.name.toLowerCase() === "from")?.value ?? ""
    : "";
  const match = from.match(/\+(\d{10,15})/);
  return match ? `+${match[1]}` : "";
};

const displayPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone || "Phone guest";
};

const parseStoredMessage = <T>(record: ConversationRecord | undefined, role: string) => {
  const message = record?.messages.find((entry) => entry.role === role);
  if (!message) return null;
  try {
    return JSON.parse(message.content) as T;
  } catch {
    return null;
  }
};

export async function loadRealtimeDraft(callId: string) {
  const warmDraft = draftStore.get(callId);
  try {
    const records = await listRecords<ConversationRecord>(
      "bot_conversations",
      `session_id=eq.${encodeURIComponent(draftSessionId(callId))}&select=*&limit=1`,
    );
    const draft = parseStoredMessage<RealtimeOrderDraft>(records[0], draftRole) ?? warmDraft;
    if (draft) draftStore.set(callId, draft);
    return draft ?? null;
  } catch {
    return warmDraft ?? null;
  }
}

export async function saveRealtimeDraft(draft: RealtimeOrderDraft) {
  draft.updatedAt = new Date().toISOString();
  draftStore.set(draft.callId, draft);
  try {
    await upsertRecord<ConversationRecord>("bot_conversations", {
      session_id: draftSessionId(draft.callId),
      captured_name: draft.customerName ?? null,
      captured_phone: draft.phone || draft.caller || null,
      messages: [{ role: draftRole, content: JSON.stringify(draft) }],
      updated_at: draft.updatedAt,
    }, "session_id");
  } catch {
    // Warm-instance state keeps the live demo usable when storage is offline.
  }
}

export async function initializeRealtimeDraft(callId: string, caller: string) {
  const current = await loadRealtimeDraft(callId);
  const draft: RealtimeOrderDraft = current ?? {
    callId,
    caller,
    phone: caller,
    items: [],
    completed: false,
    updatedAt: new Date().toISOString(),
  };
  if (caller) {
    draft.caller = caller;
    draft.phone ||= caller;
  }
  await saveRealtimeDraft(draft);
  return draft;
}

const normalizeDraft = (callId: string, caller: string, input: Record<string, unknown>): RealtimeOrderDraft => {
  const rawItems = Array.isArray(input.items) ? input.items : [];
  const items = rawItems.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    const menuItemId = String(item.menuItemId ?? "");
    const menuItem = menuItems.find((candidate) => candidate.id === menuItemId && candidate.available);
    const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
    if (!menuItem) return [];
    return [{ menuItemId, quantity, notes: String(item.notes ?? "").trim() || undefined }];
  });
  const type = input.type === "Delivery" ? "Delivery" : input.type === "Pickup" ? "Pickup" : undefined;
  return {
    callId,
    caller,
    customerName: String(input.customerName ?? "").trim() || undefined,
    phone: String(input.phone ?? caller).trim() || caller,
    type,
    address: String(input.address ?? "").trim() || undefined,
    notes: String(input.notes ?? "").trim() || undefined,
    allergyNotes: String(input.allergyNotes ?? "").trim() || undefined,
    items,
    completed: false,
    updatedAt: new Date().toISOString(),
  };
};

const orderTotal = (draft: RealtimeOrderDraft) =>
  draft.items.reduce((sum, line) => {
    const item = menuItems.find((candidate) => candidate.id === line.menuItemId);
    return sum + (item?.price ?? 0) * line.quantity;
  }, 0) * 1.08;

const orderFromDraft = (draft: RealtimeOrderDraft): Order => {
  const now = new Date();
  const promise = new Date(now.getTime() + (draft.type === "Delivery" ? 40 : 20) * 60_000);
  return {
    id: `EO-P${Math.abs(Array.from(draft.callId).reduce((sum, char) => sum + char.charCodeAt(0), 0))}-${now.getTime().toString().slice(-4)}`,
    customer: draft.customerName || "Phone guest",
    phone: displayPhone(draft.phone || draft.caller),
    type: draft.type ?? "Pickup",
    address: draft.type === "Delivery" ? draft.address : undefined,
    notes: draft.notes,
    allergyNotes: draft.allergyNotes,
    items: draft.items.map((line) => {
      const item = menuItems.find((candidate) => candidate.id === line.menuItemId);
      return { name: item?.name ?? line.menuItemId, quantity: line.quantity, notes: line.notes };
    }),
    total: orderTotal(draft),
    status: "New",
    placedAt: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }),
    promiseTime: promise.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }),
    source: "AI Assistant",
  };
};

export async function saveRealtimeOrder(draft: RealtimeOrderDraft) {
  const existing = orderStore.get(draft.callId);
  if (existing) return existing;
  try {
    const records = await listRecords<ConversationRecord>(
      "bot_conversations",
      `session_id=eq.${encodeURIComponent(orderSessionId(draft.callId))}&select=*&limit=1`,
    );
    const stored = parseStoredMessage<Order>(records[0], orderRole);
    if (stored) {
      orderStore.set(draft.callId, stored);
      return stored;
    }
  } catch {
    // Continue and create the order in the warm-instance store.
  }

  const order = orderFromDraft(draft);
  orderStore.set(draft.callId, order);
  draft.completed = true;
  await saveRealtimeDraft(draft);
  try {
    await upsertRecord<ConversationRecord>("bot_conversations", {
      session_id: orderSessionId(draft.callId),
      captured_name: draft.customerName ?? null,
      captured_phone: draft.phone || draft.caller || null,
      messages: [{ role: orderRole, content: JSON.stringify(order) }],
      updated_at: new Date().toISOString(),
    }, "session_id");
  } catch {
    // The order remains visible on the current warm instance if storage is offline.
  }
  return order;
}

export async function listRealtimeOrders() {
  const warmOrders = Array.from(orderStore.values());
  try {
    const records = await listRecords<ConversationRecord>(
      "bot_conversations",
      "session_id=like.realtime-order-%25&select=*&order=updated_at.desc&limit=30",
    );
    const stored = records
      .map((record) => parseStoredMessage<Order>(record, orderRole))
      .filter((order): order is Order => Boolean(order));
    for (const order of stored) orderStore.set(order.id, order);
    return stored;
  } catch {
    return warmOrders;
  }
}

export function verifyOpenAIWebhook(rawBody: string, headers: Headers) {
  const secret = process.env.OPENAI_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const webhookId = headers.get("webhook-id") ?? "";
  const timestamp = headers.get("webhook-timestamp") ?? "";
  const signatureHeader = headers.get("webhook-signature") ?? "";
  const timestampNumber = Number(timestamp);
  if (!webhookId || !timestamp || !signatureHeader || !Number.isFinite(timestampNumber)) return false;
  if (Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;
  const secretValue = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let key: Buffer;
  try {
    key = Buffer.from(secretValue, "base64");
  } catch {
    return false;
  }
  const expected = createHmac("sha256", key)
    .update(`${webhookId}.${timestamp}.${rawBody}`)
    .digest();
  return signatureHeader.split(" ").some((entry) => {
    const value = entry.includes(",") ? entry.split(",").slice(1).join(",") : entry;
    try {
      const provided = Buffer.from(value, "base64");
      return provided.length === expected.length && timingSafeEqual(provided, expected);
    } catch {
      return false;
    }
  });
}

export function parseOpenAIWebhook(rawBody: string) {
  return JSON.parse(rawBody) as OpenAIWebhookEvent;
}

export function realtimeCaller(event: OpenAIWebhookEvent) {
  return callerFromSipHeaders(event.data?.sip_headers);
}

export function realtimeInstructions() {
  const menu = menuItems.map((item) =>
    `- ${item.name} (${item.id}), $${item.price.toFixed(2)}. ${item.description} Ingredients: ${item.ingredients.join(", ")}. Listed allergens: ${item.allergens.join(", ") || "none"}.`,
  ).join("\n");
  return `# Role and objective
You are June, the live phone ordering assistant for Juniper & Stone. Help callers ask menu questions and place a pickup or delivery order.

# Personality and voice
- Sound like a cheerful young adult woman who genuinely enjoys helping people choose food.
- Be warm, lively, relaxed, and conversational. Use contractions and natural reactions.
- Use natural pauses and varied wording. Never sound like a form, a phone tree, or a rehearsed script.
- Brief small talk is welcome. If asked about your day, answer naturally, then gently return to the order.
- Use one or two short sentences at a time. Ask only one question at a time.
- Do not repeat the caller's entire answer back after every turn.

# Conversation flow
- Greet the caller once, introduce yourself as June, and ask what sounds good today.
- Let the caller browse naturally. Answer ingredient, price, vegetarian, and listed-allergen questions from the menu below.
- Ask whether the order is pickup or delivery before checkout.
- For delivery, collect and read back the complete street address, including apartment or unit.
- Collect a name and phone number. The incoming caller number may already be available.
- Record modifiers, special requests, and every allergy exactly as the caller states it.
- For allergies, explain that you can identify listed ingredients but cannot guarantee against shared-kitchen cross-contact.
- Use update_order whenever the cart, customer details, fulfillment, address, notes, or allergy note changes.
- Before placing the order, clearly summarize the items, fulfillment, address if applicable, allergy notes, and estimated total. Ask for explicit confirmation.
- Call complete_order only after the caller clearly confirms the final summary.
- After complete_order succeeds, say a short upbeat confirmation and goodbye. Then call end_call as your final action so the phone disconnects. Do not keep talking after end_call.

# Handling audio
- If the caller trails off, allow a natural pause rather than interrupting.
- If speech is genuinely unclear, ask one short clarification question. Never guess an address, quantity, allergy, or menu item.
- Ignore background conversations and hold music.

# Menu
${menu}`;
}

export function realtimeMcpTools() {
  const orderProperties = {
    customerName: { type: "string", description: "Customer name, if provided." },
    phone: { type: "string", description: "Customer phone number. Keep the incoming caller number when no different number is given." },
    type: { type: "string", enum: ["Pickup", "Delivery"] },
    address: { type: "string", description: "Required for delivery. Include apartment or unit." },
    notes: { type: "string", description: "General order or handoff notes." },
    allergyNotes: { type: "string", description: "Customer-reported allergies and cross-contact warning." },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          menuItemId: { type: "string", enum: menuItems.map((item) => item.id) },
          quantity: { type: "integer", minimum: 1, maximum: 20 },
          notes: { type: "string" },
        },
        required: ["menuItemId", "quantity"],
        additionalProperties: false,
      },
    },
  };
  return [
    {
      name: "get_menu",
      description: "Read the current menu with exact prices, ingredients, dietary tags, and listed allergens.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
    },
    {
      name: "update_order",
      description: "Save the complete current order draft after any cart, fulfillment, customer, address, note, or allergy change. Send the full current cart, not only the latest item.",
      inputSchema: {
        type: "object",
        properties: orderProperties,
        required: ["items"],
        additionalProperties: false,
      },
    },
    {
      name: "complete_order",
      description: "Create the kitchen ticket only after the caller explicitly confirms the final order summary.",
      inputSchema: {
        type: "object",
        properties: orderProperties,
        required: ["customerName", "phone", "type", "items"],
        additionalProperties: false,
      },
    },
    {
      name: "end_call",
      description: "Hang up only after the order is completed and June has already spoken the final confirmation and goodbye.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
    },
  ];
}

export async function runRealtimeTool(callId: string, name: string, input: Record<string, unknown>) {
  const current = await loadRealtimeDraft(callId) ?? await initializeRealtimeDraft(callId, "");
  if (name === "get_menu") {
    return {
      menu: menuItems.filter((item) => item.available).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        vegetarian: Boolean(item.vegetarian),
        glutenFree: Boolean(item.glutenFree),
        ingredients: item.ingredients,
        allergens: item.allergens,
      })),
    };
  }
  if (name === "update_order" || name === "complete_order") {
    const draft = normalizeDraft(callId, current.caller, { ...current, ...input });
    await saveRealtimeDraft(draft);
    if (name === "update_order") {
      return { ok: true, draft, estimatedTotal: Number(orderTotal(draft).toFixed(2)) };
    }
    if (!draft.items.length) return { ok: false, error: "The order has no items." };
    if (!draft.type) return { ok: false, error: "Pickup or delivery is required." };
    if (draft.type === "Delivery" && !draft.address) return { ok: false, error: "A delivery address is required." };
    if (!draft.customerName) return { ok: false, error: "The customer's name is required." };
    const order = await saveRealtimeOrder(draft);
    return { ok: true, order, instruction: "Tell the caller the order is confirmed, say goodbye, then call end_call." };
  }
  if (name === "end_call") {
    if (!current.completed) return { ok: false, error: "Complete the order before ending the call." };
    const response = await fetch(`https://api.openai.com/v1/realtime/calls/${encodeURIComponent(callId)}/hangup`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}` },
    });
    const origin = process.env.NEXT_PUBLIC_SITE_URL;
    if (origin) {
      await fetch(`${origin}/api/voice/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callSid: callId,
          from: current.caller,
          status: "completed",
          detail: "Order confirmed, sent to the kitchen, and call completed",
        }),
        cache: "no-store",
      }).catch(() => undefined);
    }
    return { ok: response.ok, ended: response.ok };
  }
  return { ok: false, error: `Unknown tool: ${name}` };
}
