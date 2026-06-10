import Link from "next/link";
import { ArrowRight, Bot, MonitorSmartphone, Workflow } from "lucide-react";

import { DashboardPreview } from "@/components/dashboard-preview";
import { ElevateBot } from "@/components/elevate-bot";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const capabilities = [
  {
    icon: MonitorSmartphone,
    title: "Websites built to convert",
    description: "Clear positioning, faster customer journeys, and lead capture connected to your operations."
  },
  {
    icon: Bot,
    title: "AI that responds",
    description: "Assistants and reception systems that answer, qualify, and route customer requests."
  },
  {
    icon: Workflow,
    title: "Follow-up that runs",
    description: "CRM, booking, and communication workflows that keep every inquiry moving."
  }
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300/35 to-transparent" />
      <SiteHeader />

      <section className="relative mx-auto grid min-h-[90vh] max-w-7xl items-center gap-12 px-5 pb-20 pt-32 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-medium text-sky-300">AI systems for service businesses</p>
          <h1 className="mt-5 text-balance text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            Turn more inquiries into real conversations.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
            Elevate Systems builds the website, AI response, and follow-up system that helps your
            business look credible and respond without delay.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link href="/ai-solutions">
              See Where AI Can Help
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <DashboardPreview />
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-sky-300">One connected system</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              Fewer tools competing for attention. One clear customer journey.
            </h2>
          </div>
          <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {capabilities.map((capability) => (
              <div
                className="grid gap-4 py-7 md:grid-cols-[56px_0.7fr_1fr] md:items-center"
                key={capability.title}
              >
                <capability.icon className="h-6 w-6 text-sky-300" />
                <h3 className="text-xl font-semibold text-white">{capability.title}</h3>
                <p className="max-w-xl leading-7 text-white/50">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-8 border-b border-white/10 pb-20 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-sky-300">Start with clarity</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
              Find the highest-value automation opportunity in your business.
            </h2>
          </div>
          <div>
            <p className="leading-8 text-white/55">
              Run the AI opportunity scan to see where response, lead capture, or repetitive work
              may be improved. No revenue promises. Just a focused first assessment.
            </p>
            <Button asChild className="mt-6">
              <Link href="/ai-solutions#scanner">
                Run the Opportunity Scan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 pt-20 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-sky-300">Ready to talk?</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
              Leave with a clear next step.
            </h2>
          </div>
          <div>
            <p className="leading-8 text-white/55">
              In one focused call, we will review your current customer journey and identify the
              first system worth building.
            </p>
            <Button asChild className="mt-6">
              <Link href="/book">
                Book a Strategy Call
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-5 text-sm text-white/35">
          Copyright 2026 Elevate Systems.
        </div>
      </footer>

      <ElevateBot />
    </main>
  );
}
