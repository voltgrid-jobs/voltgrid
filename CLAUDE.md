# CLAUDE.md — VoltGrid Jobs

> Read this at the start of every session. It tells you what this codebase is, how it's structured, and how to work with it safely.

## What This Is

VoltGrid Jobs (voltgridjobs.com) is a niche job board for trades workers (electricians, HVAC techs, low voltage specialists) at data centers and AI infrastructure sites. It aggregates jobs from Greenhouse, USAJobs, and Adzuna, and lets employers post directly for $149–$799/mo.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth) · Stripe · Resend · Vercel

---

## Key Files & Structure

```
src/
├── app/
│   ├── page.tsx                          # Homepage — hero, job alert capture, company logos
│   ├── jobs/
│   │   ├── page.tsx                      # Job listing page — filters, pagination (20/page)
│   │   └── [id]/page.tsx                 # Job detail — salary, apply button, save job
│   ├── post-job/page.tsx                 # Employer job posting form → Stripe checkout
│   ├── salary-guide/page.tsx             # Email-gated 2026 salary report
│   ├── employers/page.tsx                # Employer landing page + pricing
│   ├── about/page.tsx                    # About page
│   ├── success/page.tsx                  # Post-payment success page
│   ├── dashboard/page.tsx                # User dashboard — saved jobs, alerts
│   ├── auth/login/page.tsx               # Login (password + magic link)
│   ├── auth/signup/page.tsx              # Signup
│   ├── trades/[slug]/page.tsx            # SEO trade landing pages
│   ├── locations/[city]/page.tsx         # SEO location landing pages
│   └── api/
│       ├── alerts/route.ts               # Job alert signup (POST email + trade + location)
│       ├── checkout/route.ts             # Stripe checkout session creation
│       ├── webhook/route.ts              # Stripe webhook handler
│       ├── ingest/route.ts               # Job ingest endpoint (Greenhouse/Adzuna/USAJobs)
│       ├── send-alerts/route.ts          # Send job alert emails via Resend
│       ├── send-weekly-digest/route.ts   # Weekly digest email
│       ├── internal/payment-check/route.ts  # Stripe payment health check
│       └── cron/expiry-reminders/route.ts   # Expiry reminder emails
├── components/
│   ├── jobs/
│   │   ├── JobCard.tsx                   # Job card — salary display, badges (max 3)
│   │   ├── JobFilters.tsx                # Filter sidebar
│   │   ├── Pagination.tsx                # URL-based pagination
│   │   ├── PostJobForm.tsx               # Multi-step post-job form
│   │   ├── SaveJobButton.tsx             # Save job (requires auth)
│   │   └── AlertSignupWidget.tsx         # Job alert email capture
│   └── layout/
│       ├── Header.tsx                    # Nav header
│       └── Footer.tsx                    # Footer with links
├── lib/
│   ├── salary-extract.ts                 # Regex salary extraction from job description text
│   ├── company-logos.ts                  # logo.dev URL helper
│   ├── stripe.ts                         # Stripe client
│   └── supabase/
│       ├── server.ts                     # Server-side Supabase client (SSR)
│       ├── client.ts                     # Browser Supabase client
│       └── admin.ts                      # Service role client (server only)
├── types/index.ts                        # Job, JobAlert, etc. types
└── middleware.ts                         # Auth middleware (protected routes)
```

---

## Database (Supabase)

**Key tables:**
| Table | Purpose |
|-------|---------|
| `jobs` | All job listings — active/inactive, salary fields, metadata |
| `job_alerts` | Email subscribers (email, trade, location, created_at) |
| `saved_jobs` | User ↔ job associations |
| `orders` | Stripe order records |
| `ops_tasks` | OpsGrid task board (see Task API below) |

**Important job columns:**
- `is_active` — only active jobs show on site
- `salary_min`, `salary_max`, `salary_period` (`hour`/`year`), `salary_currency`
- `expires_at` — expiry date (30 days from posting)
- `employer_email` — for expiry reminder emails
- `expiry_reminder_sent` — bool, tracks if reminder sent
- `is_featured`, `is_union`, `per_diem`, `per_diem_rate`
- `travel_required` — `none/local/regional/national`
- `shift_type` — `day/night/rotating/4x10/5x8/other`
- `source` — `greenhouse/adzuna/usajobs/direct`

---

## Salary Display Rules

Annual salaries are converted to hourly equivalent for trades workers:
- `hourly = annual / 2080`
- Card display: `~$53/hr` (primary, green) + `($110k/yr)` (secondary, muted)
- Hourly jobs: `$45–$68/hr`
- Full salary always shown — no login gate

Salary fallback: if no structured salary fields, `src/lib/salary-extract.ts` parses the description text.

---

## Badge Rules (Job Cards)

Max 3 badges per card. Priority order:
1. Featured (yellow)
2. Per Diem with amount (green)
3. Union (blue)
4. Remote OK (green)
5. National Travel only (muted) — skip local/regional
6. Night/Rotating/4×10 shifts only (muted) — skip Day Shift

Detail page shows all badges (no limit).

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Server/admin only — never expose to client

# Stripe (live mode keys only in production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend (email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=alerts@voltgridjobs.com

# Job ingest
INGEST_SECRET=voltgrid-ingest-prod-2026
ADZUNA_API_KEY=
ADZUNA_APP_ID=
USAJOBS_API_KEY=

# Site
NEXT_PUBLIC_SITE_URL=https://voltgridjobs.com
```

All env vars are set in Vercel. For local dev, copy to `.env.local`.

---

## Deployment Process

**IMPORTANT: Claude Code never deploys directly. Push to GitHub only.**

```bash
# 1. Make changes
# 2. Type check
npx tsc --noEmit

# 3. Commit and push
git add -A
git commit -m "feat/fix/chore: description"
git push origin main
```

Felix (the AI agent) monitors GitHub and triggers Vercel deploy after reviewing the diff.

**Vercel project:** `prj_ROb1t6kekVY85pAO5CSH2a1pb8C6` | org: `volt-grid`
**Production URL:** https://voltgridjobs.com
**Branch:** `main` → auto-deploys to production

---

## Crons (managed by Felix via OpenClaw)

| Name | Schedule | What it does |
|------|----------|-------------|
| `voltgrid-daily-ingest` | 6am UTC | Fetch new jobs from Greenhouse/Adzuna/USAJobs |
| `vg-expiry-reminders` | 8am UTC | Email employers 3 days before listing expires |
| `payment-watch` | Every 6h | Check Stripe for new payments, activate listings |
| `agent-marketing` | 9am UTC | Queue LinkedIn content, organic channel tasks |
| `agent-finance` | 8am UTC | Stripe revenue check, cost monitoring |
| `agent-seo` | Wed 8am UTC | Generate trade/location landing pages |

Do not modify cron schedules — managed by Felix.

---

## Auth & Access Control

- Supabase Auth (email + password, magic link)
- Protected routes: `/dashboard`, `/account`, `/admin/*`
- Middleware: `src/middleware.ts` — redirects unauthenticated users
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is server-only — never import in client components

---

## Common Patterns

**Server component data fetch:**
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data } = await supabase.from('jobs').select('*').eq('is_active', true)
```

**Client component:**
```typescript
import { createClient } from '@/lib/supabase/client'
```

**Admin/service role (server only):**
```typescript
import { createAdminClient } from '@/lib/supabase/admin'
```

---

## What NOT to Touch

- `src/components/layout/Header.tsx` — nav/logo recently updated, co-ordinate with Felix before changing
- `src/middleware.ts` — auth routing, changes affect all protected pages
- Stripe webhook handler (`src/app/api/webhook/route.ts`) — payment logic, high risk
- Cron endpoints (`src/app/api/cron/*`, `src/app/api/internal/*`) — managed by Felix

---

## OpsGrid Task API

OpsGrid is the **mission control dashboard** at `ops-dashboard-volt-grid.vercel.app`. It is the **single source of truth for all Claude Code tasks.** Fetch your tasks from OpsGrid at the start of every session — do NOT wait for Filip to relay tasks manually.

**API Key:** `5323c76261c136d86d2df19d8ac890647dd079d54a5999c78ac279cd87752049`
**Base URL:** https://ops-dashboard-volt-grid.vercel.app

### Session Start Workflow (mandatory)

1. Fetch all tasks with status `tagged_for_claude`:
```bash
curl -H "X-API-Key: 5323c76261c136d86d2df19d8ac890647dd079d54a5999c78ac279cd87752049" \
  "https://ops-dashboard-volt-grid.vercel.app/api/tasks?assignee=claude-code&status=tagged_for_claude"
```
2. For each task: claim it, execute it, update status on completion or failure.

On success → update status to `done` with commit hash in summary.
On failure → update status to `blocked` with error reason.

Never ask Filip to relay tasks — always pull from OpsGrid directly.

**Base URL:** https://ops-dashboard-volt-grid.vercel.app
**API Key header:** `X-API-Key: 5323c76261c136d86d2df19d8ac890647dd079d54a5999c78ac279cd87752049`

```bash
# Get tasks assigned to you
curl -H "X-API-Key: 5323c76261c136d86d2df19d8ac890647dd079d54a5999c78ac279cd87752049" \
  "https://ops-dashboard-volt-grid.vercel.app/api/tasks?assignee=claude-code&status=tagged_for_claude"

# Claim a task (do this before starting)
curl -X POST -H "X-API-Key: 5323c76261c136d86d2df19d8ac890647dd079d54a5999c78ac279cd87752049" \
  "https://ops-dashboard-volt-grid.vercel.app/api/tasks/{id}/claim"

# Complete a task
curl -X POST -H "X-API-Key: 5323c76261c136d86d2df19d8ac890647dd079d54a5999c78ac279cd87752049" \
  -H "Content-Type: application/json" \
  -d '{"summary":"What I changed and why"}' \
  "https://ops-dashboard-volt-grid.vercel.app/api/tasks/{id}/complete"

# Request clarification (if brief is unclear — do NOT guess)
curl -X POST -H "X-API-Key: 5323c76261c136d86d2df19d8ac890647dd079d54a5999c78ac279cd87752049" \
  -H "Content-Type: application/json" \
  -d '{"question":"What does X mean?"}' \
  "https://ops-dashboard-volt-grid.vercel.app/api/tasks/{id}/clarify"
```

**Rules:**
1. Always claim before starting work
2. Set `needs_clarification` if the brief is ambiguous — do not guess
3. Complete with a clear summary of exactly what changed and commit hash
4. Push to GitHub, do NOT deploy — Felix handles Vercel

---

## Critical Coding Rules

### ⚠️ ALWAYS use `printf` — NEVER `echo` for env vars

Trailing newlines from `echo` have broken production four separate times:
- `STRIPE_SECRET_KEY` — payment failures
- `RESEND_API_KEY` — email delivery failures
- `STRIPE_WEBHOOK_SECRET` — webhook verification failures
- `GITHUB_WEBHOOK_SECRET` — webhook failures

```bash
# ✅ CORRECT
printf '%s' "$VALUE" > file

# ❌ WRONG — adds trailing newline
echo "$VALUE" > file
```

### Server Component / Client Component rules

- Never add `onMouseEnter`, `onMouseLeave`, or any JS event handlers to Server Components (async functions or files without `'use client'` at the top)
- Always use Tailwind CSS `hover:` classes instead
- If interactivity is needed, extract to a separate Client Component with `'use client'`

### Code routing rules

- Never write code directly for trivial config without routing through OpsGrid
- Never spawn sub-agents for code tasks — all code goes through Claude Code only

---

## Key Infrastructure

| Resource | Value |
|----------|-------|
| Supabase project | `nzfdzlhsdqlillayzuxn` |
| GitHub org | `voltgrid-jobs` |
| Vercel project | `prj_ROb1t6kekVY85pAO5CSH2a1pb8C6` |
| VPS | `204.168.182.195` — user: `openclaw`, Ubuntu 24.04 |
| Telegram group | `-1003829819989` |

---

## VoltGrid Voice Rules (for any copy or content tasks)

- Use **"we" not "I"** — always: "we built", "we launched", "we have 359 roles"
- **No em dashes** — use commas, periods, or colons instead
- **No filler openers** — never start with "Great news!", "Exciting update!", "I'm thrilled to..."
- **Numbers = credibility** — use specific numbers whenever possible
- Always invoke the **VoltGrid Content Repurposer Skill** (`~/.openclaw/workspace/skills/voltgrid-content-repurposer/SKILL.md`) for any VoltGrid copy

---

## Outreach Rules

- **Preview first**: send all outreach emails to `fhillesland@gmail.com` first, wait for "confirmed" reply before sending to real recipients
- **Max 8 outreach emails per day**
- **Signal-based outreach only**: every email must reference a specific hiring signal (e.g., "saw you're hiring 12 electricians for the Phoenix campus")
- **End all outreach emails with "Best regards"** on its own line before the signature

---

## Contact

- **Felix** (AI agent / ops lead): manages via Telegram, monitors GitHub, triggers deploys
- **Filip** (founder): reviews strategy, handles payments, runs Claude Code sessions
- **OpsGrid dashboard:** https://ops-dashboard-volt-grid.vercel.app
