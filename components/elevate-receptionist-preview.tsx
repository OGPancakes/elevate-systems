"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  Keyboard,
  Loader2,
  MapPin,
  Mic2,
  PhoneCall,
  Radio,
  Sparkles,
  UserRoundCheck,
  Zap
} from "lucide-react";

type PreviewStatus = "idle" | "dialing" | "ringing" | "talking" | "done" | "error";

const callMoments = [
  {
    speaker: "Maya",
    text: "Hi, this is Maya with Brightline Studio. I can help with questions, availability, or booking a consultation. How can I help today?",
    intent: "Greeting",
    importance: 2,
    fields: { reason: "Opening call", nextStep: "Discover need" },
    goals: [true, false, false, false],
  },
  {
    speaker: "Caller",
    text: "Hi, I wanted to ask about booking a consultation for a home service project this week.",
    intent: "Home services",
    importance: 7,
    fields: { reason: "Home service consultation", urgency: "This week" },
    goals: [true, true, false, false],
  },
  {
    speaker: "Maya",
    text: "Absolutely. I can help with that. What type of project is it, and what day would work best for a quick callback?",
    intent: "Booking request",
    importance: 8,
    fields: { service: "Project intake", nextStep: "Collect timing" },
    goals: [true, true, true, false],
  },
  {
    speaker: "Live note",
    text: "Qualified lead: home services, consultation request, this-week timing, high-intent callback.",
    intent: "Qualified lead",
    importance: 9,
    fields: { status: "Qualified", ownerNote: "Ready for team follow-up" },
    goals: [true, true, true, true],
  },
];

const goals = ["Identify need", "Classify intent", "Score urgency", "Create handoff"];

const statusCopy: Record<PreviewStatus, string> = {
  idle: "Enter your number to launch a private preview session.",
  dialing: "Creating your session and preparing Maya...",
  ringing: "Dialing your phone and opening a live call room.",
  talking: "Maya is listening, scoring, and building the lead.",
  done: "Preview started. Your call room is ready.",
  error: "The preview could not start.",
};

const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Del", "0", "Call"];

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const sessionId = () => `ER-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export function ElevateReceptionistPreview() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<PreviewStatus>("idle");
  const [message, setMessage] = useState(statusCopy.idle);
  const [activeMoment, setActiveMoment] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [session, setSession] = useState("ER-DEMO");

  const digits = useMemo(() => phone.replace(/\D/g, ""), [phone]);
  const canSubmit = digits.length === 10 && status !== "dialing" && status !== "ringing";
  const current = callMoments[Math.min(activeMoment, callMoments.length - 1)];
  const completion = current.goals.filter(Boolean).length;
  const leadFields = [
    { label: "Caller", value: phone || "Waiting for number", Icon: UserRoundCheck },
    { label: "Need", value: current.fields.reason ?? "Listening for need", Icon: Sparkles },
    { label: "Urgency", value: current.fields.urgency ?? "Not scored yet", Icon: Zap },
    { label: "Next step", value: current.fields.nextStep ?? current.fields.ownerNote ?? "Pending", Icon: CalendarCheck },
    { label: "Service", value: current.fields.service ?? current.fields.status ?? "Classifying", Icon: BriefcaseBusiness },
    { label: "Location", value: "Captured if provided", Icon: MapPin },
  ];

  useEffect(() => {
    if (status !== "talking" && status !== "done") return;
    setActiveMoment(0);
    setTypedText("");

    const timers = callMoments.map((moment, index) =>
      window.setTimeout(() => {
        setActiveMoment(index);
        setTypedText(moment.text);
      }, 500 + index * 1500),
    );

    return () => timers.forEach(window.clearTimeout);
  }, [status]);

  const startPreview = async () => {
    if (!canSubmit) return;
    setSession(sessionId());
    setStatus("dialing");
    setMessage(statusCopy.dialing);
    setActiveMoment(0);
    setTypedText("");

    window.setTimeout(() => {
      setStatus("ringing");
      setMessage(statusCopy.ringing);
    }, 650);
    window.setTimeout(() => {
      setStatus("talking");
      setMessage(statusCopy.talking);
    }, 1500);

    try {
      const response = await fetch("/api/receptionist/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json() as { ok?: boolean; mode?: string; error?: string; message?: string };
      if (!response.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? statusCopy.error);
        return;
      }
      window.setTimeout(() => {
        setStatus("done");
        setMessage(data.mode === "demo" ? "Demo call room running. Add Twilio env vars for real outbound calls." : statusCopy.done);
      }, 6400);
    } catch {
      setStatus("error");
      setMessage("Something blocked the preview request. Try again in a moment.");
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void startPreview();
  };

  const tapKey = (key: string) => {
    if (key === "Call") {
      void startPreview();
      return;
    }
    if (key === "Del") {
      setPhone(formatPhone(digits.slice(0, -1)));
      return;
    }
    setPhone(formatPhone(`${digits}${key}`));
  };

  return (
    <div className="relative" id="live-demo">
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-sky-500/20 via-violet-500/15 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-[2.4rem] border border-white/12 bg-[#0b1022]/90 p-5 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="absolute right-[-7rem] top-[-7rem] h-56 w-56 rounded-full bg-sky-400/10 blur-2xl" />
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">Private phone preview</p>
              <h2 className="mt-2 text-2xl font-black">Live AI command center</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Each visitor gets a separate preview room. Watch Maya listen, classify, score, and build the handoff.
              </p>
            </div>
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
              status === "idle" ? "bg-white/10 text-white/60" : status === "error" ? "bg-rose-400/15 text-rose-200" : "bg-emerald-400/15 text-emerald-200"
            }`}>
              {status === "dialing" || status === "ringing" ? <Loader2 className="h-6 w-6 animate-spin" /> : <PhoneCall className="h-6 w-6" />}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-100">
              Session {session}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
              Isolated preview room
            </span>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">
              No restaurant routing
            </span>
          </div>

          <form className="mt-6 rounded-[1.8rem] border border-white/10 bg-black/20 p-4" onSubmit={submit}>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Your phone number</label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-lg font-black tracking-wide text-white outline-none transition focus:border-sky-300/50 focus:bg-white/[0.09]"
                inputMode="tel"
                onChange={(event) => setPhone(formatPhone(event.target.value))}
                placeholder="(555) 123-4567"
                value={phone}
              />
              <button
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-5 py-4 font-black text-white shadow-lg shadow-sky-500/20 transition duration-300 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                disabled={!canSubmit}
                type="submit"
              >
                Call me
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/38">Only enter your own number. By pressing Call me, you agree to receive one demo call.</p>
          </form>

          <div className="mt-5 grid gap-4 xl:grid-cols-[0.74fr_1.26fr]">
            <div className="space-y-4">
              <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-4">
                <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-violet-200">
                  <Keyboard className="h-4 w-4" />
                  Quick keypad
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {keypad.map((key) => (
                    <button
                      className={`rounded-2xl border border-white/10 py-3 text-sm font-black transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0 ${
                        key === "Call" ? "bg-emerald-400/15 text-emerald-100" : "bg-white/[0.05] text-white/70"
                      }`}
                      key={key}
                      onClick={() => tapKey(key)}
                      type="button"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-sky-200">
                    <Radio className="h-4 w-4" />
                    Listening
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">{status}</span>
                </div>
                <div className="mt-5 flex h-20 items-end justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.035] px-4 pb-4">
                  {Array.from({ length: 18 }).map((_, index) => (
                    <span
                      className={`w-1.5 rounded-full bg-gradient-to-t from-violet-400 to-sky-300 transition-all duration-300 ${
                        status === "talking" || status === "done" ? "animate-pulse opacity-90" : "opacity-25"
                      }`}
                      key={index}
                      style={{ height: `${18 + ((index * 13 + activeMoment * 19) % 48)}px`, animationDelay: `${index * 45}ms` }}
                    />
                  ))}
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm font-bold text-white/70">
                  {status === "done" ? <CheckCircle2 className="h-4 w-4 text-emerald-200" /> : <Mic2 className="h-4 w-4 text-sky-200" />}
                  {message}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-sky-200">
                    <BrainCircuit className="h-4 w-4" />
                    Intent
                  </div>
                  <p className="mt-3 text-2xl font-black">{current.intent}</p>
                  <p className="mt-1 text-xs text-white/40">Updated from live conversation</p>
                </div>
                <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-violet-200">
                    <Zap className="h-4 w-4" />
                    Importance
                  </div>
                  <div className="mt-3 flex items-end gap-2">
                    <p className="text-3xl font-black">{current.importance}</p>
                    <p className="pb-1 text-sm font-bold text-white/35">/ 10</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400 transition-all duration-700" style={{ width: `${current.importance * 10}%` }} />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-sky-200">
                    <BriefcaseBusiness className="h-4 w-4" />
                    Live lead handoff
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
                    {completion}/4 goals
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {leadFields.map(({ label, value, Icon }) => (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 transition duration-300 hover:bg-white/[0.06]" key={label}>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/34">
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </div>
                      <p className="mt-2 text-sm font-bold text-white/74">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-violet-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Qualification goals
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {goals.map((goal, index) => (
                    <div
                      className={`flex items-center gap-3 rounded-2xl border p-3 transition duration-500 ${
                        current.goals[index]
                          ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-50"
                          : "border-white/10 bg-black/15 text-white/45"
                      }`}
                      key={goal}
                    >
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        current.goals[index] ? "bg-emerald-300/20" : "bg-white/10"
                      }`}>
                        {current.goals[index] ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </span>
                      <span className="text-sm font-black">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-sky-200">
                  <Radio className="h-4 w-4" />
                  Live transcript
                </div>
                <div className="mt-4 space-y-3">
                  {callMoments.slice(0, status === "idle" ? 0 : activeMoment + 1).map((line, index) => (
                    <div className={`rounded-2xl border p-3 ${
                      line.speaker === "Maya" ? "border-sky-300/20 bg-sky-400/10"
                        : line.speaker === "Live note" ? "border-violet-300/20 bg-violet-400/10"
                          : "border-white/10 bg-white/[0.06]"
                    }`} key={`${line.speaker}-${index}`}>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38">{line.speaker}</p>
                      <p className="mt-1 text-sm leading-6 text-white/74">{index === activeMoment ? typedText : line.text}</p>
                    </div>
                  ))}
                  {status === "idle" && (
                    <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center">
                      <Sparkles className="mx-auto h-6 w-6 text-violet-200" />
                      <p className="mt-3 text-sm leading-6 text-white/45">Start a session to see intent, urgency, goals, and transcript update live.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
