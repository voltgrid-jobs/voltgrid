import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PostJobPageClient } from '@/components/jobs/PostJobPageClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Post a Job — VoltGrid Jobs',
  alternates: { canonical: 'https://voltgridjobs.com/post-job' },
}

function TrustRail({ jobCount }: { jobCount: number }) {
  return (
    <aside className="flex flex-col gap-4">
      {/* Dynamic stat */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }}
      >
        <p className="font-bold text-base" style={{ color: 'var(--yellow)' }}>
          ⚡ {jobCount}+ specialist trades jobs listed
        </p>
      </div>

      {/* Trust bullets */}
      <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        {[
          'Your listing goes live in under 5 minutes',
          'Reaches electricians, HVAC techs & low voltage specialists who know what a data center is',
          'Flat pricing — no bidding, no surprises',
          '14-day guarantee — technical issues? We\'ll make it right',
        ].map((point) => (
          <div key={point} className="flex items-start gap-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
            <span className="flex-shrink-0 font-semibold mt-0.5" style={{ color: 'var(--green)' }}>✓</span>
            <span>{point}</span>
          </div>
        ))}
      </div>

    </aside>
  )
}

export default async function PostJobPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const supabase = await createClient()
  const { count } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  const jobCount = count ?? 350
  const params = await searchParams
  const editId = params?.edit || null

  return (
    <PostJobPageClient
      trustRail={<TrustRail jobCount={jobCount} />}
      jobCount={jobCount}
      editId={editId}
    />
  )
}
