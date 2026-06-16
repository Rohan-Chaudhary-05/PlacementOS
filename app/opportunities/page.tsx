import OpportunityListCard from '@/components/OpportunityListCard'
import { DEMO_OPPORTUNITIES, getPublicOpportunities } from '@/lib/opportunities'

// ISR: refresh the public listing at most every 5 minutes so newly-accepted
// opportunities appear promptly without a database hit on every visit.
export const revalidate = 300

const sectors = [
  'All',
  'Software & IT',
  'Data Science & AI',
  'Finance & Quantitative',
  'Biotech & Pharma',
  'Aerospace & Defence',
  'Energy & Sustainability',
]

export default async function OpportunitiesPage() {
  const live = await getPublicOpportunities()
  const demos = DEMO_OPPORTUNITIES
  const total = live.length + demos.length

  return (
    <div className="min-h-screen bg-surface">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">Placement Opportunities</h1>
              <p className="text-muted mt-1.5">
                AI-matched placements for UK STEM students ·{' '}
                <span className="font-medium text-primary">{total} roles</span>
              </p>
            </div>
            {/* Search stub */}
            <div className="relative w-full sm:w-72">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search roles or companies…"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Filter sidebar ── */}
          <aside className="w-full lg:w-60 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5 space-y-6 lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold text-primary">Filters</h2>

              {/* Sector */}
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Sector</p>
                <div className="flex flex-wrap gap-1.5">
                  {sectors.map((s) => (
                    <button
                      key={s}
                      className={[
                        'px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150',
                        s === 'All'
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-accent-light hover:text-accent',
                      ].join(' ')}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                  Location
                </label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option>All locations</option>
                  <option>London</option>
                  <option>Cambridge</option>
                  <option>Derby</option>
                  <option>Stevenage</option>
                  <option>Sunbury-on-Thames</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                  Duration
                </label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option>Any duration</option>
                  <option>6 months</option>
                  <option>12 months</option>
                </select>
              </div>

              {/* Salary */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                  Minimum salary
                </label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option>Any salary</option>
                  <option>£18,000+</option>
                  <option>£22,000+</option>
                  <option>£26,000+</option>
                  <option>£30,000+</option>
                </select>
              </div>

              {/* AI match */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                  Min AI match
                </label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option>Any match</option>
                  <option>70%+</option>
                  <option>80%+</option>
                  <option>90%+</option>
                </select>
              </div>

              <button className="w-full text-center text-xs text-muted hover:text-accent transition-colors py-1">
                Clear all filters
              </button>
            </div>
          </aside>

          {/* ── Listings ── */}
          <div className="flex-1 flex flex-col gap-8">
            {live.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">
                    Live opportunities
                  </h2>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {live.map((o) => (
                    <OpportunityListCard key={o.id} opportunity={o} />
                  ))}
                </div>
              </section>
            )}

            <section>
              {live.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">
                    Sample placements
                  </h2>
                  <p className="text-xs text-muted mt-1">
                    Example roles to show what PlacementOS surfaces. Join the waitlist to apply when we launch.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {demos.map((o) => (
                  <OpportunityListCard key={o.id} opportunity={o} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
