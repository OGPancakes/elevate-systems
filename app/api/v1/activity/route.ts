import { listResource } from "@/lib/platform/resources";
export async function GET(request: Request) { return listResource(request, "activity"); }
