import { saveVoiceState, voiceGather } from "@/lib/elevate-orders-twilio";

export async function POST(request: Request) {
  const form = await request.formData();
  const origin = new URL(request.url).origin;
  const callSid = String(form.get("CallSid") ?? `demo-${Date.now()}`);
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
  const xml = voiceGather(
    origin,
    "Hi! Thanks for calling Juniper and Stone. I'm June, your AI ordering assistant. Are we doing pickup or delivery today?",
  );
  return new Response(xml, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
}
