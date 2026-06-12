'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import type {
  CvFormData,
  CvFormErrors,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
} from '@/lib/cv-tailor/types'

interface StepExperienceProps {
  form: CvFormData
  errors: CvFormErrors
  onChange: (patch: Partial<CvFormData>) => void
}

export function createEducationEntry(id: string = crypto.randomUUID()): EducationEntry {
  return { id, institution: '', qualification: '', startDate: '', endDate: '', grade: '', details: '' }
}

export function createExperienceEntry(id: string = crypto.randomUUID()): ExperienceEntry {
  return { id, role: '', company: '', startDate: '', endDate: '', bulletsRaw: '' }
}

export function createProjectEntry(id: string = crypto.randomUUID()): ProjectEntry {
  return { id, name: '', description: '' }
}

function EntryShell({
  title,
  onRemove,
  removable,
  children,
}: {
  title: string
  onRemove: () => void
  removable: boolean
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 sm:p-5 flex flex-col gap-4 bg-surface/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-primary">{title}</p>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-muted hover:text-red-500 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export default function StepExperience({ form, errors, onChange }: StepExperienceProps) {
  function updateEducation(id: string, patch: Partial<EducationEntry>) {
    onChange({
      education: form.education.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    })
  }

  function updateExperience(id: string, patch: Partial<ExperienceEntry>) {
    onChange({
      experience: form.experience.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    })
  }

  function updateProject(id: string, patch: Partial<ProjectEntry>) {
    onChange({
      projects: form.projects.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-primary">Experience &amp; education</h2>
        <p className="text-sm text-muted mt-1">
          Add entries most recent first. Work experience and projects are optional — plenty of
          strong placement CVs lead with education.
        </p>
      </div>

      {/* Education */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-primary">Academics / education *</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onChange({ education: [...form.education, createEducationEntry()] })}
          >
            + Add education
          </Button>
        </div>

        {errors.education && (
          <p role="alert" className="text-xs text-red-500">
            {errors.education}
          </p>
        )}

        {form.education.map((entry, index) => (
          <EntryShell
            key={entry.id}
            title={`Education ${index + 1}`}
            removable={form.education.length > 1}
            onRemove={() =>
              onChange({ education: form.education.filter((item) => item.id !== entry.id) })
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id={`edu-${entry.id}-qualification`}
                label="Qualification *"
                placeholder="e.g. BSc Computer Science"
                value={entry.qualification}
                error={errors[`education.${entry.id}.qualification`]}
                onChange={(event) => updateEducation(entry.id, { qualification: event.target.value })}
              />
              <Input
                id={`edu-${entry.id}-institution`}
                label="Institution *"
                placeholder="e.g. University of Leeds"
                value={entry.institution}
                error={errors[`education.${entry.id}.institution`]}
                onChange={(event) => updateEducation(entry.id, { institution: event.target.value })}
              />
              <Input
                id={`edu-${entry.id}-startDate`}
                label="Start"
                placeholder="e.g. Sep 2023"
                value={entry.startDate}
                onChange={(event) => updateEducation(entry.id, { startDate: event.target.value })}
              />
              <Input
                id={`edu-${entry.id}-endDate`}
                label="End (or expected)"
                placeholder="e.g. Jun 2027"
                value={entry.endDate}
                onChange={(event) => updateEducation(entry.id, { endDate: event.target.value })}
              />
              <Input
                id={`edu-${entry.id}-grade`}
                label="Grade (optional)"
                placeholder="e.g. Predicted 2:1"
                value={entry.grade}
                onChange={(event) => updateEducation(entry.id, { grade: event.target.value })}
              />
            </div>
            <Textarea
              id={`edu-${entry.id}-details`}
              label="Relevant modules or achievements (optional)"
              placeholder="e.g. Key modules: Data Structures, Databases; Dean's List 2024"
              rows={2}
              value={entry.details}
              onChange={(event) => updateEducation(entry.id, { details: event.target.value })}
            />
          </EntryShell>
        ))}
      </section>

      {/* Work experience */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-primary">Work experience</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onChange({ experience: [...form.experience, createExperienceEntry()] })}
          >
            + Add experience
          </Button>
        </div>

        {form.experience.length === 0 && (
          <p className="text-sm text-muted">
            No work experience yet? That&apos;s fine — skip this or add part-time work,
            volunteering or society roles.
          </p>
        )}

        {form.experience.map((entry, index) => (
          <EntryShell
            key={entry.id}
            title={`Experience ${index + 1}`}
            removable
            onRemove={() =>
              onChange({ experience: form.experience.filter((item) => item.id !== entry.id) })
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id={`exp-${entry.id}-role`}
                label="Role *"
                placeholder="e.g. Retail Assistant"
                value={entry.role}
                error={errors[`experience.${entry.id}.role`]}
                onChange={(event) => updateExperience(entry.id, { role: event.target.value })}
              />
              <Input
                id={`exp-${entry.id}-company`}
                label="Company / organisation *"
                placeholder="e.g. Boots"
                value={entry.company}
                error={errors[`experience.${entry.id}.company`]}
                onChange={(event) => updateExperience(entry.id, { company: event.target.value })}
              />
              <Input
                id={`exp-${entry.id}-startDate`}
                label="Start"
                placeholder="e.g. Jun 2024"
                value={entry.startDate}
                onChange={(event) => updateExperience(entry.id, { startDate: event.target.value })}
              />
              <Input
                id={`exp-${entry.id}-endDate`}
                label="End"
                placeholder="e.g. Sep 2024 — or leave blank for Present"
                value={entry.endDate}
                onChange={(event) => updateExperience(entry.id, { endDate: event.target.value })}
              />
            </div>
            <Textarea
              id={`exp-${entry.id}-bullets`}
              label="What did you do or achieve?"
              placeholder={'One point per line, e.g.\nServed 100+ customers per shift\nTrained two new starters'}
              hint="One bullet per line. We'll sharpen the wording for you."
              rows={4}
              value={entry.bulletsRaw}
              onChange={(event) => updateExperience(entry.id, { bulletsRaw: event.target.value })}
            />
          </EntryShell>
        ))}
      </section>

      {/* Projects */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-primary">Projects (optional)</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onChange({ projects: [...form.projects, createProjectEntry()] })}
          >
            + Add project
          </Button>
        </div>

        {form.projects.length === 0 && (
          <p className="text-sm text-muted">
            Coursework, personal or hackathon projects that show your skills in action.
          </p>
        )}

        {form.projects.map((entry, index) => (
          <EntryShell
            key={entry.id}
            title={`Project ${index + 1}`}
            removable
            onRemove={() =>
              onChange({ projects: form.projects.filter((item) => item.id !== entry.id) })
            }
          >
            <Input
              id={`proj-${entry.id}-name`}
              label="Project name"
              placeholder="e.g. Campus Events App"
              value={entry.name}
              error={errors[`projects.${entry.id}.name`]}
              onChange={(event) => updateProject(entry.id, { name: event.target.value })}
            />
            <Textarea
              id={`proj-${entry.id}-description`}
              label="Description"
              placeholder="What you built, the tools you used and the result."
              rows={2}
              value={entry.description}
              onChange={(event) => updateProject(entry.id, { description: event.target.value })}
            />
          </EntryShell>
        ))}
      </section>
    </div>
  )
}
