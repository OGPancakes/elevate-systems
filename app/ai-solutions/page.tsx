import type { Metadata } from "next";

import { AiSolutionsExperience } from "@/components/ai-solutions-experience";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "AI Solutions | Elevate Systems",
  description:
    "Explore AI assistants, receptionists, ordering systems, lead follow-up, and workflow automation for service businesses."
};

export default function AiSolutionsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <SiteHeader />
      <AiSolutionsExperience mode="scanner" stripeReady={false} />
    </main>
  );
}
