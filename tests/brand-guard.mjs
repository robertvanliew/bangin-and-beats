import { chromium } from 'playwright';
import { startServer } from './static-server.mjs';
import { PAGES, FORBIDDEN_VISIBLE } from './pages.mjs';

// Checks everything a person, Google, or a share preview can see.
export async function brandGuard() {
  const server = await startServer(4173);
  const browser = await chromium.launch();
  const failures = [];
  try {
    for (const p of PAGES) {
      const page = await browser.newPage();
      const resp = await page.goto('http://localhost:4173' + p, { waitUntil: 'load' });
      if (!resp || resp.status() !== 200) { failures.push(`${p}: HTTP ${resp && resp.status()}`); await page.close(); continue; }
      const surfaces = await page.evaluate(() => ({
        text: document.body.innerText,
        title: document.title,
        meta: [...document.querySelectorAll('meta[content]')].map(m => m.content).join('\n'),
        links: [...document.querySelectorAll('link[href], a[href]')].map(a => a.getAttribute('href')).join('\n'),
        alt: [...document.querySelectorAll('[alt]')].map(e => e.alt).join('\n'),
        aria: [...document.querySelectorAll('[aria-label],[title],[placeholder]')]
          .map(e => [e.getAttribute('aria-label'), e.getAttribute('title'), e.getAttribute('placeholder')].join(' ')).join('\n'),
        jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent).join('\n'),
      }));
      for (const [where, value] of Object.entries(surfaces)) {
        for (const re of FORBIDDEN_VISIBLE) {
          const i = value.search(re);
          if (i >= 0) failures.push(`${p} [${where}] ${re}: "…${value.slice(Math.max(0, i - 40), i + 40).replace(/\s+/g, ' ')}…"`);
        }
      }
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
  return failures;
}
