import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  MessageSquareText,
  Sparkles,
  Workflow
} from "lucide-react";

import { Button } from "@/components/ui/button";

const bookingsUrl = process.env.NEXT_PUBLIC_MICROSOFT_BOOKINGS_URL ?? "";
const callHighlights = [
  { label: "Website and conversion review", icon: Sparkles },
  { label: "AI automation fit check", icon: Workflow },
  { label: "Lead capture and CRM plan", icon: MessageSquareText },
  { label: "Clear next-step recommendation", icon: CheckCircle2 }
];

export default async function BookPage({
  searchParams
}: {
  searchParams?: Promise<{ submitted?: string }>;
}) {
  const submitted = (await searchParams)?.submitted === "true";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
        <div className="absolute right-12 top-24 h-80 w-80 rounded-full border border-sky-300/10" />
        <div className="absolute bottom-24 left-10 h-72 w-72 rounded-full border border-white/10" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#030711]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
          <Link className="flex items-center gap-3" href="/">
            <Image
              alt="Elevate Systems logo"
              className="h-10 w-10 rounded-md object-cover"
              height={40}
              src="/elevate-logo.png"
              width={40}
              priority
            />
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-white">ELEVATE</p>
              <p className="text-xs tracking-[0.28em] text-sky-300">SYSTEMS</p>
            </div>
          </Link>
          <Button asChild variant="secondary">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Site
            </Link>
          </Button>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[0.86fr_1.14fr] lg:py-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-sm text-sky-100">
            <CalendarCheck className="h-4 w-4" />
            Strategy consultation
          </div>
          <h1 className="text-balance text-5xl font-semibold leading-[1.02] text-white sm:text-6xl">
            Book a call with Elevate Systems.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            In 20 to 30 minutes, we will review your current website, lead flow, CRM setup,
            and the highest-leverage automation opportunities for your business.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {callHighlights.map((item) => (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4" key={item.label}>
                <item.icon className="h-5 w-5 text-sky-300" />
                <p className="mt-3 text-sm font-medium leading-6 text-white/75">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-4">
            <Clock className="h-5 w-5 text-sky-300" />
            <p className="text-sm leading-6 text-white/65">
              If the calendar does not load, use the fallback form and we will reach out directly.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="font-semibold text-white">Choose a time</p>
                <p className="text-sm text-white/50">Microsoft Bookings calendar</p>
              </div>
              <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-200">
                Secure
              </div>
            </div>
            {bookingsUrl ? (
              <iframe
                className="h-[680px] w-full bg-white"
                src={bookingsUrl}
                title="Elevate Systems booking calendar"
              />
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
                <CalendarCheck className="h-12 w-12 text-sky-300" />
                <h2 className="mt-5 text-2xl font-semibold text-white">Calendar connection pending</h2>
                <p className="mt-3 max-w-md leading-7 text-white/60">
                  Add your Microsoft Bookings embed URL as NEXT_PUBLIC_MICROSOFT_BOOKINGS_URL
                  in Vercel to show the live scheduler here.
                </p>
              </div>
            )}
          </div>

          <form className="glass rounded-2xl p-5 sm:p-6" action="/api/booking-leads" method="post">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
                Contact fallback
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Prefer we reach out?
              </h2>
              {submitted ? (
                <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
                  Request received. We will follow up shortly.
                </p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["name", "Name", "text"],
                ["email", "Email", "email"],
                ["phone", "Phone", "text"],
                ["businessName", "Business Name", "text"],
                ["websiteUrl", "Website URL", "url"]
              ].map(([name, label, type]) => (
                <label className="space-y-2" key={name}>
                  <span className="text-sm font-medium text-white/70">{label}</span>
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-white outline-none ring-sky-300/40 placeholder:text-white/40 focus:ring-2"
                    name={name}
                    required={name !== "phone" && name !== "websiteUrl"}
                    type={type}
                  />
                </label>
              ))}
            </div>
            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium text-white/70">What should we look at?</span>
              <textarea
                className="min-h-28 w-full resize-none rounded-md border border-white/10 bg-black/30 px-3 py-3 text-white outline-none ring-sky-300/40 placeholder:text-white/40 focus:ring-2"
                name="message"
                required
              />
            </label>
            <Button className="mt-5 w-full" size="lg" type="submit">
              Send Booking Request
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
