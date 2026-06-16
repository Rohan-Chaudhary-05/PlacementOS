import Link from 'next/link'
import { redirect } from 'next/navigation'
import AuthCard from '@/components/auth/AuthCard'
import RegisterForm from '@/components/auth/RegisterForm'
import { getSessionUser } from '@/lib/auth'
import { dashboardPathFor } from '@/lib/constants'

export const metadata = { title: 'Create a company account · PlacementOS' }
export const dynamic = 'force-dynamic'

export default async function CompanyRegisterPage() {
  const user = await getSessionUser()
  if (user) redirect(dashboardPathFor(user.role))

  return (
    <AuthCard
      title="Create a company account"
      subtitle="Post placement opportunities and track their status. Use your company email — personal addresses aren't accepted."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-accent font-medium hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  )
}
