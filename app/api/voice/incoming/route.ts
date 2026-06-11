import { saveVoiceState, voiceGather, xmlEscape } from "@/lib/elevate-orders-twilio";

const realtimeSipXml = (origin: string) => {
  const projectId = process.env.OPENAI_PROJECT_ID;
  if (!projectId) return null;
  const sipUri = `sip:${projectId}@sip.api.openai.com;transport=tls`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial answerOnBridge="true" timeout="20">
    <Sip>${xmlEscape(sipUri)}</Sip>
  </Dial>
</Response>`;
};

export async function POST(request: Request) {
  const form = await request.formData();
  const origin = new URL(request.url).origin;
  const callSid = String(form.get("CallSid") ?? `demo-${Date.now()}`);
  const realtimeXml = realtimeSipXml(origin);
  if (realtimeXml) {
    await fetch(`${origin}/api/voice/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callSid,
        from: String(form.get("From") ?? ""),
        status: "ringing",
        detail: "Incoming caller is connecting to June's Realtime voice",
      }),
      cache: "no-store",
    }).catch(() => undefined);
    return new Response(realtimeXml, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
  }
  await saveVoiceState({
    callSid,
    items: [],
    awaiting: "fulfillment",
    history: [],
    completed: false,
  });
  await fetch(`${origin}/api/voice/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callSid,
      from: String(form.get("From") ?? ""),
      status: "in-progress",
      detail: "June answered and asked pickup or delivery",
    }),
    cache: "no-store",
  }).catch(() => undefined);
  const xml = voiceGather(
    origin,
    "Hi! Thanks for calling Juniper and Stone. I'm June, your AI ordering assistant. How's your day going, and are we doing pickup or delivery today?",
  );
  return new Response(xml, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const realtimeXml = realtimeSipXml(origin);
  if (realtimeXml) {
    return new Response(realtimeXml, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
  }
  const xml = voiceGather(
    origin,
    "Hi! Thanks for calling Juniper and Stone. I'm June, your AI ordering assistant. Are we doing pickup or delivery today?",
  );
  return new Response(xml, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
}
