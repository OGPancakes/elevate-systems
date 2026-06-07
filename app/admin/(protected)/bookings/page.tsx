import { EmptyState, PageHeading, RecordLink, StatusBadge } from "@/components/admin-ui";
import { BookingRecord, listRecords } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function BookingsPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = (params?.q ?? "").toLowerCase();
  const status = params?.status ?? "";
  let bookings: BookingRecord[] = [];
  try {
    bookings = await listRecords<BookingRecord>("bookings");
  } catch {
    bookings = [];
  }
  const filtered = bookings.filter((item) => {
    const matchesQuery =
      !query ||
      [item.name, item.email, item.business_name, item.reason, item.service_interest]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return matchesQuery && (!status || item.status === status);
  });

  return (
    <>
      <PageHeading
        description="Consultation requests and scheduled call activity."
        eyebrow="Calendar"
        title="Bookings"
      />
      <form className="mb-6 grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-[1fr_180px_auto]" action="/admin/bookings">
        <input className="rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-300/50" defaultValue={params?.q} name="q" placeholder="Search bookings" />
        <select className="rounded-md border border-white/10 bg-[#07101e] px-3 py-2.5 text-sm text-white" defaultValue={status} name="status">
          <option value="">All statuses</option>
          {["Upcoming", "Completed", "Cancelled", "No-show"].map((value) => <option key={value}>{value}</option>)}
        </select>
        <button className="rounded-md bg-sky-400 px-4 py-2.5 text-sm font-semibold text-[#03101f] hover:bg-sky-300" type="submit">Filter</button>
      </form>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        {filtered.length ? (
          <div className="divide-y divide-white/10">
            {filtered.map((item) => (
              <div className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_160px_auto]" key={item.id}>
                <RecordLink
                  href={`/admin/bookings/${item.id}`}
                  subtitle={`${item.email} · ${item.business_name}`}
                  title={item.name}
                />
                <StatusBadge status={item.status} />
                <span className="text-xs text-white/40">
                  {new Date(item.selected_datetime || item.booked_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : <div className="p-5"><EmptyState label="bookings" /></div>}
      </div>
    </>
  );
}
