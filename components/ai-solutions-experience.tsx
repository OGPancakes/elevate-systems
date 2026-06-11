"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleGauge,
  Clock3,
  Globe2,
  Loader2,
  LockKeyhole,
  Mail,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { aiSolutionServices, solutionTiers } from "@/lib/ai-solutions-data";

type OpportunityResult = {
  score: number;
  summary: string;
  categories: Array<{ label: string; score: number; insight: string }>;
  opportunities: Array<{ title: string; description: string; impact: "High" | "Medium" }>;
  recommendedSolution: string;
  disclaimer: string;
};

const scanSteps = [
  "Reading website structure",
  "Reviewing mobile experience",
  "Mapping customer response paths",
  "Checking lead capture opportunities",
  "Building automation score"
];

function scoreColor(score: number) {
  if (score >= 75) return "text-emerald-300";
  if (score >= 50) return "text-sky-300";
  return "text-amber-300";
}

export function AiSolutionsExperience({
  stripeReady,
  checkoutStatus
}: {
  stripeReady: boolean;
  checkoutStatus?: string;
}) {
  const [activeService, setActiveService] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanError, setScanError] = useState("");
  const [result, setResult] = useState<OpportunityResult | null>(null);
  const [employees, setEmployees] = useState(8);
  const [weeklyLeads, setWeeklyLeads] = useState(35);
  const [adminHours, setAdminHours] = useState(18);
  const [checkoutLoading, setCheckoutLoading] = useState("");

  const projection = useMemo(() => {
    const responseHours = Math.min(weeklyLeads * 0.12, 12);
    const workflowHours = Math.min(adminHours * 0.38 + employees * 0.22, 24);
    const weeklyHours = Math.round((responseHours + workflowHours) * 10) / 10;
    const monthlyHours = Math.round(weeklyHours * 4.33);
    const annualCapacity = Math.round(monthlyHours * 12);
    return { weeklyHours, monthlyHours, annualCapacity };
  }, [adminHours, employees, weeklyLeads]);

  async function runScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setScanning(true);
    setResult(null);
    setScanError("");
    setScanStep(0);

    const formData = new FormData(event.currentTarget);
    const timer = window.setInterval(() => {
      setScanStep((current) => Math.min(current + 1, scanSteps.length - 1));
    }, 850);

    try {
      const response = await fetch("/api/ai-opportunity-scan", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as OpportunityResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "The scan could not be completed.");
      setScanStep(scanSteps.length - 1);
      setResult(data);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : "The scan could not be completed.");
    } finally {
      window.clearInterval(timer);
      setScanning(false);
    }
  }

  async function startCheckout(tierId: string) {
    if (!stripeReady) return;
    setCheckoutLoading(tierId);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId })
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "Checkout is unavailable.");
      window.location.href = data.url;
    } catch {
      window.location.href = `/book?service=${encodeURIComponent(tierId)}`;
    } finally {
      setCheckoutLoading("");
    }
  }

  const service = aiSolutionServices[activeService];

  return (
    <>
      <section className="relative min-h-[92vh] border-b border-white/10 pt-28">
        <div className="dashboard-grid pointer-events-none absolute inset-0 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="pointer-events-none absolute left-1/2 top-32 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div>
            {checkoutStatus === "success" ? (
              <div className="mb-6 border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100">
                Payment received. Your purchase is now in the Elevate command center, and our team will contact you with onboarding details.
              </div>
            ) : checkoutStatus === "cancelled" ? (
              <div className="mb-6 border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                Checkout was cancelled. Nothing was charged, and you can return to the packages whenever you are ready.
              </div>
            ) : null}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-sm text-sky-100">
              <Sparkles className="h-4 w-4" />
              AI opportunity intelligence
            </div>
            <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[1.02] text-white sm:text-6xl">
              See where AI fits before you invest.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
              Scan your website, explore practical AI systems, and identify opportunities to save
              time, respond faster, and create a better customer experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#scanner">
                  Scan My Website
                  <ScanSearch className="h-5 w-5" />
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#solutions">
                  Explore Solutions
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/45">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sky-300" />No growth guarantees</span>
              <span className="flex items-center gap-2"><CircleGauge className="h-4 w-4 text-sky-300" />Opportunity-based scoring</span>
              <span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-sky-300" />Private lead capture</span>
            </div>
          </div>

          <div id="scanner" className="scroll-mt-28 overflow-hidden rounded-lg border border-white/10 bg-[#08101d]/90 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="font-semibold text-white">Automation Opportunity Scanner</p>
                <p className="mt-1 text-xs text-white/40">Website signals + AI recommendations</p>
              </div>
              <span className="flex items-center gap-2 text-xs text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Online
              </span>
            </div>

            {!result ? (
              <form className="p-5 sm:p-7" onSubmit={runScan}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm text-white/60">Website URL</span>
                    <div className="flex items-center gap-3 rounded-md border border-white/10 bg-black/30 px-3 py-3 focus-within:border-sky-300/50">
                      <Globe2 className="h-4 w-4 text-sky-300" />
                      <input className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/25" name="websiteUrl" placeholder="yourbusiness.com" required />
                    </div>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-white/60">Business name</span>
                    <input className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-sky-300/50" name="businessName" placeholder="Your business" required />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-white/60">Your name</span>
                    <input className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-sky-300/50" name="name" placeholder="Your name" required />
                  </label>
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm text-white/60">Business email</span>
                    <div className="flex items-center gap-3 rounded-md border border-white/10 bg-black/30 px-3 py-3 focus-within:border-sky-300/50">
                      <Mail className="h-4 w-4 text-sky-300" />
                      <input className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/25" name="email" placeholder="you@business.com" required type="email" />
                    </div>
                  </label>
                </div>
                <input className="hidden" name="companyWebsite" tabIndex={-1} />

                {scanning ? (
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <div className="relative mb-5 h-1 overflow-hidden rounded-full bg-white/10">
                      <div className="absolute inset-y-0 left-0 bg-sky-400 transition-all duration-700" style={{ width: `${((scanStep + 1) / scanSteps.length) * 100}%` }} />
                      <div className="absolute inset-y-0 w-20 animate-scan-line bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                    </div>
                    <div className="space-y-3">
                      {scanSteps.map((step, index) => (
                        <div className={`flex items-center gap-3 text-sm ${index <= scanStep ? "text-white/80" : "text-white/25"}`} key={step}>
                          {index < scanStep ? <Check className="h-4 w-4 text-emerald-300" /> : index === scanStep ? <Loader2 className="h-4 w-4 animate-spin text-sky-300" /> : <span className="h-4 w-4 rounded-full border border-white/15" />}
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Button className="mt-6 w-full" size="lg" type="submit">
                    Generate Opportunity Score
                    <Zap className="h-5 w-5" />
                  </Button>
                )}
                {scanError ? <p className="mt-4 text-sm text-red-200">{scanError}</p> : null}
                <p className="mt-4 text-xs leading-5 text-white/30">
                  This analysis identifies possible opportunities. It is not a performance, revenue, or savings guarantee.
                </p>
              </form>
            ) : (
              <div className="p-5 sm:p-7">
                <div className="flex flex-col gap-6 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
                  <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border border-sky-300/30 bg-sky-300/5">
                    <div className="absolute inset-2 rounded-full border border-dashed border-sky-300/20" />
                    <div className="text-center">
                      <p className={`text-4xl font-semibold ${scoreColor(result.score)}`}>{result.score}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/35">Opportunity</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Analysis complete</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Your AI opportunity map</h2>
                    <p className="mt-3 leading-7 text-white/55">{result.summary}</p>
                  </div>
                </div>
                <div className="mt-6 grid auto-rows-fr gap-3 sm:grid-cols-2">
                  {result.categories.map((category) => (
                    <div className="flex h-full flex-col border border-white/10 bg-black/20 p-4" key={category.label}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-white">{category.label}</p>
                        <span className={`text-sm font-semibold ${scoreColor(category.score)}`}>{category.score}</span>
                      </div>
                      <div className="mt-3 h-1 overflow-hidden bg-white/10">
                        <div className="h-full bg-sky-400" style={{ width: `${category.score}%` }} />
                      </div>
                      <p className="mt-3 flex-1 text-xs leading-5 text-white/40">{category.insight}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  {result.opportunities.map((opportunity) => (
                    <div className="flex gap-4 border-l-2 border-sky-300/50 bg-white/[0.035] p-4" key={opportunity.title}>
                      <Zap className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-white">{opportunity.title}</p>
                          <span className="text-[10px] uppercase tracking-[0.15em] text-sky-300">{opportunity.impact} potential</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/50">{opportunity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href="/book">Review This With Us<ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                  <Button onClick={() => setResult(null)} variant="secondary">Scan Another Site</Button>
                </div>
                <p className="mt-4 text-xs leading-5 text-white/30">{result.disclaimer}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-7xl px-5" id="solutions">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Solution Explorer</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">Choose the bottleneck. See the system.</h2>
          <p className="mt-5 leading-8 text-white/55">Explore practical ways AI can support customer communication and internal operations without replacing the human judgment your business depends on.</p>
        </div>
        <div className="mt-10">
          <div className="grid auto-rows-fr gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {aiSolutionServices.map((item, index) => (
              <button
                className={`flex min-h-16 w-full items-center gap-3 border px-4 py-4 text-left transition ${index === activeService ? "border-sky-300/40 bg-sky-300/10 text-white" : "border-white/10 bg-white/[0.025] text-white/50 hover:border-white/20 hover:text-white"}`}
                key={item.id}
                onClick={() => setActiveService(index)}
                type="button"
              >
                <item.icon className="h-5 w-5 shrink-0 text-sky-300" />
                <span className="flex-1 text-sm font-medium">{item.shortTitle}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
          </div>
          <div className="dashboard-grid relative mt-4 min-h-[400px] overflow-hidden border border-white/10 bg-[#07101d] p-6 sm:p-10">
            <div className="absolute right-0 top-0 h-px w-2/3 bg-gradient-to-r from-transparent to-sky-300/50" />
            <service.icon className="h-10 w-10 text-sky-300" />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">System {String(activeService + 1).padStart(2, "0")}</p>
            <h3 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{service.title}</h3>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">{service.description}</p>
            <div className="mt-8 grid auto-rows-fr gap-px bg-white/10 sm:grid-cols-3">
              {service.signals.map((signal) => (
                <div className="flex h-full flex-col bg-[#091321] p-4 text-sm text-white/65" key={signal}>
                  <Check className="mb-3 h-4 w-4 text-emerald-300" />
                  {signal}
                </div>
              ))}
            </div>
            <div className="mt-8 border-l-2 border-sky-300/50 pl-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Potential operational outcome</p>
              <p className="mt-2 max-w-2xl leading-7 text-white/70">{service.outcome}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Efficiency Projection</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">Model the time your team could reclaim.</h2>
            <p className="mt-5 max-w-xl leading-8 text-white/55">Adjust the inputs to estimate administrative capacity that may be available for automation. Results are illustrative projections based only on your inputs.</p>
            <div className="mt-8 space-y-6">
              {[
                { label: "Team members", value: employees, set: setEmployees, min: 1, max: 75, icon: UsersRound },
                { label: "New leads per week", value: weeklyLeads, set: setWeeklyLeads, min: 5, max: 250, icon: BarChart3 },
                { label: "Weekly admin hours", value: adminHours, set: setAdminHours, min: 2, max: 80, icon: Clock3 }
              ].map((input) => (
                <label className="block" key={input.label}>
                  <span className="flex items-center justify-between text-sm text-white/60">
                    <span className="flex items-center gap-2"><input.icon className="h-4 w-4 text-sky-300" />{input.label}</span>
                    <strong className="text-white">{input.value}</strong>
                  </span>
                  <input className="mt-3 w-full accent-sky-400" max={input.max} min={input.min} onChange={(event) => input.set(Number(event.target.value))} type="range" value={input.value} />
                </label>
              ))}
            </div>
          </div>
          <div className="overflow-hidden border border-white/10 bg-[#07101d]">
            <div className="border-b border-white/10 p-5">
              <p className="font-semibold text-white">Projected capacity model</p>
              <p className="mt-1 text-xs text-white/40">Illustrative estimate, not a guaranteed result</p>
            </div>
            <div className="grid gap-px bg-white/10 sm:grid-cols-3">
              {[
                [projection.weeklyHours, "hours / week"],
                [projection.monthlyHours, "hours / month"],
                [projection.annualCapacity, "hours / year"]
              ].map(([value, label]) => (
                <div className="bg-[#08111e] p-6" key={label}>
                  <p className="text-3xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-sky-300">{label}</p>
                </div>
              ))}
            </div>
            <div className="p-6">
              <p className="text-sm leading-7 text-white/55">
                This model assumes a portion of repetitive response, routing, follow-up, and administrative work could be assisted by automation. Actual suitability depends on workflow quality, adoption, integrations, and business-specific constraints.
              </p>
              <Button asChild className="mt-6">
                <Link href="/book">Build My Automation Plan<ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-7xl px-5" id="pricing">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Engagement Options</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">Start focused. Expand when the system proves useful.</h2>
          <p className="mt-5 leading-8 text-white/55">Clear starting points for common implementations. Final scope is confirmed before work begins.</p>
        </div>
        <div className="mt-10 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {solutionTiers.map((tier) => (
            <article className={`relative flex h-full flex-col border p-6 ${tier.featured ? "border-sky-300/50 bg-sky-300/[0.07]" : "border-white/10 bg-white/[0.025]"}`} key={tier.id}>
              {tier.featured ? <span className="absolute right-4 top-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">Most complete</span> : null}
              <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
              <p className="mt-5 text-4xl font-semibold text-white">{tier.price}</p>
              <p className="mt-2 text-xs text-white/35">{tier.suffix}</p>
              <p className="mt-5 min-h-20 leading-7 text-white/55">{tier.description}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li className="flex gap-3 text-sm text-white/65" key={feature}><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />{feature}</li>
                ))}
              </ul>
              {stripeReady && tier.price !== "Custom" ? (
                <Button className="mt-8 w-full" disabled={checkoutLoading === tier.id} onClick={() => startCheckout(tier.id)}>
                  {checkoutLoading === tier.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Purchase Securely
                </Button>
              ) : (
                <Button asChild className="mt-8 w-full" variant={tier.featured ? "default" : "secondary"}>
                  <Link href="/book">{tier.price === "Custom" ? "Scope This System" : "Request This Package"}<ArrowRight className="h-4 w-4" /></Link>
                </Button>
              )}
            </article>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/35">
          <LockKeyhole className="h-4 w-4" />
          {stripeReady ? "Payments are processed securely by Stripe." : "Online checkout will appear when Stripe pricing is connected."}
        </div>
      </section>
    </>
  );
}
