/**
 * Maps company names (as stored in the DB) to their domain for logo resolution.
 * Logos fetched via Clearbit: https://logo.clearbit.com/{domain}
 * Usage: nominative fair use — shows logos only when company has active listings.
 */
export const COMPANY_DOMAINS: Record<string, string> = {
  // Legacy / ingested companies
  'Oracle': 'oracle.com',
  'Cologix': 'cologix.com',
  'Edgeconnex': 'edgeconnex.com',
  'EdgeConneX': 'edgeconnex.com',
  'CBRE': 'cbre.com',
  'Carrier': 'carrier.com',
  'Carrier Corporation': 'carrier.com',
  'Helix Electric': 'helixelectric.com',
  'Aerotek': 'aerotek.com',
  'Vertiv Group': 'vertiv.com',
  'Vertiv': 'vertiv.com',
  'ManpowerGroup': 'manpowergroup.com',
  'Manpower': 'manpower.com',
  'Accenture': 'accenture.com',
  'Insight Global': 'insightglobal.com',
  // New sources (Greenhouse/Lever expansion)
  'Syska Hennessy': 'syska.com',
  'T5 Data Centers': 't5datacenters.com',
  'Serverfarm': 'serverfarm.com',
  'CoreWeave': 'coreweave.com',
  'xAI': 'x.ai',
  'Neuralink': 'neuralink.com',
  'BRPH': 'brph.com',
  'Align': 'align.com',
  'Anthropic': 'anthropic.com',
  'Core Scientific': 'corescientific.com',
  'Aligned': 'aligned.com',
}

export function getLogoUrl(companyName: string): string | null {
  const domain = COMPANY_DOMAINS[companyName]
  if (!domain) return null
  return `https://logo.clearbit.com/${domain}`
}
