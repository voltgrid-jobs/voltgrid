import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/jobs/JobCard'
import { AlertSignupWidget } from '@/components/jobs/AlertSignupWidget'
import type { Job, JobCategory } from '@/types'

const CATEGORIES = [
  {
    slug: 'electrician-jobs',
    category: 'electrical',
    name: 'Data Center Electrician Jobs',
    shortName: 'Electrician',
    icon: '⚡',
    blurb: 'Journeymen, master electricians, and apprentices wiring the most power-dense buildings ever constructed.',
    seoBlurb: 'Hyperscale data centers and AI training facilities run on massive electrical infrastructure — each facility can draw 100MW or more. Electricians with data center experience command premium wages, and demand is outpacing supply as construction pipelines extend years ahead. Find high-voltage, switchgear, generator, and UPS installation roles here.',
    metaDescription: 'Electrician jobs at data centers and AI infrastructure sites. High-voltage, switchgear, UPS, and generator roles at hyperscale facilities. Browse and apply free.',
  },
  {
    slug: 'hvac-jobs',
    category: 'hvac',
    name: 'Data Center HVAC & Mechanical Jobs',
    shortName: 'HVAC',
    icon: '❄️',
    blurb: 'HVAC technicians and mechanical engineers keeping data centers cool under massive thermal loads.',
    seoBlurb: 'Data centers are among the most demanding HVAC environments in existence — precision cooling, chilled water systems, CRAC units, and adiabatic cooling at industrial scale. Mechanical technicians with critical facilities experience are among the most in-demand tradespeople in construction right now.',
    metaDescription: 'HVAC and mechanical jobs at data centers. Cooling systems, chilled water, CRAC units, and precision cooling roles at hyperscale and colocation facilities.',
  },
  {
    slug: 'low-voltage-jobs',
    category: 'low_voltage',
    name: 'Low Voltage & Structured Cabling Jobs',
    shortName: 'Low Voltage',
    icon: '📡',
    blurb: 'Fiber, copper, structured cabling, and network infrastructure specialists for data center builds.',
    seoBlurb: 'Every data center requires miles of fiber, copper, and structured cabling — from backbone infrastructure to cross-connects and patch panels. Low voltage technicians with data center experience are in constant demand as new facilities open and existing ones expand.',
    metaDescription: 'Low voltage and structured cabling jobs at data centers. Fiber, copper, network infrastructure, and telecommunications roles at colocation and hyperscale facilities.',
  },
  {
    slug: 'construction-jobs',
    category: 'construction',
    name: 'Data Center Construction Jobs',
    shortName: 'Construction',
    icon: '🏗️',
    blurb: "Ironworkers, concrete finishers, welders, and general construction trades building tomorrow's AI infrastructure.",
    seoBlurb: 'The data center construction boom is creating steady, well-paying work for general construction trades. From tilt-up concrete construction to structural steel, welding, and site prep — data center GCs are hiring and projects run multi-year timelines with repeat opportunities.',
    metaDescription: 'Construction jobs at data center and AI infrastructure projects. Ironworkers, welders, concrete, and structural trades roles at hyperscale construction sites.',
  },
  {
    slug: 'project-management-jobs',
    category: 'project_management',
    name: 'Data Center Project Management Jobs',
    shortName: 'Project Management',
    icon: '📋',
    blurb: 'PMs, superintendents, and program managers running data center construction and fit-out projects.',
    seoBlurb: 'Data center projects are complex, multi-disciplinary builds with tight delivery schedules and massive capital commitments. Project managers and superintendents who understand critical facilities construction — MEP coordination, commissioning, and hyperscale timelines — are rare and well-compensated.',
    metaDescription: 'Project management jobs at data center construction and operations. PM, superintendent, and program manager roles at hyperscale, colocation, and AI infrastructure projects.',
  },
  {
    slug: 'operations-jobs',
    category: 'operations',
    name: 'Data Center Operations & Facilities Jobs',
    shortName: 'Operations',
    icon: '⚙️',
    blurb: 'Critical facilities technicians, data center operators, and facilities managers keeping the lights on 24/7.',
    seoBlurb: 'Operating a data center is a 24/7 responsibility — critical facilities technicians monitor power, cooling, and network systems around the clock. With AI workloads demanding near-100% uptime, operators are investing heavily in experienced facilities staff who understand the stakes.',
    metaDescription: 'Data center operations and facilities management jobs. Critical facilities technician, DCT, and facilities manager roles at colocation, hyperscale, and edge facilities.',
  },
]

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return CATEGORIES.map(cat => ({ slug: cat.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const categoryDef = CATEGORIES.find(c => c.slug === slug)
  if (!categoryDef) return { title: 'Not Found' }
  return {
    title: `${categoryDef.name} — VoltGrid Jobs`,
    description: categoryDef.metaDescription,
  }
}

export default async function TradePage({ params }: Props) {
  const { slug } = await params
  const categoryDef = CATEGORIES.find(c => c.slug === slug)
  if (!categoryDef) notFound()

  const supabase = await createClient()
  const { data: jobsData } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .eq('category', categoryDef.category)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  const jobs: Job[] = jobsData ?? []

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-yellow-400 transition-colors">
              Home
            </Link>
          </li>
          <li className="text-gray-700">/</li>
          <li>
            <Link href="/trades" className="hover:text-yellow-400 transition-colors">
              Trades
            </Link>
          </li>
          <li className="text-gray-700">/</li>
          <li className="text-gray-300">{categoryDef.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="border-b border-gray-800 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-3xl mb-3">{categoryDef.icon}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {categoryDef.name}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-4">{categoryDef.blurb}</p>
          <p className="text-gray-300 font-medium">
            {jobs.length > 0
              ? `${jobs.length} job${jobs.length === 1 ? '' : 's'} available`
              : 'New jobs posted regularly'}
          </p>

          {/* SEO paragraph */}
          <p className="text-gray-500 text-sm mt-5 max-w-3xl leading-relaxed">{categoryDef.seoBlurb}</p>
        </div>
      </section>

      {/* Jobs */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-2">No listings right now — set up a job alert</p>
            <p className="text-gray-600 text-sm mb-6">
              We&apos;ll email you as soon as new {categoryDef.shortName} jobs are posted.
            </p>
            <div className="max-w-md mx-auto mb-6">
              <AlertSignupWidget keywords="" category={categoryDef.category as JobCategory} />
            </div>
            <Link href="/jobs" className="text-yellow-400 text-sm hover:underline">
              Browse all open positions →
            </Link>
          </div>
        )}
      </section>

      {/* Alert widget (always shown below job list) */}
      {jobs.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <div className="max-w-md">
            <AlertSignupWidget keywords="" category={categoryDef.category as JobCategory} />
          </div>
        </section>
      )}

      {/* Hiring CTA */}
      <section className="border-t border-gray-800 py-12 px-4 text-center">
        <p className="text-gray-400 mb-3">
          Hiring {categoryDef.shortName}s?
        </p>
        <Link
          href="/post-job"
          className="inline-block bg-yellow-400 text-gray-950 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors"
        >
          Post a job from $149 →
        </Link>
      </section>
    </main>
  )
}
