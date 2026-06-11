import type { Metadata } from "next";

import { AiSolutionsExperience } from "@/components/ai-solutions-experience";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "AI Planner | Elevate Systems",
  description:
    "Explore practical AI systems and estimate operational capacity your business could reclaim."
};

export default function AiPlannerPage() {
  return (
    <main className="min-h-screen overflow-hidden pt-20">
      <SiteHeader />
      <AiSolutionsExperience mode="planner" stripeReady={false} />
    </main>
  );
}
