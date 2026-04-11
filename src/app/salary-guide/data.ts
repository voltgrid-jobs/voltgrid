/**
 * Salary guide data — single source of truth for all compensation numbers
 * on /salary-guide and /salary-calculator.
 *
 * Sources (see the Methodology section of the guide):
 *   1. VoltGrid job listings database — 66+ salary-bearing rows with
 *      location, role, and hourly/annual rate fields.
 *   2. Publicly listed IBEW and UA local wage scales for data center
 *      markets where a union agreement applies.
 *   3. US BLS Occupational Employment and Wage Statistics — electrician
 *      (SOC 47-2111) and HVAC mechanic (SOC 49-9021) state-level data.
 *   4. Public data center project announcements with stated staffing
 *      or labor counts.
 *
 * Every numeric range below is the minimum defensible band we can point
 * a reader at. If a source says $48 and another says $56 for the same
 * role/market, the range is $48–$56 and we note the spread in prose.
 * We deliberately do NOT extrapolate beyond observed data points.
 */

export type SalaryUnit = 'hr' | 'yr'

export interface MarketRow {
  market: string
  role: string
  low: number
  high: number
  unit: SalaryUnit
  note?: string
}

export interface CompensationComponent {
  component: string
  typical: string
  notes: string
}

export interface RoleTaxonomy {
  phase: 'Construction' | 'Commissioning' | 'Operations'
  roles: {
    title: string
    responsibility: string
    typicalPay: string
    certifications: string
  }[]
}

// ── Regional pay bands ────────────────────────────────────────────────

export const ELECTRICIAN_MARKETS: MarketRow[] = [
  {
    market: 'Northern Virginia (Loudoun / Prince William)',
    role: 'Journeyman Electrician — data center build',
    low: 42,
    high: 58,
    unit: 'hr',
    note: 'Ashburn / Sterling corridor carries a 10–15% premium over other NoVA sub-markets',
  },
  {
    market: 'Northern Virginia',
    role: 'Master Electrician / Foreman',
    low: 55,
    high: 78,
    unit: 'hr',
    note: 'Commissioning-capable foremen anchor the top of the band',
  },
  {
    market: 'Phoenix / Goodyear / Mesa',
    role: 'Journeyman Electrician',
    low: 38,
    high: 52,
    unit: 'hr',
  },
  {
    market: 'Phoenix / Goodyear / Mesa',
    role: 'Master Electrician / Foreman',
    low: 50,
    high: 68,
    unit: 'hr',
  },
  {
    market: 'Dallas / Fort Worth',
    role: 'Journeyman Electrician',
    low: 36,
    high: 48,
    unit: 'hr',
  },
  {
    market: 'Dallas / Fort Worth',
    role: 'Master Electrician / Foreman',
    low: 48,
    high: 65,
    unit: 'hr',
  },
  {
    market: 'Houston / San Antonio',
    role: 'Journeyman Electrician',
    low: 32,
    high: 47,
    unit: 'hr',
    note: 'Widest observed spread — strong correlation with project size',
  },
  {
    market: 'Houston',
    role: 'Superintendent — data center electrical',
    low: 120000,
    high: 180000,
    unit: 'yr',
  },
  {
    market: 'Atlanta / Covington',
    role: 'Journeyman Electrician',
    low: 30,
    high: 42,
    unit: 'hr',
  },
  {
    market: 'Atlanta / Covington',
    role: 'Master Electrician / Foreman',
    low: 42,
    high: 58,
    unit: 'hr',
  },
  {
    market: 'Columbus / central Ohio',
    role: 'Journeyman Electrician',
    low: 34,
    high: 48,
    unit: 'hr',
    note: 'Intel + Microsoft buildout driving rates up faster than national average',
  },
  {
    market: 'Columbus / central Ohio',
    role: 'Construction Superintendent',
    low: 160000,
    high: 200000,
    unit: 'yr',
  },
  {
    market: 'Chicago (IBEW Local 134)',
    role: 'Journeyman Electrician',
    low: 52,
    high: 66,
    unit: 'hr',
    note: 'Union scale — includes H&W and pension contributions, not raw paycheck',
  },
  {
    market: 'Chicago (IBEW Local 134)',
    role: 'Foreman / General Foreman',
    low: 62,
    high: 82,
    unit: 'hr',
    note: 'Union scale — see rate card for current package breakdown',
  },
  {
    market: 'National — travel / commissioning',
    role: 'Commissioning Electrician',
    low: 55,
    high: 85,
    unit: 'hr',
    note: 'Base rate only — add per diem and travel pay on top',
  },
]

export const HVAC_MARKETS: MarketRow[] = [
  {
    market: 'Northern Virginia',
    role: 'Data Center HVAC Technician',
    low: 40,
    high: 58,
    unit: 'hr',
    note: 'CRAC / CRAH / chilled-water experience required for top of band',
  },
  {
    market: 'Northern Virginia',
    role: 'Commissioning HVAC Engineer',
    low: 50,
    high: 72,
    unit: 'hr',
  },
  {
    market: 'Phoenix / Mesa',
    role: 'Data Center HVAC Technician',
    low: 35,
    high: 50,
    unit: 'hr',
  },
  {
    market: 'Dallas / Fort Worth',
    role: 'Data Center HVAC Technician',
    low: 32,
    high: 46,
    unit: 'hr',
  },
  {
    market: 'Chicago (UA Local 597)',
    role: 'Data Center HVAC Technician',
    low: 48,
    high: 66,
    unit: 'hr',
    note: 'Union scale — package includes benefits, not raw paycheck',
  },
  {
    market: 'Atlanta / Covington',
    role: 'Data Center HVAC Technician',
    low: 28,
    high: 42,
    unit: 'hr',
  },
  {
    market: 'Columbus / central Ohio',
    role: 'Data Center HVAC Technician',
    low: 32,
    high: 46,
    unit: 'hr',
  },
  {
    market: 'National — travel / commissioning',
    role: 'HVAC Commissioning Technician',
    low: 50,
    high: 72,
    unit: 'hr',
    note: 'Includes per diem add-ons; see compensation components',
  },
]

// ── Secondary sections (Low Voltage + Construction) ─────────────────

export const LOW_VOLTAGE_MARKETS: MarketRow[] = [
  {
    market: 'Northern Virginia',
    role: 'Low Voltage Technician — structured cabling',
    low: 30,
    high: 46,
    unit: 'hr',
  },
  {
    market: 'Northern Virginia',
    role: 'BMS / DCIM Specialist',
    low: 45,
    high: 65,
    unit: 'hr',
    note: 'Demand accelerating with AI buildout',
  },
  {
    market: 'Phoenix / Dallas',
    role: 'Low Voltage Technician',
    low: 25,
    high: 40,
    unit: 'hr',
  },
  {
    market: 'National',
    role: 'Fiber Splicing Specialist',
    low: 35,
    high: 55,
    unit: 'hr',
  },
]

export const CONSTRUCTION_MARKETS: MarketRow[] = [
  {
    market: 'Northern Virginia',
    role: 'Site Superintendent',
    low: 120000,
    high: 175000,
    unit: 'yr',
  },
  {
    market: 'Columbus / OH',
    role: 'Construction Superintendent',
    low: 160000,
    high: 200000,
    unit: 'yr',
  },
  {
    market: 'Houston',
    role: 'Project Manager',
    low: 90000,
    high: 140000,
    unit: 'yr',
  },
  {
    market: 'National — travel',
    role: 'Hyperscale Construction PM',
    low: 150000,
    high: 230000,
    unit: 'yr',
  },
]

// ── Compensation components ───────────────────────────────────────────

export const COMPENSATION_COMPONENTS: CompensationComponent[] = [
  {
    component: 'Base hourly rate',
    typical: '$30–$85/hr',
    notes:
      'The number recruiters quote first. Sets your floor but rarely your take-home.',
  },
  {
    component: 'Guaranteed hours',
    typical: '40–60 hrs/week',
    notes:
      'Data center projects are deadline-driven. Many roles guarantee 50 or 55 hours — anything under 50 guaranteed is a red flag on a live build.',
  },
  {
    component: 'Overtime multiplier',
    typical: '1.5× base over 40 hrs',
    notes:
      'Sometimes 2× over 50 or on weekends. Read the offer — the difference between 1.5× and 2× on a 55-hour week is real money.',
  },
  {
    component: 'Per diem',
    typical: '$75–$150/day',
    notes:
      'Paid on travel projects to cover lodging and meals. Normally tax-free if you meet IRS accountable-plan rules. Ask if it is paid every day or only on work days.',
  },
  {
    component: 'Travel pay',
    typical: '$500–$1,200/week',
    notes:
      'Flights, mileage, and transit between home and site. Some employers pay a flat weekly stipend, others reimburse actuals. Flat pays more when you drive.',
  },
  {
    component: 'Shift differential',
    typical: '+10% to +20%',
    notes:
      'For night, rotating, or 4×10 shifts. Commissioning work often runs 12-hour night shifts for weeks — the differential is the whole reason to take it.',
  },
  {
    component: 'Completion / retention bonus',
    typical: '$2,500–$15,000',
    notes:
      'Paid if you stay through project close or critical-path milestone. Common on hyperscale builds where contractor turnover kills schedule.',
  },
  {
    component: 'Per diem on days off',
    typical: '$0 or full rate',
    notes:
      'Big swing factor on an 8-week project. Rotations of 7-days-on / 7-days-off with per diem paid every day are the highest effective pay structure in trades.',
  },
]

// ── Role taxonomy ─────────────────────────────────────────────────────

export const ELECTRICIAN_TAXONOMY: RoleTaxonomy[] = [
  {
    phase: 'Construction',
    roles: [
      {
        title: 'Journeyman Electrician — rough-in',
        responsibility:
          'Conduit, cable tray, pulling feeders, rough-in to panels. Highest volume of hours on any project.',
        typicalPay: '$36–$58/hr base',
        certifications: 'State Journeyman license, OSHA 10/30',
      },
      {
        title: 'Journeyman Electrician — terminations',
        responsibility:
          'Panel, switchgear, and PDU terminations. Higher pay because a bad termination is a failed witness test.',
        typicalPay: '$40–$62/hr base',
        certifications: 'State Journeyman, NFPA 70E, manufacturer-specific torque training',
      },
      {
        title: 'Foreman / General Foreman',
        responsibility:
          'Crews of 10–40 electricians, daily planning, interface with PM and GC.',
        typicalPay: '$55–$82/hr base',
        certifications: 'State Master, OSHA 30, supervisor-level NFPA 70E',
      },
    ],
  },
  {
    phase: 'Commissioning',
    roles: [
      {
        title: 'Commissioning Electrician',
        responsibility:
          'Point-to-point verification, meggering, torque audits, witness test prep. Works 12-hour shifts through level 3–5 testing.',
        typicalPay: '$55–$85/hr base + per diem',
        certifications: 'NFPA 70E, CxA-familiar, manufacturer training for UPS/switchgear lines',
      },
      {
        title: 'Integrated Systems Test (IST) Lead',
        responsibility:
          'Coordinates scripts that simultaneously hit electrical, mechanical, BMS, and fire systems. The roof of the commissioning pyramid.',
        typicalPay: '$70–$110/hr or $180k–$240k/yr',
        certifications: 'Master electrician, multi-year DC commissioning experience, often CxA-ACG',
      },
    ],
  },
  {
    phase: 'Operations',
    roles: [
      {
        title: 'Critical Facility Electrician',
        responsibility:
          'Permanent site staff. Daily rounds, preventive maintenance on UPS, switchgear, generators. On-call rotation for emergency response.',
        typicalPay: '$42–$70/hr base or $90k–$145k/yr',
        certifications: 'State Journeyman or Master, NFPA 70E, NETA familiarity helpful',
      },
      {
        title: 'Electrical Operations Manager',
        responsibility:
          'Runs the electrical side of a single data center campus. Budgets, vendor management, compliance, incident response.',
        typicalPay: '$130k–$210k/yr',
        certifications: 'State Master, 7+ years DC operations, BS helpful not required',
      },
    ],
  },
]

export const HVAC_TAXONOMY: RoleTaxonomy[] = [
  {
    phase: 'Construction',
    roles: [
      {
        title: 'Data Center HVAC Installer',
        responsibility:
          'CRAC / CRAH / chilled water piping and ductwork install, rigging cooling units, connecting to BMS wiring.',
        typicalPay: '$30–$52/hr base',
        certifications: 'EPA 608 Universal, state HVAC license where required, OSHA 10',
      },
      {
        title: 'Piping Foreman',
        responsibility:
          'Runs the chilled water and condenser water install crews. Coordinates with electrical and structural.',
        typicalPay: '$48–$72/hr base',
        certifications: 'Journeyman-level mechanical, OSHA 30',
      },
    ],
  },
  {
    phase: 'Commissioning',
    roles: [
      {
        title: 'Commissioning HVAC Technician',
        responsibility:
          'Air balance, TAB, witness testing of CRAC/CRAH operation, valve stroke tests, flushing chilled-water loops.',
        typicalPay: '$50–$72/hr base + per diem',
        certifications: 'EPA 608 Universal, NEBB or AABC TAB cert for balancing, DDC controls familiarity',
      },
      {
        title: 'BMS Commissioning Specialist',
        responsibility:
          'Validates every sequence of operation in the building management system — failover, setpoint response, alarm logic.',
        typicalPay: '$55–$90/hr base',
        certifications: 'Controls-specific (Niagara, Metasys, Desigo), PE not required but often preferred',
      },
    ],
  },
  {
    phase: 'Operations',
    roles: [
      {
        title: 'Critical Facility HVAC Technician',
        responsibility:
          'Site staff. PMs on CRAC/CRAH units, chiller plant, humidification, leak response, on-call rotation.',
        typicalPay: '$38–$62/hr base or $85k–$130k/yr',
        certifications: 'EPA 608 Universal, manufacturer-specific chiller training (Trane, Carrier, York)',
      },
      {
        title: 'Mechanical Operations Manager',
        responsibility:
          'Owns the mechanical plant across one or more buildings on a campus. Vendor contracts, capacity planning, refrigerant compliance.',
        typicalPay: '$125k–$195k/yr',
        certifications: 'EPA 608 Universal, 7+ years in mission-critical mechanical, often BS Mech or ME',
      },
    ],
  },
]

// ── FAQ content (also feeds FAQPage schema) ──────────────────────────

export interface FAQ {
  q: string
  a: string
}

export const SALARY_FAQS: FAQ[] = [
  {
    q: 'How much do data center electricians make in 2026?',
    a: 'Data center electricians in the US earn between $30 and $85 per hour base rate in 2026, depending on role, market, and union status. Journeyman electricians on construction phases typically earn $36 to $58 per hour. Commissioning electricians earn $55 to $85 per hour plus per diem. Critical facility electricians in permanent operations roles earn $42 to $70 per hour or $90,000 to $145,000 per year. Northern Virginia, Chicago union, and travel commissioning work sit at the top of these ranges. Atlanta and secondary Texas markets sit at the bottom.',
  },
  {
    q: 'How much do data center HVAC technicians make in 2026?',
    a: 'Data center HVAC technicians earn between $28 and $90 per hour base rate in 2026. Construction-phase installers earn $30 to $52 per hour. Commissioning HVAC technicians earn $50 to $72 per hour plus per diem on travel projects. BMS commissioning specialists earn $55 to $90 per hour. Critical facility HVAC technicians in permanent operations earn $38 to $62 per hour or $85,000 to $130,000 per year. CRAC/CRAH and chilled-water experience is the biggest rate multiplier — general commercial HVAC experience does not automatically transfer.',
  },
  {
    q: 'Which US market pays data center trades workers the most?',
    a: 'Northern Virginia (Loudoun and Prince William counties) and the Chicago union market (IBEW Local 134 and UA Local 597) pay the highest base rates for permanent data center trades work. National travel commissioning roles pay the most in total compensation because base rate ($55 to $85 per hour) stacks with per diem ($75 to $150 per day) and travel pay ($500 to $1,200 per week). An electrician on a 10-week travel commissioning job in NoVA can clear $45,000 to $65,000 for that single project.',
  },
  {
    q: 'Do I need a union card to work on data center projects?',
    a: 'No. Most data center construction in the US South and West (Phoenix, Dallas, Atlanta, Houston, Virginia outside the DC Metro) is non-union or open-shop. Union work dominates in Chicago, the Pacific Northwest, and parts of the Northeast. In markets where union and non-union both operate, union rates are typically 20 to 35 percent higher before accounting for health and welfare and pension contributions. The raw paycheck differential is smaller because union wage scales include benefits contributions that non-union workers receive separately.',
  },
  {
    q: 'How do per diem and travel pay actually work in data center trades?',
    a: 'Per diem is a daily allowance paid to cover lodging and meals when you work away from your home tax residence. Typical data center per diem rates run $75 to $150 per day, paid under an IRS accountable plan so the employer does not report it as taxable wages. Travel pay covers flights, mileage, and transit — it is either a flat weekly stipend ($500 to $1,200) or reimbursement of actual expenses. The question to ask at offer stage is whether per diem is paid every day or only on days you actually work. The difference over a 10-week project is $4,500 to $9,000.',
  },
  {
    q: 'What is the difference between construction, commissioning, and operations roles?',
    a: 'Construction roles install the physical infrastructure before a data center goes live. Commissioning roles validate that every system works as designed — this is specialized, high-paid, short-duration work that ends when the building hands over to the client. Operations roles are permanent site staff who run the facility day-to-day after handover, doing preventive maintenance and responding to incidents. Construction is the highest volume of hours, commissioning has the highest hourly rate plus per diem, operations has the most stable schedule and benefits.',
  },
  {
    q: 'What certifications move a trades worker from a regular job to a data center job?',
    a: 'For electricians: NFPA 70E arc flash (mandatory on most data center sites), OSHA 10 or 30, and manufacturer training on the specific UPS and switchgear brands used on the project (Eaton, Schneider, ABB, Vertiv). For HVAC: EPA 608 Universal, NEBB or AABC TAB certification for commissioning, and DDC/BMS controls familiarity (Niagara, Metasys, Desigo). A state Journeyman or Master license is the baseline — data center sites do not take the place of a license, they stack on top.',
  },
  {
    q: 'How was this salary guide compiled?',
    a: 'Every band is anchored in at least one of four sources: VoltGrid job listings with disclosed salary fields, publicly listed IBEW or UA union wage scales for markets with active agreements, BLS Occupational Employment and Wage Statistics for electricians (SOC 47-2111) and HVAC mechanics (SOC 49-9021) at the state level, and publicly announced data center projects with stated staffing counts. Where sources disagreed, the band covers the full spread and we note the disagreement in prose. We do not extrapolate beyond observed data. The full methodology, including limitations, is in the Methodology section of this page.',
  },
  {
    q: 'Are these numbers for 2026 or an older year?',
    a: 'Every band on this page reflects pay observed in the January to April 2026 window. Data center trades rates have moved faster than general trades wages for the past three years because of the AI infrastructure buildout, so older guides (2024 and earlier) are likely to understate current pay, especially in Columbus, Phoenix, and Northern Virginia. We refresh the page quarterly and date every update at the top.',
  },
  {
    q: 'Why does this guide only cover electricians and HVAC techs?',
    a: 'These are the two trades most directly tied to data center infrastructure — electrical power distribution and precision cooling are the two systems that define whether a building can run a hyperscale workload. Low voltage, controls, and construction management also matter, and we include supporting pay bands at the bottom of this guide for completeness, but the primary focus is on the two roles with the deepest demand signal and the highest rate compression.',
  },
]
