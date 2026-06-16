'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { SECTORS, WORK_MODES, WORK_MODE_LABELS, type WorkMode } from '@/lib/constants'
import { validateOpportunity, type FieldErrors } from '@/lib/validation'

const sectorOptions = SECTORS.map((sector) => ({ value: sector, label: sector }))

type FormState = {
  role: string
  sector: string
  location: string
  workMode: WorkMode | ''
  salaryMin: string
  salaryMax: string
  duration: string
  deadline: string
  description: string
  companyValues: string
  requirements: string
  applyUrl: string
  companyWebsite: string
}

const initialForm: FormState = {
  role: '',
  sector: '',
  location: '',
  workMode: '',
  salaryMin: '',
  salaryMax: '',
  duration: '',
  deadline: '',
  description: '',
  companyValues: '',
  requirements: '',
  applyUrl: '',
  companyWebsite: '',
}

export default function OpportunityForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validation = validateOpportunity(form)
    setErrors(validation)
    if (Object.keys(validation).length > 0) {
      setFormError('Please fix the highlighted fields.')
      return
    }

    setLoading(true)
    setFormError('')
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.errors) setErrors(data.errors)
        setFormError(data.error || 'Please fix the highlighted fields.')
        setLoading(false)
        return
      }
      router.push('/company/dashboard?posted=1')
      router.refresh()
    } catch {
      setFormError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        id="opp-role"
        label="Job role / title"
        value={form.role}
        onChange={set('role')}
        error={errors.role}
        placeholder="Data Science Placement"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="opp-sector"
          label="Sector"
          value={form.sector}
          onChange={set('sector')}
          error={errors.sector}
          placeholder="Select a sector"
          options={sectorOptions}
        />
        <Input
          id="opp-location"
          label="Location"
          value={form.location}
          onChange={set('location')}
          error={errors.location}
          placeholder="Cambridge, UK"
        />
      </div>

      {/* Work mode */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-primary">Work mode</span>
        <div role="radiogroup" aria-label="Work mode" className="grid grid-cols-3 gap-2">
          {WORK_MODES.map((mode) => {
            const selected = form.workMode === mode
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setForm((prev) => ({ ...prev, workMode: mode }))}
                className={[
                  'px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                  selected
                    ? 'border-accent bg-accent-light text-accent'
                    : 'border-gray-200 text-muted hover:border-gray-300 hover:text-primary',
                ].join(' ')}
              >
                {WORK_MODE_LABELS[mode]}
              </button>
            )
          })}
        </div>
        {errors.workMode && (
          <p role="alert" className="text-xs text-red-500 mt-0.5">
            {errors.workMode}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="opp-salary-min"
          type="number"
          min="0"
          step="1"
          label="Minimum salary (£ / year)"
          value={form.salaryMin}
          onChange={set('salaryMin')}
          error={errors.salaryMin}
          placeholder="22000"
        />
        <Input
          id="opp-salary-max"
          type="number"
          min="0"
          step="1"
          label="Maximum salary (£ / year)"
          value={form.salaryMax}
          onChange={set('salaryMax')}
          error={errors.salaryMax}
          placeholder="26000"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="opp-duration"
          label="Duration"
          value={form.duration}
          onChange={set('duration')}
          error={errors.duration}
          placeholder="12 months"
        />
        <Input
          id="opp-deadline"
          type="date"
          label="Application deadline (optional)"
          value={form.deadline}
          onChange={set('deadline')}
          error={errors.deadline}
        />
      </div>

      <Textarea
        id="opp-description"
        label="Role description"
        value={form.description}
        onChange={set('description')}
        error={errors.description}
        rows={5}
        placeholder="What the placement student will work on, the team, and what they'll learn."
      />

      <Textarea
        id="opp-values"
        label="Company values"
        value={form.companyValues}
        onChange={set('companyValues')}
        error={errors.companyValues}
        rows={3}
        placeholder="What your company stands for and the kind of person who thrives there."
      />

      <Textarea
        id="opp-requirements"
        label="Requirements (optional)"
        value={form.requirements}
        onChange={set('requirements')}
        rows={3}
        placeholder="Degree, skills, or experience you're looking for."
      />

      {/* Application link — where students are sent when they click "Apply". */}
      <div className="rounded-xl border border-indigo-100 bg-accent-light/40 p-4 space-y-4">
        <Input
          id="opp-apply-url"
          type="url"
          label="Application link"
          value={form.applyUrl}
          onChange={set('applyUrl')}
          error={errors.applyUrl}
          placeholder="https://careers.acme.com/placements/data-science"
          hint="Where students go to apply. Use your ATS / careers page or an application form."
        />
        <Input
          id="opp-company-website"
          type="url"
          label="Company website (optional)"
          value={form.companyWebsite}
          onChange={set('companyWebsite')}
          error={errors.companyWebsite}
          placeholder="https://www.acme.com"
          hint="Shown on the opportunity page so students can learn about you."
        />
      </div>

      {formError && (
        <p role="alert" className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {formError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" variant="primary" size="lg" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit opportunity'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.push('/company/dashboard')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
