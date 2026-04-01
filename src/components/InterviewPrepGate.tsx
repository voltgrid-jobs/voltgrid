'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const GATED_TRADES = [
  {
    id: 'hvac',
    title: 'Data Center HVAC Technician Interview Questions',
    icon: '❄️',
    category: 'hvac',
    intro: 'Data center HVAC is precision cooling at industrial scale. Interviewers test for knowledge of CRAC/CRAH systems, chilled water plants, and the ability to keep PUE targets on track. Downtime from a cooling failure is faster and more catastrophic than most other systems.',
    questions: [
      { q: 'Describe your experience with CRAC and CRAH units.', a: 'CRAC (Computer Room Air Conditioner) uses a DX refrigerant circuit. CRAH (Computer Room Air Handler) uses chilled water. Knowing the difference and being able to service both is a baseline requirement. Mention manufacturers: Liebert (Vertiv), Stulz, Schneider.' },
      { q: 'What is hot/cold aisle containment, and how does it affect your maintenance work?', a: 'Containment separates hot exhaust air from cold supply air, improving cooling efficiency. It affects your access routes, air pressure differentials, and the order of operations when you need to open containment to access equipment.' },
      { q: 'How do you diagnose a high delta-T condition in a chilled water loop?', a: 'High delta-T (difference between supply and return water temperature) typically means insufficient flow, dirty coils, or failing pumps. Walk through your diagnostic steps: check flow rates, measure coil differential, inspect strainers and valves.' },
      { q: 'What is your experience with cooling towers and condenser water systems?', a: 'Describe water treatment (biocides, scale inhibitors), blowdown procedures, drift eliminator maintenance, and any experience with free-cooling economizer modes. Data centers in cooler climates run free-cooling for significant portions of the year.' },
      { q: 'Have you worked with adiabatic or evaporative cooling systems?', a: 'Hyperscale facilities often use direct or indirect evaporative cooling to achieve PUE targets near 1.1. Describe any experience with media pads, water distribution systems, and the seasonal maintenance cycles these require.' },
      { q: 'How do you handle a CRAC unit alarm at 2am?', a: 'Behavioral question testing your alarm response process. They want to see you acknowledge the alarm, check secondary systems first before assuming a hardware failure, notify the on-call supervisor, and document everything. Panic responses are a red flag.' },
      { q: 'What preventive maintenance tasks do you perform on precision cooling units?', a: 'Filter replacement, coil cleaning, condensate drain inspection, refrigerant charge verification, belt/bearing inspection on older units, and control system calibration checks. Frequency varies by manufacturer — quarterly and annual PM cycles are common.' },
      { q: 'Describe your experience with BMS or DCIM systems.', a: 'Building Management Systems (BMS) and Data Center Infrastructure Management (DCIM) tools monitor temperature, humidity, and equipment status. Familiarity with Schneider EcoStruxure, Vertiv Trellis, or similar platforms is a differentiator.' },
      { q: 'What certifications do you hold relevant to data center HVAC?', a: 'EPA 608 (required for refrigerant handling), NATE certification, and any manufacturer-specific training (Liebert, Stulz, Schneider) are valued. OSHA 30 is often required on construction sites.' },
      { q: 'How do you prioritize when multiple HVAC systems are showing faults simultaneously?', a: 'Interviewers test your ability to triage. Prioritize by impact on server inlet temperatures — a CRAC failure in a hot aisle will cause thermal shutdown faster than a chiller alarm with redundancy still active. Document and escalate in parallel.' },
    ],
  },
  {
    id: 'low-voltage',
    title: 'Low Voltage & Structured Cabling Interview Questions',
    icon: '📡',
    category: 'low_voltage',
    intro: "Low voltage technicians at data centers install and maintain the physical layer that everything else runs on. Interviewers look for structured cabling certification, fiber expertise, and the documentation discipline that keeps a data center's cabling plant manageable at scale.",
    questions: [
      { q: 'What structured cabling certifications do you hold?', a: 'BICSI INST1 and INST2 are the industry standard. Manufacturers also offer certifications (CommScope, Panduit, Belden) that demonstrate proficiency with specific product lines. RCDD (Registered Communications Distribution Designer) is the senior credential.' },
      { q: 'Describe your experience with fiber splicing and testing.', a: 'Specify the types: fusion splicing vs. mechanical, single-mode vs. multimode, and the equipment you have used (Fujikura, Sumitomo splicers). OTDR testing, insertion loss testing, and end-face inspection with a scope are baseline skills.' },
      { q: 'What is your experience with MDA/EDA/HDA zones in a data center?', a: 'Main Distribution Area (MDA), Equipment Distribution Area (EDA), and Horizontal Distribution Area (HDA) are the structured cabling zones defined by TIA-942. Knowing how to design and cable within these zones shows data center-specific knowledge.' },
      { q: 'How do you document a cabling installation?', a: 'Interviewers want to see discipline here. Every cable should be labeled at both ends, every patch panel port documented in a naming convention, and as-built drawings updated. Many sites use DCIM software — familiarity with iTRACS, Nlyte, or Sunbird is a plus.' },
      { q: 'What is the difference between OS1 and OS2 single-mode fiber?', a: 'OS1 is tightly buffered, rated for indoor use up to 10km. OS2 is loose tube, rated for longer runs (up to 200km) and outdoor/direct burial applications. Data center backbone runs typically use OS2 for its lower attenuation.' },
      { q: 'Describe your experience with high-density patching solutions.', a: 'MPO/MTP pre-terminated systems allow fast deployment of high-density fiber in limited rack space. Describe any experience with cassettes, trunk cables, and breakout assemblies, as well as the polarity management (Method A, B, or C).' },
      { q: 'How do you handle a fiber that fails testing after installation?', a: 'Walk through your troubleshooting process: inspect end faces, check for tight bends, re-test with an OTDR to locate the fault, and decide between re-splicing, replacing the run, or cleaning connectors. Document the issue and resolution.' },
      { q: 'What is your experience with cable management and ladder rack installation?', a: 'Proper cable management affects airflow, serviceability, and aesthetics. Describe your approach to cable routing, tie-wrap spacing, bend radius compliance, and working in both above-ceiling and under-floor environments.' },
      { q: 'Have you worked with copper Category 6A or higher cabling?', a: 'Cat6A is the current standard for 10GbE to the rack. Describe your experience with proper termination technique, alien crosstalk mitigation, and the testing parameters (insertion loss, NEXT, FEXT, return loss) required to certify a Cat6A link.' },
      { q: 'Tell me about a large-scale cabling project you contributed to.', a: 'Behavioral question. Interviewers want to hear about your role (scope of work, team size), how you managed labeling and documentation at scale, any coordination challenges with other trades, and how you handled punch-list items before handover.' },
    ],
  },
]

function TradeSection({ trade }: { trade: typeof GATED_TRADES[0] }) {
  return (
    <section id={trade.id} className="mb-14">
      <h2
        className="text-2xl font-bold mb-3 flex items-center gap-3"
        style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
      >
        <span>{trade.icon}</span>
        {trade.title}
      </h2>
      <p className="text-sm mb-8" style={{ color: 'var(--fg-muted)', lineHeight: 1.7 }}>
        {trade.intro}
      </p>
      <ol className="space-y-6">
        {trade.questions.map((item, i) => (
          <li key={i} className="flex gap-4">
            <span
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
              style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
            >
              {i + 1}
            </span>
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--fg)' }}>{item.q}</p>
              <p className="text-sm" style={{ color: 'var(--fg-muted)', lineHeight: 1.7 }}>{item.a}</p>
            </div>
          </li>
        ))}
      </ol>
      <div
        className="mt-8 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
      >
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
            Get notified when new {trade.icon === '❄️' ? 'HVAC' : 'low voltage'} jobs post
          </p>
          <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>
            Free job alerts — we notify you when matching roles appear at data centers.
          </p>
        </div>
        <Link
          href={`/jobs?category=${trade.category}`}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
        >
          Browse {trade.icon} jobs →
        </Link>
      </div>
    </section>
  )
}

export function InterviewPrepGate() {
  const [unlocked, setUnlocked] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('interviewPrepUnlocked') === 'true') {
      setUnlocked(true)
    }
    setChecking(false)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), location: '', frequency: 'daily' }),
      })
    } catch {
      // Non-fatal — always unlock
    } finally {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('interviewPrepUnlocked', 'true')
      }
      setLoading(false)
      setUnlocked(true)
    }
  }

  // While checking localStorage, render nothing to avoid flash
  if (checking) return null

  if (unlocked) {
    return (
      <>
        {GATED_TRADES.map(trade => (
          <TradeSection key={trade.id} trade={trade} />
        ))}
        <div
          className="rounded-xl px-6 py-8 text-center mt-4"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
        >
          <p className="text-lg font-bold mb-2" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
            Ready to find your next role?
          </p>
          <p className="text-sm mb-5" style={{ color: 'var(--fg-muted)' }}>
            Browse data center trades jobs — electricians, HVAC techs, low voltage specialists, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/jobs"
              className="inline-block font-bold px-6 py-3 rounded-xl transition-colors"
              style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
            >
              Browse all open jobs →
            </Link>
            <Link
              href="/break-into-data-center-work"
              className="inline-block font-semibold px-6 py-3 rounded-xl transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
            >
              Break into data center work →
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <div
      className="rounded-2xl px-6 py-8 my-4"
      style={{ background: 'var(--bg-raised)', border: '1px solid var(--yellow-border)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--yellow)' }}>
        Continue reading
      </p>
      <p className="text-base font-semibold mb-1" style={{ color: 'var(--fg)', lineHeight: 1.6 }}>
        You are reading the right guide.
      </p>
      <p className="text-sm mb-5" style={{ color: 'var(--fg-muted)', lineHeight: 1.7 }}>
        Get the rest — interview questions, what interviewers actually look for, and how to handle the technical walk-through.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          className="flex-1 px-3 py-2.5 rounded-lg text-sm focus:outline-none autofill-bg-dark"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border-strong)',
            color: 'var(--fg)',
          }}
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-40 whitespace-nowrap"
          style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
        >
          {loading ? 'Loading...' : 'Continue reading →'}
        </button>
      </form>
      <p className="text-xs mt-3" style={{ color: 'var(--fg-faint)' }}>
        Free. We&apos;ll also send job alerts when matching roles open.
      </p>
    </div>
  )
}
