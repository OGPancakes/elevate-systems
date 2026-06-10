import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { DashboardPreview } from "@/components/dashboard-preview";
import { ElevateBot } from "@/components/elevate-bot";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { audiences, services } from "@/lib/site-data";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
        <div className="absolute right-10 top-32 h-72 w-72 rounded-full border border-sky-300/10" />
        <div className="absolute left-8 top-[42rem] h-96 w-96 rounded-full border border-white/10" />
      </div>

      <SiteHeader />

      <section id="top" className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 pb-16 pt-32 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-sm text-sky-100">
            <ShieldCheck className="h-4 w-4" />
            AI systems for service businesses
          </div>
          <h1 className="text-balance text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            Automate. Optimize. Elevate.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Premium websites, AI automations, CRM systems, and lead capture workflows
            for local service businesses that want to look sharper and respond faster.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/book">
                Book a Call
                <CalendarCheck className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/audit">
                Run Website Audit
                <Sparkles className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["24/7", "lead response"],
              ["CRM", "ready systems"],
              ["AI", "qualified consults"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-xs text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <DashboardPreview />
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] py-8">
        <div className="mx-auto max-w-7xl overflow-hidden px-5">
          <div className="flex w-max animate-marquee gap-3">
            {[...audiences, ...audiences].map((audience, index) => (
              <div
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/70"
                key={`${audience}-${index}`}
              >
                {audience}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-7xl px-5">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">What We Build</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
              A sharper front end for your business, backed by smarter systems.
            </h2>
          </div>
          <Button asChild variant="secondary">
            <Link href="/services">
              View Services
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {services.slice(0, 3).map((service) => (
            <article className="glass rounded-xl p-6 transition hover:-translate-y-1 hover:border-sky-300/30" key={service.title}>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-sky-400/10 text-sky-300">
                <service.icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">{service.title}</h3>
              <p className="mt-3 leading-7 text-white/60">{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">Website Audit AI</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              Want to see what your current site could become?
            </h2>
          </div>
          <div className="glass rounded-2xl p-6 sm:p-8">
            <p className="leading-8 text-white/70">
              Run a quick AI website scan. Elevate Bot will review the URL, generate a clean
              improvement overview, and give the business owner a reason to book a call.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/audit">
                  Start Audit
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/proof">
                  See Proof
                  <CheckCircle2 className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="section-pad">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">Contact</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              Ready to build the system behind your next stage of growth?
            </h2>
            <p className="mt-5 max-w-xl leading-8 text-white/60">
              Book a consultation or send a quick note. We will help identify the highest-leverage
              automation, website, or CRM opportunity for your business.
            </p>
          </div>
          <form className="glass rounded-2xl p-5 sm:p-6" action="/api/leads" method="post">
            <input className="hidden" name="website" tabIndex={-1} type="text" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["name", "Name"],
                ["email", "Email"],
                ["phone", "Phone Number"],
                ["company", "Company Name"]
              ].map(([name, label]) => (
                <label className="space-y-2" key={name}>
                  <span className="text-sm font-medium text-white/70">{label}</span>
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-white outline-none ring-sky-300/40 placeholder:text-white/40 focus:ring-2"
                    name={name}
                    required={name !== "phone" && name !== "company"}
                    type={name === "email" ? "email" : "text"}
                  />
                </label>
              ))}
            </div>
            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium text-white/70">Service interested in</span>
              <select
                className="w-full rounded-md border border-white/10 bg-[#07101e] px-3 py-3 text-white outline-none ring-sky-300/40 focus:ring-2"
                name="serviceInterest"
              >
                <option>AI Automation</option>
                <option>Custom Website</option>
                <option>CRM Setup</option>
                <option>Lead Capture System</option>
                <option>AI Chatbot</option>
                <option>Workflow Automation</option>
              </select>
            </label>
            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium text-white/70">What would you like to improve?</span>
              <textarea
                className="min-h-32 w-full resize-none rounded-md border border-white/10 bg-black/30 px-3 py-3 text-white outline-none ring-sky-300/40 placeholder:text-white/40 focus:ring-2"
                name="message"
                required
              />
            </label>
            <Button className="mt-5 w-full" size="lg" type="submit">
              Send Inquiry
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-white/50 sm:flex-row">
          <p>Copyright 2026 Elevate Systems. All rights reserved.</p>
          <p>AI automation, custom websites, CRM, and workflow systems.</p>
        </div>
      </footer>

      <ElevateBot />
    </main>
  );
}
