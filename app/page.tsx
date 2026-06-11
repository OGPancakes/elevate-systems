import Link from "next/link";
import { ArrowRight, CalendarCheck, Check, Sparkles } from "lucide-react";

import { DashboardPreview } from "@/components/dashboard-preview";
import { ElevateBot } from "@/components/elevate-bot";
import { RobotScout } from "@/components/robot-scout";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { audiences, services } from "@/lib/site-data";

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

      <section className="relative border-y border-white/10 bg-white/[0.018]">
        <RobotScout />
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-white/55">Built for service businesses</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/35">
            {audiences.map((audience) => <span key={audience}>{audience}</span>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
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
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.018]">
        <RobotScout reverse />
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

      <section id="contact" className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-medium text-sky-300">Start a conversation</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
            Tell us what should work better.
          </h2>
          <p className="mt-5 max-w-md leading-8 text-white/50">
            We will identify the clearest website, automation, or CRM opportunity and follow up
            with a practical next step.
          </p>
        </div>
        <form className="border border-white/10 bg-white/[0.025] p-5 sm:p-7" action="/api/leads" method="post">
          <input className="hidden" name="website" tabIndex={-1} type="text" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["name", "Name", "text"],
              ["email", "Email", "email"],
              ["company", "Company name", "text"],
              ["phone", "Phone number (optional)", "tel"]
            ].map(([name, label, type]) => (
              <label className="space-y-2" key={name}>
                <span className="text-sm font-medium text-white/60">{label}</span>
                <input
                  className="w-full border border-white/10 bg-black/25 px-3 py-3 text-white outline-none ring-sky-300/40 focus:ring-2"
                  name={name}
                  required={name === "name" || name === "email"}
                  type={type}
                />
              </label>
            ))}
          </div>
          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium text-white/60">What would you like to improve?</span>
            <textarea
              className="min-h-28 w-full resize-none border border-white/10 bg-black/25 px-3 py-3 text-white outline-none ring-sky-300/40 focus:ring-2"
              name="message"
              required
            />
          </label>
          <input name="serviceInterest" type="hidden" value="General inquiry" />
          <Button className="mt-5" size="lg" type="submit">
            Send Inquiry
            <ArrowRight className="h-5 w-5" />
          </Button>
        </form>
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
