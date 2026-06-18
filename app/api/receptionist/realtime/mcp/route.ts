import { after } from "next/server";
import {
  hangupReceptionistRealtimeCall,
  receptionistMcpTools,
  runReceptionistRealtimeTool,
} from "@/lib/elevate-receptionist-realtime";

export const runtime = "nodejs";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

const rpcResult = (id: JsonRpcRequest["id"], result: unknown) =>
  Response.json({ jsonrpc: "2.0", id: id ?? null, result });

const rpcError = (id: JsonRpcRequest["id"], code: number, message: string) =>
  Response.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status: code === -32600 ? 400 : 200 });

export async function POST(request: Request) {
  const expectedToken = process.env.REALTIME_MCP_TOKEN;
  if (expectedToken && request.headers.get("x-elevate-realtime-token") !== expectedToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const callId = new URL(request.url).searchParams.get("call_id") ?? "";
  const message = await request.json() as JsonRpcRequest;
  if (!message.method) return rpcError(message.id, -32600, "Invalid JSON-RPC request.");
  if (message.method.startsWith("notifications/")) return new Response(null, { status: 202 });

  if (message.method === "initialize") {
    return rpcResult(message.id, {
      protocolVersion: "2025-03-26",
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "elevate-receptionist-realtime", version: "1.0.0" },
      instructions: "Front desk lead capture, booking notes, qualification, and clean call completion tools.",
    });
  }
  if (message.method === "ping") return rpcResult(message.id, {});
  if (message.method === "tools/list") return rpcResult(message.id, { tools: receptionistMcpTools() });
  if (message.method === "tools/call") {
    if (!callId) return rpcError(message.id, -32602, "Missing call_id.");
    const params = message.params ?? {};
    const name = String(params.name ?? "");
    const args = params.arguments && typeof params.arguments === "object"
      ? params.arguments as Record<string, unknown>
      : {};
    const output = runReceptionistRealtimeTool(callId, name, args);
    if ((output as { endCall?: boolean }).endCall) {
      after(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2200));
        await hangupReceptionistRealtimeCall(callId);
      });
    }
    const { endCall: _endCall, ...publicOutput } = output as Record<string, unknown> & { endCall?: boolean };
    return rpcResult(message.id, {
      content: [{ type: "text", text: JSON.stringify(publicOutput) }],
      isError: Boolean((output as { ok?: boolean }).ok === false),
    });
  }
  return rpcError(message.id, -32601, "Method not found.");
}

export async function GET() {
  return Response.json({ name: "Elevate Receptionist Realtime MCP", status: "ready" });
}

export async function DELETE() {
  return new Response(null, { status: 204 });
}
