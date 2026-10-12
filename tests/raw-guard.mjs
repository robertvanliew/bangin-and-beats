import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

// Things that live in files but not on screen: API email templates, sitemap, form endpoints.
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
