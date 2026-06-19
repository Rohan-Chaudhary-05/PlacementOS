'use client'

import Link from 'next/link'
import { scoreMatch, type MatchableOpp } from '@/lib/match'
import { useTracker } from '@/components/tracker/TrackerProvider'

function Tick() {
  return (
    <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

/**
 * "Why this matches you" panel for the opportunity detail sidebar. Shows the
 * personalised score + reasons for a student with a profile; a nudge for a
 * student without one; nothing for logged-out / company / staff.
 */
export default function MatchBreakdown({ opp }: { opp: MatchableOpp }) {
  const { ready, signedIn, isStudent, profile } = useTracker()
  if (!ready || !signedIn || !isStudent) return null

  const result = profile ? scoreMatch(profile, opp) : null

  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-4">
        <p className="text-sm text-muted leading-relaxed">
          Set up your match profile to see how well this placement fits your degree, skills and goals.
        </p>
        <Link href="/student/profile" className="inline-block mt-2 text-sm font-medium text-accent hover:underline">
          Complete your profile →
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Why this matches you</p>
      <div className="flex items-baseline gap-1.5 mt-1.5 mb-3">
        <span className="text-2xl font-bold text-primary">{result.score}%</span>
        <span className="text-sm text-muted">match</span>
      </div>
      <ul className="space-y-1.5">
        {result.reasons.map((reason, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-primary/80">
            <Tick />
            <span>{reason}</span>
          </li>
        ))}
      </ul>
      <Link href="/student/profile" className="inline-block mt-3 text-xs font-medium text-accent hover:underline">
        Edit match profile →
      </Link>
    </div>
  )
}
