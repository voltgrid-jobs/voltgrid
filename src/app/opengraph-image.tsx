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
          background: '#0D0D0D',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Logo row — bolt icon + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: '#FACC15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            lineHeight: 1,
          }}>
            ⚡
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
            <span style={{
              color: '#F0F0ED',
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}>
              VoltGrid Jobs
            </span>
            <span style={{
              color: '#C0C0B8',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.02em',
            }}>
              voltgridjobs.com
            </span>
          </div>
        </div>

        {/* Main headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            fontSize: '76px',
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
          alignItems: 'flex-start',
          borderTop: '1px solid rgba(255,255,255,0.10)',
          paddingTop: '28px',
        }}>
          {[
            { value: '351 open roles', label: 'live today' },
            { value: '$45–85/hr', label: 'typical pay range' },
            { value: 'CoreWeave · xAI · T5', label: 'hiring now' },
          ].map((stat, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              flex: 1,
              borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.10)' : 'none',
              paddingLeft: i > 0 ? '36px' : '0',
            }}>
              <span style={{ color: '#FACC15', fontSize: '20px', fontWeight: 700 }}>{stat.value}</span>
              <span style={{ color: '#6B7280', fontSize: '13px', fontWeight: 400 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
