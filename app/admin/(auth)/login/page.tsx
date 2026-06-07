import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  if (await isAdminAuthenticated()) redirect("/admin/dashboard");
  const hasError = (await searchParams)?.error === "invalid";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030711] px-5">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.045] p-7 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-400 text-slate-950">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
          Elevate Systems
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Admin login</h1>
        <p className="mt-3 leading-7 text-white/55">
          Secure access to leads, inquiries, bookings, and audit activity.
        </p>

        <form action="/api/admin/login" className="mt-7 space-y-4" method="post">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-white/70">Username</span>
            <input
              autoComplete="username"
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-white outline-none ring-sky-300/40 focus:ring-2"
              name="username"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-white/70">Password</span>
            <input
              autoComplete="current-password"
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-white outline-none ring-sky-300/40 focus:ring-2"
              name="password"
              required
              type="password"
            />
          </label>
          {hasError ? (
            <p className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              Invalid username or password.
            </p>
          ) : null}
          <Button className="w-full" size="lg" type="submit">
            Sign in
          </Button>
        </form>
      </div>
    </main>
  );
}
