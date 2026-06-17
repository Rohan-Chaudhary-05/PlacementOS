'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { dashboardPathFor, type UserRole } from '@/lib/constants'
import { isStrongEnoughPassword } from '@/lib/validation'

export default function ResetPasswordForm() {
  const router = useRouter()
  const [ready, setReady] = useState<'checking' | 'ok' | 'nosession'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // The recovery link (via /auth/callback) establishes a session before landing here.
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setReady(data.user ? 'ok' : 'nosession'))
      .catch(() => setReady('nosession'))
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isStrongEnoughPassword(password)) {
      setError('Your new password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Those passwords don’t match.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setLoading(false)
      setError('Could not update your password. Your reset link may have expired — request a new one.')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    let role: UserRole = 'student'
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      role = (profile?.role as UserRole) ?? 'student'
    }
    router.replace(dashboardPathFor(role))
    router.refresh()
  }

  if (ready === 'checking') {
    return <p className="text-sm text-muted text-center py-4">Checking your reset link…</p>
  }

  if (ready === 'nosession') {
    return (
      <div className="text-center py-2">
        <h2 className="text-lg font-bold text-primary mb-1.5">Link expired</h2>
        <p className="text-sm text-muted leading-relaxed">
          This password reset link is invalid or has expired.{' '}
          <Link href="/auth/forgot" className="text-accent font-medium hover:underline">
            Request a new one
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <Input
        id="reset-password"
        type="password"
        label="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 8 characters"
        autoComplete="new-password"
      />
      <Input
        id="reset-confirm"
        type="password"
        label="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Re-enter your new password"
        autoComplete="new-password"
      />
      <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full">
        {loading ? 'Saving…' : 'Set new password'}
      </Button>
    </form>
  )
}
