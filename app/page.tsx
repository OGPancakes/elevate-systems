import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Clock3,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";

import { DashboardPreview } from "@/components/dashboard-preview";
import { ElevateBot } from "@/components/elevate-bot";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { audiences, services } from "@/lib/site-data";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Built around trust",
    description: "Clear websites and customer experiences that make established businesses look established."
  },
  {
    icon: Clock3,
    title: "Faster response",
    description: "AI-assisted intake and follow-up that keeps inquiries from waiting or disappearing."
  },
  {
    icon: Workflow,
    title: "One connected flow",
    description: "Websites, CRM, booking, and communication designed to work as one system."
  }
];

const results = [
  { value: "24/7", label: "customer response coverage" },
  { value: "< 1 min", label: "possible first-response time" },
  { value: "1 system", label: "from inquiry to booked call" }
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300/35 to-transparent" />
      <SiteHeader />

      <section id="top" className="relative mx-auto grid min-h-[92vh] max-w-7xl items-center gap-12 px-5 pb-20 pt-32 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-medium text-sky-300">AI systems for service businesses</p>
          <h1 className="mt-5 text-balance text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            Automate. Optimize. Elevate.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
            Websites and AI systems that help service businesses earn trust, respond faster, and
            keep every opportunity moving.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/book">
                Book a Call
                <CalendarCheck className="h-5 w-5" />
              </Link>
            </Button>
            <Link className="flex min-h-12 items-center gap-2 px-2 text-sm font-medium text-white/55 transition hover:text-white" href="/ai-solutions">
              Explore AI Solutions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-8 flex items-center gap-2 text-sm text-white/35">
            <Check className="h-4 w-4 text-emerald-300" />
            Strategy, design, automation, and follow-up in one team.
          </p>
        </div>
        <DashboardPreview />
      </section>

      <section className="border-y border-white/10 bg-white/[0.018]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-white/55">Built for service businesses</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/35">
            {audiences.map((audience) => <span key={audience}>{audience}</span>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-sky-300">Why Elevate</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
            Technology should make the business feel easier to run.
          </h2>
        </div>
        <div className="mt-12 grid gap-8 border-y border-white/10 py-10 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title}>
              <benefit.icon className="h-6 w-6 text-sky-300" />
              <h3 className="mt-5 text-lg font-semibold text-white">{benefit.title}</h3>
              <p className="mt-3 max-w-sm leading-7 text-white/45">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.018]">
        <div className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-sky-300">What we build</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              A better customer journey, front to back.
            </h2>
          </div>
          <div className="flex items-end justify-between gap-6">
            <p className="max-w-xl leading-8 text-white/50">
              Start with the part customers see, then connect the systems that respond and follow
              up behind it.
            </p>
            <Link className="hidden shrink-0 items-center gap-2 text-sm font-medium text-sky-300 transition hover:text-white sm:flex" href="/services">
              View services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
          {services.slice(0, 3).map((service) => (
            <article className="flex min-h-64 flex-col bg-[#060c16] p-7 sm:p-8" key={service.title}>
              <service.icon className="h-6 w-6 text-sky-300" />
              <h3 className="mt-8 text-xl font-semibold text-white">{service.title}</h3>
              <p className="mt-3 leading-7 text-white/50">{service.description}</p>
            </article>
          ))}
        </div>
        <Link className="mt-6 flex items-center gap-2 text-sm font-medium text-sky-300 sm:hidden" href="/services">
          View services
          <ArrowRight className="h-4 w-4" />
        </Link>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-sky-300">Website Audit AI</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
              See what your current website could become.
            </h2>
            <p className="mt-5 max-w-2xl leading-8 text-white/50">
              Get a focused AI review and a premium homepage redesign concept based on your
              business.
            </p>
          </div>
          <div className="lg:text-right">
            <Button asChild size="lg">
              <Link href="/audit">
                Start Website Audit
                <Sparkles className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.018]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-sky-300">Designed for momentum</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Less waiting. Fewer disconnected tools.
            </h2>
          </div>
          <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
            {results.map((result) => (
              <div className="bg-[#060c16] p-6" key={result.label}>
                <p className="text-3xl font-semibold text-white">{result.value}</p>
                <p className="mt-2 text-sm leading-6 text-white/40">{result.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-5 py-28 text-center">
        <p className="text-sm font-medium text-sky-300">Ready for the next step?</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold text-white sm:text-6xl">
          Find the system worth building first.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/50">
          Book a focused strategy call or start with an AI website audit.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/book">
              Book a Call
              <CalendarCheck className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/audit">
              Get an Audit
              <Sparkles className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 text-sm text-white/35 sm:flex-row">
          <p>Copyright 2026 Elevate Systems.</p>
          <p>AI automation, custom websites, CRM, and workflow systems.</p>
        </div>
      </footer>

      <ElevateBot />
    </main>
  );
}
