"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Globe2,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  Sparkles,
  UserRound
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  BOOKING_DURATION_MINUTES,
  BOOKING_TIME_ZONE,
  BOOKING_WINDOW_DAYS,
  dateKeyInTimeZone
} from "@/lib/booking-schedule";

type Slot = {
  startsAt: string;
  available: boolean;
};

type BookingConfirmation = {
  bookingId?: string;
  startsAt: string;
  formattedTime: string;
  durationMinutes: number;
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const services = [
  "Website + Automation",
  "AI Automation",
  "Custom Website",
  "CRM and Lead Capture",
  "AI Chatbot"
];

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function shiftDateKey(value: string, days: number) {
  const date = parseDateKey(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function monthTitle(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(parseDateKey(value));
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(parseDateKey(value));
}

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKING_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function makeMonthGrid(monthKey: string) {
  const monthDate = parseDateKey(monthKey);
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1, 12));
  const start = new Date(firstDay);
  start.setUTCDate(1 - firstDay.getUTCDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return {
      key: date.toISOString().slice(0, 10),
      day: date.getUTCDate(),
      month: date.getUTCMonth()
    };
  });
}

function googleCalendarUrl(confirmation: BookingConfirmation, businessName: string) {
  const start = new Date(confirmation.startsAt);
  const end = new Date(start.getTime() + confirmation.durationMinutes * 60_000);
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Elevate Systems strategy call${businessName ? ` - ${businessName}` : ""}`,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: "Strategy call with Elevate Systems about your website, automation, and lead systems.",
    location: "Online meeting - Elevate Systems will send connection details."
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function BookingCalendar() {
  const today = useMemo(() => dateKeyInTimeZone(new Date()), []);
  const maxDate = useMemo(() => shiftDateKey(today, BOOKING_WINDOW_DAYS), [today]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(`${today.slice(0, 7)}-01`);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [businessName, setBusinessName] = useState("");

  const days = useMemo(() => makeMonthGrid(visibleMonth), [visibleMonth]);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingSlots(true);
    setSelectedSlot("");
    setError("");
    fetch(`/api/booking-availability?date=${selectedDate}`, {
      signal: controller.signal,
      cache: "no-store"
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Availability could not be loaded.");
        return response.json() as Promise<{ slots: Slot[] }>;
      })
      .then((data) => setSlots(data.slots))
      .catch((loadError) => {
        if (loadError instanceof Error && loadError.name !== "AbortError") {
          setError("Availability could not be loaded. Please choose another date.");
        }
      })
      .finally(() => setLoadingSlots(false));
    return () => controller.abort();
  }, [selectedDate]);

  function changeMonth(direction: number) {
    const date = parseDateKey(visibleMonth);
    date.setUTCMonth(date.getUTCMonth() + direction);
    setVisibleMonth(date.toISOString().slice(0, 7) + "-01");
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlot) {
      setError("Choose an available time before booking.");
      return;
    }
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.selectedDateTime = selectedSlot;

    try {
      const response = await fetch("/api/booking-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as BookingConfirmation & { error?: string };
      if (!response.ok) {
        if (response.status === 409) {
          const availability = await fetch(`/api/booking-availability?date=${selectedDate}`, {
            cache: "no-store"
          }).then((value) => value.json() as Promise<{ slots: Slot[] }>);
          setSlots(availability.slots);
          setSelectedSlot("");
        }
        throw new Error(data.error ?? "We could not reserve that time.");
      }
      setConfirmation(data);
    } catch (bookingError) {
      setError(
        bookingError instanceof Error
          ? bookingError.message
          : "We could not reserve that time. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="glass overflow-hidden rounded-lg">
        <div className="border-b border-white/10 bg-emerald-300/[0.08] px-6 py-8 text-center sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-300 text-[#032117]">
            <Check className="h-7 w-7" />
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
            You are booked
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Strategy call confirmed.</h2>
          <p className="mx-auto mt-3 max-w-lg leading-7 text-white/60">
            We saved your call in the Elevate dashboard. We will use your contact details to send
            the meeting connection information.
          </p>
        </div>
        <div className="grid gap-px bg-white/10 sm:grid-cols-3">
          {[
            [CalendarDays, "Date and time", confirmation.formattedTime],
            [Clock3, "Duration", `${confirmation.durationMinutes} minutes`],
            [Globe2, "Time zone", "Eastern Time"]
          ].map(([Icon, label, value]) => {
            const ItemIcon = Icon as typeof CalendarDays;
            return (
              <div className="bg-[#07101c] p-5" key={String(label)}>
                <ItemIcon className="h-5 w-5 text-sky-300" />
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/35">{String(label)}</p>
                <p className="mt-1 text-sm font-medium leading-6 text-white/80">{String(value)}</p>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-center">
          <Button asChild>
            <a
              href={googleCalendarUrl(confirmation, businessName)}
              rel="noreferrer"
              target="_blank"
            >
              Add to Google Calendar
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">Return to website</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden rounded-lg">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-white">Schedule your strategy call</p>
          <p className="mt-1 text-sm text-white/45">Live availability from the Elevate calendar</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/45">
          <LockKeyhole className="h-4 w-4 text-emerald-300" />
          Private and securely stored
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_0.8fr]">
        <div className="border-b border-white/10 p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <button
              aria-label="Previous month"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-25"
              disabled={visibleMonth.slice(0, 7) <= today.slice(0, 7)}
              onClick={() => changeMonth(-1)}
              type="button"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold text-white">{monthTitle(visibleMonth)}</h3>
            <button
              aria-label="Next month"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-25"
              disabled={visibleMonth.slice(0, 7) >= maxDate.slice(0, 7)}
              onClick={() => changeMonth(1)}
              type="button"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-7 text-center text-xs font-medium uppercase text-white/30">
            {weekdays.map((day) => <span className="py-2" key={day}>{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((date) => {
              const parsed = parseDateKey(date.key);
              const weekend = parsed.getUTCDay() === 0 || parsed.getUTCDay() === 6;
              const disabled =
                date.month !== parseDateKey(visibleMonth).getUTCMonth() ||
                date.key < today ||
                date.key > maxDate ||
                weekend;
              const selected = date.key === selectedDate;
              return (
                <button
                  aria-label={dateLabel(date.key)}
                  className={`aspect-square min-h-10 rounded-md text-sm transition ${
                    selected
                      ? "bg-sky-400 font-semibold text-[#03101f] shadow-glow"
                      : disabled
                        ? "text-white/15"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                  disabled={disabled}
                  key={date.key}
                  onClick={() => setSelectedDate(date.key)}
                  type="button"
                >
                  {date.day}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5 text-sm text-white/45">
            <Globe2 className="h-4 w-4 text-sky-300" />
            Times shown in Eastern Time
          </div>
        </div>

        <div className="min-h-[430px] p-5 sm:p-7">
          <p className="text-sm font-semibold text-white">{dateLabel(selectedDate)}</p>
          <p className="mt-1 text-sm text-white/40">{BOOKING_DURATION_MINUTES}-minute strategy call</p>
          {loadingSlots ? (
            <div className="flex min-h-72 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-sky-300" />
            </div>
          ) : slots.some((slot) => slot.available) ? (
            <div className="mt-5 grid grid-cols-2 gap-2">
              {slots.map((slot) => (
                <button
                  className={`h-12 rounded-md border text-sm font-medium transition ${
                    selectedSlot === slot.startsAt
                      ? "border-sky-300 bg-sky-400 text-[#03101f]"
                      : slot.available
                        ? "border-white/10 bg-white/[0.035] text-white/70 hover:border-sky-300/40 hover:bg-sky-300/10 hover:text-white"
                        : "cursor-not-allowed border-white/5 bg-black/10 text-white/15 line-through"
                  }`}
                  disabled={!slot.available}
                  key={slot.startsAt}
                  onClick={() => setSelectedSlot(slot.startsAt)}
                  type="button"
                >
                  {timeLabel(slot.startsAt)}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-md border border-dashed border-white/10 px-5 text-center">
              <Clock3 className="h-8 w-8 text-white/25" />
              <p className="mt-3 font-medium text-white/65">No times available this day</p>
              <p className="mt-1 text-sm text-white/35">Choose another weekday to see open calls.</p>
            </div>
          )}
        </div>
      </div>

      <form className="border-t border-white/10 bg-black/15 p-5 sm:p-7" onSubmit={submitBooking}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
              Your details
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {selectedSlot ? `Reserve ${timeLabel(selectedSlot)}` : "Choose a time above"}
            </h3>
          </div>
          {selectedSlot ? (
            <span className="hidden rounded-md border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-xs text-sky-100 sm:block">
              {dateLabel(selectedDate)}
            </span>
          ) : null}
        </div>

        <input className="hidden" name="website" tabIndex={-1} type="text" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["name", "Your name", "text", UserRound],
            ["email", "Business email", "email", Mail],
            ["phone", "Phone number", "tel", Phone],
            ["businessName", "Business name", "text", Sparkles]
          ].map(([name, label, type, Icon]) => {
            const FieldIcon = Icon as typeof UserRound;
            return (
              <label className="space-y-2" key={String(name)}>
                <span className="text-sm font-medium text-white/65">{String(label)}</span>
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-3 ring-sky-300/40 focus-within:ring-2">
                  <FieldIcon className="h-4 w-4 text-white/30" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
                    name={String(name)}
                    onChange={
                      name === "businessName"
                        ? (event) => setBusinessName(event.target.value)
                        : undefined
                    }
                    required
                    type={String(type)}
                  />
                </div>
              </label>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-white/65">Website URL</span>
            <input
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-white outline-none ring-sky-300/40 placeholder:text-white/30 focus:ring-2"
              name="websiteUrl"
              placeholder="Optional"
              type="url"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-white/65">What can we help with?</span>
            <select
              className="w-full rounded-md border border-white/10 bg-[#07101e] px-3 py-3 text-white outline-none ring-sky-300/40 focus:ring-2"
              name="serviceInterest"
            >
              {services.map((service) => <option key={service}>{service}</option>)}
            </select>
          </label>
        </div>

        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium text-white/65">What should we review before the call?</span>
          <textarea
            className="min-h-24 w-full resize-none rounded-md border border-white/10 bg-black/30 px-3 py-3 text-white outline-none ring-sky-300/40 placeholder:text-white/30 focus:ring-2"
            name="message"
            placeholder="Tell us about your current website, lead flow, or automation goals."
            required
          />
        </label>

        {error ? (
          <p className="mt-4 rounded-md border border-red-300/20 bg-red-300/10 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        <Button className="mt-5 w-full" disabled={!selectedSlot || submitting} size="lg" type="submit">
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CalendarDays className="h-5 w-5" />}
          {submitting ? "Reserving your call" : "Confirm Strategy Call"}
          {!submitting ? <ArrowRight className="h-5 w-5" /> : null}
        </Button>
      </form>
    </div>
  );
}
