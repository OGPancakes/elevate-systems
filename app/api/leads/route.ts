import { NextResponse } from "next/server";

import { insertRecord } from "@/lib/supabase-admin";

type LeadPayload = {
  name: string;
  email: string;
  phone?: string;
  company: string;
  message: string;
  serviceInterest?: string;
  submittedAt: string;
};

async function sendToHubSpot(lead: LeadPayload) {
  if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) return;

  await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_PRIVATE_APP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: {
        email: lead.email,
        firstname: lead.name,
        phone: lead.phone,
        company: lead.company,
        message: lead.message,
        lifecyclestage: "lead"
      }
    })
  });
}

async function sendToMake(lead: LeadPayload) {
  if (!process.env.MAKE_WEBHOOK_URL) return;

  await fetch(process.env.MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "elevate-systems-website",
      submittedAt: new Date().toISOString(),
      lead
    })
  });
}

async function saveInquiry(lead: LeadPayload) {
  await insertRecord("inquiries", {
    name: lead.name,
    email: lead.email,
    phone: lead.phone || null,
    business_name: lead.company || null,
    message: lead.message,
    service_interest: lead.serviceInterest || null,
    source: "Contact Form",
    status: "New",
    submitted_at: lead.submittedAt
  });
}

async function sendNotification(lead: LeadPayload) {
  if (!process.env.RESEND_API_KEY || !process.env.LEAD_NOTIFICATION_EMAIL) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "Elevate Systems <leads@elevatesystems.us>",
      to: [process.env.LEAD_NOTIFICATION_EMAIL],
      subject: `New website inquiry: ${lead.company}`,
      text: `${lead.name}\n${lead.email}\n${lead.phone || ""}\n${lead.company}\n${lead.serviceInterest || ""}\n\n${lead.message}`
    })
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  if (String(formData.get("website") ?? "")) {
    return NextResponse.json({ ok: true });
  }
  const lead: LeadPayload = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim().slice(0, 5000),
    serviceInterest: String(formData.get("serviceInterest") ?? "").trim(),
    submittedAt: new Date().toISOString()
  };

  if (!lead.name || !lead.email || !lead.message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  await Promise.allSettled([
    saveInquiry(lead),
    sendNotification(lead),
    sendToHubSpot(lead),
    sendToMake(lead)
  ]);

  const redirectUrl = new URL("/", request.url);
  redirectUrl.hash = "contact";
  redirectUrl.searchParams.set("submitted", "true");

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
