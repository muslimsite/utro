const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidHHMM(value: string): boolean {
  return HHMM_RE.test(value);
}

export function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function hhmmToMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToHHMM(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Adds (or subtracts) minutes to a "HH:MM" value, wrapping around midnight.
export function addMinutes(hhmm: string, delta: number): string {
  return minutesToHHMM(hhmmToMinutes(hhmm) + delta);
}

// "YYYY-MM-DD" for the given instant, as seen from the given IANA timezone.
export function localDateString(timezone: string, at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

// "HH:MM" (24h) for the given instant, as seen from the given IANA timezone.
export function localTimeString(timezone: string, at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(at);
}

// Pure calendar-day arithmetic on a "YYYY-MM-DD" string (timezone-agnostic).
export function offsetDateString(date: string, dayDelta: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day));
  dt.setUTCDate(dt.getUTCDate() + dayDelta);
  return dt.toISOString().slice(0, 10);
}

// Whole-day difference between two "YYYY-MM-DD" strings (timezone-agnostic), `to` minus `from`.
export function daysBetweenDateStrings(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const fromUtc = Date.UTC(fy, fm - 1, fd);
  const toUtc = Date.UTC(ty, tm - 1, td);
  return Math.round((toUtc - fromUtc) / 86_400_000);
}

export function isOnTime(localTime: string, goalTime: string, graceMinutes: number): boolean {
  const deadline = addMinutes(goalTime, graceMinutes);
  return hhmmToMinutes(localTime) <= hhmmToMinutes(deadline);
}
