import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// GitHub sends HMAC-SHA256 signature in X-Hub-Signature-256
function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_FELIX_CHAT_ID // Felix's DM chat ID

  if (!secret || !botToken || !chatId) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const body = await req.text()
  const signature = req.headers.get('x-hub-signature-256')

  if (!verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = req.headers.get('x-github-event')

  // Only handle push events to main branch
  if (event !== 'push') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  let payload: {
    ref?: string
    head_commit?: {
      id?: string
      message?: string
      author?: { name?: string }
      url?: string
    }
    pusher?: { name?: string }
    repository?: { name?: string }
  }
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only notify on pushes to main
  if (payload.ref !== 'refs/heads/main') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const commit = payload.head_commit
  if (!commit) return NextResponse.json({ ok: true, skipped: true })

  const shortSha = (commit.id ?? '').slice(0, 7)
  const message = (commit.message ?? '').split('\n')[0] // first line only
  const author = commit.author?.name ?? payload.pusher?.name ?? 'unknown'
  const repo = payload.repository?.name ?? 'voltgrid'
  const commitUrl = commit.url ?? `https://github.com/voltgrid-jobs/${repo}/commit/${shortSha}`

  const text = [
    `⚡ *New commit on ${repo}/main*`,
    `\`${shortSha}\` — ${message}`,
    `Author: ${author}`,
    ``,
    `[View commit](${commitUrl})`,
    ``,
    `_Review and deploy when ready._`,
  ].join('\n')

  const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  })

  if (!tgRes.ok) {
    const err = await tgRes.text()
    console.error('Telegram send failed:', err)
    return NextResponse.json({ error: 'Telegram send failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
