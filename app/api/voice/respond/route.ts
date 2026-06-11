import { loadVoiceState, processVoiceTurn, voiceGather, voiceHangup } from "@/lib/elevate-orders-twilio";

export async function POST(request: Request) {
  const form = await request.formData();
  const speech = String(form.get("SpeechResult") ?? form.get("Digits") ?? "");
  const origin = new URL(request.url).origin;
  const callSid = String(form.get("CallSid") ?? `demo-${Date.now()}`);
  const state = await loadVoiceState(callSid);
  const turn = await processVoiceTurn(speech, state);
  await fetch(`${origin}/api/voice/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callSid,
      from: String(form.get("From") ?? ""),
      status: "in-progress",
      detail: turn.eventDetail,
    }),
    cache: "no-store",
  }).catch(() => undefined);
  if (turn.hangup) {
    await fetch(`${origin}/api/voice/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callSid,
        from: String(form.get("From") ?? ""),
        status: "completed",
        detail: "Order confirmed and call completed",
      }),
      cache: "no-store",
    }).catch(() => undefined);
  }
  const xml = turn.hangup ? voiceHangup(turn.message) : voiceGather(origin, turn.message);
  return new Response(xml, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
}
