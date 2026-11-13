import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);
gsap.defaults({ ease: 'power3.out' });

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const isCoarsePointer = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

let lenis = null;

/**
 * One Lenis instance for the whole page, driven by GSAP's ticker so ScrollTrigger stays in sync.
 * Touch devices are skipped on purpose: Lenis re-implements scrolling in JS on the main thread,
 * which is what Lenis exists for on desktop (smoothing "notchy" mouse-wheel deltas into fluid
 * motion) — but a phone's native touch-scroll is already compositor-driven momentum scrolling,
 * smoother than any main-thread virtual scroll can be once GSAP/ScrollTrigger or anything else
 * is competing for the same frame. Every Lenis call site here already falls back to plain native
 * scrolling when this returns null, so skipping it on touch is a safe, local decision.
 */
export function startSmoothScroll() {
  if (lenis || prefersReducedMotion() || isCoarsePointer()) return lenis;
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export const getLenis = () => lenis;

export function lockScroll(locked) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.classList.toggle('is-locked', locked);
}

/** Smooth-scroll to a selector / element / pixel offset, falling back to native scrolling. */
export function scrollToTarget(target, opts = {}) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (typeof el === 'number') window.scrollTo({ top: el, behavior: 'smooth' });
  else el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/** Scroll velocity in px/s (0 when Lenis is off); used by the 3D bottles for "wind". */
export const scrollVelocity = () => (lenis ? lenis.velocity * 60 : 0);
