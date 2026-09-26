import { endpoint, json, provider, rateLimit, userSession } from "@/lib/platform/server";
export async function GET() {
  return endpoint(async (requestId) => {
    const session = await userSession();
    await rateLimit(`user:${session.id}`);
    const rows = await provider("rest/v1/platform_businesses?select=id,name,slug&order=name.asc&limit=100", { token: session.token });
    return json(rows, requestId);
  });
}
