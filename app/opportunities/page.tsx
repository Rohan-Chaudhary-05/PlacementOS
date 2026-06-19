import OpportunitiesExplorer from '@/components/opportunities/OpportunitiesExplorer'
import { DEMO_OPPORTUNITIES, getPublicOpportunities } from '@/lib/opportunities'

// ISR: refresh the public listing at most every 5 minutes so newly-accepted
// opportunities appear promptly without a database hit on every visit. The HTML
// stays user-agnostic; personalised match scoring happens client-side in the
// explorer, so the ISR cache is shared across all visitors.
export const revalidate = 300

export default async function OpportunitiesPage() {
  const live = await getPublicOpportunities()
  const demos = DEMO_OPPORTUNITIES
  const total = live.length + demos.length

  return (
    <div className="min-h-screen bg-surface">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-primary">Placement Opportunities</h1>
          <p className="text-muted mt-1.5">
            AI-matched placements for UK STEM students ·{' '}
            <span className="font-medium text-primary">{total} roles</span>
          </p>
        </div>
      </div>

      <OpportunitiesExplorer live={live} demos={demos} />
    </div>
  )
}
