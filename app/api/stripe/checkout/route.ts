import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Elevate Systems now uses custom setup fees and monthly subscriptions. Please book a call so we can scope the right system."
    },
    { status: 400 }
  );
}
