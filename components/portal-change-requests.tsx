"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
type Ticket = {
  id: string;
  request_title: string;
  message: string;
  status: string;
  priority: string;
  platform_version: number;
};
const statuses = [
  "Submitted",
  "Reviewing",
  "Approved",
  "In Progress",
  "Needs Information",
  "Ready for Review",
  "Completed",
  "Declined",
  "Cancelled",
];
export function PortalChangeRequests({ business }: { business: string }) {
  const [items, setItems] = useState<Ticket[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [canCreate, setCanCreate] = useState(false),
    [canManage, setCanManage] = useState(false),
    [requestId, setRequestId] = useState(""),
    [success, setSuccess] = useState("");
  const call = useCallback(
    async (method = "GET", body?: unknown) => {
      const response = await fetch("/api/v1/change-requests", {
        method,
        headers: { "Content-Type": "application/json", "X-Elevate-Business": business },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Unable to save your request.");
      return data.data;
    },
    [business],
  );
  async function refresh() {
    const data = await call();
    setItems(data.items);
    setCanCreate(data.canCreate);
    setCanManage(data.canManage);
  }
  useEffect(() => {
    setRequestId(crypto.randomUUID());
    setItems([]);
    setError("");
    setCanCreate(false);
    setCanManage(false);
    let active = true;
    call()
      .then((data) => {
        if (active) {
          setItems(data.items);
          setCanCreate(data.canCreate);
          setCanManage(data.canManage);
        }
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      });
    return () => {
      active = false;
    };
  }, [call]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await call("POST", {
        requestId,
        title: data.get("title"),
        description: data.get("description"),
        priority: data.get("priority"),
        area: data.get("area") || null,
      });
      setRequestId(crypto.randomUUID());
      form.reset();
      setSuccess("Your request has been saved.");
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save.");
    } finally {
      setLoading(false);
    }
  }
  async function update(item: Ticket, status: string) {
    setError("");
    setLoading(true);
    try {
      await call("PATCH", { id: item.id, status, version: item.platform_version });
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update.");
    } finally {
      setLoading(false);
    }
  }
  const input = "mt-2 block w-full rounded-md border border-white/15 bg-[#07101d] p-3 text-white";
  return (
    <div className="mt-8 max-w-3xl">
      {error && (
        <p role="alert" className="mb-5 text-rose-300">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mb-5 text-emerald-300">
          {success}
        </p>
      )}
      {canCreate && (
        <form onSubmit={submit} className="space-y-5 border-b border-white/10 pb-8">
          <label className="block text-sm">
            What would you like changed?
            <input name="title" maxLength={160} required className={input} />
          </label>
          <label className="block text-sm">
            Details
            <textarea name="description" maxLength={8000} required rows={4} className={input} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm">
              Priority
              <select name="priority" defaultValue="Normal" className={input}>
                {["Low", "Normal", "High", "Urgent"].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Page or area (optional)
              <input name="area" maxLength={500} className={input} />
            </label>
          </div>
          <Button disabled={loading}>Submit Request</Button>
        </form>
      )}
      <h2 className="mt-8 text-lg font-semibold">Your requests</h2>
      {!items.length && !error && <p className="mt-5 text-white/50">No requests yet.</p>}
      <ul className="mt-4 divide-y divide-white/10">
        {items.map((item) => (
          <li key={item.id} className="py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-medium">{item.request_title}</h3>
              {canManage ? (
                <select
                  aria-label={`Status for ${item.request_title}`}
                  value={item.status}
                  disabled={loading}
                  onChange={(event) => update(item, event.target.value)}
                  className="rounded-md border border-white/15 bg-[#07101d] p-2 text-sm"
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              ) : (
                <span className="text-sm text-sky-300">{item.status}</span>
              )}
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-white/60">
              {item.message}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
