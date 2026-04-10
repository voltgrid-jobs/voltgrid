import { getLogoUrl, getDomain } from '@/lib/company-logos'

const CAROUSEL_COMPANIES = [
  'Syska Hennessy',
  'T5 Data Centers',
  'Serverfarm',
  'Oracle',
  'CoreWeave',
  'xAI',
  'BRPH',
  'EdgeConneX',
]

/**
 * Infinite-scrolling logo carousel. Pure CSS animation, no JS.
 * The track contains two copies of the logo set so translateX(-50%)
 * lands exactly on the second copy for a seamless loop.
 */
export function LogoCarousel({ label }: { label: string }) {
  const logos = CAROUSEL_COMPANIES.map((name) => ({
    name,
    logoUrl: getLogoUrl(name),
    domain: getDomain(name),
  }))

  // Duplicate the set so the -50% translate creates a seamless loop
  const doubled = [...logos, ...logos]

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
            {doubled.map((logo, i) => (
              <div
                key={`${logo.name}-${i}`}
                className="flex items-center justify-center shrink-0 px-8"
                style={{ height: '32px', minWidth: '140px' }}
                aria-hidden={i >= logos.length ? true : undefined}
              >
                {logo.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo.logoUrl}
                    alt={i < logos.length ? `${logo.name} logo` : ''}
                    width={120}
                    height={32}
                    loading="lazy"
                    style={{
                      maxHeight: '32px',
                      width: 'auto',
                      filter: 'grayscale(100%) brightness(1.6)',
                      opacity: 0.55,
                    }}
                  />
                ) : (
                  <span
                    className="text-sm font-semibold tracking-wide whitespace-nowrap"
                    style={{ color: '#6B7280' }}
                  >
                    {logo.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
