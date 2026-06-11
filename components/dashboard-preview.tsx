"use client";

import { Activity, Bot, CalendarCheck, Check, Workflow } from "lucide-react";

const automations = [
  "Website lead captured",
  "Elevate Bot qualifies intent",
  "CRM contact created",
  "Follow-up sent",
  "Consultation booked"
];

export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[620px] animate-float">
      <div className="absolute -inset-5 bg-sky-500/15 blur-3xl" />
      <div className="dashboard-grid relative overflow-hidden border border-white/10 bg-[#07101c]/92 p-5 shadow-glow sm:p-6">
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center bg-sky-400/10 text-sky-300">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Automation Command</p>
              <p className="text-xs text-white/40">One connected customer journey</p>
            </div>
          </div>
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Online
          </span>
        </div>

        <div className="grid gap-6 py-3 sm:grid-cols-[0.72fr_1.28fr] sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">New inquiry</p>
            <p className="mt-3 text-3xl font-semibold text-white">Handled</p>
            <p className="mt-3 text-sm leading-6 text-white/45">
              A customer request moves from website to booked call automatically.
            </p>
          </div>
          <div className="border-t border-white/10 sm:border-l sm:border-t-0 sm:pl-6">
            {automations.map((item, index) => (
              <div className="flex items-center gap-3 border-b border-white/10 py-3 last:border-0" key={item}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-sky-300/15 bg-sky-300/[0.07] text-sky-300">
                  {index === 1 ? (
                    <Bot className="h-3.5 w-3.5" />
                  ) : index === 4 ? (
                    <CalendarCheck className="h-3.5 w-3.5" />
                  ) : (
                    <Workflow className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="flex-1 text-xs text-white/65">{item}</span>
                <Check className="h-3.5 w-3.5 text-emerald-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
