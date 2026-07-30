// Prints the age of the most recent job in Supabase.
// Run: npm run ingest:health  (requires .env.local with Supabase creds)
// Exit 0 if fresh (< 36h), exit 1 if stale or empty.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('ingest health: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (run `npm run env:prod`)')
  process.exit(1)
}
const res = await fetch(
  `${url}/rest/v1/jobs?select=created_at&order=created_at.desc&limit=1`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
)
if (!res.ok) {
  console.error(`ingest health: Supabase HTTP ${res.status}`)
  process.exit(1)
}
const rows = await res.json()
if (!rows.length) {
  console.log('ingest health: EMPTY — jobs table has 0 rows')
  process.exit(1)
}
const last = new Date(rows[0].created_at)
const hoursAgo = (Date.now() - last.getTime()) / 3_600_000
const status = hoursAgo > 36 ? 'STALE' : 'OK'
console.log(`ingest health: ${status} — last job ${hoursAgo.toFixed(1)}h ago (${rows[0].created_at})`)
process.exit(hoursAgo > 36 ? 1 : 0)
