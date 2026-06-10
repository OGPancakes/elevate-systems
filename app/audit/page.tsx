import { ElevateBot } from "@/components/elevate-bot";
import { SiteHeader } from "@/components/site-header";
import { WebsiteAudit } from "@/components/website-audit";

export default function AuditPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <div className="pt-20">
        <WebsiteAudit />
      </div>
      <ElevateBot />
    </main>
  );
}
