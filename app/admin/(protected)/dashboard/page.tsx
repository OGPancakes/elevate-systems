import Link from "next/link";
import { CalendarDays, Inbox, Sparkles, TrendingUp } from "lucide-react";

import { EmptyState, PageHeading, StatusBadge } from "@/components/admin-ui";
import {
  BookingRecord,
  InquiryRecord,
  LeadRecord,
  countRecords,
  listRecords
} from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function safeCount(table: string, filter = "") {
  try {
    return await countRecords(table, filter);
  } catch {
    return 0;
  }
}

async function recentActivity() {
  const results = await Promise.allSettled([
    listRecords<LeadRecord>("leads", "select=*&order=created_at.desc&limit=5"),
    listRecords<InquiryRecord>("inquiries", "select=*&order=created_at.desc&limit=5"),
    listRecords<BookingRecord>("bookings", "select=*&order=created_at.desc&limit=5")
  ]);

  const rows = results.flatMap((result, index) =>
    result.status === "fulfilled"
      ? result.value.map((record) => ({
          id: record.id,
          name: record.name,
          business:
            "business_name" in record && record.business_name
              ? record.business_name
              : record.email,
          status: record.status,
          createdAt: record.created_at,
          type: ["Lead", "Inquiry", "Booking"][index],
          href: `/admin/${["leads", "inquiries", "bookings"][index]}/${record.id}`
        }))
      : []
  );

  return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 8);
}

export default async function AdminDashboardPage() {
  const [totalLeads, newLeads, inquiries, bookings, upcoming, recent] = await Promise.all([
    safeCount("leads"),
    safeCount("leads", "status=eq.New"),
    safeCount("inquiries"),
    safeCount("bookings"),
    safeCount("bookings", "status=eq.Upcoming"),
    recentActivity()
  ]);

  const converted = await safeCount("leads", "status=in.(Booked,Closed)");
  const conversionRate = totalLeads ? Math.round((converted / totalLeads) * 100) : 0;
  const stats = [
    { label: "Total leads", value: totalLeads, icon: Sparkles },
    { label: "New leads", value: newLeads, icon: TrendingUp },
    { label: "Inquiries", value: inquiries, icon: Inbox },
    { label: "Bookings", value: bookings, icon: CalendarDays },
    { label: "Upcoming calls", value: upcoming, icon: CalendarDays },
    { label: "Conversion rate", value: `${conversionRate}%`, icon: TrendingUp }
  ];

  return (
    <>
      <PageHeading
        description="A live view of website activity, lead flow, and follow-up workload."
        eyebrow="Overview"
        title="Command center"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5" key={stat.label}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/45">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-sky-300" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
          </article>
        ))}
      </div>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">Recent submissions</h2>
            <p className="mt-1 text-xs text-white/40">Latest activity across every source</p>
          </div>
        </div>
        {recent.length ? (
          <div className="divide-y divide-white/10">
            {recent.map((item) => (
              <Link
                className="grid gap-3 px-5 py-4 transition hover:bg-white/[0.04] sm:grid-cols-[110px_1fr_auto]"
                href={item.href}
                key={`${item.type}-${item.id}`}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-300">
                  {item.type}
                </span>
                <div>
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-white/40">{item.business}</p>
                </div>
                <StatusBadge status={item.status} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState label="recent submissions" />
          </div>
        )}
      </section>
    </>
  );
}
