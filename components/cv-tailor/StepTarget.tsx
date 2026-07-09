'use client'

import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { STEM_INDUSTRIES } from '@/lib/cv-tailor/industries'
import type { CvFormData, CvFormErrors, StemIndustryId } from '@/lib/cv-tailor/types'

interface StepTargetProps {
  form: CvFormData
  errors: CvFormErrors
  onChange: (patch: Partial<CvFormData>) => void
}

const industryOptions = STEM_INDUSTRIES.map((industry) => ({
  value: industry.id,
  label: industry.label,
}))

export default function StepTarget({ form, errors, onChange }: StepTargetProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-primary">Target role</h2>
        <p className="text-sm text-muted mt-1">
          Tell us where you&apos;re applying and we&apos;ll tailor your summary, headline and
          skill ordering to match.
        </p>
      </div>

      <Select
        id="industry"
        label="STEM industry you're applying to *"
        placeholder="Select an industry…"
        options={industryOptions}
        value={form.industry}
        error={errors.industry}
        onChange={(event) => onChange({ industry: event.target.value as StemIndustryId | '' })}
      />

      <Input
        id="targetCompany"
        label="Specific company (optional)"
        placeholder="e.g. Helixon Bio, Fenchip Systems"
        value={form.targetCompany}
        onChange={(event) => onChange({ targetCompany: event.target.value })}
      />

      <div className="rounded-xl bg-accent-light/60 border border-indigo-100 p-4">
        <p className="text-sm text-primary leading-relaxed">
          <span className="font-semibold">What happens next:</span> we polish your wording, order
          your skills for the industry, sharpen your experience bullets and assemble everything
          into a clean, recruiter-ready CV you can preview and download as a PDF.
        </p>
      </div>
    </div>
  )
}
