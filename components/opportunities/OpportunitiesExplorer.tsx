'use client'

import { useMemo, useState } from 'react'
import OpportunityListCard, { defaultMatchBadge } from '@/components/OpportunityListCard'
import MatchBadge from '@/components/match/MatchBadge'
import { useTracker } from '@/components/tracker/TrackerProvider'
import { scoreMatch } from '@/lib/match'
import type { OpportunityView } from '@/lib/opportunities'

type Sort = 'best' | 'newest' | 'salary'
const SALARY_FLOORS = [0, 18000, 22000, 26000, 30000]

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

export default function OpportunitiesExplorer({
  live,
  demos,
}: {
  live: OpportunityView[]
  demos: OpportunityView[]
}) {
  const { ready, profile } = useTracker()
  const all = useMemo(() => [...live, ...demos], [live, demos])

  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('All')
  const [location, setLocation] = useState('All')
  const [duration, setDuration] = useState('All')
  const [minSalary, setMinSalary] = useState(0)
  const [minMatch, setMinMatch] = useState(0)
  const [sort, setSort] = useState<Sort>('newest')
  const [sortTouched, setSortTouched] = useState(false)

  const hasProfile = ready && !!profile
  // Default to "Best match" once a profile is loaded, unless the user chose a sort.
  const effectiveSort: Sort = sortTouched ? sort : hasProfile ? 'best' : 'newest'

  // Precompute scores once per profile change.
  const scores = useMemo(() => {
    const map = new Map<string, number | null>()
    for (const o of all) map.set(o.id, profile ? (scoreMatch(profile, o)?.score ?? null) : null)
    return map
  }, [all, profile])
  const sectorOptions = useMemo(() => ['All', ...uniqueSorted(all.map((o) => o.sector))], [all])
  const locationOptions = useMemo(() => ['All', ...uniqueSorted(all.map((o) => o.location))], [all])
  const durationOptions = useMemo(() => ['All', ...uniqueSorted(all.map((o) => o.duration))], [all])

  const { shownLive, shownDemos } = useMemo(() => {
    const q = search.trim().toLowerCase()
    const score = (o: OpportunityView) => scores.get(o.id) ?? null
    const run = (list: OpportunityView[]) => {
      const filtered = list.filter((o) => {
        if (q && !`${o.role} ${o.companyName}`.toLowerCase().includes(q)) return false
        if (sector !== 'All' && o.sector !== sector) return false
        if (location !== 'All' && o.location !== location) return false
        if (duration !== 'All' && o.duration !== duration) return false
        if (minSalary > 0 && o.salaryMax < minSalary) return false
        if (minMatch > 0) {
          const s = score(o)
          if (s === null || s < minMatch) return false
        }
        return true
      })
      if (effectiveSort === 'best') return [...filtered].sort((a, b) => (score(b) ?? -1) - (score(a) ?? -1))
      if (effectiveSort === 'salary') return [...filtered].sort((a, b) => b.salaryMax - a.salaryMax)
      return filtered // newest = source order (live RPC is newest-first)
    }
    return { shownLive: run(live), shownDemos: run(demos) }
  }, [live, demos, search, sector, location, duration, minSalary, minMatch, effectiveSort, scores])

  const shownCount = shownLive.length + shownDemos.length

  function cardFor(o: OpportunityView) {
    return (
      <OpportunityListCard
        key={o.id}
        opportunity={o}
        badge={<MatchBadge opp={o} fallback={defaultMatchBadge(o.match)} />}
      />
    )
  }

  function clearAll() {
    setSearch('')
    setSector('All')
    setLocation('All')
    setDuration('All')
    setMinSalary(0)
    setMinMatch(0)
    setSort('newest')
    setSortTouched(true)
  }

  const selectClass =
    'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Filter sidebar ── */}
        <aside className="w-full lg:w-60 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5 space-y-6 lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold text-primary">Filters</h2>

            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Sector</p>
              <div className="flex flex-wrap gap-1.5">
                {sectorOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSector(s)}
                    className={[
                      'px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150',
                      s === sector ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-accent-light hover:text-accent',
                    ].join(' ')}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className={selectClass}>
                {locationOptions.map((l) => (
                  <option key={l} value={l}>{l === 'All' ? 'All locations' : l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">Duration</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} className={selectClass}>
                {durationOptions.map((d) => (
                  <option key={d} value={d}>{d === 'All' ? 'Any duration' : d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">Minimum salary</label>
              <select value={minSalary} onChange={(e) => setMinSalary(Number(e.target.value))} className={selectClass}>
                {SALARY_FLOORS.map((f) => (
                  <option key={f} value={f}>{f === 0 ? 'Any salary' : `£${f.toLocaleString('en-GB')}+`}</option>
                ))}
              </select>
            </div>

            {hasProfile && (
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">Min AI match</label>
                <select value={minMatch} onChange={(e) => setMinMatch(Number(e.target.value))} className={selectClass}>
                  <option value={0}>Any match</option>
                  <option value={70}>70%+</option>
                  <option value={80}>80%+</option>
                  <option value={90}>90%+</option>
                </select>
              </div>
            )}

            <button onClick={clearAll} className="w-full text-center text-xs text-muted hover:text-accent transition-colors py-1">
              Clear all filters
            </button>
          </div>
        </aside>

        {/* ── Listings ── */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Toolbar: search + sort + count */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search roles or companies…"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            <select
              value={effectiveSort}
              onChange={(e) => { setSort(e.target.value as Sort); setSortTouched(true) }}
              className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Sort opportunities"
            >
              <option value="best">Best match</option>
              <option value="newest">Newest</option>
              <option value="salary">Highest salary</option>
            </select>
          </div>

          {shownCount === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <h2 className="text-lg font-semibold text-primary">No opportunities match your filters</h2>
              <button onClick={clearAll} className="mt-4 text-sm font-medium text-accent hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {shownLive.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">Live opportunities</h2>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{shownLive.map(cardFor)}</div>
                </section>
              )}

              {shownDemos.length > 0 && (
                <section>
                  {live.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">Sample placements</h2>
                      <p className="text-xs text-muted mt-1">
                        Example roles to show what PlacementOS surfaces. Join the waitlist to apply when we launch.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{shownDemos.map(cardFor)}</div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
