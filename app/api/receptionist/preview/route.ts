export const runtime = "nodejs";

const normalizeUsPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return "";
};

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    return Response.json({ ok: true });
  }

  const { phone } = await request.json().catch(() => ({ phone: "" })) as { phone?: string };
  const to = normalizeUsPhone(String(phone ?? ""));
  if (!to) {
    return Response.json({ ok: false, error: "Enter a valid US phone number." }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_RECEPTIONIST_FROM_NUMBER || process.env.TWILIO_FROM_NUMBER;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  if (!accountSid || !authToken || !from) {
    return Response.json({
      ok: true,
      mode: "demo",
      message: "Preview animation started. Add Twilio env vars to place real outbound calls.",
    });
  }

  const params = new URLSearchParams({
    To: to,
    From: from,
    Url: `${origin}/api/receptionist/voice`,
    Method: "POST",
    StatusCallback: `${origin}/api/receptionist/preview`,
    StatusCallbackMethod: "POST",
  });
  for (const event of ["initiated", "ringing", "answered", "completed"]) {
    params.append("StatusCallbackEvent", event);
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Receptionist preview call failed", response.status, detail);
    return Response.json({
      ok: false,
      error: "The preview call could not be started. If this is a Twilio trial account, make sure the destination number is verified.",
    }, { status: 502 });
  }

  const data = await response.json() as { sid?: string; status?: string };
  return Response.json({ ok: true, mode: "live", callSid: data.sid, status: data.status ?? "queued" });
}
