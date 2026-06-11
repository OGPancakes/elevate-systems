import { answerGuest, voiceGather } from "@/lib/elevate-orders-twilio";

export async function POST(request: Request) {
  const form = await request.formData();
  const speech = String(form.get("SpeechResult") ?? form.get("Digits") ?? "");
  const origin = new URL(request.url).origin;
  await fetch(`${origin}/api/voice/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callSid: String(form.get("CallSid") ?? ""),
      from: String(form.get("From") ?? ""),
      status: "in-progress",
      detail: speech ? `Guest said: "${speech.slice(0, 90)}"` : "June is listening for the guest",
    }),
    cache: "no-store",
  }).catch(() => undefined);
  const xml = voiceGather(origin, answerGuest(speech));
  return new Response(xml, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
}
