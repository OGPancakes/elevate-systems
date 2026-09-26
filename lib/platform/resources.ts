import "server-only";
import { context, endpoint, json, provider } from "./server";
import { PlatformError, uuid } from "./policy";
import { encodeCursor, decodeCursor } from "./pagination";

const resources = {
  customers: { permission: "read:customers", select: "id,name,email,phone,created_at" },
  submissions: {
    permission: "read:submissions",
    select: "id,customer_id,external_id,schema_name,kind,submitted_at,created_at",
  },
  leads: { permission: "read:leads", select: "id,customer_id,submission_id,status,created_at" },
  activity: { permission: "read:activity", select: "id,event_type,resource_id,created_at" },
} as const;
export type Resource = keyof typeof resources;

export async function listResource(request: Request, resource: Resource, id?: string) {
  return endpoint(async (requestId) => {
    const descriptor = resources[resource];
    const { principal, token } = await context(request, descriptor.permission);
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 25);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new PlatformError(400, "INVALID_PAGE", "Page size must be between 1 and 100.");
    const query = new URLSearchParams({
      select: descriptor.select,
      business_id: `eq.${principal.businessId}`,
      environment: `eq.${principal.environment}`,
      order: "created_at.desc,id.desc",
      limit: String(limit + 1),
    });
    if (id) query.set("id", `eq.${uuid(id)}`);
    else if (url.searchParams.has("cursor")) {
      const cursor = decodeCursor(url.searchParams.get("cursor")!);
      query.set(
        "or",
        `(created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id}))`,
      );
    }
    const rows = await provider<Array<{ id: string; created_at: string }>>(
      `rest/v1/platform_${resource}?${query}`,
      { token, admin: !token },
    );
    if (id && !rows.length)
      throw new PlatformError(404, "NOT_FOUND", "The resource was not found.");
    return json(
      id
        ? rows[0]
        : {
            items: rows.slice(0, limit),
            nextCursor: rows.length > limit ? encodeCursor(rows[limit - 1]) : null,
          },
      requestId,
    );
  });
}
