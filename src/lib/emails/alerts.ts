/**
 * Email templates for the job-seeker alert funnel.
 *
 * Each function returns a `{ subject, html, text }` object. Keep them
 * pure — no Resend client, no side effects. Callers are responsible
 * for calling `resend.emails.send(...)` with the returned values.
 *
 * Styling is inline HTML because email clients do not reliably support
 * CSS classes. Colors match the VoltGrid dark theme.
 */

const YELLOW = '#facc15'
const FG = '#f9fafb'
const FG_MUTED = '#d1d5db'
const FG_FAINT = '#6b7280'
const BG = '#030712'
const BORDER = '#1f2937'

interface ConfirmArgs {
  email: string
  confirmToken: string
  tradeLabel: string
  baseUrl: string
}

export function buildConfirmationEmail({ confirmToken, tradeLabel, baseUrl }: ConfirmArgs) {
  const confirmUrl = `${baseUrl}/alerts/confirm?t=${confirmToken}`
  // Subject reflects the chosen trade so inbox scanners recognise what
  // the email is for. "data center trades" is the fallback for all-trades
  // signups.
  const subject = tradeLabel === 'data center trades'
    ? 'Confirm your VoltGrid job alerts'
    : `Confirm your ${tradeLabel} job alerts`
  const html = `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:${BG};color:${FG}">
  <p style="font-size:18px;font-weight:700;color:${YELLOW};margin:0 0 16px 0">⚡ One click to confirm</p>

  <p style="font-size:15px;line-height:1.7;color:${FG_MUTED};margin:0 0 16px 0">
    Someone — hopefully you — asked to get <strong style="color:${FG}">${tradeLabel}</strong> job alerts from VoltGrid Jobs.
  </p>
  <p style="font-size:15px;line-height:1.7;color:${FG_MUTED};margin:0 0 24px 0">
    Click the button below to confirm. Your first alert will arrive the next morning new roles match.
  </p>

  <div style="margin:0 0 24px 0">
    <a href="${confirmUrl}"
      style="display:inline-block;background:${YELLOW};color:#0a0a0a;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none">
      Confirm my alert →
    </a>
  </div>

  <p style="font-size:13px;line-height:1.6;color:${FG_FAINT};margin:0 0 24px 0">
    Or paste this link into your browser:<br>
    <span style="color:${FG_MUTED};word-break:break-all">${confirmUrl}</span>
  </p>

  <p style="font-size:13px;line-height:1.6;color:${FG_FAINT};border-top:1px solid ${BORDER};padding-top:16px;margin:0">
    If you didn't sign up, ignore this email. No account was created and nothing more will happen.<br>
    <a href="${baseUrl}" style="color:${YELLOW};text-decoration:none">voltgridjobs.com</a>
  </p>
</div>`
  const text = `Confirm your VoltGrid job alert

Someone (hopefully you) asked to get ${tradeLabel} job alerts from VoltGrid Jobs.

Click this link to confirm:
${confirmUrl}

Your first alert will arrive the next morning new roles match.

If you didn't sign up, ignore this email. No account was created and nothing more will happen.

— voltgridjobs.com`
  return { subject, html, text }
}

interface WelcomeArgs {
  tradeLabel: string
  manageToken: string
  baseUrl: string
  category?: string | null
}

export function buildWelcomeEmail({ tradeLabel, manageToken, baseUrl, category }: WelcomeArgs) {
  const manageUrl = `${baseUrl}/alerts/manage?t=${manageToken}`
  const unsubscribeUrl = `${baseUrl}/alerts/unsubscribe?t=${manageToken}`
  const browseUrl = `${baseUrl}/jobs${category ? `?category=${category}` : ''}`
  const salaryGuideUrl = `${baseUrl}/salary-guide`

  const subject = "You're confirmed — here's what to expect"
  const html = `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:${BG};color:${FG}">
  <p style="font-size:18px;font-weight:700;color:${YELLOW};margin:0 0 16px 0">⚡ You're confirmed</p>

  <p style="font-size:15px;line-height:1.7;color:${FG_MUTED};margin:0 0 20px 0">
    Your alert for <strong style="color:${FG}">${tradeLabel}</strong> jobs is live. Here is what happens next:
  </p>

  <ul style="margin:0 0 24px 0;padding:0;list-style:none">
    <li style="display:flex;gap:12px;margin-bottom:12px">
      <span style="color:${YELLOW};font-weight:700;flex-shrink:0">→</span>
      <span style="color:${FG_MUTED};font-size:14px;line-height:1.6">
        <strong style="color:${FG}">Daily alerts</strong> when new ${tradeLabel} jobs post at data centers and AI infrastructure sites.
      </span>
    </li>
    <li style="display:flex;gap:12px;margin-bottom:12px">
      <span style="color:${YELLOW};font-weight:700;flex-shrink:0">→</span>
      <span style="color:${FG_MUTED};font-size:14px;line-height:1.6">
        <strong style="color:${FG}">Weekly digest</strong> every Monday with the top roles from the past seven days.
      </span>
    </li>
    <li style="display:flex;gap:12px">
      <span style="color:${YELLOW};font-weight:700;flex-shrink:0">→</span>
      <span style="color:${FG_MUTED};font-size:14px;line-height:1.6">
        <strong style="color:${FG}">No spam.</strong> Real job alerts only. Unsubscribe in one click any time.
      </span>
    </li>
  </ul>

  <!-- Salary guide CTA box -->
  <div style="background:#111827;border:1px solid ${BORDER};border-radius:12px;padding:20px;margin:0 0 24px 0">
    <p style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${YELLOW};margin:0 0 8px 0">Free companion guide</p>
    <p style="font-size:16px;font-weight:700;color:${FG};margin:0 0 6px 0">2026 US Data Center Trades Salary Guide</p>
    <p style="font-size:13px;line-height:1.6;color:${FG_MUTED};margin:0 0 14px 0">
      Real pay bands by market, role taxonomy, compensation components, union vs non-union, and an offer comparison worksheet. No email wall.
    </p>
    <a href="${salaryGuideUrl}" style="display:inline-block;background:${YELLOW};color:#0a0a0a;padding:10px 18px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none">
      Read the salary guide →
    </a>
  </div>

  <div style="margin:0 0 24px 0">
    <a href="${browseUrl}"
      style="display:inline-block;background:transparent;color:${YELLOW};border:1px solid ${YELLOW};padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none">
      Browse open ${tradeLabel} jobs →
    </a>
  </div>

  <p style="font-size:13px;color:${FG_FAINT};border-top:1px solid ${BORDER};padding-top:16px;margin:0">
    VoltGrid Jobs — built for trades workers in the data center industry.<br>
    <a href="${baseUrl}" style="color:${YELLOW};text-decoration:none">voltgridjobs.com</a>
    &nbsp;·&nbsp;
    <a href="${manageUrl}" style="color:${FG_FAINT};text-decoration:underline">Manage alerts</a>
    &nbsp;·&nbsp;
    <a href="${unsubscribeUrl}" style="color:${FG_FAINT};text-decoration:underline">Unsubscribe</a>
  </p>
</div>`
  const text = `You're confirmed — here's what to expect

Your alert for ${tradeLabel} jobs is live. Here is what happens next:

- Daily alerts when new ${tradeLabel} jobs post at data centers and AI infrastructure sites.
- Weekly digest every Monday with the top roles from the past seven days.
- No spam. Real job alerts only. Unsubscribe in one click any time.

Free companion guide — 2026 US Data Center Trades Salary Guide
Real pay bands by market, role taxonomy, compensation components, union vs non-union, and an offer comparison worksheet.
${salaryGuideUrl}

Browse open ${tradeLabel} jobs:
${browseUrl}

Manage alerts: ${manageUrl}
Unsubscribe: ${unsubscribeUrl}

— voltgridjobs.com`
  return { subject, html, text }
}
