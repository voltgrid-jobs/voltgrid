import type { Metadata } from 'next'
import { SalaryGuideClient } from './SalaryGuideClient'

export const metadata: Metadata = {
  title: '2026 Data Center Trades Salary Guide',
  description:
    'Real pay data for electricians, HVAC techs, and low-voltage specialists at data centers and AI infrastructure sites. Free salary report covering 6 US markets.',
  alternates: { canonical: 'https://voltgridjobs.com/salary-guide' },
  openGraph: {
    title: '2026 Data Center Trades Salary Guide',
    description:
      'Real compensation data for data center electricians, HVAC techs, and low-voltage specialists across Northern Virginia, Phoenix, Dallas, Chicago, and more.',
    type: 'article',
  },
}

export default function SalaryGuidePage() {
  return <SalaryGuideClient />
}
