/**
 * Fuzzy location matching for job alert filters.
 *
 * Problem: the previous cron used a literal ILIKE against the raw
 * `jobs.location` string. A user who typed "Texas" got zero matches
 * because job listings store concrete cities like "Dallas, TX". Same
 * for "Northern Virginia" (jobs say "Ashburn, VA") and every other
 * state-level preference.
 *
 * Solution: expand the user-typed location into a set of equivalent
 * ILIKE patterns using a static state + region lookup, then OR them
 * together at the cron query level. This covers the 90% case: state
 * names, state codes, and the two regional aliases (NoVA, DFW) that
 * are baked into US data-center trades culture.
 *
 * Output is an array of sanitized substrings. Callers wrap them in
 * `%...%` for ILIKE. Duplicates are deduped case-insensitively.
 */

// State name → state code + known cities in that state where VoltGrid
// has or is likely to ingest data center roles. Extended as the ingest
// footprint grows. Keys are lowercased.
const STATE_LOOKUP: Record<string, { code: string; cities?: string[] }> = {
  alabama: { code: 'AL' },
  alaska: { code: 'AK' },
  arizona: { code: 'AZ', cities: ['Phoenix', 'Mesa', 'Goodyear', 'Chandler', 'Tempe'] },
  arkansas: { code: 'AR' },
  california: { code: 'CA', cities: ['Los Angeles', 'San Jose', 'Santa Clara', 'Sacramento'] },
  colorado: { code: 'CO', cities: ['Denver', 'Aurora'] },
  connecticut: { code: 'CT' },
  delaware: { code: 'DE' },
  florida: { code: 'FL', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'] },
  georgia: { code: 'GA', cities: ['Atlanta', 'Covington', 'Douglasville', 'Alpharetta'] },
  hawaii: { code: 'HI' },
  idaho: { code: 'ID' },
  illinois: { code: 'IL', cities: ['Chicago', 'Elk Grove', 'Franklin Park'] },
  indiana: { code: 'IN', cities: ['Indianapolis'] },
  iowa: { code: 'IA', cities: ['Des Moines', 'Council Bluffs'] },
  kansas: { code: 'KS' },
  kentucky: { code: 'KY' },
  louisiana: { code: 'LA' },
  maine: { code: 'ME' },
  maryland: { code: 'MD' },
  massachusetts: { code: 'MA', cities: ['Boston'] },
  michigan: { code: 'MI' },
  minnesota: { code: 'MN', cities: ['Minneapolis'] },
  mississippi: { code: 'MS' },
  missouri: { code: 'MO' },
  montana: { code: 'MT' },
  nebraska: { code: 'NE', cities: ['Omaha', 'Papillion'] },
  nevada: { code: 'NV', cities: ['Las Vegas', 'Reno'] },
  'new hampshire': { code: 'NH' },
  'new jersey': { code: 'NJ' },
  'new mexico': { code: 'NM' },
  'new york': { code: 'NY', cities: ['New York'] },
  'north carolina': { code: 'NC', cities: ['Charlotte', 'Raleigh'] },
  'north dakota': { code: 'ND' },
  ohio: { code: 'OH', cities: ['Columbus', 'New Albany', 'Hilliard'] },
  oklahoma: { code: 'OK' },
  oregon: { code: 'OR', cities: ['Portland', 'Hillsboro', 'Prineville'] },
  pennsylvania: { code: 'PA' },
  'rhode island': { code: 'RI' },
  'south carolina': { code: 'SC' },
  'south dakota': { code: 'SD' },
  tennessee: { code: 'TN', cities: ['Nashville', 'Memphis'] },
  texas: { code: 'TX', cities: ['Dallas', 'Fort Worth', 'Houston', 'San Antonio', 'Austin', 'Plano'] },
  utah: { code: 'UT', cities: ['Salt Lake City'] },
  vermont: { code: 'VT' },
  virginia: {
    code: 'VA',
    cities: ['Ashburn', 'Sterling', 'Leesburg', 'Reston', 'Manassas', 'Richmond'],
  },
  washington: { code: 'WA', cities: ['Seattle', 'Quincy', 'Redmond'] },
  'west virginia': { code: 'WV' },
  wisconsin: { code: 'WI' },
  wyoming: { code: 'WY', cities: ['Cheyenne'] },
}

// Reverse: state code → state name
const CODE_TO_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_LOOKUP).map(([name, info]) => [info.code.toLowerCase(), name])
)

// Regional aliases that a trades worker would recognise but aren't
// official state names. Values are arrays of patterns to expand to.
const REGION_ALIASES: Record<string, string[]> = {
  nova: ['Ashburn', 'Sterling', 'Loudoun', 'Prince William', 'Manassas', 'VA'],
  'northern virginia': ['Ashburn', 'Sterling', 'Loudoun', 'Prince William', 'Manassas', 'VA'],
  dfw: ['Dallas', 'Fort Worth', 'Plano', 'TX'],
  'dallas-fort worth': ['Dallas', 'Fort Worth', 'Plano', 'TX'],
  'dallas fort worth': ['Dallas', 'Fort Worth', 'Plano', 'TX'],
  dmv: ['Ashburn', 'Sterling', 'VA', 'MD', 'DC', 'Washington'],
  'bay area': ['San Francisco', 'Oakland', 'San Jose', 'Santa Clara', 'CA'],
  'silicon valley': ['San Jose', 'Santa Clara', 'Mountain View', 'Sunnyvale', 'CA'],
  'pacific northwest': ['Seattle', 'Portland', 'Hillsboro', 'WA', 'OR'],
  pnw: ['Seattle', 'Portland', 'Hillsboro', 'WA', 'OR'],
}

/**
 * Escape a substring for safe use inside a PostgREST .or() clause.
 * PostgREST uses commas as argument separators inside the .or string,
 * so any comma in the input would be interpreted as a boundary. We
 * replace commas and other unsafe chars with spaces — the resulting
 * pattern still matches the original because ILIKE ignores extra
 * whitespace in most practical cases.
 */
function sanitizeForIlike(s: string): string {
  return s.replace(/[,()*]/g, ' ').trim()
}

/**
 * Expand a user-typed location preference into a set of ILIKE substrings
 * that together cover the intended geographic scope.
 *
 * Examples:
 *   "Texas"            → ["texas", "TX", "Dallas", "Fort Worth", ...]
 *   "VA"               → ["VA", "virginia", "Ashburn", "Sterling", ...]
 *   "Phoenix"          → ["Phoenix"]
 *   "Northern Virginia"→ ["Northern Virginia", "Ashburn", "Sterling", "VA", ...]
 *   "NoVA"             → ["NoVA", "Ashburn", "Sterling", "VA", ...]
 *   "all"              → []   (no filter — matches everything)
 *   ""                 → []
 */
export function expandLocationPreference(input: string | null | undefined): string[] {
  if (!input) return []
  const trimmed = input.trim()
  if (!trimmed || trimmed.toLowerCase() === 'all') return []

  const lower = trimmed.toLowerCase()
  const patterns = new Set<string>()
  patterns.add(trimmed)

  // State name match
  if (STATE_LOOKUP[lower]) {
    patterns.add(STATE_LOOKUP[lower].code)
    for (const city of STATE_LOOKUP[lower].cities ?? []) patterns.add(city)
  }

  // State code match (case-insensitive; only for 2-char inputs to avoid false positives)
  if (trimmed.length === 2 && CODE_TO_STATE[lower]) {
    const stateName = CODE_TO_STATE[lower]
    patterns.add(stateName)
    patterns.add(trimmed.toUpperCase())
    for (const city of STATE_LOOKUP[stateName].cities ?? []) patterns.add(city)
  }

  // Regional alias match
  if (REGION_ALIASES[lower]) {
    for (const p of REGION_ALIASES[lower]) patterns.add(p)
  }

  // Sanitize each pattern and dedupe case-insensitively
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of patterns) {
    const clean = sanitizeForIlike(raw)
    if (!clean) continue
    const key = clean.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(clean)
  }
  return out
}

/**
 * Build a PostgREST `.or()` filter string that matches jobs.location
 * against any of the expanded patterns. Returns null if no filter
 * should be applied (empty input or 'all').
 *
 * Example output for input "Texas":
 *   location.ilike.%Texas%,location.ilike.%TX%,location.ilike.%Dallas%,...
 */
export function buildLocationOrFilter(input: string | null | undefined): string | null {
  const patterns = expandLocationPreference(input)
  if (patterns.length === 0) return null
  return patterns.map((p) => `location.ilike.%${p}%`).join(',')
}
