import { answerGuest, voiceGather } from "@/lib/elevate-orders-twilio";

export async function POST(request: Request) {
  const form = await request.formData();
  const speech = String(form.get("SpeechResult") ?? form.get("Digits") ?? "");
  const origin = new URL(request.url).origin;
  const xml = voiceGather(origin, answerGuest(speech));
  return new Response(xml, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
}

