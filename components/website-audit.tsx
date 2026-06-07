"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Globe,
  Image as ImageIcon,
  Loader2,
  Mail,
  MousePointer2,
  ScanSearch,
  Sparkles,
  Upload
} from "lucide-react";

import { Button } from "@/components/ui/button";

type AuditResult = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  howElevateHelps: string[];
  cta: string;
};

type AuditResponse = {
  audit: AuditResult;
  redesign: RedesignPreview;
  leadId?: string;
};

type RedesignPreview = {
  businessName: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  trustPoints: string[];
  services: string[];
  markers: Array<{
    title: string;
    description: string;
    x: number;
    y: number;
  }>;
  screenshotUrl: string;
};

const fallbackAudit: AuditResult = {
  summary:
    "Your site has enough visible business context for a useful first review. The next step is turning that presence into a cleaner, faster, more conversion-focused system.",
  strengths: ["Clear business intent", "Existing online presence", "A foundation that can be improved quickly"],
  weaknesses: ["The current experience may not fully communicate trust, speed, and modern capability"],
  improvements: ["Sharper positioning", "Stronger calls to action", "Better lead capture and follow-up"],
  howElevateHelps: ["Modern website rebuild", "AI lead qualification", "CRM and follow-up automation"],
  cta: "Book a strategy call and we will map the fastest upgrade path."
};

function listItems(items: string[]) {
  return items.filter(Boolean).slice(0, 5);
}

export function WebsiteAudit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [redesign, setRedesign] = useState<RedesignPreview | null>(null);
  const [slider, setSlider] = useState(48);
  const [activeMarker, setActiveMarker] = useState(0);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const existing = window.sessionStorage.getItem("elevate_session_id");
    const next = existing || crypto.randomUUID();
    window.sessionStorage.setItem("elevate_session_id", next);
    setSessionId(next);
  }, []);

  const headline = useMemo(() => {
    if (!businessName.trim()) return "Let's upgrade your website.";
    return `Let's upgrade ${businessName.trim()}.`;
  }, [businessName]);

  async function submitAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setRedesign(null);

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("sessionId", sessionId);
      const response = await fetch("/api/website-audit", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as Partial<AuditResponse> & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "We could not generate the audit right now.");
      }

      setResult(data.audit ?? fallbackAudit);
      setRedesign(data.redesign ?? null);
    } catch (auditError) {
      setError(
        auditError instanceof Error
          ? auditError.message
          : "Something went wrong while generating the audit."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="audit" className="section-pad mx-auto max-w-7xl px-5">
      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">
            Website Audit AI
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
            Turn your current website into something modern, clean, and future-ready.
          </h2>
        </div>
        <p className="max-w-md leading-7 text-white/60">
          Enter a business website and Elevate Bot will generate a polished first-pass audit,
          then route the lead details to your backend for follow-up.
        </p>
      </div>

      <div className="glass grid overflow-hidden rounded-lg lg:grid-cols-[0.92fr_1.08fr]">
        <form className="space-y-4 border-b border-white/10 p-5 sm:p-7 lg:border-b-0 lg:border-r" onSubmit={submitAudit}>
          <div className="rounded-xl border border-sky-300/20 bg-sky-300/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-300 text-slate-950">
                <ScanSearch className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-white">Elevate Bot scanner</p>
                <p className="text-sm text-sky-100/70">AI audit, lead capture, and follow-up ready</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-white/70">Your name</span>
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-3 ring-sky-300/40 focus-within:ring-2">
                <Building2 className="h-4 w-4 text-white/40" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/35"
                  name="name"
                  placeholder="Gabriel"
                  required
                  type="text"
                />
              </div>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-white/70">Business name</span>
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-3 ring-sky-300/40 focus-within:ring-2">
                <Sparkles className="h-4 w-4 text-white/40" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/35"
                  name="businessName"
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="Acme Roofing"
                  required
                  type="text"
                />
              </div>
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-white/70">Website URL</span>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-3 ring-sky-300/40 focus-within:ring-2">
              <Globe className="h-4 w-4 text-white/40" />
              <input
                className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/35"
                name="websiteUrl"
                onChange={(event) => setWebsiteUrl(event.target.value)}
                placeholder="https://example.com"
                required
                type="url"
              />
            </div>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-white/70">Email</span>
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-3 ring-sky-300/40 focus-within:ring-2">
                <Mail className="h-4 w-4 text-white/40" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/35"
                  name="email"
                  placeholder="owner@example.com"
                  required
                  type="email"
                />
              </div>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-white/70">Phone</span>
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-3 ring-sky-300/40 focus-within:ring-2">
                <input
                  className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/35"
                  name="phone"
                  placeholder="Optional"
                  type="tel"
                />
              </div>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-white/70">Logo URL</span>
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-3 ring-sky-300/40 focus-within:ring-2">
                <ImageIcon className="h-4 w-4 text-white/40" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/35"
                  name="logoUrl"
                  placeholder="Optional"
                  type="url"
                />
              </div>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-white/70">Logo upload</span>
              <div className="flex h-[50px] cursor-pointer items-center gap-2 rounded-md border border-dashed border-white/15 bg-black/30 px-3 text-sm text-white/45 transition hover:border-sky-300/40 hover:text-white/70">
                <Upload className="h-4 w-4" />
                <span className="truncate">Optional file</span>
                <input className="hidden" name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
              </div>
            </label>
          </div>

          {error ? (
            <p className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <Button className="w-full" disabled={loading} size="lg" type="submit">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanSearch className="h-5 w-5" />}
            {loading ? "Scanning website" : "Generate AI Website Audit"}
          </Button>
        </form>

        <div className="relative min-h-[520px] overflow-hidden bg-black/20 p-5 sm:p-7">
          <div className="absolute inset-x-10 top-8 h-px bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
          <div className="relative">
            <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
                Preview response
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{headline}</h3>
              <p className="mt-3 leading-7 text-white/60">
                {websiteUrl.trim()
                  ? `Scanning ${websiteUrl.trim()} for brand clarity, trust, conversion paths, and automation opportunities.`
                  : "Enter a website URL and the audit will appear here with a clean breakdown."}
              </p>
            </div>

            {result ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-sky-300/20 bg-sky-300/10 p-5">
                  <p className="text-sm font-medium text-sky-100/80">AI overview</p>
                  <p className="mt-2 leading-7 text-white/80">{result.summary}</p>
                </div>
                {[
                  ["What looks strong", result.strengths],
                  ["What feels outdated or weak", result.weaknesses],
                  ["Highest-impact improvements", result.improvements],
                  ["How Elevate Systems can help", result.howElevateHelps]
                ].map(([title, items]) => (
                  <details className="group rounded-xl border border-white/10 bg-white/[0.04] p-5" key={String(title)} open={title === "What looks strong"}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
                      {title}
                      <ChevronRight className="h-5 w-5 shrink-0 text-sky-300 transition group-open:rotate-90" />
                    </summary>
                    <div className="mt-4 space-y-3">
                      {listItems(items as string[]).map((item) => (
                        <div className="flex gap-3" key={item}>
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-sky-300" />
                          <p className="leading-7 text-white/65">{item}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
                <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/30 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="leading-7 text-white/70">{result.cta}</p>
                  <Button asChild>
                    <a href="/book">
                      Book a Call
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                {["Website clarity score", "Modern design fit", "Lead capture strength", "Automation opportunity"].map((label, index) => (
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4" key={label}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-white/70">{label}</span>
                      <span className="text-xs text-sky-200/60">Pending</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-700 to-cyan-300" style={{ width: `${34 + index * 14}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {redesign ? (
        <section className="mt-8 overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-end sm:p-7">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
                Visual transformation
              </p>
              <h3 className="mt-2 text-3xl font-semibold text-white">
                See what {redesign.businessName} could become.
              </h3>
            </div>
            <p className="flex items-center gap-2 text-sm text-white/45">
              <MousePointer2 className="h-4 w-4 text-sky-300" />
              Drag to compare
            </p>
          </div>

          <div className="relative aspect-[16/9] min-h-[440px] overflow-hidden bg-[#07101c]">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,#071426,#09223a)] p-6 sm:p-10">
                <div className="mx-auto flex h-full max-w-5xl flex-col rounded-md border border-white/10 bg-[#07101c] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <strong className="text-sm tracking-[0.12em] text-white">{redesign.businessName}</strong>
                    <div className="hidden gap-5 text-xs text-white/45 sm:flex">
                      <span>Services</span><span>About</span><span>Reviews</span>
                    </div>
                    <span className="rounded-md bg-sky-400 px-3 py-2 text-xs font-semibold text-slate-950">
                      {redesign.primaryCta}
                    </span>
                  </div>
                  <div className="grid flex-1 items-center gap-8 p-6 sm:grid-cols-[1.1fr_0.9fr] sm:p-10">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">{redesign.eyebrow}</p>
                      <h4 className="mt-4 max-w-xl text-3xl font-semibold leading-tight text-white sm:text-5xl">{redesign.headline}</h4>
                      <p className="mt-4 max-w-lg leading-7 text-white/55">{redesign.subheadline}</p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <span className="rounded-md bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950">{redesign.primaryCta}</span>
                        <span className="rounded-md border border-white/15 px-4 py-3 text-sm text-white/70">{redesign.secondaryCta}</span>
                      </div>
                      <div className="mt-7 flex flex-wrap gap-4 text-xs text-white/45">
                        {redesign.trustPoints.map((point) => <span key={point}>✓ {point}</span>)}
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {redesign.services.map((service, index) => (
                        <div className="rounded-md border border-white/10 bg-white/[0.055] p-4" key={service}>
                          <span className="text-xs text-sky-300">0{index + 1}</span>
                          <p className="mt-2 text-sm leading-6 text-white/70">{service}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {redesign.markers.map((marker, index) => (
                <button
                  aria-label={marker.title}
                  className={`absolute z-50 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold shadow-lg transition ${activeMarker === index ? "scale-110 border-white bg-sky-400 text-slate-950" : "border-sky-200 bg-slate-950 text-sky-200"}`}
                  key={marker.title}
                  onClick={() => setActiveMarker(index)}
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  type="button"
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div
              className="absolute inset-0 overflow-hidden bg-slate-900"
              style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={`Current ${redesign.businessName} website`}
                className="h-full w-full object-cover object-top"
                src={redesign.screenshotUrl}
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="pointer-events-none absolute inset-y-0 z-30 w-0.5 bg-white" style={{ left: `${slider}%` }}>
              <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-sky-400 text-slate-950 shadow-xl">
                ↔
              </div>
            </div>
            <span className="absolute left-4 top-4 z-40 rounded-md bg-black/75 px-3 py-1.5 text-xs font-semibold text-white">BEFORE</span>
            <span className="absolute right-4 top-4 z-40 rounded-md bg-sky-400 px-3 py-1.5 text-xs font-semibold text-slate-950">AFTER</span>
            <input
              aria-label="Compare current and redesigned website"
              className="absolute inset-0 z-40 h-full w-full cursor-ew-resize opacity-0"
              max="100"
              min="0"
              onChange={(event) => setSlider(Number(event.target.value))}
              type="range"
              value={slider}
            />
          </div>

          <div className="grid gap-4 border-t border-white/10 p-5 sm:grid-cols-[0.72fr_1.28fr] sm:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
                Improvement marker {activeMarker + 1}
              </p>
              <h4 className="mt-2 text-xl font-semibold text-white">{redesign.markers[activeMarker]?.title}</h4>
            </div>
            <p className="leading-7 text-white/60">{redesign.markers[activeMarker]?.description}</p>
          </div>
        </section>
      ) : null}
    </section>
  );
}
