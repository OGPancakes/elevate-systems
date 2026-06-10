"use client";

import { useState } from "react";
import { Bot, CalendarCheck, Check, MessageSquareText, Workflow } from "lucide-react";

const workflow = [
  { label: "New inquiry captured", icon: MessageSquareText },
  { label: "AI qualifies the request", icon: Bot },
  { label: "Follow-up sent automatically", icon: Workflow },
  { label: "Consultation scheduled", icon: CalendarCheck }
];

export function DashboardPreview() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <div
      className="relative mx-auto w-full max-w-[580px] py-10"
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        setTilt({ x: y * -5, y: x * 7 });
      }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center [perspective:900px]">
        <div className="flow-ring flow-ring-one absolute h-[72%] w-[88%] rounded-[50%] border border-sky-300/20" />
        <div className="flow-ring flow-ring-two absolute h-[92%] w-[68%] rounded-[50%] border border-blue-400/15" />
        <div className="absolute h-2/3 w-2/3 rounded-full bg-sky-500/10 blur-3xl" />
      </div>
      <div
        className="hero-tilt relative"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div className="animate-float dashboard-grid relative overflow-hidden border border-white/10 bg-[#07101c]/90 shadow-glow">
          <div
            className="pointer-events-none absolute inset-0 z-20 opacity-50 transition-transform duration-300"
            style={{
              background:
                "linear-gradient(115deg, transparent 28%, rgba(125,211,252,0.1) 48%, transparent 68%)",
              transform: `translateX(${tilt.y * 4}%)`
            }}
          />
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">Lead response system</p>
              <p className="mt-1 text-xs text-white/40">One connected customer journey</p>
            </div>
            <span className="flex items-center gap-2 text-xs text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Active
            </span>
          </div>

          <div className="p-5 sm:p-7">
            <div className="mb-6 flex items-end justify-between border-b border-white/10 pb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/35">Response status</p>
                <p className="mt-2 text-3xl font-semibold text-white">Handled</p>
              </div>
              <p className="max-w-48 text-right text-sm leading-6 text-white/45">
                The right message reaches the right person without manual routing.
              </p>
            </div>

            <div>
              {workflow.map((item, index) => (
                <div
                  className="flex items-center gap-4 border-b border-white/10 py-4 last:border-0"
                  key={item.label}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-sky-300/20 bg-sky-300/10 text-sky-300">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm text-white/70">{item.label}</span>
                  <span className="flex items-center gap-2 text-xs text-white/30">
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    {index === workflow.length - 1 ? "Ready" : "Complete"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
