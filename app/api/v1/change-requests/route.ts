import { createHash } from "node:crypto";
import { context, endpoint, json, provider, sameOrigin } from "@/lib/platform/server";
import { readJson } from "@/lib/platform/body";
import { PlatformError, uuid } from "@/lib/platform/policy";

export async function GET(request: Request) {
  return endpoint(async (requestId) => {
    const { principal, token } = await context(request, "read:change-requests");
    if (!token) throw new PlatformError(403, "ACCESS_DENIED", "Portal sign-in is required.");
    const query = new URLSearchParams({
      select:
        "id,request_title,message,priority,affected_area,status,created_at,updated_at,platform_version",
      platform_business_id: `eq.${principal.businessId}`,
      platform_environment: `eq.${principal.environment}`,
      order: "created_at.desc",
      limit: "100",
    });
    const items = await provider(`rest/v1/inquiries?${query}`, { token });
    return json(
      {
        items,
        canCreate: principal.permissions.includes("create:change-request"),
        canManage: principal.permissions.includes("manage:change-requests"),
      },
      requestId,
    );
  });
}
export async function POST(request: Request) {
  return endpoint(async (requestId) => {
    sameOrigin(request);
    const { principal, token } = await context(request, "create:change-request");
    if (!token) throw new PlatformError(403, "ACCESS_DENIED", "Portal sign-in is required.");
    const input = await readJson(request);
    if (
      Object.keys(input).some(
        (key) => !["requestId", "title", "description", "priority", "area"].includes(key),
      )
    )
      throw new PlatformError(422, "INVALID_REQUEST", "Unsupported request fields.");
    if (
      typeof input.title !== "string" ||
      !input.title.trim() ||
      input.title.length > 160 ||
      typeof input.description !== "string" ||
      !input.description.trim() ||
      input.description.length > 8000 ||
      !["Low", "Normal", "High", "Urgent"].includes(String(input.priority)) ||
      (input.area != null && (typeof input.area !== "string" || input.area.length > 500))
    )
      throw new PlatformError(422, "INVALID_REQUEST", "Please check the request details.");
    const payload = {
      title: input.title.trim(),
      description: input.description.trim(),
      priority: input.priority,
      area: input.area ?? null,
    };
    const result = await provider<{ duplicate: boolean }>("rest/v1/rpc/platform_create_request", {
      token,
      method: "POST",
      body: {
        p_business: principal.businessId,
        p_environment: principal.environment,
        p_request: uuid(input.requestId),
        p_hash: createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
        p_title: payload.title,
        p_description: payload.description,
        p_priority: payload.priority,
        p_area: payload.area,
      },
    });
    return json(result, requestId, result.duplicate ? 200 : 201);
  });
}
export async function PATCH(request: Request) {
  return endpoint(async (requestId) => {
    sameOrigin(request);
    const { principal, token } = await context(request, "manage:change-requests");
    if (!token) throw new PlatformError(403, "ACCESS_DENIED", "Portal sign-in is required.");
    const input = await readJson(request);
    if (
      !Number.isInteger(input.version) ||
      Number(input.version) < 1 ||
      typeof input.status !== "string" ||
      ![
        "Submitted",
        "Reviewing",
        "Approved",
        "In Progress",
        "Needs Information",
        "Ready for Review",
        "Completed",
        "Declined",
        "Cancelled",
      ].includes(input.status)
    )
      throw new PlatformError(422, "INVALID_REQUEST", "Invalid status or version.");
    const result = await provider("rest/v1/rpc/platform_update_request", {
      token,
      method: "POST",
      body: {
        p_business: principal.businessId,
        p_environment: principal.environment,
        p_request: uuid(input.id),
        p_status: input.status,
        p_version: input.version,
      },
    });
    return json(result, requestId);
  });
}
