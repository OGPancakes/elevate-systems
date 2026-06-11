import { voiceGather } from "@/lib/elevate-orders-twilio";

export async function POST(request: Request) {
  const form = await request.formData();
  const origin = new URL(request.url).origin;
  await fetch(`${origin}/api/voice/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callSid: String(form.get("CallSid") ?? ""),
      from: String(form.get("From") ?? ""),
      status: "in-progress",
      detail: "June answered and asked pickup or delivery",
    }),
    cache: "no-store",
  }).catch(() => undefined);
  const xml = voiceGather(
    origin,
    "Thanks for calling Juniper and Stone, powered by Elevate Orders. This is a voice demo and no payment will be taken. Are you ordering for pickup or delivery?",
  );
  return new Response(xml, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const xml = voiceGather(
    origin,
    "Thanks for calling Juniper and Stone, powered by Elevate Orders. This is a voice demo and no payment will be taken. Are you ordering for pickup or delivery?",
  );
  return new Response(xml, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
}
