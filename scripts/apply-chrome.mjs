// Stamps partials/nav.html and partials/footer.html into every page, between the
// <!-- CHROME:NAV --> and <!-- CHROME:FOOTER --> markers. Re-run after editing a partial.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const nav = (await readFile(path.join(ROOT, 'partials/nav.html'), 'utf8')).trim();
const footer = (await readFile(path.join(ROOT, 'partials/footer.html'), 'utf8')).trim();
const PAGES = (await readdir(ROOT)).filter(f => f.endsWith('.html'))
  .concat((await readdir(path.join(ROOT, 'blog'))).filter(f => f.endsWith('.html')).map(f => 'blog/' + f));

const between = (html, open, close, block) => {
  const re = new RegExp(`<!-- ${open} -->[\\s\\S]*?<!-- ${close} -->`);
  return re.test(html) ? html.replace(re, () => block) : null;
};

// "index.html" → "/", "blog/index.html" → "/blog", "events.html" → "/events"
const urlPath = rel => '/' + rel.replace(/\.html$/, '').replace(/(^|\/)index$/, '');

for (const rel of PAGES) {
  const file = path.join(ROOT, rel);
  let html = await readFile(file, 'utf8');
  // First run: wrap the existing site header and the LAST <footer> (the site footer) in markers.
  if (!html.includes('<!-- CHROME:NAV -->')) {
    html = html.replace(/<header class="nav[\s\S]*?<\/header>/, '<!-- CHROME:NAV --><!-- /CHROME:NAV -->');
  }
  if (!html.includes('<!-- CHROME:FOOTER -->')) {
    const i = html.lastIndexOf('<footer');
    const j = html.indexOf('</footer>', i) + '</footer>'.length;
    if (i >= 0) html = html.slice(0, i) + '<!-- CHROME:FOOTER --><!-- /CHROME:FOOTER -->' + html.slice(j);
  }
  const here = urlPath(rel);
  const pageNav = nav.replace(`<a href="${here}">`, `<a href="${here}" aria-current="page">`);
  html = between(html, 'CHROME:NAV', '/CHROME:NAV', pageNav) ?? html;
  html = between(html, 'CHROME:FOOTER', '/CHROME:FOOTER', footer) ?? html;
  await writeFile(file, html);
  console.log('chrome →', rel);
}
