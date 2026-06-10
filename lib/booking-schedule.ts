export const BOOKING_TIME_ZONE = "America/New_York";
export const BOOKING_DURATION_MINUTES = 30;
export const BOOKING_WINDOW_DAYS = 45;
export const BOOKING_START_HOUR = 10;
export const BOOKING_END_HOUR = 17;

export function dateKeyInTimeZone(date: Date, timeZone = BOOKING_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function timeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour) % 24,
    Number(values.minute),
    Number(values.second)
  );
  return asUtc - date.getTime();
}

export function zonedDateTimeToUtc(
  dateKey: string,
  hour: number,
  minute: number,
  timeZone = BOOKING_TIME_ZONE
) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const initial = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const firstPass = new Date(initial.getTime() - timeZoneOffsetMs(initial, timeZone));
  return new Date(initial.getTime() - timeZoneOffsetMs(firstPass, timeZone));
}

export function generateSlotsForDate(dateKey: string) {
  const noon = zonedDateTimeToUtc(dateKey, 12, 0);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKING_TIME_ZONE,
    weekday: "short"
  }).format(noon);
  if (weekday === "Sat" || weekday === "Sun") return [];

  const slots: string[] = [];
  for (
    let minutes = BOOKING_START_HOUR * 60;
    minutes < BOOKING_END_HOUR * 60;
    minutes += BOOKING_DURATION_MINUTES
  ) {
    slots.push(
      zonedDateTimeToUtc(dateKey, Math.floor(minutes / 60), minutes % 60).toISOString()
    );
  }
  return slots;
}

export function formatBookingTime(value: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKING_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(typeof value === "string" ? new Date(value) : value);
}

export function isAllowedBookingSlot(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now() + 60 * 60 * 1000) {
    return false;
  }
  const dateKey = dateKeyInTimeZone(date);
  return generateSlotsForDate(dateKey).includes(date.toISOString());
}
