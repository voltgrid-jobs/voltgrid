'use client'
import { useState } from 'react'
import { CATEGORY_LABELS } from '@/types'

interface ApplyButtonProps {
  jobId: string
  applyUrl: string
  isExternalUrl: boolean
  label?: string
  className?: string
  style?: React.CSSProperties
  source?: string
  category?: string
  companyName?: string
  disableModal?: boolean
}

export function ApplyButton({
  jobId,
  applyUrl,
  isExternalUrl,
  label = 'Apply Now →',
  className,
  style,
  source = 'top_button',
  category,
  companyName,
  disableModal = false,
}: ApplyButtonProps) {
  const defaultClass = 'inline-block px-8 py-3 rounded-xl font-semibold transition-opacity hover:opacity-90 text-center'
  const defaultStyle = { background: 'var(--yellow)', color: '#0A0A0A' }

  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [modalLoading, setModalLoading] = useState(false)
  const [modalDone, setModalDone] = useState(false)

  function trackClick() {
    const payload = JSON.stringify({ job_id: jobId, source })
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/apply-click', new Blob([payload], { type: 'application/json' }))
    } else {
      fetch('/api/apply-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    }
  }

  function openApplyUrl() {
    window.open(applyUrl, '_blank', 'noopener,noreferrer')
  }

  function handleClick(e: React.MouseEvent) {
    trackClick()

    // Show modal only for external URLs with a known category,
    // and only if the user hasn't already signed up
    const alreadySignedUp =
      typeof localStorage !== 'undefined' &&
      localStorage.getItem('jobAlertSignedUp') === 'true'

    if (isExternalUrl && category && !alreadySignedUp && !disableModal) {
      e.preventDefault()
      setShowModal(true)
    }
    // Otherwise: let the <a> navigate normally
  }

  async function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return openAndClose()

    setModalLoading(true)
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, category, job_id: jobId }),
      })
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('jobAlertSignedUp', 'true')
      }
    } catch {
      // Non-fatal — still open the apply URL
    } finally {
      setModalLoading(false)
      setModalDone(true)
      setTimeout(() => {
        openApplyUrl()
        setShowModal(false)
      }, 800)
    }
  }

  function openAndClose() {
    openApplyUrl()
    setShowModal(false)
  }

  const tradeLabel = category
    ? (CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category)
    : 'trades'

  return (
    <>
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

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={e => { if (e.target === e.currentTarget) openAndClose() }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
          >
            {modalDone ? (
              <div className="text-center py-4">
                <p className="text-base font-semibold mb-1" style={{ color: 'var(--fg)' }}>You&apos;re on the list.</p>
                <p className="text-sm" style={{ color: 'var(--fg-faint)' }}>Opening the application...</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--yellow)' }}>
                  Before you go
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--fg)', lineHeight: 1.6 }}>
                  You&apos;re about to apply at <strong>{companyName || 'this employer'}</strong>.
                  Want alerts when similar <strong>{tradeLabel}</strong> roles open?
                </p>

                <form onSubmit={handleModalSubmit} className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--fg)',
                    }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={modalLoading || !email}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
                  >
                    {modalLoading ? 'Saving...' : 'Get alerts + Apply →'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={openAndClose}
                  className="w-full mt-2 py-2 text-xs transition-colors hover:opacity-80"
                  style={{ color: 'var(--fg-faint)' }}
                >
                  Skip and apply now
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
