import type { Metadata } from "next";

import { AiSolutionsExperience } from "@/components/ai-solutions-experience";
import { SiteHeader } from "@/components/site-header";
import { solutionTiers } from "@/lib/ai-solutions-data";

export const metadata: Metadata = {
  title: "AI Solutions | Elevate Systems",
  description:
    "Explore AI assistants, receptionists, ordering systems, lead follow-up, and workflow automation for service businesses."
};

export default async function AiSolutionsPage({
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
    <main className="relative min-h-screen overflow-hidden">
      <SiteHeader />
      <AiSolutionsExperience checkoutStatus={checkoutStatus} stripeReady={stripeReady} />
    </main>
  );
}
