import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/account', '/dashboard', '/auth/'] },
    sitemap: 'https://voltgridjobs.com/sitemap.xml',
  }
}
