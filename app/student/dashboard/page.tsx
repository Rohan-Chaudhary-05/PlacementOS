import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import LogoutButton from '@/components/auth/LogoutButton'
import TrackerBoard from '@/components/tracker/TrackerBoard'
import { buttonClasses } from '@/components/ui/buttonStyles'

export const metadata = { title: 'My applications · PlacementOS' }
export const dynamic = 'force-dynamic'

export default async function StudentDashboardPage() {
  // Guards access: logged-out → /login; wrong role → that role's dashboard.
  await requireRole('student')

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-widest">Application tracker</p>
              <h1 className="text-2xl font-bold text-primary mt-1">My applications</h1>
            </div>
            <div className="flex items-center gap-2.5">
              <Link href="/opportunities" className={buttonClasses('primary', 'md')}>
                Browse opportunities
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TrackerBoard />
      </div>
    </div>
  )
}
