import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Network, Workflow } from "lucide-react";

import { EcosystemMemberCard } from "@/components/ecosystem-member-card";
import { ElevateBot } from "@/components/elevate-bot";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { businessesWeWorkWith, technologyPartners } from "@/lib/ecosystem-data";

export const metadata: Metadata = {
  title: "Our Ecosystem | Elevate Systems",
  description:
    "Meet the technology partners and businesses working with Elevate Systems to build better digital experiences and intelligent systems."
};

export default function EcosystemPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
        <div className="absolute -right-24 top-28 h-80 w-80 rounded-full border border-sky-300/10" />
        <div className="absolute -left-48 top-[46rem] h-96 w-96 rounded-full border border-sky-300/[0.07]" />
      </div>

      <SiteHeader />

      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-36 sm:pb-24 sm:pt-40">
        <div className="hero-reveal max-w-4xl">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">
            <Network className="h-4 w-4" />
            Our Ecosystem
          </div>
          <h1 className="mt-5 text-balance text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            Building better, together.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/60 sm:text-xl">
            Elevate brings together innovative technology partners and ambitious businesses to build better digital
            experiences, intelligent systems, and scalable solutions.
          </p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a className="animated-link inline-flex items-center gap-2 text-sm font-semibold text-sky-300" href="#technology-partners">
              Technology partners
              <ArrowRight className="h-4 w-4" />
            </a>
            <span className="hidden text-white/20 sm:inline" aria-hidden="true">/</span>
            <a className="animated-link inline-flex items-center gap-2 text-sm font-semibold text-white/55" href="#businesses">
              Businesses we work with
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/10 bg-white/[0.018] py-20 sm:py-24" id="technology-partners">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-10 grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Technology Partners</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">The infrastructure behind the ideas.</h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-white/50 md:justify-self-end">
              Select technology relationships help us connect the right AI and API capabilities to each custom build.
            </p>
          </div>

          <div className="space-y-6">
            {technologyPartners.map((member, index) => (
              <EcosystemMemberCard index={index} key={member.slug} member={member} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/10 py-20 sm:py-24" id="businesses">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-10 grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Businesses We Work With</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">Real systems for real businesses.</h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-white/50 md:justify-self-end">
              Each project is shaped around the business, its customers, and the experience it needs to deliver.
            </p>
          </div>

          <div className="space-y-6">
            {businessesWeWorkWith.map((member, index) => (
              <EcosystemMemberCard index={index} key={member.slug} member={member} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-[#07101d] py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
              <Workflow className="h-4 w-4" />
              Build with Elevate
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">Let&apos;s build what your business needs next.</h2>
          </div>
          <Button asChild className="w-full md:w-auto">
            <Link href="/book">
              Start a Conversation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <ElevateBot />
    </main>
  );
}
