import { listRecords, upsertRecord, type ConversationRecord } from "@/lib/supabase-admin";

type VoiceEvent = {
  id: string;
  callSid: string;
  from: string;
  status: string;
  detail: string;
  createdAt: string;
};

type VoiceEventStore = { events: VoiceEvent[] };

const globalStore = globalThis as typeof globalThis & {
  elevateOrdersVoiceEvents?: VoiceEventStore;
};

const store = globalStore.elevateOrdersVoiceEvents ?? { events: [] };
globalStore.elevateOrdersVoiceEvents = store;

const callerLabel = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 4 ? `Caller ending ${digits.slice(-4)}` : "New caller";
};

const isVoiceEvent = (value: unknown): value is VoiceEvent => {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<VoiceEvent>;
  return Boolean(event.id && event.callSid && event.status && event.detail && event.createdAt);
};

const isShowcaseCall = (callSid: string) =>
  !/^(CA-(?:PERSIST|DURABLE|PUBLIC|LIVE-DEMO|DEPLOY|FINAL-READY|CONVERSATION|ALLERGY|LIFECYCLE|ROLL|ROLLING|QA)|demo-)/i.test(callSid);

export async function GET() {
  let events = store.events.slice(0, 20);

  try {
    const conversations = await listRecords<ConversationRecord>(
      "bot_conversations",
      "session_id=like.twilio-%25&select=*&order=updated_at.desc&limit=12",
    );
    events = conversations
      .flatMap((conversation) => conversation.messages)
      .map((message) => {
        try {
          return JSON.parse(message.content) as VoiceEvent;
        } catch {
          return null;
        }
      })
      .filter(isVoiceEvent)
      .filter((event) => isShowcaseCall(event.callSid))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20);
  } catch {
    // Local demos work without Supabase; production uses it when configured.
  }

  return Response.json({ events }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let payload: Record<string, string>;

  if (contentType.includes("application/json")) {
    payload = await request.json();
  } else {
    const form = await request.formData();
    payload = Object.fromEntries(Array.from(form.entries()).map(([key, value]) => [key, String(value)]));
  }

  const callSid = payload.CallSid || payload.callSid || `demo-${Date.now()}`;
  const status = (payload.CallStatus || payload.status || "in-progress").toLowerCase();
  const detail = payload.detail
    || (status === "ringing" ? "Incoming call is ringing"
      : status === "in-progress" ? "June answered and is taking the order"
        : status === "completed" ? "Call completed"
          : `Call status: ${status}`);

  const event: VoiceEvent = {
    id: `${callSid}-${Date.now()}`,
    callSid,
    from: callerLabel(payload.From || payload.from || ""),
    status,
    detail,
    createdAt: new Date().toISOString(),
  };

  store.events = [event, ...store.events.filter((item) => !(item.callSid === callSid && item.detail === detail))].slice(0, 40);

  try {
    const sessionId = `twilio-${callSid}`;
    const existing = await listRecords<ConversationRecord>(
      "bot_conversations",
      `session_id=eq.${encodeURIComponent(sessionId)}&select=*&limit=1`,
    );
    const messages = [
      { role: status, content: JSON.stringify(event) },
      ...(existing[0]?.messages ?? []),
    ].slice(0, 20);
    await upsertRecord<ConversationRecord>("bot_conversations", {
      session_id: sessionId,
      messages,
      updated_at: new Date().toISOString(),
    }, "session_id");
  } catch {
    // Fall back to the warm-instance store when Supabase is unavailable.
  }

  return Response.json({ ok: true, event });
}
