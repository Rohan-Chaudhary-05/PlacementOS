import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import OpportunityCard from '@/components/OpportunityCard'
import StatusControl from '@/components/staff/StatusControl'
import LogoutButton from '@/components/auth/LogoutButton'
import { STATUS_LABELS, type Opportunity, type OpportunityStatus } from '@/lib/constants'

export const metadata = { title: 'Staff dashboard · PlacementOS' }
export const dynamic = 'force-dynamic'

export default async function StaffDashboardPage() {
  await requireRole('staff')

  const supabase = await createClient()
  const { data } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false })
  const opportunities = (data ?? []) as Opportunity[]

  const counts: Record<OpportunityStatus, number> = { UNDER_REVIEW: 0, ACCEPTED: 0, DENIED: 0 }
  opportunities.forEach((o) => {
    counts[o.status] += 1
  })

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-widest">Staff</p>
              <h1 className="text-2xl font-bold text-primary mt-1">Opportunity review</h1>
              <p className="text-sm text-muted mt-1">
                {(['UNDER_REVIEW', 'ACCEPTED', 'DENIED'] as OpportunityStatus[])
                  .map((s) => `${counts[s]} ${STATUS_LABELS[s].toLowerCase()}`)
                  .join(' · ')}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {opportunities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <h2 className="text-lg font-semibold text-primary">Nothing to review yet</h2>
            <p className="text-sm text-muted mt-1.5">
              Company submissions will appear here as soon as they&apos;re posted.
            </p>
          </div>
        ) : (
          opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              showCompany
              footer={
                <StatusControl
                  opportunityId={opportunity.id}
                  currentStatus={opportunity.status}
                  currentNote={opportunity.review_note}
                />
              }
            />
          ))
        )}
      </div>
    </div>
  )
}
