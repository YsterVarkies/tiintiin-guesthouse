// Builds the layered hero from source-images/entrance.avif:
//   hero-bg-<w>.webp  – the colour-graded photo (graduated "dusk" sky, warm whites)
//   hero-fg-<w>.webp  – the same graded photo with the sky made transparent,
//                       so the giant title can sit *behind* the tree, sign and walls.
// Usage: node scripts/make-hero.mjs [--debug]
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = path.resolve('source-images/entrance.avif');
const OUT = path.resolve('public/images');
const WIDTHS = [960, 1600, 2400];
const DEBUG = process.argv.includes('--debug');

const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const N = W * H;

const graded = Buffer.alloc(N * 4);
const alpha = new Float32Array(N);

for (let y = 0; y < H; y++) {
  const v = y / H; // 0 top → 1 bottom
  // Graduated filter: deep cobalt dusk at the top, neutral below ~62%.
  const grad = smooth(0.64, 0.0, v);
  const tintR = mix(1, 0.4, grad);
  const tintG = mix(1, 0.5, grad);
  const tintB = mix(1, 0.84, grad);
  // Warm the lower half a touch (late-afternoon whites).
  const warm = smooth(0.45, 0.9, v);

  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];

    // ---- sky classification (on the original pixels) ----
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const blueness = smooth(6, 38, b - r) * smooth(-40, 2, b - g);
    const bright = smooth(150, 205, lum);
    let sky = blueness * bright;
    // The horizon is blown out to near-white: count it as sky, but only up high (no walls there).
    sky = Math.max(sky, smooth(228, 245, lum) * smooth(-14, -2, b - r) * smooth(0.46, 0.41, v));
    // Nothing below the tent / wall line is sky.
    sky *= smooth(0.5, 0.43, v);
    alpha[i] = 1 - sky;

    // ---- grade ----
    let R = (r / 255) * 0.95 * tintR;
    let G = (g / 255) * 0.95 * tintG;
    let B = (b / 255) * 0.95 * tintB;
    // Sky replacement: a deep dusk gradient so a white title reads everywhere.
    if (sky > 0) {
      const t = smooth(0.0, 0.47, v);
      const sR = mix(0.12, 0.5, t);
      const sG = mix(0.18, 0.55, t);
      const sB = mix(0.45, 0.78, t);
      const k = sky * 0.82;
      R = mix(R, sR, k);
      G = mix(G, sG, k);
      B = mix(B, sB, k);
    }
    R *= mix(1, 1.035, warm);
    B *= mix(1, 0.93, warm);
    // gentle S-curve
    const curve = (c) => {
      c = Math.min(1, Math.max(0, c));
      return c + 0.12 * c * (1 - c) * (c - 0.5) * 2;
    };
    graded[i * 4] = Math.round(curve(R) * 255);
    graded[i * 4 + 1] = Math.round(curve(G) * 255);
    graded[i * 4 + 2] = Math.round(curve(B) * 255);
    graded[i * 4 + 3] = 255;
  }
}

// Soften the matte a little so twig edges don't alias.
const alphaBuf = Buffer.alloc(N);
for (let i = 0; i < N; i++) alphaBuf[i] = Math.round(Math.min(1, Math.max(0, alpha[i])) * 255);
const { data: softAlpha, info: softInfo } = await sharp(alphaBuf, { raw: { width: W, height: H, channels: 1 } })
  .blur(0.7)
  .extractChannel(0)
  .raw()
  .toBuffer({ resolveWithObject: true });
if (softInfo.channels !== 1 || softAlpha.length !== N) throw new Error(`matte has ${softInfo.channels} channels`);

const fg = Buffer.from(graded);
for (let i = 0; i < N; i++) fg[i * 4 + 3] = softAlpha[i];

fs.mkdirSync(OUT, { recursive: true });
for (const w of WIDTHS) {
  await sharp(graded, { raw: { width: W, height: H, channels: 4 } })
    .removeAlpha()
    .resize({ width: w })
    .webp({ quality: 80, effort: 5 })
    .toFile(path.join(OUT, `hero-bg-${w}.webp`));
  await sharp(fg, { raw: { width: W, height: H, channels: 4 } })
    .resize({ width: w })
    .webp({ quality: 80, alphaQuality: 90, effort: 5 })
    .toFile(path.join(OUT, `hero-fg-${w}.webp`));
  console.log(`✓ hero ${w}px`);
}

if (DEBUG) {
  // Visual check: foreground over a hot-pink plate (pink = where the title will show).
  const plate = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    const a = softAlpha[i] / 255;
    plate[i * 4] = Math.round(graded[i * 4] * a + 255 * (1 - a));
    plate[i * 4 + 1] = Math.round(graded[i * 4 + 1] * a + 20 * (1 - a));
    plate[i * 4 + 2] = Math.round(graded[i * 4 + 2] * a + 147 * (1 - a));
    plate[i * 4 + 3] = 255;
  }
  const dbg = process.argv[process.argv.indexOf('--debug') + 1] || 'hero-debug.jpg';
  await sharp(plate, { raw: { width: W, height: H, channels: 4 } })
    .removeAlpha()
    .resize({ width: 1400 })
    .jpeg({ quality: 82 })
    .toFile(dbg);
  console.log(`debug plate → ${dbg}`);
}
console.log(`source ${W}x${H}`);
