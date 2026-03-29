'use client'

import { useState } from 'react'

export function CompanyLogo({
  name,
  logoUrl,
  domain,
  showName = true,
}: {
  name: string
  logoUrl: string | null
  domain?: string | null
  showName?: boolean
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

  return (
    <div className="flex flex-col items-center gap-1.5">
      {src ? (
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
      ) : null}
      {showName && (
        <span className="text-xs font-medium" style={{ color: 'var(--fg-faint)' }}>
          {name}
        </span>
      )}
    </div>
  )
}
