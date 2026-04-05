import Link from 'next/link'

type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
}

const posts: Post[] = [
  {
    slug: 'best-ai-tools-placement-cv-2026',
    title: 'The Best AI Tools for Writing a Standout Placement CV in 2026',
    excerpt:
      'A breakdown of the tools worth using, how to use them effectively, and what to avoid when tailoring your CV for placements.',
    date: 'April 2026',
    category: 'AI Tools',
  },
  {
    slug: 'data-science-placements-april-2026',
    title: 'Data Science Placements Open Right Now — April 2026 Roundup',
    excerpt:
      'A curated list of the best data science and analytics placements currently accepting applications across the UK.',
    date: 'April 2026',
    category: 'Opportunities',
  },
  {
    slug: 'what-to-expect-stem-assessment-centre',
    title: 'What to Expect at a STEM Assessment Centre',
    excerpt:
      'From group exercises to technical tests — a practical guide to preparing for and performing well on assessment day.',
    date: 'March 2026',
    category: 'Assessment Centres',
  },
  {
    slug: 'how-to-cold-email-company-not-hiring',
    title: "How to Cold Email a Company That Isn't Actively Hiring",
    excerpt:
      'Most placements are never advertised. Here is how to write a cold email that actually gets a response.',
    date: 'March 2026',
    category: 'Application Tips',
  },
]

const categories = ['All', 'AI Tools', 'Opportunities', 'Assessment Centres', 'Application Tips']

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="pt-16 pb-10">
          <h1 className="text-5xl font-bold text-primary tracking-tight mb-4">
            Blog
          </h1>
          <p className="text-base text-muted max-w-xl leading-relaxed">
            Guides, roundups and insights for UK STEM students navigating placements,
            AI tools, and the job market.
          </p>
        </div>

        {/* ── Category tabs ── */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-0 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              className={[
                'flex-shrink-0 pb-3 text-sm font-medium transition-colors duration-150',
                'border-b-2 -mb-px',
                cat === 'All'
                  ? 'text-accent border-accent'
                  : 'text-muted border-transparent hover:text-primary',
              ].join(' ')}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Post list ── */}
        <div className="pb-24">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <div className="grid grid-cols-[200px_1fr] gap-8 py-8">
                {/* Left: meta */}
                <div className="pt-0.5">
                  <p className="text-sm text-muted font-medium">{post.category}</p>
                  <p className="text-sm text-muted mt-1">{post.date}</p>
                </div>

                {/* Right: content */}
                <div>
                  <h2 className="text-xl font-semibold text-primary leading-snug mb-2 group-hover:text-accent transition-colors duration-150">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted leading-relaxed">{post.excerpt}</p>
                </div>
              </div>
              <div className="border-t border-gray-100" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
