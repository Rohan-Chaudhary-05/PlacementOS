'use client'

import { type ReactNode } from 'react'
import Badge from '@/components/ui/Badge'
import { BAND_BADGE_VARIANT, scoreMatch, type MatchableOpp } from '@/lib/match'
import { useTracker } from '@/components/tracker/TrackerProvider'

/**
 * Personalised match badge. Renders `fallback` (the non-personalised badge the
 * server already knows — "Sample" or "Live") until the signed-in student's
 * profile loads, then swaps in their score. Because the first client render
 * equals the server render (both `fallback`), there's no hydration mismatch.
 */
export default function MatchBadge({ opp, fallback }: { opp: MatchableOpp; fallback: ReactNode }) {
  const { ready, profile } = useTracker()
  const result = ready && profile ? scoreMatch(profile, opp) : null
  if (!result) return <>{fallback}</>
  return (
    <Badge variant={BAND_BADGE_VARIANT[result.band]} title={result.reasons[0]}>
      {result.score}% match
    </Badge>
  )
}
