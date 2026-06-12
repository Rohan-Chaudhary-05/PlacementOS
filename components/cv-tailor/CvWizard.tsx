'use client'

import { useRef, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { getIndustryProfile } from '@/lib/cv-tailor/industries'
import { polishCv } from '@/lib/cv-tailor/polishCv'
import { downloadCvPdf } from '@/lib/cv-tailor/downloadCvPdf'
import { validateStep } from '@/lib/cv-tailor/validate'
import type { CvFormData, CvFormErrors, PolishedCv } from '@/lib/cv-tailor/types'
import CvPreview from './CvPreview'
import StepContact from './StepContact'
import StepSkills from './StepSkills'
import StepExperience, { createEducationEntry } from './StepExperience'
import StepTarget from './StepTarget'
import WizardProgress, { WIZARD_STEPS } from './WizardProgress'

type WizardStep = 1 | 2 | 3 | 4

const TOTAL_STEPS = WIZARD_STEPS.length as 4

function createEmptyForm(): CvFormData {
  return {
    contact: { fullName: '', email: '', phone: '', location: '', linkedin: '' },
    summary: '',
    hardSkillsRaw: '',
    softSkillsRaw: '',
    toolsAndAiRaw: '',
    certificationsRaw: '',
    // Stable id keeps server and client renders identical on first paint
    education: [createEducationEntry('education-initial')],
    experience: [],
    projects: [],
    industry: '',
    targetCompany: '',
  }
}

export default function CvWizard() {
  const [form, setForm] = useState<CvFormData>(createEmptyForm)
  const [step, setStep] = useState<WizardStep>(1)
  const [errors, setErrors] = useState<CvFormErrors>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateFailed, setGenerateFailed] = useState(false)
  const [polished, setPolished] = useState<PolishedCv | null>(null)
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'error'>('idle')
  const topRef = useRef<HTMLDivElement | null>(null)

  function scrollToTop() {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleChange(patch: Partial<CvFormData>) {
    setForm((previous) => {
      const nextForm = { ...previous, ...patch }

      // After a failed attempt, re-validate live so fixed fields clear immediately
      if (Object.keys(errors).length > 0) {
        setErrors(validateStep(step, nextForm))
      }

      return nextForm
    })
  }

  function goToStep(nextStep: WizardStep) {
    setStep(nextStep)
    setErrors({})
    scrollToTop()
  }

  function handleNext() {
    const stepErrors = validateStep(step, form)

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      scrollToTop()
      return
    }

    if (step < TOTAL_STEPS) {
      goToStep((step + 1) as WizardStep)
    }
  }

  async function handleGenerate() {
    // Validate every step so edits made via "Edit details" can't slip through
    for (const candidate of [1, 2, 3, 4] as const) {
      const stepErrors = validateStep(candidate, form)

      if (Object.keys(stepErrors).length > 0) {
        setStep(candidate)
        setErrors(stepErrors)
        scrollToTop()
        return
      }
    }

    setErrors({})
    setGenerateFailed(false)
    setIsGenerating(true)

    try {
      const result = await polishCv(form)
      setPolished(result)
      setDownloadState('idle')
      scrollToTop()
    } catch {
      setGenerateFailed(true)
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleDownload() {
    if (!polished) {
      return
    }

    setDownloadState('downloading')

    try {
      await downloadCvPdf(polished)
      setDownloadState('idle')
    } catch {
      setDownloadState('error')
    }
  }

  function handleEditDetails() {
    setPolished(null)
    setStep(TOTAL_STEPS)
    setErrors({})
    scrollToTop()
  }

  function handleStartOver() {
    if (!window.confirm('Clear all your details and start again?')) {
      return
    }

    setForm(createEmptyForm())
    setPolished(null)
    setErrors({})
    setStep(1)
    setDownloadState('idle')
    scrollToTop()
  }

  // ---- Generating state ----
  if (isGenerating) {
    return (
      <div ref={topRef}>
        <Card className="max-w-3xl mx-auto p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-primary">
              Polishing your CV{generatingTargetLabel(form)}…
            </p>
          </div>
          <div className="space-y-3 animate-pulse">
            <div className="h-7 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-3/4 mt-6" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        </Card>
      </div>
    )
  }

  // ---- Result state ----
  if (polished) {
    return (
      <div ref={topRef} className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-[800px] mx-auto w-full">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-primary">Your polished CV</h2>
            <Badge variant="accent">
              {polished.meta.industryLabel}
              {polished.meta.targetCompany ? ` · ${polished.meta.targetCompany}` : ''}
            </Badge>
          </div>
        </div>

        <CvPreview cv={polished} />

        <div className="max-w-[800px] mx-auto w-full flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" onClick={handleDownload} disabled={downloadState === 'downloading'}>
              {downloadState === 'downloading' ? 'Preparing PDF…' : 'Download PDF'}
            </Button>
            <Button size="lg" variant="ghost" onClick={handleEditDetails}>
              Edit details
            </Button>
            <Button size="lg" variant="secondary" onClick={handleStartOver}>
              Start over
            </Button>
          </div>
          {downloadState === 'error' && (
            <p role="alert" className="text-sm text-red-500">
              Something went wrong while creating the PDF. Please try again.
            </p>
          )}
        </div>
      </div>
    )
  }

  // ---- Wizard state ----
  return (
    <div ref={topRef} className="flex flex-col gap-6 max-w-3xl mx-auto">
      <WizardProgress
        currentStep={step}
        onStepClick={(target) => goToStep(target as WizardStep)}
      />

      <Card className="p-6 sm:p-8">
        {step === 1 && <StepContact form={form} errors={errors} onChange={handleChange} />}
        {step === 2 && <StepSkills form={form} errors={errors} onChange={handleChange} />}
        {step === 3 && <StepExperience form={form} errors={errors} onChange={handleChange} />}
        {step === 4 && <StepTarget form={form} errors={errors} onChange={handleChange} />}

        {generateFailed && step === TOTAL_STEPS && (
          <p role="alert" className="text-sm text-red-500 mt-6">
            Something went wrong while generating your CV. Please try again.
          </p>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => goToStep((step - 1) as WizardStep)}>
              Back
            </Button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleGenerate}>Generate my CV</Button>
          )}
        </div>
      </Card>

      <p className="text-xs text-muted text-center">
        Step {step} of {TOTAL_STEPS} — {WIZARD_STEPS[step - 1]}
      </p>
    </div>
  )
}

function generatingTargetLabel(form: CvFormData): string {
  const company = form.targetCompany.trim()

  if (company) {
    return ` for ${company}`
  }

  if (form.industry) {
    return ` for ${getIndustryProfile(form.industry).label}`
  }

  return ''
}
