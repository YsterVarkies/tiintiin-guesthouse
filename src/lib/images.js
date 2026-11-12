import manifest from '../data/images.json';

const BASE = `${import.meta.env.BASE_URL}images/`;

export const imageMeta = (name) => manifest[name];

/** URL of the closest generated width that is >= the requested width. */
export function imageUrl(name, want = 1280) {
  const m = manifest[name];
  if (!m) return '';
  const w = m.widths.find((x) => x >= want) ?? m.widths[m.widths.length - 1];
  return `${BASE}${name}-${w}.webp`;
}

export function imageSrcSet(name) {
  const m = manifest[name];
  if (!m) return undefined;
  return m.widths.map((w) => `${BASE}${name}-${w}.webp ${w}w`).join(', ');
}

export const heroSrc = {
  bg: [960, 1600, 2400].map((w) => `${BASE}hero-bg-${w}.webp ${w}w`).join(', '),
  fg: [960, 1600, 2400].map((w) => `${BASE}hero-fg-${w}.webp ${w}w`).join(', '),
  bgMobile: [960, 1600].map((w) => `${BASE}hero-bg-${w}.webp ${w}w`).join(', '),
  fgMobile: [960, 1600].map((w) => `${BASE}hero-fg-${w}.webp ${w}w`).join(', '),
  bgFallback: `${BASE}hero-bg-1600.webp`,
  fgFallback: `${BASE}hero-fg-1600.webp`,
  aspect: 1.5,
};
