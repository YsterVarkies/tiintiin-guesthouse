import { useEffect, useRef } from 'react';
import { gsap, SplitText, useGSAP, prefersReducedMotion, isFinePointer, isCoarsePointer, scrollToTarget } from '../lib/motion';
import { heroSrc } from '../lib/images';
import { createHeroAtmosphere } from '../three/heroAtmosphere';
import { contact, hero, rating } from '../data/site';
import Img from './ui/Img';
import Icon from './ui/Icon';
import './Hero.css';

// Pins are placed in % of the photo, so they stay glued to the gate and the courtyard.
const hotspots = [
  {
    id: 'pool',
    pin: { x: 72.5, y: 53 },
    dir: 'up',
    image: 'pool-wide',
    title: ['Plunge', 'pool'],
    text: 'Behind the white walls: cool blue water, a stone Buddha and nowhere you need to be.',
  },
  {
    id: 'breakfast',
    pin: { x: 55.2, y: 64.5 },
    dir: 'down',
    image: 'dining',
    title: ['Breakfast,', 'with love'],
    text: 'Lana’s long table, set by candlelight. By arrangement, or packed to go.',
    flip: true,
  },
];

// Phones get at most the 1600px layers (the 2400px ones are for big screens), bg and fg always in step.
function HeroImage({ kind, priority = false }) {
  return (
    <picture>
      <source media="(max-width: 760px)" srcSet={heroSrc[`${kind}Mobile`]} sizes="150svh" />
      <img
        className="hero__img"
        src={heroSrc[`${kind}Fallback`]}
        srcSet={heroSrc[kind]}
        sizes="(max-aspect-ratio: 3/2) 150svh, 100vw"
        alt=""
        fetchPriority={priority ? 'high' : undefined}
        draggable="false"
      />
    </picture>
  );
}

function Hotspot({ spot }) {
  return (
    <div className={`hotspot hotspot--${spot.dir}`} style={{ left: `${spot.pin.x}%`, top: `${spot.pin.y}%` }}>
      <span className="hotspot__dot" aria-hidden="true" />
      <span className="hotspot__line" aria-hidden="true" />
      <article className={`hotspot__card glass-card${spot.flip ? ' is-flipped' : ''}`}>
        <div className="hotspot__thumb">
          <Img name={spot.image} sizes="140px" want={640} alt="" />
        </div>
        <div className="hotspot__body">
          <h3 className="hotspot__title">
            {spot.title[0]}
            <br />
            {spot.title[1]}
          </h3>
          <p className="hotspot__text">{spot.text}</p>
        </div>
      </article>
    </div>
  );
}

export default function Hero({ ready }) {
  const root = useRef(null);
  const canvasRef = useRef(null);
  const atmosphere = useRef(null);

  // Three.js atmosphere (dust + light shafts). Desktop only: a continuous WebGL shader fill
  // competes for the same frame budget as Lenis's smooth scroll and the scroll-linked GSAP
  // timeline below, which is what made scrolling past the hero feel laggy on phones. Pointer
  // parallax and the glass hotspot cards already skip on mobile/touch for the same reason —
  // the photo itself, and its CSS/GSAP parallax, are unaffected and still look good without it.
  useEffect(() => {
    if (!canvasRef.current || prefersReducedMotion() || window.innerWidth < 760) return undefined;
    let api;
    try {
      api = createHeroAtmosphere(canvasRef.current);
    } catch {
      return undefined; // no WebGL: the photo still works on its own
    }
    atmosphere.current = api;
    return () => {
      api.dispose();
      atmosphere.current = null;
    };
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const stages = q('.hero__stage');
      const layers = q('.hero__layer');
      const reduce = prefersReducedMotion();
      const touch = isCoarsePointer();

      if (!ready) {
        if (!reduce) {
          gsap.set(layers, { scale: 1.16, transformOrigin: '58% 46%' });
          gsap.set(q('.hero__title, .hero__intro, .hero__scroll, .hotspot'), { autoAlpha: 0 });
        }
        return;
      }

      if (reduce) {
        gsap.set(q('.hero__title, .hero__intro, .hero__scroll, .hotspot'), { autoAlpha: 1 });
        return;
      }

      const lines = SplitText.create(q('.hero__line'), { type: 'chars,lines', mask: 'lines', charsClass: 'hero__char' });
      const intro = SplitText.create(q('.hero__lede, .hero__copy'), { type: 'lines', mask: 'lines' });

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.to(layers, { scale: 1, duration: 2.8, ease: 'expo.out' }, 0)
        .fromTo(q('.hero__veil'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 1.8, ease: 'power2.out' }, 0)
        .set(q('.hero__title'), { autoAlpha: 1 }, 0.15)
        .from(
          lines.chars,
          { yPercent: 115, rotate: 6, filter: 'blur(8px)', duration: 1.5, stagger: 0.05, clearProps: 'filter' },
          0.2
        )
        .call(() => atmosphere.current?.setStrength(1), null, 0.4)
        .set(q('.hero__intro'), { autoAlpha: 1 }, 0.8)
        .from(intro.lines, { yPercent: 105, duration: 1.2, stagger: 0.06 }, 0.8)
        .from(q('.hero__tags .tag'), { autoAlpha: 0, y: 10, duration: 1, stagger: 0.08 }, 1.1)
        .set(q('.hotspot'), { autoAlpha: 1 }, 1.0)
        .from(q('.hotspot__dot'), { scale: 0, duration: 0.9, stagger: 0.18, ease: 'back.out(3)' }, 1.0)
        .from(q('.hotspot__line'), { scaleY: 0, duration: 0.9, stagger: 0.18, ease: 'power3.inOut' }, 1.15)
        .from(q('.hotspot__card'), { autoAlpha: 0, y: 18, filter: 'blur(10px)', duration: 1.1, stagger: 0.18, clearProps: 'filter' }, 1.45)
        .set(q('.hero__scroll'), { autoAlpha: 1 }, 1.3)
        .from(q('.hero__scroll-btn'), { scale: 0, duration: 1.1, ease: 'back.out(1.8)' }, 1.3)
        .from(q('.hero__scroll-label'), { autoAlpha: 0, x: 12, duration: 0.9 }, 1.5)
        .fromTo(q('.hero__ring circle'), { strokeDashoffset: 283 }, { strokeDashoffset: 18, duration: 1.6, ease: 'power3.inOut' }, 1.4);

      // Touch devices stop here. A phone scrolls the page on its own fast thread, and anything
      // script-driven and tied to scroll position lands a frame (or, on a busy page, several)
      // behind it — on iPhone that showed as the hero photo juddering up and down while you
      // scrolled. So on touch the hero simply scrolls with the page: no parallax, no breathing.
      if (touch) return undefined;

      // Slow "breathing" camera so the still photo feels filmed.
      tl.to(layers, { scale: 1.028, duration: 16, ease: 'sine.inOut', repeat: -1, yoyo: true }, 2.8);

      // Scroll: the scene sinks and melts into the night section below.
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => atmosphere.current?.setStrength(1 - self.progress * 1.3),
        },
      });
      scrollTl
        .to(stages, { yPercent: 14, ease: 'none' }, 0)
        .to(q('.hero__title'), { yPercent: -38, ease: 'none' }, 0)
        // explicit start values: at creation these are still hidden by the intro, which must not become the "from"
        .fromTo(
          q('.hero__intro, .hero__scroll'),
          { y: 0, autoAlpha: 1 },
          { y: -60, autoAlpha: 0, ease: 'none', immediateRender: false },
          0
        )
        .to(q('.hero__shade--scroll'), { opacity: 1, ease: 'none' }, 0);

      // Pointer parallax: the scene drifts like a hand-held camera; the title sits a plane behind.
      if (isFinePointer()) {
        const sx = stages.map((s) => gsap.quickTo(s, 'x', { duration: 1.4, ease: 'power3.out' }));
        const sy = stages.map((s) => gsap.quickTo(s, 'y', { duration: 1.4, ease: 'power3.out' }));
        const title = q('.hero__title-inner')[0];
        const tx = gsap.quickTo(title, 'x', { duration: 1.6, ease: 'power3.out' });
        const ty = gsap.quickTo(title, 'y', { duration: 1.6, ease: 'power3.out' });
        const onMove = (e) => {
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          const ny = (e.clientY / window.innerHeight) * 2 - 1;
          sx.forEach((fn) => fn(-nx * 16));
          sy.forEach((fn) => fn(-ny * 10));
          tx(-nx * 6);
          ty(-ny * 4);
          atmosphere.current?.setPointer(nx, ny);
        };
        window.addEventListener('pointermove', onMove);
        return () => window.removeEventListener('pointermove', onMove);
      }
      return undefined;
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section className="hero" id="top" ref={root} aria-label="Welcome to Guesthouse TiinTiin">
      {/* 1 · photo */}
      <div className="hero__stage hero__stage--back" aria-hidden="true">
        <div className="hero__layer">
          {hero.video ? (
            <video className="hero__img" src={hero.video} poster={heroSrc.bgFallback} autoPlay muted loop playsInline />
          ) : (
            <HeroImage kind="bg" priority />
          )}
        </div>
      </div>

      {/* 2 · title, which sits between the sky and everything else */}
      <h1 className="hero__title">
        <span className="sr-only">Guesthouse TiinTiin, Potchefstroom</span>
        <span className="hero__title-inner display" aria-hidden="true">
          <span className="hero__line">TiinTiin</span>
          <span className="hero__line">Guesthouse</span>
        </span>
      </h1>

      {/* 3 · the tree, sign, tent and walls, cut out of the same photo (a still cut-out can't follow a video) */}
      {!hero.video && (
        <div className="hero__stage hero__stage--front" aria-hidden="true">
          <div className="hero__layer">
            <HeroImage kind="fg" />
          </div>
        </div>
      )}

      {/* 4 · light + dust */}
      <div className="hero__atmosphere" ref={canvasRef} aria-hidden="true" />

      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__shade hero__shade--scroll" aria-hidden="true" />
      <div className="hero__veil" aria-hidden="true" />

      {/* 5 · glass hotspot cards pinned to the scene */}
      <div className="hero__stage hero__stage--ui">
        <div className="hero__layer">
          {hotspots.map((s) => (
            <Hotspot key={s.id} spot={s} />
          ))}
        </div>
      </div>

      <div className="hero__intro">
        <p className="hero__lede">Comfort, tranquility and genuine hospitality in the heart of Potch</p>
        <p className="hero__copy">
          Whether you’re here on business, for a weekend away or simply passing through: four art-filled rooms, a
          plunge pool and a host who makes you feel at home.
        </p>
        <p className="hero__tags">
          <span className="tag">{`{ ${contact.street} }`}</span>
          <span className="tag">{`{ ${rating.score}/10 on ${rating.source} }`}</span>
        </p>
      </div>

      <button type="button" className="hero__scroll" onClick={() => scrollToTarget('#story')}>
        <span className="hero__scroll-label">come inside</span>
        <span className="hero__scroll-btn">
          <svg className="hero__ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="45" pathLength="283" strokeDasharray="283" />
          </svg>
          <span className="hero__scroll-core">
            <Icon name="arrowDown" size={22} />
          </span>
        </span>
        <span className="sr-only">Scroll to our story</span>
      </button>
    </section>
  );
}
