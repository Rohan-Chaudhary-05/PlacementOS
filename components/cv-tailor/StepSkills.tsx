'use client'

import Textarea from '@/components/ui/Textarea'
import type { CvFormData, CvFormErrors } from '@/lib/cv-tailor/types'

interface StepSkillsProps {
  form: CvFormData
  errors: CvFormErrors
  onChange: (patch: Partial<CvFormData>) => void
}

export default function StepSkills({ form, errors, onChange }: StepSkillsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-primary">Skills &amp; certifications</h2>
        <p className="text-sm text-muted mt-1">
          List everything relevant — we will tidy the wording, fix capitalisation and order your
          hard skills for the industry you choose.
        </p>
      </div>

      <Textarea
        id="hardSkillsRaw"
        label="Hard skills *"
        placeholder="e.g. Python, SQL, MATLAB, data analysis, circuit design"
        hint="Separate with commas or new lines."
        rows={3}
        value={form.hardSkillsRaw}
        error={errors.hardSkillsRaw}
        onChange={(event) => onChange({ hardSkillsRaw: event.target.value })}
      />

      <Textarea
        id="softSkillsRaw"
        label="Soft skills (optional)"
        placeholder="e.g. teamwork, communication, problem solving, time management"
        hint="Separate with commas or new lines."
        rows={2}
        value={form.softSkillsRaw}
        onChange={(event) => onChange({ softSkillsRaw: event.target.value })}
      />

      <Textarea
        id="toolsAndAiRaw"
        label="AI, software & tech you use (optional)"
        placeholder="e.g. ChatGPT, Excel, Git, Figma, Jira, SolidWorks"
        hint="AI tools, software packages and technology you work with confidently."
        rows={2}
        value={form.toolsAndAiRaw}
        onChange={(event) => onChange({ toolsAndAiRaw: event.target.value })}
      />

      <Textarea
        id="certificationsRaw"
        label="Certifications (optional)"
        placeholder={'e.g. AWS Cloud Practitioner\nGoogle Data Analytics Certificate'}
        hint="One per line, including the awarding body if relevant."
        rows={3}
        value={form.certificationsRaw}
        onChange={(event) => onChange({ certificationsRaw: event.target.value })}
      />
    </div>
  )
}
