import { describe, expect, it } from 'vitest'
import { buildDeadlineIcs, deadlineEvents } from '@/lib/calendar'
import type { TrackedRow, TrackSnapshot } from '@/lib/tracker'

const NOW = new Date('2026-07-01T12:00:00Z')

function makeSnapshot(overrides: Partial<TrackSnapshot> = {}): TrackSnapshot {
  return {
    role: 'Data Science Placement',
    companyName: 'Helixon Bio',
    location: 'Cambridge, UK',
    sector: 'Biotech & Pharma',
    salaryMin: 22000,
    salaryMax: 24000,
    currency: 'GBP',
    workMode: 'HYBRID',
    deadline: '2026-11-01',
    applyUrl: null,
    isDemo: true,
    ...overrides,
  }
}

function makeRow(
  overrides: Omit<Partial<TrackedRow>, 'snapshot'> & { snapshot?: Partial<TrackSnapshot> } = {}
): TrackedRow {
  const { snapshot, ...rest } = overrides
  return {
    id: 'row-1',
    opportunity_ref: 'demo-1',
    state: 'SAVED',
    snapshot: makeSnapshot(snapshot),
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
    ...rest,
  }
}

/** Undo RFC 5545 line folding so content can be asserted on. */
function unfold(ics: string): string {
  return ics.replace(/\r\n /g, '')
}

describe('deadlineEvents', () => {
  it('keeps only SAVED/APPLIED rows with parseable deadlines', () => {
    const rows = [
      makeRow({ id: 'a', opportunity_ref: 'demo-1', state: 'SAVED' }),
      makeRow({ id: 'b', opportunity_ref: 'demo-2', state: 'APPLIED' }),
      makeRow({ id: 'c', opportunity_ref: 'demo-3', state: 'INTERVIEW' }),
      makeRow({ id: 'd', opportunity_ref: 'demo-4', snapshot: { deadline: null } }),
      makeRow({ id: 'e', opportunity_ref: 'demo-5', snapshot: { deadline: 'ASAP' } }),
    ]
    expect(deadlineEvents(rows).map((r) => r.id)).toEqual(['a', 'b'])
  })
})

describe('buildDeadlineIcs', () => {
  it('builds a valid envelope even with no events', () => {
    const ics = buildDeadlineIcs([], NOW)
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('PRODID:')
    expect(ics).toContain('METHOD:PUBLISH')
    expect(ics).toContain('X-WR-CALNAME:Placement deadlines')
    expect(ics).not.toContain('BEGIN:VEVENT')
  })

  it('emits one all-day VEVENT per tracked deadline with an exclusive end', () => {
    const ics = buildDeadlineIcs(
      [
        makeRow({ opportunity_ref: 'demo-1' }),
        makeRow({ id: 'row-2', opportunity_ref: 'demo-2', state: 'APPLIED' }),
      ],
      NOW
    )
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    expect(ics).toContain('DTSTART;VALUE=DATE:20261101')
    expect(ics).toContain('DTEND;VALUE=DATE:20261102')
    expect(ics).toContain('DTSTAMP:20260701T120000Z')
  })

  it('escapes TEXT values per RFC 5545', () => {
    const ics = unfold(
      buildDeadlineIcs(
        [makeRow({ snapshot: { role: 'Data Engineer; Analytics', companyName: 'Foo, Bar Ltd' } })],
        NOW
      )
    )
    expect(ics).toContain('SUMMARY:Data Engineer\\; Analytics — Foo\\, Bar Ltd (placement deadline)')
  })

  it('uses CRLF line endings exclusively', () => {
    const ics = buildDeadlineIcs([makeRow()], NOW)
    // Every \n must be part of a \r\n pair.
    expect(ics.replace(/\r\n/g, '').includes('\n')).toBe(false)
    expect(ics.endsWith('\r\n')).toBe(true)
  })

  it('folds long lines to 75 octets without splitting multi-byte characters', () => {
    const longRole = 'Placement — £-heavy rôle title '.repeat(6)
    const ics = buildDeadlineIcs([makeRow({ snapshot: { role: longRole } })], NOW)
    const encoder = new TextEncoder()
    for (const line of ics.split('\r\n')) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75)
    }
    // Unfolding restores the full escaped summary.
    expect(unfold(ics)).toContain(`SUMMARY:${longRole}`.replace(/,/g, '\\,'))
  })

  it('attaches a display alarm one day before each deadline', () => {
    const ics = buildDeadlineIcs([makeRow()], NOW)
    expect(ics).toContain('BEGIN:VALARM')
    expect(ics).toContain('ACTION:DISPLAY')
    expect(ics).toContain('TRIGGER:-P1D')
    expect(ics).toContain('END:VALARM')
  })
})
