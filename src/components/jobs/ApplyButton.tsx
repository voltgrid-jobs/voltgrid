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
    // Fire-and-forget — do not block navigation
    fetch('/api/apply-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, source }),
    }).catch(() => {
      // Silently ignore — tracking should never break the apply flow
    })
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
