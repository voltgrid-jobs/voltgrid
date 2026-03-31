import { NextRequest, NextResponse } from 'next/server'

const VALID_TRADES = ['electrical', 'hvac', 'low_voltage', 'construction', 'project_management', 'operations'] as const
type Trade = typeof VALID_TRADES[number]

type KeywordSet = { foundational: string[]; dc: string[] }

const KEYWORDS: Record<Trade, KeywordSet> = {
  electrical: {
    foundational: [
      'journeyman', 'master electrician', 'nfpa 70e', 'osha-30', 'osha-10', 'osha 30', 'osha 10',
      'arc flash', 'lockout tagout', 'loto', 'nec', 'conduit', 'switchgear', 'transformer',
      'generator', 'ats', 'ups', 'pdu', 'bus duct', '480v', 'medium voltage', 'cable tray',
      'wire management', 'panel', 'breaker',
    ],
    dc: [
      'data center', 'critical facility', 'mission critical', 'commissioning', 'mop',
      'method of procedure', 'liebert', 'vertiv', 'eaton', 'dcim', 'power distribution',
      'redundancy', 'n+1', '2n', 'uptime',
    ],
  },
  hvac: {
    foundational: [
      'epa 608', 'refrigerant', 'chiller', 'cooling tower', 'air handler', 'ahu',
      'bas', 'bms', 'crac', 'crah', 'precision cooling', 'variable frequency drive', 'vfd',
      'hydronic', 'chilled water', 'condenser', 'hvac', 'journeyman',
    ],
    dc: [
      'data center', 'hot aisle', 'cold aisle', 'containment', 'ashrae', 'dcim',
      'liebert', 'stulz', 'uniflair', 'server room cooling', 'thermal management',
      'critical facility', 'uptime', 'precision cooling',
    ],
  },
  low_voltage: {
    foundational: [
      'low voltage', 'structured cabling', 'fiber optic', 'cat6', 'cat6a', 'bicsi', 'rcdd',
      'termination', 'splicing', 'otdr', 'patch panel', 'cable management', 'tia-568',
      'grounding', 'bonding', 'fiber', 'copper',
    ],
    dc: [
      'data center', 'cross-connect', 'mda', 'hda', 'eda', 'fiber backbone', 'data hall',
      'mmf', 'smf', 'mpo', 'lc connector', 'network infrastructure', 'cable tray',
      'cable ladder', 'critical facility',
    ],
  },
  construction: {
    foundational: [
      'superintendent', 'foreman', 'osha-30', 'osha 30', 'blueprint', 'rfi', 'submittal',
      'schedule', 'subcontractor', 'safety', 'concrete', 'structural steel', 'mep',
      'commissioning', 'budget',
    ],
    dc: [
      'data center', 'mission critical', 'hyperscale', 'tilt-up', 'raised floor',
      'mechanical room', 'electrical room', 'generator', 'cooling tower', 'critical path',
      'punch list', 'substantial completion',
    ],
  },
  project_management: {
    foundational: [
      'pmp', 'project manager', 'schedule', 'budget', 'scope', 'stakeholder', 'rfi',
      'submittal', 'change order', 'risk management', 'procore', 'primavera', 'ms project',
      'gantt', 'milestone', 'closeout',
    ],
    dc: [
      'data center', 'critical facility', 'hyperscale', 'mep coordination', 'commissioning',
      'integrated systems testing', 'ist', 'critical path', 'punch list', 'turnover', 'dcim',
    ],
  },
  operations: {
    foundational: [
      'critical facilities', 'facilities technician', 'preventive maintenance', 'cmms',
      'maximo', 'lockout tagout', 'loto', 'mop', 'eop', 'nop', 'work order', 'on-call',
      'diesel generator', 'ups', 'ats', 'shift',
    ],
    dc: [
      'data center', 'dco', 'data center operator', 'liebert', 'vertiv', 'dcim', 'bms',
      'bas', 'power chain', 'critical systems', 'uptime', 'incident response',
      'change management', 'critical environment',
    ],
  },
}

// Impact-ranked suggestions per trade (top missing keywords to call out)
const TOP_IMPACT: Record<Trade, string[]> = {
  electrical: ['nfpa 70e', 'data center', 'commissioning', 'ups', 'switchgear', 'medium voltage'],
  hvac: ['epa 608', 'crac', 'data center', 'precision cooling', 'chilled water', 'vfd'],
  low_voltage: ['bicsi', 'data center', 'fiber optic', 'otdr', 'structured cabling', 'cross-connect'],
  construction: ['osha-30', 'data center', 'mep', 'commissioning', 'rfi', 'superintendent'],
  project_management: ['pmp', 'data center', 'commissioning', 'procore', 'integrated systems testing', 'mep coordination'],
  operations: ['mop', 'data center', 'cmms', 'dcim', 'critical facilities', 'preventive maintenance'],
}

function keywordPresent(text: string, keyword: string): boolean {
  // Simple substring match on lowercased text — sufficient for resume scanning
  return text.includes(keyword.toLowerCase())
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { resumeText, trade } = body as { resumeText?: string; trade?: string }

  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
    return NextResponse.json({ error: 'resumeText must be at least 50 characters' }, { status: 400 })
  }
  if (!trade || !VALID_TRADES.includes(trade as Trade)) {
    return NextResponse.json({ error: `trade must be one of: ${VALID_TRADES.join(', ')}` }, { status: 400 })
  }

  const t = trade as Trade
  const text = resumeText.toLowerCase()
  const allKeywords = [...KEYWORDS[t].foundational, ...KEYWORDS[t].dc]
  const unique = [...new Set(allKeywords)]

  const found: string[] = []
  const missing: string[] = []
  for (const kw of unique) {
    if (keywordPresent(text, kw)) found.push(kw)
    else missing.push(kw)
  }

  const score = Math.round((found.length / unique.length) * 100)

  // Build suggestions from top-impact missing keywords
  const impactMissing = TOP_IMPACT[t].filter(kw => missing.includes(kw)).slice(0, 5)
  const suggestionMap: Record<Trade, (kw: string) => string> = {
    electrical: kw => {
      if (kw === 'nfpa 70e') return "Add 'NFPA 70E' if you have arc flash safety training — it's required on most data center sites"
      if (kw === 'data center') return "Explicitly mention 'data center' in your experience sections — recruiters search this term directly"
      if (kw === 'commissioning') return "If you've participated in system startup or energization, call it 'commissioning' — it's a key DC term"
      if (kw === 'ups') return "List UPS brands you've worked with (Eaton, Vertiv, Liebert) — name-dropping specific equipment signals DC experience"
      if (kw === 'switchgear') return "Mention switchgear make/model if you have experience — data centers run on switchgear at scale"
      if (kw === 'medium voltage') return "If you've worked above 600V, state 'medium voltage' explicitly — it's a differentiator for DC work"
      return `Add '${kw}' to your resume if applicable`
    },
    hvac: kw => {
      if (kw === 'epa 608') return "List your EPA 608 certification — it's required for any refrigerant handling role"
      if (kw === 'crac') return "If you've worked with CRAC/CRAH units, name them explicitly — they're the core DC cooling equipment"
      if (kw === 'data center') return "Add 'data center' to any relevant experience — it signals specialized environment awareness"
      if (kw === 'precision cooling') return "Use 'precision cooling' when describing server room or critical facility HVAC work"
      if (kw === 'chilled water') return "If you have chilled water plant experience, emphasize it — hyperscale DC cooling runs on chilled water"
      if (kw === 'vfd') return "List VFD brands you've programmed or serviced — DC mechanical rooms rely heavily on variable frequency drives"
      return `Add '${kw}' to your resume if applicable`
    },
    low_voltage: kw => {
      if (kw === 'bicsi') return "BICSI RCDD or BICSI Installer certification significantly increases call-backs for DC cabling roles"
      if (kw === 'data center') return "Add 'data center' to relevant project descriptions — it's the primary search term recruiters use"
      if (kw === 'fiber optic') return "Specify fiber types (single-mode, multi-mode) and connector types (LC, MPO) you've terminated"
      if (kw === 'otdr') return "If you've done fiber testing with an OTDR, list it — it's a specific skill DC employers look for"
      if (kw === 'structured cabling') return "Use the term 'structured cabling' explicitly rather than just 'cabling' or 'wiring'"
      if (kw === 'cross-connect') return "Mention cross-connect work (MDA/HDA/EDA) if you've worked in data halls"
      return `Add '${kw}' to your resume if applicable`
    },
    construction: kw => {
      if (kw === 'osha-30') return "Add 'OSHA-30' prominently — most data center GCs require it on site"
      if (kw === 'data center') return "Add 'data center' to project descriptions — it immediately signals relevant experience"
      if (kw === 'mep') return "Use 'MEP' when describing coordination of mechanical, electrical, and plumbing scopes"
      if (kw === 'commissioning') return "If you've been involved in system startup, use the word 'commissioning' — DC GCs value this"
      if (kw === 'rfi') return "Mention RFI management explicitly if you've handled requests for information on projects"
      if (kw === 'superintendent') return "If you've led a crew or managed a scope, use 'superintendent' or 'general foreman' in your title"
      return `Add '${kw}' to your resume if applicable`
    },
    project_management: kw => {
      if (kw === 'pmp') return "PMP certification is explicitly listed on most DC PM job reqs — worth pursuing if you don't have it"
      if (kw === 'data center') return "Add 'data center' to project descriptions — it's the primary keyword for this niche"
      if (kw === 'commissioning') return "List commissioning phases you've managed — DC PMs are expected to understand Cx through IST"
      if (kw === 'procore') return "If you've used Procore or similar (Autodesk Construction Cloud, CMiC), list it explicitly"
      if (kw === 'integrated systems testing') return "Use 'Integrated Systems Testing (IST)' if you've coordinated final system acceptance testing"
      if (kw === 'mep coordination') return "Explicitly state 'MEP coordination' if you've managed mechanical, electrical, and plumbing trades"
      return `Add '${kw}' to your resume if applicable`
    },
    operations: kw => {
      if (kw === 'mop') return "Use 'MOP (Method of Procedure)' when describing planned maintenance or change activities"
      if (kw === 'data center') return "Add 'data center' to your work history — operators search this term first"
      if (kw === 'cmms') return "List the CMMS you've used (Maximo, Fiix, UpKeep, ServiceNow) — it signals operational maturity"
      if (kw === 'dcim') return "Mention any DCIM platforms (Nlyte, Sunbird, Vertiv) if you've used monitoring software"
      if (kw === 'critical facilities') return "Use 'critical facilities' as a descriptor for your work environment — it's the industry term"
      if (kw === 'preventive maintenance') return "Spell out 'preventive maintenance' (not just PM) at least once so keyword scans catch it"
      return `Add '${kw}' to your resume if applicable`
    },
  }

  const suggestions = impactMissing.length > 0
    ? impactMissing.map(kw => suggestionMap[t](kw))
    : ['Your resume covers the key data center keywords well. Consider adding specific equipment brands and project scale (MW, sq ft) to stand out further.']

  return NextResponse.json({ foundKeywords: found, missingKeywords: missing, score, suggestions })
}
