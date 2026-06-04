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
      <div className="pt-20">
        <WebsiteAudit />
      </div>
      <ElevateBot />
    </main>
  );
}
