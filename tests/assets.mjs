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
