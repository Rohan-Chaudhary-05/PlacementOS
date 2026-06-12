import type { PolishedCv } from '@/lib/cv-tailor/types'

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-accent uppercase tracking-[0.15em] border-b border-gray-200 pb-1.5 mb-3">
      {children}
    </h3>
  )
}

export default function CvPreview({ cv }: { cv: PolishedCv }) {
  const contactParts = [
    cv.contact.location,
    cv.contact.phone,
    cv.contact.email,
    cv.contact.linkedin,
  ].filter(Boolean)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card max-w-[800px] mx-auto px-7 py-8 sm:px-12 sm:py-12">
      {/* Header */}
      <header className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          {cv.contact.fullName}
        </h2>
        <p className="text-sm font-medium text-accent mt-1">{cv.headline}</p>
        <p className="text-xs text-muted mt-2">{contactParts.join('  ·  ')}</p>
      </header>

      {/* Summary */}
      {cv.summary && (
        <section className="mb-6">
          <SectionHeading>Professional Summary</SectionHeading>
          <p className="text-sm text-primary leading-relaxed">{cv.summary}</p>
        </section>
      )}

      {/* Education */}
      {cv.education.length > 0 && (
        <section className="mb-6">
          <SectionHeading>Education</SectionHeading>
          <div className="flex flex-col gap-3">
            {cv.education.map((entry, index) => (
              <div key={index}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-sm font-semibold text-primary">{entry.qualification}</p>
                  {entry.dateRange && <p className="text-xs text-muted">{entry.dateRange}</p>}
                </div>
                <p className="text-sm text-primary">
                  {entry.institution}
                  {entry.grade ? <span className="text-muted"> — {entry.grade}</span> : null}
                </p>
                {entry.details && (
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{entry.details}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {cv.skillGroups.length > 0 && (
        <section className="mb-6">
          <SectionHeading>Skills</SectionHeading>
          <div className="flex flex-col gap-1.5">
            {cv.skillGroups.map((group) => (
              <p key={group.heading} className="text-sm leading-relaxed">
                <span className="font-semibold text-primary">{group.heading}: </span>
                <span className="text-primary">{group.skills.join(' · ')}</span>
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {cv.experience.length > 0 && (
        <section className="mb-6">
          <SectionHeading>Work Experience</SectionHeading>
          <div className="flex flex-col gap-4">
            {cv.experience.map((entry, index) => (
              <div key={index}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-sm font-semibold text-primary">
                    {entry.role}
                    {entry.company ? <span className="font-normal"> — {entry.company}</span> : null}
                  </p>
                  {entry.dateRange && <p className="text-xs text-muted">{entry.dateRange}</p>}
                </div>
                {entry.bullets.length > 0 && (
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {entry.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="text-sm text-primary leading-relaxed flex gap-2">
                        <span className="text-accent mt-px">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {cv.projects.length > 0 && (
        <section className="mb-6">
          <SectionHeading>Projects</SectionHeading>
          <div className="flex flex-col gap-2.5">
            {cv.projects.map((project, index) => (
              <div key={index}>
                <p className="text-sm font-semibold text-primary">{project.name}</p>
                {project.description && (
                  <p className="text-sm text-primary leading-relaxed">{project.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {cv.certifications.length > 0 && (
        <section>
          <SectionHeading>Certifications</SectionHeading>
          <ul className="flex flex-col gap-1">
            {cv.certifications.map((certification, index) => (
              <li key={index} className="text-sm text-primary leading-relaxed flex gap-2">
                <span className="text-accent mt-px">•</span>
                <span>{certification}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
