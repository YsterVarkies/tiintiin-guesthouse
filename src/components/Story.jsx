import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion, scrollVelocity } from '../lib/motion';
import { imageUrl } from '../lib/images';
import { rating } from '../data/site';
import ScrollReveal from './reactbits/ScrollReveal';
import CountUp from './reactbits/CountUp/CountUp';
import Img from './ui/Img';
import './Story.css';

const stats = [
  { to: 10, suffix: '/10', label: `${rating.label} on ${rating.source}` },
  { to: 4, label: 'art-filled en-suite rooms' },
  { to: 10, label: 'guests at most, so it stays quiet' },
  { text: '24/7', label: 'open, and a host on the property' },
];

export default function Story() {
  const root = useRef(null);
  const canvasRef = useRef(null);
  const [webgl, setWebgl] = useState(true);
  const [loaded, setLoaded] = useState(false);

  // Build the bottle chime only when it's about to scroll into view.
  useEffect(() => {
    const host = canvasRef.current;
    if (!host) return undefined;
    let chime = null;
    let tick = null;
    let cancelled = false;
    const start = async () => {
      try {
        const { createBottleChime } = await import('../three/bottleChime');
        if (cancelled || chime) return; // unmounted (or re-mounted) while the 3D code was loading
        chime = createBottleChime(host, {
          imageUrl: imageUrl('stoep', 1280),
          mobile: window.innerWidth < 760,
          onReady: () => !cancelled && setLoaded(true),
        });
        tick = () => chime?.wind(scrollVelocity());
        gsap.ticker.add(tick);
      } catch {
        if (!cancelled) setWebgl(false);
      }
    };
    const st = ScrollTrigger.create({
      trigger: host,
      start: 'top bottom+=400',
      once: true,
      onEnter: start,
    });
    return () => {
      cancelled = true;
      st.kill();
      if (tick) gsap.ticker.remove(tick);
      chime?.dispose();
    };
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.from(q('.story__body, .story__host, .story__stat'), {
        y: 40,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.story__body')[0], start: 'top 85%' },
      });
      gsap.fromTo(
        q('.story__visual-inner'),
        { clipPath: 'inset(18% 10% 18% 10% round 220px 220px 28px 28px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)',
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top 10%', scrub: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <section className="story" id="story" ref={root} aria-labelledby="story-title">
      <div className="story__grid">
        <div className="story__text">
          <span className="label">our story</span>
          <h2 id="story-title" className="sr-only">
            Hospitality, unplugged
          </h2>
          <ScrollReveal
            baseOpacity={0.12}
            enableBlur
            blurStrength={6}
            baseRotation={0}
            containerClassName="story__statement-wrap"
            textClassName="story__statement"
            wordAnimationEnd="center center"
          >
            Hospitality, unplugged. Four art-filled rooms, a plunge pool and a host who has seen the world and brought its
            colour home to Potch.
          </ScrollReveal>

          <p className="story__body">
            Hang your hat beneath the blue bottles on the stoep. Whether you’re here on business, for a weekend away or
            simply passing through, TiinTiin is a warm, relaxing stay where you’ll always feel at home.
            <span className="muted"> Stay, meet, create and connect.</span>
          </p>

          <div className="story__host">
            <div className="story__monogram" aria-hidden="true">
              L
            </div>
            <div>
              <p className="story__host-name">Hosted by Lana</p>
              <p className="story__host-text muted">
                Well-travelled, warm and full of stories. Lana lives on the property and loves sharing her favourite
                corners of Potchefstroom. Afrikaans &amp; English spoken.
              </p>
            </div>
          </div>

          <dl className="story__stats">
            {stats.map((s) => (
              <div className="story__stat" key={s.label}>
                <dt className="story__stat-num">
                  {s.text ? s.text : <CountUp to={s.to} mode="roll" duration={1.8} suffix={s.suffix || ''} />}
                </dt>
                <dd className="muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="story__visual">
          <div className="story__visual-inner">
            <Img name="stoep" className={`story__fallback ${webgl && loaded ? 'is-hidden' : ''}`} sizes="(max-width: 900px) 100vw, 46vw" alt="The blue-bottle chime and painted stoep at TiinTiin" />
            {webgl && <div className="story__canvas" ref={canvasRef} aria-hidden="true" />}
            <p className="story__caption tag">{'{ the blue-bottle stoep, rebuilt in 3D }'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
