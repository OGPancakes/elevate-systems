import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { ElevateBot } from "@/components/elevate-bot";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { faqs, testimonials } from "@/lib/site-data";

export default function ProofPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-5xl px-5 pb-20 pt-36">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Proof</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
          Better systems should feel simpler to the people using them.
        </h1>

        <figure className="mt-16 border-l-2 border-sky-300 pl-6 sm:pl-10">
          <blockquote className="max-w-4xl text-2xl leading-relaxed text-white/85 sm:text-3xl">
            &ldquo;{testimonials[0].quote}&rdquo;
          </blockquote>
          <figcaption className="mt-7 text-sm text-white/45">
            {testimonials[0].name} · {testimonials[0].company}
          </figcaption>
        </figure>

        <div className="mt-16 grid gap-8 border-t border-white/10 pt-10 md:grid-cols-2">
          {testimonials.slice(1).map((testimonial) => (
            <figure key={testimonial.company}>
              <blockquote className="leading-8 text-white/60">&ldquo;{testimonial.quote}&rdquo;</blockquote>
              <figcaption className="mt-5 text-sm text-white/40">
                {testimonial.name} · {testimonial.company}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.015]">
        <div className="mx-auto max-w-4xl px-5 py-24">
          <h2 className="text-3xl font-semibold text-white sm:text-5xl">Common questions</h2>
          <div className="mt-10">
            {faqs.map((faq) => (
              <details className="group border-b border-white/10 py-6" key={faq.question}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white">
                  {faq.question}
                  <ChevronRight className="h-5 w-5 shrink-0 text-white/35 transition group-open:rotate-90" />
                </summary>
                <p className="mt-4 max-w-2xl leading-7 text-white/50">{faq.answer}</p>
              </details>
            ))}
          </div>
          <Button asChild className="mt-10" size="lg">
            <Link href="/book">
              Book a Call
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <ElevateBot />
    </main>
  );
}
