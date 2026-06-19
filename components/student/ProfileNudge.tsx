'use client'

import Link from 'next/link'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { useTracker } from '@/components/tracker/TrackerProvider'

/** Prompts a signed-in student with no match profile to set one up. */
export default function ProfileNudge() {
  const { ready, isStudent, profile } = useTracker()
  if (!ready || !isStudent || profile) return null

  return (
    <div className="rounded-2xl border border-indigo-100 bg-accent-light/40 p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-primary">Unlock personalised matches</p>
        <p className="text-sm text-muted mt-0.5">
          Set up your match profile and we&apos;ll score every placement by how well it fits you.
        </p>
      </div>
      <Link href="/student/profile" className={buttonClasses('primary', 'md', 'flex-shrink-0')}>
        Set up profile
      </Link>
    </div>
  )
}
