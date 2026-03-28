/**
 * One-time cleanup: strip HTML from existing job descriptions in Supabase.
 * Handles both literal HTML tags AND HTML-entity-encoded HTML (e.g. &lt;div&gt;).
 * Run with: node scripts/clean-descriptions.mjs
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  console.error('Run with: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/clean-descriptions.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function decodeEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&[a-z]+;/gi, ' ')
}

function stripHtml(html) {
  if (!html) return ''

  // First decode any entity-encoded HTML so we can strip it properly
  let clean = decodeEntities(html)

  // Remove dangerous/irrelevant blocks entirely
  clean = clean
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/\u00ad/g, '') // soft hyphens

  // Block-level tags → newline for readable structure
  clean = clean
    .replace(/<\/(p|div|li|h[1-6]|tr|blockquote|section|article)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<h([1-6])[^>]*>/gi, '\n')

  // Strip all remaining tags
  clean = clean.replace(/<[^>]+>/g, '')

  // Decode entities again (some may appear after stripping)
  clean = decodeEntities(clean)

  // Collapse whitespace
  clean = clean
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return clean
}

function looksLikeHtml(text) {
  if (!text) return false
  // Check for both literal and entity-encoded HTML tags
  return /<[a-z][\s\S]*?>/i.test(text) || /&lt;[a-z]/i.test(text)
}

async function run() {
  console.log('Fetching all job descriptions...')

  let offset = 0
  const pageSize = 1000
  let totalFetched = 0
  let totalDirty = 0
  let totalUpdated = 0
  let totalFailed = 0

  while (true) {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, description, company_name')
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error('Fetch error:', error)
      break
    }
    if (!jobs || jobs.length === 0) break

    totalFetched += jobs.length

    const dirty = jobs.filter(j => looksLikeHtml(j.description || ''))
    totalDirty += dirty.length

    if (dirty.length > 0) {
      console.log(`Batch ${offset}-${offset + jobs.length}: ${dirty.length} dirty rows`)
      dirty.slice(0, 3).forEach(j => {
        console.log(`  Sample [${j.company_name}]: ${(j.description || '').substring(0, 80)}...`)
      })
    }

    // Update in parallel batches of 20
    for (let i = 0; i < dirty.length; i += 20) {
      const batch = dirty.slice(i, i + 20)
      const results = await Promise.all(batch.map(async (job) => {
        const cleaned = stripHtml(job.description)
        const { error: updateError } = await supabase
          .from('jobs')
          .update({ description: cleaned })
          .eq('id', job.id)
        if (updateError) {
          console.error(`  ✗ Failed ${job.id}:`, updateError.message)
          return false
        }
        return true
      }))
      totalUpdated += results.filter(Boolean).length
      totalFailed += results.filter(r => !r).length
    }

    if (jobs.length < pageSize) break
    offset += pageSize
  }

  console.log('\n=== Done ===')
  console.log(`Total rows fetched:   ${totalFetched}`)
  console.log(`Dirty rows found:     ${totalDirty}`)
  console.log(`Successfully cleaned: ${totalUpdated}`)
  console.log(`Failed:               ${totalFailed}`)
}

run().catch(console.error)
