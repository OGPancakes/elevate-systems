import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { DetailItem, DetailSection } from "@/components/admin-detail";
import { AdminRecordEditor } from "@/components/admin-record-editor";
import { PageHeading, StatusBadge } from "@/components/admin-ui";
import { PurchaseRecord, getRecord } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(amount / 100);
}

export default async function PurchaseDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const purchase = await getRecord<PurchaseRecord>("purchases", id).catch(() => null);
  if (!purchase) notFound();

  return (
    <>
      <Link
        className="mb-5 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
        href="/admin/purchases"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to purchases
      </Link>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeading
          description={purchase.customer_email || "Customer details pending Stripe checkout"}
          eyebrow={purchase.source}
          title={purchase.customer_name || purchase.tier_name}
        />
        <StatusBadge status={purchase.status} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <DetailSection title="Purchase details">
            <div className="grid gap-6 sm:grid-cols-2">
              <DetailItem label="Package">{purchase.tier_name}</DetailItem>
              <DetailItem label="Amount">
                {money(purchase.amount_cents, purchase.currency)}
              </DetailItem>
              <DetailItem label="Customer">{purchase.customer_name}</DetailItem>
              <DetailItem label="Business">{purchase.business_name}</DetailItem>
              <DetailItem label="Email">
                {purchase.customer_email ? (
                  <a className="text-sky-300" href={`mailto:${purchase.customer_email}`}>
                    {purchase.customer_email}
                  </a>
                ) : null}
              </DetailItem>
              <DetailItem label="Paid">
                {purchase.paid_at ? new Date(purchase.paid_at).toLocaleString() : "Not paid"}
              </DetailItem>
              <DetailItem label="Stripe session">{purchase.stripe_session_id}</DetailItem>
              <DetailItem label="Payment intent">{purchase.stripe_payment_intent_id}</DetailItem>
              <DetailItem label="Created">
                {new Date(purchase.created_at).toLocaleString()}
              </DetailItem>
            </div>
          </DetailSection>
        </div>
        <AdminRecordEditor
          id={purchase.id}
          notes={purchase.notes}
          returnTo={`/admin/purchases/${purchase.id}`}
          status={purchase.status}
          statuses={["Pending", "Paid", "Failed", "Refunded"]}
          table="purchases"
        />
      </div>
    </>
  );
}
