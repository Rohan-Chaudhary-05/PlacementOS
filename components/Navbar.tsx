'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonStyles'
import StudentMenu from '@/components/StudentMenu'
import { useTracker } from '@/components/tracker/TrackerProvider'
import { createClient } from '@/lib/supabase/client'
import { dashboardPathFor, type UserRole } from '@/lib/constants'

const DASHBOARD_LABELS: Record<UserRole, string> = {
  student: 'My applications',
  company: 'Dashboard',
  staff: 'Review',
}

// Student-facing primary nav. "For Companies" lives in the top-right CTA instead,
// keeping the student and company entry points clearly separated.
const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'AI Tools', href: '/ai-tools' },
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Blog', href: '/blog' },
]

function isActiveLink(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { signedIn, role, closingSoonCount } = useTracker()

  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/')
    router.refresh()
  }

  const dashboardHref = role ? dashboardPathFor(role) : '/login'
  const dashboardLabel = role ? DASHBOARD_LABELS[role] : ''
  const showCount = role === 'student' && closingSoonCount > 0

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={[
        'sticky top-0 z-50 bg-white/90 backdrop-blur-md',
        'border-b border-gray-100 transition-shadow duration-200',
        scrolled ? 'shadow-sm' : '',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-xl font-bold text-primary tracking-tight group-hover:text-accent transition-colors duration-150">
              PlacementOS
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'text-sm font-medium transition-colors duration-150',
                  isActiveLink(pathname, href)
                    ? 'text-accent'
                    : 'text-muted hover:text-primary',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            {signedIn && role ? (
              role === 'student' ? (
                <StudentMenu />
              ) : (
                <>
                  <Link href={dashboardHref} className={buttonClasses('ghost', 'sm')}>
                    {dashboardLabel}
                  </Link>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    Sign out
                  </Button>
                </>
              )
            ) : (
              <>
                <Link href="/for-companies" className={buttonClasses('ghost', 'sm')}>
                  For Companies
                </Link>
                <Link href="/login" className={buttonClasses('primary', 'sm')}>
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-muted hover:text-primary hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActiveLink(pathname, href)
                    ? 'bg-accent-light text-accent'
                    : 'text-muted hover:text-primary hover:bg-gray-50',
                ].join(' ')}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-gray-100">
              {signedIn && role ? (
                <>
                  {role === 'student' && (
                    <Link
                      href="/student/profile"
                      className={buttonClasses('ghost', 'md', 'w-full')}
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  )}
                  <Link
                    href={dashboardHref}
                    className={buttonClasses('ghost', 'md', 'w-full')}
                    onClick={() => setMenuOpen(false)}
                  >
                    {dashboardLabel}
                    {showCount && (
                      <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {closingSoonCount}
                      </span>
                    )}
                  </Link>
                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full"
                    onClick={() => {
                      setMenuOpen(false)
                      signOut()
                    }}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/for-companies"
                    className={buttonClasses('ghost', 'md', 'w-full')}
                    onClick={() => setMenuOpen(false)}
                  >
                    For Companies
                  </Link>
                  <Link
                    href="/login"
                    className={buttonClasses('primary', 'md', 'w-full')}
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
