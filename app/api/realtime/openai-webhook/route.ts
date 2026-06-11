import {
  initializeRealtimeDraft,
  parseOpenAIWebhook,
  realtimeCaller,
  realtimeInstructions,
  verifyOpenAIWebhook,
} from "@/lib/elevate-orders-realtime";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyOpenAIWebhook(rawBody, request.headers)) {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const event = parseOpenAIWebhook(rawBody);
  if (event.type !== "realtime.call.incoming" || !event.data?.call_id) {
    return new Response(null, { status: 200 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return new Response("OpenAI is not configured", { status: 503 });
  }

  const callId = event.data.call_id;
  const caller = realtimeCaller(event);
  await initializeRealtimeDraft(callId, caller);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const mcpTool: Record<string, unknown> = {
    type: "mcp",
    server_label: "elevate_orders",
    server_url: `${origin}/api/realtime/mcp?call_id=${encodeURIComponent(callId)}`,
    allowed_tools: ["get_menu", "update_order", "complete_order", "end_call"],
    require_approval: "never",
  };
  if (process.env.REALTIME_MCP_TOKEN) {
    mcpTool.headers = { "X-Elevate-Realtime-Token": process.env.REALTIME_MCP_TOKEN };
  }

  const accepted = await fetch(`https://api.openai.com/v1/realtime/calls/${encodeURIComponent(callId)}/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "realtime",
      model: process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2",
      instructions: realtimeInstructions(),
      reasoning: { effort: "low" },
      audio: {
        input: {
          transcription: { model: "gpt-4o-mini-transcribe" },
          turn_detection: {
            type: "semantic_vad",
            eagerness: "medium",
            create_response: true,
            interrupt_response: true,
          },
        },
        output: {
          voice: process.env.OPENAI_REALTIME_VOICE || "marin",
          speed: 1.03,
        },
      },
      tools: [mcpTool],
      tool_choice: "auto",
    }),
  });

  if (!accepted.ok) {
    const detail = await accepted.text();
    console.error("OpenAI Realtime call acceptance failed", accepted.status, detail);
    return new Response("Could not accept call", { status: 502 });
  }

  await fetch(`${origin}/api/voice/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callSid: callId,
      from: caller,
      status: "in-progress",
      detail: "June answered through OpenAI Realtime and is taking the order",
    }),
    cache: "no-store",
  }).catch(() => undefined);

  return new Response(null, { status: 200 });
}
