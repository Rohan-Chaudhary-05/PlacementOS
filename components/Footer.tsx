import Link from 'next/link'

const footerLinks = [
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Blog', href: '/blog' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Brand */}
          <div>
            <span className="text-xl font-bold tracking-tight">PlacementOS</span>
            <p className="text-gray-400 text-sm mt-1.5 max-w-xs leading-relaxed">
              Built by students. Designed for students.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} PlacementOS. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">Made with care in the UK 🇬🇧</p>
        </div>
      </div>
    </footer>
  )
}
