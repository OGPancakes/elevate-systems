import {
  Bot,
  DatabaseZap,
  Globe,
  MessageSquareText,
  Sparkles,
  Workflow
} from "lucide-react";

export const services = [
  {
    icon: Sparkles,
    title: "AI Automation",
    description:
      "Automated lead handling, customer replies, intake workflows, and internal task routing."
  },
  {
    icon: Globe,
    title: "Custom Websites",
    description:
      "High-converting sites built for trust, speed, mobile polish, and clear consultation paths."
  },
  {
    icon: DatabaseZap,
    title: "CRM Setup",
    description:
      "HubSpot pipelines, contact properties, lifecycle stages, and source tracking configured cleanly."
  },
  {
    icon: MessageSquareText,
    title: "Lead Capture Systems",
    description:
      "Forms, chat, call prompts, automations, and follow-up sequences that prevent lost inquiries."
  },
  {
    icon: Bot,
    title: "AI Chatbots",
    description:
      "Website assistants that answer service questions, qualify leads, and escalate when needed."
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    description:
      "Make.com automations that connect websites, CRMs, notifications, calendars, and teams."
  }
];

export const audiences = [
  "Roofing companies",
  "HVAC teams",
  "Plumbing companies",
  "Dental practices",
  "Real estate teams",
  "Law firms"
];

export const testimonials = [
  {
    quote:
      "Elevate made our follow-up process feel instant. Leads now hit the CRM, get a reply, and land on our calendar without our office chasing every form.",
    name: "Operations Director",
    company: "Regional HVAC Group"
  },
  {
    quote:
      "The website feels like a modern software company built it, but the workflows are practical for how our team actually works every day.",
    name: "Managing Partner",
    company: "Local Law Firm"
  },
  {
    quote:
      "Their chatbot does more than answer questions. It qualifies, collects details, and gives our sales team clean context before the first call.",
    name: "Founder",
    company: "Home Services Brand"
  }
];

export const faqs = [
  {
    question: "What kind of businesses do you work with?",
    answer:
      "We focus on service-based companies such as roofing, HVAC, plumbing, dentists, real estate teams, law firms, and similar local operators."
  },
  {
    question: "Can you connect our website to HubSpot?",
    answer:
      "Yes. We can capture leads, create contacts, assign lifecycle stages, trigger follow-ups, and notify your team through HubSpot workflows."
  },
  {
    question: "Does the chatbot use OpenAI?",
    answer:
      "Yes. Elevate Bot is designed to use the OpenAI API with a custom system prompt, qualification flow, and escalation rules."
  },
  {
    question: "Can you automate appointment booking?",
    answer:
      "Yes. We can route qualified prospects to a consultation link and connect booking events to your CRM and internal notifications."
  }
];
