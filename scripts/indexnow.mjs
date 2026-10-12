// Ping IndexNow (Bing, Yandex, Naver, Seznam) with every URL in sitemap.xml.
// Bing's index feeds Copilot and ChatGPT search, so this speeds up AI pickup.
// Run after launch (plan Task 12) and after big content changes:
//   node scripts/indexnow.mjs
// Google does not use IndexNow; submit the sitemap in Search Console instead.
import { readFileSync, readdirSync } from 'node:fs';

const HOST = 'www.banginandbeats.com';
const key = readdirSync('.').find(f => /^[0-9a-f]{32}\.txt$/.test(f))?.slice(0, -4);
if (!key) throw new Error('IndexNow key file (<32 hex>.txt) missing from the repo root');

const urlList = [...readFileSync('sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs`);
