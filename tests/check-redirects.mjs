// Launch check (plan Task 12): every old-domain URL must 301 straight to its
// banginandbeats.com match, and that target must return 200.
//   node tests/check-redirects.mjs
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
const targets = new Map();
for (const host of OLD_HOSTS) for (const [from, to] of Object.entries(MAP)) {
  const r = await fetch(host + from, { redirect: 'manual' });
  const loc = r.headers.get('location');
  const want = NEW + to;
  if (r.status !== 301 || loc !== want) { fail++; console.log(`FAIL ${host}${from} → ${r.status} ${loc} (want 301 ${want})`); continue; }
  if (!targets.has(want)) targets.set(want, (await fetch(want, { redirect: 'manual' })).status);
  if (targets.get(want) !== 200) { fail++; console.log(`FAIL target ${want} → ${targets.get(want)}`); }
}
console.log(fail ? `${fail} failures` : 'all redirects OK');
process.exit(fail ? 1 : 0);
