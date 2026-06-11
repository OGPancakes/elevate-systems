"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  PhoneCall,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type DemoData = {
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
  mode?: "openai" | "fallback";
};

const fallbackDemo: DemoData = {
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
  nextAction: "Send SMS follow-up and create an inspection task for the sales team.",
  mode: "fallback"
};

const messages = [
  { from: "visitor", text: "Hi, I found you on Google. We had storm damage and a leak showed up last night." },
  { from: "ai", text: "I can help. Is this for your home, and are you hoping to schedule an inspection this week?" },
  { from: "visitor", text: "Yes, residential. This week if possible. I can text photos too." },
  { from: "ai", text: "Got it. I will send this to the team with your timeline, roof issue, and SMS preference." }
];

const pipeline = [
  { label: "Visitor starts chat", icon: MessageCircle },
  { label: "AI qualifies intent", icon: Bot },
  { label: "Lead score updates", icon: Target },
  { label: "Personal SMS drafted", icon: Send }
];

function ElevateLeadsLogo() {
  return (
    <div className="flex items-center gap-3" aria-label="Elevate Leads product logo">
      <div className="relative flex h-14 w-24 items-center justify-center overflow-hidden border border-emerald-300/20 bg-emerald-300/[0.045] shadow-[0_0_34px_rgba(45,212,191,0.18)] sm:h-16 sm:w-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(163,230,53,0.2),transparent_45%)]" />
        <Image
          alt="Elevate Systems logo adapted for Elevate Leads"
          className="relative h-12 w-20 object-contain saturate-150 hue-rotate-[72deg] sm:h-14 sm:w-24"
          height={64}
          src="/elevate-logo-transparent.png"
          width={112}
          priority
        />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/80">Elevate Systems</p>
        <p className="text-xl font-semibold leading-none text-white">Elevate Leads</p>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const background = `conic-gradient(rgb(52, 211, 153) ${score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`;
  return (
    <div className="relative grid h-36 w-36 place-items-center rounded-full" style={{ background }}>
      <div className="grid h-28 w-28 place-items-center rounded-full border border-white/10 bg-[#04100f] shadow-inner">
        <div className="text-center">
          <p className="text-4xl font-semibold text-white">{score}</p>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-emerald-200/70">Lead score</p>
        </div>
      </div>
    </div>
  );
}

function toneClass(tone: "high" | "medium" | "low") {
  if (tone === "high") return "border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-100";
  if (tone === "medium") return "border-teal-300/20 bg-teal-300/[0.07] text-teal-100";
  return "border-white/10 bg-white/[0.04] text-white/65";
}

export default function ElevateLeadsApp() {
  const [demo, setDemo] = useState<DemoData>(fallbackDemo);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let active = true;
    const loadDemo = async () => {
      try {
        const response = await fetch("/api/elevate-leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessType: "roofing company",
            visitorMessage:
              "We had storm damage and a leak showed up last night. Can someone inspect it this week?"
          })
        });
        const data = (await response.json()) as DemoData;
        if (active) setDemo({ ...fallbackDemo, ...data });
      } catch {
        if (active) setDemo(fallbackDemo);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDemo();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % pipeline.length);
    }, 2100);
    return () => window.clearInterval(timer);
  }, []);

  const scoreWidth = useMemo(() => `${Math.max(8, Math.min(100, demo.score))}%`, [demo.score]);

  return (
    <main className="elevate-leads-demo relative min-h-screen overflow-hidden bg-[#020706] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(20,184,166,0.16),transparent_28rem),radial-gradient(circle_at_84%_18%,rgba(163,230,53,0.12),transparent_24rem)]" />
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-300/45 to-transparent" />

      <header className="relative z-20 border-b border-white/10 bg-[#020706]/88 backdrop-blur-xl">
        <nav className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 py-3">
          <ElevateLeadsLogo />
          <div className="flex items-center gap-3">
            <Link className="animated-link hidden items-center gap-2 text-sm text-white/50 hover:text-white sm:flex" href="/demos">
              <ArrowLeft className="h-4 w-4" />
              Product demos
            </Link>
            <Button asChild>
              <Link href="/book">
                Book a Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hero-reveal">
          <p className="text-sm font-medium text-emerald-300">Lead generation AI inside the Elevate Systems family</p>
          <h1 className="mt-5 text-balance text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            Turn conversations into qualified leads.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/58">
            Elevate Leads captures visitor intent, qualifies the opportunity, scores the lead, and drafts a personal follow-up before the moment goes cold.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/book">
                Book a Demo
                <PhoneCall className="h-5 w-5" />
              </Link>
            </Button>
            <Link className="animated-link flex min-h-12 items-center gap-2 px-2 text-sm font-medium text-emerald-200/70 hover:text-white" href="#demo-flow">
              Watch the lead flow
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-px overflow-hidden border border-emerald-300/15 bg-emerald-300/15">
            {[
              ["Lead score", `${demo.score}%`],
              ["Response", "SMS ready"],
              ["Mode", loading ? "Loading" : demo.mode === "openai" ? "AI live" : "Demo safe"]
            ].map(([label, value]) => (
              <div className="bg-[#04100f]/92 p-4" key={label}>
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-emerald-200/55">{label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative" id="demo-flow">
          <div className="absolute -inset-6 bg-emerald-400/10 blur-[90px]" />
          <div className="relative grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
            <PhonePanel />
            <DashboardPanel demo={demo} scoreWidth={scoreWidth} />
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-white/[0.018]">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-medium text-emerald-300">How the demo works</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">One sales handoff, fully prepared.</h2>
              <p className="mt-5 max-w-xl leading-8 text-white/52">
                The product identity shifts toward growth, sales, and communication while keeping the Elevate layout rhythm, motion, spacing, and logo structure intact.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pipeline.map((item, index) => (
                <div
                  className={`leads-card flex min-h-28 items-center gap-4 border p-5 ${activeStep === index ? "is-active border-emerald-300/35" : "border-white/10"}`}
                  key={item.label}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center border border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-300">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-white/45">Step {index + 1} in the Elevate Leads qualification flow.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="leads-card border border-white/10 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-300" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200/70">AI generated follow-up</p>
            </div>
            <p className="mt-6 text-xl leading-8 text-white/82">{demo.followUp}</p>
          </div>
          <div className="leads-card border border-emerald-300/20 p-6 sm:p-8">
            <p className="text-sm font-medium text-emerald-300">Recommended next action</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{demo.nextAction}</h2>
            <p className="mt-5 leading-8 text-white/50">
              Show Gabe how Elevate Leads can sit under Elevate Systems as a focused sales product: same parent quality, distinct product color, and a practical small-business workflow.
            </p>
            <Button asChild className="mt-7" size="lg">
              <Link href="/book">
                Book a Demo
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <style jsx>{`
        .elevate-leads-demo .leads-card {
          position: relative;
          overflow: hidden;
          border-radius: 0.8rem;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.018));
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
          transition: transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .elevate-leads-demo .leads-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          background: radial-gradient(circle at 18% 0%, rgba(52, 211, 153, 0.16), transparent 45%);
          transition: opacity 0.3s ease;
        }
        .elevate-leads-demo .leads-card > * {
          position: relative;
        }
        .elevate-leads-demo .leads-card:hover,
        .elevate-leads-demo .leads-card.is-active {
          transform: translateY(-6px);
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42), 0 0 45px rgba(45, 212, 191, 0.1);
        }
        .elevate-leads-demo .leads-card:hover::before,
        .elevate-leads-demo .leads-card.is-active::before {
          opacity: 1;
        }
        .elevate-leads-demo .message-row {
          animation: message-in 0.55s both cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .elevate-leads-demo .pulse-line {
          animation: pulse-line 2.4s ease-in-out infinite;
        }
        @keyframes message-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-line {
          0%, 100% { opacity: 0.35; transform: scaleX(0.82); }
          50% { opacity: 1; transform: scaleX(1); }
        }
      `}</style>
    </main>
  );
}

function PhonePanel() {
  return (
    <div className="leads-card border border-white/10 p-3">
      <div className="rounded-[1.35rem] border border-white/10 bg-[#05110f] p-3 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-2 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-300/12 text-emerald-200">
              <UserRound className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Maya Johnson</p>
              <p className="text-xs text-emerald-200/55">SMS qualified by AI</p>
            </div>
          </div>
          <PhoneCall className="h-4 w-4 text-emerald-300" />
        </div>
        <div className="space-y-3 px-1 py-5">
          {messages.map((message, index) => (
            <div
              className={`message-row flex ${message.from === "visitor" ? "justify-start" : "justify-end"}`}
              key={message.text}
              style={{ animationDelay: `${index * 170}ms` }}
            >
              <p
                className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                  message.from === "visitor"
                    ? "rounded-bl-sm bg-white/[0.08] text-white/78"
                    : "rounded-br-sm bg-emerald-300 text-[#03201a]"
                }`}
              >
                {message.text}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/38">
          <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
          AI is preparing the sales handoff
        </div>
      </div>
    </div>
  );
}

function DashboardPanel({ demo, scoreWidth }: { demo: DemoData; scoreWidth: string }) {
  return (
    <div className="leads-card border border-emerald-300/20 p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300/75">Lead dashboard</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{demo.lead.business}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/50">{demo.summary}</p>
        </div>
        <ScoreRing score={demo.score} />
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-300 transition-all duration-700" style={{ width: scoreWidth }} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {demo.qualification.map((item) => (
          <div className={`border p-3 ${toneClass(item.tone)}`} key={item.label}>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] opacity-65">{item.label}</p>
            <p className="mt-2 text-sm font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        {demo.scoreReasoning.map((reason, index) => (
          <div className="flex gap-3 border border-white/10 bg-white/[0.035] p-3" key={reason}>
            <span className="grid h-8 w-8 shrink-0 place-items-center border border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-300">
              {index === 0 ? <TrendingUp className="h-4 w-4" /> : index === 1 ? <Zap className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            </span>
            <p className="text-sm leading-6 text-white/58">{reason}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 border border-teal-300/15 bg-teal-300/[0.045] p-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <span className="grid h-11 w-11 place-items-center border border-teal-300/20 bg-teal-300/[0.08] text-teal-200">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">{demo.lead.intent}</p>
          <p className="mt-1 text-xs leading-5 text-white/45">{demo.lead.urgency} · {demo.lead.channel}</p>
        </div>
      </div>

      <div className="pulse-line mt-5 h-px origin-left bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
      <div className="mt-5 flex items-center justify-between gap-3 text-xs text-white/42">
        <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-300" /> Live qualification signal</span>
        <span className="flex items-center gap-2"><Target className="h-4 w-4 text-lime-300" /> Sales-ready</span>
      </div>
    </div>
  );
}
