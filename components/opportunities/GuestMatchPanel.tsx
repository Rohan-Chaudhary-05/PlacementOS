'use client'

// Guest match inputs: lets a visitor (or a student without a saved profile)
// enter a discipline + skills and see GENUINE scoreMatch results on the cards.
// Inputs live in localStorage only — no account, nothing sent to a server.

import Card from '@/components/ui/Card'
import { WORK_MODES, WORK_MODE_LABELS, type WorkMode } from '@/lib/constants'
import type { StudentProfile } from '@/lib/match'

export type GuestMatchInputs = {
  discipline: string
  skills: string
  workModes: WorkMode[]
}

export type GuestMatchState = { inputs: GuestMatchInputs; dismissed: boolean }

const STORAGE_KEY = 'pos.guestMatchProfile'

export function emptyGuestInputs(): GuestMatchInputs {
  return { discipline: '', skills: '', workModes: [] }
}

/** Read saved guest inputs. SSR-safe; corrupt/stale values are treated as absent. */
export function loadGuestState(): GuestMatchState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      inputs?: { discipline?: unknown; skills?: unknown; workModes?: unknown }
      dismissed?: unknown
    }
    const inputs = parsed.inputs ?? {}
    return {
      inputs: {
        discipline: typeof inputs.discipline === 'string' ? inputs.discipline : '',
        skills: typeof inputs.skills === 'string' ? inputs.skills : '',
        workModes: Array.isArray(inputs.workModes)
          ? (inputs.workModes as unknown[]).filter(
              (m): m is WorkMode => typeof m === 'string' && (WORK_MODES as readonly string[]).includes(m)
            )
          : [],
      },
      dismissed: parsed.dismissed === true,
    }
  } catch {
    return null
  }
}

/** Persist guest inputs. Fails quietly (private browsing, storage blocked). */
export function persistGuestState(state: GuestMatchState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Best-effort — the panel still works in-memory for the session.
  }
}

/** Build a StudentProfile-shaped object, or null when every input is empty. */
export function guestProfileFrom(inputs: GuestMatchInputs | null): StudentProfile | null {
  if (!inputs) return null
  const discipline = inputs.discipline.trim()
  const skills = inputs.skills.trim()
  if (!discipline && !skills && inputs.workModes.length === 0) return null
  return {
    discipline: discipline || null,
    study_year: null,
    skills: skills || null,
    target_sectors: [],
    work_modes: inputs.workModes,
    preferred_locations: null,
    min_salary: null,
  }
}

const DISCIPLINE_SUGGESTIONS = [
  'Computer Science',
  'Software Engineering',
  'Data Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Biochemistry',
  'Biomedical Science',
  'Mechanical Engineering',
  'Electrical & Electronic Engineering',
  'Aerospace Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Environmental Science',
  'Economics',
]

const INPUT_CLASSES =
  'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'

export default function GuestMatchPanel({
  value,
  onChange,
  onDismiss,
}: {
  value: GuestMatchInputs
  onChange: (inputs: GuestMatchInputs) => void
  onDismiss: () => void
}) {
  const hasInput = value.discipline.trim() !== '' || value.skills.trim() !== '' || value.workModes.length > 0

  function toggleMode(mode: WorkMode) {
    const workModes = value.workModes.includes(mode)
      ? value.workModes.filter((m) => m !== mode)
      : [...value.workModes, mode]
    onChange({ ...value, workModes })
  }

  return (
    <Card className="border-dashed p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-primary">See how well each role fits you</h2>
          <p className="text-xs text-muted mt-0.5">
            Tell us your discipline and a few skills to see a real match score on every card — no
            account needed.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss match preview"
          className="text-muted hover:text-primary transition-colors flex-shrink-0"
        >
          ✕
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <div>
          <label htmlFor="guest-discipline" className="block text-xs font-semibold text-muted uppercase tracking-widest mb-1.5">
            Your discipline
          </label>
          <input
            id="guest-discipline"
            type="text"
            list="guest-disciplines"
            value={value.discipline}
            onChange={(e) => onChange({ ...value, discipline: e.target.value })}
            placeholder="e.g. Computer Science"
            className={INPUT_CLASSES}
          />
          <datalist id="guest-disciplines">
            {DISCIPLINE_SUGGESTIONS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="guest-skills" className="block text-xs font-semibold text-muted uppercase tracking-widest mb-1.5">
            Skills (comma-separated)
          </label>
          <input
            id="guest-skills"
            type="text"
            value={value.skills}
            onChange={(e) => onChange({ ...value, skills: e.target.value })}
            placeholder="e.g. Python, SQL, MATLAB"
            className={INPUT_CLASSES}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
        {WORK_MODES.map((mode) => (
          <label key={mode} className="inline-flex items-center gap-1.5 text-xs text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={value.workModes.includes(mode)}
              onChange={() => toggleMode(mode)}
              className="rounded border-gray-300 text-accent focus:ring-accent"
            />
            {WORK_MODE_LABELS[mode]}
          </label>
        ))}
        {hasInput && (
          <button
            type="button"
            onClick={() => onChange(emptyGuestInputs())}
            className="ml-auto text-xs text-muted hover:text-accent transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </Card>
  )
}
