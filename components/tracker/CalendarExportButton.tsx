'use client'

import { useState } from 'react'
import { deadlineEvents, downloadDeadlineIcs } from '@/lib/calendar'
import { useTracker } from './TrackerProvider'

/**
 * Exports the student's SAVED/APPLIED deadlines as an .ics file. Renders
 * nothing when there's nothing to export. Self-contained: reads the tracker.
 */
export default function CalendarExportButton() {
  const { items } = useTracker()
  const [done, setDone] = useState(false)
  const count = deadlineEvents(items).length

  if (count === 0) return null

  return (
    <button
      type="button"
      onClick={() => {
        downloadDeadlineIcs(items)
        setDone(true)
        window.setTimeout(() => setDone(false), 2500)
      }}
      title="Download an .ics of your placement deadlines for Google or Apple Calendar"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-accent transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {done ? 'Calendar downloaded ✓' : `Add ${count} deadline${count === 1 ? '' : 's'} to calendar`}
    </button>
  )
}
