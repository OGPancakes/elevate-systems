import { Search } from "lucide-react";

import { EmptyState, PageHeading, RecordLink, StatusBadge } from "@/components/admin-ui";
import { LeadRecord, listRecords } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; status?: string; source?: string }>;
}) {
  const params = await searchParams;
  const query = (params?.q ?? "").toLowerCase();
  const status = params?.status ?? "";
  const source = params?.source ?? "";
  let leads: LeadRecord[] = [];
  try {
    leads = await listRecords<LeadRecord>("leads");
  } catch {
    leads = [];
  }

  const filtered = leads.filter((lead) => {
    const matchesQuery =
      !query ||
      [lead.name, lead.email, lead.business_name, lead.website_url, lead.source]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return matchesQuery && (!status || lead.status === status) && (!source || lead.source === source);
  });

  return (
    <>
      <PageHeading
        description="Audit and Elevate Bot prospects, including AI results and redesign previews."
        eyebrow="Pipeline"
        title="Leads"
      />
      <form className="mb-6 grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-[minmax(220px,1fr)_180px_180px_auto]" action="/admin/leads">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            className="w-full rounded-md border border-white/10 bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-sky-300/50"
            defaultValue={params?.q}
            name="q"
            placeholder="Search name, email, business, or website"
          />
        </label>
        <select className="rounded-md border border-white/10 bg-[#07101e] px-3 py-2.5 text-sm text-white" defaultValue={status} name="status">
          <option value="">All statuses</option>
          {["New", "Contacted", "Booked", "Closed", "Lost"].map((value) => <option key={value}>{value}</option>)}
        </select>
        <select className="rounded-md border border-white/10 bg-[#07101e] px-3 py-2.5 text-sm text-white" defaultValue={source} name="source">
          <option value="">All sources</option>
          <option>Audit Tool</option>
          <option>AI Solutions</option>
          <option>Elevate Bot</option>
          <option>Contact Form</option>
          <option>Book a Call</option>
        </select>
        <button className="rounded-md bg-sky-400 px-4 py-2.5 text-sm font-semibold text-[#03101f] hover:bg-sky-300" type="submit">Filter</button>
      </form>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-white/35">
                <tr>
                  <th className="px-5 py-4">Lead</th>
                  <th className="px-5 py-4">Source</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((lead) => (
                  <tr className="hover:bg-white/[0.035]" key={lead.id}>
                    <td className="px-5 py-4">
                      <RecordLink
                        href={`/admin/leads/${lead.id}`}
                        subtitle={`${lead.email} · ${lead.business_name}`}
                        title={lead.name}
                      />
                    </td>
                    <td className="px-5 py-4 text-white/55">{lead.source}</td>
                    <td className="px-5 py-4"><StatusBadge status={lead.status} /></td>
                    <td className="px-5 py-4 text-white/45">
                      {new Date(lead.submitted_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5"><EmptyState label="leads" /></div>
        )}
      </div>
    </>
  );
}
