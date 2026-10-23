// Pre-renders the JSON-driven lists into the HTML so search engines and AI
// crawlers (which often don't run JavaScript) see real content:
//   - events.html: past + upcoming event cards, and Event JSON-LD for upcoming dates
//   - blog/index.html: the post cards
// The pages' own scripts still re-render from /content/*.json on load, so an
// admin publish shows instantly; this static copy catches up on the next run.
//   node scripts/stamp-content.mjs          write files
//   node scripts/stamp-content.mjs --check  exit 1 if a file is out of date
// .github/workflows/stamp-content.yml runs it on every push that touches content/.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE = 'https://www.banginandbeats.com';
const check = process.argv.includes('--check');
const read = f => readFileSync(path.join(ROOT, f), 'utf8');

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const stamp = (html, name, body) => {
  const re = new RegExp(`(<!-- STAMP:${name} -->)[\\s\\S]*?(<!-- /STAMP:${name} -->)`);
  if (!re.test(html)) throw new Error(`missing STAMP:${name} markers`);
  return html.replace(re, (_, a, b) => `${a}\n${body}\n${b}`);
};

// America/New_York offset for a local "YYYY-MM-DDTHH:MM" (EDT -04:00, EST -05:00).
function nyOffset(local) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'shortOffset' })
    .formatToParts(new Date(local + ':00Z')).find(x => x.type === 'timeZoneName').value;
  const n = parseInt(p.replace('GMT', ''), 10) || -5;
  return (n < 0 ? '-' : '+') + String(Math.abs(n)).padStart(2, '0') + ':00';
}

// ---------- events ----------
const events = JSON.parse(read('content/events.json'));
const badge = s => s === 'soldout' ? ['event-card__badge--sold', 'Sold Out'] : s === 'past' ? ['event-card__badge--sold', 'Past'] : ['', 'On Sale'];

function eventCard(e, isPast) {
  const [cls, label] = badge(e.status);
  const rows = [
    e.dateLabel && `<div><dt>Date</dt><dd>${esc(e.dateLabel)}</dd></div>`,
    e.venueAddr && `<div><dt>Venue</dt><dd>${esc(e.venueAddr)}</dd></div>`,
    e.timeLabel && `<div><dt>Doors</dt><dd>${esc(e.timeLabel)}</dd></div>`,
  ].filter(Boolean).join('');
  return `<li class="event-card${isPast ? ' event-card--past' : ''}" id="${esc(e.id)}">
  <div class="event-card__body">
    <span class="event-card__badge ${cls}">${esc(label)}</span>
    ${e.kicker ? `<p class="event-card__kicker">${esc(e.kicker)}</p>` : ''}
    <h3 class="event-card__title">${esc(e.title)}</h3>
    ${rows ? `<dl class="event-card__meta">${rows}</dl>` : ''}
    ${e.copy ? `<p class="event-card__copy">${esc(e.copy)}</p>` : ''}
  </div>
</li>`;
}

// Same shape as buildSchema() in events.html. Upcoming dates only: Google
// shows event results for future events, and past ones shouldn't claim "scheduled".
function eventSchema(e) {
  const url = `${SITE}/events#${e.id}`;
  const availability = e.status === 'soldout' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock';
  const performer = [];
  if (e.dj) performer.push({ '@type': 'Person', name: e.dj });
  if (e.host) performer.push({ '@type': 'Person', name: e.host });
  const ticketUrl = e.simpletix || e.eventbrite || e.posh || url;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Bangin' & Beats: ${e.title}`,
    startDate: e.startDate + ':00' + nyOffset(e.startDate),
    ...(e.endDate ? { endDate: e.endDate + ':00' + nyOffset(e.endDate) } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: e.venue || 'Lake Chateau Banquets',
      address: { '@type': 'PostalAddress', streetAddress: e.street || '', addressLocality: e.city || '', addressRegion: e.region || '', postalCode: e.postal || '', addressCountry: 'US' },
    },
    image: [e.flyer ? `${SITE}/${e.flyer.replace(/^\//, '')}` : `${SITE}/logos/og-image.jpg`],
    description: e.copy || `${e.title} at ${e.venue || 'Lake Chateau Banquets'}.`,
    url,
    organizer: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: "Bangin' & Beats", url: `${SITE}/` },
    typicalAgeRange: '30+',
    offers: { '@type': 'Offer', name: e.priceLabel || 'General admission', price: e.price || '35.00', priceCurrency: 'USD', availability, url: ticketUrl },
    ...(performer.length ? { performer } : {}),
    ...([e.eventbrite, e.posh, e.fb].some(Boolean) ? { sameAs: [e.eventbrite, e.posh, e.fb].filter(Boolean) } : {}),
  };
}

const byDate = (a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0);
const upcoming = events.filter(e => e.section === 'upcoming').sort(byDate);
const past = events.filter(e => e.section === 'past').sort((a, b) => -byDate(a, b));
const emptyUpcoming = `<li class="event-card event-card--empty"><div class="event-card__body" style="padding:32px;"><p class="event-card__copy">New tour dates drop soon. Tickets land here first. Join the list and you&rsquo;ll know before anyone.</p><div class="event-card__cta-row"><a class="btn btn--primary btn--lg" href="#newsletter">Get Notified</a></div></div></li>`;

let ev = read('events.html');
ev = stamp(ev, 'EVENTS-UPCOMING', upcoming.length ? upcoming.map(e => eventCard(e, false)).join('\n') : emptyUpcoming);
ev = stamp(ev, 'EVENTS-PAST', past.map(e => eventCard(e, true)).join('\n'));
ev = stamp(ev, 'EVENTS-SCHEMA', upcoming.filter(e => e.startDate)
  .map(e => `<script type="application/ld+json" data-events-schema>\n${JSON.stringify(eventSchema(e), null, 2)}\n</script>`).join('\n'));

// ---------- blog ----------
const posts = JSON.parse(read('content/posts.json'))
  .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
const blogCard = p => {
  const date = new Date(String(p.publishedAt).slice(0, 10) + 'T12:00:00Z')
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const img = p.coverImage ? `/${p.coverImage.replace(/^\//, '').replace(/^(photos\/.+)\.jpg$/, '$1-800.jpg')}` : '/logos/og-image.jpg';
  return `<a class="blog-card" href="/${esc(p.path.replace(/^\//, ''))}">
  <img class="blog-card__img" src="${esc(img)}" alt="${esc(p.coverImageAlt || p.title)}" loading="lazy" width="800" height="533" />
  <div class="blog-card__body">
    <span class="blog-card__eyebrow">${esc(p.badge || (p.tags && p.tags[0]) || 'Post')}</span>
    <h2 class="blog-card__title">${esc(p.title)}</h2>
    <p class="blog-card__excerpt">${esc(p.excerpt || '')}</p>
    <div class="blog-card__meta"><span><time datetime="${esc(String(p.publishedAt).slice(0, 10))}">${esc(date)}</time></span>${p.readMinutes ? `<span>${esc(p.readMinutes)} min read</span>` : ''}</div>
  </div>
</a>`;
};
let blog = read('blog/index.html');
blog = stamp(blog, 'BLOG-LIST', posts.map(blogCard).join('\n'));

// ---------- write / check ----------
let stale = 0;
for (const [f, next] of [['events.html', ev], ['blog/index.html', blog]]) {
  if (read(f) === next) continue;
  if (check) { stale++; console.log(`stale: ${f} (run node scripts/stamp-content.mjs)`); }
  else { writeFileSync(path.join(ROOT, f), next); console.log(`stamped ${f}`); }
}
if (check && stale) process.exit(1);
if (!check) console.log(`events: ${upcoming.length} upcoming, ${past.length} past · posts: ${posts.length}`);
