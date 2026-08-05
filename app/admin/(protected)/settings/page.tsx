import {
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  KeyRound,
  Mail,
  Package,
  ReceiptText,
  UsersRound
} from "lucide-react";

import {
  addNotificationRecipient,
  createTeamMember,
  removeNotificationRecipient
} from "@/app/admin/actions";
import { PageHeading } from "@/components/admin-ui";
import {
  AdminUserRecord,
  listRecords,
  NotificationRecipientRecord
} from "@/lib/supabase-admin";

export default async function AdminSettingsPage() {
  const teamMembers = await listRecords<AdminUserRecord>(
    "admin_users",
    "select=id,username,display_name,role,is_active,created_at&order=created_at.desc"
  ).catch(() => [] as AdminUserRecord[]);
  const notificationRecipients = await listRecords<NotificationRecipientRecord>(
    "notification_recipients",
    "select=id,email,label,is_active,created_at&is_active=eq.true&order=created_at.desc"
  ).catch(() => [] as NotificationRecipientRecord[]);
  const hasNotificationRecipient =
    Boolean(process.env.LEAD_NOTIFICATION_EMAIL) || notificationRecipients.length > 0;

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
      configured: Boolean(process.env.RESEND_API_KEY && hasNotificationRecipient),
      icon: Mail
    }
  ];
  const bluevineLinks = [
    {
      label: "Invoices",
      description: "Create, send, and track customer invoices.",
      href: "https://app.bluevine.com/dashboard/merchantAccounts/madashboard/mainvoices",
      icon: ReceiptText
    },
    {
      label: "Customers",
      description: "Manage billing contacts and customer records.",
      href: "https://app.bluevine.com/dashboard/merchantAccounts/madashboard/macustomers",
      icon: UsersRound
    },
    {
      label: "Estimates",
      description: "Prepare proposals and convert accepted estimates into invoices.",
      href: "https://app.bluevine.com/dashboard/merchantAccounts/madashboard/maestimates",
      icon: FileText
    },
    {
      label: "Items",
      description: "Update the products and services used in invoices.",
      href: "https://app.bluevine.com/dashboard/merchantAccounts/madashboard/maitems",
      icon: Package
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
      <section className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <form action={addNotificationRecipient} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <p className="font-semibold text-white">Lead notification emails</p>
          <p className="mt-2 text-sm leading-6 text-white/45">
            Add the inboxes that should receive audit leads, contact inquiries, booking requests, and AI scans.
          </p>
          <div className="mt-5 grid gap-4">
            <label className="space-y-2">
              <span className="text-sm text-white/60">Email address</span>
              <input className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-sky-300/50" name="email" placeholder="support@elevatesystems.us" required type="email" />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-white/60">Label</span>
              <input className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-sky-300/50" name="label" placeholder="Main inbox, Vinny, Gabriel..." />
            </label>
          </div>
          <button className="mt-5 rounded-md bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950">
            Add notification email
          </button>
        </form>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <p className="font-semibold text-white">Active recipients</p>
          <div className="mt-5 space-y-3">
            {notificationRecipients.length ? notificationRecipients.map((recipient) => (
              <div className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-black/20 p-4" key={recipient.id}>
                <div>
                  <p className="font-medium text-white">{recipient.email}</p>
                  <p className="mt-1 text-xs text-white/40">{recipient.label || "Notification inbox"}</p>
                </div>
                <form action={removeNotificationRecipient}>
                  <input name="id" type="hidden" value={recipient.id} />
                  <button className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/55 transition hover:border-red-300/30 hover:text-red-200">
                    Remove
                  </button>
                </form>
              </div>
            )) : (
              <p className="rounded-md border border-dashed border-white/10 p-5 text-sm leading-6 text-white/45">
                No dashboard-managed recipients yet. Environment recipients still work while you add emails here.
              </p>
            )}
          </div>
        </div>
      </section>
      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-semibold text-white">Bluevine finance shortcuts</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              Bluevine does not expose a public API for this setup yet, so these open the live finance tools while Elevate tracks leads, bookings, and project notes here.
            </p>
          </div>
          <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-semibold text-sky-200">
            External dashboard
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {bluevineLinks.map((item) => (
            <a
              className="group rounded-lg border border-white/10 bg-black/20 p-4 transition hover:border-sky-300/35 hover:bg-sky-300/[0.06]"
              href={item.href}
              key={item.label}
              rel="noreferrer"
              target="_blank"
            >
              <div className="flex items-center justify-between gap-3">
                <item.icon className="h-5 w-5 text-sky-300" />
                <ExternalLink className="h-4 w-4 text-white/25 transition group-hover:text-sky-200" />
              </div>
              <p className="mt-4 font-semibold text-white">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-white/45">{item.description}</p>
            </a>
          ))}
        </div>
      </section>
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
