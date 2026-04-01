import { createAdminClient } from '@/lib/supabase/admin'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://voltgridjobs.com'
  const supabase = createAdminClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, updated_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1000)

  const jobUrls: MetadataRoute.Sitemap = (jobs ?? []).map(job => ({
    url: `${baseUrl}/jobs/${job.id}`,
    lastModified: new Date(job.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categories = ['electrical', 'hvac', 'low_voltage', 'construction', 'project_management', 'operations']

  const tradeSlugs = [
    'electrician-jobs',
    'hvac-jobs',
    'low-voltage-jobs',
    'construction-jobs',
    'project-management-jobs',
    'operations-jobs',
  ]

  const locationSlugs = [
    'northern-virginia',
    'phoenix',
    'dallas',
    'chicago',
    'portland',
    'atlanta',
  ]

  const tradeUrls: MetadataRoute.Sitemap = tradeSlugs.map(slug => ({
    url: `${baseUrl}/trades/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const locationUrls: MetadataRoute.Sitemap = locationSlugs.map(slug => ({
    url: `${baseUrl}/locations/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // ── Hardcoded trade x location pages (canonical, always in sitemap) ─────
  const HARDCODED_TRADE_LOCATION_SLUGS = [
    'electrical-jobs-in-northern-virginia',
    'electrical-jobs-in-dallas',
    'electrical-jobs-in-phoenix',
    'electrical-jobs-in-atlanta',
    'electrical-jobs-in-chicago',
    'electrical-jobs-in-portland',
    'hvac-jobs-in-northern-virginia',
    'hvac-jobs-in-dallas',
    'hvac-jobs-in-phoenix',
    'hvac-jobs-in-atlanta',
    'hvac-jobs-in-chicago',
    'hvac-jobs-in-portland',
    'low-voltage-jobs-in-northern-virginia',
    'low-voltage-jobs-in-dallas',
    'low-voltage-jobs-in-phoenix',
    'low-voltage-jobs-in-atlanta',
    'low-voltage-jobs-in-chicago',
    'low-voltage-jobs-in-portland',
  ]

  const hardcodedTradeLocationUrls: MetadataRoute.Sitemap = HARDCODED_TRADE_LOCATION_SLUGS.map(slug => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  // ── Trade x Location programmatic pages ──────────────────────────────────
  const CATEGORY_TO_TRADE_SLUG: Partial<Record<string, string>> = {
    electrical: 'electrical',
    hvac: 'hvac',
    low_voltage: 'low-voltage',
    construction: 'construction',
    project_management: 'project-management',
    operations: 'operations',
  }

  let tradeLocationUrls: MetadataRoute.Sitemap = []
  try {
    const { data: comboJobs } = await supabase
      .from('jobs')
      .select('category, location')
      .eq('is_active', true)
      .not('location', 'is', null)
      .limit(5000)

    if (comboJobs) {
      const counts = new Map<string, number>()
      for (const job of comboJobs) {
        if (!job.category || !job.location) continue
        const key = `${job.category}|||${job.location}`
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
      const seen = new Set<string>()
      const topCombos = [...counts.entries()]
        .filter(([, n]) => n >= 2)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 60)

      for (const [key] of topCombos) {
        const [category, location] = key.split('|||')
        const tradeSlug = CATEGORY_TO_TRADE_SLUG[category]
        if (!tradeSlug) continue
        const locSlug = location.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const combined = `${tradeSlug}-jobs-in-${locSlug}`
        if (seen.has(combined)) continue
        seen.add(combined)
        tradeLocationUrls.push({
          url: `${baseUrl}/${combined}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        })
      }
    }
  } catch {
    // Table may not exist yet — skip
  }

  // ── Hire by Trade x Location employer pages ──────────────────────────────
  const HIRE_TRADE_SLUG: Partial<Record<string, string>> = {
    electrical: 'electricians',
    hvac: 'hvac-techs',
    low_voltage: 'low-voltage-techs',
    construction: 'construction-trades',
    project_management: 'project-managers',
    operations: 'operations-techs',
  }

  let hireTradLocationUrls: MetadataRoute.Sitemap = []
  try {
    const { data: hireJobs } = await supabase
      .from('jobs')
      .select('category, location')
      .eq('is_active', true)
      .not('location', 'is', null)
      .limit(5000)

    if (hireJobs) {
      const hireCounts = new Map<string, number>()
      for (const job of hireJobs) {
        if (!job.category || !job.location) continue
        const key = `${job.category}|||${job.location}`
        hireCounts.set(key, (hireCounts.get(key) ?? 0) + 1)
      }
      const hireSeeen = new Set<string>()
      const hireTopCombos = [...hireCounts.entries()]
        .filter(([, n]) => n >= 2)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 50)

      for (const [key] of hireTopCombos) {
        const [category, location] = key.split('|||')
        const tradeSlug = HIRE_TRADE_SLUG[category]
        if (!tradeSlug) continue
        const locSlug = location.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const combined = `${tradeSlug}-in-${locSlug}`
        if (hireSeeen.has(combined)) continue
        hireSeeen.add(combined)
        hireTradLocationUrls.push({
          url: `${baseUrl}/hire/${combined}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
  } catch {
    // non-fatal — skip
  }

  // ── Trade x Remote programmatic pages ────────────────────────────────────
  const TRADE_REMOTE_SLUGS: Partial<Record<string, string>> = {
    electrical: 'electrical',
    hvac: 'hvac',
    low_voltage: 'low-voltage',
    construction: 'construction',
    project_management: 'project-management',
    operations: 'operations',
  }

  let tradeRemoteUrls: MetadataRoute.Sitemap = []
  try {
    const { data: remoteJobs } = await supabase
      .from('jobs')
      .select('category')
      .eq('is_active', true)
      .eq('remote', true)

    if (remoteJobs) {
      const remoteCounts = new Map<string, number>()
      for (const job of remoteJobs) {
        if (!job.category) continue
        remoteCounts.set(job.category, (remoteCounts.get(job.category) ?? 0) + 1)
      }
      for (const [category, count] of remoteCounts.entries()) {
        if (count < 5) continue
        const tradeSlug = TRADE_REMOTE_SLUGS[category]
        if (!tradeSlug) continue
        tradeRemoteUrls.push({
          url: `${baseUrl}/remote/${tradeSlug}-remote-jobs`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.7,
        })
      }
    }
  } catch {
    // Table may not exist yet — skip
  }

  // ── Company pages ─────────────────────────────────────────────────────────
  let companyUrls: MetadataRoute.Sitemap = []
  try {
    // Try companies table first
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('slug, id')

    if (!companiesError && companies && companies.length > 0) {
      for (const company of companies) {
        const { count } = await supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('company_id', (company as { id: string; slug: string }).id)
        if ((count ?? 0) >= 3) {
          companyUrls.push({
            url: `${baseUrl}/companies/${(company as { id: string; slug: string }).slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          })
        }
      }
    } else {
      // Fallback: derive from jobs table
      const { data: companyJobs } = await supabase
        .from('jobs')
        .select('company_name')
        .eq('is_active', true)
        .not('company_name', 'is', null)
        .limit(5000)

      if (companyJobs) {
        const counts = new Map<string, number>()
        for (const job of companyJobs) {
          if (!job.company_name) continue
          counts.set(job.company_name, (counts.get(job.company_name) ?? 0) + 1)
        }
        for (const [name, count] of counts.entries()) {
          if (count >= 3) {
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
            companyUrls.push({
              url: `${baseUrl}/companies/${slug}`,
              lastModified: new Date(),
              changeFrequency: 'weekly',
              priority: 0.7,
            })
          }
        }
      }
    }
  } catch {
    // companies table may not exist yet — skip
  }

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/salary-guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/trades`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/locations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/employers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/post-job`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/break-into-data-center-work`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    ...categories.map(cat => ({
      url: `${baseUrl}/jobs?category=${cat}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...tradeUrls,
    ...locationUrls,
    ...hardcodedTradeLocationUrls,
    ...tradeLocationUrls,
    ...hireTradLocationUrls,
    ...tradeRemoteUrls,
    ...companyUrls,
    ...jobUrls,
  ]
}
