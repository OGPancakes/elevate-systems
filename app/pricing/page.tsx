import type { Metadata } from "next";

import { AiSolutionsExperience } from "@/components/ai-solutions-experience";
import { SiteHeader } from "@/components/site-header";
import { solutionTiers } from "@/lib/ai-solutions-data";

export const metadata: Metadata = {
  title: "Pricing | Elevate Systems",
  description: "Clear starting packages for AI automation and connected customer systems."
};

export default async function PricingPage({
  searchParams
}: {
  searchParams?: Promise<{ checkout?: string }>;
}) {
  const checkoutStatus = (await searchParams)?.checkout;
  const stripeReady = Boolean(
    process.env.STRIPE_SECRET_KEY &&
      solutionTiers.some((tier) => Boolean(process.env[tier.priceEnv]))
  );

  return (
    <main className="min-h-screen overflow-hidden pt-20">
      <SiteHeader />
      <AiSolutionsExperience
        checkoutStatus={checkoutStatus}
        mode="pricing"
        stripeReady={stripeReady}
      />
    </main>
  );
}
