import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WaitlistProvider from '@/components/waitlist/WaitlistProvider'
import TrackerProvider from '@/components/tracker/TrackerProvider'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://placementos.com'
const SITE_DESCRIPTION =
  'The AI-powered placement and internship platform for UK STEM students. Smart matching, application tracking, and AI career tools — built by students, for students.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'PlacementOS — Find your placement. Land the role.',
  description: SITE_DESCRIPTION,
  keywords: ['placement year', 'STEM internship', 'UK placement', 'AI matching', 'university placement'],
  openGraph: {
    type: 'website',
    siteName: 'PlacementOS',
    title: 'PlacementOS — Find your placement. Land the role.',
    description: SITE_DESCRIPTION,
    locale: 'en_GB',
  },
  twitter: { card: 'summary' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-surface text-primary antialiased`}>
        <TrackerProvider>
          <WaitlistProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </WaitlistProvider>
        </TrackerProvider>
      </body>
    </html>
  )
}
