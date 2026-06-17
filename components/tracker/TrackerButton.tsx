'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { useTracker } from './TrackerProvider'

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="w-4 h-4" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

const ICON_BTN = 'flex items-center justify-center w-7 h-7 rounded-lg border transition-colors'

/**
 * Save / Applied control. Reads the tracker context:
 *  - company/staff: renders nothing,
 *  - logged out: prompts sign-in,
 *  - student: toggles SAVED / APPLIED / removed.
 *
 * `variant="card"` shows two small icon buttons (save + applied) for listing
 * cards; `variant="detail"` is the fuller set of buttons for the opportunity page.
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

  // Company/staff never track.
  if (signedIn && !isStudent) return null
  // Before the session is known, keep card layout stable (reserve the two-button width).
  if (!ready && !signedIn) {
    if (variant === 'card') return <span className={`block w-[60px] h-7 ${className}`} aria-hidden />
    return null
  }

  // ─── Card: two small buttons (save + applied) ───
  if (variant === 'card') {
    if (!signedIn) {
      return (
        <div className={`flex items-center gap-1 ${className}`}>
          <Link href="/login" title="Sign in to save" aria-label="Sign in to save" className={`${ICON_BTN} border-gray-200 bg-white/90 text-muted hover:text-accent hover:border-accent`}>
            <BookmarkIcon filled={false} />
          </Link>
          <Link href="/login" title="Sign in to mark applied" aria-label="Sign in to mark applied" className={`${ICON_BTN} border-gray-200 bg-white/90 text-muted hover:text-green-600 hover:border-green-400`}>
            <CheckIcon />
          </Link>
        </div>
      )
    }
    const saved = state === 'SAVED'
    const applied = state === 'APPLIED'
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <button
          type="button"
          onClick={() => (saved ? remove(opportunityRef) : save(opportunityRef))}
          title={saved ? 'Saved — click to remove' : 'Save to apply'}
          aria-label="Save to apply"
          aria-pressed={saved}
          className={`${ICON_BTN} ${saved ? 'border-accent bg-accent-light text-accent' : 'border-gray-200 bg-white/90 text-muted hover:text-accent hover:border-accent'}`}
        >
          <BookmarkIcon filled={saved} />
        </button>
        <button
          type="button"
          onClick={() => (applied ? remove(opportunityRef) : markApplied(opportunityRef))}
          title={applied ? 'Applied — click to remove' : 'Mark as applied'}
          aria-label="Mark as applied"
          aria-pressed={applied}
          className={`${ICON_BTN} ${applied ? 'border-green-300 bg-green-50 text-green-600' : 'border-gray-200 bg-white/90 text-muted hover:text-green-600 hover:border-green-400'}`}
        >
          <CheckIcon />
        </button>
      </div>
    )
  }

  // ─── Detail: fuller controls ───
  if (!signedIn) {
    return (
      <Link href="/login" className={buttonClasses('secondary', 'lg', `w-full ${className}`)}>
        Sign in to save
      </Link>
    )
  }
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
