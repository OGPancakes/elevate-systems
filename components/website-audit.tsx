"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Globe,
  Image as ImageIcon,
  Loader2,
  Mail,
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
  leadId?: string;
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

  const headline = useMemo(() => {
    if (!businessName.trim()) return "Let's upgrade your website.";
    return `Let's upgrade ${businessName.trim()}.`;
  }, [businessName]);

  async function submitAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/website-audit", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as Partial<AuditResponse> & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "We could not generate the audit right now.");
      }

      setResult(data.audit ?? fallbackAudit);
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

      <div className="glass grid overflow-hidden rounded-2xl lg:grid-cols-[0.92fr_1.08fr]">
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

          <label className="space-y-2 block">
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
    </section>
  );
}
