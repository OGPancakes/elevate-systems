import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { ChatMessage, MenuItem } from "@/lib/elevate-orders-types";

export async function POST(request: Request) {
  const body = (await request.json()) as { messages?: ChatMessage[]; menu?: MenuItem[] };
  const messages = body.messages ?? [];
  const menu = body.menu ?? [];

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      message: fallbackResponse(messages.at(-1)?.content ?? ""),
      demo: true,
    });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const menuContext = menu
    .filter((item) => item.available)
    .map((item) => `${item.name} (${item.category}) - $${item.price.toFixed(2)}: ${item.description}${item.vegetarian ? " [vegetarian]" : ""}`)
    .join("\n");

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions: `You are June, a concise and warm restaurant ordering assistant for Juniper & Stone.
Help guests choose only from the menu below. Mention exact item names and prices. Respect dietary
preferences, never invent ingredients, and remind guests with severe allergies to confirm with the
restaurant. Treat the guest's latest message as the current preference, even when it contradicts
an earlier request. Vary recommendations across the menu. When suggesting a meal, explicitly ask
whether you should add the named item or items to the order. Keep each answer under 80 words.

MENU:
${menuContext}`,
      input: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      reasoning: { effort: "low" },
    });

    return NextResponse.json({ message: response.output_text });
  } catch (error) {
    console.error("OpenAI assistant error", error);
    return NextResponse.json({
      message: fallbackResponse(messages.at(-1)?.content ?? ""),
      demo: true,
    });
  }
}

function fallbackResponse(input: string) {
  const request = input.toLowerCase();
  if (request.includes("vegetarian")) {
    return "The Market Veggie Bowl is a filling vegetarian pick at $14. It has herbed farro, roasted vegetables, chickpeas, greens, feta, and green goddess dressing. Want to add a Blood Orange Soda?";
  }
  if (request.includes("spicy")) {
    return "Go for the Hot Honey Pepperoni at $19. It brings cup-and-char pepperoni, pecorino, and a sweet kick of hot honey. Garlic Knots make a great side. How hungry are you?";
  }
  if (request.includes("meat") || request.includes("chicken") || request.includes("filling")) {
    return "For something filling with meat, try the Charred Chicken Bowl at $15.25. Add a Blood Orange Soda for $3.50 and the meal stays under $20 before tax. Would you like me to add both?";
  }
  if (request.includes("$20") || request.includes("under 20")) {
    return "The Roasted Turkey Club is $13.75, leaving room for a $3.50 Blood Orange Soda and keeping you under $20 before tax. Would you like that combination?";
  }
  return "A guest favorite is the Charred Chicken Bowl at $15.25: bright, filling, and balanced with garlic sauce and feta. Are you looking for something lighter, spicy, or vegetarian?";
}
