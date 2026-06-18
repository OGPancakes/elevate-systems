export const runtime = "nodejs";

type PreviewCallEvent = {
  callSid: string;
  to: string;
  status: string;
  detail: string;
  updatedAt: string;
};

const globalStore = globalThis as typeof globalThis & {
  elevateReceptionistPreviewCalls?: Map<string, PreviewCallEvent>;
};

const previewCalls = globalStore.elevateReceptionistPreviewCalls ?? new Map<string, PreviewCallEvent>();
globalStore.elevateReceptionistPreviewCalls = previewCalls;

const normalizeUsPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return "";
};

const displayPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return value;
};

const callDetail = (status: string) => {
  switch (status.toLowerCase()) {
    case "queued":
    case "initiated":
      return "Twilio accepted the preview and is dialing the visitor.";
    case "ringing":
      return "The visitor's phone is ringing.";
    case "in-progress":
    case "answered":
      return "The preview call is connected to the receptionist assistant.";
    case "completed":
      return "The preview call ended.";
    case "busy":
    case "failed":
    case "no-answer":
    case "canceled":
      return `The preview call ended with status: ${status}.`;
    default:
      return `Call status: ${status}.`;
  }
};

export async function GET(request: Request) {
  const callSid = new URL(request.url).searchParams.get("callSid") ?? "";
  if (!callSid) return Response.json({ ok: false, error: "Missing callSid." }, { status: 400 });
  return Response.json({
    ok: true,
    call: previewCalls.get(callSid) ?? null,
  }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const callSid = String(form.get("CallSid") ?? "");
    const status = String(form.get("CallStatus") ?? form.get("CallStatusCallbackEvent") ?? "in-progress").toLowerCase();
    if (callSid) {
      previewCalls.set(callSid, {
        callSid,
        to: displayPhone(String(form.get("To") ?? "")),
        status,
        detail: callDetail(status),
        updatedAt: new Date().toISOString(),
      });
    }
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
      ok: false,
      error: "Phone preview is not configured yet. Add Twilio env vars so this button can place a real call.",
    }, { status: 503 });
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
  if (data.sid) {
    const status = data.status ?? "queued";
    previewCalls.set(data.sid, {
      callSid: data.sid,
      to: displayPhone(to),
      status,
      detail: callDetail(status),
      updatedAt: new Date().toISOString(),
    });
  }
  return Response.json({ ok: true, mode: "live", callSid: data.sid, status: data.status ?? "queued" });
}
