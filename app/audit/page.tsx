import { ElevateBot } from "@/components/elevate-bot";
import { SiteHeader } from "@/components/site-header";
import { WebsiteAudit } from "@/components/website-audit";

export default function AuditPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
        <div className="absolute right-12 top-28 h-80 w-80 rounded-full border border-sky-300/10" />
      </div>
      <SiteHeader />
      <section className="relative mx-auto max-w-7xl px-5 pb-0 pt-32">
        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">
          Website Audit AI
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
          A premium scanner for turning curious visitors into qualified website leads.
        </h1>
        <p className="mt-5 max-w-2xl leading-8 text-white/60">
          Elevate Bot captures the business details, scans the current site, generates a concise
          audit, and points qualified prospects toward a strategy call.
        </p>
      </section>
      <WebsiteAudit />
      <ElevateBot />
    </main>
  );
}
