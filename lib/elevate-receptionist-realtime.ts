import "server-only";

import WebSocket from "next/dist/compiled/ws";

type OpenAIWebhookEvent = {
  id: string;
  type: string;
  data?: {
    call_id?: string;
    sip_headers?: Array<{ name: string; value: string }>;
  };
};

type ReceptionistLead = {
  callId: string;
  caller: string;
  name?: string;
  phone?: string;
  businessType?: string;
  request?: string;
  urgency?: string;
  appointmentPreference?: string;
  notes?: string;
  updatedAt: string;
};

const globalStore = globalThis as typeof globalThis & {
  elevateReceptionistLeads?: Map<string, ReceptionistLead>;
};

const leadStore = globalStore.elevateReceptionistLeads ?? new Map<string, ReceptionistLead>();
globalStore.elevateReceptionistLeads = leadStore;

const callerFromSipHeaders = (headers: Array<{ name: string; value: string }> | undefined) => {
  const from = Array.isArray(headers)
    ? headers.find((header) => header.name.toLowerCase() === "from")?.value ?? ""
    : "";
  const match = from.match(/\+(\d{10,15})/);
  return match ? `+${match[1]}` : "";
};

const headerValue = (event: OpenAIWebhookEvent, name: string) =>
  event.data?.sip_headers?.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value ?? "";

export function isReceptionistRealtimeCall(event: OpenAIWebhookEvent) {
  return headerValue(event, "X-Elevate-Product").toLowerCase() === "receptionist";
}

export function receptionistCaller(event: OpenAIWebhookEvent) {
  return callerFromSipHeaders(event.data?.sip_headers);
}

export function initializeReceptionistLead(callId: string, caller: string) {
  const current = leadStore.get(callId) ?? {
    callId,
    caller,
    phone: caller,
    updatedAt: new Date().toISOString(),
  };
  current.caller = caller || current.caller;
  current.phone ||= caller;
  current.updatedAt = new Date().toISOString();
  leadStore.set(callId, current);
  return current;
}

export function receptionistInstructions() {
  return `# Role and objective
You are Maya, the Elevate Receptionist voice demo. You are showing business owners what an AI front desk can sound like.

# Voice
- Sound like a warm, upbeat, professional young woman at a front desk.
- Be natural and human. Use contractions, light personality, and short responses.
- Do not sound like a phone tree, survey, script, or robot.
- Ask one question at a time and respond immediately after short answers.
- If the caller asks how you are, answer naturally and then continue.

# Demo business
Pretend you are the receptionist for Brightline Studio, a premium local service business that books consultations, answers service questions, and routes qualified leads.

# What you can help with
- Answer questions about services, hours, pricing ranges, availability, and booking.
- Collect the caller's name, phone number, service need, urgency, preferred appointment time, and notes for the team.
- Qualify whether the caller is a good fit and suggest the next step.

# Conversation flow
- The system sends the opening greeting. Do not wait for the caller to speak first.
- Greet with: "Hi, this is Maya with Brightline Studio. I can help with questions, availability, or booking a consultation. How can I help today?"
- Keep the call fluid. If the caller gives a name, acknowledge it and ask the next useful question right away.
- If they want booking, collect name, phone, reason for visit, preferred day/time, and urgency.
- Before ending, summarize the note you captured and say the team will follow up.
- If the caller says goodbye, thanks, never mind, or that they are all set, say one warm goodbye and call end_call.
- Use save_call_note whenever you learn useful lead or booking details.
- Call end_call after your final goodbye.

# Boundaries
- Do not discuss restaurant orders, Juniper & Stone, food, pickup, delivery, or menu items.
- If asked what this is, explain that it is an Elevate Receptionist demo for AI front desk calls.`;
}

export function receptionistMcpTools() {
  const leadProperties = {
    name: { type: "string", description: "Caller name if provided." },
    phone: { type: "string", description: "Caller phone number if provided." },
    businessType: { type: "string", description: "The caller's business type or context." },
    request: { type: "string", description: "What the caller wants help with." },
    urgency: { type: "string", description: "How urgent the request is." },
    appointmentPreference: { type: "string", description: "Preferred appointment or callback time." },
    notes: { type: "string", description: "Concise front desk notes for the business owner." },
  };

  return [
    {
      name: "save_call_note",
      description: "Save the current front desk lead, booking request, qualification details, and notes.",
      inputSchema: {
        type: "object",
        properties: leadProperties,
        additionalProperties: false,
      },
    },
    {
      name: "end_call",
      description: "End the phone call cleanly after Maya has already spoken a final goodbye.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
    },
  ];
}

export function runReceptionistRealtimeTool(callId: string, name: string, input: Record<string, unknown>) {
  const current = leadStore.get(callId) ?? initializeReceptionistLead(callId, "");
  if (name === "save_call_note") {
    const lead: ReceptionistLead = {
      ...current,
      name: String(input.name ?? current.name ?? "").trim() || undefined,
      phone: String(input.phone ?? current.phone ?? "").trim() || current.phone,
      businessType: String(input.businessType ?? current.businessType ?? "").trim() || undefined,
      request: String(input.request ?? current.request ?? "").trim() || undefined,
      urgency: String(input.urgency ?? current.urgency ?? "").trim() || undefined,
      appointmentPreference: String(input.appointmentPreference ?? current.appointmentPreference ?? "").trim() || undefined,
      notes: String(input.notes ?? current.notes ?? "").trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    leadStore.set(callId, lead);
    return { ok: true, lead };
  }
  if (name === "end_call") {
    return {
      ok: true,
      endCall: true,
      message: "The caller has been told goodbye. The call will disconnect cleanly now.",
    };
  }
  return { ok: false, error: `Unknown tool: ${name}` };
}

export async function hangupReceptionistRealtimeCall(callId: string) {
  const response = await fetch(`https://api.openai.com/v1/realtime/calls/${encodeURIComponent(callId)}/hangup`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}` },
  });
  return response.ok;
}

export function startReceptionistGreeting(callId: string) {
  return new Promise<void>((resolve) => {
    if (!process.env.OPENAI_API_KEY) {
      resolve();
      return;
    }

    const socket = new WebSocket(
      `wss://api.openai.com/v1/realtime?call_id=${encodeURIComponent(callId)}`,
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } },
    );
    const finish = () => {
      clearTimeout(timeout);
      try {
        socket.close();
      } catch {
        // The call can close before the sideband connection does.
      }
      resolve();
    };
    const timeout = setTimeout(finish, 12_000);

    socket.on("open", () => {
      socket.send(JSON.stringify({
        type: "response.create",
        response: {
          instructions: "Greet the caller now. Say exactly: Hi, this is Maya with Brightline Studio. I can help with questions, availability, or booking a consultation. How can I help today?",
        },
      }));
    });
    socket.on("message", (data) => {
      try {
        const event = JSON.parse(data.toString()) as { type?: string };
        if (event.type === "response.done") finish();
      } catch {
        // Ignore unrelated or malformed sideband events.
      }
    });
    socket.on("error", finish);
    socket.on("close", finish);
  });
}
