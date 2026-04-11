import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', marginTop: '4rem', paddingTop: '3rem', paddingBottom: '2.5rem' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
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
            <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
              The job board for trades workers powering the AI infrastructure boom.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--fg-faint)' }}>
              Job Seekers
            </h3>
            <ul className="space-y-2.5 text-sm" style={{ color: 'var(--fg-muted)' }}>
              <li><Link href="/jobs" className="hover:text-white transition-colors hover:opacity-80">Browse All Jobs</Link></li>
              <li><Link href="/jobs?category=electrical" className="hover:text-white transition-colors hover:opacity-80">Electrical Jobs</Link></li>
              <li><Link href="/jobs?category=hvac" className="hover:text-white transition-colors hover:opacity-80">HVAC Jobs</Link></li>
              <li><Link href="/jobs?category=low_voltage" className="hover:text-white transition-colors hover:opacity-80">Low Voltage Jobs</Link></li>
              <li><Link href="/companies" className="hover:text-white transition-colors hover:opacity-80">Companies Hiring</Link></li>
              <li><Link href="/resources" className="hover:text-white transition-colors hover:opacity-80">Career Resources</Link></li>
              <li>
                <Link href="/salary-guide" className="hover:text-white transition-colors hover:opacity-80" style={{ color: 'var(--yellow)' }}>
                  📊 2026 Salary Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--fg-faint)' }}>
              Employers
            </h3>
            <ul className="space-y-2.5 text-sm" style={{ color: 'var(--fg-muted)' }}>
              <li><Link href="/post-job" className="hover:text-white transition-colors hover:opacity-80">Post a Job</Link></li>
              <li><Link href="/employers" className="hover:text-white transition-colors hover:opacity-80">Why VoltGrid</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors hover:opacity-80">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors hover:opacity-80">About</Link></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }} className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs" style={{ color: 'var(--fg-faint)' }}>
            © {new Date().getFullYear()} VoltGrid Jobs. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://www.producthunt.com/products/voltgrid-jobs?utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-voltgrid-jobs"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                alt="VoltGrid Jobs - Job board for trades workers building AI infrastructure | Product Hunt"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1109224&theme=dark"
                width="200"
                height="43"
                style={{ width: '200px', height: '43px' }}
              />
            </a>
            <span className="text-xs" style={{ color: 'var(--fg-faint)' }}>
              Questions?{' '}
              <a href="mailto:hello@voltgridjobs.com" style={{ color: 'var(--fg-muted)' }} className="hover:text-white transition-colors hover:opacity-80">
                hello@voltgridjobs.com
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
