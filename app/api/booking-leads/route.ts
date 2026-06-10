import { NextResponse } from "next/server";

import {
  BOOKING_DURATION_MINUTES,
  BOOKING_TIME_ZONE,
  formatBookingTime,
  isAllowedBookingSlot
} from "@/lib/booking-schedule";
import { insertRecord } from "@/lib/supabase-admin";

type BookingLead = {
  name: string;
  email: string;
  phone?: string;
  businessName: string;
  websiteUrl?: string;
  message: string;
  selectedDateTime?: string;
  serviceInterest?: string;
  submittedAt: string;
};

async function sendToMake(lead: BookingLead) {
  if (!process.env.MAKE_WEBHOOK_URL) return;
  await fetch(process.env.MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "book-a-call-page",
      lead
    })
  });
}

async function sendNotification(lead: BookingLead) {
  const recipients = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!process.env.RESEND_API_KEY || !recipients) return;
  const scheduledFor = lead.selectedDateTime
    ? formatBookingTime(lead.selectedDateTime)
    : "Not selected";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "Elevate Systems <leads@elevatesystems.us>",
      to: recipients.split(",").map((email) => email.trim()),
      subject: `New call booked: ${lead.businessName}`,
      html: `<h2>New Strategy Call</h2>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Business:</strong> ${lead.businessName}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Phone:</strong> ${lead.phone ?? ""}</p>
        <p><strong>Website:</strong> ${lead.websiteUrl ?? ""}</p>
        <p><strong>Scheduled:</strong> ${scheduledFor}</p>
        <p><strong>Service:</strong> ${lead.serviceInterest ?? ""}</p>
        <p><strong>Goals:</strong> ${lead.message}</p>
        <p><strong>Submitted:</strong> ${lead.submittedAt}</p>`
    })
  });
}

async function saveBooking(lead: BookingLead) {
  return insertRecord<{ id: string }>("bookings", {
    name: lead.name,
    email: lead.email,
    phone: lead.phone || null,
    business_name: lead.businessName,
    website_url: lead.websiteUrl || null,
    selected_datetime: lead.selectedDateTime || null,
    reason: lead.message,
    service_interest: lead.serviceInterest || null,
    source: "Book a Call",
    status: "Upcoming",
    duration_minutes: BOOKING_DURATION_MINUTES,
    timezone: BOOKING_TIME_ZONE,
    booked_at: lead.submittedAt
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const formData = contentType.includes("application/json")
    ? new FormData()
    : await request.formData();
  const json = contentType.includes("application/json")
    ? ((await request.json()) as Record<string, unknown>)
    : null;
  const read = (key: string) =>
    String(json ? (json[key] ?? "") : (formData.get(key) ?? "")).trim();

  if (String(formData.get("website") ?? "")) {
    return NextResponse.redirect(new URL("/book?submitted=true", request.url), { status: 303 });
  }
  const lead: BookingLead = {
    name: read("name"),
    email: read("email"),
    phone: read("phone"),
    businessName: read("businessName"),
    websiteUrl: read("websiteUrl"),
    message: read("message").slice(0, 5000),
    selectedDateTime: read("selectedDateTime"),
    serviceInterest: read("serviceInterest"),
    submittedAt: new Date().toISOString()
  };

  if (
    !lead.name ||
    !lead.email ||
    !lead.phone ||
    !lead.businessName ||
    !lead.selectedDateTime ||
    !lead.message
  ) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!isAllowedBookingSlot(lead.selectedDateTime)) {
    return NextResponse.json(
      { error: "That time is outside our booking hours or is no longer available." },
      { status: 409 }
    );
  }

  let booking: { id: string } | null = null;
  try {
    booking = await saveBooking(lead);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("23505") || message.includes("409")) {
      return NextResponse.json(
        { error: "That time was just booked. Please choose another available slot." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "We could not reserve that time. Please try again." },
      { status: 500 }
    );
  }

  await Promise.allSettled([sendToMake(lead), sendNotification(lead)]);

  if (json) {
    return NextResponse.json({
      ok: true,
      bookingId: booking?.id,
      startsAt: lead.selectedDateTime,
      formattedTime: formatBookingTime(lead.selectedDateTime),
      durationMinutes: BOOKING_DURATION_MINUTES,
      timeZone: BOOKING_TIME_ZONE
    });
  }

  const redirectUrl = new URL("/book", request.url);
  redirectUrl.searchParams.set("submitted", "true");

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
