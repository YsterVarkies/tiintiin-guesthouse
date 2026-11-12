// Converts everything in source-images/ (except the hero, see make-hero.mjs)
// into responsive WebP files in public/images/ and writes src/data/images.json
// with intrinsic sizes + a tiny blurred placeholder for each image.
//
// Usage: node scripts/optimize-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = path.resolve('source-images');
const OUT = path.resolve('public/images');
const MANIFEST = path.resolve('src/data/images.json');
const WIDTHS = [640, 1280, 1920];
const SKIP = new Set(['entrance', 'welcome-poster']);

fs.mkdirSync(OUT, { recursive: true });

const files = fs
  .readdirSync(SRC)
  .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
  .sort();

const manifest = {};

for (const file of files) {
  const name = file.replace(/\.[^.]+$/, '');
  if (SKIP.has(name)) continue;

  const input = sharp(path.join(SRC, file), { failOn: 'none' }).rotate();
  const meta = await input.metadata();
  const srcW = meta.width;
  const srcH = meta.height;

  const widths = WIDTHS.filter((w) => w < srcW);
  if (!widths.includes(Math.min(srcW, 1920))) widths.push(Math.min(srcW, 1920));

  for (const w of widths) {
    await sharp(path.join(SRC, file), { failOn: 'none' })
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .modulate({ saturation: 1.04 })
      .webp({ quality: 76, effort: 5 })
      .toFile(path.join(OUT, `${name}-${w}.webp`));
  }

  const blurBuf = await sharp(path.join(SRC, file), { failOn: 'none' })
    .rotate()
    .resize({ width: 24 })
    .blur(1.2)
    .webp({ quality: 40 })
    .toBuffer();

  manifest[name] = {
    w: srcW,
    h: srcH,
    widths: widths.sort((a, b) => a - b),
    blur: `data:image/webp;base64,${blurBuf.toString('base64')}`,
  };
  console.log(`✓ ${name} ${srcW}x${srcH} → ${widths.join(', ')}`);
}

fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`\nWrote ${Object.keys(manifest).length} entries to ${path.relative(process.cwd(), MANIFEST)}`);
