import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Privacy Policy — PlacementOS',
  description:
    'How PlacementOS collects, uses and protects your data — including what we deliberately never collect.',
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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted mt-2">Last updated: July 2026</p>
        <p className="text-sm text-muted italic mt-4 border-l-2 border-gray-200 pl-4">
          PlacementOS is a pre-launch service. This policy describes our current data practices and is a
          template pending review by a solicitor; it will be finalised before open launch.
        </p>

        <Section n={1} title="Who we are and what this covers">
          <p>
            PlacementOS helps UK STEM students find, apply for and win industrial placements and
            internships. This policy covers the PlacementOS website and the data we handle for visitors,
            waitlist members, student accounts and company accounts.
          </p>
        </Section>

        <Section n={2} title="What we collect">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-medium text-primary">Waitlist:</span> your first name and university
              email address. Joining is double opt-in — your place is only confirmed when you click the
              link we email you.
            </li>
            <li>
              <span className="font-medium text-primary">Student accounts:</span> your university email
              and, if you choose to fill it in, a match profile — discipline, study year, skills, target
              sectors, work modes, preferred locations and minimum salary. Your profile is only ever
              visible to you.
            </li>
            <li>
              <span className="font-medium text-primary">Tracked applications:</span> the roles you save
              or mark as applied, so your application pipeline works across devices. Only you can see your
              tracker.
            </li>
            <li>
              <span className="font-medium text-primary">Company accounts:</span> a corporate email
              address and the placement listings you submit for moderation.
            </li>
          </ul>
        </Section>

        <Section n={3} title="What we deliberately do not collect">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-medium text-primary">Your CV.</span> When you upload a CV to autofill
              your profile or build one in CV Tailor, the file is parsed entirely in your browser. It is
              never uploaded to, or stored on, our servers.
            </li>
            <li>
              <span className="font-medium text-primary">Interview practice answers.</span> These are
              saved in your browser&rsquo;s local storage on your device, not on our servers.
            </li>
            <li>
              <span className="font-medium text-primary">Analytics or advertising trackers.</span> We
              currently set no analytics or advertising cookies — only the essential session cookies
              required to keep you signed in.
            </li>
          </ul>
        </Section>

        <Section n={4} title="Who processes data for us">
          <p>
            We use <span className="font-medium text-primary">Supabase</span> to host our database and
            provide authentication (including sending sign-in and confirmation emails), and{' '}
            <span className="font-medium text-primary">Resend</span> to send transactional email. We do
            not sell your data or share it with anyone for marketing.
          </p>
        </Section>

        <Section n={5} title="Our lawful bases (UK GDPR)">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-medium text-primary">Consent</span> — joining the waitlist (double
              opt-in).
            </li>
            <li>
              <span className="font-medium text-primary">Contract</span> — operating your account, match
              profile and application tracker.
            </li>
            <li>
              <span className="font-medium text-primary">Legitimate interests</span> — moderating
              listings, keeping the service secure and preventing abuse.
            </li>
          </ul>
        </Section>

        <Section n={6} title="How long we keep data">
          <p>
            We keep your data while your account or waitlist entry is active. You can ask us to delete it
            at any time, including unconfirmed waitlist entries, and we will remove it without undue
            delay.
          </p>
        </Section>

        <Section n={7} title="Your rights">
          <p>
            You have the right to access, rectify, erase, restrict or object to our processing of your
            data, and to data portability. You also have the right to complain to the Information
            Commissioner&rsquo;s Office (ICO) at{' '}
            <a href="https://ico.org.uk" className="text-accent hover:underline">
              ico.org.uk
            </a>
            .
          </p>
        </Section>

        <Section n={8} title="Contact and changes">
          <p>
            Questions or requests about your data: email{' '}
            <a href="mailto:hello@placementos.co.uk" className="text-accent hover:underline">
              hello@placementos.co.uk
            </a>
            . If we make material changes to this policy we will update this page and, where appropriate,
            notify account holders by email.
          </p>
        </Section>
      </div>
    </div>
  )
}
