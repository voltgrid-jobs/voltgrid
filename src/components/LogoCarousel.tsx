'use client'

import { useState } from 'react'

const CAROUSEL_COMPANIES: { name: string; domain: string }[] = [
  { name: 'Syska Hennessy', domain: 'syska.com' },
  { name: 'T5 Data Centers', domain: 't5datacenters.com' },
  { name: 'Serverfarm', domain: 'serverfarm.com' },
  { name: 'Oracle', domain: 'oracle.com' },
  { name: 'CoreWeave', domain: 'coreweave.com' },
  { name: 'xAI', domain: 'x.ai' },
  { name: 'BRPH', domain: 'brph.com' },
  { name: 'EdgeConneX', domain: 'edgeconnex.com' },
]

function LogoItem({ name, domain, ariaHidden }: { name: string; domain: string; ariaHidden?: boolean }) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className="flex items-center justify-center shrink-0 px-8"
      style={{ height: '32px', minWidth: '140px' }}
      aria-hidden={ariaHidden || undefined}
    >
      {failed ? (
        <span
          className="text-sm font-semibold tracking-wide whitespace-nowrap"
          style={{ color: '#6B7280' }}
        >
          {name}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://logo.clearbit.com/${domain}`}
          alt={ariaHidden ? '' : `${name} logo`}
          height={28}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{
            height: '28px',
            width: 'auto',
            filter: 'grayscale(100%) brightness(1.8)',
            opacity: 0.55,
          }}
        />
      )}
    </div>
  )
}

/**
 * Infinite-scrolling logo carousel. Pure CSS animation, no JS for the scroll.
 * The track contains two copies of the logo set so translateX(-50%)
 * lands exactly on the second copy for a seamless loop.
 */
export function LogoCarousel({ label }: { label: string }) {
  // Duplicate the set so the -50% translate creates a seamless loop
  const doubled = [...CAROUSEL_COMPANIES, ...CAROUSEL_COMPANIES]

  return (
    <section
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-subtle)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
        <p
          className="text-xs uppercase tracking-widest mb-5 font-medium text-center"
          style={{ color: 'var(--fg-faint)' }}
        >
          {label}
        </p>
        <div className="logo-carousel-mask overflow-hidden">
          <div className="logo-carousel-track">
            {doubled.map((company, i) => (
              <LogoItem
                key={`${company.name}-${i}`}
                name={company.name}
                domain={company.domain}
                ariaHidden={i >= CAROUSEL_COMPANIES.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
