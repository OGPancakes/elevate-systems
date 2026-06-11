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

export async function GET() {
  return Response.json({ events: store.events.slice(0, 20) }, {
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
  const status = payload.CallStatus || payload.status || "in-progress";
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
  return Response.json({ ok: true, event });
}
