import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VoltGrid Jobs — Data Center & AI Infrastructure Trades',
  description:
    'Find electrician, HVAC, low voltage, and construction jobs at data centers and AI infrastructure projects. The job board built for trades workers powering the AI boom.',
  keywords:
    'data center jobs, electrician jobs, HVAC jobs, low voltage technician, construction trades, AI infrastructure, hyperscale',
  openGraph: {
    title: 'VoltGrid Jobs',
    description: 'Trades jobs powering the AI infrastructure boom.',
    url: 'https://voltgridjobs.com',
    siteName: 'VoltGrid Jobs',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
