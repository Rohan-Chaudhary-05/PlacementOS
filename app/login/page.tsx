import Link from 'next/link'
import { redirect } from 'next/navigation'
import AuthCard from '@/components/auth/AuthCard'
import LoginForm from '@/components/auth/LoginForm'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { getSessionUser } from '@/lib/auth'
import { dashboardPathFor } from '@/lib/constants'

export const metadata = { title: 'Sign in · PlacementOS' }
export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const user = await getSessionUser()
  if (user) redirect(dashboardPathFor(user.role))

  const { error } = await searchParams

  return (
    <AuthCard title="Sign in" subtitle="Welcome back.">
      <LoginForm initialError={error} />
      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide text-center mb-3">
          New to PlacementOS?
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <Link href="/student/register" className={buttonClasses('ghost', 'md', 'w-full')}>
            Student sign-up
          </Link>
          <Link href="/company/register" className={buttonClasses('ghost', 'md', 'w-full')}>
            Company sign-up
          </Link>
        </div>
      </div>
    </AuthCard>
  )
}
