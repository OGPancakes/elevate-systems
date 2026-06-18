import { NextResponse } from "next/server";
import OpenAI from "openai";

type ElevateLeadsDemo = {
  lead: {
    name: string;
    business: string;
    channel: string;
    intent: string;
    urgency: string;
    budgetSignal: string;
  };
  summary: string;
  score: number;
  scoreReasoning: string[];
  qualification: Array<{ label: string; value: string; tone: "high" | "medium" | "low" }>;
  followUp: string;
  nextAction: string;
};

const fallbackDemo: ElevateLeadsDemo = {
  lead: {
    name: "Maya Johnson",
    business: "Summit Peak Roofing",
    channel: "Website chat to SMS",
    intent: "Needs an estimate for storm damage and asked about availability this week.",
    urgency: "High - roof leak after recent rain",
    budgetSignal: "Insurance claim likely, homeowner is ready to schedule inspection"
  },
  summary:
    "Maya looks like a strong service lead for a local roofing company. She has a clear problem, a short timeline, and enough context for the team to respond with a specific inspection offer instead of a generic callback.",
  score: 86,
  scoreReasoning: [
    "Clear purchase intent: she requested an estimate and mentioned active storm damage.",
    "High urgency: the issue is tied to a leak after recent rain, making speed important.",
    "Good contact path: she agreed to SMS updates, so follow-up can happen quickly."
  ],
  qualification: [
    { label: "Need", value: "Storm damage inspection", tone: "high" },
    { label: "Timeline", value: "This week", tone: "high" },
    { label: "Fit", value: "Residential roofing", tone: "high" },
    { label: "Follow-up", value: "SMS preferred", tone: "medium" }
  ],
  followUp:
    "Hi Maya, this is Gabe with Summit Peak Roofing. I saw your note about the leak after the storm. We can take a look this week and document anything needed for insurance. Would tomorrow afternoon or Friday morning work better for a quick inspection?",
  nextAction: "Send SMS follow-up and create an inspection task for the sales team."
};

function safeDemo(value: unknown): ElevateLeadsDemo {
  if (!value || typeof value !== "object") return fallbackDemo;
  const data = value as Partial<ElevateLeadsDemo>;
  const lead = data.lead && typeof data.lead === "object" ? data.lead : fallbackDemo.lead;
  return {
    lead: {
      name: String(lead.name || fallbackDemo.lead.name).slice(0, 80),
      business: String(lead.business || fallbackDemo.lead.business).slice(0, 100),
      channel: String(lead.channel || fallbackDemo.lead.channel).slice(0, 100),
      intent: String(lead.intent || fallbackDemo.lead.intent).slice(0, 220),
      urgency: String(lead.urgency || fallbackDemo.lead.urgency).slice(0, 140),
      budgetSignal: String(lead.budgetSignal || fallbackDemo.lead.budgetSignal).slice(0, 180)
    },
    summary: String(data.summary || fallbackDemo.summary).slice(0, 520),
    score: Math.max(1, Math.min(100, Math.round(Number(data.score) || fallbackDemo.score))),
    scoreReasoning: Array.isArray(data.scoreReasoning)
      ? data.scoreReasoning.slice(0, 3).map((item) => String(item).slice(0, 180))
      : fallbackDemo.scoreReasoning,
    qualification: Array.isArray(data.qualification)
      ? data.qualification.slice(0, 4).map((item) => ({
          label: String(item.label || "Signal").slice(0, 40),
          value: String(item.value || "Qualified").slice(0, 80),
          tone: item.tone === "low" ? "low" : item.tone === "medium" ? "medium" : "high"
        }))
      : fallbackDemo.qualification,
    followUp: String(data.followUp || fallbackDemo.followUp).slice(0, 520),
    nextAction: String(data.nextAction || fallbackDemo.nextAction).slice(0, 160)
  };
}

export async function POST(request: Request) {
  let businessType = "local service business";
  let visitorMessage = "I need help this week and want to know pricing and availability.";

  try {
    const body = (await request.json()) as { businessType?: string; visitorMessage?: string };
    businessType = String(body.businessType || businessType).slice(0, 120);
    visitorMessage = String(body.visitorMessage || visitorMessage).slice(0, 500);
  } catch {
    // Keep the visual demo usable if the caller sends no body.
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ ...fallbackDemo, mode: "fallback" });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_AUDIT_MODEL ?? "gpt-4o-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Elevate Leads, a premium lead qualification AI inside the Elevate Systems product family. Return JSON only with: lead {name, business, channel, intent, urgency, budgetSignal}, summary, score 1-100, scoreReasoning array of 3 strings, qualification array of 4 objects {label,value,tone high|medium|low}, followUp, nextAction. Make it realistic for a small business sales team. Do not promise guaranteed revenue or outcomes."
        },
        {
          role: "user",
          content: `Business type: ${businessType}\nVisitor message: ${visitorMessage}\nCreate a realistic demo lead summary, score reasoning, and personal SMS follow-up.`
        }
      ]
    });

    const raw = completion.choices[0]?.message.content ?? "{}";
    return NextResponse.json({ ...safeDemo(JSON.parse(raw)), mode: "openai" });
  } catch {
    return NextResponse.json({ ...fallbackDemo, mode: "fallback" });
  }
}
