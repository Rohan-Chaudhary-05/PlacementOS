'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { useTracker } from './TrackerProvider'

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="w-4 h-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  )
}

/**
 * Save / Applied control. Reads the tracker context:
 *  - company/staff: renders nothing,
 *  - logged out: prompts sign-in,
 *  - student: toggles SAVED / APPLIED / removed.
 *
 * `variant="card"` is a compact bookmark for listing cards; `variant="detail"`
 * is the fuller set of buttons for the opportunity page.
 */
export default function TrackerButton({
  opportunityRef,
  variant = 'card',
  className = '',
}: {
  opportunityRef: string
  variant?: 'card' | 'detail'
  className?: string
}) {
  const { ready, signedIn, isStudent, getState, save, markApplied, remove } = useTracker()
  const state = getState(opportunityRef)

  // Company/staff never track. Avoid flicker before the session is known.
  if (signedIn && !isStudent) return null
  if (!ready && !signedIn) {
    // not yet known — render a neutral placeholder only for the card to keep layout stable
    if (variant === 'card') return <span className={`block w-8 h-8 ${className}`} aria-hidden />
    return null
  }

  // ─── Logged out → prompt sign-in ───
  if (!signedIn) {
    if (variant === 'card') {
      return (
        <Link
          href="/login"
          title="Sign in to save"
          aria-label="Sign in to save"
          className={`flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white/90 text-muted hover:text-accent hover:border-accent transition-colors ${className}`}
        >
          <BookmarkIcon filled={false} />
        </Link>
      )
    }
    return (
      <Link href="/login" className={buttonClasses('secondary', 'lg', `w-full ${className}`)}>
        Sign in to save
      </Link>
    )
  }

  // ─── Student ───
  if (variant === 'card') {
    const tracked = state !== undefined
    const applied = state === 'APPLIED'
    return (
      <button
        type="button"
        onClick={() => (tracked ? remove(opportunityRef) : save(opportunityRef))}
        title={applied ? 'Applied — remove from tracker' : tracked ? 'Saved — remove from tracker' : 'Save to apply'}
        aria-label={applied ? 'Applied' : tracked ? 'Saved' : 'Save to apply'}
        aria-pressed={tracked}
        className={[
          'flex items-center justify-center w-8 h-8 rounded-lg border transition-colors',
          applied
            ? 'border-green-200 bg-green-50 text-green-600'
            : tracked
              ? 'border-accent bg-accent-light text-accent'
              : 'border-gray-200 bg-white/90 text-muted hover:text-accent hover:border-accent',
          className,
        ].join(' ')}
      >
        <BookmarkIcon filled={tracked} />
      </button>
    )
  }

  // detail variant — fuller controls
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {state === 'APPLIED' ? (
        <>
          <Button
            variant="secondary"
            size="lg"
            className="w-full !bg-green-50 !text-green-700 hover:!bg-green-100"
            onClick={() => remove(opportunityRef)}
            title="Remove from tracker"
          >
            ✓ Applied
          </Button>
          <Button variant="ghost" size="md" className="w-full" onClick={() => save(opportunityRef)}>
            Move back to saved
          </Button>
        </>
      ) : state === 'SAVED' ? (
        <>
          <Button variant="primary" size="lg" className="w-full" onClick={() => markApplied(opportunityRef)}>
            Mark as applied
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => remove(opportunityRef)}
            title="Remove from tracker"
          >
            ✓ Saved
          </Button>
        </>
      ) : (
        <>
          <Button variant="secondary" size="lg" className="w-full" onClick={() => save(opportunityRef)}>
            Save to apply
          </Button>
          <Button variant="ghost" size="md" className="w-full" onClick={() => markApplied(opportunityRef)}>
            Mark as applied
          </Button>
        </>
      )}
    </div>
  )
}
