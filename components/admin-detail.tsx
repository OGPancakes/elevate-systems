export function DetailItem({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/35">{label}</p>
      <div className="mt-2 break-words text-sm leading-6 text-white/75">{children || "—"}</div>
    </div>
  );
}

export function DetailSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <h2 className="font-semibold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
