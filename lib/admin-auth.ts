import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "elevate_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "development-only-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;

  const usernameBuffer = Buffer.from(username);
  const expectedUsernameBuffer = Buffer.from(expectedUsername);
  const passwordBuffer = Buffer.from(password);
  const expectedPasswordBuffer = Buffer.from(expectedPassword);

  return (
    usernameBuffer.length === expectedUsernameBuffer.length &&
    passwordBuffer.length === expectedPasswordBuffer.length &&
    timingSafeEqual(usernameBuffer, expectedUsernameBuffer) &&
    timingSafeEqual(passwordBuffer, expectedPasswordBuffer)
  );
}

export function createAdminSessionValue() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  return `${expiresAt}.${sign(String(expiresAt))}`;
}

export function verifyAdminSessionValue(value?: string) {
  if (!value) return false;
  const [expiresAt, signature] = value.split(".");
  if (!expiresAt || !signature || Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;

  const expected = Buffer.from(sign(expiresAt));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyAdminSessionValue(cookieStore.get(COOKIE_NAME)?.value);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}

export const adminSession = {
  cookieName: COOKIE_NAME,
  duration: SESSION_DURATION_SECONDS
};
