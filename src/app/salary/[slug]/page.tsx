import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'

type SalaryPage = {
  slug: string
  trade: string
  tradeCategory: string
  city: string
  state: string
  citySlug: string
  h1: string
  metaTitle: string
  metaDescription: string
  answer: string
  hourlyRange: string
  annualRange: string
  context: string
  topEmployers: string
  certBoost: string
  unionNote: string
}

const SALARY_PAGES: SalaryPage[] = [
  {
    slug: 'electrician-ashburn-va',
    trade: 'Data Center Electrician',
    tradeCategory: 'electrical',
    city: 'Ashburn',
    state: 'VA',
    citySlug: 'northern-virginia',
    h1: 'Data Center Electrician Salary in Ashburn, VA',
    metaTitle: 'Data Center Electrician Salary in Ashburn, VA (2026) — VoltGrid Jobs',
    metaDescription: 'Data center electricians in Ashburn, VA earn $55–$85/hr in 2026. Northern Virginia is the world\'s largest DC market. See pay rates by experience, union status, and role type.',
    answer: 'Data center electricians in Ashburn, Virginia earn $55–$85 per hour in 2026, with journeyman-level wages averaging $65–$75/hr on hyperscale construction projects. Ashburn sits in Loudoun County — the world\'s largest data center market by capacity — which drives wages well above national norms.',
    hourlyRange: '$55–$85/hr',
    annualRange: '$114,000–$177,000/yr',
    context: 'Northern Virginia is where the density of data center construction and operations work is highest in the world. Amazon Web Services, Microsoft Azure, Google, and Meta all operate or are actively building hyperscale campuses in the Ashburn/Sterling corridor. The concentration of active projects means electricians with DC experience rarely stay unemployed for long in this market, and employers compete on pay.',
    topEmployers: 'Bergelectric, Truland Systems, Rosendin Electric, Turner Construction, HITT Contracting, Amazon Web Services (direct ops), Microsoft (direct ops)',
    certBoost: 'OSHA-30 and NFPA 70E are required on most job sites. Adding DCCA (free, Schneider Electric) and experience with medium-voltage switchgear pushes wages to the $75–$85/hr range. IBEW Local 26 union membership adds pension and benefits on top of base hourly.',
    unionNote: 'Northern Virginia has strong IBEW Local 26 union presence on hyperscale builds. Union journeymen are currently earning $67–$72/hr base under current IBEW agreements, with full benefits, pension, and JATC training access.',
  },
  {
    slug: 'hvac-tech-phoenix-az',
    trade: 'Data Center HVAC Technician',
    tradeCategory: 'hvac',
    city: 'Phoenix',
    state: 'AZ',
    citySlug: 'phoenix',
    h1: 'Data Center HVAC Technician Salary in Phoenix, AZ',
    metaTitle: 'Data Center HVAC Tech Salary in Phoenix, AZ (2026) — VoltGrid Jobs',
    metaDescription: 'Data center HVAC techs in Phoenix, AZ earn $38–$65/hr in 2026. Phoenix is a fast-growing DC market. See pay rates, top employers, and certifications that increase salary.',
    answer: 'Data center HVAC technicians in Phoenix, Arizona earn $38–$65 per hour in 2026. Precision cooling technicians with CRAC/CRAH and chilled water experience are at the higher end of that range, while entry-level facilities techs with standard HVAC backgrounds start in the $38–$45/hr range.',
    hourlyRange: '$38–$65/hr',
    annualRange: '$79,000–$135,000/yr',
    context: 'Phoenix is one of the fastest-growing data center markets in the US, driven by available land, relatively low power costs, and growing demand from California-based hyperscalers looking for nearby capacity. Compass Datacenters, QTS (Iron Mountain), CyrusOne, EdgeConneX, and Aligned Data Centers all have significant Phoenix-area presence. The extreme summer heat (115°F+ days) makes precision cooling expertise particularly valued — mechanical systems work harder in Phoenix than almost anywhere else.',
    topEmployers: 'Compass Datacenters, QTS (Iron Mountain), Aligned Data Centers, EdgeConneX, CyrusOne, CBRE Data Center Solutions, ABM Industries',
    certBoost: 'EPA 608 (required for refrigerant work), NATE certification, and OEM training from Liebert/Vertiv or Stulz push wages toward the high end. DCCA from Schneider Electric is increasingly requested by Phoenix-area operators as a baseline credential.',
    unionNote: 'Phoenix\'s data center HVAC market is predominantly non-union. UA Local 469 (pipefitters/plumbers) covers some larger construction-phase mechanical work, but most operations roles are non-union with competitive direct wages.',
  },
  {
    slug: 'low-voltage-tech-dallas-tx',
    trade: 'Data Center Low Voltage Technician',
    tradeCategory: 'low_voltage',
    city: 'Dallas',
    state: 'TX',
    citySlug: 'dallas',
    h1: 'Data Center Low Voltage Tech Salary in Dallas, TX',
    metaTitle: 'Data Center Low Voltage Tech Salary in Dallas, TX (2026) — VoltGrid Jobs',
    metaDescription: 'Data center low voltage techs in Dallas, TX earn $28–$55/hr in 2026. Dallas is a top-5 US data center market. See pay by certification level and role type.',
    answer: 'Data center low voltage and structured cabling technicians in Dallas, Texas earn $28–$55 per hour in 2026. Entry-level cabling installers start at $28–$38/hr, while fiber splicing specialists with BICSI INST2 certification and OTDR testing experience earn $45–$55/hr on active hyperscale projects.',
    hourlyRange: '$28–$55/hr',
    annualRange: '$58,000–$114,000/yr',
    context: 'Dallas-Fort Worth is one of the top five US data center markets, with major colocation facilities from Equinix, CyrusOne (now Iron Mountain), and QTS, as well as large AWS, Microsoft, and Google cloud campuses in the region. The Texas business-friendly environment and lower cost of living compared to Northern Virginia or Silicon Valley have driven significant hyperscale investment. Dallas low voltage work tends to be dense with structured cabling, as new builds require extensive MDA/EDA/HDA cabling infrastructure.',
    topEmployers: 'Equinix, Iron Mountain / CyrusOne, QTS, Commscope, Black Box Network Services, Cabling Solutions, Amazon Web Services (direct)',
    certBoost: 'BICSI INST1 is the baseline credential for meaningful pay increases in Dallas. BICSI INST2 and fiber splicing certifications push wages from the $38–$45/hr mid-range to $50–$55/hr. CommScope or Panduit manufacturer certifications are valued by contractors working on specific product lines in the market.',
    unionNote: 'Low voltage and structured cabling work in Dallas is predominantly non-union. IBEW covers some communications/data cabling work on larger commercial projects, but most data center low voltage roles are non-union with hourly rates set by the contractor.',
  },
  {
    slug: 'electrician-portland-or',
    trade: 'Data Center Electrician',
    tradeCategory: 'electrical',
    city: 'Portland',
    state: 'OR',
    citySlug: 'portland',
    h1: 'Data Center Electrician Salary in Portland, OR',
    metaTitle: 'Data Center Electrician Salary in Portland, OR (2026) — VoltGrid Jobs',
    metaDescription: 'Data center electricians in Portland, OR earn $55–$80/hr in 2026. The Hillsboro corridor hosts major hyperscale campuses. See pay rates, union info, and top employers.',
    answer: 'Data center electricians in Portland, Oregon (including the Hillsboro and Beaverton corridor) earn $55–$80 per hour in 2026. The Portland metro area hosts major hyperscale campuses from Intel, Amazon, and Google, which drives above-average wages for qualified electricians with data center or industrial experience.',
    hourlyRange: '$55–$80/hr',
    annualRange: '$114,000–$166,000/yr',
    context: 'The Portland metro area — particularly the Hillsboro/Beaverton corridor — is a significant data center market anchored by Intel\'s massive semiconductor manufacturing campus and hyperscale operators attracted by cheap hydroelectric power from the Columbia River. Oregon\'s abundant renewable power supply makes it attractive for operators with sustainability commitments. Facebook/Meta, Amazon, and Google all operate large facilities in the region. Electricians with industrial and high-power density experience are in particular demand.',
    topEmployers: 'Amazon Web Services, Meta, Google, Intel (indirect via contractors), McKinstry, EC Company, IEC Electric',
    certBoost: 'Oregon requires a state journeyman electrician license (administered by Oregon Building Codes Division). NFPA 70E and OSHA-30 are standard. Experience with medium-voltage switchgear and generator systems pushes wages to the higher end. IBEW Local 48 covers the Portland metro area.',
    unionNote: 'Portland has strong IBEW Local 48 union presence on commercial and data center construction. Union journeymen earn $68–$75/hr base under current Local 48 agreements with full benefits. The Hillsboro market has significant union hyperscale construction activity.',
  },
]

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return SALARY_PAGES.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = SALARY_PAGES.find(p => p.slug === slug)
  if (!page) return { title: 'Not Found' }
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `https://voltgridjobs.com/salary/${slug}` },
    openGraph: { title: page.metaTitle, description: page.metaDescription, type: 'article' },
  }
}

export default async function SalaryPage({ params }: Props) {
  const { slug } = await params
  const page = SALARY_PAGES.find(p => p.slug === slug)
  if (!page) notFound()

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What does a ${page.trade} earn in ${page.city}, ${page.state}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: page.answer,
        },
      },
      {
        '@type': 'Question',
        name: `What certifications increase ${page.trade} salary in ${page.city}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: page.certBoost,
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <p className="text-sm mb-6" style={{ color: 'var(--fg-faint)' }}>
          <Link href="/" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">Home</Link>
          {' '}/{' '}
          <Link href="/salary-guide" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">Salary Guide</Link>
          {' '}/{' '}
          <span style={{ color: 'var(--fg-muted)' }}>{page.city}, {page.state}</span>
        </p>

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-6"
          style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }}>
          💰 Salary Data · 2026
        </div>

        <h1
          className="mb-6 leading-tight"
          style={{
            fontFamily: 'var(--font-display), system-ui, sans-serif',
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--fg)',
            letterSpacing: '-0.01em',
          }}
        >
          {page.h1}
        </h1>

        {/* Direct answer */}
        <p className="text-base mb-8" style={{ color: 'var(--fg-muted)', lineHeight: 1.8 }}>
          {page.answer}
        </p>

        {/* Salary callout */}
        <div
          className="rounded-xl p-6 mb-8 grid grid-cols-2 gap-6"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-faint)' }}>Typical hourly</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--yellow)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>{page.hourlyRange}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-faint)' }}>Annual equivalent</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>{page.annualRange}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>
              Annual based on 2,080 hours. Actual earnings vary by employer, union status, overtime, and per diem. Data reflects 2026 market rates.
            </p>
          </div>
        </div>

        {/* Market context */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
            Why {page.city} pays what it does
          </h2>
          <p className="text-base" style={{ color: 'var(--fg-muted)', lineHeight: 1.8 }}>
            {page.context}
          </p>
        </section>

        {/* Certifications */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
            Certifications that increase pay
          </h2>
          <p className="text-base" style={{ color: 'var(--fg-muted)', lineHeight: 1.8 }}>
            {page.certBoost}
          </p>
        </section>

        {/* Union note */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
            Union vs. non-union in {page.city}
          </h2>
          <p className="text-base" style={{ color: 'var(--fg-muted)', lineHeight: 1.8 }}>
            {page.unionNote}
          </p>
        </section>

        {/* Top employers */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
            Who&apos;s hiring in {page.city}
          </h2>
          <p className="text-base" style={{ color: 'var(--fg-muted)', lineHeight: 1.8 }}>
            {page.topEmployers}
          </p>
        </section>

        {/* CTA */}
        <div
          className="rounded-xl px-6 py-8 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-lg font-bold mb-2" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
            Find {page.trade} jobs in {page.city}
          </p>
          <p className="text-sm mb-5" style={{ color: 'var(--fg-muted)' }}>
            Browse open data center trades listings and set up a job alert for new roles in {page.city}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/${page.tradeCategory === 'low_voltage' ? 'low-voltage' : page.tradeCategory}-jobs-in-${page.citySlug}`}
              className="inline-block font-bold px-6 py-3 rounded-xl transition-colors"
              style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
            >
              Browse {page.city} jobs →
            </Link>
            <Link
              href="/salary-guide"
              className="inline-block font-semibold px-6 py-3 rounded-xl transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
            >
              2026 Salary Guide →
            </Link>
          </div>
        </div>

        {/* Other salary pages */}
        <div className="mt-10" style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--fg-faint)' }}>
            More salary guides
          </p>
          <div className="flex flex-wrap gap-2">
            {SALARY_PAGES.filter(p => p.slug !== slug).map(p => (
              <Link
                key={p.slug}
                href={`/salary/${p.slug}`}
                className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >
                {p.trade} · {p.city}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
