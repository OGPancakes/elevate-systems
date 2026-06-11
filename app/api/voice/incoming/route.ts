import { voiceGather } from "@/lib/elevate-orders-twilio";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const xml = voiceGather(
    origin,
    "Thanks for calling Juniper and Stone, powered by Elevate Orders. This is a voice demo and no payment will be taken. Are you ordering for pickup or delivery?",
  );
  return new Response(xml, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
}

export async function GET(request: Request) {
  return POST(request);
}

