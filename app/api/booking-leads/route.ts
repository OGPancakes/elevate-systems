import { NextResponse } from "next/server";

type BookingLead = {
  name: string;
  email: string;
  phone?: string;
  businessName: string;
  websiteUrl?: string;
  message: string;
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

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "Elevate Systems <leads@elevatesystems.us>",
      to: recipients.split(",").map((email) => email.trim()),
      subject: `New booking request: ${lead.businessName}`,
      html: `<h2>New Booking Request</h2>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Business:</strong> ${lead.businessName}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Phone:</strong> ${lead.phone ?? ""}</p>
        <p><strong>Website:</strong> ${lead.websiteUrl ?? ""}</p>
        <p><strong>Message:</strong> ${lead.message}</p>
        <p><strong>Submitted:</strong> ${lead.submittedAt}</p>`
    })
  });
}

async function saveToSupabase(lead: BookingLead) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  await fetch(`${process.env.SUPABASE_URL}/rest/v1/booking_leads`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || null,
      business_name: lead.businessName,
      website_url: lead.websiteUrl || null,
      message: lead.message,
      submitted_at: lead.submittedAt
    })
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const lead: BookingLead = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    businessName: String(formData.get("businessName") ?? "").trim(),
    websiteUrl: String(formData.get("websiteUrl") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
    submittedAt: new Date().toISOString()
  };

  if (!lead.name || !lead.email || !lead.businessName || !lead.message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  await Promise.allSettled([sendToMake(lead), sendNotification(lead), saveToSupabase(lead)]);

  const redirectUrl = new URL("/book", request.url);
  redirectUrl.searchParams.set("submitted", "true");

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
