'use client'

import { useState } from 'react'

type Company = { name: string; src: string }

const CAROUSEL_COMPANIES: Company[] = [
  { name: 'Syska Hennessy', src: '/logos/syska-hennessy.png' },
  { name: 'T5 Data Centers', src: '/logos/t5-data-centers.png' },
  { name: 'Serverfarm', src: '/logos/serverfarm.svg' },
  { name: 'Oracle', src: '/logos/oracle.svg' },
  { name: 'CoreWeave', src: '/logos/coreweave.png' },
  { name: 'xAI', src: '/logos/xai.svg' },
  { name: 'BRPH', src: '/logos/brph.png' },
  { name: 'EdgeConneX', src: '/logos/edgeconnex.svg' },
]

function LogoItem({ name, src, ariaHidden }: { name: string; src: string; ariaHidden?: boolean }) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className="flex items-center justify-center shrink-0 px-10 sm:px-14"
      style={{ height: '40px', minWidth: '160px' }}
      aria-hidden={ariaHidden || undefined}
    >
      {failed ? (
        <span
          className="text-base font-semibold tracking-wide whitespace-nowrap"
          style={{ color: '#6B7280' }}
        >
          {name}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={ariaHidden ? '' : `${name} logo`}
          height={40}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{
            height: '40px',
            width: 'auto',
            maxWidth: '180px',
            objectFit: 'contain',
            // Flatten any colored logo to pure white, then dim slightly
            filter: 'brightness(0) invert(1)',
            opacity: 0.75,
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <p
          className="text-xs uppercase tracking-widest mb-7 font-medium text-center"
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
                src={company.src}
                ariaHidden={i >= CAROUSEL_COMPANIES.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
