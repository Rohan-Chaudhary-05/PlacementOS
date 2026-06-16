'use client'

import { useState, type FormEvent } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { isAcademicEmail, isValidName } from '@/lib/validation'

interface WaitlistModalProps {
  open: boolean
  onClose: () => void
}

export default function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ firstName?: string; email?: string }>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [formError, setFormError] = useState('')

  const reset = () => {
    setFirstName('')
    setEmail('')
    setErrors({})
    setStatus('idle')
    setFormError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const nextErrors: { firstName?: string; email?: string } = {}
    if (!isValidName(firstName)) nextErrors.firstName = 'Enter your first name'
    if (!isAcademicEmail(email)) nextErrors.email = 'Use your university email (e.g. ending in .ac.uk)'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('loading')
    setFormError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), email: email.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFormError(data.error || 'Something went wrong. Please try again.')
        setStatus('idle')
        return
      }
      setStatus('success')
    } catch {
      setFormError('Network error. Please try again.')
      setStatus('idle')
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Join the waitlist">
      {status === 'success' ? (
        <div className="text-center py-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-primary mb-1.5">Check your inbox</h2>
          <p className="text-sm text-muted leading-relaxed mb-6">
            We&apos;ve sent a confirmation link to <span className="font-medium text-primary">{email}</span>.
            Click it to secure your spot on the waitlist.
          </p>
          <Button type="button" variant="primary" size="md" className="w-full" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <h2 className="text-lg font-bold text-primary mb-1">Join the waitlist</h2>
          <p className="text-sm text-muted leading-relaxed mb-5">
            Be first to access PlacementOS. Just your first name and university email.
          </p>

          <div className="space-y-4">
            <Input
              id="waitlist-first-name"
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
              placeholder="Alex"
              autoComplete="given-name"
            />
            <Input
              id="waitlist-email"
              type="email"
              label="University email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="alex@university.ac.uk"
              autoComplete="email"
            />
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-500 mt-4">
              {formError}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={status === 'loading'}
            className="w-full mt-5"
          >
            {status === 'loading' ? 'Sending…' : 'Join waitlist'}
          </Button>
          <p className="text-xs text-muted text-center mt-3">
            We&apos;ll email you a link to confirm it&apos;s really you.
          </p>
        </form>
      )}
    </Modal>
  )
}
