"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hashAdminPassword, requireAdmin } from "@/lib/admin-auth";
import { deleteRecord, insertRecord, updateRecord } from "@/lib/supabase-admin";

const allowedTables = new Set(["leads", "inquiries", "bookings", "purchases"]);

function safeTable(value: FormDataEntryValue | null) {
  const table = String(value ?? "");
  if (!allowedTables.has(table)) throw new Error("Invalid table.");
  return table;
}

function settingsRedirect(params: Record<string, string>) {
  const query = new URLSearchParams(params);
  redirect(`/admin/settings?${query.toString()}`);
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

export async function createTeamMember(formData: FormData) {
  await requireAdmin();
  const username = String(formData.get("username") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!username || !displayName || password.length < 8) {
    throw new Error("Username, display name, and an 8+ character password are required.");
  }

  if (!["Admin", "User", "Independent Contractor"].includes(role)) {
    throw new Error("Invalid role.");
  }

  await insertRecord("admin_users", {
    username,
    display_name: displayName,
    role,
    password_hash: hashAdminPassword(password),
    is_active: true
  });

  revalidatePath("/admin/settings");
  redirect("/admin/settings");
}

export async function addNotificationRecipient(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const label = String(formData.get("label") ?? "").trim().slice(0, 80);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    settingsRedirect({ error: "Enter a valid notification email." });
  }

  try {
    await insertRecord("notification_recipients", {
      email,
      label: label || null,
      is_active: true
    });
  } catch {
    settingsRedirect({
      error:
        "Notification emails need the latest Supabase schema before they can be saved."
    });
  }

  revalidatePath("/admin/settings");
  settingsRedirect({ saved: "notification-email" });
}

export async function removeNotificationRecipient(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing recipient ID.");

  try {
    await updateRecord("notification_recipients", id, { is_active: false });
  } catch {
    settingsRedirect({
      error:
        "Notification emails need the latest Supabase schema before they can be changed."
    });
  }
  revalidatePath("/admin/settings");
  settingsRedirect({ saved: "notification-email" });
}
