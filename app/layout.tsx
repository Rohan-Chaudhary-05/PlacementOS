import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PlacementOS — Find your placement. Land the role.',
  description:
    'The AI-powered placement and internship platform for UK STEM students. Smart matching, application tracking, and AI career tools — built by students, for students.',
  keywords: ['placement year', 'STEM internship', 'UK placement', 'AI matching', 'university placement'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-surface text-primary antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
