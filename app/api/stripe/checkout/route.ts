import { NextResponse } from "next/server";

import { solutionTiers } from "@/lib/ai-solutions-data";
import { insertRecord, updateRecord } from "@/lib/supabase-admin";

type PurchaseInsert = {
  id: string;
};

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Online checkout is not configured yet." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { tierId?: string };
  const tier = solutionTiers.find((item) => item.id === body.tierId);
  if (!tier || tier.price === "Custom") {
    return NextResponse.json({ error: "Please request a consultation for this package." }, { status: 400 });
  }

  const priceId = process.env[tier.priceEnv];
  if (!priceId) {
    return NextResponse.json({ error: "This package is not available for online checkout yet." }, { status: 503 });
  }

  const amountCents = tier.id === "launch" ? 150000 : 350000;
  const purchase = await insertRecord<PurchaseInsert>("purchases", {
    customer_name: null,
    customer_email: null,
    business_name: null,
    tier_id: tier.id,
    tier_name: tier.name,
    amount_cents: amountCents,
    currency: "usd",
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    status: "Pending",
    source: "AI Solutions",
    notes: "",
    created_at: new Date().toISOString()
  });

  if (!purchase?.id) {
    return NextResponse.json({ error: "Checkout could not be initialized." }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elevatesystems.us";
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${siteUrl}/ai-solutions?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${siteUrl}/ai-solutions?checkout=cancelled#pricing`);
  params.set("customer_creation", "always");
  params.set("billing_address_collection", "auto");
  params.set("name_collection[individual][enabled]", "true");
  params.set("name_collection[business][enabled]", "true");
  params.set("metadata[purchase_id]", purchase.id);
  params.set("metadata[tier_id]", tier.id);
  params.set("metadata[source]", "AI Solutions");

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });
  const session = (await stripeResponse.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };

  if (!stripeResponse.ok || !session.id || !session.url) {
    await updateRecord("purchases", purchase.id, {
      status: "Failed",
      notes: session.error?.message || "Stripe session creation failed."
    }).catch(() => undefined);
    return NextResponse.json(
      { error: session.error?.message || "Stripe checkout is unavailable." },
      { status: 502 }
    );
  }

  await updateRecord("purchases", purchase.id, { stripe_session_id: session.id });
  return NextResponse.json({ url: session.url });
}
