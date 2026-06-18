"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Keyboard, Loader2, Mic2, PhoneCall, Radio, Sparkles } from "lucide-react";

type PreviewStatus = "idle" | "dialing" | "ringing" | "talking" | "done" | "error";

const script = [
  { speaker: "Maya", text: "Hi, this is Maya with Brightline Studio. I can help with questions, availability, or booking a consultation. How can I help today?" },
  { speaker: "Caller", text: "Hi, I wanted to ask about booking a consultation sometime this week." },
  { speaker: "Maya", text: "Absolutely, I can help with that. What kind of service are you looking for, and what day works best?" },
  { speaker: "Live note", text: "New lead captured: consultation request, this-week availability, ready for callback." },
];

const statusCopy: Record<PreviewStatus, string> = {
  idle: "Enter your number to launch the preview.",
  dialing: "Preparing Maya and dialing your phone...",
  ringing: "Your phone should ring in a moment.",
  talking: "Maya is live. Watch the call notes build here.",
  done: "Preview started. Check your phone.",
  error: "The preview could not start.",
};

const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "Call"];

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export function ElevateReceptionistPreview() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<PreviewStatus>("idle");
  const [message, setMessage] = useState(statusCopy.idle);
  const [visibleLines, setVisibleLines] = useState(0);
  const [typedText, setTypedText] = useState("");

  const digits = useMemo(() => phone.replace(/\D/g, ""), [phone]);
  const canSubmit = digits.length === 10 && status !== "dialing" && status !== "ringing";

  useEffect(() => {
    if (status !== "talking" && status !== "done") return;
    setVisibleLines(0);
    setTypedText("");

    const timers = script.map((line, index) =>
      window.setTimeout(() => {
        setVisibleLines(index + 1);
        setTypedText(line.text);
      }, 600 + index * 1450),
    );

    return () => timers.forEach(window.clearTimeout);
  }, [status]);

  const startPreview = async () => {
    if (!canSubmit) return;
    setStatus("dialing");
    setMessage(statusCopy.dialing);
    setVisibleLines(0);
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
        setMessage(data.mode === "demo" ? data.message ?? "Demo animation started." : statusCopy.done);
      }, 5600);
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
    if (key === "⌫") {
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
              <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">Try by phone</p>
              <h2 className="mt-2 text-2xl font-black">Live receptionist preview</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">Maya calls you as a front desk assistant, not the food ordering bot.</p>
            </div>
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
              status === "idle" ? "bg-white/10 text-white/60" : status === "error" ? "bg-rose-400/15 text-rose-200" : "bg-emerald-400/15 text-emerald-200"
            }`}>
              {status === "dialing" || status === "ringing" ? <Loader2 className="h-6 w-6 animate-spin" /> : <PhoneCall className="h-6 w-6" />}
            </div>
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

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
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

            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-sky-200">
                  <Radio className="h-4 w-4" />
                  Live call room
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/50">{status}</span>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-white/72">
                  {status === "done" ? <CheckCircle2 className="h-4 w-4 text-emerald-200" /> : <Mic2 className="h-4 w-4 text-sky-200" />}
                  {message}
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {script.slice(0, visibleLines).map((line, index) => (
                  <div className={`rounded-2xl border p-3 ${
                    line.speaker === "Maya" ? "border-sky-300/20 bg-sky-400/10"
                      : line.speaker === "Live note" ? "border-violet-300/20 bg-violet-400/10"
                        : "border-white/10 bg-white/[0.06]"
                  }`} key={`${line.speaker}-${index}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38">{line.speaker}</p>
                    <p className="mt-1 text-sm leading-6 text-white/74">{index === visibleLines - 1 ? typedText : line.text}</p>
                  </div>
                ))}
                {status === "idle" && (
                  <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center">
                    <Sparkles className="mx-auto h-6 w-6 text-violet-200" />
                    <p className="mt-3 text-sm leading-6 text-white/45">Press the keypad or type your number to start the animated phone demo.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
