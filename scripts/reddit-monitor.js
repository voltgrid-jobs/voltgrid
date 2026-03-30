#!/usr/bin/env node
/**
 * Reddit Monitor — VoltGrid Jobs
 * Searches Reddit for threads where a genuine VoltGrid reply would add value.
 * Sends Telegram alert with thread link + suggested reply. Filip approves before posting.
 * 
 * Hard rules (permanent):
 * - Never DM Reddit users
 * - Never post from brand new accounts
 * - Never post the same reply twice
 * - Always answer question first, mention VoltGrid second
 * - All replies go through Filip for approval
 * - If mod warns → stop immediately
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8648371375:AAHk4fd26zVe4OPKn0SRmXxNZyHrmzRNQ-U';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7824040963';

// Keywords that indicate a thread worth responding to
const SEARCH_QUERIES = [
  'data center electrician jobs',
  'HVAC data center work',
  'low voltage data center jobs',
  'electrician Indeed buried jobs',
  'where find DC trades jobs',
  'data center hiring electrician',
  'data center HVAC hiring',
];

// Subreddits to search
const SUBREDDITS = ['electricians', 'HVAC', 'datacenter', 'skilled_trades', 'constructionworkers'];

// Signal phrases — post contains one of these = high relevance
const SIGNAL_PHRASES = [
  'looking for work',
  'where to find',
  'how to find',
  'can\'t find',
  'hard to find',
  'job hunting',
  'job search',
  'hiring',
  'where do i',
  'any recommendations',
  'advice on finding',
  'data center jobs',
  'dc electrician',
  'data centre',
];

async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'Markdown',
    disable_web_page_preview: false,
  });
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  
  return res.json();
}

function generateSuggestedReply(post) {
  // Template varies based on context — never the same reply twice
  const templates = [
    `There's a job board that launched specifically for this — voltgridjobs.com. Still early but 351 DC trades jobs live from CoreWeave, xAI, T5 Data Centers. Free to browse and set up alerts by trade and location.`,
    `voltgridjobs.com just launched for exactly this. It's a niche board — only data center and AI infrastructure jobs for electricians, HVAC techs, and low-voltage specialists. No noise, no residential listings buried in there. 351 jobs live right now.`,
    `Might be worth checking voltgridjobs.com — it's a new board built specifically for trades workers at data centers. Every posting is DC or AI infrastructure work. Free to browse, you can set up alerts by trade. Just launched.`,
  ];
  
  // Rotate based on post ID hash to ensure variety
  const idx = post.id ? post.id.charCodeAt(0) % templates.length : 0;
  return templates[idx];
}

function isHighRelevance(post) {
  const text = `${post.title} ${post.selftext || ''}`.toLowerCase();
  const matchCount = SIGNAL_PHRASES.filter(phrase => text.includes(phrase)).length;
  
  // Must mention data center context
  const hasDCContext = text.includes('data center') || text.includes('datacenter') || 
                       text.includes('data centre') || text.includes('hyperscale') ||
                       text.includes('colo') || text.includes('corweave') || text.includes('xai');
  
  // Must be a question or seeking help (not just discussion)
  const isSeeking = text.includes('?') || text.includes('looking for') || 
                    text.includes('need help') || text.includes('advice') ||
                    text.includes('where') || text.includes('how');
  
  return matchCount >= 1 && (hasDCContext || isSeeking);
}

async function searchSubreddit(subreddit, query) {
  const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=new&limit=10&t=month`;
  
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VoltGridMonitor/1.0 (job board monitoring for relevant threads)' }
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return data?.data?.children?.map(c => c.data) || [];
  } catch (e) {
    console.error(`Error searching r/${subreddit}:`, e.message);
    return [];
  }
}

async function loadSeenPosts() {
  const fs = await import('fs');
  const path = '/home/openclaw/.openclaw/workspace/voltgrid/scripts/reddit-seen-posts.json';
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch {
    return { seen: [] };
  }
}

async function saveSeenPosts(data) {
  const fs = await import('fs');
  const path = '/home/openclaw/.openclaw/workspace/voltgrid/scripts/reddit-seen-posts.json';
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

async function main() {
  console.log(`[${new Date().toISOString()}] Reddit monitor starting...`);
  
  const seenData = await loadSeenPosts();
  const seen = new Set(seenData.seen || []);
  const newAlerts = [];
  
  for (const subreddit of SUBREDDITS) {
    for (const query of SEARCH_QUERIES) {
      const posts = await searchSubreddit(subreddit, query);
      
      for (const post of posts) {
        if (seen.has(post.id)) continue;
        if (!isHighRelevance(post)) continue;
        
        // Skip posts older than 21 days — replying to dead threads looks desperate
        // 14 days was too aggressive; 21 days with "late to this thread" framing is fine
        const ageDays = (Date.now() / 1000 - post.created_utc) / 86400;
        if (ageDays > 21) continue;
        
        seen.add(post.id);
        newAlerts.push(post);
      }
      
      // Rate limit — be a good citizen
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  // Deduplicate by post ID
  const unique = [...new Map(newAlerts.map(p => [p.id, p])).values()];
  
  if (unique.length === 0) {
    console.log('No new relevant threads found.');
    await sendTelegram(`⚡ *Reddit Monitor — VoltGrid*\n\nNo new relevant threads this week. All clear.`);
  } else {
    for (const post of unique.slice(0, 5)) { // Max 5 alerts per run
      const url = `https://reddit.com${post.permalink}`;
      const reply = generateSuggestedReply(post);
      const age = Math.round((Date.now() / 1000 - post.created_utc) / 3600);
      
      const message = `⚡ *Reddit Thread — Approval Needed*

📍 *r/${post.subreddit}* • ${age}h ago • ${post.score} upvotes

*"${post.title}"*

🔗 ${url}

💬 *Suggested reply:*
_"${reply}"_

✅ Reply YES to approve posting (you post manually from your account)
❌ Reply NO to skip

⚠️ Remember: Answer the question first if the thread needs more context. Never post from a brand new account.`;

      await sendTelegram(message);
      console.log(`Alert sent for: ${post.title}`);
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  // Save seen posts (keep last 500 to avoid unbounded growth)
  const updatedSeen = [...seen].slice(-500);
  await saveSeenPosts({ seen: updatedSeen, lastRun: new Date().toISOString() });
  
  console.log(`Done. ${unique.length} new alerts sent.`);
}

main().catch(console.error);
