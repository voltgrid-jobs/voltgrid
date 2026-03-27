import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://voltgridjobs.com'),
  title: {
    default: 'VoltGrid Jobs — Data Center & AI Infrastructure Trades',
    template: '%s — VoltGrid Jobs',
  },
  description:
    'Find electrician, HVAC, low voltage, and construction jobs at data centers and AI infrastructure projects. The job board built for trades workers powering the AI boom.',
  keywords:
    'data center jobs, electrician jobs, HVAC jobs, low voltage technician, construction trades, AI infrastructure, hyperscale, data center electrician, HVAC technician hiring',
  authors: [{ name: 'VoltGrid Jobs', url: 'https://voltgridjobs.com' }],
  openGraph: {
    title: 'VoltGrid Jobs — Data Center & AI Infrastructure Trades',
    description: 'Electrician, HVAC, and low voltage jobs at data centers and AI infrastructure sites. Find high-paying trades roles powering the AI boom.',
    url: 'https://voltgridjobs.com',
    siteName: 'VoltGrid Jobs',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://voltgridjobs.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VoltGrid Jobs — Trades Jobs at Data Centers & AI Sites',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoltGrid Jobs',
    description: 'Trades jobs powering the AI infrastructure boom.',
    site: '@voltgridjobs',
    images: ['https://voltgridjobs.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: {
    google: 'kxEivUYz_8VjIEZuK3WDKxgEYrs6g9Le44fiWMyGoD0',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
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
