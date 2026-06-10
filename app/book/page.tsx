import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  MessageSquareText,
  Sparkles,
  Workflow
} from "lucide-react";

import { BookingCalendar } from "@/components/booking-calendar";
import { Button } from "@/components/ui/button";

const callHighlights = [
  { label: "Website and conversion review", icon: Sparkles },
  { label: "AI automation fit check", icon: Workflow },
  { label: "Lead capture and CRM plan", icon: MessageSquareText },
  { label: "Clear next-step recommendation", icon: CheckCircle2 }
];

export default function BookPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
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

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-sm text-sky-100">
              <CalendarCheck className="h-4 w-4" />
              Live strategy calendar
            </div>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.04] text-white sm:text-5xl">
              Let’s map the fastest path to better leads.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/65">
              Pick a real available time. We’ll review your website, lead flow, CRM, and the
              highest-leverage automation opportunities for your business.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {callHighlights.map((item) => (
                <div className="border-l-2 border-sky-300/50 bg-white/[0.035] p-4" key={item.label}>
                  <item.icon className="h-5 w-5 text-sky-300" />
                  <p className="mt-3 text-sm font-medium leading-6 text-white/70">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5">
              <Clock className="h-5 w-5 text-sky-300" />
              <p className="text-sm leading-6 text-white/50">
                30 minutes. Monday through Friday. Times shown in Eastern Time.
              </p>
            </div>
          </div>

          <BookingCalendar />
        </div>
      </section>
    </main>
  );
}
