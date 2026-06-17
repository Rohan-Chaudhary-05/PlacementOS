import AuthCard from '@/components/auth/AuthCard'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata = { title: 'Set a new password · PlacementOS' }
// Do NOT redirect logged-in users away — the recovery session counts as logged in,
// and that session is exactly what this page needs to update the password.
export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account.">
      <ResetPasswordForm />
    </AuthCard>
  )
}
