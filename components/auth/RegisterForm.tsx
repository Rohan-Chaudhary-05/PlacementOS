'use client'

import { useState, type FormEvent } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { isCompanyEmail, isStrongEnoughPassword, isValidName } from '@/lib/validation'

export default function RegisterForm() {
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ companyName?: string; email?: string; password?: string }>({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      setFormError('The backend is not configured yet. See SUPABASE_SETUP.md.')
      return
    }

    const nextErrors: typeof errors = {}
    if (!isValidName(companyName)) nextErrors.companyName = 'Enter your company name'
    if (!isCompanyEmail(email)) nextErrors.email = 'Use your company email — not a personal address'
    if (!isStrongEnoughPassword(password)) nextErrors.password = 'At least 8 characters'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('loading')
    setFormError('')

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { role: 'company', company_name: companyName.trim() },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (error) {
      setStatus('idle')
      const message = error.message.toLowerCase()
      if (message.includes('already registered') || message.includes('already exists')) {
        setFormError('An account with this email already exists. Try signing in instead.')
      } else if (message.includes('company email') || message.includes('personal')) {
        setFormError('Company registration requires a company email address, not a personal one.')
      } else {
        setFormError(error.message)
      }
      return
    }

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
        <h2 className="text-lg font-bold text-primary mb-1.5">Confirm your email</h2>
        <p className="text-sm text-muted leading-relaxed">
          We&apos;ve sent a confirmation link to{' '}
          <span className="font-medium text-primary">{email}</span>. Click it to activate your
          account, then sign in.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <p role="alert" className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {formError}
        </p>
      )}
      <Input
        id="register-company"
        label="Company name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        error={errors.companyName}
        placeholder="Acme Robotics Ltd"
        autoComplete="organization"
      />
      <Input
        id="register-email"
        type="email"
        label="Company email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="you@acme.com"
        autoComplete="email"
      />
      <Input
        id="register-password"
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="At least 8 characters"
        autoComplete="new-password"
      />
      <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? 'Creating account…' : 'Create company account'}
      </Button>
    </form>
  )
}
