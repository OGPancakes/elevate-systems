import { NextResponse } from "next/server";

import { authenticateFeatherRequest } from "@/lib/feather-api";
import { InquiryRecord, listRecords } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const body = new Uint8Array();
  const authentication = authenticateFeatherRequest(request, body);
  if (authentication.error) return authentication.error;
  const { requestId } = await params;

  try {
    const clients = await listRecords<{ slug: string }>(
      "integration_clients",
      `select=slug&slug=eq.${encodeURIComponent(authentication.clientId)}&is_active=eq.true&limit=1`
    );
    if (!clients.length) {
      return NextResponse.json({ error: "Integration client is disabled." }, { status: 403 });
    }
    const rows = await listRecords<InquiryRecord>(
      "inquiries",
      `select=id,ticket_id,status,created_at,updated_at,external_request_id&external_client_id=eq.${encodeURIComponent(authentication.clientId)}&external_request_id=eq.${encodeURIComponent(requestId)}&limit=1`
    );
    const record = rows[0];
    if (!record) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    return NextResponse.json({
      ticketId: record.ticket_id,
      requestId: record.external_request_id,
      status: record.status,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    });
  } catch (error) {
    console.error("Feather status lookup failed", error);
    return NextResponse.json({ error: "Ticket status is unavailable." }, { status: 500 });
  }
}
