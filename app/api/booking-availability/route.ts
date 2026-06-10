import { NextResponse } from "next/server";

import {
  BOOKING_DURATION_MINUTES,
  BOOKING_TIME_ZONE,
  dateKeyInTimeZone,
  generateSlotsForDate
} from "@/lib/booking-schedule";
import { BookingRecord, listRecords } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "A valid date is required." }, { status: 400 });
  }

  const today = dateKeyInTimeZone(new Date());
  if (date < today) {
    return NextResponse.json({
      date,
      timeZone: BOOKING_TIME_ZONE,
      durationMinutes: BOOKING_DURATION_MINUTES,
      slots: []
    });
  }

  const candidates = generateSlotsForDate(date);
  if (!candidates.length) {
    return NextResponse.json({
      date,
      timeZone: BOOKING_TIME_ZONE,
      durationMinutes: BOOKING_DURATION_MINUTES,
      slots: []
    });
  }

  let booked = new Set<string>();
  try {
    const records = await listRecords<BookingRecord>(
      "bookings",
      `select=selected_datetime&status=eq.Upcoming&selected_datetime=gte.${encodeURIComponent(
        candidates[0]
      )}&selected_datetime=lte.${encodeURIComponent(candidates[candidates.length - 1])}`
    );
    booked = new Set(
      records
        .map((record) => record.selected_datetime)
        .filter((value): value is string => Boolean(value))
        .map((value) => new Date(value).toISOString())
    );
  } catch {
    booked = new Set();
  }

  const nowPlusNotice = Date.now() + 60 * 60 * 1000;
  const slots = candidates
    .filter((slot) => new Date(slot).getTime() > nowPlusNotice)
    .map((slot) => ({ startsAt: slot, available: !booked.has(slot) }));

  return NextResponse.json({
    date,
    timeZone: BOOKING_TIME_ZONE,
    durationMinutes: BOOKING_DURATION_MINUTES,
    slots
  });
}
