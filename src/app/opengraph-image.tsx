import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#000000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <span style={{ fontSize: '48px', lineHeight: 1 }}>⚡</span>
          <span style={{
            color: '#ffffff',
            fontSize: '52px',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            VoltGrid Jobs
          </span>
        </div>

        {/* Primary headline */}
        <div style={{
          fontSize: '68px',
          fontWeight: 700,
          color: '#FACC15',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          marginBottom: '28px',
        }}>
          Trades Jobs at Data Centers &amp; AI Sites
        </div>

        {/* Trades list */}
        <div style={{
          fontSize: '28px',
          fontWeight: 400,
          color: '#ffffff',
          letterSpacing: '0.01em',
          opacity: 0.6,
        }}>
          Electricians · HVAC · Low Voltage · Construction
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
