import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import OpportunityForm from '@/components/company/OpportunityForm'

export const metadata = { title: 'Post an opportunity · PlacementOS' }
export const dynamic = 'force-dynamic'

export default async function NewOpportunityPage() {
  await requireRole('company')

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/company/dashboard" className="text-sm text-muted hover:text-accent transition-colors">
          ← Back to dashboard
        </Link>
        <h1 className="text-3xl font-bold text-primary mt-3">Post a placement opportunity</h1>
        <p className="text-muted mt-1.5">
          Tell students about the role. Our team reviews each submission before it goes live.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8 mt-6">
          <OpportunityForm />
        </div>
      </div>
    </div>
  )
}
