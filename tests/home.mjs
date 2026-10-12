import { chromium } from 'playwright';
import { startServer } from './static-server.mjs';

export async function homeCheck() {
  const server = await startServer(4174);
  const browser = await chromium.launch();
  const f = [];
  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:4174/');
    const text = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
    for (const must of [
      "THE ULTIMATE HIP-HOP & R&B 90'S / 00'S INTERACTIVE THROWBACK EXPERIENCE",
      'WHERE YOU ARE PART OF THE ACTION!',
      'SING-ALONG • DANCE • PLAY • WIN PRIZES',
      'HOW WE ROCK THE ROOM.',
      'GRAB YOUR TRACKLIST CARD',
      'YOU ARE THE HEADLINE ACT.',
      'THIRTY SECONDS OF THE REAL THING.',
      'COMMON QUESTIONS. ANSWERED STRAIGHT.',
      'WE STARTED THIS BECAUSE REGULAR EVENTS WERE TOO QUIET.',
      'HOW DO I BOOK A PRIVATE EVENT?',
    ]) if (!text.toUpperCase().includes(must.toUpperCase())) f.push(`home missing: ${must}`);
    if (await page.locator('a[href="/demo"]').count()) f.push('home links to /demo (does not exist)');
    const title = await page.title();
    if (!/Bangin.{0,3}&.{0,3}Beats/i.test(title)) f.push(`home <title> lacks brand: ${title}`);

    await page.goto('http://localhost:4174/events');
    const ev = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').toUpperCase());
    for (const must of ["THE ULTIMATE HIP-HOP & R&B 90'S / 00'S INTERACTIVE THROWBACK EXPERIENCE", 'BUY TICKETS — $35', 'EXPLORE PRIVATE PARTIES'])
      if (!ev.includes(must)) f.push(`events missing: ${must}`);

    await page.goto('http://localhost:4174/gallery');
    const ga = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').toUpperCase());
    for (const must of ['RECEIPTS FROM THE DANCE FLOOR.', 'THEY MATCHED THE TRACKS. THEY CLAIMED THE NIGHT.',
                        'TAG US TO GET FEATURED.', 'YOU COULD BE NEXT.', '#BANGINANDBEATS'])
      if (!ga.includes(must)) f.push(`gallery missing: ${must}`);
    const stamps = await page.locator('.winners__stamp-label').allInnerTexts();
    if (stamps.some(s => s.trim().toUpperCase() !== 'WINNER')) f.push(`gallery stamps: ${JSON.stringify(stamps)}`);

    const blogMust = {
      '/blog': ["SONG OF THE WEEK & THE CULTURE AROUND IT.", 'HOW TO PLAN A LIVE THROWBACK TOUR NIGHT THAT COMMANDS THE ROOM.'],
      '/blog/how-to-plan-a-throwback-party-night': ['THE THREE PILLARS OF A PACKED ROOM', 'THE DUAL TOUR TIMELINES', 'DO YOU RUN A HIGH-CAPACITY ROOM OR VENUE?'],
      '/blog/song-of-the-week-crazy-in-love': ["WHY 'CRAZY IN LOVE' STILL DOMINATES EVERY THROWBACK PARTY NIGHT.", "THE LIVE SHOW CLIMAX MOMENT."],
      '/blog/song-of-the-week-juicy-notorious-big': ["WHY 'JUICY' BY BIGGIE STOPS EVERY THROWBACK PARTY ROOM DEAD.", 'THE "JUICY EFFECT."'],
    };
    for (const [p, musts] of Object.entries(blogMust)) {
      await page.goto('http://localhost:4174' + p);
      // The blog index renders its cards from /content/posts.json after load.
      if (p === '/blog') await page.waitForSelector('.blog-card', { timeout: 5000 }).catch(() => {});
      const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').toUpperCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"'));
      for (const m of musts) if (!t.includes(m)) f.push(`${p} missing: ${m}`);
    }
  } finally { await browser.close(); server.close(); }
  return f;
}
