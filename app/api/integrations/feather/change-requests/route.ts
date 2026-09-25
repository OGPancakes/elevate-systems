import { createHash, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { authenticateFeatherRequest } from "@/lib/feather-api";
import {
  FeatherChangeRequest,
  insertIdempotently,
  safeAttachmentName,
  validateAttachment,
  validateFeatherPayload
} from "@/lib/feather-integration";
import { sendLeadNotification } from "@/lib/notification-emails";
import {
  InquiryRecord,
  callRpc,
  deletePrivateObjects,
  insertRecord,
  listRecords,
  uploadPrivateObject
} from "@/lib/supabase-admin";

export const runtime = "nodejs";

const ATTACHMENT_BUCKET = process.env.SUPABASE_SUPPORT_BUCKET || "support-attachments";
const MAX_ATTACHMENTS = 5;
const MAX_TOTAL_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const MAX_REQUEST_BYTES = 25 * 1024 * 1024;

type StoredAttachment = {
  name: string;
  path: string;
  contentType: string;
  size: number;
};

function responseFor(record: InquiryRecord, duplicate: boolean) {
  return NextResponse.json(
    {
      ticketId: record.ticket_id,
      status: record.status,
      accepted: true,
      createdAt: record.created_at,
      duplicate
    },
    { status: duplicate ? 200 : 202 }
  );
}

async function findExisting(clientId: string, requestId: string) {
  const rows = await listRecords<InquiryRecord>(
    "inquiries",
    `select=*&external_client_id=eq.${encodeURIComponent(clientId)}&external_request_id=eq.${encodeURIComponent(requestId)}&limit=1`
  );
  return rows[0] ?? null;
}

async function parseRequest(request: Request, body: Uint8Array) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = JSON.parse(new TextDecoder().decode(body)) as unknown;
    return { payload: validateFeatherPayload(payload), files: [] as File[] };
  }
  if (!contentType.includes("multipart/form-data")) {
    throw new Error("Content-Type must be application/json or multipart/form-data.");
  }

  const reconstructed = new Request(request.url, {
    method: "POST",
    headers: { "content-type": contentType },
    body: body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer
  });
  const form = await reconstructed.formData();
  const rawPayload = form.get("payload");
  if (typeof rawPayload !== "string") throw new Error("Multipart requests require a JSON payload field.");
  const files = form.getAll("attachments").filter((item): item is File => item instanceof File);
  return { payload: validateFeatherPayload(JSON.parse(rawPayload) as unknown), files };
}

async function checkRateLimit(clientId: string) {
  const limit = Math.max(1, Number(process.env.FEATHER_RATE_LIMIT_PER_10_MINUTES || 60));
  return callRpc<boolean>("check_integration_rate_limit", {
    p_client_id: clientId,
    p_limit: limit,
    p_window_seconds: 600
  });
}

async function isActiveClient(clientId: string) {
  const rows = await listRecords<{ slug: string }>(
    "integration_clients",
    `select=slug&slug=eq.${encodeURIComponent(clientId)}&is_active=eq.true&limit=1`
  );
  return rows.length === 1;
}

async function storeAttachments(
  clientId: string,
  payload: FeatherChangeRequest,
  files: File[]
) {
  if (files.length > MAX_ATTACHMENTS) throw new Error(`No more than ${MAX_ATTACHMENTS} attachments are allowed.`);
  const validated = await Promise.all(
    files.map(async (file) =>
      validateAttachment({ bytes: new Uint8Array(await file.arrayBuffer()), name: file.name })
    )
  );
  const totalBytes = validated.reduce((total, file) => total + file.size, 0);
  if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) throw new Error("Attachments exceed the 20 MB combined limit.");

  const stored: StoredAttachment[] = [];
  for (const file of validated) {
    const digest = createHash("sha256").update(file.bytes).digest("hex").slice(0, 20);
    const path = `${clientId}/${payload.externalSiteId}/${payload.requestId}/${digest}-${safeAttachmentName(file.name)}`;
    await uploadPrivateObject({
      bucket: ATTACHMENT_BUCKET,
      path,
      body: file.bytes,
      contentType: file.contentType
    });
    stored.push({ name: file.name, path, contentType: file.contentType, size: file.size });
  }
  return stored;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "Request exceeds the 25 MB limit." }, { status: 413 });
  }

  const body = new Uint8Array(await request.arrayBuffer());
  if (body.byteLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "Request exceeds the 25 MB limit." }, { status: 413 });
  }
  const authentication = authenticateFeatherRequest(request, body);
  if (authentication.error) return authentication.error;
  const clientId = authentication.clientId;

  let payload: FeatherChangeRequest;
  let files: File[];
  try {
    ({ payload, files } = await parseRequest(request, body));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request payload." },
      { status: 400 }
    );
  }

  try {
    if (!(await isActiveClient(clientId))) {
      return NextResponse.json({ error: "Integration client is disabled." }, { status: 403 });
    }
    const existing = await findExisting(clientId, payload.requestId);
    if (existing) return responseFor(existing, true);

    if (!(await checkRateLimit(clientId))) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Retry after the current ten-minute window." },
        { status: 429, headers: { "Retry-After": "600" } }
      );
    }

    const id = randomUUID();
    const ticketId = `ELV-${id.replace(/-/g, "").slice(0, 12).toUpperCase()}`;
    const attachments = await storeAttachments(clientId, payload, files);
    const uploadedPaths = attachments.map((attachment) => attachment.path);

    try {
      const result = await insertIdempotently({
        findExisting: () => findExisting(clientId, payload.requestId),
        insert: async () => {
          const record = await insertRecord<InquiryRecord>("inquiries", {
            id,
            name: payload.requester.name,
            email: payload.requester.email,
            business_name: payload.requester.businessName,
            message: payload.description,
            service_interest: payload.category,
            source: "Feather by Hanna",
            status: "Submitted",
            notes: "",
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ticket_id: ticketId,
            external_client_id: clientId,
            external_site_id: payload.externalSiteId,
            external_request_id: payload.requestId,
            request_title: payload.title,
            category: payload.category,
            priority: payload.priority,
            affected_area: payload.affectedArea,
            requester_identity: payload.requester,
            external_created_at: payload.createdAt,
            attachments
          });
          if (!record) throw new Error("Supabase did not return the created ticket.");
          return record;
        }
      });

      if (result.duplicate && uploadedPaths.length) {
        await deletePrivateObjects(ATTACHMENT_BUCKET, uploadedPaths).catch(() => undefined);
      }

      if (!result.duplicate) {
        await sendLeadNotification({
          subject: `[${ticketId}] Feather change request: ${payload.title}`,
          text: [
            `Ticket: ${ticketId}`,
            `Business: ${payload.requester.businessName}`,
            `Requester: ${payload.requester.name}`,
            `Priority: ${payload.priority}`,
            `Category: ${payload.category}`,
            `Area: ${payload.affectedArea || "Not specified"}`,
            "",
            payload.description
          ].join("\n")
        }).catch(() => false);
      }

      return responseFor(result.record, result.duplicate);
    } catch (error) {
      if (uploadedPaths.length) {
        await deletePrivateObjects(ATTACHMENT_BUCKET, uploadedPaths).catch(() => undefined);
      }
      throw error;
    }
  } catch (error) {
    console.error("Feather change request failed", error);
    return NextResponse.json({ error: "The request could not be persisted." }, { status: 500 });
  }
}
