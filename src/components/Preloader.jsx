import { useRef } from 'react';
import { gsap, useGSAP, lockScroll, prefersReducedMotion } from '../lib/motion';
import { Star } from './ui/Icon';
import './Preloader.css';

const waitForImages = (selector) =>
  Promise.all(
    [...document.querySelectorAll(selector)].map((img) =>
      img.tagName === 'VIDEO'
        ? img.readyState >= 2
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener('loadeddata', res, { once: true });
              img.addEventListener('error', res, { once: true });
            })
        : img.complete && img.naturalWidth
        ? img.decode?.().catch(() => {}) ?? Promise.resolve()
        : new Promise((res) => {
            img.addEventListener('load', () => (img.decode?.() ?? Promise.resolve()).catch(() => {}).then(res), { once: true });
            img.addEventListener('error', res, { once: true });
          })
    )
  );

const timeout = (ms) => new Promise((res) => setTimeout(res, ms));

export default function Preloader({ onDone }) {
  const root = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      lockScroll(true);

      const finish = () => {
        lockScroll(false);
        onDone?.();
      };

      if (prefersReducedMotion()) {
        Promise.race([Promise.all([waitForImages('.hero__img'), document.fonts?.ready]), timeout(4000)]).then(() => {
          gsap.to(root.current, { autoAlpha: 0, duration: 0.4, onComplete: finish });
        });
        return;
      }

      const count = { v: 0 };
      const num = q('.preloader__num')[0];
      const bar = q('.preloader__bar span')[0];
      const render = () => {
        num.textContent = String(Math.round(count.v)).padStart(3, '0');
        bar.style.transform = `scaleX(${count.v / 100})`;
      };

      const intro = gsap.timeline();
      intro
        .from(q('.preloader__char'), { yPercent: 110, duration: 1.1, stagger: 0.045, ease: 'expo.out' }, 0.1)
        .from(q('.preloader__star'), { scale: 0, rotate: -120, duration: 1, stagger: 0.08, ease: 'back.out(2)' }, 0.45)
        .from(q('.preloader__meta > *'), { autoAlpha: 0, y: 12, duration: 0.8, stagger: 0.08 }, 0.4);

      const crawl = gsap.to(count, { v: 88, duration: 2.2, ease: 'power2.out', onUpdate: render });

      const assets = Promise.race([
        Promise.all([waitForImages('.hero__img'), document.fonts?.ready, timeout(1500)]),
        timeout(7000),
      ]);

      assets.then(() => {
        crawl.kill();
        const out = gsap.timeline({ onComplete: () => gsap.set(root.current, { display: 'none' }) });
        out
          .to(count, { v: 100, duration: 0.6, ease: 'power2.inOut', onUpdate: render })
          .to(q('.preloader__char, .preloader__star'), { yPercent: -120, duration: 0.8, stagger: 0.025, ease: 'expo.in' }, '+=0.05')
          .to(q('.preloader__meta > *, .preloader__count'), { autoAlpha: 0, duration: 0.4 }, '<')
          .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.25, ease: 'expo.inOut' }, '-=0.25')
          .call(finish, null, '-=0.95');
      });
    },
    { scope: root }
  );

  const word = 'TiinTiin';
  return (
    <div className="preloader" ref={root} role="status" aria-label="Loading Guesthouse TiinTiin">
      <div className="preloader__mark display" aria-hidden="true">
        <span className="preloader__stars">
          <Star className="preloader__star" />
          <Star className="preloader__star" />
        </span>
        <span className="preloader__word">
          {word.split('').map((c, i) => (
            <span className="preloader__char" key={i}>
              {c}
            </span>
          ))}
        </span>
        <span className="preloader__stars">
          <Star className="preloader__star" />
          <Star className="preloader__star" />
        </span>
      </div>
      <div className="preloader__meta">
        <span>Guesthouse</span>
        <span>Potchefstroom · North West</span>
      </div>
      <div className="preloader__count" aria-hidden="true">
        <span className="preloader__num">000</span>
      </div>
      <div className="preloader__bar" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
