import Badge from '@/components/ui/Badge'

export const metadata = {
  title: 'Blog · PlacementOS',
  description:
    'Guides, roundups and insights for UK STEM students navigating placements, AI tools, and the job market.',
}

type Post = {
  title: string
  excerpt: string
  date: string
  category: string
}

const posts: Post[] = [
  {
    title: 'The Best AI Tools for Writing a Standout Placement CV in 2026',
    excerpt:
      'A breakdown of the tools worth using, how to use them effectively, and what to avoid when tailoring your CV for placements.',
    date: 'April 2026',
    category: 'AI Tools',
  },
  {
    title: 'Data Science Placements Open Right Now — April 2026 Roundup',
    excerpt:
      'A curated list of the best data science and analytics placements currently accepting applications across the UK.',
    date: 'April 2026',
    category: 'Opportunities',
  },
  {
    title: 'What to Expect at a STEM Assessment Centre',
    excerpt:
      'From group exercises to technical tests — a practical guide to preparing for and performing well on assessment day.',
    date: 'March 2026',
    category: 'Assessment Centres',
  },
  {
    title: "How to Cold Email a Company That Isn't Actively Hiring",
    excerpt:
      'Most placements are never advertised. Here is how to write a cold email that actually gets a response.',
    date: 'March 2026',
    category: 'Application Tips',
  },
]

const categories = ['AI Tools', 'Opportunities', 'Assessment Centres', 'Application Tips']

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
            AI tools, and the job market. Articles are being written now — the first
            batch lands before launch.
          </p>
        </div>

        {/* ── Topic chips ── */}
        <div className="flex items-center gap-2 pb-4 border-b border-gray-200 overflow-x-auto">
          {categories.map((cat) => (
            <span
              key={cat}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-muted border border-gray-100"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* ── Post teasers (articles not yet published) ── */}
        <div className="pb-24">
          {posts.map((post) => (
            <div key={post.title}>
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-8 py-8">
                {/* Left: meta */}
                <div className="pt-0.5">
                  <p className="text-sm text-muted font-medium">{post.category}</p>
                  <p className="text-sm text-muted mt-1">{post.date}</p>
                </div>

                {/* Right: content */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold text-primary leading-snug">
                      {post.title}
                    </h2>
                    <Badge variant="muted">Coming soon</Badge>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{post.excerpt}</p>
                </div>
              </div>
              <div className="border-t border-gray-100" />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
