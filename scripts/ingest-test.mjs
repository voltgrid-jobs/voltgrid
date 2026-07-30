// Triggers /api/ingest on production with the real INGEST_SECRET from .env.local.
// Run: npm run ingest:test  (run `npm run env:prod` first to sync the secret)
const secret = process.env.INGEST_SECRET
if (!secret || secret === 'voltgrid-ingest-prod-2026') {
  console.error('ingest test: INGEST_SECRET missing or stale — run `npm run env:prod` first')
  process.exit(1)
}
const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltgridjobs.com'
const target = `${site}/api/ingest`
console.log(`POST ${target}`)
const start = Date.now()
const res = await fetch(target, {
  method: 'POST',
  headers: { 'x-ingest-secret': secret },
})
const elapsed = ((Date.now() - start) / 1000).toFixed(1)
const body = await res.text()
console.log(`HTTP ${res.status} in ${elapsed}s`)
console.log(body)
process.exit(res.ok ? 0 : 1)
