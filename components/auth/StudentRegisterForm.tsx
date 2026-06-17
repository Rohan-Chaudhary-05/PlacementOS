'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { isAcademicEmail, isStrongEnoughPassword, isValidName } from '@/lib/validation'

export default function StudentRegisterForm() {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ firstName?: string; email?: string; password?: string }>({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      setFormError('The backend is not configured yet. See SUPABASE_SETUP.md.')
      return
    }

    const nextErrors: typeof errors = {}
    if (!isValidName(firstName)) nextErrors.firstName = 'Enter your first name'
    if (!isAcademicEmail(email)) nextErrors.email = 'Use your university email (e.g. ending in .ac.uk or .edu)'
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
        data: { role: 'student', first_name: firstName.trim() },
        emailRedirectTo: `${siteUrl}/auth/callback?flow=signup`,
      },
    })

    if (error) {
      setStatus('idle')
      const message = error.message.toLowerCase()
      if (message.includes('already registered') || message.includes('already exists')) {
        setFormError('An account with this email already exists. Try signing in, or reset your password.')
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
          account — you&apos;ll land straight on your application tracker.
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
        id="student-firstName"
        label="First name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        error={errors.firstName}
        placeholder="Amara"
        autoComplete="given-name"
      />
      <Input
        id="student-email"
        type="email"
        label="University email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="you@university.ac.uk"
        autoComplete="email"
      />
      <Input
        id="student-password"
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="At least 8 characters"
        autoComplete="new-password"
      />
      <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? 'Creating account…' : 'Create student account'}
      </Button>
      <p className="text-xs text-muted text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-accent font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
