// Build an iCalendar (.ics, RFC 5545) feed of a student's placement deadlines
// from their tracked opportunities. Pure string building — no network, no DB.

import type { TrackedRow } from './tracker'

const PRODID = '-//PlacementOS//Placement Tracker//EN'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** YYYYMMDD from a date's UTC parts (deadlines are calendar dates). */
function toDateValue(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`
}

/** YYYYMMDDTHHMMSSZ — a UTC timestamp for DTSTAMP. */
function toTimestamp(d: Date): string {
  return `${toDateValue(d)}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

/** Escape a TEXT value per RFC 5545 §3.3.11 (backslash, comma, semicolon, newline). */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/**
 * Fold a content line to ≤75 OCTETS with CRLF + single-space continuations
 * (RFC 5545 §3.1). Iterates by code point so a multi-byte UTF-8 character
 * (e.g. "—" = 3 bytes, "£" = 2 bytes) is never split across a fold.
 */
function foldLine(line: string): string {
  const encoder = new TextEncoder()
  if (encoder.encode(line).length <= 75) return line

  const segments: string[] = []
  let current = ''
  let currentBytes = 0
  let limit = 75 // first line has no leading space; continuations reserve 1 octet for it
  for (const ch of line) {
    const chBytes = encoder.encode(ch).length
    if (currentBytes + chBytes > limit) {
      segments.push(current)
      current = ch
      currentBytes = chBytes
      limit = 74
    } else {
      current += ch
      currentBytes += chBytes
    }
  }
  if (current) segments.push(current)
  return segments.map((seg, i) => (i === 0 ? seg : ' ' + seg)).join('\r\n')
}

/** The tracked rows that should appear as calendar deadlines. */
export function deadlineEvents(items: TrackedRow[]): TrackedRow[] {
  return items.filter(
    (i) =>
      (i.state === 'SAVED' || i.state === 'APPLIED') &&
      i.snapshot.deadline !== null &&
      !Number.isNaN(new Date(i.snapshot.deadline).getTime())
  )
}

/** Build the full VCALENDAR document (CRLF-terminated) for the given items. */
export function buildDeadlineIcs(items: TrackedRow[], now: Date = new Date()): string {
  const events = deadlineEvents(items)
  const stamp = toTimestamp(now)
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Placement deadlines',
  ]

  for (const item of events) {
    const start = new Date(item.snapshot.deadline as string)
    const endExclusive = new Date(start.getTime() + 24 * 60 * 60 * 1000) // all-day end is exclusive
    const stageLabel = item.state === 'SAVED' ? 'Saved — to apply' : 'Applied'
    const summary = `${item.snapshot.role} — ${item.snapshot.companyName} (placement deadline)`
    const descParts = [`Stage: ${stageLabel}.`]
    if (item.snapshot.applyUrl) descParts.push(`Apply: ${item.snapshot.applyUrl}`)
    descParts.push('Tracked on PlacementOS.')

    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeText(item.opportunity_ref)}@placementos`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${toDateValue(start)}`,
      `DTEND;VALUE=DATE:${toDateValue(endExclusive)}`,
      `SUMMARY:${escapeText(summary)}`,
      `DESCRIPTION:${escapeText(descParts.join(' '))}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(`Placement deadline tomorrow: ${item.snapshot.role}`)}`,
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT'
    )
  }

  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

/**
 * Generate the .ics and trigger a browser download. Returns how many events
 * were exported (0 if there were no deadlines, in which case nothing happens).
 */
export function downloadDeadlineIcs(items: TrackedRow[]): number {
  const events = deadlineEvents(items)
  if (events.length === 0) return 0

  const blob = new Blob([buildDeadlineIcs(items)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'placement-deadlines.ics'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
  return events.length
}
