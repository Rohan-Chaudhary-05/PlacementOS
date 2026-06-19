'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { UserRole } from '@/lib/constants'
import {
  isClosingSoon,
  type TrackedRow,
  type TrackSnapshot,
  type TrackState,
} from '@/lib/tracker'
import type { StudentProfile } from '@/lib/match'

type TrackerContextValue = {
  ready: boolean
  signedIn: boolean
  role: UserRole | null
  isStudent: boolean
  items: TrackedRow[]
  closingSoonCount: number
  getState: (ref: string) => TrackState | undefined
  save: (ref: string) => void
  markApplied: (ref: string) => void
  setStage: (ref: string, state: TrackState) => void
  remove: (ref: string) => void
  /** The signed-in student's match profile (null if none / not a student). */
  profile: StudentProfile | null
  updateProfile: (next: StudentProfile) => Promise<boolean>
}

const TrackerContext = createContext<TrackerContextValue | null>(null)

export function useTracker(): TrackerContextValue {
  const ctx = useContext(TrackerContext)
  if (!ctx) throw new Error('useTracker must be used within a TrackerProvider')
  return ctx
}

function placeholderSnapshot(): TrackSnapshot {
  return {
    role: '',
    companyName: '',
    location: '',
    sector: '',
    salaryMin: 0,
    salaryMax: 0,
    currency: 'GBP',
    workMode: 'OFFICE',
    deadline: null,
    applyUrl: null,
    isDemo: false,
  }
}

export default function TrackerProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [role, setRole] = useState<UserRole | null>(null)
  const [items, setItems] = useState<TrackedRow[]>([])
  const itemsRef = useRef(items)
  itemsRef.current = items
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const profileRef = useRef(profile)
  profileRef.current = profile

  const isStudent = role === 'student'

  // Load session + role, and (for students) the tracked list. Re-runs on auth change.
  // Uses getSession() (reads the persisted cookie, no network) + onAuthStateChange
  // for reliable client UI state — getUser() can return null on a fresh client
  // before the session hydrates. Real authorization is enforced server-side.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true)
      return
    }
    const supabase = createClient()
    let active = true

    async function applySession(session: Session | null) {
      const user = session?.user ?? null
      if (!user) {
        if (!active) return
        setSignedIn(false)
        setRole(null)
        setItems([])
        setProfile(null)
        setReady(true)
        return
      }
      if (active) setSignedIn(true)
      const { data: profileRow } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (!active) return
      const nextRole = (profileRow?.role as UserRole) ?? 'student'
      setRole(nextRole)
      if (nextRole === 'student') {
        try {
          const [trackerRes, profileRes] = await Promise.all([
            fetch('/api/tracker'),
            fetch('/api/student/profile'),
          ])
          if (active && trackerRes.ok) {
            const json = await trackerRes.json()
            setItems((json.items ?? []) as TrackedRow[])
          }
          if (active && profileRes.ok) {
            const json = await profileRes.json()
            setProfile((json.profile ?? null) as StudentProfile | null)
          }
        } catch {
          /* leave defaults */
        }
      } else {
        setItems([])
        setProfile(null)
      }
      if (active) setReady(true)
    }

    // getSession() reads the persisted cookie and is the initial read; only react
    // to later auth changes here (ignoring INITIAL_SESSION avoids doubling the
    // mount-time profile fetch + tracker load).
    supabase.auth.getSession().then(({ data }) => applySession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return
      applySession(session)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const getState = useCallback(
    (ref: string) => itemsRef.current.find((i) => i.opportunity_ref === ref)?.state,
    []
  )

  // Revert a single ref to its prior row (or remove it), preserving any concurrent
  // changes to OTHER refs that landed while this request was in flight.
  const restoreRef = useCallback((ref: string, prevRow: TrackedRow | undefined) => {
    setItems((cur) => {
      const without = cur.filter((i) => i.opportunity_ref !== ref)
      return prevRow ? [prevRow, ...without] : without
    })
  }, [])

  const mutate = useCallback(
    async (ref: string, state: TrackState) => {
      const prevRow = itemsRef.current.find((i) => i.opportunity_ref === ref)
      setItems((cur) => {
        const idx = cur.findIndex((i) => i.opportunity_ref === ref)
        if (idx >= 0) {
          const next = [...cur]
          next[idx] = { ...next[idx], state }
          return next
        }
        return [
          {
            id: `pending-${ref}`,
            opportunity_ref: ref,
            state,
            snapshot: placeholderSnapshot(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...cur,
        ]
      })
      try {
        const res = await fetch('/api/tracker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunityRef: ref, state }),
        })
        if (!res.ok) throw new Error()
        const { item } = (await res.json()) as { item: TrackedRow }
        setItems((cur) => [item, ...cur.filter((i) => i.opportunity_ref !== ref)])
      } catch {
        restoreRef(ref, prevRow)
      }
    },
    [restoreRef]
  )

  const remove = useCallback(
    async (ref: string) => {
      const prevRow = itemsRef.current.find((i) => i.opportunity_ref === ref)
      setItems((cur) => cur.filter((i) => i.opportunity_ref !== ref))
      try {
        const res = await fetch('/api/tracker', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunityRef: ref }),
        })
        if (!res.ok) throw new Error()
      } catch {
        restoreRef(ref, prevRow)
      }
    },
    [restoreRef]
  )

  const save = useCallback((ref: string) => mutate(ref, 'SAVED'), [mutate])
  const markApplied = useCallback((ref: string) => mutate(ref, 'APPLIED'), [mutate])
  // Generic stage transition for the pipeline board (reuses mutate's optimistic
  // update + per-ref revert).
  const setStage = useCallback((ref: string, state: TrackState) => mutate(ref, state), [mutate])

  // Optimistically update the match profile so badges/sort refresh instantly,
  // then persist; revert on failure.
  const updateProfile = useCallback(async (next: StudentProfile): Promise<boolean> => {
    const prev = profileRef.current
    setProfile(next)
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      if (!res.ok) throw new Error()
      const { profile: saved } = await res.json()
      if (saved) setProfile(saved as StudentProfile)
      return true
    } catch {
      setProfile(prev)
      return false
    }
  }, [])

  const closingSoonCount = items.filter(
    (i) => i.state === 'SAVED' && isClosingSoon(i.snapshot.deadline)
  ).length

  return (
    <TrackerContext.Provider
      value={{ ready, signedIn, role, isStudent, items, closingSoonCount, getState, save, markApplied, setStage, remove, profile, updateProfile }}
    >
      {children}
    </TrackerContext.Provider>
  )
}
