import { listResource } from "@/lib/platform/resources";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return listResource(request, "customers", (await context.params).id);
}
