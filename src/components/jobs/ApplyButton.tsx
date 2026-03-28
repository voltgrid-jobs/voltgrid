'use client'

interface ApplyButtonProps {
  jobId: string
  applyUrl: string
  isExternalUrl: boolean
  label?: string
  className?: string
  source?: string
}

export function ApplyButton({
  jobId,
  applyUrl,
  isExternalUrl,
  label = 'Apply Now →',
  className,
  source = 'top_button',
}: ApplyButtonProps) {
  const defaultClass =
    'inline-block bg-yellow-400 text-gray-950 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition-colors text-center'

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
      onClick={handleClick}
    >
      {label}
    </a>
  )
}
