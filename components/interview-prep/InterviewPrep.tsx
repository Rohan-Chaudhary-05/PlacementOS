'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { STEM_INDUSTRIES } from '@/lib/cv-tailor/industries'
import type { StemIndustryId } from '@/lib/cv-tailor/types'
import {
  CATEGORY_LABELS,
  TECHNICAL_TIP,
  questionsFor,
  type InterviewQuestion,
  type QuestionCategory,
} from '@/lib/interview-prep/questions'
import { answerStarted, loadAnswers, persistAnswers, type AnswerMap } from '@/lib/interview-prep/storage'

const INDUSTRY_OPTIONS = [
  { value: '', label: 'General questions only' },
  ...STEM_INDUSTRIES.map((i) => ({ value: i.id, label: i.label })),
]

const CATEGORY_BADGE: Record<QuestionCategory, string> = {
  behavioural: 'bg-accent-light text-accent',
  motivational: 'bg-amber-50 text-amber-600',
  technical: 'bg-green-50 text-green-700',
}

const TABS: Array<{ value: 'all' | QuestionCategory; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'behavioural', label: 'Behavioural' },
  { value: 'motivational', label: 'Motivational' },
  { value: 'technical', label: 'Technical' },
]

const STAR_FIELDS: Array<{ key: 'situation' | 'task' | 'action' | 'result'; label: string; hint: string }> = [
  { key: 'situation', label: 'Situation', hint: 'Set the scene briefly.' },
  { key: 'task', label: 'Task', hint: 'What was your responsibility?' },
  { key: 'action', label: 'Action', hint: 'What did YOU do?' },
  { key: 'result', label: 'Result', hint: 'The outcome — quantify if you can.' },
]

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function CheckDot({ done }: { done: boolean }) {
  return (
    <span
      className={`flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 ${done ? 'bg-accent text-white' : 'border border-gray-300 text-transparent'}`}
      aria-label={done ? 'Drafted' : 'Not started'}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}

export default function InterviewPrep() {
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [industry, setIndustry] = useState<StemIndustryId | ''>('')
  const [tab, setTab] = useState<'all' | QuestionCategory>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  // Answers live in localStorage only — load them once on mount (client).
  useEffect(() => {
    setAnswers(loadAnswers())
  }, [])

  function update(id: string, field: keyof AnswerMap[string], value: string) {
    setAnswers((prev) => {
      const next = { ...prev, [id]: { ...prev[id], [field]: value } }
      persistAnswers(next)
      return next
    })
  }

  const visible = useMemo(
    () => questionsFor(industry).filter((q) => tab === 'all' || q.category === tab),
    [industry, tab]
  )
  const startedCount = visible.filter((q) => answerStarted(answers[q.id])).length
  const pct = visible.length > 0 ? Math.round((startedCount / visible.length) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Controls + progress */}
      <Card className="p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="sm:max-w-xs w-full">
            <Select
              id="ip-industry"
              label="Add technical questions for"
              value={industry}
              onChange={(e) => setIndustry(e.target.value as StemIndustryId | '')}
              options={INDUSTRY_OPTIONS}
            />
          </div>
          <p className="text-sm text-muted sm:pb-2.5">
            <span className="font-semibold text-primary">{startedCount}</span> of {visible.length} drafted
          </p>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>

        {/* Category tabs */}
        <div className="mt-4 inline-flex flex-wrap rounded-lg border border-gray-200 p-0.5 bg-white">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${tab === t.value ? 'bg-accent text-white' : 'text-muted hover:text-primary'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Questions */}
      {visible.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">
          Choose an industry above to see technical questions for your field.
        </p>
      ) : (
        <div className="space-y-2.5">
          {visible.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              answer={answers[q.id]}
              open={openId === q.id}
              onToggle={() => setOpenId((cur) => (cur === q.id ? null : q.id))}
              onChange={(field, value) => update(q.id, field, value)}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted text-center">
        Your drafts are saved on this device only — nothing is uploaded or shared.
      </p>
    </div>
  )
}

function QuestionItem({
  question,
  answer,
  open,
  onToggle,
  onChange,
}: {
  question: InterviewQuestion
  answer: AnswerMap[string] | undefined
  open: boolean
  onToggle: () => void
  onChange: (field: keyof AnswerMap[string], value: string) => void
}) {
  const done = answerStarted(answer)
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-3 text-left p-4 hover:bg-gray-50/60 transition-colors"
      >
        <CheckDot done={done} />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-primary leading-snug">{question.prompt}</span>
          <span className={`inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${CATEGORY_BADGE[question.category]}`}>
            {CATEGORY_LABELS[question.category]}
            {question.star ? ' · STAR' : ''}
          </span>
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-50">
          <p className="text-xs text-muted leading-relaxed mb-3">
            💡 {question.tip ?? TECHNICAL_TIP}
          </p>
          {question.star ? (
            <div className="space-y-3">
              {STAR_FIELDS.map((f) => (
                <Textarea
                  key={f.key}
                  id={`${question.id}-${f.key}`}
                  label={f.label}
                  hint={f.hint}
                  rows={2}
                  value={answer?.[f.key] ?? ''}
                  onChange={(e) => onChange(f.key, e.target.value)}
                />
              ))}
            </div>
          ) : (
            <Textarea
              id={`${question.id}-notes`}
              label="Your answer"
              rows={4}
              value={answer?.notes ?? ''}
              onChange={(e) => onChange('notes', e.target.value)}
              placeholder="Draft your answer or bullet points…"
            />
          )}
        </div>
      )}
    </div>
  )
}
