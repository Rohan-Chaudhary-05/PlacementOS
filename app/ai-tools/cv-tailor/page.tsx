'use client'

import { ChangeEvent, useMemo, useRef, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { tailorCv, type TailorCvResponse } from '@/lib/tailorCv'

type TabKey = 'statement' | 'alignment' | 'gaps'

const tabOrder: Array<{ key: TabKey; label: string }> = [
  { key: 'statement', label: 'Rewritten Statement' },
  { key: 'alignment', label: 'Skills Alignment' },
  { key: 'gaps', label: 'Gaps & Suggestions' },
]

function strengthBadge(matchStrength: 'strong' | 'moderate' | 'weak') {
  if (matchStrength === 'strong') {
    return <Badge variant="success">Strong</Badge>
  }

  if (matchStrength === 'moderate') {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">Moderate</span>
  }

  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">Weak</span>
}

export default function CvTailorPage() {
  const [cvText, setCvText] = useState('')
  const [jobDescriptionText, setJobDescriptionText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('statement')
  const [result, setResult] = useState<TailorCvResponse | null>(null)
  const [copyFeedback, setCopyFeedback] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const canSubmit = useMemo(() => {
    return cvText.trim().length > 0 && jobDescriptionText.trim().length > 0 && !isLoading
  }, [cvText, jobDescriptionText, isLoading])

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const text = await file.text()
    setCvText(text)
  }

  async function runTailorFlow() {
    if (!canSubmit) {
      return
    }

    setCopyFeedback('')
    setIsLoading(true)

    try {
      const tailored = await tailorCv(cvText, jobDescriptionText)
      setResult(tailored)
      setActiveTab('statement')
    } finally {
      setIsLoading(false)
    }
  }

  async function copySection(content: string) {
    try {
      await navigator.clipboard.writeText(content)
      setCopyFeedback('Copied to clipboard')
      setTimeout(() => setCopyFeedback(''), 1800)
    } catch {
      setCopyFeedback('Could not copy in this browser')
      setTimeout(() => setCopyFeedback(''), 1800)
    }
  }

  function startOver() {
    setCvText('')
    setJobDescriptionText('')
    setResult(null)
    setIsLoading(false)
    setActiveTab('statement')
    setCopyFeedback('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <section className="min-h-screen bg-surface py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8 sm:mb-10">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">AI Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">CV Tailorer</h1>
          <p className="text-muted mt-2.5 text-base leading-relaxed">
            Paste your CV and a job description. Get a tailored rewrite in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <Card className="p-5 sm:p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label htmlFor="cv-input" className="text-sm font-semibold text-primary">
                  Your CV
                </label>
                <span className="text-xs text-muted">{cvText.length.toLocaleString()} chars</span>
              </div>
              <textarea
                id="cv-input"
                value={cvText}
                onChange={(event) => setCvText(event.target.value)}
                placeholder="Paste your current CV text here..."
                className="w-full min-h-[220px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  onChange={handleUpload}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload .txt
                </Button>
              </div>
            </div>

            <div>
              <label htmlFor="jd-input" className="text-sm font-semibold text-primary mb-2 block">
                Job Description
              </label>
              <textarea
                id="jd-input"
                value={jobDescriptionText}
                onChange={(event) => setJobDescriptionText(event.target.value)}
                placeholder="Paste the role requirements, responsibilities, and preferred skills..."
                className="w-full min-h-[180px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <Button type="button" size="lg" className="w-full sm:w-auto" disabled={!canSubmit} onClick={runTailorFlow}>
              {isLoading ? 'Tailoring...' : 'Tailor my CV'}
            </Button>
          </Card>

          <Card className="p-5 sm:p-6 min-h-[620px] flex flex-col">
            <h2 className="text-lg font-semibold text-primary mb-4">Results</h2>

            {!result && !isLoading && (
              <div className="flex-1 border border-dashed border-gray-200 rounded-xl bg-white/50 px-6 py-10 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-accent-light text-accent flex items-center justify-center mb-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 10h8M8 14h5m3 7H8a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-primary font-medium">Your tailored CV output will appear here</p>
                <p className="text-xs text-muted mt-1 max-w-xs">
                  Add your CV and job description, then click "Tailor my CV" to generate a demo response.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="flex-1 space-y-4 animate-pulse">
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 rounded-lg bg-gray-100" />
                  <div className="h-8 rounded-lg bg-gray-100" />
                  <div className="h-8 rounded-lg bg-gray-100" />
                </div>
                <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-4">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-11/12" />
                  <div className="h-3 bg-gray-100 rounded w-10/12" />
                </div>
                <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-4">
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-16 bg-gray-100 rounded" />
                </div>
              </div>
            )}

            {result && !isLoading && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                  {tabOrder.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={[
                        'text-xs sm:text-sm font-medium rounded-lg px-3 py-2 transition-colors',
                        activeTab === tab.key
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-muted hover:text-primary hover:bg-gray-200',
                      ].join(' ')}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'statement' && (
                  <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 flex-1">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="text-sm font-semibold text-primary">Tailored personal statement</h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => copySection(result.rewrittenStatement)}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">{result.rewrittenStatement}</p>
                  </div>
                )}

                {activeTab === 'alignment' && (
                  <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 flex-1">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="text-sm font-semibold text-primary">JD requirements vs CV evidence</h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copySection(
                            result.skillsAlignment
                              .map((item) => `Requirement: ${item.jdRequirement}\nEvidence: ${item.cvEvidence}\nMatch: ${item.matchStrength}`)
                              .join('\n\n')
                          )
                        }
                      >
                        Copy
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {result.skillsAlignment.map((item) => (
                        <div key={item.jdRequirement} className="rounded-lg border border-gray-100 bg-surface p-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-primary">{item.jdRequirement}</p>
                            {strengthBadge(item.matchStrength)}
                          </div>
                          <p className="text-sm text-muted mt-1.5">{item.cvEvidence}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'gaps' && (
                  <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 flex-1 space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-primary">Gaps and suggested bullet points</h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copySection(
                            `Gap Analysis:\n${result.gapAnalysis.map((item) => `- ${item}`).join('\n')}\n\nSuggested Bullets:\n${result.suggestedBullets.map((item) => `- ${item}`).join('\n')}`
                          )
                        }
                      >
                        Copy
                      </Button>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Gap analysis</p>
                      <ul className="space-y-2">
                        {result.gapAnalysis.map((gap) => (
                          <li key={gap} className="text-sm text-muted leading-relaxed rounded-lg bg-surface p-2.5 border border-gray-100">
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Suggested bullets</p>
                      <ul className="space-y-2">
                        {result.suggestedBullets.map((bullet) => (
                          <li key={bullet} className="text-sm text-muted leading-relaxed rounded-lg bg-surface p-2.5 border border-gray-100">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted min-h-[1rem]">{copyFeedback}</p>
                  <Button type="button" variant="secondary" size="sm" onClick={startOver}>
                    Start Over
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}
