import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Sparkles,
  Check
} from "lucide-react";

import { DashboardPreview } from "@/components/dashboard-preview";
import { ElevateBot } from "@/components/elevate-bot";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/site-data";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300/35 to-transparent" />
      <SiteHeader />

      <section id="top" className="relative mx-auto grid min-h-[92vh] max-w-7xl items-center gap-12 px-5 pb-20 pt-32 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hero-reveal">
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
            <Link className="animated-link flex min-h-12 items-center gap-2 px-2 text-sm font-medium text-white/55 hover:text-white" href="/ai-solutions">
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
        <div className="mx-auto max-w-7xl px-5 py-28">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-sky-300">What we build</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              One connected system for winning and serving customers.
            </h2>
          </div>
          <div className="flex items-end justify-between gap-6">
            <p className="max-w-xl leading-8 text-white/50">
              We combine the website, automation, and CRM layer so customers get a clear experience
              and your team gets fewer disconnected tools.
            </p>
            <Link className="hidden shrink-0 items-center gap-2 text-sm font-medium text-sky-300 transition hover:text-white sm:flex" href="/services">
              View services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
          {services.slice(0, 3).map((service) => (
            <article className="site-hover-card flex min-h-56 flex-col bg-[#060c16] p-7 sm:p-8" key={service.title}>
              <service.icon className="h-6 w-6 text-sky-300" />
              <h3 className="mt-7 text-xl font-semibold text-white">{service.title}</h3>
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

      <section id="contact" className="border-t border-white/10 bg-white/[0.018]">
        <div className="mx-auto max-w-7xl px-5 py-28 text-center">
        <p className="text-sm font-medium text-sky-300">Ready when you are</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold text-white sm:text-6xl">
          Start with the clearest opportunity.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/50">
          Book a focused strategy call, or let the website audit show you where to begin.
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
