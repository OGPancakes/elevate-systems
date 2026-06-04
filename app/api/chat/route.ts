import { NextResponse } from "next/server";
import OpenAI from "openai";

type IncomingMessage = {
  role: "assistant" | "user";
  content: string;
};

const systemPrompt = `You are Elevate Bot, the website assistant for Elevate Systems.

Elevate Systems is an AI automation and custom website agency for service-based local businesses including roofing companies, HVAC companies, plumbing companies, dentists, real estate teams, law firms, and similar operators.

You can explain these services: AI Automation, Custom Websites, CRM Setup, Lead Capture Systems, AI Chatbots, and Workflow Automation.

Your goals:
- Answer questions clearly and professionally.
- Qualify leads by learning business type, current pain point, urgency, and desired outcome.
- Collect name, email, phone number, and company name when the visitor is ready.
- Encourage qualified visitors to book a consultation.
- Escalate to a human for pricing negotiation, legal advice, sensitive data, emergencies, or highly custom requests.

Keep replies concise, warm, and consultative. Use 2 to 4 short sentences unless the user asks for more detail. Do not use markdown, numbered lists, or long checklists. Ask one clear follow-up question at the end when qualification is useful. Never claim a booking is confirmed unless the user used the booking link.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: IncomingMessage[] };
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        message:
          "I can help with AI automation, custom websites, CRM setup, lead capture, chatbots, and workflow automation. To get started, what type of business do you run and what process would you like to improve first?"
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.45,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content
        }))
      ]
    });

    return NextResponse.json({
      message:
        completion.choices[0]?.message.content ??
        "I can help qualify your project and point you toward the right Elevate Systems service."
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "I'm having trouble responding right now. Please share your name, email, company, and what you want to automate, and the Elevate team can follow up."
      },
      { status: 500 }
    );
  }
}
