import type { Metadata } from 'next'
import CoverLetterGenerator from '@/components/cover-letter/CoverLetterGenerator'

export const metadata: Metadata = {
  title: 'Cover Letter Generator — PlacementOS',
  description:
    'Generate a tailored placement cover letter from your details and target role, and download it as a PDF.',
}

export default function CoverLetterPage() {
  return (
    <section className="min-h-screen bg-surface py-14 sm:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">AI Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">Cover Letter Generator</h1>
          <p className="text-muted mt-3 text-base leading-relaxed">
            Tell us about you and the role, and get a tailored, recruiter-ready cover letter to preview and
            download as a PDF — in minutes.
          </p>
        </div>

        <CoverLetterGenerator />
      </div>
    </section>
  )
}
