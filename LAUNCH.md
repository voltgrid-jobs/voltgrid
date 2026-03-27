# VoltGrid Launch Plan

## Reddit Posts (Day 7)

### r/electricians
**Title:** Built a job board specifically for data center and AI infrastructure electricians — voltgridjobs.com

Hey r/electricians — I know hyperscale data centers and AI infrastructure projects are where a lot of the high-paying work is right now, but finding those jobs means wading through Indeed/LinkedIn with every other trade and non-trade result mixed in.

I built **VoltGrid Jobs** (voltgridjobs.com) — a job board specifically for electricians, HVAC techs, and low-voltage specialists working data centers and AI infrastructure.

Right now it aggregates listings from federal sources, major ATS platforms (Equinix, Digital Realty, Iron Mountain, Mortenson, Turner, etc.) and employers can post directly.

It's brand new so listings are still building up, but I wanted to get real feedback from people actually in this trade. What would make a job board actually useful to you? What do general boards get wrong?

---

### r/HVAC
**Title:** Made a niche job board for HVAC techs at data centers — free to browse, looking for feedback

HVAC work at data centers and hyperscale facilities is some of the best-paying in the industry (especially with AI data center buildout exploding), but those jobs get buried on general boards.

Built voltgridjobs.com — a dedicated board for trades workers at data centers and AI infrastructure sites. HVAC, electrical, low voltage, construction.

Free to browse and set up job alerts. Just launched — feedback welcome.

---

### r/datacenter
**Title:** Launched a job board for trades workers building data centers — voltgridjobs.com

The labor shortage for data center trades is real — good electricians, HVAC techs, and low-voltage specialists are hard to find. Just launched VoltGrid Jobs (voltgridjobs.com), a niche job board specifically for this space.

Job seekers: free to browse and set up email alerts.
Employers/contractors: post a listing from $149. Direct reach to trades pros who know what a data center is.

Early days, feedback appreciated.

---

## Other Launch Channels

- [ ] Post to LinkedIn (voltgrid-jobs account)
- [ ] Submit to r/SideProject, r/entrepreneur
- [ ] Email contractors in Mortenson/Turner/Bechtel supplier networks
- [ ] List on Product Hunt
- [ ] Submit sitemap to Google Search Console

## Remaining Setup

- [ ] Add RESEND_API_KEY to Vercel env vars (get from resend.com, free tier)
- [ ] Verify voltgridjobs.com domain in Resend dashboard
- [ ] Add Google Search Console verification code to layout.tsx
- [ ] Set up Adzuna API credentials (free at developer.adzuna.com) → add ADZUNA_APP_ID + ADZUNA_API_KEY to Vercel
- [ ] Add USAJOBS_API_KEY (free at developer.usajobs.gov) → add to Vercel
- [ ] Trigger first ingest run: POST https://voltgridjobs.com/api/ingest with header x-ingest-secret: voltgrid-ingest-prod-2026
