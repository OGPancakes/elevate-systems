import "server-only";

import { NextResponse } from "next/server";

import { verifySignedRequest } from "@/lib/feather-integration";

export const FEATHER_CLIENT_ID = process.env.FEATHER_INTEGRATION_CLIENT_ID || "feather-by-hanna";

export function authenticateFeatherRequest(request: Request, body: Uint8Array) {
  const secret = process.env.FEATHER_INTEGRATION_SECRET;
  if (!secret) {
    return {
      error: NextResponse.json(
        { error: "Integration is not configured." },
        { status: 503 }
      )
    };
  }

  if (request.headers.get("x-elevate-client") !== FEATHER_CLIENT_ID) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  const url = new URL(request.url);
  const valid = verifySignedRequest({
    body,
    method: request.method,
    pathWithQuery: `${url.pathname}${url.search}`,
    secret,
    signature: request.headers.get("x-elevate-signature"),
    timestamp: request.headers.get("x-elevate-timestamp")
  });
  if (!valid) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  return { clientId: FEATHER_CLIENT_ID };
}
