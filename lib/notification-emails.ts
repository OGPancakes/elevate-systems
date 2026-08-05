import "server-only";

import { listRecords, NotificationRecipientRecord } from "@/lib/supabase-admin";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEnvRecipients() {
  return (process.env.LEAD_NOTIFICATION_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => emailPattern.test(email));
}

export async function getNotificationRecipients() {
  const recipients = new Set(parseEnvRecipients());
  try {
    const rows = await listRecords<NotificationRecipientRecord>(
      "notification_recipients",
      "select=id,email,label,is_active,created_at&is_active=eq.true&order=created_at.desc"
    );
    rows.forEach((row) => {
      const email = row.email.trim().toLowerCase();
      if (emailPattern.test(email)) recipients.add(email);
    });
  } catch {
    // Keep env-based notifications working before the schema is applied.
  }

  return [...recipients];
}

export async function sendLeadNotification(input: {
  subject: string;
  html?: string;
  text?: string;
}) {
  if (!process.env.RESEND_API_KEY) return false;
  const recipients = await getNotificationRecipients();
  if (!recipients.length) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "Elevate Systems <leads@elevatesystems.us>",
      to: recipients,
      subject: input.subject,
      html: input.html,
      text: input.text
    })
  });

  return response.ok;
}
