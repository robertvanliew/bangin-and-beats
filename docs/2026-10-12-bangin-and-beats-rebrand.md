# Bangin' & Beats Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn a copy of the Take Me Back Bingo site into **Bangin' & Beats™** on `banginandbeats.com`: new logo, black and gold palette, the owner's copy, no visible "bingo" anywhere, forms and emails routed to the new brand, and every old URL 301-redirected so the rankings carry over.

**Architecture:** The new site is a fresh repo, `bangin-and-beats`, copied from the current static site: plain HTML/CSS/JS pages, Vercel serverless functions in `/api`, and JSON content in `/content`. It deploys as its own Vercel project. The old `takemebackbingo` repo and Vercel project stay live and untouched until launch day. On launch day the old repo becomes a redirect-only `vercel.json` that 301s every old URL to its new equivalent.

**Tech Stack:** Static HTML/CSS/vanilla JS, Vercel (cleanUrls plus serverless `api/*.js`), Resend (newsletter), Brevo (winner capture), Formspree (contact and booking forms), Playwright (installed as a devDependency) for the tests, Node 25, Python 3.14 with Pillow for image resizing.

**Spec:** `docs/spec-owner-copy.md` is the owner's "update website jargon.docx" as plain text. The original Word doc is at `docs/owner/update website jargon.docx`. Logo source: `docs/owner/bangin-beats-logo-source.png` (1920×1280 PNG, about 3 MB, transparent). `docs/owner/` is git-ignored, so those files stay local.

**Status (2026-10-12):** Tasks 1–10 are done; `npm test` is fully green (raw, brand, assets, home, play). Task 10: Formspree now posts to the owner's form `xzedaygd` (contact pop-up on home/events/gallery, Play-page city boxes); ImprovMX forwarding is live (info@, tickets@, sha@, catch-all → banginandbeats@gmail.com; MX + SPF verified in public DNS). Also done since Task 9: logo-matched premium redesign, competitor-informed hero (background video cut from the old reel with branding removed, gold ticket stub, owner's All-Black ribbon copy), sticky mobile ticket bar, transparent favicon, `docs/backend-setup.md`. Still needed from the owner before/at Task 11: Resend key + audience, Brevo key/list + rebranded automation emails, GA4 ID, GitHub token, the All-Black show's date + ticket link. **Next: Task 11 (Vercel + DNS) — check in with the user first.**

**Paths used below:**
- `OLD` = `C:\Users\12124\Documents\Take-me-back-bingo` (the live site; read-only until Task 12)
- `NEW` = `C:\Users\12124\Documents\bangin-and-beats` (created in Task 1)

## Global Constraints

- Brand name in copy: **Bangin' & Beats™**. Use ™ on the first mention per page and in headings. In body copy after that, "Bangin' & Beats" is fine. ALL-CAPS display uses `BANGIN' & BEATS™`.
- Domain: `https://www.banginandbeats.com` (canonical host is www). Email: `info@banginandbeats.com`. Phone: `201-344-4589`. Social handle: `@banginandbeats`. Hashtag: `#BanginAndBeats`.
- Company line: `© 2026 HIGH CLASS EXPERIENCE LLC. ALL RIGHTS RESERVED.` Footer tagline: `Produced Exclusively by High Class Experience LLC • All Rights Reserved • Strictly 30 & Up`.
- Consumer tagline: `SING-ALONG • DANCE • PLAY • WIN PRIZES`. Hero descriptor: `THE ULTIMATE HIP-HOP & R&B 90'S / 00'S INTERACTIVE THROWBACK EXPERIENCE`. Core slogan: `WHERE YOU ARE PART OF THE ACTION!`. Crown slogan: `RETRO MUSIC NOSTALGIA FOR PEOPLE WHO LOVE REAL CULTURE.`
- Palette (exact): bg `#0A0A0A`, gold `#D4AF37`, champagne `#C9A86A`, cream `#FFF8E7`, white `#FFFFFF`, crimson `#8B1A1A`, purple `#7C3AED`.
- Game: board name `THE BEAT BOARD™`; column headers `B-E-A-T-S`; center square `BANGIN'`; win shout `"THAT'S BANGIN'!"`; primary CTA `PLAY THE BOARD ➔`; four eras only: `90s Rap Round`, `90s R&B Vibe Set`, `2000s Hip-Hop Bangers`, `2000s Slow Jams`. No 80s anywhere.
- Ticket price in copy: `$35`. Age: `30 & Up`.
- **No visible "bingo", "take me back", "takemebackbingo", or the old phone `732-646-7073`** in rendered text, `<title>`, meta and OG tags, `alt`, `aria-label`, JSON-LD, URLs, or emails. Internal CSS class and JS identifiers (for example `#bingoGrid`, `.bingo__head`) may keep their names in this pass. They're not visible, and renaming them risks breaking the game.
- Images served to phones must be ≤ 1600px on the long edge and ≤ 400 KB (iOS Safari crashes on huge images; see the memory note on iOS verification).
- Per the user's standing rule: every task ends with commit **and push to `main`** of the NEW repo. Never push to OLD before Task 12.

## Term Mapping (apply to all copy not given verbatim in the spec)

| Old | New |
|---|---|
| Take Me Back Bingo / TMBB | Bangin' & Beats™ |
| music bingo, bingo night | interactive throwback party / throwback party night |
| bingo card | song card (live events) / THE BEAT BOARD™ (online game) |
| play bingo / play now | play the board |
| B-I-N-G-O | B-E-A-T-S |
| FREE (center) | BANGIN' |
| yell "BINGO" / yell "TAKE ME BACK" | shout "THAT'S BANGIN'!" |
| bingo caller / host | Hype Emcee / host |
| daub / dauber | mark / lock it in |
| 80s, 90s & 00s | 90s & 00s |
| takemebackbingo.com | banginandbeats.com |
| @takemebackbingo / #TakeMeBackBingo | @banginandbeats / #BanginAndBeats |
| 732-646-7073 / 732.646.7073 | 201-344-4589 |
| "Get Notified" nav button | GET TICKETS |

## URL Map (old → new, used by Tasks 9, 10, 12)

| Old path | New path |
|---|---|
| `/` `/events` `/gallery` `/play` `/songs` `/legal` `/blog` | same |
| `/blog/song-of-the-week-crazy-in-love` | same |
| `/blog/song-of-the-week-juicy-notorious-big` | same |
| `/blog/how-to-plan-a-music-bingo-night` | `/blog/how-to-plan-a-throwback-party-night` |
| `/what-is-music-bingo` | `/how-it-works` |
| `/hip-hop-bingo` | `/hip-hop-throwback-party` |
| `/r-b-bingo` | `/rnb-throwback-party` |
| `/bingo-woodbridge-nj` | `/woodbridge-nj` |
| `/bingo-newark-nj` | `/newark-nj` |
| `/bingo-edison-nj` | `/edison-nj` |
| `/sunday-bingo-nj` | `/sunday-day-party-nj` |
| `/music-bingo-nyc` | `/nyc-throwback-party` |
| `/bachelorette-party-bingo` | `/bachelorette-party` |
| `/birthday-party-bingo` | `/birthday-party` |
| `/music-bingo-fundraiser` | `/fundraiser-events` |

## Owner Inputs Needed (collect before Task 10; none of these block Tasks 1–9)

1. Registrar login for banginandbeats.com, or have the owner add the DNS records you send.
2. A mailbox or forwarding for `info@banginandbeats.com`. Recommended: free forwarding to the owner's existing inbox through the registrar's email forwarding, Cloudflare Email Routing, or ImprovMX.
3. A Formspree account in the owner's name with the notification email `info@banginandbeats.com`. Create one form, "Bangin & Beats Contact", and send us the form ID.
4. Instagram and TikTok URLs for @banginandbeats. Confirm the accounts exist.
5. Approval of the FAQ answers and landing-page copy written in Tasks 4 and 9. The spec gives the questions but not the answers.
6. Have the attorney check the claim in the spec's blog copy: "verified $12,000 direct revenue injection". It's stated as fact.
7. Whether the hero sizzle reel (`Video/hero-v3.mp4`), the logo animation (`Video/logo-anim-v2.mp4`), the gameplay demo (`videos/play-gameplay-demo.mp4`) and the flyers show the old brand burned into the video or image. Any that do must be replaced or removed (Task 3 removes the logo animation either way).
8. Optional: a recorded "THAT'S BANGIN'!" audio clip for the win celebration. Until then the clip is silent.

## Review Focus

1. **Speech recognition hears "that's banging", not "that's bangin'".** The voice-win check must match `bangin` as a substring of whatever the browser transcribes ("banging", "bang in", "Bangin'"). Test: Task 5, `voiceMatches()` unit cases.
2. **iOS Safari and the 3 MB logo.** A full-size PNG in the hero can crash or blank the page on iPhone. Test: Task 2 asserts that every served logo file is ≤ 400 KB and ≤ 1600px. Do a real iPhone check before declaring done (Task 11).
3. **Forms silently going to the old inbox.** The Formspree ID `mbdbggbv` routes to whoever owns the old form. Test: Task 10's raw guard fails if `mbdbggbv` appears anywhere.
4. **A redirect chain or a wrong target loses rankings.** Each old URL must return exactly one 301 to its final https://www URL, never through `http://` or the bare domain. Test: Task 12, `check-redirects.mjs` asserts the status, the exact `Location`, and a 200 on the target.
5. **Hidden "bingo" in non-body places**: `<title>`, OG and Twitter tags, `alt`, `aria-label`, JSON-LD, the share-card canvas, the printable card PDF, and email templates. Test: Task 1's visible guard reads all of those, not just `innerText`. Task 5 checks the canvas text, and Task 10 checks the API templates with the raw guard.

---

### Task 1: Scaffold the new repo + guard tests (red baseline)

**Files:**
- Create: `NEW/` (copy of OLD without `.git`, `node_modules`, `Skills`, `_demo`, `web`, `.claude`, `.well-known`)
- Create: `NEW/tests/static-server.mjs`, `NEW/tests/pages.mjs`, `NEW/tests/brand-guard.mjs`, `NEW/tests/raw-guard.mjs`, `NEW/tests/run-all.mjs`
- Modify: `NEW/package.json`

**Interfaces:**
- Produces: `startServer(port) → Promise<http.Server>` (cleanUrls static server); `PAGES: string[]` (new paths); `FORBIDDEN_VISIBLE: RegExp[]`; `npm test` runs every guard and exits non-zero on any failure.

- [x] **Step 1: Copy the site**

```bash
mkdir -p /c/Users/12124/Documents/bangin-and-beats
cd /c/Users/12124/Documents/Take-me-back-bingo
tar --exclude=.git --exclude=node_modules --exclude=Skills --exclude=_demo \
    --exclude=web --exclude=.claude --exclude=.well-known --exclude="Animation Logo" \
    -cf - . | (cd /c/Users/12124/Documents/bangin-and-beats && tar -xf -)
cd /c/Users/12124/Documents/bangin-and-beats && git init -b main
```

- [x] **Step 2: Replace package.json**

```json
{
  "name": "bangin-and-beats",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": { "test": "node tests/run-all.mjs" },
  "devDependencies": { "playwright": "^1.60.0" }
}
```

Run: `npm install && npx playwright install chromium`

- [x] **Step 3: Write `tests/static-server.mjs`** (mimics Vercel cleanUrls: `/play` → `play.html`, `/blog` → `blog/index.html`)

```js
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain' };

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]).replace(/\/+$/, '') || '/';
  const base = path.join(ROOT, clean);
  for (const c of [base, base + '.html', path.join(base, 'index.html')]) {
    try { if ((await stat(c)).isFile()) return c; } catch {}
  }
  return null;
}

export function startServer(port = 4173) {
  const server = http.createServer(async (req, res) => {
    const file = await resolveFile(req.url);
    if (!file) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(await readFile(file));
  });
  return new Promise(r => server.listen(port, () => r(server)));
}
```

- [x] **Step 4: Write `tests/pages.mjs`**

```js
export const PAGES = [
  '/', '/events', '/gallery', '/play', '/songs', '/legal', '/blog',
  '/blog/song-of-the-week-crazy-in-love', '/blog/song-of-the-week-juicy-notorious-big',
  '/blog/how-to-plan-a-throwback-party-night', '/how-it-works',
  '/hip-hop-throwback-party', '/rnb-throwback-party', '/woodbridge-nj', '/newark-nj', '/edison-nj',
  '/sunday-day-party-nj', '/nyc-throwback-party', '/bachelorette-party', '/birthday-party', '/fundraiser-events',
];

export const FORBIDDEN_VISIBLE = [
  /bingo/i, /take\s*me\s*back/i, /takemebackbingo/i, /732[\s.\-)]*646[\s.-]*7073/, /\b80[’']?s\b/i,
];
```

- [x] **Step 5: Write `tests/brand-guard.mjs`** (checks everything a person, Google, or a share preview can see)

```js
import { chromium } from 'playwright';
import { startServer } from './static-server.mjs';
import { PAGES, FORBIDDEN_VISIBLE } from './pages.mjs';

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
          const m = value.match(re);
          if (m) {
            const i = value.search(re);
            failures.push(`${p} [${where}] ${re}: "…${value.slice(Math.max(0, i - 40), i + 40).replace(/\s+/g, ' ')}…"`);
          }
        }
      }
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
  return failures;
}
```

- [x] **Step 6: Write `tests/raw-guard.mjs`** (things that live in files but not on screen: API email templates, sitemap, form endpoints)

```js
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'tests', 'docs', 'scripts', '.vercel']);
const EXTS = new Set(['.html', '.js', '.json', '.xml', '.txt', '.css']);
export const FORBIDDEN_RAW = [
  /takemebackbingo/i, /take\s*me\s*back/i, /mbdbggbv/, /732[\s.\-)]*646[\s.-]*7073/,
  /(href|src|content|action)="[^"]*bingo/i,
];

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) yield* walk(path.join(dir, e.name)); }
    else if (EXTS.has(path.extname(e.name)) && e.name !== 'package-lock.json') yield path.join(dir, e.name);
  }
}

export async function rawGuard() {
  const failures = [];
  for await (const file of walk(ROOT)) {
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      for (const re of FORBIDDEN_RAW) if (re.test(line))
        failures.push(`${path.relative(ROOT, file)}:${i + 1} ${re}: ${line.trim().slice(0, 100)}`);
    });
  }
  return failures;
}
```

- [x] **Step 7: Write `tests/run-all.mjs`**

```js
import { brandGuard } from './brand-guard.mjs';
import { rawGuard } from './raw-guard.mjs';

const suites = { 'raw guard': rawGuard, 'brand guard': brandGuard };
const extra = process.argv.slice(2);
let failed = 0;
for (const [name, fn] of Object.entries(suites)) {
  if (extra.length && !extra.includes(name.split(' ')[0])) continue;
  const f = await fn();
  console.log(`\n== ${name}: ${f.length ? f.length + ' FAIL' : 'PASS'}`);
  f.slice(0, 60).forEach(x => console.log('  ' + x));
  if (f.length > 60) console.log(`  …and ${f.length - 60} more`);
  failed += f.length;
}
process.exit(failed ? 1 : 0);
```

Later tasks register more suites by adding imports to `suites` (each task shows the exact line).

- [x] **Step 8: Run the tests and confirm they fail**

Run: `npm test`
Expected: FAIL with hundreds of raw-guard hits, and brand-guard 404s for the renamed paths (those pages don't exist yet). This is the red baseline.

- [x] **Step 9: Create the GitHub repo, commit, push**

```bash
gh repo create robertvanliew/bangin-and-beats --private --source . --remote origin
git add -A && git commit -m "chore: scaffold Bangin' & Beats from TMBB + brand guard tests"
git push -u origin main
```

Don't connect Vercel yet (Task 11).

---

### Task 2: Brand tokens, logo assets, favicons

**Files:**
- Create: `NEW/logos/bangin-beats-logo.png` (1200w), `NEW/logos/bangin-beats-logo.webp`, `NEW/logos/favicon.png` (512), `NEW/logos/apple-touch-icon.png` (180), `NEW/logos/og-image.jpg` (1200×630, logo on #0A0A0A)
- Create: `NEW/scripts/make-logos.py`, `NEW/tests/assets.mjs`
- Delete: `NEW/logos/logo-yellow.png`, `NEW/logos/logo.png`, `NEW/logos/favicon.svg`, `NEW/logos/Resized_Take-Me-Back-FB-Profile-Pic---Shakim.jpeg`
- Modify: `NEW/styles.css:8-30` (color tokens), `NEW/styles-lp.css` (any hard-coded old colors), every `*.html` `<link rel="icon">` and logo `<img>`

**Interfaces:**
- Produces: CSS tokens `--bg #0A0A0A`, `--bg-elev #141414`, `--gold #D4AF37`, `--champagne #C9A86A`, `--cream #FFF8E7`, `--crimson #8B1A1A`, `--purple #7C3AED`. The existing names `--primary`, `--accent`, `--tape-yellow*`, `--surface-light`, `--text` are remapped so the existing components re-skin without markup changes. Logo path: `/logos/bangin-beats-logo.png` (with a `.webp` sibling).

- [x] **Step 1: Write the failing asset test `tests/assets.mjs`**

```js
import { stat } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const pngSize = buf => ({ w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) });

export async function assetsCheck() {
  const f = [];
  const need = ['logos/bangin-beats-logo.png', 'logos/bangin-beats-logo.webp', 'logos/favicon.png',
                'logos/apple-touch-icon.png', 'logos/og-image.jpg'];
  for (const rel of need) {
    try {
      const s = await stat(path.join(ROOT, rel));
      if (s.size > 400 * 1024) f.push(`${rel}: ${Math.round(s.size / 1024)} KB > 400 KB`);
      if (rel.endsWith('.png')) {
        const { w, h } = pngSize(await readFile(path.join(ROOT, rel)));
        if (Math.max(w, h) > 1600) f.push(`${rel}: ${w}x${h} exceeds 1600px`);
      }
    } catch { f.push(`${rel}: missing`); }
  }
  const css = await readFile(path.join(ROOT, 'styles.css'), 'utf8');
  for (const tok of ['#0A0A0A', '#D4AF37', '#C9A86A', '#FFF8E7', '#8B1A1A', '#7C3AED'])
    if (!css.toUpperCase().includes(tok)) f.push(`styles.css missing palette color ${tok}`);
  for (const old of ['#7B2D8E', '#C9962B', '#EFC53A', '#141111'])
    if (css.toUpperCase().includes(old)) f.push(`styles.css still has old color ${old}`);
  return f;
}
```

Register it in `tests/run-all.mjs`: add `import { assetsCheck } from './assets.mjs';` and `'assets check': assetsCheck,` to `suites`.

- [x] **Step 2: Run it and confirm it fails**

Run: `npm test -- assets`
Expected: FAIL with "missing" for all 5 files and the old colors present.

- [x] **Step 3: Write `scripts/make-logos.py`**

```python
import sys
from pathlib import Path
from PIL import Image

src = Path(sys.argv[1])
out = Path(__file__).resolve().parent.parent / "logos"
img = Image.open(src).convert("RGBA")
img = img.crop(img.getbbox())  # trim transparent margin

def fit(im, w):
    r = w / im.width
    return im.resize((w, round(im.height * r)), Image.LANCZOS)

main = fit(img, 1200)
main.save(out / "bangin-beats-logo.png", optimize=True)
main.save(out / "bangin-beats-logo.webp", quality=85, method=6)

# favicon / touch icon: square, logo centered on black
for name, size in [("favicon.png", 512), ("apple-touch-icon.png", 180)]:
    sq = Image.new("RGBA", (size, size), (10, 10, 10, 255))
    lg = fit(img, int(size * 0.9))
    sq.alpha_composite(lg, ((size - lg.width) // 2, (size - lg.height) // 2))
    sq.convert("RGB").save(out / name, optimize=True)

og = Image.new("RGBA", (1200, 630), (10, 10, 10, 255))
lg = fit(img, 900)
if lg.height > 560:
    lg = lg.resize((round(lg.width * 560 / lg.height), 560), Image.LANCZOS)
og.alpha_composite(lg, ((1200 - lg.width) // 2, (630 - lg.height) // 2))
og.convert("RGB").save(out / "og-image.jpg", quality=85, optimize=True)
print("ok")
```

Run: `python -I scripts/make-logos.py docs/owner/bangin-beats-logo-source.png`
If `bangin-beats-logo.png` comes out over 400 KB, quantize it: change the save line to `main.quantize(256, method=Image.FASTOCTREE).save(..., optimize=True)`.

- [x] **Step 4: Remove the old logo files and repoint every reference**

```bash
git rm logos/logo-yellow.png logos/logo.png logos/favicon.svg "logos/Resized_Take-Me-Back-FB-Profile-Pic---Shakim.jpeg"
grep -rl --include=*.html -E "logos/(logo-yellow|logo|favicon)\.(png|svg)" . --exclude-dir=node_modules | while read f; do
  sed -i -E \
    -e 's#<link rel="icon" type="image/svg\+xml" href="/?logos/favicon\.svg" ?/?>##' \
    -e 's#(href|content)="(https://www\.takemebackbingo\.com)?/?logos/logo\.png"#\1="\2/logos/og-image.jpg"#g' \
    -e 's#<link rel="icon" type="image/png" href="/?logos/og-image\.jpg"#<link rel="icon" type="image/png" href="/logos/favicon.png"#' \
    -e 's#<link rel="apple-touch-icon" href="/?logos/og-image\.jpg"#<link rel="apple-touch-icon" href="/logos/apple-touch-icon.png"#' \
    -e 's#src="/?logos/logo-yellow\.png"#src="/logos/bangin-beats-logo.png"#g' "$f"
done
grep -rn --include=*.html -E "logo-yellow|logos/logo\.png|favicon\.svg" . --exclude-dir=node_modules   # expect no output
```

Nav logo `<img>` tags: add `width="1200" height="` + the real height printed by `python -c "from PIL import Image;print(Image.open('logos/bangin-beats-logo.png').size)"` + `"` so iOS reserves space. The nav CSS already constrains the rendered height.

- [x] **Step 5: Re-skin the tokens in `styles.css`** (replace lines 8–30 with the following; keep all other tokens)

```css
  --bg:               #0A0A0A;   /* matte black */
  --bg-elev:          #141414;
  --surface-light:    #FFF8E7;   /* soft cream */
  --surface-card:     #FFF8E7;
  --ink:              #0A0A0A;
  --ink-soft:         rgba(10,10,10,.66);
  --ink-faint:        rgba(10,10,10,.42);

  --gold:             #D4AF37;   /* metallic gold */
  --champagne:        #C9A86A;   /* champagne gold */
  --cream:            #FFF8E7;
  --crimson:          #8B1A1A;
  --purple:           #7C3AED;

  --primary:          var(--gold);
  --accent:           var(--champagne);
  --tape-yellow:      var(--gold);       /* old "tape" components now read as gold */
  --tape-yellow-hot:  #E6C55A;
  --tape-yellow-warm: var(--champagne);

  --text:             #FFFFFF;
  --text-muted:       #C9BFA8;
  --rule:             rgba(212,175,55,.18);
  --rule-strong:      rgba(212,175,55,.40);
```

Then find hard-coded old hex values outside the token block and swap them:

```bash
grep -rnoiE "#(7B2D8E|C9962B|EFC53A|FFD84D|BC8A1E|141111|1B1717|F2EADB|EFE5D2|181212)" styles.css styles-lp.css *.html blog/*.html | sort | uniq -c
sed -i -E 's/#7B2D8E/#D4AF37/gI; s/#C9962B/#C9A86A/gI; s/#EFC53A/#D4AF37/gI; s/#FFD84D/#E6C55A/gI; s/#BC8A1E/#C9A86A/gI; s/#141111/#0A0A0A/gI; s/#1B1717/#141414/gI; s/#F2EADB/#FFF8E7/gI; s/#EFE5D2/#FFF8E7/gI; s/#181212/#0A0A0A/gI' styles.css styles-lp.css *.html blog/*.html admin/*.html
```

Also replace `rgba(123,45,142,` (old purple) with `rgba(212,175,55,` in the same files.

- [x] **Step 6: Run the test and confirm it passes**

Run: `npm test -- assets`
Expected: PASS

- [x] **Step 7: Visual check**

Run `node -e "import('./tests/static-server.mjs').then(m=>m.startServer(4173))"`, open `http://localhost:4173/` in Chrome, and confirm a black background, gold accents, and the new logo in the nav. Stop the server.

- [x] **Step 8: Commit and push**

```bash
git add -A && git commit -m "brand: black/gold palette + Bangin' & Beats logo, favicons, OG image" && git push
```

---

### Task 3: Global chrome: nav, footer, contact, newsletter (all pages)

**Files:**
- Create: `NEW/scripts/apply-chrome.mjs`, `NEW/partials/nav.html`, `NEW/partials/footer.html`
- Modify: the `<header class="nav">…</header>` and `<footer …>…</footer>` blocks in every page (21 pages; the blog posts have 2 footers each, and only the outer site footer is replaced)
- Modify: `NEW/index.html` (remove the `logo-anim` block that plays `Video/logo-anim-v2.mp4`, an old-brand animation); delete `NEW/Video/logo-anim-v2.mp4`

**Interfaces:**
- Consumes: logo path from Task 2.
- Produces: `partials/nav.html` and `partials/footer.html` as the single source; `scripts/apply-chrome.mjs` re-applies them between the `<!-- CHROME:NAV -->`/`<!-- /CHROME:NAV -->` and `<!-- CHROME:FOOTER -->`/`<!-- /CHROME:FOOTER -->` markers. Newsletter form posts to `/api/subscribe` (unchanged). Contact anchor `#contact` stays on the footer.

- [x] **Step 1: Write `partials/nav.html`**

```html
<!-- CHROME:NAV -->
<header class="nav">
  <a href="/" class="nav__logo" aria-label="Bangin' & Beats home">
    <img src="/logos/bangin-beats-logo.png" alt="Bangin' & Beats" class="nav__logo-img" />
  </a>
  <nav class="nav__links" id="primary-nav" aria-label="Primary">
    <a href="/">Home</a>
    <a href="/how-it-works">How It Works</a>
    <a href="/events">Tour Dates</a>
    <a href="/gallery">Photo Gallery</a>
    <a href="/blog">Cultural Blog</a>
    <a href="/#faq">FAQ</a>
    <a href="#contact">Contact</a>
  </nav>
  <a href="/events" class="btn btn--primary nav__cta">Get Tickets</a>
  <button type="button" class="nav__toggle" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav" onclick="(function(b){var n=b.closest('.nav');var o=n.getAttribute('data-nav-open')==='true';n.setAttribute('data-nav-open',o?'false':'true');b.setAttribute('aria-expanded',o?'false':'true');b.setAttribute('aria-label',o?'Open menu':'Close menu');})(this)"><span class="nav__toggle-bars" aria-hidden="true"></span></button>
</header>
<!-- /CHROME:NAV -->
```

Before saving, open `OLD/index.html` around line 470 and copy any extra attributes on the old `<header class="nav" …>` and logo `<a>` (for example `data-*` hooks used by the scroll JS) onto these elements.

- [x] **Step 2: Write `partials/footer.html`** (content verbatim from the spec, "QUICK LINKS SITEMAP FOOTER")

```html
<!-- CHROME:FOOTER -->
<footer class="footer" id="contact">
  <div class="footer__bleed" aria-hidden="true"></div>
  <div class="footer__inner">
    <div class="footer__crown">
      <h2 class="footer__slogan">RETRO MUSIC NOSTALGIA FOR PEOPLE WHO LOVE REAL CULTURE.</h2>
      <p>Authentic 90s &amp; 00s Hip-Hop &amp; R&amp;B live touring experiences. Sing-alongs, mainstage dance battles, premium prize drops, and unforgettable club energy all night long.</p>
      <div class="footer__ctas">
        <a href="/events" class="btn btn--primary">Explore Tour Tickets</a>
        <a href="/birthday-party" class="btn btn--ghost">Request a Private Tour Stop</a>
      </div>
    </div>
    <div class="footer__cols">
      <div class="footer__col">
        <h3>Explore the Tour</h3>
        <a href="/how-it-works">How It Works</a>
        <a href="/hip-hop-throwback-party">90s Rap Round</a>
        <a href="/rnb-throwback-party">90s R&amp;B Vibe Set</a>
        <a href="/hip-hop-throwback-party">2000s Hip-Hop Banger Set</a>
        <a href="/rnb-throwback-party">2000s R&amp;B Slow Jam Round</a>
        <a href="/sunday-day-party-nj">Sunday Day Party Dates</a>
        <a href="/woodbridge-nj">Our Woodbridge Flagship Room</a>
        <a href="/newark-nj">Newark Venue Takeovers</a>
        <a href="/edison-nj">Edison Scheduled Shows</a>
        <a href="/nyc-throwback-party">The NYC Event Tour</a>
        <a href="/events">View Upcoming Tour Dates</a>
        <a href="/gallery">Visual Media Gallery</a>
        <a href="/blog">Cultural Blog Columns</a>
        <a href="#contact">Master Contact Portal</a>
      </div>
      <div class="footer__col">
        <h3>Private Party Takeovers</h3>
        <a href="/bachelorette-party">Private Social Gatherings</a>
        <a href="/birthday-party">Celebration Custom Packages</a>
        <a href="/fundraiser-events">Non-Profit Venue Shows</a>
        <a href="#contact">Corporate Gala Takeovers</a>
        <a href="#contact">Brand Sponsorship Loops</a>
        <a href="#contact">Host a Tour Stop in Your City</a>
        <a href="#contact">Press &amp; Corporate Media Kit</a>
      </div>
      <div class="footer__col">
        <h3>Stay Locked in the Loop</h3>
        <p>New cities, fresh dates, early ticket drops. Real history, zero spam.</p>
        <form class="footer__news" action="/api/subscribe" method="POST">
          <label class="sr-only" for="footer-email">Email address</label>
          <input id="footer-email" type="email" name="email" required placeholder="Enter Email Address" />
          <button type="submit" class="btn btn--primary" aria-label="Subscribe">➔</button>
        </form>
        <p class="footer__contact">
          Hotline: <a href="tel:+12013444589">201-344-4589</a><br>
          Website: <a href="https://www.banginandbeats.com">banginandbeats.com</a><br>
          Email: <a href="mailto:info@banginandbeats.com">info@banginandbeats.com</a><br>
          Instagram: <a href="https://www.instagram.com/banginandbeats">@banginandbeats</a>
        </p>
      </div>
    </div>
    <div class="footer__legal">
      <p>© 2026 HIGH CLASS EXPERIENCE LLC. ALL RIGHTS RESERVED.</p>
      <p>Produced Exclusively by High Class Experience LLC • All Rights Reserved • Strictly 30 &amp; Up</p>
      <p><a href="/legal#privacy">Privacy Terms</a> • <a href="/legal#terms">Code Compliance</a> • <a href="/sitemap.xml">Sitemap</a> • <a href="/legal#accessibility">Accessibility</a></p>
    </div>
  </div>
</footer>
<!-- /CHROME:FOOTER -->
```

Before saving, compare against `OLD/index.html:1559-1700`. Keep any hidden inputs or the JS hook class the old newsletter form used (for example the `data-` attribute the inline submit handler queries) so the AJAX submit and success message still work. Add `.footer__cols` and `.footer__col` grid rules to `styles.css` only if the old footer didn't use equivalents. Reuse the existing class names wherever possible.

- [x] **Step 3: Write `scripts/apply-chrome.mjs`**

```js
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const nav = (await readFile(path.join(ROOT, 'partials/nav.html'), 'utf8')).trim();
const footer = (await readFile(path.join(ROOT, 'partials/footer.html'), 'utf8')).trim();
const PAGES = (await readdir(ROOT)).filter(f => f.endsWith('.html'))
  .concat((await readdir(path.join(ROOT, 'blog'))).filter(f => f.endsWith('.html')).map(f => 'blog/' + f));

const between = (html, open, close, block) => {
  const re = new RegExp(`<!-- ${open} -->[\\s\\S]*?<!-- ${close} -->`);
  return re.test(html) ? html.replace(re, block) : null;
};

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
  html = between(html, 'CHROME:NAV', '/CHROME:NAV', nav) ?? html;
  html = between(html, 'CHROME:FOOTER', '/CHROME:FOOTER', footer) ?? html;
  await writeFile(file, html);
  console.log('chrome →', rel);
}
```

Exclude `legal.html` from the nav swap only if it has no `<header class="nav">` (the script leaves pages without a match unchanged).

- [x] **Step 4: Apply and check**

```bash
node scripts/apply-chrome.mjs
grep -L "CHROME:FOOTER" *.html blog/*.html   # expect no output
```

- [x] **Step 5: Remove the old logo animation**

In `index.html`, delete the `<div class="logo-anim" data-reveal>…</div>` block that contains `Video/logo-anim-v2.mp4` and put this in its place:

```html
<div class="logo-anim" data-reveal>
  <picture>
    <source srcset="/logos/bangin-beats-logo.webp" type="image/webp">
    <img class="logo-anim__video" src="/logos/bangin-beats-logo.png" alt="Bangin' & Beats" width="1200" height="800" loading="lazy">
  </picture>
</div>
```

(Set `height` to the real height from Task 2, Step 4.) Then `git rm Video/logo-anim-v2.mp4`.

- [x] **Step 6: Run the guards**

Run: `npm test`
Expected: still FAIL overall, but no failures report `[links]` or `[text]` hits that come from the nav or footer (spot-check that `/gallery` no longer reports the footer phone number). The assets check passes.

- [x] **Step 7: Commit and push**

```bash
git add -A && git commit -m "chrome: new nav + footer (spec copy), contact details, drop old logo animation" && git push
```

---

### Task 4: Homepage copy (`index.html`)

**Files:**
- Modify: `NEW/index.html` (all sections between nav and footer, plus `<head>` meta, OG tags and JSON-LD)

**Interfaces:**
- Consumes: tokens (Task 2), chrome (Task 3).
- Produces: section ids `#how`, `#faq`, `#newsletter` stay so in-page links keep working.

Spec sections and where they go. Copy is **verbatim** from `spec-owner-copy.md` lines 1–46 and 343–375:

| Spec section | Replaces in index.html |
|---|---|
| Section 1 Hero: logo (top-centered, above the descriptor), descriptor, slogan, action hook, intro paragraph, buttons `PLAY THE BOARD ➔` → `/play`, `EXPLORE THE GALLERY ➔` → `/gallery` | the hero J-card text block (`<section class="hero">`). Keep the sizzle reel video only if Owner Input 7 confirms it has no old branding; otherwise use `photos/hero-poster-v2.jpg` as a still. |
| Section 2: four metric blocks | the stats strip under the hero |
| Section 3: "HOW WE ROCK THE ROOM." + steps 1–4 | `#how` |
| Section 4: Core Vibe Engine | new section after `#how`. Use the spec's HTML, but move its inline styles into classes `.vibe-engine`, `.vibe-engine__pill`, `.vibe-engine__headline` in `styles.css`, using `var(--gold)`/`var(--bg)` |
| Section 5: Online Board Preview | the existing play-teaser section. Button href is `/play` (the spec says `/demo`, which doesn't exist) |
| Section 6 + "FAQ • LINER NOTES" (lines 373–375): 14 questions | `#faq`. Answers: rewrite each existing TMBB answer using the Term Mapping. For new questions with no old answer, write 1–3 sentences from facts already in the spec (3 hours, $35, 30 & Up with ID, VIP tables via contact, NY/NJ, 50-mile travel, 50% deposit). Flag these for owner approval (Owner Input 5). |
| Section 7 "BY THE NUMBERS" (six stats) | the numbers band |
| "THE STORY BEHIND BANGIN' & BEATS™" block (lines 363–372) | the about/story section |
| "HOW DO I BOOK A PRIVATE EVENT?" + sidebar (lines 376–395) | the private-parties section. The button is `REQUEST A PRIVATE PARTY` → `#contact` (the Formspree form), plus `OR TEXT 201-344-4589` as `tel:` |

- [x] **Step 1: Write the failing homepage test `tests/home.mjs`**

```js
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
```

Register it: `import { homeCheck } from './home.mjs';` and `'home check': homeCheck,`.

- [x] **Step 2: Run it and confirm it fails**

Run: `npm test -- home`
Expected: FAIL listing all 10 missing strings.

- [x] **Step 3: Rewrite `<head>`**

```html
<title>Bangin' &amp; Beats™ | 90s &amp; 00s Hip-Hop &amp; R&amp;B Interactive Throwback Party | NJ &amp; NYC</title>
<meta name="description" content="Bangin' & Beats™ is a live 90s & 00s hip-hop and R&B interactive throwback party in New Jersey and NYC. Sing-along, dance, play the board, win prizes. 30 & Up. Tickets $35." />
<link rel="canonical" href="https://www.banginandbeats.com/" />
<meta property="og:title" content="Bangin' & Beats™ | Interactive Throwback Party" />
<meta property="og:description" content="SING-ALONG • DANCE • PLAY • WIN PRIZES. 90s & 00s hip-hop and R&B, live in NJ & NYC." />
<meta property="og:url" content="https://www.banginandbeats.com/" />
<meta property="og:image" content="https://www.banginandbeats.com/logos/og-image.jpg" />
<meta property="og:image:alt" content="Bangin' & Beats logo" />
<meta name="twitter:image" content="https://www.banginandbeats.com/logos/og-image.jpg" />
```

In JSON-LD: set `"name": "Bangin' & Beats"`, `"url": "https://www.banginandbeats.com/"`, `"telephone": "+1-201-344-4589"`, `"email": "info@banginandbeats.com"`, `"sameAs": ["https://www.instagram.com/banginandbeats"]`, add `"parentOrganization": {"@type": "Organization", "name": "High Class Experience LLC"}`, and rewrite every `description`/FAQ `acceptedAnswer` to match the new visible FAQ text exactly. Keep the existing `speakable` block and point its selectors at the new hero and FAQ.

- [x] **Step 4: Replace each body section per the table above**

Work top to bottom, one section at a time, keeping the existing wrapper elements and class names so the layout CSS still applies. After each section, reload `http://localhost:4174/` and check it visually.

- [x] **Step 5: Run the home and brand checks**

Run: `npm test -- home && npm test -- brand 2>&1 | grep "^  / "`
Expected: home PASS; no brand-guard lines that start with `/ [`.

- [x] **Step 6: Commit and push**

```bash
git add -A && git commit -m "home: Bangin' & Beats copy (hero, how-it-works, vibe engine, FAQ, story, private events)" && git push
```

---

### Task 5: Play page → THE BEAT BOARD™ (`play.html`)

**Files:**
- Modify: `NEW/play.html` (markup lines ~1440–1700, CONFIG ~2760, `generateCard` ~2828, `renderCard` ~2845, voice handler ~3757, share canvas ~3850–3945, `<head>` meta/JSON-LD lines 1–80)
- Create: `NEW/tests/play.mjs`

**Interfaces:**
- Produces: `CONFIG.voicePhrase = "bangin"`, `CONFIG.centerLabel = "BANGIN'"`, a global `voiceMatches(transcript: string) → boolean` (attached to `window` for testing), and era keys `90s-hiphop`, `90s-rnb`, `2000s-hiphop`, `2000s-rnb`.

- [x] **Step 1: Write the failing test `tests/play.mjs`**

```js
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
```

Register it: `import { playCheck } from './play.mjs';` and `'play check': playCheck,`.

- [x] **Step 2: Run it and confirm it fails**

Run: `npm test -- play`
Expected: FAIL: headers "BINGO", center "FREE", 6 eras, `window.voiceMatches is not a function`.

- [x] **Step 3: Game logic changes**

In CONFIG (~line 2763):

```js
  freeCenter: true,                       // center square is the BANGIN' brand stamp
  centerLabel: "BANGIN'",
  voicePhrase: "bangin",                  // lowercase substring match; also hits "banging", "bang in"
```

In `generateCard` (~line 2828):

```js
      cells.push({ title: CONFIG.centerLabel, artist: "", free: true });
```

In `renderCard` (~line 2845):

```js
    sq.setAttribute('aria-label', song.free ? "Bangin' brand square, already marked" : `${song.title} by ${song.artist}`);
```

Add next to `startVoiceListening`, and use it in `recognition.onresult` in place of `t.includes(CONFIG.voicePhrase)`:

```js
function voiceMatches(transcript) {
  const t = String(transcript || '').toLowerCase().replace(/[’']/g, '').replace(/\s+/g, '');
  return t.length > 0 && t.includes(CONFIG.voicePhrase);   // "bang in" → "bangin"
}
window.voiceMatches = voiceMatches;
```

```js
        if (voiceMatches(t)) {
```

Share canvas (~line 3851 and 3890):

```js
  ctx.fillText("· BANGIN' & BEATS™ ·", W/2, 110);
```

```js
  const headers = ['B','E','A','T','S'];
```

and at ~line 3941: `const labelText = song.free ? CONFIG.centerLabel : song.title;`

Win audio (~line 4052): leave the loader but point it at `audio/thats-bangin.mp3`. It already fails silently when the file is missing (Owner Input 8).

- [x] **Step 4: Era data**

Delete the `80s-rnb` and `80s-hiphop` era buttons (lines ~1455–1460) and their song arrays in the era data object. Set the remaining four buttons, in this order, with the first one `is-active`/`aria-selected="true"`:

```html
<div class="era-selector" role="tablist" aria-label="Choose your era">
  <button type="button" class="era-pill is-active" role="tab" data-era="90s-hiphop" aria-selected="true"><span class="era-pill__label">90s Rap Round</span></button>
  <button type="button" class="era-pill" role="tab" data-era="90s-rnb" aria-selected="false"><span class="era-pill__label">90s R&amp;B Vibe Set</span></button>
  <button type="button" class="era-pill" role="tab" data-era="2000s-hiphop" aria-selected="false"><span class="era-pill__label">2000s Hip-Hop Bangers</span></button>
  <button type="button" class="era-pill" role="tab" data-era="2000s-rnb" aria-selected="false"><span class="era-pill__label">2000s Slow Jams</span></button>
</div>
```

Find the default-era constant (`grep -n "80s-rnb" play.html`) and change it to `90s-hiphop`. After the edit, `grep -n "80s" play.html` should return nothing.

- [x] **Step 5: Visible copy** (verbatim from spec lines 47–58 and 438–445)

- Board header line 1520: `<span>B</span><span>E</span><span>A</span><span>T</span><span>S</span>`. The headers use the gold display font (`color: var(--gold)` on `.bingo__head span`).
- Badge `★ FREE ONLINE THROWBACK PREVIEW`; H1 `TEST YOUR THROWBACK VIBE.`; intro sub-text verbatim; nav row `HEAR THE TRACK • LOCK THE VIBE • CLAIM THE NIGHT`.
- Above the grid: an `<h2 class="board__title">THE BEAT BOARD™</h2>`.
- Booth idle text: `DJ BOOTH STATUS: READY TO DROP. HIT START TO ACTIVATE THE DJ.`. Round counter label `CURRENT TRACKS LOCKED: 0 / 15` (keep the JS that updates the number).
- `.dj-start__label`: `Start the DJ Mix`. `#newCardBtn`: `Shuffle the Beat Board™`. Add `<a href="/events" class="btn btn--primary btn--lg">Explore Tour Tickets ➔</a>` next to it.
- Win modal: `Hit five in a row, shout "THAT'S BANGIN'!" — we're listening.`; `#yelledItBtn` → `I SHOUTED IT`; celebration H1 `<em>THAT'S BANGIN'!</em><br>YOU WON`; the mic-blocked messages say `I SHOUTED IT` in place of `I YELLED IT`.
- Lower section: spec "WHAT IS THE INTERACTIVE EXPERIENCE ALL ABOUT?" + the two paragraphs + "CATCH THE TOUR LIVE" verbatim.
- `<head>`: title `Play The Beat Board™ Free | Bangin' & Beats™ Online Throwback Preview`, a matching description, canonical `https://www.banginandbeats.com/play`, and JSON-LD rewritten (four eras, "THAT'S BANGIN'").
- `#bingoGrid`'s `aria-label`: `The Beat Board`.

- [x] **Step 6: Run the play and brand checks**

Run: `npm test -- play && npm test -- brand 2>&1 | grep "^  /play "`
Expected: play PASS; no `/play` brand lines.

- [x] **Step 7: Manual game run**

Open `/play` and press Start the DJ Mix. A clip plays. Mark squares until five line up, then confirm the win modal, the celebration and the Download Card image show B-E-A-T-S and BANGIN'. In Chrome desktop, allow the mic and say "that's bangin'": the win claims.

- [x] **Step 8: Commit and push**

```bash
git add -A && git commit -m "play: THE BEAT BOARD - B-E-A-T-S headers, BANGIN' center, 4 eras, THAT'S BANGIN' voice win" && git push
```

---

### Task 6: Events page + events data

**Files:**
- Modify: `NEW/events.html`, `NEW/content/events.json`

- [x] **Step 1: Add the events page to the home-style must-have test.** Append to `tests/home.mjs` inside the `try`, after the home checks:

```js
    await page.goto('http://localhost:4174/events');
    const ev = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').toUpperCase());
    for (const must of ["THE ULTIMATE HIP-HOP & R&B 90'S / 00'S INTERACTIVE THROWBACK EXPERIENCE", 'BUY TICKETS — $35', 'EXPLORE PRIVATE PARTIES'])
      if (!ev.includes(must)) f.push(`events missing: ${must}`);
```

Run: `npm test -- home`. Expected: FAIL with 3 "events missing" lines.

- [x] **Step 2: Rewrite the events copy** (spec lines 65–113): the bottom callout banner, the slogan, the sub-text, and `BUY TICKETS — $35` → `/events#upcoming` (or the live ticket URL from the next event in `content/events.json`). `EXPLORE PRIVATE PARTIES` → `/birthday-party`. Apply the Term Mapping to every other visible string, including the event-card templates in the inline `<script>` that renders `events.json` (search `grep -n "bingo\|Bingo\|BINGO" events.html`).

- [x] **Step 3: Rewrite `content/events.json`.** In every event, replace "Bingo" in `title`, `description` and `subtitle` fields per the Term Mapping (for example "Hip-Hop & R&B Summer" stays, and "Take Me Back Bingo: Hip-Hop & R&B Summer" → "Bangin' & Beats™: Hip-Hop & R&B Summer"). Leave ticket URLs alone unless they contain `takemebackbingo` (then flag them to the owner: the Eventbrite/ticket listing itself needs renaming on that platform).

- [x] **Step 4: Run the checks**

Run: `npm test -- home && npm test -- brand 2>&1 | grep "^  /events "`
Expected: PASS; no `/events` brand lines.

- [x] **Step 5: Commit and push**

```bash
git add -A && git commit -m "events: Bangin' & Beats copy + events.json" && git push
```

---

### Task 7: Gallery page

**Files:**
- Modify: `NEW/gallery.html`

- [x] **Step 1: Add gallery must-haves to `tests/home.mjs`** (same pattern as Task 6)

```js
    await page.goto('http://localhost:4174/gallery');
    const ga = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').toUpperCase());
    for (const must of ['RECEIPTS FROM THE DANCE FLOOR.', 'THEY MATCHED THE TRACKS. THEY CLAIMED THE NIGHT.',
                        'TAG US TO GET FEATURED.', 'YOU COULD BE NEXT.', '#BANGINANDBEATS'])
      if (!ga.includes(must)) f.push(`gallery missing: ${must}`);
    const stamps = await page.locator('.winners__stamp-label').allInnerTexts();
    if (stamps.some(s => s.trim().toUpperCase() !== 'WINNER')) f.push(`gallery stamps: ${JSON.stringify(stamps)}`);
```

Run: `npm test -- home`. Expected: FAIL with the gallery lines.

- [x] **Step 2: Rewrite** (spec lines 114–152): badges, titles, sub-text; every `<span class="winners__stamp-label">Bingo</span>` → `WINNER` (`sed -i 's#<span class="winners__stamp-label">Bingo</span>#<span class="winners__stamp-label">WINNER</span>#g' gallery.html`); carousel header `★ AROUND THE ROOM — HOSTS, HOOKS, HANDS IN THE AIR.`; the social section with both buttons `@BANGINANDBEATS` → Instagram and TikTok URLs (Owner Input 4); the closing banners. Every `alt="… Take Me Back Bingo …"` → `alt="… Bangin' & Beats …"`:

```bash
sed -i "s/Take Me Back Bingo night/Bangin' \&amp; Beats night/g; s/Take Me Back Bingo winner/Bangin' \&amp; Beats winner/g" gallery.html
```

- [x] **Step 3: Run the checks**

Run: `npm test -- home && npm test -- brand 2>&1 | grep "^  /gallery "`
Expected: PASS; no `/gallery` lines.

- [x] **Step 4: Commit and push**

```bash
git add -A && git commit -m "gallery: Bangin' & Beats copy, WINNER stamps, @banginandbeats social hub" && git push
```

---

### Task 8: Blog index, three posts, posts.json

**Files:**
- Rename: `NEW/blog/how-to-plan-a-music-bingo-night.html` → `NEW/blog/how-to-plan-a-throwback-party-night.html`
- Modify: `NEW/blog/index.html`, `NEW/blog/song-of-the-week-crazy-in-love.html`, `NEW/blog/song-of-the-week-juicy-notorious-big.html`, `NEW/blog/story-share.js`, `NEW/content/posts.json`, `NEW/api/rss.js`

- [x] **Step 1: Add blog must-haves to `tests/home.mjs`**

```js
    const blogMust = {
      '/blog': ["SONG OF THE WEEK & THE CULTURE AROUND IT.", 'HOW TO PLAN A LIVE THROWBACK TOUR NIGHT THAT COMMANDS THE ROOM.'],
      '/blog/how-to-plan-a-throwback-party-night': ['THE THREE PILLARS OF A PACKED ROOM', 'THE DUAL TOUR TIMELINES', 'DO YOU RUN A HIGH-CAPACITY ROOM OR VENUE?'],
      '/blog/song-of-the-week-crazy-in-love': ["WHY 'CRAZY IN LOVE' STILL DOMINATES EVERY THROWBACK PARTY NIGHT.", "THE LIVE SHOW CLIMAX MOMENT."],
      '/blog/song-of-the-week-juicy-notorious-big': ["WHY 'JUICY' BY BIGGIE STOPS EVERY THROWBACK PARTY ROOM DEAD.", 'THE "JUICY EFFECT."'],
    };
    for (const [p, musts] of Object.entries(blogMust)) {
      await page.goto('http://localhost:4174' + p);
      const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').toUpperCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"'));
      for (const m of musts) if (!t.includes(m)) f.push(`${p} missing: ${m}`);
    }
```

Run: `npm test -- home`. Expected: FAIL (the renamed post 404s, and the strings are missing).

- [x] **Step 2: Rename the post**

```bash
git mv blog/how-to-plan-a-music-bingo-night.html blog/how-to-plan-a-throwback-party-night.html
grep -rl "how-to-plan-a-music-bingo-night" . --exclude-dir=node_modules --exclude-dir=.git | xargs sed -i 's#how-to-plan-a-music-bingo-night#how-to-plan-a-throwback-party-night#g'
```

- [x] **Step 3: Rewrite each page from the spec**

- `blog/index.html`: spec lines 179–200.
- `blog/how-to-plan-a-throwback-party-night.html`: spec lines 201–252. Where the spec repeats a section (Sections 8–10 appear twice), use the **first** "CORRECTED" version. Section 8's `$12,000` sentence goes in as written, but leave an HTML comment `<!-- OWNER INPUT 6: attorney to confirm "$12,000" claim -->`. `SUBMIT A VENUE INQUIRY ➔` → `/#contact`.
- `blog/song-of-the-week-crazy-in-love.html`: spec lines 253–306.
- `blog/song-of-the-week-juicy-notorious-big.html`: spec lines 307–342. The "Next show" card: `Hip-Hop & R&B Tour — Summer · Saturday, August 25, 2026 · Woodbridge, NJ · DJs: Doo Wop & DJ Tameil · Hosted by Comedian Monique Latise`. **Check with the owner:** the main site's Aug 15 event (commit `f3c498b`) conflicts with "August 25". Use whatever `content/events.json` says, and drive the card from it if the page already does.
- Each post `<head>`: title, description, canonical `https://www.banginandbeats.com/blog/<slug>`, OG, and `BlogPosting` JSON-LD with `author`/`publisher` `"Bangin' & Beats"`, `datePublished` unchanged, `dateModified` `2026-10-12`.
- `content/posts.json`: new titles, excerpts and slugs to match.
- `blog/story-share.js` and `api/rss.js`: brand strings and URLs per the Term Mapping (`grep -n -i "bingo\|take me back" blog/story-share.js api/rss.js`).

- [x] **Step 4: Run the checks**

Run: `npm test -- home && npm test -- brand 2>&1 | grep "^  /blog"`
Expected: PASS; no `/blog` lines.

- [x] **Step 5: Commit and push**

```bash
git add -A && git commit -m "blog: rebrand index + 3 posts from spec, rename planning post slug, RSS" && git push
```

---

### Task 9: Landing pages, songs, legal (rename + rewrite)

**Files:**
- Rename (git mv), per the URL Map: `what-is-music-bingo.html`→`how-it-works.html`, `hip-hop-bingo.html`→`hip-hop-throwback-party.html`, `r-b-bingo.html`→`rnb-throwback-party.html`, `bingo-woodbridge-nj.html`→`woodbridge-nj.html`, `bingo-newark-nj.html`→`newark-nj.html`, `bingo-edison-nj.html`→`edison-nj.html`, `sunday-bingo-nj.html`→`sunday-day-party-nj.html`, `music-bingo-nyc.html`→`nyc-throwback-party.html`, `bachelorette-party-bingo.html`→`bachelorette-party.html`, `birthday-party-bingo.html`→`birthday-party.html`, `music-bingo-fundraiser.html`→`fundraiser-events.html`
- Modify: those 11 plus `songs.html`, `legal.html`

- [x] **Step 1: Confirm the guard is red for these paths**

Run: `npm test -- brand 2>&1 | grep -E "HTTP 404" | wc -l`
Expected: 11.

- [x] **Step 2: Rename and fix internal links**

```bash
declare -A MAP=( [what-is-music-bingo]=how-it-works [hip-hop-bingo]=hip-hop-throwback-party [r-b-bingo]=rnb-throwback-party
  [bingo-woodbridge-nj]=woodbridge-nj [bingo-newark-nj]=newark-nj [bingo-edison-nj]=edison-nj
  [sunday-bingo-nj]=sunday-day-party-nj [music-bingo-nyc]=nyc-throwback-party
  [bachelorette-party-bingo]=bachelorette-party [birthday-party-bingo]=birthday-party [music-bingo-fundraiser]=fundraiser-events )
for old in "${!MAP[@]}"; do
  git mv "$old.html" "${MAP[$old]}.html"
  grep -rlE "/$old([\"#?]|$)" --include=*.html --include=*.js --include=*.json --include=*.xml --include=*.txt . --exclude-dir=node_modules --exclude-dir=tests \
    | xargs -r sed -i -E "s#/$old([\"#?]|\$)#/${MAP[$old]}\1#g"
done
npm test -- brand 2>&1 | grep -c "HTTP 404"   # expect 0
```

- [x] **Step 3: Rewrite each landing page**

For each of the 11 pages, keep the structure and the local-SEO substance (city names, venues, neighborhoods, FAQs) and reword every bingo reference with the Term Mapping. Each page's primary keyword becomes:

| Page | H1 / primary keyword |
|---|---|
| how-it-works | How Bangin' & Beats™ Works: The Interactive Throwback Party, Explained |
| hip-hop-throwback-party | 90s & 00s Hip-Hop Throwback Party in NJ & NYC |
| rnb-throwback-party | 90s & 00s R&B Throwback Party in NJ & NYC |
| woodbridge-nj | Throwback Hip-Hop & R&B Party in Woodbridge, NJ: Our Flagship Room |
| newark-nj | 90s & 00s Throwback Party in Newark, NJ |
| edison-nj | 90s & 00s Throwback Party in Edison, NJ |
| sunday-day-party-nj | Sunday Day Party in NJ: 90s & 00s Hip-Hop & R&B |
| nyc-throwback-party | 90s & 00s Hip-Hop & R&B Throwback Party in NYC |
| bachelorette-party | Bachelorette Party Idea in NJ & NYC: Private Throwback Party |
| birthday-party | Birthday Party Idea in NJ & NYC: Private Throwback Party |
| fundraiser-events | Throwback Party Fundraiser Nights for Non-Profits in NJ & NYC |

Each page gets a `<title>` ("<H1 short> | Bangin' & Beats™"), a meta description (≤ 155 chars, includes the city or keyword, "30 & Up", "$35" for public shows), a canonical on `https://www.banginandbeats.com/<new-slug>`, OG tags, and JSON-LD with the URLs and brand updated. FAQ JSON-LD answers must match the visible text.

`songs.html`: retitle "The Active Music Pool: 90s & 00s Hip-Hop & R&B Anthems". Remove 80s songs and sections (`grep -n "80" songs.html`).

`legal.html`: change the operator to "High Class Experience LLC, doing business as Bangin' & Beats™", the contact email to `info@banginandbeats.com`, and add `id="privacy"`, `id="terms"`, `id="accessibility"` to the matching headings (the footer links to them). Leave the substantive legal terms alone. Flag the page for the owner's attorney.

- [x] **Step 4: Run all checks**

Run: `npm test`
Expected: brand guard PASS for all 21 pages. The raw guard may still fail only on `api/`, `admin/`, `sitemap.xml`, `robots.txt`, `llms.txt`, `vercel.json` (Task 10).

- [x] **Step 5: Commit and push**

```bash
git add -A && git commit -m "pages: rename + rewrite 11 landing pages, songs, legal for Bangin' & Beats" && git push
```

---

### Task 10: Forms, emails, admin tools, SEO files

**Files:**
- Modify: `NEW/index.html`, `NEW/events.html`, `NEW/gallery.html`, `NEW/play.html` (Formspree action), `NEW/api/subscribe.js`, `NEW/api/winner.js`, `NEW/api/publish-events.js`, `NEW/api/upload-flyer.js`, `NEW/api/rss.js`, `NEW/admin/*.html`, `NEW/sitemap.xml`, `NEW/robots.txt`, `NEW/llms.txt`, `NEW/vercel.json`

**Interfaces:**
- Consumes: `FORMSPREE_ID` from Owner Input 3.
- Produces: Vercel env vars for the new project (set in Task 11): `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` (a **new** audience, "Bangin & Beats"), `NEWSLETTER_FROM="Bangin' & Beats <hello@banginandbeats.com>"`, `NEWSLETTER_REPLY_TO="info@banginandbeats.com"`, `BREVO_API_KEY`, `BREVO_WINNERS_LIST_ID` (a **new** Brevo list), `ADMIN_PASSWORD` (new value), `GH_TOKEN`, `GH_OWNER=robertvanliew`, `GH_REPO=bangin-and-beats`, `GH_BRANCH=main`, `GH_PATH=content/events.json`.

- [x] **Step 1: Confirm the raw guard fails on these files**

Run: `npm test -- raw`
Expected: FAIL. Hits in `api/`, `admin/`, the Formspree `mbdbggbv` in 4 pages, `sitemap.xml`, `robots.txt`, `llms.txt`.

- [x] **Step 2: Formspree** (contact, booking and winner-capture forms → the owner's inbox)

```bash
FORMSPREE_ID=xxxxxxxx   # the ID from Owner Input 3, e.g. the part after /f/ in the owner's new form URL
grep -rl "formspree.io/f/mbdbggbv" --include=*.html . | xargs sed -i "s#formspree.io/f/mbdbggbv#formspree.io/f/$FORMSPREE_ID#g"
```

In each form, set `<input type="hidden" name="_subject" value="New Bangin' & Beats inquiry">` (add it if it's missing). In Formspree's dashboard, add `banginandbeats.com` and `www.banginandbeats.com` to the form's allowed domains.

- [x] **Step 3: `api/subscribe.js`** (Resend newsletter)

Change the fallback `from` (line ~135) to `"Bangin' & Beats <onboarding@resend.dev>"`, update the header comment examples (lines 26–31) to banginandbeats.com, and rewrite the welcome-email HTML/text: subject `You're locked in: Bangin' & Beats™`, the brand name, links to `https://www.banginandbeats.com/events`, footer `High Class Experience LLC · info@banginandbeats.com`, and the gold `#D4AF37` / black `#0A0A0A` colors. Then `grep -n -i "bingo\|take me back" api/*.js` should print nothing.

- [x] **Step 4: `api/winner.js`, `api/publish-events.js`, `api/upload-flyer.js`, `api/rss.js`**: brand strings and URLs only. Logic stays the same. `rss.js` channel title `Bangin' & Beats™ Blog`, link `https://www.banginandbeats.com/blog`.

- [x] **Step 5: Admin**

- `admin/cards.html` (printable song cards): the default QR URL is `https://www.banginandbeats.com` and the handle `@banginandbeats` (lines 246, 250, 686, 779–780, 813–814). The printed headers become `B E A T S`, and the center cell reads `BANGIN'` (`grep -n "'B','I','N','G','O'\|FREE" admin/cards.html` and change each hit). The logo data URL comes from `/logos/bangin-beats-logo.png`.
- `admin/index.html`, `admin/events.html`, `admin/reviews.html`: titles and labels per the Term Mapping. Add `<meta name="robots" content="noindex">` if it's missing.

- [x] **Step 6: SEO files**

`sitemap.xml`: rewrite with the 21 `PAGES` from `tests/pages.mjs` as `https://www.banginandbeats.com<path>` (homepage `https://www.banginandbeats.com/`) and `<lastmod>2026-10-12</lastmod>`.

`robots.txt`:

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://www.banginandbeats.com/sitemap.xml
```

`llms.txt`: rewrite as a Bangin' & Beats™ summary. Use the Global Constraints taglines, the 21 page URLs with one-line descriptions, contact details, and "operated by High Class Experience LLC".

`vercel.json`: keep everything and add a pre-launch noindex (removed in Task 12):

```json
  "headers": [
    { "source": "/(.*)", "headers": [ { "key": "X-Robots-Tag", "value": "noindex" } ] },
```

(Prepend that object as the first entry of the existing `headers` array.)

- [x] **Step 7: Run everything**

Run: `npm test`
Expected: all suites PASS.

- [x] **Step 8: Commit and push**

```bash
git add -A && git commit -m "forms+email: owner Formspree, Resend/Brevo branding, admin card printer B-E-A-T-S, sitemap/robots/llms, pre-launch noindex" && git push
```

---

### Task 11: Deploy: Vercel project, domain, DNS, email, real-device QA

Ops work (no code tests). Each step has a concrete check.

- [ ] **Step 1: Vercel project.** Go to vercel.com → Add New → Project → import `robertvanliew/bangin-and-beats`, framework "Other", no build command, output `.`. Add every env var from Task 10's Interfaces to Production and Preview. Deploy.
  Check: the `*.vercel.app` URL loads, and `curl -sI https://<project>.vercel.app/ | grep -i x-robots` shows `noindex`.

- [ ] **Step 2: Domain.** In the project, go to Settings → Domains → add `www.banginandbeats.com` (primary) and `banginandbeats.com` (redirects to www). Copy the exact records Vercel shows into the registrar: usually an `A @ 76.76.21.21` and a `CNAME www cname.vercel-dns.com`, but use whatever values Vercel displays.
  Check: `nslookup www.banginandbeats.com` resolves; `curl -sI https://banginandbeats.com/` returns 308 → `https://www.banginandbeats.com/`; SSL is valid.

- [ ] **Step 3: Resend.** In the Resend dashboard, go to Domains → add `banginandbeats.com` and add its SPF, DKIM and return-path records at the registrar. Create the "Bangin & Beats" audience and put its ID into `RESEND_AUDIENCE_ID`. Redeploy.
  Check: the domain shows "Verified"; subscribing a test address on the live site delivers the welcome email to the inbox (not spam) from `hello@banginandbeats.com`.

- [ ] **Step 4: Inbox for `info@banginandbeats.com`** (Owner Input 2). Set up forwarding at the registrar or ImprovMX (MX records). The MX records must not conflict with Resend's records; Resend uses a `send.` subdomain, so they don't.
  Check: an email sent from a personal Gmail to `info@banginandbeats.com` arrives in the owner's inbox.

- [ ] **Step 5: Forms end-to-end.** On the live site, submit the contact form, the private-party request, the play-page winner capture, and the newsletter.
  Check: the owner receives each Formspree notification at `info@banginandbeats.com`; the winner shows up in the new Brevo list; the subscriber shows up in the new Resend audience.

- [ ] **Step 6: Admin.** Log in at `/admin` with the new `ADMIN_PASSWORD`, add a test event, and publish.
  Check: a commit lands in `bangin-and-beats` `content/events.json` (not in the old repo), and `/events` shows it within about 60 s. Delete the test event.

- [ ] **Step 7: Real iPhone check** (Review Focus 2). On an actual iPhone in Safari, load `/`, `/play`, `/gallery`, `/events` and one blog post.
  Check: the logo renders, nothing goes blank or reloads, the game starts and a clip plays, and Download Card works. Repeat on Android Chrome. Don't sign off from desktop Chromium.

- [ ] **Step 8: Owner review round.** Send the owner the live URL plus the list of FAQ answers and landing-page copy for approval (Owner Inputs 5 and 6). Apply edits and push. This counts as revision round 1 of 2.

---

### Task 12: Launch: 301 redirects from the old domain + Search Console

**Files:**
- Modify: `NEW/vercel.json` (remove the noindex header)
- Create: `NEW/tests/check-redirects.mjs`
- Modify in **OLD**: `vercel.json` (replace its contents with redirects only)

**Interfaces:**
- Consumes: the URL Map.

- [ ] **Step 1: Write `NEW/tests/check-redirects.mjs`** (Review Focus 4)

```js
const MAP = {
  '/': '/', '/events': '/events', '/gallery': '/gallery', '/play': '/play', '/songs': '/songs',
  '/legal': '/legal', '/blog': '/blog',
  '/blog/song-of-the-week-crazy-in-love': '/blog/song-of-the-week-crazy-in-love',
  '/blog/song-of-the-week-juicy-notorious-big': '/blog/song-of-the-week-juicy-notorious-big',
  '/blog/how-to-plan-a-music-bingo-night': '/blog/how-to-plan-a-throwback-party-night',
  '/what-is-music-bingo': '/how-it-works', '/hip-hop-bingo': '/hip-hop-throwback-party',
  '/r-b-bingo': '/rnb-throwback-party', '/bingo-woodbridge-nj': '/woodbridge-nj',
  '/bingo-newark-nj': '/newark-nj', '/bingo-edison-nj': '/edison-nj',
  '/sunday-bingo-nj': '/sunday-day-party-nj', '/music-bingo-nyc': '/nyc-throwback-party',
  '/bachelorette-party-bingo': '/bachelorette-party', '/birthday-party-bingo': '/birthday-party',
  '/music-bingo-fundraiser': '/fundraiser-events',
  '/some-page-that-never-existed': '/',
  '/hip-hop-bingo.html': '/hip-hop-throwback-party',
};
const NEW = 'https://www.banginandbeats.com';
const OLD_HOSTS = ['https://www.takemebackbingo.com', 'https://takemebackbingo.com'];
let fail = 0;
for (const host of OLD_HOSTS) for (const [from, to] of Object.entries(MAP)) {
  const r = await fetch(host + from, { redirect: 'manual' });
  const loc = r.headers.get('location');
  const want = NEW + to;
  if (r.status !== 301 || loc !== want) { fail++; console.log(`FAIL ${host}${from} → ${r.status} ${loc} (want 301 ${want})`); continue; }
  const t = await fetch(want, { redirect: 'manual' });
  if (t.status !== 200) { fail++; console.log(`FAIL target ${want} → ${t.status}`); }
}
console.log(fail ? `${fail} failures` : 'all redirects OK');
process.exit(fail ? 1 : 0);
```

- [ ] **Step 2: Run it against the current live site and confirm it fails**

Run: `node tests/check-redirects.mjs`
Expected: FAIL on every line (the old site still serves 200s).

- [ ] **Step 3: Remove the pre-launch noindex from NEW** by deleting the `X-Robots-Tag: noindex` object from `NEW/vercel.json`, then commit and push:

```bash
git add vercel.json && git commit -m "launch: allow indexing" && git push
```

Check: `curl -sI https://www.banginandbeats.com/ | grep -i x-robots` prints nothing.

- [ ] **Step 4: Turn OLD into a redirect server.** In `OLD`, make sure the Vercel project's domain settings serve `takemebackbingo.com` directly, with no Vercel-level apex→www redirect (otherwise the bare domain would chain 308→301). Set both domains to "Connect to an environment: Production", not "Redirect to". Then replace `OLD/vercel.json` with:

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "redirects": [
    { "source": "/blog/how-to-plan-a-music-bingo-night", "destination": "https://www.banginandbeats.com/blog/how-to-plan-a-throwback-party-night", "statusCode": 301 },
    { "source": "/what-is-music-bingo", "destination": "https://www.banginandbeats.com/how-it-works", "statusCode": 301 },
    { "source": "/hip-hop-bingo", "destination": "https://www.banginandbeats.com/hip-hop-throwback-party", "statusCode": 301 },
    { "source": "/r-b-bingo", "destination": "https://www.banginandbeats.com/rnb-throwback-party", "statusCode": 301 },
    { "source": "/bingo-woodbridge-nj", "destination": "https://www.banginandbeats.com/woodbridge-nj", "statusCode": 301 },
    { "source": "/bingo-newark-nj", "destination": "https://www.banginandbeats.com/newark-nj", "statusCode": 301 },
    { "source": "/bingo-edison-nj", "destination": "https://www.banginandbeats.com/edison-nj", "statusCode": 301 },
    { "source": "/sunday-bingo-nj", "destination": "https://www.banginandbeats.com/sunday-day-party-nj", "statusCode": 301 },
    { "source": "/music-bingo-nyc", "destination": "https://www.banginandbeats.com/nyc-throwback-party", "statusCode": 301 },
    { "source": "/bachelorette-party-bingo", "destination": "https://www.banginandbeats.com/bachelorette-party", "statusCode": 301 },
    { "source": "/birthday-party-bingo", "destination": "https://www.banginandbeats.com/birthday-party", "statusCode": 301 },
    { "source": "/music-bingo-fundraiser", "destination": "https://www.banginandbeats.com/fundraiser-events", "statusCode": 301 },
    { "source": "/", "destination": "https://www.banginandbeats.com/", "statusCode": 301 },
    { "source": "/:path(events|gallery|play|songs|legal|blog)", "destination": "https://www.banginandbeats.com/:path", "statusCode": 301 },
    { "source": "/blog/:slug(song-of-the-week-crazy-in-love|song-of-the-week-juicy-notorious-big)", "destination": "https://www.banginandbeats.com/blog/:slug", "statusCode": 301 },
    { "source": "/:path*", "destination": "https://www.banginandbeats.com/", "statusCode": 301 }
  ]
}
```

Leave the old HTML files in place (Vercel applies `redirects` before serving files), so a rollback is just reverting this one file. Commit and push OLD:

```bash
cd /c/Users/12124/Documents/Take-me-back-bingo
git add vercel.json && git commit -m "launch: 301 every URL to banginandbeats.com" && git push
```

- [ ] **Step 5: Run the redirect check and confirm it passes**

Run (from NEW): `node tests/check-redirects.mjs`
Expected: `all redirects OK`. If `/hip-hop-bingo.html` fails because cleanUrls 308s it first, add `{ "source": "/:p.html", "destination": "/:p", "statusCode": 301 }` as the **first** redirect in OLD, push, and re-run.

- [ ] **Step 6: Google Search Console**
  1. Add the property `https://www.banginandbeats.com/` (Domain property via a DNS TXT record at the registrar, which also covers the bare domain).
  2. Submit `https://www.banginandbeats.com/sitemap.xml`.
  3. In the **old** property, go to Settings → **Change of address** → choose the new property → Validate & update.
  Check: Change of address shows "approved", and the sitemap status is "Success".

- [ ] **Step 7: Off-site updates** (hand this list to the owner and tick each one off): Google Business Profile (name, website), Instagram and TikTok bio links, the Eventbrite or ticket platform's event names and links, Facebook page, Google Analytics data stream URL, and any directory listings. Confirm `takemebackbingo.com` is on **auto-renew** at its registrar.

- [ ] **Step 8: Two-week watch.** In Search Console → Pages, check for 404s on banginandbeats.com, and add any missing redirect in OLD `vercel.json` (commit and push). Re-run `node tests/check-redirects.mjs` after each change.
