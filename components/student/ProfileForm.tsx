'use client'

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import CvImport from '@/components/cv-tailor/CvImport'
import { parseSkillList } from '@/lib/cv-tailor/engine'
import { profileFromCv, type ProfileCvPatch } from '@/lib/cv-tailor/profileFromCv'
import { SECTORS, WORK_MODES, WORK_MODE_LABELS } from '@/lib/constants'
import { validateStudentProfile, type FieldErrors } from '@/lib/validation'
import { useTracker } from '@/components/tracker/TrackerProvider'

const YEAR_OPTIONS = [
  { value: 'First year', label: 'First year' },
  { value: 'Second year', label: 'Second year' },
  { value: 'Third year', label: 'Third year' },
  { value: 'Final year', label: 'Final year' },
  { value: 'Postgraduate', label: 'Postgraduate' },
]

function CheckIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function SectionHeading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0 text-accent">
        {icon}
      </span>
      <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">{children}</h2>
    </div>
  )
}

function PillGroup({
  options,
  selected,
  onToggle,
}: {
  options: Array<{ value: string; label: string }>
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            aria-pressed={active}
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border',
              'transition-all duration-150 active:scale-95',
              active
                ? 'bg-accent text-white border-accent shadow-sm'
                : 'bg-white text-muted border-gray-200 hover:border-accent hover:text-accent',
            ].join(' ')}
          >
            {active && <CheckIcon />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default function ProfileForm() {
  const { ready, profile, updateProfile } = useTracker()

  const [discipline, setDiscipline] = useState('')
  const [studyYear, setStudyYear] = useState('')
  const [skills, setSkills] = useState('')
  const [sectors, setSectors] = useState<string[]>([])
  const [workModes, setWorkModes] = useState<string[]>([])
  const [locations, setLocations] = useState('')
  const [minSalary, setMinSalary] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [seeded, setSeeded] = useState(false)

  // Seed the form from the loaded profile once (or leave blank if none).
  useEffect(() => {
    if (!ready || seeded) return
    if (profile) {
      setDiscipline(profile.discipline ?? '')
      setStudyYear(profile.study_year ?? '')
      setSkills(profile.skills ?? '')
      setSectors(profile.target_sectors ?? [])
      setWorkModes(profile.work_modes ?? [])
      setLocations(profile.preferred_locations ?? '')
      setMinSalary(profile.min_salary != null ? String(profile.min_salary) : '')
    }
    setSeeded(true)
  }, [ready, profile, seeded])

  // Live "profile strength" — one point per dimension filled in. Purely visual
  // feedback (everything is optional); it nudges students toward sharper matches.
  const { pct, filled, total, strengthLabel } = useMemo(() => {
    const flags = [
      discipline.trim() !== '',
      studyYear.trim() !== '',
      skills.trim() !== '',
      sectors.length > 0,
      workModes.length > 0,
      locations.trim() !== '',
      minSalary.trim() !== '',
    ]
    const filled = flags.filter(Boolean).length
    const total = flags.length
    const pct = Math.round((filled / total) * 100)
    const strengthLabel =
      filled === 0
        ? 'Add your details to start matching'
        : filled <= 2
          ? 'Getting started — add a few more'
          : filled <= 4
            ? 'Looking good — keep going'
            : filled <= 6
              ? 'Strong profile'
              : 'Complete — your matches are razor-sharp'
    return { pct, filled, total, strengthLabel }
  }, [discipline, studyYear, skills, sectors, workModes, locations, minSalary])

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  // Merge a CV-derived patch in, non-destructively: only fill blank text fields,
  // and union (dedupe) skills with anything already typed.
  const applyCvPatch = (patch: ProfileCvPatch) => {
    if (patch.discipline && discipline.trim() === '') setDiscipline(patch.discipline)
    if (patch.preferred_locations && locations.trim() === '') setLocations(patch.preferred_locations)
    if (patch.skills) {
      // Union + dedupe, then re-cap to the same 2000-char limit validation enforces
      // (the union can push a near-full field past the cap and block Save otherwise).
      const merged = parseSkillList([skills, patch.skills].filter(Boolean).join(', '))
      setSkills(merged.join(', ').slice(0, 2000))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const { errors: nextErrors, clean } = validateStudentProfile({
      discipline,
      study_year: studyYear,
      skills,
      target_sectors: sectors,
      work_modes: workModes,
      preferred_locations: locations,
      min_salary: minSalary,
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setStatus('error')
      return
    }
    setStatus('saving')
    const ok = await updateProfile(clean)
    setStatus(ok ? 'saved' : 'error')
    if (ok) window.setTimeout(() => setStatus('idle'), 2500)
  }

  if (!ready || !seeded) {
    return (
      <div className="space-y-4 animate-pulse">
        {[0, 1, 2].map((n) => (
          <div key={n} className="h-32 bg-white rounded-xl border border-gray-100" />
        ))}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Autofill from an uploaded CV (reuses the in-browser CV parser) */}
      <Reveal>
        <CvImport
          onImport={(e) => applyCvPatch(profileFromCv(e).patch)}
          deriveFound={(e) => profileFromCv(e).filled}
          heading="Have a CV? Autofill your profile"
          subheading="Upload it and we'll pull out your degree, skills, and location."
          reviewLabel="Review the fields below, then save your profile."
        />
      </Reveal>

      {/* Profile strength meter */}
      <Reveal>
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0 text-accent">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m6-16l2.4 6.1L22 11l-6.6 2.4L13 20l-2.4-6.6L4 11l6.6-1.9L13 3z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-primary">Profile strength</p>
                <p className="text-xs text-muted mt-0.5">{strengthLabel}</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-accent tabular-nums leading-none">
              {pct}
              <span className="text-sm font-semibold text-muted">%</span>
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile strength"
            className="mt-3.5 w-full bg-gray-100 rounded-full h-2 overflow-hidden"
          >
            <div
              className="h-2 rounded-full bg-gradient-to-r from-accent to-indigo-400 transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="sr-only" aria-live="polite">
            Profile strength {pct}%. {strengthLabel}. {filled} of {total} sections completed.
          </p>
        </Card>
      </Reveal>

      {/* About you */}
      <Reveal delay={80}>
        <Card className="p-6 sm:p-7 space-y-4">
          <SectionHeading
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          >
            About you
          </SectionHeading>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="discipline" label="Discipline / degree" value={discipline} onChange={(e) => setDiscipline(e.target.value)} error={errors.discipline} placeholder="e.g. Computer Science, Mechanical Engineering" />
            <Select id="study_year" label="Year of study" value={studyYear} onChange={(e) => setStudyYear(e.target.value)} placeholder="Select…" options={YEAR_OPTIONS} />
          </div>
          <Textarea id="skills" label="Skills" value={skills} onChange={(e) => setSkills(e.target.value)} error={errors.skills} rows={2} placeholder="Python, SQL, machine learning, teamwork" hint="Comma or newline separated — the closer these are to a listing's requirements, the higher the match." />
        </Card>
      </Reveal>

      {/* What you're looking for */}
      <Reveal delay={160}>
        <Card className="p-6 sm:p-7 space-y-5">
          <SectionHeading
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1.6" />
              </svg>
            }
          >
            What you&apos;re looking for
          </SectionHeading>
          <div>
            <p className="text-sm font-medium text-primary mb-2">Target sectors</p>
            <PillGroup options={SECTORS.map((s) => ({ value: s, label: s }))} selected={sectors} onToggle={(v) => toggle(sectors, setSectors, v)} />
          </div>
          <div>
            <p className="text-sm font-medium text-primary mb-2">Work mode</p>
            <PillGroup options={WORK_MODES.map((m) => ({ value: m, label: WORK_MODE_LABELS[m] }))} selected={workModes} onToggle={(v) => toggle(workModes, setWorkModes, v)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="preferred_locations" label="Preferred locations" value={locations} onChange={(e) => setLocations(e.target.value)} error={errors.preferred_locations} placeholder="London, Cambridge" hint="Comma separated, or leave blank for anywhere." />
            <Input id="min_salary" label="Minimum salary (per year)" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} error={errors.min_salary} placeholder="£22,000" />
          </div>
        </Card>
      </Reveal>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save match profile'}
        </Button>
        {status === 'saved' && <span className="text-sm font-medium text-green-600">Saved ✓ Your matches are updated.</span>}
        {status === 'error' && Object.keys(errors).length > 0 && <span className="text-sm text-red-500">Please fix the highlighted fields.</span>}
        {status === 'error' && Object.keys(errors).length === 0 && <span className="text-sm text-red-500">Could not save. Please try again.</span>}
      </div>
      <p className="text-xs text-muted">
        Everything here is optional and private to you. Blanks simply count as “no preference”.
      </p>
    </form>
  )
}
