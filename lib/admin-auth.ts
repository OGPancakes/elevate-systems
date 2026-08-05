import "server-only";

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminUserRecord, listRecords } from "@/lib/supabase-admin";

const COOKIE_NAME = "elevate_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "development-only-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function safeCompare(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return (
    valueBuffer.length === expectedBuffer.length &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  );
}

function verifyEnvAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;

  return safeCompare(username, expectedUsername) && safeCompare(password, expectedPassword);
}

export function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPasswordHash(password: string, storedHash: string) {
  const [method, salt, expectedHash] = storedHash.split(":");
  if (method !== "scrypt" || !salt || !expectedHash) return false;
  const actualHash = scryptSync(password, salt, 64).toString("hex");
  return safeCompare(actualHash, expectedHash);
}

async function verifyStoredAdminUser(username: string, password: string) {
  try {
    const users = await listRecords<AdminUserRecord>(
      "admin_users",
      `select=*&username=eq.${encodeURIComponent(username)}&is_active=eq.true&limit=1`
    );
    const user = users[0];
    return Boolean(user && verifyPasswordHash(password, user.password_hash));
  } catch {
    return false;
  }
}

export async function verifyAdminCredentials(username: string, password: string) {
  if (verifyEnvAdminCredentials(username, password)) return true;
  return verifyStoredAdminUser(username, password);
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
