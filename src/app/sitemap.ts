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

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/salary-guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/trades`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/locations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/employers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/post-job`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...categories.map(cat => ({
      url: `${baseUrl}/jobs?category=${cat}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...tradeUrls,
    ...locationUrls,
    ...jobUrls,
  ]
}
