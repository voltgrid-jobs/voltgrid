import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

function formatSalary(min?: number, max?: number, period = 'year'): string | null {
  if (!min && !max) return null
  const isHourly = period === 'hour'
  const fmt = (n: number) =>
    isHourly
      ? `$${n}/hr`
      : `$${Math.round(n / 2080)}/hr (~$${Math.round(n / 1000)}k/yr)`
  if (min && max && min !== max) return `${fmt(min)} – ${isHourly ? `$${max}/hr` : `$${Math.round(max / 2080)}/hr`}`
  return fmt(min || max!)
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: job } = await supabase
    .from('jobs')
    .select('title, company_name, location, salary_min, salary_max, salary_period, category')
    .eq('id', id)
    .single()

  const title = job?.title ?? 'Trades Job'
  const company = job?.company_name ?? 'VoltGrid Jobs'
  const location = job?.location ?? 'Data Center'
  const salary = job ? formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined, job.salary_period ?? 'year') : null

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
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid accent */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '480px', height: '480px',
          background: 'radial-gradient(circle at top right, rgba(250,204,21,0.08) 0%, transparent 60%)',
        }} />

        {/* Top bar: logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: '#facc15', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>⚡</div>
          <span style={{ color: '#9ca3af', fontSize: '18px', fontWeight: 600 }}>VoltGrid Jobs</span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
          {/* Location pill */}
          <div style={{
            display: 'flex', alignItems: 'center', width: 'fit-content',
            background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)',
            borderRadius: '100px', padding: '4px 14px',
          }}>
            <span style={{ color: '#facc15', fontSize: '14px', fontWeight: 600 }}>📍 {location}</span>
          </div>

          {/* Title */}
          <div style={{
            fontSize: title.length > 40 ? '42px' : '52px',
            fontWeight: 800,
            color: '#f9fafb',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: '900px',
          }}>
            {title}
          </div>

          {/* Company */}
          <div style={{ fontSize: '28px', color: '#9ca3af', fontWeight: 500 }}>
            {company}
          </div>

          {/* Salary */}
          {salary && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px',
            }}>
              <div style={{
                background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)',
                borderRadius: '8px', padding: '6px 16px',
              }}>
                <span style={{ color: '#4ade80', fontSize: '22px', fontWeight: 700 }}>{salary}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px',
        }}>
          <span style={{ color: '#6b7280', fontSize: '16px' }}>voltgridjobs.com</span>
          <div style={{
            background: '#facc15', borderRadius: '10px', padding: '10px 24px',
            fontSize: '16px', fontWeight: 700, color: '#0a0a0a',
          }}>
            Apply Now →
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
