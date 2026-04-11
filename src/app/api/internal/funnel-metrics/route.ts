import { NextRequest, NextResponse } from 'next/server'
import { buildFunnelReport } from '@/lib/analytics/queries'

/**
 * Internal metrics endpoint. Returns the full funnel report for a
 * date range. Protected by the shared INGEST_SECRET (same bearer
 * token already used by other cron endpoints). Intended for Hermes
 * to pull weekly numbers into the morning digest.
 *
 * GET /api/internal/funnel-metrics?from=YYYY-MM-DD&to=YYYY-MM-DD
 *     Authorization: Bearer <INGEST_SECRET>
 *
 * If from/to are omitted, defaults to the last 7 days ending now.
 */
export async function GET(req: NextRequest) {
  const INGEST_SECRET = process.env.INGEST_SECRET
  if (!INGEST_SECRET) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${INGEST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const defaultFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const fromParam = req.nextUrl.searchParams.get('from')
  const toParam = req.nextUrl.searchParams.get('to')

  const from = fromParam ? new Date(fromParam).toISOString() : defaultFrom.toISOString()
  const to = toParam ? new Date(toParam).toISOString() : now.toISOString()

  if (isNaN(new Date(from).getTime()) || isNaN(new Date(to).getTime())) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
  }

  const report = await buildFunnelReport({ from, to })
  return NextResponse.json(report)
}
