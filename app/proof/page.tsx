import { ChevronRight } from "lucide-react";

import { ElevateBot } from "@/components/elevate-bot";
import { SiteHeader } from "@/components/site-header";
import { faqs, testimonials } from "@/lib/site-data";

export default function ProofPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
        <div className="absolute right-10 top-32 h-72 w-72 rounded-full border border-sky-300/10" />
      </div>
      <SiteHeader />

      <section className="relative mx-auto max-w-7xl px-5 pb-12 pt-32">
        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">Proof</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
          Built for teams that need trust before automation.
        </h1>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
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
      </section>

      <section className="section-pad border-t border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-4xl px-5">
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
        </div>
      </section>

      <ElevateBot />
    </main>
  );
}
