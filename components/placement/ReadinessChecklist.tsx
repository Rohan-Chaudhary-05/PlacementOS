'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { useTracker } from '@/components/tracker/TrackerProvider'
import { READINESS_TASKS, autoTaskProgress, type ReadinessTask } from '@/lib/placement-timeline'

function CheckIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

/** A done / not-done square: a ✓ chip when complete, a (clickable) box otherwise. */
function StatusBox({
  done,
  interactive,
  onClick,
}: {
  done: boolean
  interactive: boolean
  onClick?: () => void
}) {
  const base = 'flex items-center justify-center w-6 h-6 rounded-md border flex-shrink-0 transition-colors'
  const className = done
    ? `${base} border-accent bg-accent text-white`
    : `${base} border-gray-300 bg-white text-transparent`
  if (interactive) {
    return (
      <button type="button" onClick={onClick} aria-pressed={done} className={`${className} ${done ? '' : 'hover:border-accent'}`}>
        <CheckIcon />
      </button>
    )
  }
  return (
    <span className={className} aria-hidden>
      <CheckIcon />
    </span>
  )
}

export default function ReadinessChecklist() {
  const { ready, signedIn, isStudent, items } = useTracker()
  const [manual, setManual] = useState<Record<string, boolean>>({})
  const [loaded, setLoaded] = useState(false)
  const [degraded, setDegraded] = useState(false)

  // Load the student's saved manual ticks (auto items need no fetch).
  useEffect(() => {
    if (!isStudent) {
      setLoaded(true)
      return
    }
    let active = true
    fetch('/api/checklist')
      .then(async (res) => {
        if (!active) return
        if (res.status === 503) {
          setDegraded(true)
        } else if (res.ok) {
          const json = await res.json()
          const map: Record<string, boolean> = {}
          for (const it of json.items ?? []) map[it.item_key] = it.completed
          setManual(map)
        }
        setLoaded(true)
      })
      .catch(() => {
        if (active) setLoaded(true)
      })
    return () => {
      active = false
    }
  }, [isStudent])

  async function toggle(key: string) {
    const next = !manual[key]
    setManual((m) => ({ ...m, [key]: next })) // optimistic
    try {
      const res = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemKey: key, completed: next }),
      })
      if (res.status === 503) {
        setDegraded(true)
        throw new Error('unavailable')
      }
      if (!res.ok) throw new Error('failed')
    } catch {
      setManual((m) => ({ ...m, [key]: !next })) // revert
    }
  }

  // Company/staff never use the checklist (the timeline above still shows).
  if (signedIn && !isStudent) return null

  const isDone = (task: ReadinessTask): boolean =>
    task.kind === 'auto' ? !!autoTaskProgress(task.key, items)?.done : !!manual[task.key]

  const doneCount = signedIn ? READINESS_TASKS.filter(isDone).length : 0
  const total = READINESS_TASKS.length
  const pct = Math.round((doneCount / total) * 100)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary">Your readiness</h2>
          <p className="text-sm text-muted mt-0.5">
            {signedIn
              ? `${doneCount} of ${total} done — milestones tick off as you use your tracker.`
              : 'Sign in to track your placement readiness.'}
          </p>
        </div>
        {!signedIn && (
          <Link href="/login" className={buttonClasses('primary', 'sm', 'flex-shrink-0')}>
            Sign in
          </Link>
        )}
      </div>

      {signedIn && (
        <div className="mt-4 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      )}

      {degraded && (
        <p className="mt-4 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Saving your ticks is unavailable until the checklist table is set up. Auto milestones still update.
        </p>
      )}

      {!ready ? (
        <div className="mt-5 space-y-3 animate-pulse">
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className="h-12 bg-gray-50 rounded-lg" />
          ))}
        </div>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {READINESS_TASKS.map((task) => {
            const progress = task.kind === 'auto' ? autoTaskProgress(task.key, items) : null
            const done = isDone(task)
            const interactive = signedIn && isStudent && task.kind === 'manual' && !degraded
            return (
              <li
                key={task.key}
                className="flex items-start gap-3 rounded-xl border border-gray-100 p-3.5"
              >
                <StatusBox done={done} interactive={interactive} onClick={() => toggle(task.key)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${done ? 'text-primary' : 'text-primary'}`}>{task.label}</span>
                    {task.kind === 'auto' && progress && progress.target > 1 && (
                      <span className="text-xs font-semibold text-muted bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                        {progress.current}/{progress.target}
                      </span>
                    )}
                    {task.kind === 'auto' && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">Auto</span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">{task.description}</p>
                </div>
                {task.href && (
                  <Link href={task.href} className="text-xs font-medium text-accent hover:underline flex-shrink-0 mt-0.5">
                    Open →
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
