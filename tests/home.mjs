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
  } finally { await browser.close(); server.close(); }
  return f;
}
