import { NextResponse } from "next/server";

type LeadPayload = {
  name: string;
  email: string;
  phone?: string;
  company: string;
  message: string;
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

export async function POST(request: Request) {
  const formData = await request.formData();
  const lead: LeadPayload = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    company: String(formData.get("company") ?? ""),
    message: String(formData.get("message") ?? "")
  };

  if (!lead.name || !lead.email || !lead.company || !lead.message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  await Promise.allSettled([sendToHubSpot(lead), sendToMake(lead)]);

  const redirectUrl = new URL("/", request.url);
  redirectUrl.hash = "contact";
  redirectUrl.searchParams.set("submitted", "true");

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
