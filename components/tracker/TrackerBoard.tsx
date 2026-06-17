'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { WORK_MODES, WORK_MODE_LABELS, type WorkMode } from '@/lib/constants'
import { formatSalaryRange } from '@/lib/format'
import { deadlineLabel, isClosingSoon, daysUntil, type TrackedRow } from '@/lib/tracker'
import { useTracker } from './TrackerProvider'

type Tab = 'SAVED' | 'APPLIED' | 'ALL'

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
  const { save, markApplied, remove } = useTracker()
  const s = row.snapshot
  const ref = row.opportunity_ref
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/opportunities/${ref}`} className="font-semibold text-primary text-sm leading-snug hover:text-accent transition-colors">
            {s.role || 'Opportunity'}
          </Link>
          <p className="text-accent text-sm font-medium mt-0.5 truncate">{s.companyName}</p>
        </div>
        {row.state === 'APPLIED' ? (
          <Badge variant="success" className="flex-shrink-0">✓ Applied</Badge>
        ) : (
          <Badge variant="accent" className="flex-shrink-0">Saved</Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {s.location && <Badge variant="muted">📍 {s.location}</Badge>}
        {s.workMode && <Badge variant="muted">{WORK_MODE_LABELS[s.workMode]}</Badge>}
        {s.salaryMin > 0 && (
          <Badge variant="muted">💷 {formatSalaryRange(s.salaryMin, s.salaryMax, s.currency)} / yr</Badge>
        )}
        {s.sector && <Badge variant="default">{s.sector}</Badge>}
        <DeadlineBadge deadline={s.deadline} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-50">
        <Link href={`/opportunities/${ref}`} className={buttonClasses('ghost', 'sm')}>
          View
        </Link>
        {s.applyUrl && (
          <a href={s.applyUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses('secondary', 'sm')}>
            Apply ↗
          </a>
        )}
        {row.state === 'SAVED' ? (
          <Button variant="primary" size="sm" onClick={() => markApplied(ref)}>
            Mark applied
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => save(ref)}>
            Move to saved
          </Button>
        )}
        <button
          type="button"
          onClick={() => remove(ref)}
          className="ml-auto text-xs text-muted hover:text-red-500 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

export default function TrackerBoard() {
  const { ready, items, closingSoonCount } = useTracker()
  const [tab, setTab] = useState<Tab>('SAVED')
  const [sector, setSector] = useState('All')
  const [workMode, setWorkMode] = useState<'All' | WorkMode>('All')
  const [closingSoonOnly, setClosingSoonOnly] = useState(false)
  const [search, setSearch] = useState('')

  const savedCount = items.filter((i) => i.state === 'SAVED').length
  const appliedCount = items.filter((i) => i.state === 'APPLIED').length
  const sectors = useMemo(
    () => ['All', ...Array.from(new Set(items.map((i) => i.snapshot.sector).filter(Boolean)))],
    [items]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items
      .filter((i) => (tab === 'ALL' ? true : i.state === tab))
      .filter((i) => (closingSoonOnly ? i.state === 'SAVED' && isClosingSoon(i.snapshot.deadline) : true))
      .filter((i) => (sector === 'All' ? true : i.snapshot.sector === sector))
      .filter((i) => (workMode === 'All' ? true : i.snapshot.workMode === workMode))
      .filter((i) =>
        q === '' ? true : `${i.snapshot.role} ${i.snapshot.companyName}`.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        // Urgent SAVED items first (soonest deadline), otherwise keep newest-first order.
        const da = a.state === 'SAVED' && isClosingSoon(a.snapshot.deadline) ? daysUntil(a.snapshot.deadline)! : Infinity
        const db = b.state === 'SAVED' && isClosingSoon(b.snapshot.deadline) ? daysUntil(b.snapshot.deadline)! : Infinity
        return da - db
      })
  }, [items, tab, closingSoonOnly, sector, workMode, search])

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
          <span className="font-medium text-primary">Mark as applied</span>. They&apos;ll show up here with
          deadline reminders.
        </p>
        <Link href="/opportunities" className={buttonClasses('primary', 'md', 'mt-6')}>
          Browse opportunities
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => { setTab('SAVED'); setClosingSoonOnly(false) }}
          className={`rounded-xl border p-3 text-left transition-colors ${tab === 'SAVED' && !closingSoonOnly ? 'border-accent bg-accent-light/40' : 'border-gray-100 bg-white hover:border-gray-200'}`}
        >
          <p className="text-2xl font-bold text-primary">{savedCount}</p>
          <p className="text-xs text-muted">To apply</p>
        </button>
        <button
          onClick={() => { setTab('APPLIED'); setClosingSoonOnly(false) }}
          className={`rounded-xl border p-3 text-left transition-colors ${tab === 'APPLIED' ? 'border-accent bg-accent-light/40' : 'border-gray-100 bg-white hover:border-gray-200'}`}
        >
          <p className="text-2xl font-bold text-primary">{appliedCount}</p>
          <p className="text-xs text-muted">Applied</p>
        </button>
        <button
          onClick={() => { setTab('SAVED'); setClosingSoonOnly(true) }}
          className={`rounded-xl border p-3 text-left transition-colors ${closingSoonOnly ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
        >
          <p className={`text-2xl font-bold ${closingSoonCount > 0 ? 'text-red-600' : 'text-primary'}`}>{closingSoonCount}</p>
          <p className="text-xs text-muted">Closing soon</p>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-white">
          {(['SAVED', 'APPLIED', 'ALL'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); if (t !== 'SAVED') setClosingSoonOnly(false) }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${tab === t ? 'bg-accent text-white' : 'text-muted hover:text-primary'}`}
            >
              {t === 'SAVED' ? 'To apply' : t === 'APPLIED' ? 'Applied' : 'All'}
            </button>
          ))}
        </div>
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

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">No opportunities match these filters.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => (
            <ItemCard key={row.opportunity_ref} row={row} />
          ))}
        </div>
      )}
    </div>
  )
}
