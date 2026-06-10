"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { deleteRecord, updateRecord } from "@/lib/supabase-admin";

const allowedTables = new Set(["leads", "inquiries", "bookings", "purchases"]);

function safeTable(value: FormDataEntryValue | null) {
  const table = String(value ?? "");
  if (!allowedTables.has(table)) throw new Error("Invalid table.");
  return table;
}

export async function updateAdminRecord(formData: FormData) {
  await requireAdmin();
  const table = safeTable(formData.get("table"));
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("notes") ?? "").slice(0, 5000);
  const returnTo = String(formData.get("returnTo") ?? `/admin/${table}`);

  if (!id || !status) throw new Error("Missing record data.");
  await updateRecord(table, id, { status, notes });
  revalidatePath("/admin");
  redirect(returnTo);
}

export async function deleteAdminRecord(formData: FormData) {
  await requireAdmin();
  const table = safeTable(formData.get("table"));
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing record ID.");

  await deleteRecord(table, id);
  revalidatePath("/admin");
  redirect(`/admin/${table}`);
}
