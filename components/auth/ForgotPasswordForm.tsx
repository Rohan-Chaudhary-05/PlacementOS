'use client'

import { useState, type FormEvent } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { isValidEmail } from '@/lib/validation'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      setError('The backend is not configured yet. See SUPABASE_SETUP.md.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    setStatus('loading')
    setError('')

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const supabase = createClient()
    // Ignore the result on purpose — never reveal whether an account exists.
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/auth/callback?flow=recovery`,
    })
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="text-center py-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-primary mb-1.5">Check your inbox</h2>
        <p className="text-sm text-muted leading-relaxed">
          If an account exists for <span className="font-medium text-primary">{email}</span>, we&apos;ve
          sent a link to set a new password.
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
        id="forgot-email"
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@university.ac.uk"
        autoComplete="email"
        required
      />
      <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  )
}
