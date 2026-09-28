import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
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
  const isExternalSupport = inquiry.source === "Feather by Hanna";
  const statuses = isExternalSupport
    ? ["Submitted", "In Progress", "Needs Information", "Completed", "Cancelled"]
    : ["New", "Contacted", "Closed", "Spam"];

  return (
    <>
      <Link className="mb-5 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white" href="/admin/inquiries">
        <ArrowLeft className="h-4 w-4" />Back to inquiries
      </Link>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeading
          description={inquiry.ticket_id || inquiry.email || inquiry.business_name || "Support request"}
          eyebrow={inquiry.source}
          title={inquiry.request_title || inquiry.name}
        />
        <StatusBadge status={inquiry.status} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <DetailSection title="Contact details">
            <div className="grid gap-6 sm:grid-cols-2">
              <DetailItem label="Business">{inquiry.business_name}</DetailItem>
              <DetailItem label="Email">{inquiry.email ? <a className="text-sky-300" href={`mailto:${inquiry.email}`}>{inquiry.email}</a> : null}</DetailItem>
              <DetailItem label="Phone">{inquiry.phone}</DetailItem>
              <DetailItem label="Service">{inquiry.service_interest}</DetailItem>
              <DetailItem label="Submitted">{new Date(inquiry.submitted_at).toLocaleString()}</DetailItem>
            </div>
          </DetailSection>
          {isExternalSupport ? (
            <DetailSection title="Request details">
              <div className="grid gap-6 sm:grid-cols-2">
                <DetailItem label="Ticket ID">{inquiry.ticket_id}</DetailItem>
                <DetailItem label="Feather request ID">{inquiry.external_request_id}</DetailItem>
                <DetailItem label="Client site">{inquiry.external_site_id}</DetailItem>
                <DetailItem label="Category">{inquiry.category}</DetailItem>
                <DetailItem label="Priority">{inquiry.priority}</DetailItem>
                <DetailItem label="Affected area">{inquiry.affected_area}</DetailItem>
                <DetailItem label="Created in Feather">{inquiry.external_created_at ? new Date(inquiry.external_created_at).toLocaleString() : null}</DetailItem>
                <DetailItem label="Last updated">{inquiry.updated_at ? new Date(inquiry.updated_at).toLocaleString() : null}</DetailItem>
              </div>
            </DetailSection>
          ) : null}
          <DetailSection title="Message">
            <p className="whitespace-pre-wrap leading-8 text-white/70">{inquiry.message}</p>
          </DetailSection>
          {isExternalSupport && inquiry.attachments?.length ? (
            <DetailSection title="Protected attachments">
              <div className="grid gap-2">
                {inquiry.attachments.map((attachment) => (
                  <a
                    className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70 transition hover:border-sky-300/30 hover:text-white"
                    href={`/api/admin/support-attachments?path=${encodeURIComponent(attachment.path)}`}
                    key={attachment.path}
                  >
                    <span className="min-w-0 truncate">{attachment.name}</span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-sky-300">
                      {(attachment.size / 1024).toFixed(0)} KB <Download className="h-4 w-4" />
                    </span>
                  </a>
                ))}
              </div>
            </DetailSection>
          ) : null}
        </div>
        <AdminRecordEditor
          id={inquiry.id}
          notes={inquiry.notes}
          returnTo={`/admin/inquiries/${inquiry.id}`}
          status={inquiry.status}
          statuses={statuses}
          table="inquiries"
        />
      </div>
    </>
  );
}
