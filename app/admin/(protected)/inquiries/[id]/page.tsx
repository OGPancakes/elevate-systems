import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { DetailItem, DetailSection } from "@/components/admin-detail";
import { AdminRecordEditor } from "@/components/admin-record-editor";
import { PageHeading, StatusBadge } from "@/components/admin-ui";
import { InquiryRecord, getRecord } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await getRecord<InquiryRecord>("inquiries", id).catch(() => null);
  if (!inquiry) notFound();

  return (
    <>
      <Link className="mb-5 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white" href="/admin/inquiries">
        <ArrowLeft className="h-4 w-4" />Back to inquiries
      </Link>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeading description={inquiry.email} eyebrow={inquiry.source} title={inquiry.name} />
        <StatusBadge status={inquiry.status} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <DetailSection title="Contact details">
            <div className="grid gap-6 sm:grid-cols-2">
              <DetailItem label="Business">{inquiry.business_name}</DetailItem>
              <DetailItem label="Email"><a className="text-sky-300" href={`mailto:${inquiry.email}`}>{inquiry.email}</a></DetailItem>
              <DetailItem label="Phone">{inquiry.phone}</DetailItem>
              <DetailItem label="Service">{inquiry.service_interest}</DetailItem>
              <DetailItem label="Submitted">{new Date(inquiry.submitted_at).toLocaleString()}</DetailItem>
            </div>
          </DetailSection>
          <DetailSection title="Message">
            <p className="whitespace-pre-wrap leading-8 text-white/70">{inquiry.message}</p>
          </DetailSection>
        </div>
        <AdminRecordEditor
          id={inquiry.id}
          notes={inquiry.notes}
          returnTo={`/admin/inquiries/${inquiry.id}`}
          status={inquiry.status}
          statuses={["New", "Contacted", "Closed", "Spam"]}
          table="inquiries"
        />
      </div>
    </>
  );
}
