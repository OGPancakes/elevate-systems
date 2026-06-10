import "server-only";

export type LeadStatus = "New" | "Contacted" | "Booked" | "Closed" | "Lost";
export type InquiryStatus = "New" | "Contacted" | "Closed" | "Spam";
export type BookingStatus = "Upcoming" | "Completed" | "Cancelled" | "No-show";

export type LeadRecord = {
  id: string;
  name: string;
  business_name: string;
  email: string;
  phone: string | null;
  website_url: string;
  logo_url: string | null;
  logo_storage_path: string | null;
  audit_result: Record<string, unknown>;
  redesign_preview: Record<string, unknown> | null;
  website_snapshot: string | null;
  source: string;
  status: LeadStatus;
  notes: string;
  submitted_at: string;
  created_at: string;
};

export type InquiryRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  message: string;
  service_interest: string | null;
  source: string;
  status: InquiryStatus;
  notes: string;
  submitted_at: string;
  created_at: string;
};

export type BookingRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  business_name: string;
  website_url: string | null;
  selected_datetime: string | null;
  duration_minutes: number;
  timezone: string;
  reason: string;
  service_interest: string | null;
  source: string;
  status: BookingStatus;
  notes: string;
  booked_at: string;
  created_at: string;
};

export type ConversationRecord = {
  id: string;
  lead_id: string | null;
  session_id: string;
  messages: Array<{ role: string; content: string }>;
  captured_name: string | null;
  captured_email: string | null;
  captured_phone: string | null;
  captured_business_name: string | null;
  created_at: string;
  updated_at: string;
};

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  return { url, key };
}

async function supabaseRequest<T>(path: string, init?: RequestInit) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${detail}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function listRecords<T>(table: string, query = "select=*&order=created_at.desc") {
  return supabaseRequest<T[]>(`${table}?${query}`);
}

export async function getRecord<T>(table: string, id: string) {
  const rows = await supabaseRequest<T[]>(
    `${table}?id=eq.${encodeURIComponent(id)}&select=*&limit=1`
  );
  return rows[0] ?? null;
}

export async function insertRecord<T>(table: string, record: Record<string, unknown>) {
  const rows = await supabaseRequest<T[]>(table, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(record)
  });
  return rows[0] ?? null;
}

export async function upsertRecord<T>(
  table: string,
  record: Record<string, unknown>,
  conflictColumn: string
) {
  const rows = await supabaseRequest<T[]>(
    `${table}?on_conflict=${encodeURIComponent(conflictColumn)}`,
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(record)
    }
  );
  return rows[0] ?? null;
}

export function updateRecord(
  table: string,
  id: string,
  record: Record<string, unknown>
) {
  return supabaseRequest<void>(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(record)
  });
}

export function updateRecordBy(
  table: string,
  column: string,
  value: string,
  record: Record<string, unknown>
) {
  return supabaseRequest<void>(
    `${table}?${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(record)
    }
  );
}

export function deleteRecord(table: string, id: string) {
  return supabaseRequest<void>(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
}

export async function countRecords(table: string, filter = "") {
  const { url, key } = config();
  const response = await fetch(
    `${url}/rest/v1/${table}?select=id${filter ? `&${filter}` : ""}`,
    {
      method: "HEAD",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact"
      },
      cache: "no-store"
    }
  );
  if (!response.ok) return 0;
  const range = response.headers.get("content-range") ?? "";
  return Number(range.split("/")[1] ?? 0);
}
