'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
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
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              active
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-muted border-gray-200 hover:border-accent hover:text-accent',
            ].join(' ')}
          >
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

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

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
      <Card className="p-6 sm:p-7 space-y-4">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">About you</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input id="discipline" label="Discipline / degree" value={discipline} onChange={(e) => setDiscipline(e.target.value)} error={errors.discipline} placeholder="e.g. Computer Science, Mechanical Engineering" />
          <Select id="study_year" label="Year of study" value={studyYear} onChange={(e) => setStudyYear(e.target.value)} placeholder="Select…" options={YEAR_OPTIONS} />
        </div>
        <Textarea id="skills" label="Skills" value={skills} onChange={(e) => setSkills(e.target.value)} error={errors.skills} rows={2} placeholder="Python, SQL, machine learning, teamwork" hint="Comma or newline separated — the closer these are to a listing's requirements, the higher the match." />
      </Card>

      <Card className="p-6 sm:p-7 space-y-5">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">What you&apos;re looking for</h2>
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

      <div className="flex items-center gap-3">
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
