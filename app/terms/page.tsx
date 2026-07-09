import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Terms of Service — PlacementOS',
  description: 'The terms that govern your use of PlacementOS.',
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-primary">
        {n}. {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm text-muted leading-relaxed">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted mt-2">Last updated: July 2026</p>
        <p className="text-sm text-muted italic mt-4 border-l-2 border-gray-200 pl-4">
          PlacementOS is a pre-launch service. These terms are a template pending review by a solicitor
          and will be finalised before open launch.
        </p>

        <Section n={1} title="The service">
          <p>
            PlacementOS helps UK STEM students discover placement and internship opportunities, prepare
            applications (CV, cover letter and interview tools) and track their applications. The service
            is currently pre-launch: features may change, be added or be withdrawn as we build.
          </p>
        </Section>

        <Section n={2} title="Accounts and acceptable use">
          <p>
            You agree to provide accurate information, keep your sign-in credentials safe, and use the
            service lawfully. Students register with a genuine university email address; companies with a
            corporate email address. You must not scrape the service, attempt to access other users&rsquo;
            data, post fake or misleading listings, or otherwise abuse the platform.
          </p>
        </Section>

        <Section n={3} title="Listings">
          <p>
            Company-submitted listings are reviewed by our moderation team before they appear. Moderation
            is a quality check, not verification: listings are not guaranteed or verified offers of
            employment, and we are not responsible for their accuracy. Sample listings shown pre-launch
            are fictional and clearly labelled.
          </p>
        </Section>

        <Section n={4} title="Applications">
          <p>
            Applications are made on employers&rsquo; own websites under their terms. PlacementOS is not a
            party to any application, interview or employment relationship between you and an employer.
          </p>
        </Section>

        <Section n={5} title="No guarantee of outcomes">
          <p>
            Match scores, CV and cover-letter tools and interview preparation are aids to help you apply
            well. They are not promises of interviews, offers or placements, and you remain responsible
            for the applications you submit.
          </p>
        </Section>

        <Section n={6} title="Intellectual property">
          <p>
            The PlacementOS site, brand and software are ours. You keep all rights to the content you
            create with the tools (your CVs, cover letters and answers). Companies grant us a
            non-exclusive licence to display their submitted listings on the platform.
          </p>
        </Section>

        <Section n={7} title="Liability">
          <p>
            The service is provided &ldquo;as is&rdquo; and, to the fullest extent permitted by law, we
            exclude all warranties and limit our liability arising from your use of the service. Nothing
            in these terms excludes or limits liability that cannot lawfully be excluded or limited.
          </p>
        </Section>

        <Section n={8} title="Governing law">
          <p>These terms are governed by the laws of England and Wales.</p>
        </Section>

        <Section n={9} title="Changes and contact">
          <p>
            We may update these terms as the service evolves; material changes will be posted on this
            page. Questions: email{' '}
            <a href="mailto:hello@placementos.co.uk" className="text-accent hover:underline">
              hello@placementos.co.uk
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  )
}
