import Link from 'next/link'
import { redirect } from 'next/navigation'
import AuthCard from '@/components/auth/AuthCard'
import StudentRegisterForm from '@/components/auth/StudentRegisterForm'
import { getSessionUser } from '@/lib/auth'
import { dashboardPathFor } from '@/lib/constants'

export const metadata = { title: 'Create your student account · PlacementOS' }
export const dynamic = 'force-dynamic'

export default async function StudentRegisterPage() {
  const user = await getSessionUser()
  if (user) redirect(dashboardPathFor(user.role))

  return (
    <AuthCard
      title="Create your student account"
      subtitle="Save placements, track your applications, and get deadline reminders."
      footer={
        <>
          Want to post placements instead?{' '}
          <Link href="/company/register" className="text-accent font-medium hover:underline">
            Company sign-up
          </Link>
        </>
      }
    >
      <StudentRegisterForm />
    </AuthCard>
  )
}
