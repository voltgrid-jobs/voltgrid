import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

export default async function Image() {
  // Fetch logo as base64 at request time
  const logoRes = await fetch(new URL('/logo-wordmark-dark.png', 'https://voltgridjobs.com'))
  const logoBuffer = await logoRes.arrayBuffer()
  const logoBase64 = `data:image/png;base64,${Buffer.from(logoBuffer).toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0D0D0D',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoBase64}
          alt="VoltGrid Jobs"
          style={{ height: '52px', width: 'auto', objectFit: 'contain', objectPosition: 'left' }}
        />

        {/* Main text block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{
            fontSize: '72px',
            fontWeight: 800,
            color: '#F0F0ED',
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
          }}>
            Trades Jobs at<br />Data Centers &amp; AI Sites
          </div>

          <div style={{
            fontSize: '28px',
            fontWeight: 500,
            color: '#FACC15',
            lineHeight: 1.3,
          }}>
            Electricians · HVAC · Low Voltage · Construction
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.10)',
          paddingTop: '28px',
        }}>
          {[
            { value: '351', label: 'open roles' },
            { value: '$45–85/hr', label: 'typical pay' },
            { value: 'CoreWeave · xAI · T5', label: 'hiring now' },
          ].map((stat, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              flex: 1,
              borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.10)' : 'none',
              paddingLeft: i > 0 ? '32px' : '0',
            }}>
              <span style={{ color: '#FACC15', fontSize: '22px', fontWeight: 700 }}>{stat.value}</span>
              <span style={{ color: '#C0C0B8', fontSize: '14px', fontWeight: 400 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
