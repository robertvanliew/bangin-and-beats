import { chromium } from 'playwright';
import { startServer } from './static-server.mjs';

export async function playCheck() {
  const server = await startServer(4175);
  const browser = await chromium.launch();
  const f = [];
  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:4175/play');
    const heads = await page.locator('.bingo__head span').allInnerTexts();
    if (heads.join('') !== 'BEATS') f.push(`headers are "${heads.join('')}", want BEATS`);
    const center = await page.locator('#bingoGrid .sq--free').innerText();
    if (center.trim() !== "BANGIN'") f.push(`center square "${center}", want BANGIN'`);
    const eras = await page.locator('.era-pill .era-pill__label').allInnerTexts();
    const want = ['90s Rap Round', '90s R&B Vibe Set', '2000s Hip-Hop Bangers', '2000s Slow Jams'];
    if (JSON.stringify(eras.map(s => s.trim())) !== JSON.stringify(want)) f.push(`eras ${JSON.stringify(eras)}`);
    const body = await page.evaluate(() => document.body.innerText);
    for (const must of ['TEST YOUR THROWBACK VIBE.', 'THE BEAT BOARD™', 'START THE DJ MIX', 'SHUFFLE THE BEAT BOARD™'])
      if (!body.toUpperCase().includes(must.toUpperCase())) f.push(`play missing: ${must}`);
    // Review Focus #1: speech transcripts
    const cases = { "that's banging": true, "thats bangin": true, "that's bang in": true, "Bangin'": true,
                    "that's amazing": false, "take me back": false, "": false };
    for (const [t, exp] of Object.entries(cases)) {
      const got = await page.evaluate(s => window.voiceMatches(s), t);
      if (got !== exp) f.push(`voiceMatches("${t}") = ${got}, want ${exp}`);
    }
    // Review Focus #5: share canvas text
    const canvasSrc = await page.evaluate(() => [...document.scripts].map(s => s.textContent).join('\n'));
    if (/TAKE ME BACK|'B','I','N','G','O'/i.test(canvasSrc)) f.push('share canvas still draws old brand/letters');
  } finally { await browser.close(); server.close(); }
  return f;
}
