import { ArrowLeft, Layers3 } from "lucide-react";
import Link from "next/link";

import { ProductDemoShowcase } from "@/components/product-demo-showcase";
import { SiteHeader } from "@/components/site-header";

export default function DemosPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <SiteHeader />
      <div className="pointer-events-none absolute left-1/2 top-40 h-96 w-3/4 -translate-x-1/2 bg-sky-500/10 blur-[150px]" />

      <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-32">
        <Link className="animated-link inline-flex items-center gap-2 text-sm text-white/45 hover:text-white" href="/">
          <ArrowLeft className="h-4 w-4" />
          Back to Elevate Systems
        </Link>

        <div className="mx-auto mt-16 max-w-3xl text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center border border-sky-300/20 bg-sky-300/[0.07] text-sky-300">
            <Layers3 className="h-5 w-5" />
          </span>
          <p className="mt-7 text-sm font-medium text-sky-300">Interactive product demos</p>
          <h1 className="mt-4 text-balance text-4xl font-semibold text-white sm:text-6xl">
            Choose a system to explore.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/50">
            Step inside working concepts for ordering, reception, lead management, audits, and connected websites.
          </p>
        </div>

        <ProductDemoShowcase />
      </section>
    </main>
  );
}
