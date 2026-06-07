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
  generatedImageUrl?: string;
  qualityScore?: number;
  generationMode?: "ai-image" | "fallback";
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

type QualityReview = {
  score: number;
  issues: string[];
};

export const maxDuration = 300;

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
  audit: AuditResult,
  generatedImageUrl = "",
  qualityScore = 0
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
    generatedImageUrl: generatedImageUrl || undefined,
    qualityScore: qualityScore || undefined,
    generationMode: generatedImageUrl ? "ai-image" : "fallback",
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

function buildRedesignPrompt(input: {
  businessName: string;
  websiteUrl: string;
  websiteSnapshot: string;
  audit: AuditResult;
  stronger?: boolean;
  qualityIssues?: string[];
  hasLogo?: boolean;
}) {
  const improvementDirection = input.audit.improvements.slice(0, 3).join("; ");
  const trustDirection = input.audit.strengths.slice(0, 2).join("; ");
  const retryDirection = input.stronger
    ? `This is a regeneration after an internal design review. Dramatically improve the visual impact, composition, polish, and realism. Correct these issues: ${(input.qualityIssues ?? []).join("; ") || "the previous concept was not aspirational enough"}.`
    : "";

  return `Create a premium modern homepage redesign concept for "${input.businessName}" based on the business information below.

This must look like a real high-end agency-designed website screenshot, not a wireframe, dashboard, template, presentation slide, or generic AI illustration.

ART DIRECTION
- Full-width desktop homepage screenshot in a precise 3:2 landscape composition.
- Sophisticated editorial layout with excellent whitespace, alignment, hierarchy, and professional typography.
- A striking hero section with one relevant, realistic industry image or polished product/service visual.
- Use a refined multi-color palette appropriate to the industry. Preserve useful brand cues, but freely replace weak colors.
- Add a clear navigation bar, bold headline, primary and secondary CTA buttons, review/rating proof, trust credentials, and a glimpse of premium service cards below the fold.
- Make the page feel established, trustworthy, expensive, conversion-focused, and custom-designed.
- Strong visual contrast and crisp UI details. Restrained glass effects are acceptable, but avoid excessive glow, purple gradients, floating blobs, and generic SaaS styling.
- Mobile-friendly design logic should be evident even though this is a desktop concept.
- Use the exact business name "${input.businessName}" prominently and spell it correctly.
- Keep all other visible text minimal, large, and legible. Do not generate paragraphs of tiny text.
- No browser frame, device mockup, watermark, before/after labels, annotations, design-tool chrome, or explanatory captions.
${input.hasLogo ? "- An official company logo is supplied as the input image. Preserve its shape and identity accurately and place it naturally in the navigation." : ""}

BUSINESS CONTEXT
Website: ${input.websiteUrl}
Current-site context: ${input.websiteSnapshot.slice(0, 4200)}
What already builds trust: ${trustDirection}
Highest-impact improvements: ${improvementDirection}

The result should make the owner immediately think: "Wow, I want my website to look like that."
${retryDirection}`;
}

async function getLogoAsset(uploadedLogo: File | null, logoUrl: string) {
  if (
    uploadedLogo &&
    uploadedLogo.size > 0 &&
    uploadedLogo.size < 12_000_000 &&
    ["image/png", "image/jpeg", "image/webp"].includes(uploadedLogo.type)
  ) {
    return uploadedLogo;
  }
  if (!logoUrl) return null;
  try {
    const response = await fetch(logoUrl, { signal: AbortSignal.timeout(8000) });
    const contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
    if (!response.ok || !["image/png", "image/jpeg", "image/webp"].includes(contentType)) {
      return null;
    }
    const blob = await response.blob();
    if (blob.size > 12_000_000) return null;
    const extension =
      contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    return new File([blob], `brand-logo.${extension}`, { type: contentType });
  } catch {
    return null;
  }
}

async function requestRedesignImage(prompt: string, logoAsset: File | null) {
  if (!process.env.OPENAI_API_KEY) return "";
  const model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5";
  let response: Response;

  if (logoAsset) {
    const body = new FormData();
    body.set("model", model);
    body.set("prompt", prompt);
    body.set("image", logoAsset);
    body.set("size", "1536x1024");
    body.set("quality", "medium");
    body.set("output_format", "webp");
    body.set("input_fidelity", "high");
    response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body,
      signal: AbortSignal.timeout(150000)
    });
  } else {
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        prompt,
        size: "1536x1024",
        quality: "medium",
        output_format: "webp",
        background: "opaque",
        n: 1
      }),
      signal: AbortSignal.timeout(150000)
    });
  }

  if (!response.ok) return "";
  const payload = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const image = payload.data?.[0];
  if (image?.b64_json) return image.b64_json;
  if (image?.url) {
    const imageResponse = await fetch(image.url, { signal: AbortSignal.timeout(30000) });
    if (imageResponse.ok) {
      return Buffer.from(await imageResponse.arrayBuffer()).toString("base64");
    }
  }
  return "";
}

async function reviewRedesignImage(base64: string): Promise<QualityReview> {
  if (!process.env.OPENAI_API_KEY || !base64) {
    return { score: 0, issues: ["Image was unavailable"] };
  }
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_AUDIT_MODEL ?? "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a strict senior creative director reviewing a generated website homepage concept. Return JSON only with score (0-100) and issues (array of concise strings). Score visual polish, premium feel, realism as a usable website, layout hierarchy, typography, calls to action, trust signals, industry relevance, and absence of broken or nonsensical UI. Scores above 78 should be genuinely impressive and sales-worthy."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Review this homepage redesign. Reject it if it resembles a wireframe, presentation, generic template, broken layout, or low-quality AI image."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/webp;base64,${base64}`,
                detail: "low"
              }
            }
          ]
        }
      ]
    });
    const parsed = JSON.parse(
      completion.choices[0]?.message.content ?? "{}"
    ) as Partial<QualityReview>;
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
      issues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 5) : []
    };
  } catch {
    return { score: 80, issues: [] };
  }
}

async function generatePremiumPreview(input: {
  businessName: string;
  websiteUrl: string;
  websiteSnapshot: string;
  audit: AuditResult;
  logoAsset: File | null;
}) {
  const firstPrompt = buildRedesignPrompt({ ...input, hasLogo: Boolean(input.logoAsset) });
  let base64 = await requestRedesignImage(firstPrompt, input.logoAsset);
  if (!base64) return null;

  let review = await reviewRedesignImage(base64);
  if (review.score < 78) {
    const strongerPrompt = buildRedesignPrompt({
      ...input,
      stronger: true,
      qualityIssues: review.issues,
      hasLogo: Boolean(input.logoAsset)
    });
    const retry = await requestRedesignImage(strongerPrompt, input.logoAsset);
    if (retry) {
      const retryReview = await reviewRedesignImage(retry);
      if (retryReview.score >= review.score) {
        base64 = retry;
        review = retryReview;
      }
    }
  }

  return { base64, qualityScore: review.score };
}

async function uploadRedesignPreview(base64: string, email: string) {
  if (!base64 || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return "";
  }
  const bucket = process.env.SUPABASE_PREVIEW_BUCKET ?? "audit-previews";
  const path = `redesigns/${Date.now()}-${email.replace(/[^a-z0-9]/gi, "-")}.webp`;
  const response = await fetch(
    `${process.env.SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "image/webp",
        "x-upsert": "false"
      },
      body: Buffer.from(base64, "base64")
    }
  );
  if (!response.ok) return "";
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
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

    const logoFile = logo instanceof File ? logo : null;
    const websiteSnapshot = await fetchWebsiteSnapshot(websiteUrl);
    const audit = await generateAudit({ businessName, websiteUrl, websiteSnapshot });
    const logoAsset = await getLogoAsset(logoFile, logoUrl);
    const generatedPreview = await generatePremiumPreview({
      businessName,
      websiteUrl,
      websiteSnapshot,
      audit,
      logoAsset
    }).catch(() => null);
    const generatedImageUrl = generatedPreview
      ? await uploadRedesignPreview(generatedPreview.base64, email).catch(() => "")
      : "";
    const redesign = generateRedesign(
      businessName,
      websiteUrl,
      audit,
      generatedImageUrl,
      generatedPreview?.qualityScore
    );
    const submittedAt = new Date().toISOString();
    const logoStoragePath = await uploadLogo(logoFile, email);
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
