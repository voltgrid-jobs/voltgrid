'use client'

interface ApplyButtonProps {
  jobId: string
  applyUrl: string
  isExternalUrl: boolean
  label?: string
  className?: string
  style?: React.CSSProperties
  source?: string
}

export function ApplyButton({
  jobId,
  applyUrl,
  isExternalUrl,
  label = 'Apply Now →',
  className,
  style,
  source = 'top_button',
}: ApplyButtonProps) {
  const defaultClass = 'inline-block px-8 py-3 rounded-xl font-semibold transition-opacity text-center'
  const defaultStyle = { background: 'var(--yellow)', color: '#0A0A0A' }

  function handleClick() {
    // sendBeacon is reliable on page unload; fetch is dropped when the browser navigates away
    const payload = JSON.stringify({ job_id: jobId, source })
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/apply-click', new Blob([payload], { type: 'application/json' }))
    } else {
      // Fallback for environments without sendBeacon
      fetch('/api/apply-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    }
  }

  return (
    <a
      href={applyUrl}
      target={isExternalUrl ? '_blank' : undefined}
      rel="noopener noreferrer"
      className={className ?? defaultClass}
      style={style ?? defaultStyle}
      onClick={handleClick}
    >
      {label}
    </a>
  )
}
