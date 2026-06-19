// Shared types + helpers for the student Application Tracker. Isomorphic
// (client + server safe) — no Supabase or server-only imports here.

import type { WorkMode } from './constants'
import type { OpportunityView } from './opportunities'

// The application pipeline, in funnel order. This array is the single source of
// truth — isTrackState, the DB CHECK (migration 0004) and the board columns all
// follow it.
export const TRACK_STATES = ['SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'] as const
export type TrackState = (typeof TRACK_STATES)[number]

/** Items closing within this many days are surfaced as "closing soon". */
export const CLOSING_SOON_DAYS = 14

/** Per-stage display metadata for badges and pipeline columns. */
export type TrackStateMeta = {
  label: string
  /** Funnel position (0 = earliest). Drives PIPELINE_ORDER + column order. */
  order: number
  description: string
  /** Badge classes (bg + text + border), matching the app's pill palette. */
  badge: string
}

export const TRACK_STATE_META: Record<TrackState, TrackStateMeta> = {
  SAVED: { order: 0, label: 'Saved', description: 'Shortlisted to apply', badge: 'bg-accent-light text-accent border border-indigo-100' },
  APPLIED: { order: 1, label: 'Applied', description: 'Application submitted', badge: 'bg-blue-50 text-blue-600 border border-blue-100' },
  INTERVIEW: { order: 2, label: 'Interview', description: 'Interview stage', badge: 'bg-amber-50 text-amber-600 border border-amber-100' },
  OFFER: { order: 3, label: 'Offer', description: 'Offer received', badge: 'bg-green-50 text-green-700 border border-green-100' },
  REJECTED: { order: 4, label: 'Rejected', description: 'Not progressing', badge: 'bg-gray-100 text-gray-500 border border-gray-200' },
}

/** Pipeline stages as ordered columns (SAVED → … → REJECTED). */
export const PIPELINE_ORDER: readonly TrackState[] = [...TRACK_STATES].sort(
  (a, b) => TRACK_STATE_META[a].order - TRACK_STATE_META[b].order
)

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
  return typeof value === 'string' && (TRACK_STATES as readonly string[]).includes(value)
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
  if (d < 0) return { text: 'Deadline passed', tone: 'muted' }
  if (d === 0) return { text: 'Deadline today', tone: 'red' }
  if (d === 1) return { text: 'Deadline tomorrow', tone: 'red' }
  if (d <= 7) return { text: `Deadline in ${d} days`, tone: 'red' }
  if (d <= CLOSING_SOON_DAYS) return { text: `Deadline in ${d} days`, tone: 'amber' }
  return { text: `Deadline in ${d} days`, tone: 'muted' }
}
