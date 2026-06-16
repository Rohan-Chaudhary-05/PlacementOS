import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import OpportunityCard from '@/components/OpportunityCard'
import LogoutButton from '@/components/auth/LogoutButton'
import { buttonClasses } from '@/components/ui/buttonStyles'
import type { Opportunity } from '@/lib/constants'

export const metadata = { title: 'Company dashboard · PlacementOS' }
export const dynamic = 'force-dynamic'

export default async function CompanyDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ posted?: string }>
}) {
  const user = await requireRole('company')
  const { posted } = await searchParams

  const supabase = await createClient()
  const { data } = await supabase
    .from('opportunities')
    .select('*')
    .eq('company_id', user.id)
    .order('created_at', { ascending: false })
  const opportunities = (data ?? []) as Opportunity[]

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-widest">
                {user.companyName ?? 'Company'}
              </p>
              <h1 className="text-2xl font-bold text-primary mt-1">Your opportunities</h1>
            </div>
            <div className="flex items-center gap-2.5">
              <Link href="/company/opportunities/new" className={buttonClasses('primary', 'md')}>
                Post opportunity
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {posted && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            Opportunity submitted. It&apos;s now <span className="font-semibold">under review</span> — you&apos;ll
            see the status update here.
          </div>
        )}

        {opportunities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <h2 className="text-lg font-semibold text-primary">No opportunities yet</h2>
            <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto">
              Post your first placement opportunity. Our team reviews each one, and you&apos;ll track its
              status right here.
            </p>
            <Link
              href="/company/opportunities/new"
              className={buttonClasses('primary', 'md', 'mt-6')}
            >
              Post an opportunity
            </Link>
          </div>
        ) : (
          opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))
        )}
      </div>
    </div>
  )
}
