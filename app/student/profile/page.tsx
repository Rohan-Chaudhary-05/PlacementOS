import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import ProfileForm from '@/components/student/ProfileForm'
import { buttonClasses } from '@/components/ui/buttonStyles'

export const metadata = { title: 'Match profile · PlacementOS' }
export const dynamic = 'force-dynamic'

export default async function StudentProfilePage() {
  // Guards access: logged-out → /login; wrong role → that role's dashboard.
  await requireRole('student')

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-widest">Match profile</p>
              <h1 className="text-2xl font-bold text-primary mt-1">Tune your matches</h1>
              <p className="text-sm text-muted mt-1.5 max-w-xl">
                Tell us about your degree, skills and what you want — every placement is then scored on how
                well it fits you.
              </p>
            </div>
            <Link href="/opportunities" className={buttonClasses('ghost', 'md')}>
              View opportunities
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileForm />
      </div>
    </div>
  )
}
