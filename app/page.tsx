import Image from "next/image";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  DatabaseZap,
  Globe,
  MessageSquareText,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";

import { DashboardPreview } from "@/components/dashboard-preview";
import { ElevateBot } from "@/components/elevate-bot";
import { Button } from "@/components/ui/button";

const bookingUrl =
  process.env.NEXT_PUBLIC_BOOKING_URL ?? "https://cal.com/elevate-systems/consultation";

const services = [
  {
    icon: Sparkles,
    title: "AI Automation",
    description:
      "Automated lead handling, customer replies, intake workflows, and internal task routing."
  },
  {
    icon: Globe,
    title: "Custom Websites",
    description:
      "High-converting sites built for trust, speed, mobile polish, and clear consultation paths."
  },
  {
    icon: DatabaseZap,
    title: "CRM Setup",
    description:
      "HubSpot pipelines, contact properties, lifecycle stages, and source tracking configured cleanly."
  },
  {
    icon: MessageSquareText,
    title: "Lead Capture Systems",
    description:
      "Forms, chat, call prompts, automations, and follow-up sequences that prevent lost inquiries."
  },
  {
    icon: Bot,
    title: "AI Chatbots",
    description:
      "Website assistants that answer service questions, qualify leads, and escalate when needed."
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    description:
      "Make.com automations that connect websites, CRMs, notifications, calendars, and teams."
  }
];

const audiences = [
  "Roofing companies",
  "HVAC teams",
  "Plumbing companies",
  "Dental practices",
  "Real estate teams",
  "Law firms"
];

const testimonials = [
  {
    quote:
      "Elevate made our follow-up process feel instant. Leads now hit the CRM, get a reply, and land on our calendar without our office chasing every form.",
    name: "Operations Director",
    company: "Regional HVAC Group"
  },
  {
    quote:
      "The website feels like a modern software company built it, but the workflows are practical for how our team actually works every day.",
    name: "Managing Partner",
    company: "Local Law Firm"
  },
  {
    quote:
      "Their chatbot does more than answer questions. It qualifies, collects details, and gives our sales team clean context before the first call.",
    name: "Founder",
    company: "Home Services Brand"
  }
];

const faqs = [
  {
    question: "What kind of businesses do you work with?",
    answer:
      "We focus on service-based companies such as roofing, HVAC, plumbing, dentists, real estate teams, law firms, and similar local operators."
  },
  {
    question: "Can you connect our website to HubSpot?",
    answer:
      "Yes. We can capture leads, create contacts, assign lifecycle stages, trigger follow-ups, and notify your team through HubSpot workflows."
  },
  {
    question: "Does the chatbot use OpenAI?",
    answer:
      "Yes. Elevate Bot is designed to use the OpenAI API with a custom system prompt, qualification flow, and escalation rules."
  },
  {
    question: "Can you automate appointment booking?",
    answer:
      "Yes. We can route qualified prospects to a consultation link and connect booking events to your CRM and internal notifications."
  }
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
        <div className="absolute right-10 top-32 h-72 w-72 rounded-full border border-sky-300/10" />
        <div className="absolute left-8 top-[42rem] h-96 w-96 rounded-full border border-white/10" />
      </div>

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[#030711]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
          <a className="flex items-center gap-3" href="#top" aria-label="Elevate Systems home">
            <Image
              alt="Elevate Systems logo"
              className="h-10 w-10 rounded-md object-cover"
              height={40}
              src="/elevate-logo.png"
              width={40}
              priority
            />
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-white">ELEVATE</p>
              <p className="text-xs tracking-[0.28em] text-sky-300">SYSTEMS</p>
            </div>
          </a>
          <div className="hidden items-center gap-1 md:flex">
            {["Services", "Proof", "FAQ", "Contact"].map((item) => (
              <a
                className="rounded-md px-3 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                href={`#${item.toLowerCase()}`}
                key={item}
              >
                {item}
              </a>
            ))}
          </div>
          <Button asChild>
            <a href={bookingUrl}>
              Book a Call
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </nav>
      </header>

      <section id="top" className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 pb-16 pt-32 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-sm text-sky-100">
            <ShieldCheck className="h-4 w-4" />
            AI systems for local service businesses
          </div>
          <h1 className="text-balance text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            Automate. Optimize. Elevate.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Elevate Systems builds AI automation, custom websites, CRM pipelines, chatbots,
            and follow-up workflows that help service businesses convert more leads with less manual work.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={bookingUrl}>
                Book a Call
                <CalendarCheck className="h-5 w-5" />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#services">
                View Services
                <ChevronRight className="h-5 w-5" />
              </a>
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

      <section id="proof" className="border-y border-white/10 bg-white/[0.025] py-8">
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

      <section id="services" className="section-pad mx-auto max-w-7xl px-5">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">Services</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
              Systems that make growth feel operationally calm.
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-white/60">
            Each build is designed around the same outcome: capture demand, respond faster,
            route clean data, and make it easier to book the next qualified conversation.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
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
              Elevate Bot answers service questions, gathers name, email, phone, company,
              and business context, then sends qualified leads into HubSpot or a Make.com workflow.
            </p>
          </div>
          <div className="border-t border-white/10 bg-black/20 p-6 sm:p-10 lg:border-l lg:border-t-0">
            <div className="space-y-4">
              {[
                "Qualifies service type, urgency, budget, and company details",
                "Books consultations through your preferred scheduling link",
                "Escalates complex or high-value requests to a human",
                "Stores contact data in HubSpot and triggers Make.com workflows"
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

      <section className="section-pad border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">Testimonials</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              Built for teams that need trust before automation.
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure className="rounded-xl border border-white/10 bg-black/20 p-6" key={testimonial.company}>
                <blockquote className="leading-8 text-white/70">&quot;{testimonial.quote}&quot;</blockquote>
                <figcaption className="mt-6 border-t border-white/10 pt-5">
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-sky-200/70">{testimonial.company}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-pad mx-auto max-w-4xl px-5">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">Questions before the call.</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details className="group rounded-xl border border-white/10 bg-white/5 p-5" key={faq.question}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
                {faq.question}
                <ChevronRight className="h-5 w-5 shrink-0 text-sky-300 transition group-open:rotate-90" />
              </summary>
              <p className="mt-4 leading-7 text-white/60">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="contact" className="section-pad border-t border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">Contact</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              Ready to build the system behind your next stage of growth?
            </h2>
            <p className="mt-5 max-w-xl leading-8 text-white/60">
              Book a consultation and we&apos;ll identify the highest-leverage automation,
              website, or CRM opportunity for your business.
            </p>
          </div>
          <form className="glass rounded-2xl p-5 sm:p-6" action="/api/leads" method="post">
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
                    required={name !== "phone"}
                    type={name === "email" ? "email" : "text"}
                  />
                </label>
              ))}
            </div>
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
