/**
 * Extracts salary information from job description text as a fallback
 * when structured salary_min/salary_max fields are not available.
 */

function toHourly(annual: number): number {
  return Math.round(annual / 2080)
}

function fmtK(n: number): string {
  return `$${Math.round(n / 1000)}k`
}

function fmtHr(n: number): string {
  return `$${Math.round(n)}`
}

export function extractSalaryFromDescription(description: string): string | null {
  if (!description) return null
  const text = description.replace(/\n/g, ' ')

  // Hourly patterns
  const hourlyRange = text.match(
    /\$\s*([\d,]+(?:\.\d+)?)\s*(?:–|-|to)\s*\$?\s*([\d,]+(?:\.\d+)?)\s*(?:\/\s*hr|\/\s*hour|per\s+hour)/i
  )
  if (hourlyRange) {
    const lo = parseFloat(hourlyRange[1].replace(/,/g, ''))
    const hi = parseFloat(hourlyRange[2].replace(/,/g, ''))
    if (lo >= 10 && lo <= 500 && hi >= 10 && hi <= 500) {
      return `${fmtHr(lo)}–${fmtHr(hi)}/hr`
    }
  }

  const hourlySingle = text.match(
    /\$\s*([\d,]+(?:\.\d+)?)\s*(?:\/\s*hr|\/\s*hour|per\s+hour)/i
  )
  if (hourlySingle) {
    const val = parseFloat(hourlySingle[1].replace(/,/g, ''))
    if (val >= 10 && val <= 500) return `${fmtHr(val)}/hr`
  }

  // Annual patterns — convert to hourly
  const annualRange = text.match(
    /\$\s*([\d,]+)\s*(?:–|-|to)\s*\$?\s*([\d,]+)\s*(?:\/\s*yr|\/\s*year|per\s+year|annually)?/i
  )
  if (annualRange) {
    const lo = parseFloat(annualRange[1].replace(/,/g, ''))
    const hi = parseFloat(annualRange[2].replace(/,/g, ''))
    // Must look like annual (> 10k) not hourly already matched
    if (lo >= 20000 && lo <= 2000000 && hi >= 20000 && hi <= 2000000) {
      const loHr = toHourly(lo)
      const hiHr = toHourly(hi)
      return `~${fmtHr(loHr)}–${fmtHr(hiHr)}/hr (${fmtK(lo)}–${fmtK(hi)}/yr)`
    }
  }

  const annualSingle = text.match(
    /\$\s*([\d,]+)\s*(?:\/\s*yr|\/\s*year|per\s+year|annually|\s+(?:a|per)\s+year)/i
  )
  if (annualSingle) {
    const val = parseFloat(annualSingle[1].replace(/,/g, ''))
    if (val >= 20000 && val <= 2000000) {
      return `~${fmtHr(toHourly(val))}/hr (${fmtK(val)}/yr)`
    }
  }

  // k-shorthand: $85k-$120k
  const kRange = text.match(/\$([\d.]+)k\s*(?:–|-|to)\s*\$([\d.]+)k/i)
  if (kRange) {
    const lo = parseFloat(kRange[1]) * 1000
    const hi = parseFloat(kRange[2]) * 1000
    if (lo >= 20000 && hi <= 2000000) {
      return `~${fmtHr(toHourly(lo))}–${fmtHr(toHourly(hi))}/hr (${fmtK(lo)}–${fmtK(hi)}/yr)`
    }
  }

  return null
}
