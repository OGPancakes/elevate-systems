import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";

import { DetailItem, DetailSection } from "@/components/admin-detail";
import { AdminRecordEditor } from "@/components/admin-record-editor";
import { PageHeading, StatusBadge } from "@/components/admin-ui";
import {
  ConversationRecord,
  LeadRecord,
  getRecord,
  listRecords
} from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getRecord<LeadRecord>("leads", id).catch(() => null);
  if (!lead) notFound();

  const conversations = await listRecords<ConversationRecord>(
    "bot_conversations",
    `select=*&lead_id=eq.${encodeURIComponent(id)}&order=created_at.asc`
  ).catch(() => []);
  const audit = lead.audit_result as {
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    improvements?: string[];
    howElevateHelps?: string[];
    cta?: string;
  };

  return (
    <>
      <Link className="mb-5 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white" href="/admin/leads">
        <ArrowLeft className="h-4 w-4" />
        Back to leads
      </Link>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeading
          description={`${lead.email} · ${lead.business_name}`}
          eyebrow={lead.source}
          title={lead.name}
        />
        <StatusBadge status={lead.status} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <DetailSection title="Lead details">
            <div className="grid gap-6 sm:grid-cols-2">
              <DetailItem label="Business">{lead.business_name}</DetailItem>
              <DetailItem label="Email"><a className="text-sky-300" href={`mailto:${lead.email}`}>{lead.email}</a></DetailItem>
              <DetailItem label="Phone">{lead.phone}</DetailItem>
              <DetailItem label="Submitted">{new Date(lead.submitted_at).toLocaleString()}</DetailItem>
              <DetailItem label="Website">
                <a className="inline-flex items-center gap-2 text-sky-300" href={lead.website_url} rel="noreferrer" target="_blank">
                  {lead.website_url}<ExternalLink className="h-3.5 w-3.5" />
                </a>
              </DetailItem>
              <DetailItem label="Logo">{lead.logo_url || lead.logo_storage_path}</DetailItem>
            </div>
          </DetailSection>

          <DetailSection title="AI audit">
            <p className="leading-7 text-white/70">{audit.summary}</p>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {[
                ["Strengths", audit.strengths],
                ["Weaknesses", audit.weaknesses],
                ["Improvements", audit.improvements],
                ["How Elevate helps", audit.howElevateHelps]
              ].map(([title, items]) => (
                <div className="rounded-md border border-white/10 bg-black/20 p-4" key={String(title)}>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-white/55">
                    {Array.isArray(items) ? items.map((item) => <li key={item}>• {item}</li>) : null}
                  </ul>
                </div>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Transformation preview">
            {lead.redesign_preview ? (
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-white/60">
                {JSON.stringify(lead.redesign_preview, null, 2)}
              </pre>
            ) : <p className="text-sm text-white/40">No redesign preview stored for this lead.</p>}
          </DetailSection>

          <DetailSection title="Elevate Bot conversation">
            {conversations.length ? conversations.flatMap((conversation) => conversation.messages).map((message, index) => (
              <div className={`mb-3 max-w-2xl rounded-md px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-sky-400 text-slate-950" : "border border-white/10 bg-white/5 text-white/70"}`} key={`${message.role}-${index}`}>
                {message.content}
              </div>
            )) : <p className="text-sm text-white/40">No linked bot conversation.</p>}
          </DetailSection>
        </div>

        <AdminRecordEditor
          id={lead.id}
          notes={lead.notes}
          returnTo={`/admin/leads/${lead.id}`}
          status={lead.status}
          statuses={["New", "Contacted", "Booked", "Closed", "Lost"]}
          table="leads"
        />
      </div>
    </>
  );
}
