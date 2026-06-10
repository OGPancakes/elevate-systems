import Link from "next/link";
import { ArrowRight, ScanSearch, Sparkles } from "lucide-react";

import { DashboardPreview } from "@/components/dashboard-preview";
import { AutomationDemo } from "@/components/automation-demo";
import { ElevateBot } from "@/components/elevate-bot";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const aiTools = [
  {
    icon: ScanSearch,
    label: "AI Opportunity Scanner",
    description: "Find where AI could save time, improve response, and simplify repetitive work.",
    href: "/ai-solutions#scanner",
    action: "Run opportunity scan"
  },
  {
    icon: Sparkles,
    label: "Website Audit AI",
    description: "Review your current site and see a premium visual redesign concept for your business.",
    href: "/audit",
    action: "Audit my website"
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

      <AutomationDemo />

      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="border-b border-white/10 pb-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-sky-300">Interactive AI tools</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              Start with the question you need answered.
            </h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-2">
            {aiTools.map((tool) => (
              <Link
                className="group bg-[#060c16] p-7 transition hover:bg-[#0a1523] sm:p-9"
                href={tool.href}
                key={tool.label}
              >
                <tool.icon className="h-7 w-7 text-sky-300" />
                <h3 className="mt-8 text-2xl font-semibold text-white">{tool.label}</h3>
                <p className="mt-3 max-w-md leading-7 text-white/50">{tool.description}</p>
                <span className="mt-8 flex items-center gap-2 text-sm font-medium text-sky-300">
                  {tool.action}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-8 pt-24 lg:grid-cols-[1fr_0.8fr] lg:items-center">
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
