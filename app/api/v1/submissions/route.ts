import { context, endpoint, json, provider } from "@/lib/platform/server";
import { PlatformError } from "@/lib/platform/policy";
import { readSubmission, submissionDigest } from "@/lib/platform/submission";
import { listResource } from "@/lib/platform/resources";

export const runtime = "nodejs";
export async function POST(request: Request) {
  return endpoint(async (requestId) => {
    const { principal } = await context(request, "create:submission");
    if (principal.actorType !== "credential") throw new PlatformError(403, "ACCESS_DENIED", "Submission intake requires a server credential.");
    const submission = await readSubmission(request);
    const accepted = await provider<{ id: string; customerId: string; createdAt: string; duplicate: boolean }>("rest/v1/rpc/platform_accept_submission", {
      admin: true, method: "POST", body: { p_credential: principal.actorId, p_business: principal.businessId, p_environment: principal.environment, p_payload: submission, p_hash: submissionDigest(submission) }
    });
    return json({ ...accepted, accepted: true }, requestId, accepted.duplicate ? 200 : 201);
  });
}
export async function GET(request: Request) { return listResource(request, "submissions"); }
