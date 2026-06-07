import { NextResponse } from "next/server";
import OpenAI from "openai";

import { insertRecord, updateRecordBy } from "@/lib/supabase-admin";

type AuditResult = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  howElevateHelps: string[];
  cta: string;
};

type RedesignPreview = {
  businessName: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  trustPoints: string[];
  services: string[];
  markers: Array<{
    title: string;
    description: string;
    x: number;
    y: number;
  }>;
  screenshotUrl: string;
};

type AuditLead = {
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  websiteUrl: string;
  logoUrl?: string;
  logoStoragePath?: string;
  audit: AuditResult;
  redesign: RedesignPreview;
  sessionId?: string;
  submittedAt: string;
  websiteSnapshot: string;
};

const fallbackAudit: AuditResult = {
  summary:
    "This business already has an online presence, but the site should work harder as a trust builder, lead capture system, and automation entry point.",
  strengths: [
    "The business is searchable online and has a website visitors can review.",
    "There is enough public context to start improving the offer, calls to action, and conversion flow.",
    "A focused redesign could quickly make the brand feel more modern and credible."
  ],
  weaknesses: [
    "The current site may not communicate a sharp, premium first impression.",
    "Lead capture and follow-up opportunities are likely underused.",
    "The visitor journey may need clearer next steps for booking, calling, or requesting a quote."
  ],
  improvements: [
    "Modernize the hero section with a clearer value proposition and stronger visual hierarchy.",
    "Add trust markers, testimonials, service proof, and stronger conversion sections.",
    "Connect forms and chat to CRM, email alerts, and automated follow-up workflows."
  ],
  howElevateHelps: [
    "Elevate Systems can rebuild the site with a premium, fast, mobile-first experience.",
    "Elevate Bot can qualify visitors, collect details, and route leads automatically.",
    "HubSpot and Make.com workflows can keep every inquiry moving without manual chasing."
  ],
  cta: "Book a consultation and we will map the fastest path from current website to modern lead system."
};

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6500);
}

function getMeta(html: string, name: string) {
  const pattern = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  return html.match(pattern)?.[1] ?? "";
}

function getTitle(html: string) {
  return html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
}

function safeAudit(value: unknown): AuditResult {
  if (!value || typeof value !== "object") return fallbackAudit;
  const data = value as Partial<AuditResult>;
  return {
    summary: data.summary || fallbackAudit.summary,
    strengths: Array.isArray(data.strengths) ? data.strengths.slice(0, 5) : fallbackAudit.strengths,
    weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses.slice(0, 5) : fallbackAudit.weaknesses,
    improvements: Array.isArray(data.improvements) ? data.improvements.slice(0, 5) : fallbackAudit.improvements,
    howElevateHelps: Array.isArray(data.howElevateHelps)
      ? data.howElevateHelps.slice(0, 5)
      : fallbackAudit.howElevateHelps,
    cta: data.cta || fallbackAudit.cta
  };
}

async function fetchWebsiteSnapshot(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 ElevateSystemsAuditBot/1.0 (+https://elevatesystems.us)"
      },
      signal: AbortSignal.timeout(7000)
    });
    const html = await response.text();
    const title = getTitle(html);
    const description = getMeta(html, "description") || getMeta(html, "og:description");
    const text = stripHtml(html);
    return [
      title ? `Title: ${title}` : "",
      description ? `Description: ${description}` : "",
      text ? `Page text: ${text}` : ""
    ]
      .filter(Boolean)
      .join("\n");
  } catch {
    return "The website could not be fetched automatically. Generate a useful first-pass audit based on the submitted business name, website URL, and common service-business website best practices.";
  }
}

async function generateAudit(lead: {
  businessName: string;
  websiteUrl: string;
  websiteSnapshot: string;
}) {
  if (!process.env.OPENAI_API_KEY) return fallbackAudit;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_AUDIT_MODEL ?? "gpt-4o-mini",
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are Elevate Bot, a premium AI website auditor for Elevate Systems. Return compact JSON only with keys: summary, strengths, weaknesses, improvements, howElevateHelps, cta. Each list should have 3 to 5 concise, specific items. Be professional, constructive, and sales-oriented without being harsh."
      },
      {
        role: "user",
        content: `Business: ${lead.businessName}
Website URL: ${lead.websiteUrl}
Website snapshot:
${lead.websiteSnapshot}`
      }
    ]
  });

  const raw = completion.choices[0]?.message.content ?? "{}";
  try {
    return safeAudit(JSON.parse(raw));
  } catch {
    return fallbackAudit;
  }
}

function generateRedesign(
  businessName: string,
  websiteUrl: string,
  audit: AuditResult
): RedesignPreview {
  return {
    businessName,
    eyebrow: "Trusted local service professionals",
    headline: `${businessName}, presented with clarity and confidence.`,
    subheadline:
      audit.improvements[0] ||
      "A conversion-focused website experience built to turn visitors into qualified customers.",
    primaryCta: "Request a Consultation",
    secondaryCta: "Explore Services",
    trustPoints: ["Fast response", "Clear next steps", "Built for mobile"],
    services: audit.howElevateHelps.slice(0, 3),
    screenshotUrl: `https://image.thum.io/get/width/1200/crop/800/noanimate/${websiteUrl}`,
    markers: [
      {
        title: "Better Hero Section",
        description: "A clear offer helps visitors understand the business within seconds.",
        x: 28,
        y: 30
      },
      {
        title: "Stronger Call To Action",
        description: "The primary action is visible immediately and repeated at the right moments.",
        x: 52,
        y: 57
      },
      {
        title: "More Trust Signals",
        description: "Credibility cues reduce hesitation before a visitor reaches out.",
        x: 75,
        y: 35
      },
      {
        title: "Better Lead Capture",
        description: "The redesign gives prospects an obvious, low-friction path to contact the team.",
        x: 83,
        y: 72
      }
    ]
  };
}

async function uploadLogo(file: File | null, email: string) {
  if (!file || file.size === 0) return "";
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return "";

  const ext = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "png";
  const path = `website-audits/${Date.now()}-${email.replace(/[^a-z0-9]/gi, "-")}.${ext}`;
  const response = await fetch(
    `${process.env.SUPABASE_URL}/storage/v1/object/${process.env.SUPABASE_LOGO_BUCKET ?? "lead-assets"}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false"
      },
      body: file
    }
  );

  return response.ok ? path : "";
}

async function saveToSupabase(lead: AuditLead) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return "";

  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/website_audit_leads`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      name: lead.name,
      business_name: lead.businessName,
      email: lead.email,
      website_url: lead.websiteUrl,
      logo_url: lead.logoUrl || null,
      logo_storage_path: lead.logoStoragePath || null,
      audit_result: lead.audit,
      website_snapshot: lead.websiteSnapshot,
      submitted_at: lead.submittedAt
    })
  });

  if (!response.ok) return "";
  const rows = (await response.json()) as Array<{ id?: string }>;
  return rows[0]?.id ?? "";
}

async function saveUnifiedLead(lead: AuditLead) {
  try {
    const record = await insertRecord<{ id: string }>("leads", {
      name: lead.name,
      business_name: lead.businessName,
      email: lead.email,
      phone: lead.phone || null,
      website_url: lead.websiteUrl,
      logo_url: lead.logoUrl || null,
      logo_storage_path: lead.logoStoragePath || null,
      audit_result: lead.audit,
      redesign_preview: lead.redesign,
      website_snapshot: lead.websiteSnapshot,
      source: "Audit Tool",
      status: "New",
      submitted_at: lead.submittedAt
    });
    if (record?.id && lead.sessionId) {
      await updateRecordBy("bot_conversations", "session_id", lead.sessionId, { lead_id: record.id }).catch(
        () => undefined
      );
    }
    return record?.id ?? "";
  } catch {
    return "";
  }
}

async function sendNotification(lead: AuditLead) {
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
      subject: `New website audit lead: ${lead.businessName}`,
      html: `<h2>New Website Audit Lead</h2>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Business:</strong> ${lead.businessName}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Website:</strong> ${lead.websiteUrl}</p>
        <p><strong>Submitted:</strong> ${lead.submittedAt}</p>
        <h3>AI Summary</h3>
        <p>${lead.audit.summary}</p>`
    })
  });
}

async function sendToMake(lead: AuditLead) {
  if (!process.env.MAKE_WEBHOOK_URL) return;
  await fetch(process.env.MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "website-audit-ai",
      lead
    })
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const businessName = String(formData.get("businessName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const websiteUrl = normalizeUrl(String(formData.get("websiteUrl") ?? ""));
    const logoUrl = normalizeUrl(String(formData.get("logoUrl") ?? ""));
    const logo = formData.get("logo");
    const sessionId = String(formData.get("sessionId") ?? "").trim();

    if (!name || !businessName || !email || !websiteUrl) {
      return NextResponse.json({ error: "Name, business, email, and website URL are required." }, { status: 400 });
    }

    const websiteSnapshot = await fetchWebsiteSnapshot(websiteUrl);
    const audit = await generateAudit({ businessName, websiteUrl, websiteSnapshot });
    const redesign = generateRedesign(businessName, websiteUrl, audit);
    const submittedAt = new Date().toISOString();
    const logoStoragePath = await uploadLogo(logo instanceof File ? logo : null, email);
    const lead: AuditLead = {
      name,
      businessName,
      email,
      phone,
      websiteUrl,
      logoUrl,
      logoStoragePath,
      audit,
      redesign,
      sessionId,
      submittedAt,
      websiteSnapshot
    };

    const [leadId] = await Promise.all([
      saveUnifiedLead(lead),
      saveToSupabase(lead),
      sendNotification(lead),
      sendToMake(lead)
    ]);

    return NextResponse.json({ audit, redesign, leadId });
  } catch {
    return NextResponse.json(
      { error: "The audit could not be generated right now. Please try again in a moment." },
      { status: 500 }
    );
  }
}
