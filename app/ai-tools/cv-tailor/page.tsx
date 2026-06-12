import type { Metadata } from 'next'
import CvWizard from '@/components/cv-tailor/CvWizard'

export const metadata: Metadata = {
  title: 'AI CV Tailor — PlacementOS',
  description:
    'Build your CV section by section, tailor it to your target STEM industry and download a polished PDF.',
}

export default function CvTailorPage() {
  return (
    <section className="min-h-screen bg-surface py-14 sm:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
            AI Tools
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            AI CV Tailor
          </h1>
          <p className="text-muted mt-3 text-base leading-relaxed">
            Enter your details section by section, choose the STEM industry you&apos;re applying
            to, and get a polished, recruiter-ready CV to preview and download as a PDF.
          </p>
        </div>

        <CvWizard />
      </div>
    </section>
  )
}
