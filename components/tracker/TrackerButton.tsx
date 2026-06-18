'use client'

import { useEffect, useRef, useState } from 'react'
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

/** A ring that bursts outward + fades — the "spark" played when a toggle activates. */
function Spark({ tone }: { tone: 'accent' | 'green' }) {
  const color = tone === 'accent' ? 'border-accent' : 'border-green-400'
  return (
    <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center" aria-hidden>
      <span className={`h-7 w-7 rounded-full border-2 ${color} animate-spark`} />
    </span>
  )
}

const ICON_BTN = 'relative flex items-center justify-center w-7 h-7 rounded-lg border transition-colors'

/**
 * Save / Applied control. Reads the tracker context:
 *  - company/staff: renders nothing,
 *  - logged out: prompts sign-in,
 *  - student: toggles SAVED / APPLIED / removed.
 *
 * Activating a toggle plays a one-shot pop + spark (suppressed under
 * prefers-reduced-motion). `variant="card"` shows two small icon buttons for
 * listing cards; `variant="detail"` is the fuller set for the opportunity page.
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

  // One-shot pop/spark trigger. Cleared after the animation; never fires under
  // reduced-motion. A ref-held timer is cleaned up on unmount.
  const [burst, setBurst] = useState<'save' | 'applied' | null>(null)
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (burstTimer.current) clearTimeout(burstTimer.current)
  }, [])
  const fire = (kind: 'save' | 'applied') => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setBurst(kind)
    if (burstTimer.current) clearTimeout(burstTimer.current)
    burstTimer.current = setTimeout(() => setBurst(null), 450)
  }

  const doSave = () => {
    save(opportunityRef)
    fire('save')
  }
  const doApply = () => {
    markApplied(opportunityRef)
    fire('applied')
  }

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
          onClick={() => (saved ? remove(opportunityRef) : doSave())}
          title={saved ? 'Saved — click to remove' : 'Save to apply'}
          aria-label="Save to apply"
          aria-pressed={saved}
          className={`${ICON_BTN} ${saved ? 'border-accent bg-accent-light text-accent' : 'border-gray-200 bg-white/90 text-muted hover:text-accent hover:border-accent'}`}
        >
          {burst === 'save' && <Spark tone="accent" />}
          <span className={burst === 'save' ? 'animate-pop' : ''}>
            <BookmarkIcon filled={saved} />
          </span>
        </button>
        <button
          type="button"
          onClick={() => (applied ? remove(opportunityRef) : doApply())}
          title={applied ? 'Applied — click to remove' : 'Mark as applied'}
          aria-label="Mark as applied"
          aria-pressed={applied}
          className={`${ICON_BTN} ${applied ? 'border-green-300 bg-green-50 text-green-600' : 'border-gray-200 bg-white/90 text-muted hover:text-green-600 hover:border-green-400'}`}
        >
          {burst === 'applied' && <Spark tone="green" />}
          <span className={burst === 'applied' ? 'animate-pop' : ''}>
            <CheckIcon />
          </span>
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
          <div className="relative">
            {burst === 'applied' && <Spark tone="green" />}
            <Button
              variant="secondary"
              size="lg"
              className={`w-full !bg-green-50 !text-green-700 hover:!bg-green-100 ${burst === 'applied' ? 'animate-pop' : ''}`}
              onClick={() => remove(opportunityRef)}
              title="Remove from tracker"
            >
              ✓ Applied
            </Button>
          </div>
          <Button variant="ghost" size="md" className="w-full" onClick={() => save(opportunityRef)}>
            Move back to saved
          </Button>
        </>
      ) : state === 'SAVED' ? (
        <>
          <Button variant="primary" size="lg" className="w-full" onClick={doApply}>
            Mark as applied
          </Button>
          <div className="relative">
            {burst === 'save' && <Spark tone="accent" />}
            <Button
              variant="secondary"
              size="md"
              className={`w-full !bg-accent-light !text-accent hover:!bg-indigo-100 ${burst === 'save' ? 'animate-pop' : ''}`}
              onClick={() => remove(opportunityRef)}
              title="Remove from tracker"
            >
              ✓ Saved
            </Button>
          </div>
        </>
      ) : (
        <>
          <Button variant="secondary" size="lg" className="w-full" onClick={doSave}>
            Save to apply
          </Button>
          <Button variant="ghost" size="md" className="w-full" onClick={doApply}>
            Mark as applied
          </Button>
        </>
      )}
    </div>
  )
}
