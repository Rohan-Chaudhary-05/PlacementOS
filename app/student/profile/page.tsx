import { requireRole } from '@/lib/auth'
import ProfileForm from '@/components/student/ProfileForm'

export const metadata = { title: 'Match profile · PlacementOS' }
export const dynamic = 'force-dynamic'

export default async function StudentProfilePage() {
  // Guards access: logged-out → /login; wrong role → that role's dashboard.
  await requireRole('student')

  return (
    <div className="min-h-screen bg-surface">
      {/* Header band with a soft accent wash to set an inviting tone. */}
      <div className="relative overflow-hidden border-b border-gray-100 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-light/60 via-surface to-white pointer-events-none" />
        <div className="absolute -top-20 -right-12 w-72 h-72 rounded-full bg-accent-light/40 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="inline-flex items-center gap-2 bg-accent-light text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-indigo-200">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            Match profile
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">Tune your matches</h1>
          <p className="text-muted mt-3 text-base leading-relaxed max-w-xl">
            Tell us about your degree, skills and what you want — every placement is then scored on how well
            it fits you. The more you add, the sharper your matches get.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileForm />
      </div>
    </div>
  )
}
