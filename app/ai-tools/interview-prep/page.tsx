import type { Metadata } from 'next'
import InterviewPrep from '@/components/interview-prep/InterviewPrep'

export const metadata: Metadata = {
  title: 'Interview Prep — PlacementOS',
  description:
    'Practise common placement interview questions — behavioural, motivational and technical — with STAR scaffolding. Drafts save on your device.',
}

export default function InterviewPrepPage() {
  return (
    <section className="min-h-screen bg-surface py-14 sm:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">AI Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">Interview Prep</h1>
          <p className="text-muted mt-3 text-base leading-relaxed">
            Practise the questions placement interviewers actually ask — behavioural, motivational and
            technical for your field — and draft strong answers with STAR scaffolding. Your notes are saved
            on your device.
          </p>
        </div>

        <InterviewPrep />
      </div>
    </section>
  )
}
