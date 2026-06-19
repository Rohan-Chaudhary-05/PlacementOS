// Content + helpers for the UK placement-year guide. Isomorphic (client +
// server safe) — only `import type` from sibling lib modules, no server imports,
// so both the server-rendered timeline and the client checklist can import it.

import type { TrackedRow, TrackState } from './tracker'

/** One phase of the UK STEM placement application cycle. */
export type TimelinePhase = {
  /** Rough calendar window, e.g. 'Sep – Nov'. */
  window: string
  title: string
  description: string
  /** A few concrete actions for this window. */
  tasks: string[]
}

// A typical UK undergraduate placement-year cycle, the autumn before the
// placement starts. Dates are indicative — big graduate/placement schemes open
// early and recruit on a rolling basis, so "apply early" is the through-line.
export const PLACEMENT_TIMELINE: TimelinePhase[] = [
  {
    window: 'Sep – Oct',
    title: 'Research & shortlist',
    description:
      'Map the sectors and companies that fit your degree. The biggest schemes open first and fill on a rolling basis, so build your list early.',
    tasks: [
      'Decide your target sectors and locations',
      'Save placements that fit on PlacementOS',
      'Note which schemes open earliest',
    ],
  },
  {
    window: 'Oct – Dec',
    title: 'Applications open',
    description:
      'Peak application season. Tailor your CV and cover letter to each role and submit early — many schemes close once they hit their target.',
    tasks: [
      'Polish your CV with the AI CV Tailor',
      'Write a tailored cover letter per role',
      'Submit applications and mark them Applied',
    ],
  },
  {
    window: 'Nov – Feb',
    title: 'Online tests & interviews',
    description:
      'Aptitude tests, situational judgement, video interviews and assessment centres. Practise the formats and prepare your STAR examples.',
    tasks: [
      'Practise numerical & situational tests',
      'Prepare STAR answers for competencies',
      'Move applications to Interview as you progress',
    ],
  },
  {
    window: 'Feb – Apr',
    title: 'Offers & decisions',
    description:
      'Offers land and exploding deadlines appear. Compare offers carefully and keep your university placement office in the loop.',
    tasks: [
      'Record offers in your tracker',
      'Compare salary, location and the role itself',
      'Accept and decline politely before deadlines',
    ],
  },
  {
    window: 'May – Aug',
    title: 'Prepare & start',
    description:
      'Sort logistics — contracts, right-to-work checks, accommodation and travel — and get ready to make the most of your placement year.',
    tasks: [
      'Complete pre-start paperwork & checks',
      'Sort accommodation and commute',
      'Set goals for your placement year',
    ],
  },
]

/** A readiness checklist item. `auto` items derive progress from the tracker. */
export type ReadinessTask = {
  /** Stable key; for manual items this is also the student_checklist.item_key. */
  key: string
  label: string
  description: string
  /** Optional internal link to act on the task. */
  href?: string
  kind: 'manual' | 'auto'
}

export const READINESS_TASKS: ReadinessTask[] = [
  // Auto — progress is computed from the application pipeline.
  { key: 'save-first', label: 'Save your first placement', description: 'Shortlist a role you might apply to.', href: '/opportunities', kind: 'auto' },
  { key: 'apply-three', label: 'Apply to 3 placements', description: 'Get your applications in early.', href: '/opportunities', kind: 'auto' },
  { key: 'land-interview', label: 'Land an interview', description: 'Reach the interview stage on a placement.', kind: 'auto' },
  // Manual — the student ticks these off themselves.
  { key: 'cv-polished', label: 'Polish your CV', description: 'Tailor your CV to your target industry.', href: '/ai-tools/cv-tailor', kind: 'manual' },
  { key: 'target-sectors', label: 'Set your target sectors', description: 'Decide which fields you’re aiming for.', href: '/opportunities', kind: 'manual' },
  { key: 'star-answers', label: 'Prepare STAR answers', description: 'Draft examples for common competencies.', kind: 'manual' },
]

/** The manual-task keys the checklist API will accept (server-side allow-list). */
export const MANUAL_TASK_KEYS: string[] = READINESS_TASKS.filter((t) => t.kind === 'manual').map((t) => t.key)

export type AutoProgress = { done: boolean; current: number; target: number }

/**
 * Progress for an auto-derived readiness task, computed from the tracker rows.
 * Milestones count states "progressed past SAVED" INCLUSIVELY (e.g. an OFFER
 * still counts toward "Apply to 3"), so advancing a card through the pipeline
 * never un-completes an earned milestone.
 */
export function autoTaskProgress(key: string, items: TrackedRow[]): AutoProgress | null {
  const count = (...states: TrackState[]) => items.filter((i) => states.includes(i.state)).length
  switch (key) {
    case 'save-first':
      return { current: Math.min(items.length, 1), target: 1, done: items.length >= 1 }
    case 'apply-three': {
      const n = count('APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED')
      return { current: Math.min(n, 3), target: 3, done: n >= 3 }
    }
    case 'land-interview': {
      const n = count('INTERVIEW', 'OFFER')
      return { current: Math.min(n, 1), target: 1, done: n >= 1 }
    }
    default:
      return null
  }
}
