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
    ...tradeLocationUrls,
    ...jobUrls,
  ]
}
