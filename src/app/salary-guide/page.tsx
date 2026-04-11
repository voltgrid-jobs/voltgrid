import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ELECTRICIAN_MARKETS,
  HVAC_MARKETS,
  LOW_VOLTAGE_MARKETS,
  CONSTRUCTION_MARKETS,
  COMPENSATION_COMPONENTS,
  ELECTRICIAN_TAXONOMY,
  HVAC_TAXONOMY,
  SALARY_FAQS,
  type MarketRow,
  type RoleTaxonomy,
} from './data'
import { OfferComparisonWorksheet } from './OfferComparisonWorksheet'
import { SalaryGuideTracker } from './SalaryGuideTracker'
import { JobAlertInlineForm } from '@/components/jobs/JobAlertInlineForm'
import { ImpressionTracker } from '@/components/analytics/ImpressionTracker'

// ─────────────────────────────────────────────────────────────────────
// /salary-guide — US Data Center Electrician & HVAC Salary Guide 2026
// Server component. No email gate. Content is fully crawlable.
// Replaces the old email-gated guide to unblock SEO for:
//   "data center electrician salary 2026"
//   "data center HVAC salary 2026"
// ─────────────────────────────────────────────────────────────────────

const PAGE_URL = 'https://voltgridjobs.com/salary-guide'
const LAST_UPDATED = 'April 2026'
const LAST_UPDATED_ISO = '2026-04-11'

export const metadata: Metadata = {
  title: 'US Data Center Electrician & HVAC Salary Guide 2026',
  description:
    'Real 2026 pay bands for data center electricians, HVAC technicians, and critical facility trades. Regional breakdowns, union vs non-union, compensation components, and an offer comparison worksheet.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'US Data Center Electrician & HVAC Salary Guide 2026',
    description:
      'Real 2026 pay for data center electricians and HVAC techs — NoVA, Texas, Georgia, Ohio, and union markets. Includes compensation components table and offer comparison worksheet.',
    url: PAGE_URL,
    type: 'article',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'US Data Center Electrician & HVAC Salary Guide 2026',
  description:
    'Real 2026 pay bands for data center electricians, HVAC technicians, and critical facility trades across major US markets.',
  author: { '@type': 'Organization', name: 'VoltGrid Jobs', url: 'https://voltgridjobs.com' },
  publisher: {
    '@type': 'Organization',
    name: 'VoltGrid Jobs',
    url: 'https://voltgridjobs.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://voltgridjobs.com/voltgrid-logo-horizontal.png',
    },
  },
  datePublished: LAST_UPDATED_ISO,
  dateModified: LAST_UPDATED_ISO,
  mainEntityOfPage: PAGE_URL,
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: SALARY_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
}

// ── Helpers ──────────────────────────────────────────────────────────

function formatSalary(row: MarketRow): string {
  if (row.unit === 'hr') return `$${row.low}–$${row.high}/hr`
  const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`)
  return `${fmt(row.low)}–${fmt(row.high)}/yr`
}

function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      style={{
        fontFamily: 'var(--font-display), system-ui, sans-serif',
        fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
        fontWeight: 800,
        color: 'var(--fg)',
        letterSpacing: '-0.01em',
        marginBottom: '0.75rem',
        marginTop: '3rem',
      }}
    >
      {children}
    </h2>
  )
}

function Lede({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: '1rem',
        color: 'var(--fg-muted)',
        lineHeight: 1.7,
        marginBottom: '1.25rem',
        maxWidth: '720px',
      }}
    >
      {children}
    </p>
  )
}

function SalaryTable({ rows, title }: { rows: MarketRow[]; title: string }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--fg-faint)',
          marginBottom: '0.75rem',
        }}
      >
        {title}
      </h3>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
            minWidth: '480px',
          }}
        >
          {rows.map((row, i) => (
            <div
              key={`${row.market}-${row.role}-${i}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: '1rem',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                background: i % 2 === 0 ? 'var(--bg-raised)' : 'var(--bg)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--fg)' }}>
                  {row.market}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--fg-faint)', marginTop: '0.15rem' }}>
                  {row.role}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--yellow)',
                    fontFamily: 'var(--font-display), system-ui, sans-serif',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {formatSalary(row)}
                </div>
                {row.note && (
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--fg-faint)',
                      marginTop: '0.15rem',
                      lineHeight: 1.45,
                    }}
                  >
                    {row.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TaxonomyBlock({ sections }: { sections: RoleTaxonomy[] }) {
  return (
    <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2rem' }}>
      {sections.map((section) => (
        <div
          key={section.phase}
          style={{
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: 'var(--bg-subtle)',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--yellow)',
            }}
          >
            {section.phase} phase
          </div>
          <div>
            {section.roles.map((role, i) => (
              <div
                key={role.title}
                style={{
                  padding: '1rem',
                  borderBottom: i < section.roles.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--fg)',
                    }}
                  >
                    {role.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--yellow)',
                      fontFamily: 'var(--font-display), system-ui, sans-serif',
                    }}
                  >
                    {role.typicalPay}
                  </div>
                </div>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--fg-muted)',
                    lineHeight: 1.6,
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  {role.responsibility}
                </p>
                <p
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--fg-faint)',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: 'var(--fg-muted)' }}>Typical certs: </strong>
                  {role.certifications}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────

export default function SalaryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SalaryGuideTracker />

      <div style={{ background: 'var(--bg)' }}>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-6"
              style={{
                background: 'var(--yellow-dim)',
                color: 'var(--yellow)',
                border: '1px solid var(--yellow-border)',
              }}
            >
              <span>📊</span>
              <span>Free report · Updated {LAST_UPDATED}</span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display), system-ui, sans-serif',
                fontSize: 'clamp(2.25rem, 6vw, 4rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                color: 'var(--fg)',
                marginBottom: '1.25rem',
              }}
            >
              US Data Center Electrician &amp;<br />
              <span style={{ color: 'var(--yellow)' }}>HVAC Salary Guide 2026</span>
            </h1>

            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--fg-muted)',
                lineHeight: 1.65,
                maxWidth: '680px',
                marginBottom: '0.75rem',
              }}
            >
              Real pay bands for electricians and HVAC technicians working on data center
              construction, commissioning, and operations across every major US market.
              No email wall, no upsell, no generic BLS copy-paste.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--fg-faint)', marginBottom: '1.5rem' }}>
              Compiled from VoltGrid job listings, public union wage scales, and BLS data
              · Last updated {LAST_UPDATED}
            </p>

            {/* Table of contents */}
            <nav
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginTop: '1rem',
              }}
              aria-label="On this page"
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-faint)',
                  marginBottom: '0.5rem',
                }}
              >
                On this page
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.35rem 1rem',
                  fontSize: '0.85rem',
                }}
              >
                {[
                  ['methodology', 'How we compiled this'],
                  ['electrician', 'Electrician pay by market'],
                  ['hvac', 'HVAC pay by market'],
                  ['taxonomy', 'Role taxonomy'],
                  ['components', 'Compensation components'],
                  ['union', 'Union vs non-union'],
                  ['worksheet', 'Offer comparison worksheet'],
                  ['other-trades', 'Low voltage & construction'],
                  ['faq', 'FAQ'],
                ].map(([anchor, label]) => (
                  <li key={anchor}>
                    <a
                      href={`#${anchor}`}
                      style={{
                        color: 'var(--fg-muted)',
                        textDecoration: 'none',
                      }}
                    >
                      → {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        {/* ── Main content ──────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Methodology */}
          <SectionTitle id="methodology">How we compiled this guide</SectionTitle>
          <Lede>
            Every pay band on this page is anchored in observable data, not scraped from
            aggregator sites. We used four source types and we disclose the limitations of
            each. If a source said $48 and another said $56 for the same role and market,
            the band covers the full spread and we note the disagreement.
          </Lede>
          <ol
            style={{
              color: 'var(--fg-muted)',
              fontSize: '0.9rem',
              lineHeight: 1.75,
              paddingLeft: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <li>
              <strong style={{ color: 'var(--fg)' }}>VoltGrid job listings.</strong> 66+
              rows in our own database with disclosed salary fields, tagged by trade,
              market, and role. This is the strongest signal because every row is a real
              employer posting a real job with real money attached.
            </li>
            <li>
              <strong style={{ color: 'var(--fg)' }}>Public union wage scales.</strong>{' '}
              IBEW Local 134 (Chicago electrical), UA Local 597 (Chicago pipe fitters and
              HVAC), and similar locals publish their rate cards openly. These are
              authoritative for markets with active union agreements.
            </li>
            <li>
              <strong style={{ color: 'var(--fg)' }}>BLS Occupational Employment and
              Wage Statistics.</strong> SOC 47-2111 (electricians) and SOC 49-9021
              (HVAC mechanics), state-level. BLS data lags 6–12 months and covers all
              electricians, not just data center — we use it as a floor, not a ceiling.
            </li>
            <li>
              <strong style={{ color: 'var(--fg)' }}>Publicly announced data center
              projects.</strong> Hyperscale build announcements that include staffing
              counts or stated wage ranges. These are sparse but useful for
              cross-checking VoltGrid data.
            </li>
          </ol>

          <div
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--yellow)',
                marginBottom: '0.5rem',
              }}
            >
              Limitations
            </div>
            <ul
              style={{
                color: 'var(--fg-muted)',
                fontSize: '0.85rem',
                lineHeight: 1.65,
                margin: 0,
                paddingLeft: '1.25rem',
              }}
            >
              <li>Sample size varies by market. Northern Virginia and Chicago are well-sampled. Columbus and Atlanta are thinner. Where our sample is thin, the band is wider.</li>
              <li>We only include roles with a data center or mission critical context. A general commercial electrician in Phoenix is not the same as a data center electrician in Phoenix and would have different pay.</li>
              <li>Per diem, travel, and bonus data comes from job listings where the employer disclosed it. Many listings hide total compensation — our per-diem bands reflect what is stated, not what is paid.</li>
              <li>Union scales are base rate before health &amp; welfare and pension contributions. Raw paycheck is lower than the published scale; total package is higher.</li>
            </ul>
          </div>

          {/* Email capture — ~20% scroll: after methodology, before the first pay table */}
          <ImpressionTracker source="salary-guide-top">
            <div
              style={{
                background: 'rgba(250, 204, 21, 0.05)',
                border: '1px solid var(--yellow-border)',
                borderRadius: '14px',
                padding: 'clamp(1.25rem, 3vw, 1.75rem)',
                marginBottom: '2rem',
              }}
            >
              <JobAlertInlineForm
                variant="jobs"
                defaultTrade="electrical"
                source="salary-guide-top"
                headline="Use this pay data to benchmark your offer. Then get matching jobs in your market."
                subtext="Daily alerts. Filtered to your trade and market. Unsubscribe anytime."
              />
            </div>
          </ImpressionTracker>

          {/* Electrician by market */}
          <SectionTitle id="electrician">Data center electrician salary by market (2026)</SectionTitle>
          <Lede>
            Base hourly rates for electricians working on data center projects in the
            largest US markets. Rates are for construction and commissioning work unless
            noted as operations or superintendent roles. Bands are 2026 observed ranges,
            not averages.
          </Lede>
          <SalaryTable rows={ELECTRICIAN_MARKETS} title="Electrician — base hourly and annual pay" />

          {/* HVAC by market */}
          <SectionTitle id="hvac">Data center HVAC technician salary by market (2026)</SectionTitle>
          <Lede>
            HVAC technician pay bands for data center work. CRAC, CRAH, chilled water, and
            BMS-adjacent roles command the upper end of each range. General commercial
            HVAC experience does not automatically transfer — data center mechanical
            systems are a specialty.
          </Lede>
          <SalaryTable rows={HVAC_MARKETS} title="HVAC — base hourly and annual pay" />

          {/* Role taxonomy */}
          <SectionTitle id="taxonomy">Role taxonomy: construction, commissioning, operations</SectionTitle>
          <Lede>
            Data center trades work breaks into three phases with different pay
            structures, hours, and certifications. Most workers pass through construction
            first, then commissioning, then either move to permanent operations or stay on
            the commissioning travel circuit. Each phase pays and feels different.
          </Lede>

          <h3
            style={{
              fontFamily: 'var(--font-display), system-ui, sans-serif',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--fg)',
              marginTop: '1.5rem',
              marginBottom: '1rem',
            }}
          >
            Electrician roles by phase
          </h3>
          <TaxonomyBlock sections={ELECTRICIAN_TAXONOMY} />

          <h3
            style={{
              fontFamily: 'var(--font-display), system-ui, sans-serif',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--fg)',
              marginTop: '1.5rem',
              marginBottom: '1rem',
            }}
          >
            HVAC roles by phase
          </h3>
          <TaxonomyBlock sections={HVAC_TAXONOMY} />

          {/* Compensation components */}
          <SectionTitle id="components">Compensation components — the line items that matter</SectionTitle>
          <Lede>
            Base hourly rate is only one piece of a data center trades offer. On a live
            project, per diem, overtime multiplier, travel pay, and shift differential
            can double effective pay. Two offers with the same $55/hr base can be $30,000
            apart at the end of a 10-week project. This table breaks down every line item
            to check before you sign.
          </Lede>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '2rem' }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', minWidth: '560px' }}>
              {COMPENSATION_COMPONENTS.map((c, i) => (
                <div
                  key={c.component}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 2fr',
                    gap: '1rem',
                    padding: '0.85rem 1rem',
                    borderBottom: i < COMPENSATION_COMPONENTS.length - 1 ? '1px solid var(--border)' : 'none',
                    background: i % 2 === 0 ? 'var(--bg-raised)' : 'var(--bg)',
                  }}
                >
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--fg)' }}>{c.component}</div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--yellow)',
                      fontFamily: 'var(--font-display), system-ui, sans-serif',
                    }}
                  >
                    {c.typical}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--fg-muted)', lineHeight: 1.55 }}>{c.notes}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Union vs non-union */}
          <SectionTitle id="union">Union vs non-union: what the paycheck difference actually looks like</SectionTitle>
          <Lede>
            Data center trades work divides along union lines by region. Chicago, the
            Pacific Northwest, and parts of the Northeast are heavily union. Virginia,
            Texas, Arizona, Georgia, and Ohio are primarily open-shop. The paycheck
            difference looks larger than it is because union scales bundle benefits that
            non-union workers receive separately.
          </Lede>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--yellow)',
                  marginBottom: '0.5rem',
                }}
              >
                Union (IBEW / UA)
              </div>
              <ul
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--fg-muted)',
                  lineHeight: 1.7,
                  paddingLeft: '1.1rem',
                  margin: 0,
                }}
              >
                <li>Published wage scale. What the local says is what you get — no negotiating individual rate.</li>
                <li>Health, welfare, and pension contributions added on top of base. Typical package is 25–40% above base.</li>
                <li>Standardized overtime (1.5× after 8 hours daily, 2× on weekends in many agreements).</li>
                <li>Hall dispatches you to the job — you do not pick the employer, they pick you.</li>
                <li>Apprenticeship is long (4–5 years) but fully paid.</li>
              </ul>
            </div>
            <div
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--yellow)',
                  marginBottom: '0.5rem',
                }}
              >
                Non-union / open-shop
              </div>
              <ul
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--fg-muted)',
                  lineHeight: 1.7,
                  paddingLeft: '1.1rem',
                  margin: 0,
                }}
              >
                <li>Negotiated individual rate. Top performers in a tight market earn more than union scale; slow ones earn less.</li>
                <li>Benefits vary by employer. Some match union packages, many do not. Ask what the health plan actually costs before you take the raise at face value.</li>
                <li>Overtime rules follow federal law only (1.5× after 40/week). Daily OT and weekend premiums are employer-discretion.</li>
                <li>You pick the employer and the project. Faster movement between jobs.</li>
                <li>Pathways are less formal — often a mix of trade school, informal apprenticeship, and on-the-job learning.</li>
              </ul>
            </div>
          </div>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--fg-faint)',
              lineHeight: 1.7,
              marginBottom: '2rem',
              fontStyle: 'italic',
            }}
          >
            The honest answer to &quot;which pays more&quot; is: on paper, union. In effective
            take-home, it depends on the non-union employer&apos;s benefits and how many
            hours you actually bill. Travel commissioning work — which is mostly non-union
            — pays the highest total compensation of any category in this guide because of
            per diem stacking.
          </p>

          {/* Worksheet */}
          <SectionTitle id="worksheet">Offer comparison worksheet</SectionTitle>
          <Lede>
            Drop two competing offers into this worksheet and it calculates the total
            project value, annualized income, and effective hourly rate for each — so you
            compare the real take-home, not the base rate on the first line of the offer
            letter. Print to PDF when you are done.
          </Lede>
          <OfferComparisonWorksheet />
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--fg-faint)',
              marginTop: '0.75rem',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}
          >
            Nothing you enter leaves your browser. The worksheet does not send data to any
            server and does not save anything when you leave the page.
          </p>

          {/* Other trades */}
          <SectionTitle id="other-trades">Supporting pay bands: low voltage and construction</SectionTitle>
          <Lede>
            This guide focuses on electricians and HVAC techs because those are the two
            trades with the deepest demand and the tightest rate compression in 2026.
            Low voltage, controls, and construction management also matter, especially
            for workers moving into data center work from adjacent industries. Quick
            reference bands below.
          </Lede>
          <SalaryTable rows={LOW_VOLTAGE_MARKETS} title="Low voltage / structured cabling / BMS" />
          <SalaryTable rows={CONSTRUCTION_MARKETS} title="Construction management / superintendent" />

          {/* CTA — job alert */}
          <section
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--yellow-border)',
              borderRadius: '16px',
              padding: 'clamp(1.25rem, 4vw, 2rem)',
              marginTop: '3rem',
              marginBottom: '2rem',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display), system-ui, sans-serif',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--fg)',
                marginBottom: '0.5rem',
                letterSpacing: '-0.01em',
              }}
            >
              Want offers this strong in your inbox?
            </h2>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--fg-muted)',
                lineHeight: 1.65,
                marginBottom: '1.25rem',
                maxWidth: '560px',
              }}
            >
              Tell us your trade and market. We&apos;ll send the jobs worth your time.
            </p>
            <ImpressionTracker source="salary-guide-bottom">
              <JobAlertInlineForm
                variant="jobs"
                source="salary-guide-bottom"
                headline="Pick your trade and city"
                subtext="Daily alerts. Unsubscribe anytime."
              />
            </ImpressionTracker>
          </section>

          {/* FAQ */}
          <SectionTitle id="faq">Frequently asked questions</SectionTitle>
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
            {SALARY_FAQS.map((faq) => (
              <details
                key={faq.q}
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--fg)',
                    listStyle: 'none',
                  }}
                >
                  {faq.q}
                </summary>
                <p
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--fg-muted)',
                    lineHeight: 1.7,
                    marginTop: '0.75rem',
                    marginBottom: 0,
                  }}
                >
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          {/* Email capture — Placement 2: after FAQ, before related links */}
          <ImpressionTracker source="salary-guide-faq">
          <div
            style={{
              background: 'rgba(250, 204, 21, 0.05)',
              border: '1px solid var(--yellow-border)',
              borderRadius: '14px',
              padding: 'clamp(1.25rem, 3vw, 1.75rem)',
              marginTop: '2rem',
              marginBottom: '2rem',
            }}
          >
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: 'var(--yellow)' }}
            >
              Still comparing options?
            </p>
            <h3
              style={{
                fontFamily: 'var(--font-display), system-ui, sans-serif',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--fg)',
                letterSpacing: '-0.01em',
                marginBottom: '0.5rem',
              }}
            >
              Get new electrician and HVAC roles each morning
            </h3>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--fg-muted)',
                lineHeight: 1.6,
                marginBottom: '1rem',
                maxWidth: '560px',
              }}
            >
              Daily alerts filtered to your trade and market. No spam. Unsubscribe anytime.
            </p>
            <JobAlertInlineForm
              variant="jobs"
              source="salary-guide-faq"
              headline="Pick your trade and city"
              subtext="We filter by trade, region, and pay floor. Your inbox stays quiet unless there's a real match."
              buttonLabel="Send me jobs"
            />
          </div>
          </ImpressionTracker>

          {/* Related links */}
          <div
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '1.5rem',
              marginBottom: '3rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem 1.5rem',
              fontSize: '0.85rem',
            }}
          >
            <Link href="/salary-calculator" style={{ color: 'var(--yellow)', fontWeight: 600 }}>
              → Salary calculator
            </Link>
            <Link href="/jobs" style={{ color: 'var(--yellow)', fontWeight: 600 }}>
              → Browse open jobs
            </Link>
            <Link href="/break-into-data-center-work" style={{ color: 'var(--yellow)', fontWeight: 600 }}>
              → How to break into data center work
            </Link>
            <Link href="/interview-prep" style={{ color: 'var(--yellow)', fontWeight: 600 }}>
              → Interview prep guide
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
