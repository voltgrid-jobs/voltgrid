import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Center Trades Resume Analyzer — VoltGrid Jobs',
  description: 'Free tool: paste your resume and see which data center keywords are missing. Optimized for electricians, HVAC techs, and low voltage specialists.',
  alternates: { canonical: 'https://voltgridjobs.com/tools/resume-analyzer' },
  openGraph: {
    title: 'Data Center Trades Resume Analyzer — VoltGrid Jobs',
    description: 'Free tool: paste your resume and see which data center keywords are missing.',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
