import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'img.logo.dev',
      },
    ],
  },
  async redirects() {
    // 301 redirects from /trades/{trade-jobs}/{city} → /{trade}-jobs-in-{city}
    // These static pages existed in commit 9b91479 but were never deployed.
    // /[tradeLocationSlug] is the canonical trade+location URL structure.
    const cities = ['northern-virginia', 'dallas', 'phoenix', 'atlanta', 'chicago', 'portland']
    const tradeMap: Record<string, string> = {
      'electrician-jobs': 'electrical',
      'hvac-jobs': 'hvac',
      'low-voltage-jobs': 'low-voltage',
      'operations-jobs': 'operations',
      'construction-jobs': 'construction',
      'project-management-jobs': 'project-management',
    }
    const rules = []
    for (const [tradeJobs, tradeSlug] of Object.entries(tradeMap)) {
      for (const city of cities) {
        rules.push({
          source: `/trades/${tradeJobs}/${city}`,
          destination: `/${tradeSlug}-jobs-in-${city}`,
          permanent: true,
        })
      }
    }
    return rules
  },
};

export default nextConfig;
