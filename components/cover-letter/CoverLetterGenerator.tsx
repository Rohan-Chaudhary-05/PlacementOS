'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { STEM_INDUSTRIES } from '@/lib/cv-tailor/industries'
import type { StemIndustryId } from '@/lib/cv-tailor/types'
import { generateCoverLetter } from '@/lib/cover-letter/generateCoverLetter'
import { downloadCoverLetterPdf } from '@/lib/cover-letter/downloadCoverLetterPdf'
import { validateCoverLetter } from '@/lib/cover-letter/validate'
import type { CoverLetterForm, CoverLetterErrors, GeneratedCoverLetter } from '@/lib/cover-letter/types'

const EMPTY_FORM: CoverLetterForm = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  qualification: '',
  company: '',
  role: '',
  industry: '',
  hiringManager: '',
  source: '',
  skillsRaw: '',
  achievementsRaw: '',
  motivation: '',
}

const INDUSTRY_OPTIONS = STEM_INDUSTRIES.map((i) => ({ value: i.id, label: i.label }))

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">{children}</h2>
}

export default function CoverLetterGenerator() {
  const [form, setForm] = useState<CoverLetterForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<CoverLetterErrors>({})
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [letter, setLetter] = useState<GeneratedCoverLetter | null>(null)
  const [view, setView] = useState<'form' | 'preview'>('form')
  const [downloading, setDownloading] = useState(false)

  function set<K extends keyof CoverLetterForm>(key: K, value: CoverLetterForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleGenerate() {
    const nextErrors = validateCoverLetter(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      // Focus the first invalid field for keyboard users.
      const firstKey = Object.keys(nextErrors)[0]
      document.getElementById(`cl-${firstKey}`)?.focus()
      return
    }
    setStatus('loading')
    const result = await generateCoverLetter(form)
    setLetter(result)
    setView('preview')
    setStatus('idle')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDownload() {
    if (!letter) return
    setDownloading(true)
    try {
      await downloadCoverLetterPdf(letter)
    } finally {
      setDownloading(false)
    }
  }

  if (view === 'preview' && letter) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-primary">Your cover letter</h2>
            <p className="text-sm text-muted">
              Tailored for {letter.meta.role} at {letter.meta.company}.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="md" onClick={() => setView('form')}>
              Back to edit
            </Button>
            <Button variant="primary" size="md" onClick={handleDownload} disabled={downloading}>
              {downloading ? 'Preparing…' : 'Download PDF'}
            </Button>
          </div>
        </div>

        {/* Paper preview — mirrors the PDF layout */}
        <Card className="p-8 sm:p-12">
          <p className="text-xl font-bold text-primary">{letter.fullName}</p>
          {letter.contactLine && (
            <p className="text-xs text-muted mt-1 pb-4 border-b border-gray-100">{letter.contactLine}</p>
          )}
          <p className="text-sm text-muted mt-5">{letter.date}</p>
          <div className="mt-3 space-y-0.5">
            {letter.recipientBlock.map((line, i) =>
              i === 1 ? (
                <p key={i} className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {line}
                </p>
              ) : (
                <p key={i} className="text-sm text-primary">
                  {line}
                </p>
              )
            )}
          </div>
          <p className="mt-5 text-sm text-primary">{letter.greeting}</p>
          <div className="mt-3 space-y-3">
            {letter.paragraphs.map((p, i) => (
              <p key={i} className="text-sm text-primary leading-relaxed text-justify">
                {p}
              </p>
            ))}
          </div>
          <p className="mt-6 text-sm text-primary">{letter.signOff}</p>
          <p className="mt-6 text-sm font-semibold text-primary">{letter.fullName}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card className="p-6 sm:p-7">
        <SectionTitle>Your details</SectionTitle>
        <div className="space-y-4">
          <Input id="cl-fullName" label="Full name" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} error={errors.fullName} placeholder="Alex Taylor" autoComplete="name" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="cl-email" type="email" label="Email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} placeholder="alex@university.ac.uk" autoComplete="email" />
            <Input id="cl-phone" label="Phone (optional)" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="07123 456789" autoComplete="tel" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="cl-location" label="Location (optional)" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Manchester, UK" />
            <Input id="cl-qualification" label="Course / year" value={form.qualification} onChange={(e) => set('qualification', e.target.value)} error={errors.qualification} placeholder="second-year BSc Computer Science student" />
          </div>
        </div>
      </Card>

      <Card className="p-6 sm:p-7">
        <SectionTitle>The role</SectionTitle>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="cl-company" label="Company" value={form.company} onChange={(e) => set('company', e.target.value)} error={errors.company} placeholder="AstraZeneca" />
            <Input id="cl-role" label="Role title" value={form.role} onChange={(e) => set('role', e.target.value)} error={errors.role} placeholder="Data Science Placement" />
          </div>
          <Select
            id="cl-industry"
            label="Industry"
            value={form.industry}
            onChange={(e) => set('industry', e.target.value as StemIndustryId)}
            error={errors.industry}
            placeholder="Choose an industry…"
            options={INDUSTRY_OPTIONS}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="cl-hiringManager" label="Hiring manager (optional)" value={form.hiringManager} onChange={(e) => set('hiringManager', e.target.value)} placeholder="Dr Jane Smith" hint="Leave blank for 'Dear Hiring Manager'" />
            <Input id="cl-source" label="Where you saw it (optional)" value={form.source} onChange={(e) => set('source', e.target.value)} placeholder="on your careers page" />
          </div>
        </div>
      </Card>

      <Card className="p-6 sm:p-7">
        <SectionTitle>Your pitch</SectionTitle>
        <div className="space-y-4">
          <Textarea id="cl-skillsRaw" label="Key skills" value={form.skillsRaw} onChange={(e) => set('skillsRaw', e.target.value)} error={errors.skillsRaw} rows={2} placeholder="Python, SQL, machine learning, teamwork" hint="Comma or new-line separated. The top few are woven into the letter." />
          <Textarea id="cl-achievementsRaw" label="Achievements / highlights (optional)" value={form.achievementsRaw} onChange={(e) => set('achievementsRaw', e.target.value)} rows={3} placeholder={'Built a data pipeline that cut reporting time by 40%\nLed a team of four on a final-year project'} hint="One per line — the top two are included." />
          <Textarea id="cl-motivation" label="Why this company? (optional)" value={form.motivation} onChange={(e) => set('motivation', e.target.value)} rows={3} placeholder="In your own words — what draws you to them." />
        </div>
      </Card>

      <Button variant="primary" size="lg" className="w-full" onClick={handleGenerate} disabled={status === 'loading'}>
        {status === 'loading' ? 'Writing your letter…' : 'Generate cover letter'}
      </Button>
      <p className="text-xs text-muted text-center">
        Generated on your device from what you enter — nothing is stored or sent anywhere.
      </p>
    </div>
  )
}
