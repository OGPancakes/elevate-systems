import { NextResponse } from "next/server";

import {
  adminSession,
  createAdminSessionValue,
  verifyAdminCredentials
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminCredentials(username, password)) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("error", "invalid");
    return NextResponse.redirect(url, { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/admin/dashboard", request.url), {
    status: 303
  });
  response.cookies.set(adminSession.cookieName, createAdminSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: adminSession.duration,
    path: "/"
  });
  return response;
}
