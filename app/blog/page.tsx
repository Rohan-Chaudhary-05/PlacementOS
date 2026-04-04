import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Link from 'next/link'

type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  categoryVariant: 'accent' | 'success' | 'default' | 'muted'
  readTime: string
}

const posts: Post[] = [
  {
    slug: 'best-ai-tools-placement-cv',
    title: 'The Best AI Tools for Writing a Placement CV in 2025',
    excerpt:
      'From ChatGPT to Notion AI, we tested the most popular AI writing tools to see which actually help you tailor a CV for STEM placements — and which ones just add fluff.',
    date: '28 Mar 2025',
    category: 'AI Tools',
    categoryVariant: 'accent',
    readTime: '5 min read',
  },
  {
    slug: 'data-science-placements-open-now',
    title: 'Data Science Placements Open Right Now — April 2025 Edition',
    excerpt:
      'A curated roundup of the best data science and ML placement roles currently accepting applications, including deadlines, salaries, and what each company is actually looking for.',
    date: '1 Apr 2025',
    category: 'Opportunities',
    categoryVariant: 'success',
    readTime: '4 min read',
  },
  {
    slug: 'what-to-expect-stem-assessment-centre',
    title: 'What to Expect at a STEM Assessment Centre (And How to Prepare)',
    excerpt:
      'Assessment centres are the final hurdle between you and your offer. Here\'s an honest breakdown of what they involve — group exercises, technical tasks, presentations — and how to approach each one.',
    date: '22 Mar 2025',
    category: 'Assessment Centres',
    categoryVariant: 'default',
    readTime: '7 min read',
  },
  {
    slug: 'cold-email-company-not-hiring',
    title: 'How to Write a Cold Email to a Company Not Actively Hiring',
    excerpt:
      'Most placements are never advertised. Learn how to write a cold email that actually gets read — including the subject line, the pitch, and how to follow up without being annoying.',
    date: '15 Mar 2025',
    category: 'Application Tips',
    categoryVariant: 'muted',
    readTime: '6 min read',
  },
]

const categoryColours: Record<string, string> = {
  'AI Tools': 'bg-indigo-50 text-indigo-700',
  'Opportunities': 'bg-green-50 text-green-700',
  'Assessment Centres': 'bg-gray-100 text-gray-700',
  'Application Tips': 'bg-amber-50 text-amber-700',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-2xl">
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">Student Blog</p>
            <h1 className="text-4xl font-bold text-primary mb-4 leading-snug">
              Placement advice, written by students who&apos;ve been there.
            </h1>
            <p className="text-muted text-base leading-relaxed">
              The PlacementOS blog covers everything you need to navigate your placement year:
              the <span className="text-primary font-medium">AI tools</span> worth using,
              the <span className="text-primary font-medium">latest STEM opportunities</span> and industry news,
              honest <span className="text-primary font-medium">guidance on applications and interview processes</span>,
              and real stories from students at top UK companies.
              No recycled careers-service advice — just practical insight from people who did it recently.
            </p>
          </div>
        </div>
      </div>

      {/* Category filter strip */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {['All', 'AI Tools', 'Opportunities', 'Assessment Centres', 'Application Tips'].map((cat) => (
            <button
              key={cat}
              className={[
                'flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150',
                cat === 'All'
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-accent-light hover:text-accent',
              ].join(' ')}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Card key={post.slug} hover className="flex flex-col">
              {/* Category colour bar */}
              <div
                className="h-1 rounded-t-xl"
                style={{
                  background:
                    post.category === 'AI Tools'
                      ? '#4f46e5'
                      : post.category === 'Opportunities'
                      ? '#16a34a'
                      : post.category === 'Assessment Centres'
                      ? '#6b7280'
                      : '#d97706',
                }}
              />

              <div className="p-6 flex flex-col flex-1 gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColours[post.category]}`}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-muted flex-shrink-0">{post.readTime}</span>
                </div>

                {/* Title + excerpt */}
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-primary leading-snug mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted leading-relaxed line-clamp-2">{post.excerpt}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
                      <span className="text-accent text-xs font-bold">P</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-primary">PlacementOS</p>
                      <p className="text-xs text-muted">{post.date}</p>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-indigo-700 transition-colors"
                  >
                    Read More
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty state hint */}
        <p className="text-center text-sm text-muted mt-12">
          More posts coming soon — written by students, for students.
        </p>
      </div>
    </div>
  )
}
