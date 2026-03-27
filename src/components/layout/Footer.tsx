import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-10 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="mb-3">
              <Image
                src="/logo-wordmark-transparent.png"
                alt="VoltGrid Jobs"
                width={233}
                height={36}
                className="h-8 w-auto"
                unoptimized
              />
            </div>
            <p className="text-gray-500 text-sm">
              The job board for trades workers powering the AI infrastructure boom.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-300 mb-3 text-sm uppercase tracking-wider">Job Seekers</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/jobs" className="hover:text-gray-300 transition-colors">Browse All Jobs</Link></li>
              <li><Link href="/jobs?category=electrical" className="hover:text-gray-300 transition-colors">Electrical Jobs</Link></li>
              <li><Link href="/jobs?category=hvac" className="hover:text-gray-300 transition-colors">HVAC Jobs</Link></li>
              <li><Link href="/jobs?category=low_voltage" className="hover:text-gray-300 transition-colors">Low Voltage Jobs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-300 mb-3 text-sm uppercase tracking-wider">Employers</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/post-job" className="hover:text-gray-300 transition-colors">Post a Job</Link></li>
              <li><Link href="/employers" className="hover:text-gray-300 transition-colors">Employer Info</Link></li>
              <li><Link href="/pricing" className="hover:text-gray-300 transition-colors">Pricing</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} VoltGrid Jobs. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
