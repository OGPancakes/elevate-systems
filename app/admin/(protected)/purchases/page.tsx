import { Search } from "lucide-react";

import { EmptyState, PageHeading, RecordLink, StatusBadge } from "@/components/admin-ui";
import { PurchaseRecord, listRecords } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(amount / 100);
}

export default async function PurchasesPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = (params?.q ?? "").toLowerCase();
  const status = params?.status ?? "";
  const purchases = await listRecords<PurchaseRecord>("purchases").catch(() => []);
  const filtered = purchases.filter((purchase) => {
    const matchesQuery =
      !query ||
      [
        purchase.customer_name,
        purchase.customer_email,
        purchase.business_name,
        purchase.tier_name
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return matchesQuery && (!status || purchase.status === status);
  });

  return (
    <>
      <PageHeading
        description="Stripe checkout activity and AI Solutions package purchases."
        eyebrow="Revenue"
        title="Purchases"
      />
      <form
        action="/admin/purchases"
        className="mb-6 grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-[1fr_180px_auto]"
      >
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            className="w-full rounded-md border border-white/10 bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-sky-300/50"
            defaultValue={params?.q}
            name="q"
            placeholder="Search customer, business, or package"
          />
        </label>
        <select
          className="rounded-md border border-white/10 bg-[#07101e] px-3 py-2.5 text-sm text-white"
          defaultValue={status}
          name="status"
        >
          <option value="">All statuses</option>
          {["Pending", "Paid", "Failed", "Refunded"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <button className="rounded-md bg-sky-400 px-4 py-2.5 text-sm font-semibold text-[#03101f] hover:bg-sky-300">
          Filter
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        {filtered.length ? (
          <div className="divide-y divide-white/10">
            {filtered.map((purchase) => (
              <div
                className="grid items-center gap-4 px-5 py-4 sm:grid-cols-[1fr_140px_110px_190px]"
                key={purchase.id}
              >
                <RecordLink
                  href={`/admin/purchases/${purchase.id}`}
                  subtitle={`${purchase.customer_email || "Email collected at checkout"} / ${purchase.business_name || purchase.tier_name}`}
                  title={purchase.customer_name || purchase.tier_name}
                />
                <span className="text-sm font-medium text-white/70">
                  {money(purchase.amount_cents, purchase.currency)}
                </span>
                <StatusBadge status={purchase.status} />
                <span className="text-xs text-white/40 sm:text-right">
                  {new Date(purchase.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState label="purchases" />
          </div>
        )}
      </div>
    </>
  );
}
