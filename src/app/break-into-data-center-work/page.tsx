import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Break Into Data Center Work as an Electrician or HVAC Tech',
  description: 'Data centers pay $45–$85/hr for qualified trades workers. Here\'s exactly what DC employers look for — and how to land your first data center role.',
  alternates: { canonical: 'https://voltgridjobs.com/break-into-data-center-work' },
  openGraph: {
    title: 'How to Break Into Data Center Work as an Electrician or HVAC Tech',
    description: 'Data centers pay $45–$85/hr for qualified trades workers. Here\'s exactly what DC employers look for.',
    type: 'article',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Break Into Data Center Work as an Electrician or HVAC Tech',
  description: 'Data centers pay $45–85/hr for qualified trades workers. Here\'s exactly what DC employers look for — and how to land your first data center role.',
  author: { '@type': 'Organization', name: 'VoltGrid Jobs', url: 'https://voltgridjobs.com' },
  publisher: { '@type': 'Organization', name: 'VoltGrid Jobs', url: 'https://voltgridjobs.com' },
  datePublished: '2026-03-30',
  dateModified: '2026-03-30',
  mainEntityOfPage: 'https://voltgridjobs.com/break-into-data-center-work',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
        {title}
      </h2>
      <div className="space-y-4 text-base" style={{ color: 'var(--fg-muted)', lineHeight: 1.8 }}>
        {children}
      </div>
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 my-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span style={{ color: 'var(--yellow)', flexShrink: 0, fontWeight: 700 }}>—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function BreakIntoDataCenterWork() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <p className="text-sm mb-6" style={{ color: 'var(--fg-faint)' }}>
          <Link href="/" style={{ color: 'var(--fg-faint)' }}>VoltGrid</Link>
          {' → '}
          <Link href="/salary-guide" style={{ color: 'var(--fg-faint)' }}>Guides</Link>
          {' → '}
          <span style={{ color: 'var(--fg-muted)' }}>Breaking Into DC Work</span>
        </p>

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-6"
          style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }}>
          ⚡ Career Guide
        </div>

        {/* H1 */}
        <h1 className="mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-display), system-ui, sans-serif', fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', fontWeight: 800, color: 'var(--fg)', letterSpacing: '-0.01em' }}>
          How to Break Into Data Center Work as an Electrician or HVAC Tech
        </h1>

        {/* Intro */}
        <div className="mb-10 space-y-4 text-base" style={{ color: 'var(--fg-muted)', lineHeight: 1.8 }}>
          <p>
            Data centers are the fastest-growing sector for trades workers in North America right now. Hyperscalers and AI companies are building at a pace the industry hasn&apos;t seen in decades — and they&apos;re paying for it. Electricians and HVAC techs on these projects regularly earn <strong style={{ color: 'var(--fg)' }}>$45–$85/hr</strong>, with per diem on top for travel roles.
          </p>
          <p>
            The problem: getting your first data center role is the hard part. DC employers have a short list of what they want — and most general-industry experience doesn&apos;t check the boxes. This guide covers exactly what they&apos;re looking for, what transfers, and how to actually find and land these roles.
          </p>
        </div>

        {/* Starting from zero */}
        <Section title="Not Licensed Yet? Here's the Path Into Data Center Trades">
          <p>
            If you&apos;re considering the trades because of the AI infrastructure boom — you&apos;re thinking about it at exactly the right time. The construction cycle for data centers is a decade-long wave. Getting into electrical or HVAC now means you&apos;ll be a journeyman right as demand peaks.
          </p>
          <p>
            Here&apos;s the realistic path from zero to data center work:
          </p>

          <div className="space-y-3 my-4">
            {[
              { step: '1', title: 'Apprenticeship (4–5 years)', note: 'The standard path into commercial electrical or HVAC. You earn while you learn — typically starting at 40–50% of journeyman wage, rising each year. No prior experience required to apply.' },
              { step: '2', title: 'Journeyman license', note: 'After completing your apprenticeship hours and passing your state exam, you\'re a licensed journeyman. This is the minimum credential most DC employers want.' },
              { step: '3', title: '2+ years commercial experience', note: 'Most DC-focused employers want to see commercial or industrial work — not residential. Hospital, industrial, or large commercial buildings are all good stepping stones.' },
              { step: '4', title: 'Data center work', note: 'With a journeyman license and solid commercial background, you\'re competitive for DC roles paying $45–$85/hr. Add specialty certifications (NFPA 70E, OSHA-30) to jump the line.' },
            ].map(({ step, title, note }) => (
              <div key={step} className="flex gap-4 rounded-lg p-4" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }}>
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: 'var(--fg)' }}>{title}</p>
                  <p className="text-sm" style={{ color: 'var(--fg-faint)' }}>{note}</p>
                </div>
              </div>
            ))}
          </div>

          <p><strong style={{ color: 'var(--fg)' }}>Union vs. non-union:</strong> Union apprenticeships (through IBEW for electrical, UA for pipefitting/HVAC) have structured pay scales, excellent benefits, and strong placement on large commercial and DC builds. Non-union shops can get you started faster and often pay well on the right projects. Either path works — union tends to put you on bigger DC jobs sooner.</p>
          <p><strong style={{ color: 'var(--fg)' }}>Timeline reality check:</strong> You&apos;re looking at 6–7 years from starting an apprenticeship to being competitive for top-tier DC roles. That&apos;s real. But trades workers in this niche regularly earn more than most college graduates by year 8 — and AI infrastructure isn&apos;t going anywhere.</p>
          <p>
            To find your local apprenticeship program: search <strong style={{ color: 'var(--fg)' }}>IBEW JATC</strong> (electrical) or <strong style={{ color: 'var(--fg)' }}>UA local</strong> (HVAC/pipefitting) + your city. Applications typically open once or twice a year.
          </p>
        </Section>

        {/* Electrical */}
        <Section title="What Electrical Employers Actually Look For">
          <p>
            If you&apos;re a commercial or industrial electrician looking at data center work, the single biggest thing to understand is this: DC employers don&apos;t care about high voltage, and they definitely don&apos;t care about residential. They want <strong style={{ color: 'var(--fg)' }}>low/medium voltage, power distribution, and controls</strong> experience — specifically in commercial or critical environment settings.
          </p>
          <BulletList items={[
            'Low/medium voltage installation (480V, 208V, 120V distribution — not transmission)',
            'Power and lighting in commercial or industrial settings',
            'UPS systems, PDUs (Power Distribution Units), and switchgear',
            'Ability to read one-lines, panel schedules, and power drawings',
            'SKM Power Tools familiarity (helpful, not required)',
            'Revit MEP knowledge (increasingly requested on larger projects)',
            'OSHA-10 or OSHA-30 certification',
            'NFPA 70E Electrical Safety training',
          ]} />
          <blockquote className="border-l-2 pl-4 py-1 my-4 italic" style={{ borderColor: 'var(--yellow)', color: 'var(--fg-faint)' }}>
            &ldquo;The pool of people with actual data center experience is small. Every hyperscaler and GC we work with is picking from the same group of candidates. If you have the right background, you won&apos;t be looking long.&rdquo;
            <br /><span className="text-sm not-italic" style={{ color: 'var(--fg-faint)' }}>— Electrical recruiter, data center market</span>
          </blockquote>
        </Section>

        {/* HVAC */}
        <Section title="What HVAC Employers Actually Look For">
          <p>
            Data center HVAC is a specialty within a specialty. Comfort cooling experience (offices, retail, residential) is a harder sell. What DC facilities need is <strong style={{ color: 'var(--fg)' }}>precision cooling</strong> — keeping server rooms at tight temperature and humidity tolerances is a fundamentally different skill set.
          </p>
          <BulletList items={[
            'Precision cooling experience: CRAC (Computer Room Air Conditioning) and CRAH (Computer Room Air Handlers)',
            'Chilled water plant operation and maintenance',
            'Hot aisle / cold aisle containment systems',
            'Energy modeling and thermal load calculations',
            'Piping design and hydronic systems',
            'Familiarity with ASHRAE 90.4 (data center energy standard)',
            'Building Management System (BMS/BAS) control experience',
            'HVAC design software: HAP, Trace 700, or similar',
          ]} />
          <p>
            Precision cooling tech experience — even from semiconductor fabs, pharmaceutical cleanrooms, or hospital ORs — transfers well to DC facilities. If you have that background, lead with it.
          </p>
        </Section>

        {/* What transfers */}
        <Section title="What Transfers From Your Current Trade">
          <p>
            Here&apos;s a direct breakdown of how different backgrounds translate to DC opportunities:
          </p>

          <div className="space-y-3 my-4">
            {[
              { bg: 'Commercial electrician (MV/LV, controls)', verdict: 'Strong transfer', color: 'var(--green)', note: 'Especially if you have substation, switchgear, or industrial controls experience. This is the best starting point for DC work.' },
              { bg: 'Nuclear construction electrician', verdict: 'Excellent transfer', color: 'var(--green)', note: 'Nuclear plants require precision, documentation, and QA discipline that DC owners love. NQA-1 background is a differentiator.' },
              { bg: 'Industrial / heavy commercial', verdict: 'Good transfer', color: 'var(--green)', note: 'Large commercial buildings, hospitals, data centers, and manufacturing facilities are all similar environments from an electrical standpoint.' },
              { bg: 'Healthcare / education', verdict: 'Moderate — case by case', color: 'var(--yellow)', note: 'Mission-critical mindset from hospital work is relevant. Controls and emergency power experience helps. Not a slam dunk but worth applying.' },
              { bg: 'Residential electrician', verdict: 'Generally does not transfer', color: '#F87171', note: 'Residential work is code-minimum voltage, simple circuits, and service entrance work. DC employers are looking for a different skill set entirely. Not impossible — but be prepared for a longer path.' },
            ].map(({ bg, verdict, color, note }) => (
              <div key={bg} className="rounded-lg p-4" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <span className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>{bg}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ color, background: `${color}15` }}>{verdict}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--fg-faint)' }}>{note}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* How to find roles */}
        <Section title="How to Find Data Center Roles">
          <p>
            The challenge with DC roles is that they&apos;re often filled before they hit major job boards — through recruiter networks, direct outreach, or niche platforms. Here&apos;s where to focus your time:
          </p>
          <BulletList items={[
            'VoltGrid Jobs (voltgridjobs.com) — the only job board built specifically for data center and AI infrastructure trades work. Every listing is in this sector. Set up a trade-specific alert and you\'ll know within hours when a new role posts.',
            'LinkedIn recruiter outreach — search for "data center electrician recruiter" or "critical facility staffing". Staffing firms like Aerotek and Insight Global place heavily in this space.',
            'Target companies directly — CoreWeave, xAI, T5 Data Centers, Serverfarm, QTS, Equinix, and Digital Realty are all expanding aggressively.',
            'General contractors — many DC builds are run by specialty GCs like Holder, Turner, and Corgan. GC roles often don\'t require DC-specific experience.',
            'NECA (National Electrical Contractors Association) chapter — if you\'re union, your local IBEW business rep will know which contractors are active on DC projects in your area.',
          ]} />

          <div className="rounded-xl p-5 mt-6" style={{ background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }}>
            <p className="font-semibold text-sm mb-2" style={{ color: 'var(--yellow)' }}>⚡ Get alerts for new roles</p>
            <p className="text-sm mb-3" style={{ color: 'var(--fg-muted)' }}>
              VoltGrid indexes data center and AI infrastructure trades jobs daily. Set up a trade-specific alert and get notified within hours of a new listing.
            </p>
            <Link href="/jobs" className="inline-block px-5 py-2.5 rounded-lg font-semibold text-sm transition-opacity"
              style={{ background: 'var(--yellow)', color: '#0A0A0A' }}>
              Browse current openings →
            </Link>
          </div>
        </Section>

        {/* Salary */}
        <section className="mb-10 rounded-xl p-6" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--fg-faint)' }}>Salary Reference</p>
          <p className="text-base mb-4" style={{ color: 'var(--fg-muted)', lineHeight: 1.7 }}>
            The 2026 Data Center Trades Salary Guide covers current pay rates for electricians, HVAC techs, and low voltage specialists on DC and AI infrastructure projects — by role, experience level, and region.
          </p>
          <Link href="/salary-guide" className="inline-block text-sm font-semibold transition-colors"
            style={{ color: 'var(--yellow)' }}>
            Download the 2026 Salary Guide →
          </Link>
        </section>

        {/* Footer nav */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <Link href="/jobs" className="text-sm transition-colors" style={{ color: 'var(--fg-faint)' }}>
            ← Browse all data center trades jobs
          </Link>
        </div>
      </div>
    </>
  )
}
