'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { WORK_MODES, WORK_MODE_LABELS, type WorkMode } from '@/lib/constants'
import {
  deadlineLabel,
  isClosingSoon,
  daysUntil,
  PIPELINE_ORDER,
  TRACK_STATE_META,
  type TrackState,
  type TrackedRow,
} from '@/lib/tracker'
import { deadlineEvents } from '@/lib/calendar'
import CalendarExportButton from './CalendarExportButton'
import { useTracker } from './TrackerProvider'

const SELECT_CLASSES =
  'w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent'

function DeadlineBadge({ deadline }: { deadline: string | null }) {
  const label = deadlineLabel(deadline)
  if (!label) return null
  const tone =
    label.tone === 'red'
      ? 'bg-red-50 text-red-600 border border-red-100'
      : label.tone === 'amber'
        ? 'bg-amber-50 text-amber-600 border border-amber-100'
        : 'bg-gray-50 text-muted border border-gray-100'
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${tone}`}>⏳ {label.text}</span>
}

function ItemCard({ row }: { row: TrackedRow }) {
  const { setStage, remove } = useTracker()
  const s = row.snapshot
  const ref = row.opportunity_ref
  // Deadlines only matter before an outcome — hide once past the application.
  const showDeadline = row.state === 'SAVED' || row.state === 'APPLIED'
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4">
      <Link href={`/opportunities/${ref}`} className="font-semibold text-primary text-sm leading-snug hover:text-accent transition-colors">
        {s.role || 'Opportunity'}
      </Link>
      <p className="text-accent text-sm font-medium mt-0.5 truncate">{s.companyName}</p>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {s.location && <Badge variant="muted">📍 {s.location}</Badge>}
        {s.workMode && <Badge variant="muted">{WORK_MODE_LABELS[s.workMode]}</Badge>}
        {s.sector && <Badge variant="default">{s.sector}</Badge>}
        {showDeadline && <DeadlineBadge deadline={s.deadline} />}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
        <select
          value={row.state}
          onChange={(e) => setStage(ref, e.target.value as TrackState)}
          className={SELECT_CLASSES}
          aria-label="Application stage"
        >
          {PIPELINE_ORDER.map((st) => (
            <option key={st} value={st}>
              {TRACK_STATE_META[st].label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-3 text-xs">
          <Link href={`/opportunities/${ref}`} className="text-accent font-medium hover:underline">
            View
          </Link>
          {s.applyUrl && (
            <a href={s.applyUrl} target="_blank" rel="noopener noreferrer" className="text-accent font-medium hover:underline">
              Apply ↗
            </a>
          )}
          <button
            type="button"
            onClick={() => remove(ref)}
            className="ml-auto text-muted hover:text-red-500 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TrackerBoard() {
  const { ready, items, closingSoonCount } = useTracker()
  const [sector, setSector] = useState('All')
  const [workMode, setWorkMode] = useState<'All' | WorkMode>('All')
  const [closingSoonOnly, setClosingSoonOnly] = useState(false)
  const [search, setSearch] = useState('')

  const sectors = useMemo(
    () => ['All', ...Array.from(new Set(items.map((i) => i.snapshot.sector).filter(Boolean)))],
    [items]
  )

  // One pass for the per-stage funnel counts (drives the summary chips).
  const counts = useMemo(() => {
    const c = Object.fromEntries(PIPELINE_ORDER.map((s) => [s, 0])) as Record<TrackState, number>
    for (const i of items) c[i.state]++
    return c
  }, [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items
      .filter((i) => (closingSoonOnly ? i.state === 'SAVED' && isClosingSoon(i.snapshot.deadline) : true))
      .filter((i) => (sector === 'All' ? true : i.snapshot.sector === sector))
      .filter((i) => (workMode === 'All' ? true : i.snapshot.workMode === workMode))
      .filter((i) =>
        q === '' ? true : `${i.snapshot.role} ${i.snapshot.companyName}`.toLowerCase().includes(q)
      )
  }, [items, closingSoonOnly, sector, workMode, search])

  // Group the filtered rows into pipeline columns. Within SAVED, surface the
  // most-urgent (soonest deadline) first; other stages keep newest-first order.
  const byStage = useMemo(() => {
    const groups = Object.fromEntries(PIPELINE_ORDER.map((s) => [s, [] as TrackedRow[]])) as Record<TrackState, TrackedRow[]>
    for (const i of filtered) groups[i.state].push(i)
    groups.SAVED.sort((a, b) => {
      const da = isClosingSoon(a.snapshot.deadline) ? daysUntil(a.snapshot.deadline)! : Infinity
      const db = isClosingSoon(b.snapshot.deadline) ? daysUntil(b.snapshot.deadline)! : Infinity
      return da - db
    })
    return groups
  }, [filtered])

  if (!ready) {
    return (
      <div className="space-y-3 animate-pulse">
        {[0, 1, 2].map((n) => (
          <div key={n} className="h-28 bg-white rounded-xl border border-gray-100" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
        <h2 className="text-lg font-semibold text-primary">Nothing tracked yet</h2>
        <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto">
          Browse placements and tap <span className="font-medium text-primary">Save to apply</span> or{' '}
          <span className="font-medium text-primary">Mark as applied</span>. They&apos;ll show up here and move through your
          pipeline as you progress.
        </p>
        <Link href="/opportunities" className={buttonClasses('primary', 'md', 'mt-6')}>
          Browse opportunities
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Funnel summary chips + closing-soon toggle */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {PIPELINE_ORDER.map((st) => (
          <div key={st} className="rounded-xl border border-gray-100 bg-white p-3">
            <p className="text-xl font-bold text-primary">{counts[st]}</p>
            <p className="text-xs text-muted">{TRACK_STATE_META[st].label}</p>
          </div>
        ))}
        <button
          onClick={() => setClosingSoonOnly((v) => !v)}
          className={`rounded-xl border p-3 text-left transition-colors ${closingSoonOnly ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
        >
          <p className={`text-xl font-bold ${closingSoonCount > 0 ? 'text-red-600' : 'text-primary'}`}>{closingSoonCount}</p>
          <p className="text-xs text-muted">Closing soon</p>
        </button>
      </div>

      {/* Export deadlines to calendar (only when there's something to export) */}
      {deadlineEvents(items).length > 0 && (
        <div className="flex justify-end">
          <CalendarExportButton />
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search role or company…"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {sectors.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All sectors' : s}</option>
          ))}
        </select>
        <select
          value={workMode}
          onChange={(e) => setWorkMode(e.target.value as 'All' | WorkMode)}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="All">Any mode</option>
          {WORK_MODES.map((m) => (
            <option key={m} value={m}>{WORK_MODE_LABELS[m]}</option>
          ))}
        </select>
      </div>

      {/* Pipeline columns — kanban on desktop, stacked labelled sections on mobile.
          (A drag-and-drop board is a possible future enhancement; the per-card
          stage <select> keeps this dependency-free and accessible.) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {PIPELINE_ORDER.map((st) => {
          const group = byStage[st]
          const muted = st === 'REJECTED'
          return (
            <div key={st} className={muted ? 'opacity-90' : ''}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {TRACK_STATE_META[st].label}
                </h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TRACK_STATE_META[st].badge}`}>
                  {group.length}
                </span>
              </div>
              <div className="space-y-3">
                {group.length === 0 ? (
                  <p className="text-xs text-muted/60 py-6 text-center border border-dashed border-gray-100 rounded-xl">
                    —
                  </p>
                ) : (
                  group.map((row) => <ItemCard key={row.opportunity_ref} row={row} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
