import { answerGuest, xmlEscape } from "@/lib/elevate-orders-twilio";

export async function POST(request: Request) {
  const form = await request.formData();
  const body = String(form.get("Body") ?? "");
  const message = answerGuest(body);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${xmlEscape(message)}</Message></Response>`;
  return new Response(xml, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
}

