'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTracker } from '@/components/tracker/TrackerProvider'

function ProfileIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function ApplicationsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7l1.5 1.5L15 11" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4m6-11h4a2 2 0 012 2v10a2 2 0 01-2 2h-4" />
    </svg>
  )
}

/**
 * Signed-in student account menu — a "three lines" button in the top-right that
 * opens a dropdown: Profile, My applications, and Log out at the bottom. Closes
 * on outside-click, Escape, or navigation. The closing-soon count rides on the
 * "My applications" row (and a dot on the trigger) so it stays visible when shut.
 */
export default function StudentMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { closingSoonCount } = useTracker()
  const showCount = closingSoonCount > 0

  // Close on outside click + Escape while open.
  useEffect(() => {
    if (!open) return
    function onPointer(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Close after a client-side navigation completes (covers back/forward too).
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  async function signOut() {
    setOpen(false)
    await createClient().auth.signOut()
    router.replace('/')
    router.refresh()
  }

  const itemClass =
    'flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium text-primary hover:bg-accent-light/50 hover:text-accent transition-colors'

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
        className="relative flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-muted hover:text-primary hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        {showCount && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" aria-hidden />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 origin-top-right rounded-xl border border-gray-100 bg-white shadow-card-hover overflow-hidden z-50">
          <div className="py-1.5">
            <Link href="/student/profile" onClick={() => setOpen(false)} className={itemClass}>
              <span className="flex items-center gap-2.5">
                <ProfileIcon />
                Profile
              </span>
            </Link>
            <Link href="/student/dashboard" onClick={() => setOpen(false)} className={itemClass}>
              <span className="flex items-center gap-2.5">
                <ApplicationsIcon />
                My applications
              </span>
              {showCount && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {closingSoonCount}
                </span>
              )}
            </Link>
          </div>
          <div className="border-t border-gray-100 py-1.5">
            <button
              type="button"
              onClick={signOut}
              className={`${itemClass} w-full text-left text-muted hover:text-red-600 hover:bg-red-50`}
            >
              <span className="flex items-center gap-2.5">
                <LogoutIcon />
                Log out
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
