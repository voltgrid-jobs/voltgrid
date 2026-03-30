import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#030712',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#facc15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}>
            ⚡
          </div>
          <span style={{ color: '#6b7280', fontSize: '20px', fontWeight: 600, letterSpacing: '0.01em' }}>
            voltgridjobs.com
          </span>
        </div>

        {/* Main text block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Primary headline */}
          <div style={{
            fontSize: '80px',
            fontWeight: 800,
            color: '#F0F0ED',
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
          }}>
            VoltGrid Jobs
          </div>

          {/* Secondary line */}
          <div style={{
            fontSize: '32px',
            fontWeight: 600,
            color: '#facc15',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}>
            Trades Jobs at Data Centers &amp; AI Sites
          </div>

          {/* Tertiary trades list */}
          <div style={{
            fontSize: '20px',
            fontWeight: 400,
            color: '#F0F0ED',
            opacity: 0.45,
            letterSpacing: '0.02em',
          }}>
            Electricians · HVAC · Low Voltage · Construction
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '24px',
        }}>
          <span style={{ color: '#facc15', fontSize: '18px', fontWeight: 500 }}>
            voltgridjobs.com
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
