"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  CalendarCheck,
  Check,
  MessageSquareText,
  Play,
  RefreshCw,
  UserRoundCheck,
  Workflow
} from "lucide-react";

import { Button } from "@/components/ui/button";

const scenarios = [
  {
    industry: "Roofing",
    lead: "Storm damage estimate",
    customer: "Jordan M.",
    message: "A storm damaged several shingles last night. Can someone take a look this week?",
    reply: "Absolutely. I can collect a few details and find an estimate time that works for you."
  },
  {
    industry: "Dental",
    lead: "New patient appointment",
    customer: "Taylor R.",
    message: "I need a cleaning and wanted to know if you are accepting new patients.",
    reply: "Yes, we are. I can help you find an available new-patient appointment."
  },
  {
    industry: "Legal",
    lead: "Consultation request",
    customer: "Morgan L.",
    message: "I have a contract dispute and would like to speak with someone about my options.",
    reply: "I can gather the key details and route your request to the right attorney for review."
  }
];

const stages = [
  { label: "Inquiry captured", detail: "Website", icon: MessageSquareText },
  { label: "Intent qualified", detail: "Elevate AI", icon: Bot },
  { label: "Contact routed", detail: "CRM", icon: Workflow },
  { label: "Call requested", detail: "Calendar", icon: CalendarCheck }
];

export function AutomationDemo() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [activeStage, setActiveStage] = useState(-1);
  const scenario = scenarios[scenarioIndex];
  const running = activeStage >= 0 && activeStage < stages.length;
  const complete = activeStage === stages.length;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setActiveStage((current) => current + 1), 900);
    return () => window.clearTimeout(timer);
  }, [activeStage, running]);

  function runDemo() {
    setActiveStage(0);
  }

  function chooseScenario(index: number) {
    setScenarioIndex(index);
    setActiveStage(-1);
  }

  return (
    <section className="border-y border-white/10 bg-white/[0.018]">
      <div className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-sky-300">See the system work</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              One inquiry. Four automatic steps.
            </h2>
          </div>
          <p className="max-w-2xl leading-8 text-white/50">
            Choose a business and watch a customer request move from first message to a qualified
            consultation without manual routing.
          </p>
        </div>

        <div className="mt-12 overflow-hidden border border-white/10 bg-[#060c16]">
          <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex gap-1" aria-label="Demo industry">
              {scenarios.map((item, index) => (
                <button
                  className={`min-h-10 px-4 text-sm font-medium transition ${
                    scenarioIndex === index
                      ? "bg-sky-400 text-slate-950"
                      : "text-white/45 hover:bg-white/5 hover:text-white"
                  }`}
                  key={item.industry}
                  onClick={() => chooseScenario(index)}
                  type="button"
                >
                  {item.industry}
                </button>
              ))}
            </div>
            <Button disabled={running} onClick={runDemo} variant={complete ? "secondary" : "default"}>
              {complete ? <RefreshCw className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              {complete ? "Replay Journey" : running ? "System Running" : "Run Live Demo"}
            </Button>
          </div>

          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/30">Incoming lead</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{scenario.lead}</h3>
                  <p className="mt-1 text-sm text-white/40">{scenario.customer} / just now</p>
                </div>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    activeStage >= 0 ? "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" : "bg-white/20"
                  }`}
                />
              </div>

              <div className="mt-8 border-l-2 border-white/10 pl-5">
                <p className="leading-7 text-white/65">&ldquo;{scenario.message}&rdquo;</p>
              </div>

              <div
                className={`mt-8 overflow-hidden border border-sky-300/15 bg-sky-300/[0.055] transition-all duration-500 ${
                  activeStage >= 1 ? "max-h-48 p-5 opacity-100" : "max-h-0 p-0 opacity-0"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-sky-300">
                  <Bot className="h-4 w-4" />
                  AI response
                </div>
                <p className="mt-3 text-sm leading-6 text-white/65">{scenario.reply}</p>
              </div>
            </div>

            <div className="relative p-6 sm:p-8">
              <div className="absolute bottom-8 left-[3.2rem] top-8 w-px bg-white/10 sm:left-[4.2rem]" />
              <div className="space-y-1">
                {stages.map((stage, index) => {
                  const done = activeStage > index;
                  const active = activeStage === index;
                  return (
                    <div
                      className={`relative flex min-h-[76px] items-center gap-5 transition-all duration-500 ${
                        done || active ? "opacity-100" : "opacity-30"
                      }`}
                      key={stage.label}
                    >
                      <span
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center border transition-all duration-500 ${
                          done
                            ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-300"
                            : active
                              ? "border-sky-300 bg-sky-300 text-slate-950 shadow-glow"
                              : "border-white/10 bg-[#060c16] text-white/35"
                        }`}
                      >
                        {done ? <Check className="h-5 w-5" /> : <stage.icon className="h-5 w-5" />}
                      </span>
                      <div className="flex flex-1 items-center justify-between gap-4 border-b border-white/10 py-5">
                        <div>
                          <p className="font-medium text-white">{stage.label}</p>
                          <p className="mt-1 text-xs text-white/35">{stage.detail}</p>
                        </div>
                        <span className="text-xs text-white/30">
                          {done ? "Complete" : active ? "Processing" : "Waiting"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                className={`mt-6 flex items-center gap-4 border border-emerald-300/20 bg-emerald-300/[0.06] p-4 transition-all duration-500 ${
                  complete ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                <UserRoundCheck className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-sm font-medium text-white">Ready for your team</p>
                  <p className="mt-1 text-xs text-white/40">Qualified context saved with the lead.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
