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
  const LOGO_DEV_TOKEN = 'pk_X7dkMEXSRsKNpe1kuk7uHA'
  const logoDevUrl = domain ? `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}` : logoUrl
  const [src, setSrc] = useState<string | null>(logoDevUrl ?? logoUrl)

  const handleError = () => {
    setSrc(null)
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${name} logo`}
          width={100}
          height={28}
          loading="lazy"
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
