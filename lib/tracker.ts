// Shared types + helpers for the student Application Tracker. Isomorphic
// (client + server safe) — no Supabase or server-only imports here.

import type { WorkMode } from './constants'
import type { OpportunityView } from './opportunities'

export const TRACK_STATES = ['SAVED', 'APPLIED'] as const
export type TrackState = (typeof TRACK_STATES)[number]

/** Items closing within this many days are surfaced as "closing soon". */
export const CLOSING_SOON_DAYS = 14

/** Denormalised display copy of an opportunity, stored on the tracked row. */
export type TrackSnapshot = {
  role: string
  companyName: string
  location: string
  sector: string
  salaryMin: number
  salaryMax: number
  currency: string
  workMode: WorkMode
  deadline: string | null
  applyUrl: string | null
  isDemo: boolean
}

/** A row of public.tracked_opportunities, as returned to the client. */
export type TrackedRow = {
  id: string
  opportunity_ref: string
  state: TrackState
  snapshot: TrackSnapshot
  created_at: string
  updated_at: string
}

export function isTrackState(value: unknown): value is TrackState {
  return value === 'SAVED' || value === 'APPLIED'
}

/** Build the stored snapshot from an opportunity view (server-side source of truth). */
export function snapshotFromView(o: OpportunityView): TrackSnapshot {
  return {
    role: o.role,
    companyName: o.companyName,
    location: o.location,
    sector: o.sector,
    salaryMin: o.salaryMin,
    salaryMax: o.salaryMax,
    currency: o.currency,
    workMode: o.workMode,
    deadline: o.deadline,
    applyUrl: o.applyUrl,
    isDemo: o.isDemo,
  }
}

/**
 * Whole days from now until a deadline, or null if there's no/invalid deadline.
 * Negative means the deadline has passed. Compared at day granularity.
 */
export function daysUntil(deadline: string | null, now: Date = new Date()): number | null {
  if (!deadline) return null
  const target = new Date(deadline)
  if (Number.isNaN(target.getTime())) return null
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const startOfTarget = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate())
  return Math.round((startOfTarget - startOfToday) / 86_400_000)
}

/** True for a deadline that is in the future and within CLOSING_SOON_DAYS. */
export function isClosingSoon(deadline: string | null, now: Date = new Date()): boolean {
  const d = daysUntil(deadline, now)
  return d !== null && d >= 0 && d <= CLOSING_SOON_DAYS
}

/** Human label + urgency tone for a deadline countdown badge. */
export function deadlineLabel(
  deadline: string | null,
  now: Date = new Date()
): { text: string; tone: 'red' | 'amber' | 'muted' } | null {
  const d = daysUntil(deadline, now)
  if (d === null) return null
  if (d < 0) return { text: 'Closed', tone: 'muted' }
  if (d === 0) return { text: 'Closes today', tone: 'red' }
  if (d === 1) return { text: 'Closes tomorrow', tone: 'red' }
  if (d <= 7) return { text: `Closes in ${d} days`, tone: 'red' }
  if (d <= CLOSING_SOON_DAYS) return { text: `Closes in ${d} days`, tone: 'amber' }
  return { text: `Closes in ${d} days`, tone: 'muted' }
}
