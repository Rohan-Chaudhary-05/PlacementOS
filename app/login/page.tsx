import Link from 'next/link'
import { redirect } from 'next/navigation'
import AuthCard from '@/components/auth/AuthCard'
import LoginForm from '@/components/auth/LoginForm'
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
    <AuthCard
      title="Sign in"
      subtitle="For company and staff accounts."
      footer={
        <>
          New company?{' '}
          <Link href="/company/register" className="text-accent font-medium hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm initialError={error} />
    </AuthCard>
  )
}
