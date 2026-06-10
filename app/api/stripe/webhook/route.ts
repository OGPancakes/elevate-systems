import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { updateRecord } from "@/lib/supabase-admin";

type StripeSession = {
  id: string;
  payment_intent?: string | null;
  payment_status?: string;
  status?: string;
  amount_total?: number | null;
  currency?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
  } | null;
  collected_information?: {
    business_name?: string | null;
    individual_name?: string | null;
  } | null;
  metadata?: Record<string, string>;
};

type StripeEvent = {
  type: string;
  data: { object: StripeSession };
};

function verifySignature(payload: string, header: string, secret: string) {
  const parts = header.split(",").map((part) => part.trim().split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);
  return signatures.some((signature) => {
    const actualBuffer = Buffer.from(signature);
    return (
      actualBuffer.length === expectedBuffer.length &&
      timingSafeEqual(actualBuffer, expectedBuffer)
    );
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature") ?? "";
  const payload = await request.text();

  if (!secret || !verifySignature(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;
  const session = event.data.object;
  const purchaseId = session.metadata?.purchase_id;
  if (!purchaseId) return NextResponse.json({ received: true });

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    await updateRecord("purchases", purchaseId, {
      customer_name:
        session.customer_details?.name ||
        session.collected_information?.individual_name ||
        null,
      customer_email: session.customer_details?.email || null,
      business_name: session.collected_information?.business_name || null,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent || null,
      amount_cents: session.amount_total || 0,
      currency: session.currency || "usd",
      status: session.payment_status === "paid" ? "Paid" : "Pending",
      paid_at: session.payment_status === "paid" ? new Date().toISOString() : null
    });
  } else if (
    event.type === "checkout.session.expired" ||
    event.type === "checkout.session.async_payment_failed"
  ) {
    await updateRecord("purchases", purchaseId, {
      status: "Failed",
      stripe_session_id: session.id
    });
  }

  return NextResponse.json({ received: true });
}
