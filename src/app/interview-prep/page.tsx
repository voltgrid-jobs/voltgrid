import type { Metadata } from 'next'
import Link from 'next/link'
import { InterviewPrepGate } from '@/components/InterviewPrepGate'

export const metadata: Metadata = {
  title: 'Data Center Trades Interview Questions & Prep Guide — VoltGrid Jobs',
  description: 'Top interview questions for data center electricians, HVAC techs, and low voltage specialists. Technical and behavioral questions with answers, straight from the industry.',
  alternates: { canonical: 'https://voltgridjobs.com/interview-prep' },
  openGraph: {
    title: 'Data Center Trades Interview Questions & Prep Guide',
    description: 'Top interview questions for data center electricians, HVAC techs, and low voltage specialists. Be ready for what interviewers actually ask.',
    type: 'article',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What do data center employers look for in electricians?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Data center employers prioritize experience with medium-voltage switchgear, generator systems, and UPS equipment. They also test for understanding of arc flash safety, NFPA 70E compliance, and lockout/tagout procedures at high-power densities.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are common interview questions for data center HVAC technicians?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Common questions include experience with CRAC/CRAH units, chilled water systems, and hot/cold aisle containment. Interviewers also ask about preventive maintenance schedules, delta-T troubleshooting, and how you handle thermal runaway events.',
      },
    },
    {
      '@type': 'Question',
      name: 'What technical skills do data center low voltage technicians need?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Employers look for structured cabling certification (BICSI INST1/INST2 or equivalent), fiber splicing and testing experience (OTDR, loss testing), cable management skills, and familiarity with MDA/EDA layouts and patch panel documentation.',
      },
    },
  ],
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Data Center Trades Interview Questions & Prep Guide',
  description: 'Top interview questions for data center electricians, HVAC techs, and low voltage specialists.',
  author: { '@type': 'Organization', name: 'VoltGrid Jobs', url: 'https://voltgridjobs.com' },
  publisher: { '@type': 'Organization', name: 'VoltGrid Jobs', url: 'https://voltgridjobs.com' },
  datePublished: '2026-04-01',
  dateModified: '2026-04-01',
  mainEntityOfPage: 'https://voltgridjobs.com/interview-prep',
}

const TRADES = [
  {
    id: 'electrician',
    title: 'Data Center Electrician Interview Questions',
    icon: '⚡',
    category: 'electrical',
    intro: 'Data center electrical roles demand more than journeyman-level wiring skills. Interviewers test for critical power knowledge, safety discipline, and the ability to work safely in energized environments where downtime is measured in millions per minute.',
    questions: [
      {
        q: 'Walk me through your experience with medium-voltage switchgear.',
        a: 'Interviewers want specifics: voltage class, manufacturers (Eaton, ABB, Siemens), and whether you have experience performing switching operations or maintenance under energized conditions. Mention any NFPA 70E arc flash training.',
      },
      {
        q: 'Describe your experience with UPS systems in a critical environment.',
        a: 'Focus on battery maintenance, static bypass procedures, and any experience with double-conversion vs. line-interactive systems. Data centers use N+1 or 2N UPS configurations — knowing the difference shows depth.',
      },
      {
        q: 'How do you approach lockout/tagout in a live data center?',
        a: 'Emphasize the difference between construction LOTO and critical facilities LOTO — in a data center, de-energizing the wrong path can kill a live load. Walk through your verification steps: test, lock, tag, verify.',
      },
      {
        q: 'What is your experience with generator testing and load bank operations?',
        a: 'Describe weekly load tests, annual full-load tests, and any experience with paralleling multiple generators. Mention any ATS (automatic transfer switch) maintenance or programming experience.',
      },
      {
        q: 'Have you worked in a facility following ASHRAE A1 or A2 thermal guidelines?',
        a: 'This is a signal question — it shows you understand that data center electrical work intersects with cooling strategy. If yes, mention how power density affected your cable routing and thermal management considerations.',
      },
      {
        q: 'How do you read and interpret a one-line diagram?',
        a: 'Be ready to walk through a one-line on a whiteboard. Data center one-lines can show 2N power paths — A feed and B feed — running parallel to each PDU. Know how to trace a fault upstream.',
      },
      {
        q: 'What certifications do you hold, and which are you pursuing?',
        a: 'NFPA 70E certification, journeyman or master electrical license, and any OEM certifications (Eaton, Schneider, Vertiv) are valued. OSHA 30 is a common requirement for data center construction sites.',
      },
      {
        q: 'Tell me about a time you found a safety issue on a job site. What did you do?',
        a: "Behavioral question. Interviewers want to see that you stopped work, reported it through proper channels, and didn't pressure others to proceed unsafely. In a data center, safety and uptime can conflict — they want to know you prioritize safety.",
      },
      {
        q: 'What is your experience with PDU (power distribution unit) installation and maintenance?',
        a: 'Describe the types of PDUs you have worked with (metered, switched, monitored), rack-level vs. floor-level PDUs, and any experience with branch circuit monitoring systems.',
      },
      {
        q: 'How do you handle working in a white space (live server environment)?',
        a: 'Emphasize ESD precautions, cable management discipline, working in contained aisles without disrupting airflow, and coordinating outages with the operations team rather than working around them.',
      },
    ],
  },
  {
    id: 'hvac',
    title: 'Data Center HVAC Technician Interview Questions',
    icon: '❄️',
    category: 'hvac',
    intro: 'Data center HVAC is precision cooling at industrial scale. Interviewers test for knowledge of CRAC/CRAH systems, chilled water plants, and the ability to keep PUE targets on track. Downtime from a cooling failure is faster and more catastrophic than most other systems.',
    questions: [
      {
        q: 'Describe your experience with CRAC and CRAH units.',
        a: 'CRAC (Computer Room Air Conditioner) uses a DX refrigerant circuit. CRAH (Computer Room Air Handler) uses chilled water. Knowing the difference and being able to service both is a baseline requirement. Mention manufacturers: Liebert (Vertiv), Stulz, Schneider.',
      },
      {
        q: 'What is hot/cold aisle containment, and how does it affect your maintenance work?',
        a: 'Containment separates hot exhaust air from cold supply air, improving cooling efficiency. It affects your access routes, air pressure differentials, and the order of operations when you need to open containment to access equipment.',
      },
      {
        q: 'How do you diagnose a high delta-T condition in a chilled water loop?',
        a: 'High delta-T (difference between supply and return water temperature) typically means insufficient flow, dirty coils, or failing pumps. Walk through your diagnostic steps: check flow rates, measure coil differential, inspect strainers and valves.',
      },
      {
        q: 'What is your experience with cooling towers and condenser water systems?',
        a: 'Describe water treatment (biocides, scale inhibitors), blowdown procedures, drift eliminator maintenance, and any experience with free-cooling economizer modes. Data centers in cooler climates run free-cooling for significant portions of the year.',
      },
      {
        q: 'Have you worked with adiabatic or evaporative cooling systems?',
        a: 'Hyperscale facilities often use direct or indirect evaporative cooling to achieve PUE targets near 1.1. Describe any experience with media pads, water distribution systems, and the seasonal maintenance cycles these require.',
      },
      {
        q: 'How do you handle a CRAC unit alarm at 2am?',
        a: 'Behavioral question testing your alarm response process. They want to see you acknowledge the alarm, check secondary systems first before assuming a hardware failure, notify the on-call supervisor, and document everything. Panic responses are a red flag.',
      },
      {
        q: 'What preventive maintenance tasks do you perform on precision cooling units?',
        a: 'Filter replacement, coil cleaning, condensate drain inspection, refrigerant charge verification, belt/bearing inspection on older units, and control system calibration checks. Frequency varies by manufacturer — quarterly and annual PM cycles are common.',
      },
      {
        q: 'Describe your experience with BMS or DCIM systems.',
        a: 'Building Management Systems (BMS) and Data Center Infrastructure Management (DCIM) tools monitor temperature, humidity, and equipment status. Familiarity with Schneider EcoStruxure, Vertiv Trellis, or similar platforms is a differentiator.',
      },
      {
        q: 'What certifications do you hold relevant to data center HVAC?',
        a: 'EPA 608 (required for refrigerant handling), NATE certification, and any manufacturer-specific training (Liebert, Stulz, Schneider) are valued. OSHA 30 is often required on construction sites.',
      },
      {
        q: 'How do you prioritize when multiple HVAC systems are showing faults simultaneously?',
        a: 'Interviewers test your ability to triage. Prioritize by impact on server inlet temperatures — a CRAC failure in a hot aisle will cause thermal shutdown faster than a chiller alarm with redundancy still active. Document and escalate in parallel.',
      },
    ],
  },
  {
    id: 'low-voltage',
    title: 'Low Voltage & Structured Cabling Interview Questions',
    icon: '📡',
    category: 'low_voltage',
    intro: 'Low voltage technicians at data centers install and maintain the physical layer that everything else runs on. Interviewers look for structured cabling certification, fiber expertise, and the documentation discipline that keeps a data center\'s cabling plant manageable at scale.',
    questions: [
      {
        q: 'What structured cabling certifications do you hold?',
        a: 'BICSI INST1 and INST2 are the industry standard. Manufacturers also offer certifications (CommScope, Panduit, Belden) that demonstrate proficiency with specific product lines. RCDD (Registered Communications Distribution Designer) is the senior credential.',
      },
      {
        q: 'Describe your experience with fiber splicing and testing.',
        a: 'Specify the types: fusion splicing vs. mechanical, single-mode vs. multimode, and the equipment you have used (Fujikura, Sumitomo splicers). OTDR testing, insertion loss testing, and end-face inspection with a scope are baseline skills.',
      },
      {
        q: 'What is your experience with MDA/EDA/HDA zones in a data center?',
        a: 'Main Distribution Area (MDA), Equipment Distribution Area (EDA), and Horizontal Distribution Area (HDA) are the structured cabling zones defined by TIA-942. Knowing how to design and cable within these zones shows data center-specific knowledge.',
      },
      {
        q: 'How do you document a cabling installation?',
        a: 'Interviewers want to see discipline here. Every cable should be labeled at both ends, every patch panel port documented in a naming convention, and as-built drawings updated. Many sites use DCIM software — familiarity with iTRACS, Nlyte, or Sunbird is a plus.',
      },
      {
        q: 'What is the difference between OS1 and OS2 single-mode fiber?',
        a: 'OS1 is tightly buffered, rated for indoor use up to 10km. OS2 is loose tube, rated for longer runs (up to 200km) and outdoor/direct burial applications. Data center backbone runs typically use OS2 for its lower attenuation.',
      },
      {
        q: 'Describe your experience with high-density patching solutions.',
        a: 'MPO/MTP pre-terminated systems allow fast deployment of high-density fiber in limited rack space. Describe any experience with cassettes, trunk cables, and breakout assemblies, as well as the polarity management (Method A, B, or C).',
      },
      {
        q: 'How do you handle a fiber that fails testing after installation?',
        a: 'Walk through your troubleshooting process: inspect end faces, check for tight bends, re-test with an OTDR to locate the fault, and decide between re-splicing, replacing the run, or cleaning connectors. Document the issue and resolution.',
      },
      {
        q: 'What is your experience with cable management and ladder rack installation?',
        a: 'Proper cable management affects airflow, serviceability, and aesthetics. Describe your approach to cable routing, tie-wrap spacing, bend radius compliance, and working in both above-ceiling and under-floor environments.',
      },
      {
        q: 'Have you worked with copper Category 6A or higher cabling?',
        a: 'Cat6A is the current standard for 10GbE to the rack. Describe your experience with proper termination technique, alien crosstalk mitigation, and the testing parameters (insertion loss, NEXT, FEXT, return loss) required to certify a Cat6A link.',
      },
      {
        q: 'Tell me about a large-scale cabling project you contributed to.',
        a: 'Behavioral question. Interviewers want to hear about your role (scope of work, team size), how you managed labeling and documentation at scale, any coordination challenges with other trades, and how you handled punch-list items before handover.',
      },
    ],
  },
]

export default function InterviewPrepPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <p className="text-sm mb-6" style={{ color: 'var(--fg-faint)' }}>
          <Link href="/" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">Home</Link>
          {' '}/{' '}
          <span style={{ color: 'var(--fg-muted)' }}>Interview Prep</span>
        </p>

        {/* Hero */}
        <h1
          className="mb-4 leading-tight"
          style={{
            fontFamily: 'var(--font-display), system-ui, sans-serif',
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--fg)',
            letterSpacing: '-0.01em',
          }}
        >
          Data Center Trades Interview Prep Guide
        </h1>
        <p className="text-base mb-2" style={{ color: 'var(--fg-muted)', lineHeight: 1.7, maxWidth: '640px' }}>
          The 20 questions data center employers actually ask — for electricians, HVAC techs, and low voltage specialists. Answers explain what interviewers are really testing for, not just what to say.
        </p>
        <p className="text-sm mb-10" style={{ color: 'var(--fg-faint)' }}>
          Jump to:{' '}
          <a href="#electrician" className="hover:text-yellow-400 transition-colors" style={{ color: 'var(--yellow)' }}>Electrician</a>
          {' · '}
          <a href="#hvac" className="hover:text-yellow-400 transition-colors" style={{ color: 'var(--yellow)' }}>HVAC</a>
          {' · '}
          <a href="#low-voltage" className="hover:text-yellow-400 transition-colors" style={{ color: 'var(--yellow)' }}>Low Voltage</a>
        </p>

        {/* Electrician section — free, always visible, fully crawlable */}
        {TRADES.slice(0, 1).map((trade) => (
          <section key={trade.id} id={trade.id} className="mb-14">
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
                  Get notified when new electrician jobs post
                </p>
                <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>
                  Free job alerts — we notify you when matching roles appear at data centers.
                </p>
              </div>
              <Link
                href="/jobs?category=electrical"
                className="text-sm font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
              >
                Browse ⚡ jobs →
              </Link>
            </div>
          </section>
        ))}

        {/* HVAC + Low Voltage — gated until email captured */}
        <InterviewPrepGate />
      </div>
    </>
  )
}
