import Link from "next/link";
import { ArrowRight, Bot, Globe2, Workflow } from "lucide-react";

import { ElevateBot } from "@/components/elevate-bot";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const serviceGroups = [
  {
    icon: Globe2,
    title: "A website that earns trust",
    description:
      "Modern websites and focused lead capture built to make the next step obvious on every screen.",
    detail: "Custom websites · Conversion paths · Mobile experience"
  },
  {
    icon: Bot,
    title: "Faster customer response",
    description:
      "AI assistants that answer common questions, qualify inquiries, and hand useful context to your team.",
    detail: "AI chatbots · Lead qualification · Appointment routing"
  },
  {
    icon: Workflow,
    title: "Less work between systems",
    description:
      "CRM and workflow automation that keeps follow-up moving without adding more manual admin.",
    detail: "CRM setup · Follow-up automation · Internal workflows"
  }
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-36">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Services</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
          Build a clearer path from first visit to closed customer.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/55">
          We connect your website, customer communication, and follow-up into one practical system.
        </p>
      </section>

      <section className="border-y border-white/10">
        <div className="mx-auto max-w-6xl px-5">
          {serviceGroups.map((service) => (
            <article
              className="grid gap-5 border-b border-white/10 py-10 last:border-b-0 md:grid-cols-[72px_0.7fr_1fr] md:items-start"
              key={service.title}
            >
              <service.icon className="h-7 w-7 text-sky-300" />
              <div>
                <h2 className="text-2xl font-semibold text-white">{service.title}</h2>
                <p className="mt-3 text-sm text-sky-200/55">{service.detail}</p>
              </div>
              <p className="max-w-xl leading-8 text-white/55">{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
            Start with the bottleneck
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
            See which system would make the biggest difference first.
          </h2>
          <Button asChild className="mt-8" size="lg">
            <Link href="/ai-solutions">
              Explore AI Solutions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <ElevateBot />
    </main>
  );
}
