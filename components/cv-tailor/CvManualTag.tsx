'use client'

import { useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import {
  parseEducationLines,
  parseExperienceLines,
  skillsFromLines,
  type CvExtraction,
} from '@/lib/cv-tailor/extractCv'
import type {
  ContactDetails,
  CvFormData,
  EducationEntry,
  ExperienceEntry,
} from '@/lib/cv-tailor/types'

interface CvManualTagProps {
  extraction: CvExtraction
  onApply: (patch: Partial<CvFormData>) => void
  onCancel: () => void
}

type SingleField = 'fullName' | 'email' | 'phone' | 'location' | 'linkedin'

const SINGLE_FIELDS: Array<{ key: SingleField; label: string }> = [
  { key: 'fullName', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'location', label: 'Location' },
  { key: 'linkedin', label: 'LinkedIn' },
]

function newId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${prefix}-${Math.round(Math.random() * 1e9)}`
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of values) {
    const k = v.toLowerCase()
    if (v && !seen.has(k)) {
      seen.add(k)
      out.push(v)
    }
  }
  return out
}

export default function CvManualTag({ extraction, onApply, onCancel }: CvManualTagProps) {
  const initialContact = extraction.patch.contact
  const [contact, setContact] = useState<Partial<ContactDetails>>({
    fullName: initialContact?.fullName ?? '',
    email: initialContact?.email ?? '',
    phone: initialContact?.phone ?? '',
    location: initialContact?.location ?? '',
    linkedin: initialContact?.linkedin ?? '',
  })
  const [summary, setSummary] = useState(extraction.patch.summary ?? '')
  const [skills, setSkills] = useState<string[]>(
    extraction.patch.hardSkillsRaw ? extraction.patch.hardSkillsRaw.split(',').map((s) => s.trim()).filter(Boolean) : []
  )
  const [certs, setCerts] = useState<string[]>(
    extraction.patch.certificationsRaw ? extraction.patch.certificationsRaw.split('\n').filter(Boolean) : []
  )
  const [education, setEducation] = useState<EducationEntry[]>(extraction.patch.education ?? [])
  const [experience, setExperience] = useState<ExperienceEntry[]>(extraction.patch.experience ?? [])

  const [selected, setSelected] = useState<Set<number>>(new Set())

  const selectedLines = useMemo(
    () => [...selected].sort((a, b) => a - b).map((i) => extraction.lines[i]),
    [selected, extraction.lines]
  )
  const selectedText = selectedLines.join(' ').replace(/\s{2,}/g, ' ').trim()
  const hasSelection = selected.size > 0

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function clearSelection() {
    setSelected(new Set())
  }

  function assignSingle(field: SingleField) {
    if (!selectedText) return
    setContact((c) => ({ ...c, [field]: selectedText }))
    clearSelection()
  }

  function assignSummary() {
    if (!selectedText) return
    setSummary(selectedText)
    clearSelection()
  }

  function assignSkills() {
    if (selectedLines.length === 0) return
    setSkills((prev) => dedupe([...prev, ...skillsFromLines(selectedLines)]))
    clearSelection()
  }

  function assignCerts() {
    if (selectedLines.length === 0) return
    setCerts((prev) => dedupe([...prev, ...selectedLines.map((l) => l.trim())]))
    clearSelection()
  }

  function assignEducation() {
    if (selectedLines.length === 0) return
    const parsed = parseEducationLines(selectedLines)
    const entries = parsed.length > 0 ? parsed : [{ id: newId('edu'), institution: '', qualification: selectedText, startDate: '', endDate: '', grade: '', details: '' }]
    setEducation((prev) => [...prev, ...entries])
    clearSelection()
  }

  function assignExperience() {
    if (selectedLines.length === 0) return
    const parsed = parseExperienceLines(selectedLines)
    const entries =
      parsed.length > 0
        ? parsed
        : [{ id: newId('exp'), role: selectedLines[0], company: '', startDate: '', endDate: '', bulletsRaw: selectedLines.slice(1).join('\n') }]
    setExperience((prev) => [...prev, ...entries])
    clearSelection()
  }

  function apply() {
    const patch: Partial<CvFormData> = {}
    const trimmedContact: Partial<ContactDetails> = {}
    for (const { key } of SINGLE_FIELDS) {
      const v = (contact[key] ?? '').trim()
      if (v) trimmedContact[key] = v
    }
    if (Object.keys(trimmedContact).length > 0) patch.contact = trimmedContact as ContactDetails
    if (summary.trim()) patch.summary = summary.trim()
    if (skills.length > 0) patch.hardSkillsRaw = skills.join(', ')
    if (certs.length > 0) patch.certificationsRaw = certs.join('\n')
    if (education.length > 0) patch.education = education
    if (experience.length > 0) patch.experience = experience
    onApply(patch)
  }

  const contactSummary = SINGLE_FIELDS.filter(({ key }) => (contact[key] ?? '').trim())

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="text-lg font-semibold text-primary">Tag your CV manually</h2>
        <button onClick={onCancel} className="text-sm text-muted hover:text-primary transition-colors">
          Cancel
        </button>
      </div>
      <p className="text-sm text-muted mb-5">
        Select the lines that belong together, then choose what they are. Repeat for each part. Anything you skip you
        can still type in the form afterwards.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CV text */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">Your CV text</p>
            {hasSelection && (
              <button onClick={clearSelection} className="text-xs text-accent hover:underline">
                Clear ({selected.size})
              </button>
            )}
          </div>
          <div className="border border-gray-200 rounded-xl max-h-96 overflow-y-auto divide-y divide-gray-50">
            {extraction.lines.map((line, i) => {
              const on = selected.has(i)
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(i)}
                  className={[
                    'w-full text-left px-3 py-2 text-sm transition-colors',
                    on ? 'bg-accent-light text-accent' : 'text-primary hover:bg-surface',
                  ].join(' ')}
                >
                  {line}
                </button>
              )
            })}
          </div>
        </div>

        {/* Assignment panel */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Assign {selected.size > 0 ? `${selected.size} selected line${selected.size === 1 ? '' : 's'}` : 'selected lines'} to:
            </p>
            <div className="flex flex-wrap gap-2">
              {SINGLE_FIELDS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  disabled={!hasSelection}
                  onClick={() => assignSingle(key)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-primary hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {label}
                </button>
              ))}
              {[
                { label: 'Summary', fn: assignSummary },
                { label: 'Skills', fn: assignSkills },
                { label: 'Education', fn: assignEducation },
                { label: 'Experience', fn: assignExperience },
                { label: 'Certifications', fn: assignCerts },
              ].map(({ label, fn }) => (
                <button
                  key={label}
                  type="button"
                  disabled={!hasSelection}
                  onClick={fn}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-primary hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  + {label}
                </button>
              ))}
            </div>
          </div>

          {/* Current values */}
          <div className="rounded-xl bg-surface border border-gray-100 p-3 text-sm space-y-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">So far</p>
            {contactSummary.length === 0 &&
              !summary &&
              skills.length === 0 &&
              certs.length === 0 &&
              education.length === 0 &&
              experience.length === 0 && <p className="text-muted text-sm">Nothing tagged yet.</p>}

            {contactSummary.map(({ key, label }) => (
              <FieldRow key={key} label={label} value={contact[key] ?? ''} onClear={() => setContact((c) => ({ ...c, [key]: '' }))} />
            ))}
            {summary && <FieldRow label="Summary" value={summary} onClear={() => setSummary('')} />}
            {skills.length > 0 && <FieldRow label="Skills" value={skills.join(', ')} onClear={() => setSkills([])} />}
            {certs.length > 0 && <FieldRow label="Certifications" value={`${certs.length} item(s)`} onClear={() => setCerts([])} />}
            {education.length > 0 && (
              <FieldRow label="Education" value={`${education.length} entr${education.length === 1 ? 'y' : 'ies'}`} onClear={() => setEducation([])} />
            )}
            {experience.length > 0 && (
              <FieldRow label="Experience" value={`${experience.length} entr${experience.length === 1 ? 'y' : 'ies'}`} onClear={() => setExperience([])} />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-gray-100">
        <Button onClick={apply}>Apply to form</Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function FieldRow({ label, value, onClear }: { label: string; value: string; onClear: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="min-w-0">
        <span className="font-medium text-primary">{label}:</span>{' '}
        <span className="text-muted break-words">{value.length > 80 ? `${value.slice(0, 80)}…` : value}</span>
      </p>
      <button onClick={onClear} className="text-xs text-muted hover:text-red-500 flex-shrink-0 transition-colors">
        Clear
      </button>
    </div>
  )
}
