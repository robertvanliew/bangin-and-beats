// The static copies of the events and blog lists must match content/*.json
// (scripts/stamp-content.mjs writes them; crawlers read them).
import { execFileSync } from 'node:child_process';
import path from 'node:path';

export async function stampCheck() {
  const script = path.resolve(import.meta.dirname, '../scripts/stamp-content.mjs');
  try { execFileSync(process.execPath, [script, '--check'], { stdio: 'pipe' }); return []; }
  catch (e) { return String(e.stdout || e.message).trim().split('\n').filter(Boolean); }
}
