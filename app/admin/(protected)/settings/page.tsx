import { CheckCircle2, Database, KeyRound, Mail } from "lucide-react";

import { createTeamMember } from "@/app/admin/actions";
import { PageHeading } from "@/components/admin-ui";
import { AdminUserRecord, listRecords } from "@/lib/supabase-admin";

export default async function AdminSettingsPage() {
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
  const teamMembers = await listRecords<AdminUserRecord>(
    "admin_users",
    "select=id,username,display_name,role,is_active,created_at&order=created_at.desc"
  ).catch(() => [] as AdminUserRecord[]);

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
      <section className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <form action={createTeamMember} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <p className="font-semibold text-white">Create team member</p>
          <p className="mt-2 text-sm leading-6 text-white/45">
            Add admins, users, or independent contractors. Passwords are hashed before storage.
          </p>
          <div className="mt-5 grid gap-4">
            <label className="space-y-2">
              <span className="text-sm text-white/60">Username</span>
              <input className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-sky-300/50" name="username" required />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-white/60">Display name</span>
              <input className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-sky-300/50" name="displayName" required />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-white/60">Temporary password</span>
              <input className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-sky-300/50" minLength={8} name="password" required type="password" />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-white/60">Role</span>
              <select className="w-full rounded-md border border-white/10 bg-[#07101e] px-3 py-2.5 text-white outline-none focus:border-sky-300/50" name="role">
                <option>Admin</option>
                <option>User</option>
                <option>Independent Contractor</option>
              </select>
            </label>
          </div>
          <button className="mt-5 rounded-md bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950">
            Create account
          </button>
        </form>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <p className="font-semibold text-white">Team accounts</p>
          <div className="mt-5 space-y-3">
            {teamMembers.length ? teamMembers.map((member) => (
              <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 p-4" key={member.id}>
                <div>
                  <p className="font-medium text-white">{member.display_name}</p>
                  <p className="mt-1 text-xs text-white/40">{member.username} - {member.role}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs ${member.is_active ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200" : "border-white/10 bg-white/5 text-white/35"}`}>
                  {member.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            )) : (
              <p className="rounded-md border border-dashed border-white/10 p-5 text-sm leading-6 text-white/45">
                No team accounts yet. Apply the latest Supabase schema, then create the first account here.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
