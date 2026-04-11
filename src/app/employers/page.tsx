export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { LogoCarousel } from '@/components/LogoCarousel'

export const metadata: Metadata = {
  title: 'Find Verified Data Center Electricians & HVAC Techs Faster',
  description:
    'Reach electricians, HVAC techs, and low voltage specialists who already know what a data center is. Flat pricing from $149. Go live in 5 minutes.',
  alternates: { canonical: 'https://voltgridjobs.com/employers' },
}

const PLANS = [
  {
    name: 'Single Post',
    price: '$149',
    period: 'one-time',
    description: '1 listing, active for 30 days',
    features: [
      '1 job listing',
      '30 days active',
      'Standard placement',
      'Apply via your URL or email',
    ],
    cta: 'Post One Job',
    href: '/post-job?plan=single_post',
    highlighted: false,
    badge: null,
  },
  {
    name: '5-Pack',
    price: '$499',
    period: 'one-time',
    description: '5 listings at $99 each. Best for project ramp-ups.',
    features: [
      '5 job listings',
      '60-day window to use',
      'Standard placement',
      'Ideal for multi-role hiring',
    ],
    cta: 'Buy 5-Pack',
    href: '/post-job?plan=five_pack',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Pro Monthly',
    price: '$799',
    period: '/ month',
    description: 'Unlimited postings for power hirers',
    features: [
      'Unlimited listings',
      'Featured badge on all listings',
      'Priority support',
    ],
    cta: 'Go Pro',
    href: '/post-job?plan=pro_monthly',
    highlighted: false,
    badge: 'Best for Staffing Firms',
  },
]

const PAIN_POINTS = [
  {
    platform: 'Indeed',
    problem: 'Your listing competes with baristas',
    detail:
      'A journeyman electrician posting sits next to warehouse and fast-food roles. Most applicants have never been inside a data center. You spend hours filtering.',
    solution: 'Every candidate on VoltGrid is specifically looking for data center or AI infrastructure work.',
  },
  {
    platform: 'LinkedIn',
    problem: 'CPC pricing with no niche targeting',
    detail:
      'You pay per click whether or not the applicant knows what a PDU is. A $500 budget evaporates before you see a qualified resume.',
    solution: 'VoltGrid is $149 flat. Post once, active for 30 days, applications direct to you.',
  },
  {
    platform: 'Staffing Agencies',
    problem: '$3,000–$8,000 per placement',
    detail:
      'Agency fees run 15–25% of first-year salary. For a journeyman electrician at $80k, that\'s $12,000–$20,000 per hire before you know if they\'ll work out.',
    solution: 'At $149 per listing, one hire on VoltGrid pays for 50 more postings.',
  },
]

const WHO_POSTS = [
  { title: 'General Contractors', desc: 'GCs managing hyperscale and colocation builds who need licensed electricians and HVAC crews on tight timelines.' },
  { title: 'Data Center Operators', desc: 'Cologix, Equinix, EdgeConneX: operators with in-house facilities teams hiring for critical environment roles.' },
  { title: 'MEP Subcontractors', desc: 'Helix Electric, Faith Technologies, Rosendin: electrical and mechanical subs whose project schedules depend on headcount.' },
  { title: 'Staffing Firms', desc: 'Aerotek, Insight Global: firms placing trades workers on data center projects who need a niche sourcing channel.' },
  { title: 'Facility Management', desc: 'CBRE, Cushman & Wakefield: facility managers overseeing data center O&M who need certified, experienced technicians.' },
]

const FAQS = [
  {
    q: 'Who sees my listing?',
    a: 'Electricians, HVAC technicians, low voltage specialists, critical environment techs, and other trades workers who have specifically sought out VoltGrid because it focuses on data center and AI infrastructure work. No nurses. No delivery drivers.',
  },
  {
    q: "What's the difference from Indeed?",
    a: "Indeed is a general job board serving every industry. Your data center electrician listing sits next to barista and retail roles. VoltGrid is niche: every candidate on the platform is a trades professional interested in data center and AI infrastructure work, so your listing gets in front of the right people, not just the most people.",
  },
  {
    q: 'Can I post multiple locations?',
    a: "Yes. Each listing can specify a city/state and job type. If you're hiring for the same role across three sites, post three listings, or grab the 5-Pack at $99 each and save.",
  },
  {
    q: 'Do you offer refunds?',
    a: "If your listing goes live and you have a genuine issue (technical problem, accidental duplicate), reach out within 48 hours and we'll make it right. We don't offer refunds simply because applications were slow, but we do want every employer to get value, so contact us and we'll work something out.",
  },
  {
    q: 'How quickly does my listing go live?',
    a: "Within minutes. There's no manual review queue. Fill out the form, pay, and your listing is live immediately, visible to every trades worker who visits VoltGrid.",
  },
  {
    q: 'Is $149 worth it?',
    a: "If your open electrician role pays $75/hour, a 40-hour week unfilled costs roughly $3,000 in lost project output. If VoltGrid gets you one qualified applicant faster than anywhere else, the listing paid for itself 20 times over. If it does not work, you spent $149.",
  },
  {
    q: 'Where do the jobs on VoltGrid come from?',
    a: "Two sources: direct employer listings (like yours) and jobs sourced from public employer career pages. Every listing is manually filtered to data center and AI infrastructure trades work only. On Indeed, your posting competes with millions of others. On VoltGrid, it is one of a few hundred. The curation is the product.",
  },
  {
    q: 'What experience should candidates have?',
    a: "For electrical: low/medium voltage, power and lighting experience is what DC employers need. Not high voltage, not residential. For HVAC: precision cooling, energy modeling, load calcs. If a candidate knows these, they can make the transition. VoltGrid attracts people already looking specifically for DC work.",
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: a,
    },
  })),
}

export default async function EmployersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div>
        {/* ── Hero ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-8"
            style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }}>
            ⚡ Built for data center trades hiring
          </div>
          <h1 className="leading-none mb-6"
            style={{ fontFamily: 'var(--font-display), system-ui, sans-serif', fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: 800, color: 'var(--fg)', maxWidth: '800px' }}>
            Find verified data center<br />electricians & HVAC techs<br />
            <span style={{ color: 'var(--yellow)' }}>faster.</span>
          </h1>
          <p className="text-lg mb-4" style={{ color: 'var(--fg-muted)', maxWidth: '580px', lineHeight: 1.7 }}>
            The pool of data center-experienced trades workers is small. Every DC employer is competing
            for the same people. VoltGrid is where that pool actively looks for work.
          </p>
          <p className="text-base mb-10" style={{ color: 'var(--fg-faint)', maxWidth: '560px', lineHeight: 1.6 }}>
            On Indeed, your $85/hr DC electrician posting sits next to residential apprentice roles.
            On VoltGrid, every candidate already knows what a PDU is.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/post-job" className="px-8 py-4 rounded-xl font-bold text-lg transition-opacity hover:opacity-90 inline-block"
              style={{ background: 'var(--yellow)', color: '#0A0A0A' }}>
              Post Your First Job
            </Link>
            <a href="#pricing" className="px-8 py-4 rounded-xl font-semibold text-lg transition-colors hover:opacity-80 inline-block"
              style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}>
              See all plans
            </a>
          </div>
        </section>

        {/* ── Company trust bar — auto-scrolling carousel ── */}
        <LogoCarousel label="Employers already on VoltGrid" />

        {/* ── Market context ── */}
        <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                { stat: '2,800+ MW', label: 'of US data center capacity currently under construction' },
                { stat: '$1T+', label: 'committed by hyperscalers to AI infrastructure through 2030' },
                { stat: '500,000+', label: 'additional trades workers needed before 2030' },
              ].map(({ stat, label }) => (
                <div key={stat}>
                  <div className="text-3xl font-extrabold mb-1" style={{ color: 'var(--yellow)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>{stat}</div>
                  <div className="text-sm" style={{ color: 'var(--fg-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pain Points ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
            Where everyone else falls short
          </h2>
          <p className="text-center mb-12 max-w-xl mx-auto" style={{ color: 'var(--fg-muted)' }}>
            General job boards weren't built for niche hiring. Here's the problem, and how VoltGrid fixes it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PAIN_POINTS.map((item) => (
              <div key={item.platform} className="rounded-2xl p-6 flex flex-col" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--fg-faint)' }}>{item.platform}</div>
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--fg)' }}>{item.problem}</h3>
                <p className="text-sm mb-4 flex-1" style={{ color: 'var(--fg-muted)', lineHeight: 1.7 }}>{item.detail}</p>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div className="flex items-start gap-2 text-sm font-medium" style={{ color: 'var(--green)' }}>
                    <span className="flex-shrink-0">✓</span>
                    <span>{item.solution}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
              Live in 5 minutes
            </h2>
            <p className="text-center mb-14 max-w-lg mx-auto" style={{ color: 'var(--fg-muted)' }}>
              No account manager. No approval queue. No bidding on keywords.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {[
                { step: '01', title: 'Write your listing', desc: 'Fill out the job form: role, location, pay range, requirements. Takes about 3 minutes.' },
                { step: '02', title: 'Pay flat fee', desc: 'Choose your plan. $149 for a single post, or grab the 5-Pack at $99 each. No subscriptions unless you want them.' },
                { step: '03', title: 'Trades workers apply directly', desc: 'Applications go straight to your email or ATS link. We stay out of the way.' },
              ].map(({ step, title, desc }) => (
                <div key={step}>
                  <div className="text-5xl font-bold mb-4 leading-none" style={{ fontFamily: 'var(--font-display), system-ui, sans-serif', color: 'var(--yellow)' }}>{step}</div>
                  <h3 className="font-bold text-base mb-2" style={{ color: 'var(--fg)' }}>{title}</h3>
                  <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who Posts ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
            Who&apos;s hiring on VoltGrid
          </h2>
          <p className="text-center mb-12 max-w-lg mx-auto" style={{ color: 'var(--fg-muted)' }}>
            From hyperscale buildouts to ongoing O&amp;M: if you need licensed trades workers in data centers, this is your board.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHO_POSTS.map(({ title, desc }) => (
              <div key={title} className="rounded-xl p-5" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                <h3 className="font-semibold mb-1.5" style={{ color: 'var(--fg)' }}>{title}</h3>
                <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{desc}</p>
              </div>
            ))}
            <div className="rounded-xl p-5 flex flex-col justify-center" style={{ background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }}>
              <p className="font-semibold mb-2" style={{ color: 'var(--yellow)' }}>Ready to post?</p>
              <Link href="/post-job" className="text-sm underline underline-offset-2" style={{ color: 'var(--fg-muted)' }}>
                Post a job in 5 minutes →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
            <h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
              Simple, flat pricing
            </h2>
            <p className="text-center mb-10 max-w-lg mx-auto" style={{ color: 'var(--fg-muted)' }}>
              No pay-per-click. No surprise invoices. Pick a plan, post your jobs, hire your crew.
            </p>

            {/* CHANGE 4A: Price anchoring callout */}
            <div
              className="rounded-xl px-6 py-5 mb-10 max-w-2xl mx-auto"
              style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid var(--yellow-border)' }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--yellow)' }}>
                💡 Industry context
              </p>
              <p className="text-base font-medium leading-snug" style={{ color: 'var(--fg)' }}>
                The average agency placement fee for a skilled trades hire is{' '}
                <span style={{ color: 'var(--fg)' }}>$3,000–$8,000</span>.
              </p>
              <p className="text-base font-bold mt-1" style={{ color: 'var(--yellow)' }}>
                VoltGrid: $149 flat. No bidding. No surprises.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {PLANS.map((plan) => (
                <div key={plan.name} className="rounded-2xl p-7 flex flex-col relative"
                  style={{ background: plan.highlighted ? 'var(--yellow-dim)' : 'var(--bg-raised)', border: plan.highlighted ? '1px solid var(--yellow-border)' : '1px solid var(--border)' }}>
                  {plan.badge && (
                    <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: plan.highlighted ? 'var(--yellow)' : 'var(--fg-faint)' }}>
                      {plan.badge}
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--fg)' }}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>{plan.price}</span>
                    <span className="text-sm" style={{ color: 'var(--fg-faint)' }}>{plan.period}</span>
                  </div>
                  <p className="text-sm mb-6" style={{ color: 'var(--fg-muted)' }}>{plan.description}</p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--fg-muted)' }}>
                        <span className="flex-shrink-0 mt-0.5" style={{ color: 'var(--green)' }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="block text-center py-3.5 rounded-xl font-semibold transition-all"
                    style={plan.highlighted
                      ? { background: 'var(--yellow)', color: '#0A0A0A' }
                      : { border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
            {/* Launch urgency */}
            <p className="text-center text-sm mt-4 mb-2" style={{ color: 'var(--yellow)' }}>
              🚀 Launch pricing — post now before rates increase
            </p>

            {/* Guarantee badges */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <div
                className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >
                <span style={{ color: 'var(--green)' }}>✓</span>
                <span>14-day listing guarantee. If you have a technical issue, we&apos;ll make it right.</span>
              </div>
              <div
                className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >
                <span style={{ color: 'var(--green)' }}>✓</span>
                <span>Not getting traction? We&apos;ll extend your listing free. No questions asked.</span>
              </div>
            </div>

            <p className="text-center text-sm" style={{ color: 'var(--fg-faint)' }}>
              Need a featured boost? Add +$99 to any listing to pin it to the top for 30 days.&nbsp;
              <a href="mailto:hello@voltgridjobs.com" style={{ color: 'var(--yellow)' }}>hello@voltgridjobs.com</a>
            </p>
          </div>
        </section>

        {/* ── Why Pay for VoltGrid? ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
            Why pay for VoltGrid?
          </h2>
          <p className="text-center mb-10 max-w-lg mx-auto text-sm" style={{ color: 'var(--fg-muted)' }}>
            You&apos;ve already tried the free boards. Here&apos;s what&apos;s different.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                objection: 'Indeed sends general applicants.',
                answer: 'VoltGrid sends trades workers who searched for "data center electrician jobs," not the guy who applied to 400 positions today. Every candidate on VoltGrid is here specifically for data center or AI infrastructure work.',
              },
              {
                objection: 'LinkedIn is expensive and slow.',
                answer: 'LinkedIn is built for office workers. Your DC electrician role competes with SaaS sales jobs for attention. VoltGrid is a vertical board: the only candidates here are the ones you actually want.',
              },
              {
                objection: 'I can find people through a staffing agency.',
                answer: 'You can, for $3,000–$8,000 per hire. VoltGrid is $149 flat, applications go directly to your email, and you own the relationship. The candidate list from one listing is often worth more than the fee.',
              },
              {
                objection: 'Our ATS already posts to job boards.',
                answer: 'Generic ATS distribution posts to 50 boards that trades workers don\'t use. VoltGrid is where data center electricians and HVAC techs come specifically because it\'s the one board for their niche, not a side tab on a general site.',
              },
            ].map(({ objection, answer }) => (
              <div key={objection} className="rounded-xl p-6" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--fg-faint)', fontStyle: 'italic' }}>
                  &ldquo;{objection}&rdquo;
                </p>
                <p className="text-sm" style={{ color: 'var(--fg-muted)', lineHeight: 1.7 }}>
                  {answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
            Frequently asked questions
          </h2>
          <div className="space-y-0">
            {FAQS.map(({ q, a }) => (
              <div key={q} style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--fg)' }}>{q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section style={{ background: 'var(--yellow)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: '#0A0A0A', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
              The electricians you want are getting three offers right now.
            </h2>
            <p className="mb-8 text-lg" style={{ color: 'rgba(10,10,10,0.75)' }}>
              Post today. Live in 5 minutes. $149 flat. No bidding, no account manager, no agency fees.
            </p>
            <Link href="/post-job" className="inline-block px-10 py-4 rounded-xl font-bold text-lg transition-opacity hover:opacity-90"
              style={{ background: '#0A0A0A', color: 'var(--yellow)' }}>
              Post a Job for $149
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
