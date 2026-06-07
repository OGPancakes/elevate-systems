import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { DetailItem, DetailSection } from "@/components/admin-detail";
import { AdminRecordEditor } from "@/components/admin-record-editor";
import { PageHeading, StatusBadge } from "@/components/admin-ui";
import { BookingRecord, getRecord } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await getRecord<BookingRecord>("bookings", id).catch(() => null);
  if (!booking) notFound();

  return (
    <>
      <Link className="mb-5 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white" href="/admin/bookings">
        <ArrowLeft className="h-4 w-4" />Back to bookings
      </Link>
      <div className="flex justify-between gap-4">
        <PageHeading description={`${booking.email} · ${booking.business_name}`} eyebrow={booking.source} title={booking.name} />
        <StatusBadge status={booking.status} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <DetailSection title="Booking details">
            <div className="grid gap-6 sm:grid-cols-2">
              <DetailItem label="Business">{booking.business_name}</DetailItem>
              <DetailItem label="Email"><a className="text-sky-300" href={`mailto:${booking.email}`}>{booking.email}</a></DetailItem>
              <DetailItem label="Phone">{booking.phone}</DetailItem>
              <DetailItem label="Website">{booking.website_url}</DetailItem>
              <DetailItem label="Requested time">
                {booking.selected_datetime ? new Date(booking.selected_datetime).toLocaleString() : "Not selected"}
              </DetailItem>
              <DetailItem label="Service">{booking.service_interest}</DetailItem>
              <DetailItem label="Submitted">{new Date(booking.booked_at).toLocaleString()}</DetailItem>
            </div>
          </DetailSection>
          <DetailSection title="Reason for call">
            <p className="whitespace-pre-wrap leading-8 text-white/70">{booking.reason}</p>
          </DetailSection>
        </div>
        <AdminRecordEditor
          id={booking.id}
          notes={booking.notes}
          returnTo={`/admin/bookings/${booking.id}`}
          status={booking.status}
          statuses={["Upcoming", "Completed", "Cancelled", "No-show"]}
          table="bookings"
        />
      </div>
    </>
  );
}
