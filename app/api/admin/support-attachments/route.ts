import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createPrivateObjectUrl } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const path = new URL(request.url).searchParams.get("path") || "";
  if (!path.startsWith("feather-by-hanna/") || path.includes("..")) {
    return NextResponse.json({ error: "Invalid attachment path." }, { status: 400 });
  }
  try {
    const url = await createPrivateObjectUrl(
      process.env.SUPABASE_SUPPORT_BUCKET || "support-attachments",
      path,
      60
    );
    return NextResponse.redirect(url, { status: 302 });
  } catch {
    return NextResponse.json({ error: "Attachment is unavailable." }, { status: 404 });
  }
}
