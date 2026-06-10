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
    id: "launch",
    name: "AI Launch",
    price: "$1,500",
    suffix: "one-time setup",
    description: "A focused first automation for a business ready to remove one expensive bottleneck.",
    features: [
      "One AI assistant or workflow",
      "Lead capture integration",
      "Basic CRM or email routing",
      "Launch configuration",
      "30 days of optimization"
    ],
    priceEnv: "STRIPE_AI_LAUNCH_PRICE_ID",
    featured: false
  },
  {
    id: "growth",
    name: "AI Growth System",
    price: "$3,500",
    suffix: "starting investment",
    description: "A connected customer journey for teams that need faster response and stronger follow-up.",
    features: [
      "Website assistant or receptionist",
      "Automated lead follow-up",
      "CRM pipeline integration",
      "Booking and notification flows",
      "90 days of optimization"
    ],
    priceEnv: "STRIPE_AI_GROWTH_PRICE_ID",
    featured: true
  },
  {
    id: "scale",
    name: "Custom AI Operations",
    price: "Custom",
    suffix: "scoped around your workflow",
    description: "A tailored system for multi-location, high-volume, or operationally complex businesses.",
    features: [
      "Multi-workflow architecture",
      "Custom integrations",
      "Ordering or kiosk experiences",
      "Advanced reporting",
      "Ongoing support options"
    ],
    priceEnv: "STRIPE_AI_SCALE_PRICE_ID",
    featured: false
  }
] as const;
