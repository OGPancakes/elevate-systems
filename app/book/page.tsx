import { BookingCalendar } from "@/components/booking-calendar";
import { SiteHeader } from "@/components/site-header";

export default function BookPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-36 lg:grid-cols-[0.68fr_1.32fr] lg:items-start">
        <div className="lg:sticky lg:top-32">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
            Strategy call
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Find the right next move.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/55">
            We will review your current website and workflow, identify the clearest opportunity,
            and leave you with a practical next step.
          </p>
          <p className="mt-8 border-t border-white/10 pt-6 text-sm text-white/40">
            30 minutes · Eastern Time · No-pressure consultation
          </p>
        </div>
        <BookingCalendar />
      </section>
    </main>
  );
}
