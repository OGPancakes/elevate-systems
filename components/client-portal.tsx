"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  Activity,
  ArrowRight,
  Building2,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Plug,
  ShoppingBag,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalChangeRequests } from "@/components/portal-change-requests";

type Business = { id: string; name: string };
type Row = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  kind?: string;
  event_type?: string;
  created_at: string;
};
const navigation = [
  {
    title: "Business",
    items: [
      ["Overview", LayoutDashboard],
      ["Customers", Users],
      ["Leads", CircleUserRound],
      ["Orders", ShoppingBag],
      ["Submissions", ClipboardList],
      ["Activity", Activity],
    ],
  },
  {
    title: "Elevate",
    items: [
      ["Services", Wrench],
      ["Billing", CreditCard],
      ["Request a Change", ClipboardList],
    ],
  },
  {
    title: "Settings",
    items: [
      ["Team", Users],
      ["Integrations", Plug],
    ],
  },
] as const;
const resources: Record<string, string> = {
  Customers: "customers",
  Leads: "leads",
  Submissions: "submissions",
  Activity: "activity",
};

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/v1/${path}`, { ...init, cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || "Unable to load this information.");
  return result.data;
}

export function ClientPortal() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [business, setBusiness] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [section, setSection] = useState("Overview");
  const [menu, setMenu] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currentScope = useRef("");
  currentScope.current = `${signedIn}:${business}:${section}`;

  const loadBusinesses = useCallback(async () => {
    const items = (await api("businesses")) as Business[];
    setBusinesses(items);
    setBusiness(items[0]?.id ?? "");
    setSignedIn(true);
  }, []);
  useEffect(() => {
    loadBusinesses()
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, [loadBusinesses]);
  useEffect(() => {
    setRows([]);
    setCursor(null);
    setError("");
    setLoading(false);
    if (!business || !signedIn) return;
    const resource = section === "Overview" ? "activity" : resources[section];
    if (!resource) return;
    const controller = new AbortController();
    setLoading(true);
    api(resource, { headers: { "X-Elevate-Business": business }, signal: controller.signal })
      .then((result) => {
        setRows(result.items);
        setCursor(result.nextCursor);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [business, section, signedIn]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      await api("session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      await loadBusinesses();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await api("session", { method: "DELETE" });
      setSignedIn(false);
      setRows([]);
      setBusinesses([]);
      setBusiness("");
      setError("");
    } catch {
      setError("Sign-out could not be completed. Please try again.");
    }
  }

  async function more() {
    const scope = currentScope.current;
    setLoading(true);
    try {
      const result = await api(
        `${section === "Overview" ? "activity" : resources[section]}?cursor=${cursor}`,
        { headers: { "X-Elevate-Business": business } },
      );
      if (currentScope.current === scope) {
        setRows((current) => [...current, ...result.items]);
        setCursor(result.nextCursor);
      }
    } catch (reason) {
      if (currentScope.current === scope)
        setError(reason instanceof Error ? reason.message : "Unable to load more.");
    } finally {
      if (currentScope.current === scope) setLoading(false);
    }
  }

  if (initializing)
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-[#030711] text-white/60"
        role="status"
      >
        Opening your workspace...
      </main>
    );
  if (!signedIn)
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030711] px-5 py-12">
        <div className="w-full max-w-sm">
          <Image
            src="/elevate-logo-transparent.png"
            alt="Elevate Systems"
            width={128}
            height={70}
            className="mb-8 object-contain"
          />
          <h1 className="text-3xl font-semibold">Client Portal</h1>
          <p className="mt-3 text-white/60">Sign in to your business workspace.</p>
          <form className="mt-8 space-y-5" onSubmit={login}>
            <label className="block text-sm">
              Email
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                className="mt-2 block w-full rounded-md border border-white/15 bg-white/5 p-3"
              />
            </label>
            <label className="block text-sm">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 block w-full rounded-md border border-white/15 bg-white/5 p-3"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-rose-300">
                {error}
              </p>
            )}
            <Button className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <a
            href="mailto:support@elevatesystems.us"
            className="mt-6 inline-block text-sm text-sky-300"
          >
            Need access? Contact Elevate
          </a>
        </div>
      </main>
    );

  return (
    <div className="min-h-screen bg-[#060a12] text-white md:grid md:grid-cols-[230px_1fr]">
      <header className="flex h-20 items-center justify-between border-b border-white/10 px-5 md:hidden">
        <Image src="/elevate-logo-transparent.png" alt="Elevate Systems" width={100} height={60} />
        <button
          aria-label={menu ? "Close navigation" : "Open navigation"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
          className="p-3"
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      <aside
        className={`${menu ? "block" : "hidden"} border-r border-white/10 bg-[#030711] p-5 md:block`}
      >
        <Image
          src="/elevate-logo-transparent.png"
          alt="Elevate Systems"
          width={128}
          height={70}
          className="hidden md:block"
        />
        {navigation.map((group) => (
          <nav key={group.title} aria-label={group.title} className="mt-7">
            <p className="mb-2 px-3 text-xs text-white/40">{group.title}</p>
            {group.items.map(([label, Icon]) => (
              <button
                key={label}
                onClick={() => {
                  setSection(label);
                  setMenu(false);
                }}
                aria-current={section === label ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm ${section === label ? "bg-sky-300/10 text-sky-300" : "text-white/60 hover:bg-white/5"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        ))}
        <button
          onClick={logout}
          className="mt-8 flex items-center gap-3 px-3 py-3 text-sm text-white/60"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </aside>
      <main className="min-w-0 p-5 sm:p-8 lg:p-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <h1 className="text-2xl font-semibold">{section}</h1>
          <label className="flex max-w-full items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-sky-300" />
            <span className="sr-only">Business</span>
            <select
              className="max-w-full rounded-md border border-white/15 bg-[#07101d] p-2"
              value={business}
              onChange={(event) => setBusiness(event.target.value)}
            >
              {businesses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && (
          <p role="alert" className="mt-6 text-rose-300">
            {error}
          </p>
        )}
        {!business ? (
          <p className="mt-8 text-white/60">
            Your account has no business access yet. Contact Elevate to connect your workspace.
          </p>
        ) : (
          <>
            {section === "Overview" && (
              <div className="py-8">
                <h2 className="text-xl font-medium">
                  Welcome to {businesses.find((item) => item.id === business)?.name}.
                </h2>
                <p className="mt-2 text-white/50">Your latest business activity appears below.</p>
              </div>
            )}
            {section === "Request a Change" ? (
              <PortalChangeRequests key={business} business={business} />
            ) : section === "Overview" || resources[section] ? (
              <div className="mt-6">
                {loading && !rows.length ? (
                  <p role="status" className="py-8 text-white/50">
                    Loading...
                  </p>
                ) : !rows.length && !error ? (
                  <p className="py-8 text-white/50">
                    No {section === "Overview" ? "activity" : section.toLowerCase()} yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-white/10">
                    {rows.map((row) => (
                      <li
                        key={row.id}
                        className="flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="break-words font-medium">
                            {row.name ??
                              row.event_type?.replaceAll(".", " ") ??
                              (row.kind ? `${row.kind} consultation` : "New lead")}
                          </p>
                          {row.email && (
                            <p className="mt-1 break-all text-sm text-white/50">{row.email}</p>
                          )}
                          {row.status && <p className="mt-1 text-sm text-sky-300">{row.status}</p>}
                        </div>
                        <time className="shrink-0 text-sm text-white/40" dateTime={row.created_at}>
                          {new Date(row.created_at).toLocaleString()}
                        </time>
                      </li>
                    ))}
                  </ul>
                )}
                {cursor && (
                  <Button disabled={loading} onClick={more} className="mt-6">
                    Load more
                  </Button>
                )}
              </div>
            ) : (
              <div className="py-10">
                <h2 className="text-xl font-medium">{section} is not connected yet.</h2>
                <p className="mt-3 max-w-lg leading-7 text-white/50">
                  Contact your Elevate team for help with {section.toLowerCase()}.
                </p>
                <a
                  href="mailto:support@elevatesystems.us"
                  className="mt-5 inline-block text-sky-300"
                >
                  Contact Elevate
                </a>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
