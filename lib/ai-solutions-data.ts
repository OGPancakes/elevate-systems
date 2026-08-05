import {
  Bot,
  Headphones,
  MessageSquareMore,
  MonitorSmartphone,
  ShoppingBag,
  Workflow
} from "lucide-react";

export const aiSolutionServices = [
  {
    id: "website-assistant",
    title: "AI Website Assistant",
    shortTitle: "Website Assistant",
    description:
      "Answers customer questions, qualifies visitors, captures details, and routes high-intent conversations to your team.",
    outcome: "A faster, more helpful website experience without requiring someone to watch the inbox all day.",
    icon: Bot,
    signals: ["24/7 answers", "Lead qualification", "CRM handoff"]
  },
  {
    id: "receptionist",
    title: "AI Receptionist",
    shortTitle: "AI Receptionist",
    description:
      "Handles common calls, collects the reason for contact, answers routine questions, and helps schedule appointments.",
    outcome: "Fewer missed opportunities and less time spent repeatedly answering the same questions.",
    icon: Headphones,
    signals: ["Call handling", "Appointment routing", "Human escalation"]
  },
  {
    id: "ordering",
    title: "AI Ordering System",
    shortTitle: "Smart Ordering",
    description:
      "A guided iPad kiosk and digital ordering flow for restaurants, food trucks, counters, and service desks.",
    outcome: "A smoother ordering experience with clearer selections, useful add-ons, and fewer manual steps.",
    icon: ShoppingBag,
    signals: ["iPad kiosk", "Guided upsells", "Order routing"]
  },
  {
    id: "follow-up",
    title: "Automated Lead Follow-Up",
    shortTitle: "Lead Follow-Up",
    description:
      "Responds quickly after form submissions, missed calls, estimates, and consultations using coordinated email and SMS workflows.",
    outcome: "Consistent follow-up that keeps potential customers moving without relying on memory or spreadsheets.",
    icon: MessageSquareMore,
    signals: ["Fast response", "Email + SMS", "Pipeline updates"]
  },
  {
    id: "website",
    title: "AI-Ready Website",
    shortTitle: "Smart Website",
    description:
      "A fast, modern website built around clear customer journeys, stronger calls to action, and automation-ready lead capture.",
    outcome: "A more professional digital presence that makes it easier for visitors to understand, trust, and contact the business.",
    icon: MonitorSmartphone,
    signals: ["Mobile-first", "Conversion paths", "Fast performance"]
  },
  {
    id: "workflow",
    title: "Workflow Automation",
    shortTitle: "Operations",
    description:
      "Connects forms, CRM records, calendars, notifications, documents, and internal tasks into a reliable operating system.",
    outcome: "Less repetitive administration and a clearer handoff between marketing, sales, and service delivery.",
    icon: Workflow,
    signals: ["CRM sync", "Internal routing", "Task automation"]
  }
] as const;

export const solutionTiers = [
  {
    id: "custom-ai-operations",
    name: "Custom AI Operations",
    setupRange: "$100-$500",
    monthlyRange: "$100-$500/mo",
    price: "Custom",
    suffix: "setup + monthly subscription",
    description: "Every project is scoped around the business, the workflow, and how much AI support is actually needed.",
    features: [
      "Custom AI assistants, chatbots, receptionists, or follow-up systems",
      "Website, CRM, forms, calendar, email, and workflow integrations",
      "Setup fee is quoted separately from the monthly subscription",
      "Monthly cost depends on usage, integrations, support, and optimization",
      "Final scope is confirmed before work begins"
    ],
    priceEnv: "STRIPE_CUSTOM_AI_OPERATIONS_PRICE_ID",
    featured: true
  }
] as const;
