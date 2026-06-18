import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Headphones,
  MessageSquareText,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Zap
} from "lucide-react";

const demoNumber = "(908) 639-5394";
const demoPhoneHref = "tel:+19086395394";

const callFlow = [
  {
    speaker: "Caller",
    text: "Hi, do you have openings this week for a cleaning?"
  },
  {
    speaker: "Elevate Receptionist",
    text: "Absolutely. I can help with that. What kind of cleaning are you looking for, and what day works best?"
  },
  {
    speaker: "Caller",
    text: "Move-out cleaning, preferably Friday morning."
  },
  {
    speaker: "Elevate Receptionist",
    text: "Perfect. I have the request captured. May I grab your name, phone number, and property address so the team can confirm?"
  }
];

const features = [
  {
    title: "Answers every call",
    description: "Handles common questions, business hours, services, pricing ranges, and availability.",
    icon: Headphones
  },
  {
    title: "Qualifies the lead",
    description: "Collects name, phone, location, service type, urgency, budget, and next best action.",
    icon: UserRoundCheck
  },
  {
    title: "Books the next step",
    description: "Turns good calls into scheduled appointments, callbacks, estimates, or routed handoffs.",
    icon: CalendarCheck
  },
  {
    title: "Sends clean summaries",
    description: "Pushes call notes, transcript highlights, and booking details to the business dashboard.",
    icon: MessageSquareText
  }
];

const industries = ["Home services", "Med spas", "Clinics", "Salons", "Legal intake", "Real estate"];

export default function ElevateReceptionistPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050716] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute right-[-10rem] top-24 h-[32rem] w-[32rem] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-[-16rem] left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Link
          className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/40 hover:bg-white/10 hover:text-white"
          href="/demos"
        >
          <span className="h-2 w-2 rounded-full bg-sky-300 transition group-hover:scale-125" />
          Back to demos
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-white/55 md:flex">
          <a className="transition hover:text-white" href="#how-it-works">How it works</a>
          <a className="transition hover:text-white" href="#live-demo">Live demo</a>
          <a className="transition hover:text-white" href="#industries">Industries</a>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-8 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:pt-16">
        <div>
          <div className="mb-8 inline-flex items-center gap-4 rounded-[2rem] border border-white/10 bg-white/[0.06] p-3 pr-5 shadow-2xl shadow-sky-950/30 backdrop-blur">
            <Image
              alt="Elevate Receptionist logo"
              className="h-16 w-16 rounded-2xl object-cover shadow-lg shadow-sky-500/20"
              height={128}
              priority
              src="/elevate-receptionist-logo.png"
              width={128}
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-300">Elevate Receptionist</p>
              <p className="mt-1 text-sm text-white/55">AI front desk demo</p>
            </div>
          </div>

          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.34em] text-violet-300">
            <Sparkles className="h-4 w-4" />
            Calls, questions, qualification, booking
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl">
            A front desk that answers like your best hire.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/62">
            Elevate Receptionist gives service businesses a polished AI receptionist that answers the phone,
            handles questions, qualifies new leads, books the next step, and sends the team a clean summary.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-6 py-4 text-base font-black text-white shadow-2xl shadow-sky-500/25 transition duration-300 hover:-translate-y-1 hover:shadow-sky-500/40 active:translate-y-0"
              href={demoPhoneHref}
            >
              <PhoneCall className="h-5 w-5 transition group-hover:rotate-12" />
              Call {demoNumber}
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </a>
            <a
              className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] px-6 py-4 text-base font-bold text-white/80 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.1] hover:text-white active:translate-y-0"
              href="#live-demo"
            >
              See the call flow
            </a>
          </div>

          <p className="mt-5 max-w-xl text-sm text-white/45">
            Try questions about hours, services, appointment availability, pricing ranges, or new customer intake.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-sky-500/20 via-violet-500/15 to-transparent blur-2xl" />
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/12 bg-[#0b1022]/90 p-5 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">Live phone preview</p>
                  <h2 className="mt-2 text-2xl font-black">Incoming call</h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200">
                  <PhoneCall className="h-6 w-6 animate-pulse" />
                </div>
              </div>

              <div className="mt-6 space-y-3" id="live-demo">
                {callFlow.map((message, index) => (
                  <div
                    className={`rounded-2xl border p-4 ${
                      message.speaker === "Caller"
                        ? "border-white/10 bg-white/[0.06]"
                        : "border-sky-300/20 bg-sky-400/10"
                    }`}
                    key={`${message.speaker}-${index}`}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">{message.speaker}</p>
                    <p className="mt-2 text-sm leading-6 text-white/78">{message.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-violet-300/20 bg-violet-400/10 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-violet-200" />
                  <div>
                    <p className="font-black">Dashboard note created</p>
                    <p className="mt-1 text-sm leading-6 text-white/55">
                      Move-out cleaning request, Friday morning preference, needs callback to confirm quote and time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-white/[0.035] px-5 py-10 backdrop-blur sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
          {[
            ["24/7", "Calls answered after hours"],
            ["< 60 sec", "Typical qualification flow"],
            ["0 missed", "Lead details captured cleanly"]
          ].map(([value, label]) => (
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]" key={label}>
              <p className="text-4xl font-black tracking-[-0.05em] text-white">{value}</p>
              <p className="mt-2 text-sm font-semibold text-white/45">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8" id="how-it-works">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-sky-300">What it does</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl">Built for real front desk pressure.</h2>
          <p className="mt-5 text-lg leading-8 text-white/55">
            The demo is designed to feel like a real business tool, not a toy. It shows the business owner how calls become organized, usable work.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              className="group rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 transition duration-300 hover:-translate-y-2 hover:border-sky-300/35 hover:bg-white/[0.075] hover:shadow-2xl hover:shadow-sky-950/25"
              key={feature.title}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/20 to-violet-500/20 text-sky-200 transition duration-300 group-hover:scale-110 group-hover:rotate-3">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-black">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/50">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-6 px-5 pb-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2.2rem] border border-white/10 bg-white/[0.045] p-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-300">Business dashboard</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">A clean handoff after every call.</h2>
          <p className="mt-5 leading-8 text-white/55">
            Owners can see who called, what they needed, how urgent it was, and what should happen next.
            That is the part that makes the demo feel valuable to a business.
          </p>
        </div>

        <div className="rounded-[2.2rem] border border-white/10 bg-[#0a1020] p-5 shadow-2xl shadow-black/30">
          {[
            ["New lead", "Sarah M.", "Move-out cleaning, Friday AM, 3-bedroom apartment", "Ready for quote"],
            ["Booking request", "Marcus J.", "AC repair estimate, prefers same-day callback", "High intent"],
            ["FAQ handled", "Unknown caller", "Asked about hours, service area, and minimum visit fee", "No staff needed"]
          ].map(([type, name, detail, status], index) => (
            <div
              className="mb-3 flex gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.075]"
              key={name}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${index === 0 ? "bg-emerald-400/15 text-emerald-200" : "bg-sky-400/15 text-sky-200"}`}>
                {index === 0 ? <Zap className="h-5 w-5" /> : <PhoneCall className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">{type}</p>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/65">{status}</span>
                </div>
                <h3 className="mt-2 font-black">{name}</h3>
                <p className="mt-1 text-sm leading-6 text-white/52">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8" id="industries">
        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-sky-500/15 via-violet-500/15 to-white/[0.04] p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">Who it is for</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">Any business where missed calls cost money.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {industries.map((industry) => (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 transition duration-300 hover:-translate-y-1 hover:bg-black/25" key={industry}>
                  <ShieldCheck className="h-5 w-5 text-violet-200" />
                  <span className="font-bold text-white/75">{industry}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-white/45">Receptionist demo line</p>
              <p className="mt-1 text-3xl font-black tracking-[-0.04em]">{demoNumber}</p>
            </div>
            <a
              className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-black text-[#090d1f] transition duration-300 hover:-translate-y-1 hover:bg-sky-100 active:translate-y-0"
              href={demoPhoneHref}
            >
              <Clock3 className="h-5 w-5 text-sky-600 transition group-hover:rotate-12" />
              Try a call now
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
