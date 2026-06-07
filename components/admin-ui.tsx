import Link from "next/link";

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    New: "border-sky-300/20 bg-sky-300/10 text-sky-200",
    Contacted: "border-amber-300/20 bg-amber-300/10 text-amber-200",
    Booked: "border-violet-300/20 bg-violet-300/10 text-violet-200",
    Closed: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    Upcoming: "border-sky-300/20 bg-sky-300/10 text-sky-200",
    Completed: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    Lost: "border-red-300/20 bg-red-300/10 text-red-200",
    Cancelled: "border-red-300/20 bg-red-300/10 text-red-200",
    "No-show": "border-orange-300/20 bg-orange-300/10 text-orange-200",
    Spam: "border-red-300/20 bg-red-300/10 text-red-200"
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status] ?? "border-white/10 bg-white/5 text-white/60"}`}>
      {status}
    </span>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/10 px-5 py-12 text-center text-sm text-white/45">
      No {label} found.
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">{description}</p>
    </div>
  );
}

export function SearchBar({
  action,
  defaultValue,
  placeholder
}: {
  action: string;
  defaultValue?: string;
  placeholder: string;
}) {
  return (
    <form action={action} className="mb-5 flex gap-2">
      <input
        className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none ring-sky-300/30 placeholder:text-white/30 focus:ring-2"
        defaultValue={defaultValue}
        name="q"
        placeholder={placeholder}
      />
      <button className="rounded-md bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950">
        Search
      </button>
    </form>
  );
}

export function RecordLink({
  href,
  title,
  subtitle
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link className="group block" href={href}>
      <p className="font-medium text-white group-hover:text-sky-300">{title}</p>
      <p className="mt-1 text-xs text-white/40">{subtitle}</p>
    </Link>
  );
}
