'use client'

import { useState } from 'react'

export function CompanyLogo({
  name,
  logoUrl,
  domain,
}: {
  name: string
  logoUrl: string | null
  domain?: string | null
}) {
  const [src, setSrc] = useState<string | null>(logoUrl)
  const fallback = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null
  const [triedFallback, setTriedFallback] = useState(false)

  const handleError = () => {
    if (!triedFallback && fallback) {
      setSrc(fallback)
      setTriedFallback(true)
    } else {
      setSrc(null)
    }
  }

  if (!src) {
    return (
      <span className="text-sm font-semibold" style={{ color: 'var(--fg-muted)' }}>
        {name}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${name} logo`}
      style={{
        maxHeight: '28px',
        width: 'auto',
        filter: 'grayscale(100%) brightness(2)',
        opacity: 0.6,
      }}
      onError={handleError}
    />
  )
}
