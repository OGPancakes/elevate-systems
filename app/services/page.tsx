import Link from "next/link";
import { ArrowRight, CheckCircle2, Network } from "lucide-react";

import { ElevateBot } from "@/components/elevate-bot";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/site-data";

export default function ServicesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
        <div className="absolute right-10 top-32 h-72 w-72 rounded-full border border-sky-300/10" />
      </div>
      <SiteHeader />

      <section className="relative mx-auto max-w-7xl px-5 pb-12 pt-32">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">Services</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
              Systems that make local business growth feel calmer and more automatic.
            </h1>
          </div>
          <Button asChild>
            <Link href="/book">
              Book a Call
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article className="glass rounded-xl p-6 transition hover:-translate-y-1 hover:border-sky-300/30" key={service.title}>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-sky-400/10 text-sky-300">
                <service.icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-white">{service.title}</h2>
              <p className="mt-3 leading-7 text-white/60">{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">Platform Stack</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              Built on modern tools your team can keep using.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Next.js 15", "TypeScript", "Tailwind CSS", "shadcn/ui", "OpenAI API", "HubSpot CRM", "Make.com", "Vercel + Cloudflare"].map((tool) => (
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-4" key={tool}>
                <CheckCircle2 className="h-5 w-5 text-sky-300" />
                <span className="font-medium text-white/75">{tool}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-7xl px-5">
        <div className="glass grid overflow-hidden rounded-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <div className="p-6 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">Elevate Bot</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              A chatbot designed to qualify, collect, and route.
            </h2>
            <p className="mt-5 leading-8 text-white/60">
              Elevate Bot answers service questions, gathers contact details, and sends qualified
              leads into your CRM or Make.com workflows.
            </p>
          </div>
          <div className="border-t border-white/10 bg-black/20 p-6 sm:p-10 lg:border-l lg:border-t-0">
            <div className="space-y-4">
              {[
                "Qualifies service type, urgency, budget, and company details",
                "Books consultations through your preferred scheduling link",
                "Escalates complex or high-value requests to a human",
                "Stores contact data in Supabase, HubSpot, or Make.com workflows"
              ].map((item) => (
                <div className="flex gap-3" key={item}>
                  <Network className="mt-1 h-5 w-5 shrink-0 text-sky-300" />
                  <p className="leading-7 text-white/70">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ElevateBot />
    </main>
  );
}
