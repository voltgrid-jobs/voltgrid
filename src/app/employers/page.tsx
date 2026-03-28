import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Post a Job — VoltGrid Jobs | Hire Data Center Trades Workers',
  description:
    'Reach electricians, HVAC techs, and low voltage specialists who already know what a data center is. Flat pricing from $149. Go live in 5 minutes.',
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
    description: '5 listings at $99 each — best for project ramp-ups',
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
      'Featured employer profile',
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
    problem: 'Buries your listing in 10,000 results',
    detail:
      'Your electrician role competes with fast food and warehouse jobs. Candidates who respond often have no idea what a data center is.',
    solution: 'VoltGrid is 100% data center and AI infrastructure roles. No noise.',
    icon: '📉',
  },
  {
    platform: 'LinkedIn',
    problem: '$500+ per slot with zero niche targeting',
    detail:
      'You pay CPC whether or not the applicant has ever touched a PDU. Budget burns fast with nothing to show for it.',
    solution: 'VoltGrid is flat pricing — $149, no surprises, no bidding wars.',
    icon: '💸',
  },
  {
    platform: 'Trade Forums',
    problem: 'Requires posting manually in 50 different places',
    detail:
      "Reddit threads, Facebook groups, Discord servers — it works, but it's a full-time job to maintain and impossible to track.",
    solution: 'One post on VoltGrid reaches the audience across all those channels.',
    icon: '😩',
  },
]

const WHO_POSTS = [
  { title: 'General Contractors', desc: 'Mortensons, Holders, Skanskas — GCs managing data center site builds who need licensed electricians and HVAC crews fast.' },
  { title: 'Data Center Operators', desc: 'Equinix, Digital Realty, QTS — operators with in-house facilities teams hiring for critical environment maintenance roles.' },
  { title: 'MEP Subcontractors', desc: 'Rosendin, Faith Technologies, Helix Electric — electrical and mechanical subs who live and die by trades headcount.' },
  { title: 'Staffing Firms', desc: 'Aerotek, Tradesmen International — firms placing skilled trades workers on data center projects for their clients.' },
  { title: 'Facility Management Firms', desc: 'CBRE, JLL, Cushman & Wakefield — facility managers overseeing data center O&M who need certified, experienced techs.' },
]

const FAQS = [
  {
    q: 'Who sees my listing?',
    a: 'Electricians, HVAC technicians, low voltage specialists, critical environment techs, and other trades workers who have specifically sought out VoltGrid because it focuses on data center and AI infrastructure work. No nurses. No delivery drivers.',
  },
  {
    q: "What's the difference from Indeed?",
    a: "Indeed is a general job board serving every industry. Your data center electrician listing sits next to barista and retail roles. VoltGrid is niche — every candidate on the platform is a trades professional interested in data center and AI infrastructure work, so your listing gets in front of the right people, not just the most people.",
  },
  {
    q: 'Can I post multiple locations?',
    a: "Yes. Each listing can specify a city/state and job type. If you're hiring for the same role across three sites, post three listings — or grab the 5-Pack at $99 each and save.",
  },
  {
    q: 'Do you offer refunds?',
    a: "If your listing goes live and you have a genuine issue (technical problem, accidental duplicate), reach out within 48 hours and we'll make it right. We don't offer refunds simply because applications were slow — but we do want every employer to get value, so contact us and we'll work something out.",
  },
  {
    q: 'How quickly does my listing go live?',
    a: "Within minutes. There's no manual review queue. Fill out the form, pay, and your listing is live immediately — visible to every trades worker who visits VoltGrid.",
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

export default function EmployersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-gray-950 text-white">
        {/* ── Hero ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-1.5 text-yellow-400 text-sm font-medium mb-6">
            ⚡ The only job board built for data center trades
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            Stop filtering out nurses.<br />
            <span className="text-yellow-400">Hire the people who build AI infrastructure.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            VoltGrid reaches electricians, HVAC techs, and low voltage specialists who already know
            what a data center is. Flat pricing. Live in 5 minutes. No account manager required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/post-job"
              className="bg-yellow-400 text-gray-950 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors"
            >
              Post a Job — $149
            </Link>
            <a
              href="#pricing"
              className="border border-gray-700 text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-500 transition-colors"
            >
              See all plans
            </a>
          </div>
        </section>

        {/* ── Trust / Context Bar ── */}
        <section className="border-y border-gray-800 bg-gray-900/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-6 font-medium">
              Why the urgency is real
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                { stat: '2,800+ MW', label: 'of US data center capacity currently under construction' },
                { stat: '$1T+', label: 'committed by hyperscalers to AI infrastructure through 2030' },
                { stat: '500,000+', label: 'additional trades workers needed to build and operate these facilities' },
              ].map(({ stat, label }) => (
                <div key={stat}>
                  <div className="text-3xl font-extrabold text-yellow-400 mb-1">{stat}</div>
                  <div className="text-gray-400 text-sm">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-600 text-xs mt-6">
              The AI infrastructure buildout is the biggest construction wave in a generation. The workers are out there — but you need to be where they're looking.
            </p>
          </div>
        </section>

        {/* ── Pain Point Section ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Where everyone else falls short
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            General job boards weren't built for niche hiring. Here's the problem — and how VoltGrid fixes it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PAIN_POINTS.map((item) => (
              <div key={item.platform} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">{item.platform}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.problem}</h3>
                <p className="text-gray-400 text-sm mb-4 flex-1">{item.detail}</p>
                <div className="border-t border-gray-800 pt-4">
                  <div className="flex items-start gap-2 text-sm text-green-400">
                    <span className="mt-0.5 flex-shrink-0">✓</span>
                    <span>{item.solution}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="bg-gray-900/50 border-y border-gray-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Live in 5 minutes, no BS
            </h2>
            <p className="text-gray-400 text-center mb-14 max-w-lg mx-auto">
              No account manager. No approval queue. No bidding on keywords.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Write your listing',
                  desc: 'Fill out the job form: role, location, pay range, requirements. Takes about 3 minutes.',
                },
                {
                  step: '02',
                  title: 'Pay flat fee',
                  desc: 'Choose your plan. $149 for a single post, or grab the 5-Pack at $99 each. No subscriptions unless you want them.',
                },
                {
                  step: '03',
                  title: 'Trades workers apply directly',
                  desc: 'Applications go straight to your email or ATS link. We stay out of the way.',
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className="w-12 h-12 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-bold text-sm mb-4">
                    {step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who Posts Here ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Who's hiring on VoltGrid
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">
            From hyperscale buildouts to ongoing O&amp;M — if you need licensed trades workers in data centers, this is your board.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHO_POSTS.map(({ title, desc }) => (
              <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
            {/* CTA card */}
            <div className="bg-yellow-400/5 border border-yellow-400/30 rounded-xl p-5 flex flex-col justify-center items-start">
              <p className="text-yellow-400 font-semibold mb-2">Ready to post?</p>
              <Link href="/post-job" className="text-sm text-gray-300 hover:text-white underline underline-offset-2">
                Post a job in 5 minutes →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="bg-gray-900/50 border-y border-gray-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
            <h2 className="text-3xl font-bold text-white text-center mb-3">
              Simple, flat pricing
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">
              No pay-per-click. No surprise invoices. Pick a plan, post your jobs, hire your crew.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-7 flex flex-col relative ${
                    plan.highlighted
                      ? 'border-yellow-400 bg-yellow-400/5'
                      : 'border-gray-800 bg-gray-900'
                  }`}
                >
                  {plan.badge && (
                    <div
                      className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                        plan.highlighted ? 'text-yellow-400' : 'text-gray-500'
                      }`}
                    >
                      {plan.badge}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`block text-center py-3.5 rounded-xl font-semibold transition-colors ${
                      plan.highlighted
                        ? 'bg-yellow-400 text-gray-950 hover:bg-yellow-300'
                        : 'border border-gray-700 text-white hover:border-gray-500 hover:bg-gray-800'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 text-sm">
              Need a featured boost? Add +$99 to any listing to pin it to the top of its category for 30 days.
              <br />
              Questions?{' '}
              <a href="mailto:hello@voltgridjobs.com" className="text-yellow-400 hover:text-yellow-300">
                hello@voltgridjobs.com
              </a>
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2">{q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA Strip ── */}
        <section className="bg-yellow-400">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center">
            <h2 className="text-3xl font-extrabold text-gray-950 mb-3">
              Ready to find your next crew?
            </h2>
            <p className="text-gray-800 mb-8 text-lg">
              Post a job in 5 minutes. No account manager. No bidding. Just trades workers who know the work.
            </p>
            <Link
              href="/post-job"
              className="inline-block bg-gray-950 text-yellow-400 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors"
            >
              Post a Job — $149
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
