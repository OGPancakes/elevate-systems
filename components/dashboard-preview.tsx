"use client";

import {
  Activity,
  Bot,
  CalendarCheck,
  MessageSquareText,
  TrendingUp,
  Workflow
} from "lucide-react";

const pipeline = [
  { label: "New leads", value: "148", trend: "+31%" },
  { label: "Booked calls", value: "42", trend: "+18%" },
  { label: "AI replies", value: "1.8k", trend: "94%" }
];

const automations = [
  "Website lead captured",
  "Elevate Bot qualifies intent",
  "HubSpot contact enriched",
  "Make.com workflow launched",
  "Consultation booked"
];

export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[640px] animate-float">
      <div className="absolute -inset-5 rounded-[2rem] bg-sky-500/20 blur-3xl" />
      <div className="glass dashboard-grid relative overflow-hidden rounded-2xl p-4 sm:p-5">
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-400/20 text-sky-300">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Automation Command</p>
              <p className="text-xs text-white/50">Live operations overview</p>
            </div>
          </div>
          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-200">
            Online
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {pipeline.map((item) => (
            <div key={item.label} className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/50">{item.label}</p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-semibold text-white">{item.value}</span>
                <span className="text-xs font-medium text-sky-300">{item.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Lead flow</p>
              <TrendingUp className="h-4 w-4 text-sky-300" />
            </div>
            <div className="flex h-44 items-end gap-2">
              {[34, 54, 42, 72, 60, 88, 76, 96, 82, 112, 104, 132].map((height, index) => (
                <div
                  key={height + index}
                  className="min-w-0 flex-1 rounded-t bg-gradient-to-t from-blue-700 to-cyan-300 opacity-90"
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Workflow className="h-4 w-4 text-sky-300" />
              <p className="text-sm font-semibold text-white">Active workflow</p>
            </div>
            <div className="space-y-3">
              {automations.map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-300/20 bg-sky-300/10 text-[11px] text-sky-200">
                    {index + 1}
                  </span>
                  <span className="text-xs text-white/70">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Bot, label: "AI qualification" },
            { icon: MessageSquareText, label: "Instant follow-up" },
            { icon: CalendarCheck, label: "Booked consults" }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-3">
              <item.icon className="h-4 w-4 text-sky-300" />
              <span className="text-xs font-medium text-white/70">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
