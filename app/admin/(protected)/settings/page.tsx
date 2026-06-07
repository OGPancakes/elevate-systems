import { CheckCircle2, Database, KeyRound, Mail } from "lucide-react";

import { PageHeading } from "@/components/admin-ui";

export default function AdminSettingsPage() {
  const settings = [
    {
      label: "Supabase database",
      configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      icon: Database
    },
    {
      label: "OpenAI audit engine",
      configured: Boolean(process.env.OPENAI_API_KEY),
      icon: KeyRound
    },
    {
      label: "Lead notification email",
      configured: Boolean(process.env.RESEND_API_KEY && process.env.LEAD_NOTIFICATION_EMAIL),
      icon: Mail
    }
  ];

  return (
    <>
      <PageHeading
        description="Production integration health. Secret values are never shown here."
        eyebrow="Configuration"
        title="Settings"
      />
      <div className="grid gap-3 max-w-3xl">
        {settings.map((item) => (
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-5" key={item.label}>
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-sky-300" />
              <span className="font-medium text-white">{item.label}</span>
            </div>
            <span className={`flex items-center gap-2 text-sm ${item.configured ? "text-emerald-300" : "text-amber-300"}`}>
              <CheckCircle2 className="h-4 w-4" />
              {item.configured ? "Configured" : "Needs setup"}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
