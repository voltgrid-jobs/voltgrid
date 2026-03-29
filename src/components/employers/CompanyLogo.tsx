'use client'

import { useState } from 'react'

export function CompanyLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  const [imgFailed, setImgFailed] = useState(false)

  if (!logoUrl || imgFailed) {
    return (
      <span className="text-sm font-semibold" style={{ color: 'var(--fg-muted)' }}>
        {name}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={`${name} logo`}
      style={{ maxHeight: '32px', width: 'auto', filter: 'grayscale(100%) brightness(2)', opacity: 0.6 }}
      onError={() => setImgFailed(true)}
    />
  )
}
