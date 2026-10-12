import { brandGuard } from './brand-guard.mjs';
import { rawGuard } from './raw-guard.mjs';
import { assetsCheck } from './assets.mjs';

// Later tasks add suites here (see docs/2026-10-12-bangin-and-beats-rebrand.md).
// `npm test -- raw` runs only suites whose first word matches.
const suites = {
  'raw guard': rawGuard,
  'brand guard': brandGuard,
  'assets check': assetsCheck,
};
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
