import Link from 'next/link'

type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  readTime: string
  featured?: boolean
}

const featured: Post = {
  slug: 'best-ai-tools-placement-cv-2026',
  title: 'The Best AI Tools for Writing a Standout Placement CV in 2026',
  excerpt:
    'We tested every major AI writing tool — ChatGPT, Claude, Gemini, and more — to find out which ones actually help STEM students craft a placement CV that gets past ATS filters and impresses recruiters. Here\'s what worked, what didn\'t, and exactly how to use each tool.',
  date: '2 Apr 2026',
  category: 'AI Tools',
  readTime: '6 min read',
  featured: true,
}

const posts: Post[] = [
  {
    slug: 'data-science-placements-april-2026',
    title: 'Data Science Placements Open Right Now — April 2026 Roundup',
    excerpt:
      'A curated roundup of the best data science and ML placement roles currently accepting applications, with deadlines, salaries, and what each company is really looking for.',
    date: '1 Apr 2026',
    category: 'Opportunities',
    readTime: '4 min read',
  },
  {
    slug: 'what-to-expect-stem-assessment-centre',
    title: 'What to Expect at a STEM Assessment Centre',
    excerpt:
      'Assessment centres are the final hurdle between you and your offer. An honest breakdown of every exercise type and how to approach each one without overthinking it.',
    date: '25 Mar 2026',
    category: 'Assessment Centres',
    readTime: '7 min read',
  },
  {
    slug: 'how-to-cold-email-company-not-hiring',
    title: 'How to Cold Email a Company That Isn\'t Hiring',
    excerpt:
      'Most placements are never advertised. Learn how to write a cold email that actually gets read — subject line, pitch, and follow-up included.',
    date: '18 Mar 2026',
    category: 'Application Tips',
    readTime: '5 min read',
  },
]

const categories = ['All', 'AI Tools', 'Opportunities', 'Assessment Centres', 'Application Tips']

const categoryStyles: Record<string, { pill: string; imageBg: string; bar: string }> = {
  'AI Tools':           { pill: 'bg-indigo-50 text-indigo-700',  imageBg: 'from-indigo-100 to-indigo-50',  bar: '#4f46e5' },
  'Opportunities':      { pill: 'bg-green-50 text-green-700',    imageBg: 'from-green-100 to-green-50',    bar: '#16a34a' },
  'Assessment Centres': { pill: 'bg-slate-100 text-slate-700',   imageBg: 'from-slate-100 to-slate-50',    bar: '#475569' },
  'Application Tips':   { pill: 'bg-amber-50 text-amber-700',    imageBg: 'from-amber-100 to-amber-50',    bar: '#d97706' },
}

function CategoryPill({ category }: { category: string }) {
  const style = categoryStyles[category]?.pill ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>
      {category}
    </span>
  )
}

function ImagePlaceholder({ category, large = false }: { category: string; large?: boolean }) {
  const from = categoryStyles[category]?.imageBg ?? 'from-gray-100 to-gray-50'
  const bar = categoryStyles[category]?.bar ?? '#6b7280'
  return (
    <div className={`w-full bg-gradient-to-br ${from} flex items-end overflow-hidden ${large ? 'h-72 sm:h-80 lg:h-96' : 'h-48'} rounded-xl`}>
      <div className="w-full h-1" style={{ background: bar }} />
    </div>
  )
}

function AuthorLine({ date, readTime }: { date: string; readTime: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
        <span className="text-accent text-xs font-bold leading-none">P</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <span className="font-medium text-primary">PlacementOS Team</span>
        <span>·</span>
        <span>{date}</span>
        <span>·</span>
        <span>{readTime}</span>
      </div>
    </div>
  )
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page header ── */}
        <div className="pt-16 pb-10 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary tracking-tight mb-4">
            Student Insights
          </h1>
          <p className="text-base text-muted leading-relaxed">
            Practical guidance for UK STEM students navigating placement applications —
            covering the best AI tools, open opportunities, assessment centre prep,
            and application strategies that actually work.
          </p>
        </div>

        {/* ── Category tabs ── */}
        <div className="flex items-center gap-2 pb-12 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              className={[
                'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150',
                cat === 'All'
                  ? 'bg-accent text-white border-accent'
                  : 'bg-transparent text-muted border-gray-200 hover:border-accent hover:text-accent',
              ].join(' ')}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Featured post ── */}
        <Link href={`/blog/${featured.slug}`} className="group block mb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image */}
            <div className="overflow-hidden rounded-2xl transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl shadow-card">
              <ImagePlaceholder category={featured.category} large />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4">
              <CategoryPill category={featured.category} />
              <h2 className="text-2xl sm:text-3xl font-bold text-primary leading-snug group-hover:text-accent transition-colors duration-150">
                {featured.title}
              </h2>
              <p className="text-base text-muted leading-relaxed">
                {featured.excerpt}
              </p>
              <AuthorLine date={featured.date} readTime={featured.readTime} />
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:gap-2.5 transition-all duration-150">
                  Read article
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* ── Divider ── */}
        <div className="border-t border-gray-100 mb-14" />

        {/* ── Post grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 pb-24">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col gap-4">
              {/* Image */}
              <div className="overflow-hidden rounded-xl shadow-card transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-card-hover">
                <ImagePlaceholder category={post.category} />
              </div>

              {/* Meta */}
              <CategoryPill category={post.category} />

              {/* Title */}
              <h3 className="text-lg font-semibold text-primary leading-snug group-hover:text-accent transition-colors duration-150">
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="text-sm text-muted leading-relaxed line-clamp-2 flex-1">
                {post.excerpt}
              </p>

              {/* Author */}
              <AuthorLine date={post.date} readTime={post.readTime} />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
