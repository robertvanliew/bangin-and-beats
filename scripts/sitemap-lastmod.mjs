// Sets each sitemap <lastmod> to the date its page file last changed:
// today if it has uncommitted edits, otherwise its last commit date.
//   node scripts/sitemap-lastmod.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const git = (...a) => execFileSync('git', a, { cwd: ROOT }).toString().trimEnd();
const dirty = new Set(git('status', '--porcelain').split('\n').map(l => l.slice(3).trim()).filter(Boolean));
const today = new Date().toISOString().slice(0, 10);

const fileFor = loc => {
  const p = new URL(loc).pathname.replace(/^\//, '');
  return p === '' ? 'index.html' : p === 'blog' ? 'blog/index.html' : p + '.html';
};
let xml = readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
xml = xml.replace(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>[^<]*<\/lastmod>/g, (all, loc) => {
  const f = fileFor(loc);
  const d = dirty.has(f) ? today : (git('log', '-1', '--format=%cs', '--', f) || today);
  return all.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${d}</lastmod>`);
});
writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log([...xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)/g)].map(m => m[2] + '  ' + m[1].replace('https://www.banginandbeats.com', '')).join('\n'));
