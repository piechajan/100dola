// Calendar helpers — ICS soubor + Google Calendar URL pro ISAAC test rezervaci.
// Server + client safe (žádné Node-only).

interface CalendarEvent {
  uid: string;
  title: string;
  description: string;
  location: string;
  startIso: string; // ISO 8601 UTC nebo s timezone
  endIso: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toICSDate(iso: string): string {
  // ISO `2026-05-29T08:00:00+02:00` → `20260529T060000Z` (UTC)
  const d = new Date(iso);
  return (
    d.getUTCFullYear() +
    pad2(d.getUTCMonth() + 1) +
    pad2(d.getUTCDate()) +
    "T" +
    pad2(d.getUTCHours()) +
    pad2(d.getUTCMinutes()) +
    pad2(d.getUTCSeconds()) +
    "Z"
  );
}

export function buildIcs(ev: CalendarEvent): string {
  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//100dola sport//ISAAC test//CS",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${ev.uid}`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${toICSDate(ev.startIso)}`,
    `DTEND:${toICSDate(ev.endIso)}`,
    `SUMMARY:${escape(ev.title)}`,
    `DESCRIPTION:${escape(ev.description)}`,
    `LOCATION:${escape(ev.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function buildGoogleCalendarUrl(ev: CalendarEvent): string {
  // https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=...&details=...&location=...
  const dates = `${toICSDate(ev.startIso)}/${toICSDate(ev.endIso)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates,
    details: ev.description,
    location: ev.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
