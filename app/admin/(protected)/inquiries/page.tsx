import { Search } from "lucide-react";

import { EmptyState, PageHeading, RecordLink, StatusBadge } from "@/components/admin-ui";
import { InquiryRecord, listRecords } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function InquiriesPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = (params?.q ?? "").toLowerCase();
  const status = params?.status ?? "";
  let inquiries: InquiryRecord[] = [];
  try {
    inquiries = await listRecords<InquiryRecord>("inquiries");
  } catch {
    inquiries = [];
  }
  const filtered = inquiries.filter((item) => {
    const matchesQuery =
      !query ||
      [item.name, item.email, item.business_name, item.message, item.service_interest]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return matchesQuery && (!status || item.status === status);
  });

  return (
    <>
      <PageHeading
        description="Messages submitted through the main website contact form."
        eyebrow="Inbox"
        title="Inquiries"
      />
      <form className="mb-6 grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-[1fr_180px_auto]" action="/admin/inquiries">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input className="w-full rounded-md border border-white/10 bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-sky-300/50" defaultValue={params?.q} name="q" placeholder="Search inquiries" />
        </label>
        <select className="rounded-md border border-white/10 bg-[#07101e] px-3 py-2.5 text-sm text-white" defaultValue={status} name="status">
          <option value="">All statuses</option>
          {["New", "Contacted", "Closed", "Spam"].map((value) => <option key={value}>{value}</option>)}
        </select>
        <button className="rounded-md bg-sky-400 px-4 py-2.5 text-sm font-semibold text-[#03101f] hover:bg-sky-300" type="submit">Filter</button>
      </form>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        {filtered.length ? (
          <div className="divide-y divide-white/10">
            {filtered.map((item) => (
              <div className="grid items-center gap-4 px-5 py-4 sm:grid-cols-[1fr_120px_190px]" key={item.id}>
                <RecordLink
                  href={`/admin/inquiries/${item.id}`}
                  subtitle={`${item.email} · ${item.service_interest || "General inquiry"}`}
                  title={item.name}
                />
                <StatusBadge status={item.status} />
                <span className="text-xs text-white/40 sm:text-right">{new Date(item.submitted_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : <div className="p-5"><EmptyState label="inquiries" /></div>}
      </div>
    </>
  );
}
