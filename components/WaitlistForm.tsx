'use client'

import { useState, FormEvent } from 'react'
import Button from '@/components/ui/Button'

interface WaitlistFormProps {
  light?: boolean
  size?: 'default' | 'large'
}

export default function WaitlistForm({ light = false, size = 'default' }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 800))
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div
        className={[
          'inline-flex items-center gap-2.5 font-medium',
          size === 'large' ? 'text-base' : 'text-sm',
          light ? 'text-white' : 'text-success',
        ].join(' ')}
      >
        <span
          className={[
            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
            light ? 'bg-white/20' : 'bg-green-50',
          ].join(' ')}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        You&apos;re on the list! We&apos;ll be in touch soon.
      </div>
    )
  }

  const inputClass = [
    'flex-1 min-w-0 px-4 rounded-lg border outline-none transition-all duration-150',
    'focus:ring-2 focus:border-transparent text-sm',
    size === 'large' ? 'py-3 text-base' : 'py-2.5',
    light
      ? 'bg-white/10 border-white/25 text-white placeholder:text-white/55 focus:ring-white/40'
      : 'bg-white border-gray-200 text-primary placeholder:text-muted focus:ring-accent',
  ].join(' ')

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 w-full">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your university email"
        required
        className={inputClass}
        aria-label="University email address"
      />
      <Button
        type="submit"
        disabled={loading}
        variant={light ? 'secondary' : 'primary'}
        size={size === 'large' ? 'lg' : 'md'}
        className={[
          'whitespace-nowrap',
          light ? 'bg-white !text-accent hover:bg-accent-light' : '',
        ].join(' ')}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Joining…
          </span>
        ) : (
          'Join Waitlist'
        )}
      </Button>
    </form>
  )
}
