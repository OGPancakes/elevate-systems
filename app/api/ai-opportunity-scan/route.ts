import { isIP } from "node:net";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import { insertRecord } from "@/lib/supabase-admin";

type OpportunityResult = {
  score: number;
  summary: string;
  categories: Array<{ label: string; score: number; insight: string }>;
  opportunities: Array<{ title: string; description: string; impact: "High" | "Medium" }>;
  recommendedSolution: string;
  disclaimer: string;
};

const disclaimer =
  "This opportunity analysis is a preliminary projection based on publicly available website signals. It does not guarantee revenue, growth, savings, performance, or implementation results.";

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isPrivateHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  if (
    normalized === "localhost" ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal")
  ) {
    return true;
  }
  if (!isIP(normalized)) return false;
  return (
    normalized.startsWith("10.") ||
    normalized.startsWith("127.") ||
    normalized.startsWith("169.254.") ||
    normalized.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(normalized) ||
    normalized === "::1"
  );
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 7000);
}

async function fetchWebsite(url: string) {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol) || isPrivateHostname(parsed.hostname)) {
    throw new Error("Please enter a public business website.");
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 ElevateSystemsOpportunityScanner/1.0"
    },
    redirect: "follow",
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) throw new Error("The website could not be reached.");
  const html = await response.text();
  return {
    html: html.slice(0, 150000),
    text: stripHtml(html)
  };
}

function fallbackResult(html: string, text: string): OpportunityResult {
  const hasViewport = /name=["']viewport["']/i.test(html);
  const hasForm = /<form[\s>]/i.test(html);
  const hasSchema = /application\/ld\+json/i.test(html);
  const hasDescription = /name=["']description["']/i.test(html);
  const hasChat = /(chat|intercom|drift|hubspot|tawk|crisp)/i.test(html);
  const hasBooking = /(book|schedule|appointment|calendar)/i.test(text);
  const categories = [
    {
      label: "Website foundation",
      score: Math.min(88, 42 + (hasViewport ? 18 : 0) + (hasDescription ? 14 : 0)),
      insight: hasViewport
        ? "The site exposes a mobile-ready foundation that can support a cleaner customer journey."
        : "Mobile presentation and page structure deserve closer review."
    },
    {
      label: "Lead capture",
      score: hasForm ? 68 : 38,
      insight: hasForm
        ? "A form exists, but qualification and follow-up may still require manual work."
        : "A clearer conversion path could make it easier for visitors to take the next step."
    },
    {
      label: "Customer response",
      score: hasChat || hasBooking ? 72 : 34,
      insight: hasChat || hasBooking
        ? "The site includes at least one customer response or scheduling signal."
        : "Visitors may still depend on business hours or manual replies for common questions."
    },
    {
      label: "Automation readiness",
      score: Math.min(82, 30 + (hasForm ? 18 : 0) + (hasBooking ? 18 : 0) + (hasSchema ? 10 : 0)),
      insight: "The current website can be connected to CRM, notifications, and follow-up workflows."
    }
  ];
  const score = Math.round(
    categories.reduce((total, category) => total + category.score, 0) / categories.length
  );
  return {
    score,
    summary:
      "The website has a usable digital foundation, with meaningful opportunities to improve customer response, lead routing, and repetitive follow-up.",
    categories,
    opportunities: [
      {
        title: "Add an AI website assistant",
        description:
          "Answer common questions, collect customer context, and route qualified conversations into the existing lead process.",
        impact: "High"
      },
      {
        title: "Automate first-response follow-up",
        description:
          "Trigger a consistent email or SMS response after a form submission, missed call, or estimate request.",
        impact: "High"
      },
      {
        title: "Connect website actions to a CRM",
        description:
          "Create a clearer record of each inquiry and reduce manual copying between inboxes, calendars, and spreadsheets.",
        impact: "Medium"
      }
    ],
    recommendedSolution: "AI Growth System",
    disclaimer
  };
}

function safeResult(value: unknown, fallback: OpportunityResult): OpportunityResult {
  if (!value || typeof value !== "object") return fallback;
  const data = value as Partial<OpportunityResult>;
  const categories = Array.isArray(data.categories)
    ? data.categories.slice(0, 5).map((item) => ({
        label: String(item.label || "Opportunity"),
        score: Math.max(1, Math.min(100, Number(item.score) || 50)),
        insight: String(item.insight || "")
      }))
    : fallback.categories;
  const score =
    Number.isFinite(Number(data.score)) && Number(data.score) > 0
      ? Math.max(1, Math.min(100, Math.round(Number(data.score))))
      : Math.round(categories.reduce((total, item) => total + item.score, 0) / categories.length);
  return {
    score,
    summary: String(data.summary || fallback.summary),
    categories,
    opportunities: Array.isArray(data.opportunities)
      ? data.opportunities.slice(0, 4).map((item) => ({
          title: String(item.title || "Automation opportunity"),
          description: String(item.description || ""),
          impact: item.impact === "Medium" ? "Medium" : "High"
        }))
      : fallback.opportunities,
    recommendedSolution: String(data.recommendedSolution || fallback.recommendedSolution),
    disclaimer
  };
}

async function generateResult(
  businessName: string,
  websiteUrl: string,
  html: string,
  text: string
) {
  const fallback = fallbackResult(html, text);
  if (!process.env.OPENAI_API_KEY) return fallback;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_AUDIT_MODEL ?? "gpt-4o-mini",
    temperature: 0.25,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a senior AI automation consultant for Elevate Systems. Analyze public website context and return JSON only. Do not promise revenue, growth, savings, or guaranteed results. Return: score (1-100 opportunity score, where a higher score means more identifiable automation opportunity, not better website quality), summary, categories (4 items with label, score, insight), opportunities (3 concise items with title, description, impact High or Medium), recommendedSolution. Categories should cover Website foundation, Lead capture, Customer response, and Automation readiness. Be specific but clearly preliminary."
      },
      {
        role: "user",
        content: `Business: ${businessName}
Website: ${websiteUrl}
Public page text:
${text || "No readable text was available."}`
      }
    ]
  });
  const raw = completion.choices[0]?.message.content ?? "{}";
  try {
    return safeResult(JSON.parse(raw), fallback);
  } catch {
    return fallback;
  }
}

async function notifyLead(lead: {
  name: string;
  email: string;
  businessName: string;
  websiteUrl: string;
  result: OpportunityResult;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.LEAD_NOTIFICATION_EMAIL) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "Elevate Systems <leads@elevatesystems.us>",
      to: process.env.LEAD_NOTIFICATION_EMAIL.split(",").map((email) => email.trim()),
      subject: `AI Solutions scan: ${lead.businessName}`,
      text: `${lead.name}
${lead.email}
${lead.businessName}
${lead.websiteUrl}
Opportunity score: ${lead.result.score}
Recommended: ${lead.result.recommendedSolution}`
    })
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  if (String(formData.get("companyWebsite") ?? "")) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 240);
  const businessName = String(formData.get("businessName") ?? "").trim().slice(0, 160);
  const websiteUrl = normalizeUrl(String(formData.get("websiteUrl") ?? ""));

  if (!name || !businessName || !websiteUrl || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please complete every field with valid details." }, { status: 400 });
  }

  try {
    const website = await fetchWebsite(websiteUrl);
    const result = await generateResult(businessName, websiteUrl, website.html, website.text);
    await Promise.allSettled([
      insertRecord("leads", {
        name,
        business_name: businessName,
        email,
        phone: null,
        website_url: websiteUrl,
        audit_result: {
          type: "ai-opportunity-scan",
          ...result
        },
        redesign_preview: null,
        website_snapshot: website.text,
        source: "AI Solutions",
        status: "New",
        submitted_at: new Date().toISOString()
      }),
      notifyLead({ name, email, businessName, websiteUrl, result })
    ]);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The website could not be analyzed." },
      { status: 422 }
    );
  }
}
