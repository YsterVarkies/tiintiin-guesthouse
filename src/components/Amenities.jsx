import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion';
import { amenities } from '../data/site';
import Img from './ui/Img';
import Icon from './ui/Icon';
import SpotlightCard from './reactbits/SpotlightCard';
import './Amenities.css';

export default function Amenities() {
  const root = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      // Desktop: pin the section and let the cards travel sideways.
      mm.add('(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const track = q('.amen__track')[0];
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: q('.amen__pin')[0],
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        gsap.to(q('.amen__progress span'), {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: q('.amen__pin')[0], start: 'top top', end: () => `+=${distance()}`, scrub: true },
        });
        // photos drift inside their frames while the track moves
        q('.amen__card .amen__media img').forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: img.closest('.amen__card'),
                containerAnimation: tween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            }
          );
        });
      });

      mm.add('(max-width: 900px) and (prefers-reduced-motion: no-preference), (pointer: coarse) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray(q('.amen__card')).forEach((card) => {
          gsap.from(card, {
            y: 60,
            autoAlpha: 0,
            duration: 1.1,
            ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 88%' },
          });
        });
      });

      if (!prefersReducedMotion()) {
        gsap.from(q('.amen__intro > *'), {
          y: 50,
          autoAlpha: 0,
          duration: 1.2,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 70%' },
        });
      }
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section className="amen on-paper" id="amenities" ref={root} aria-labelledby="amen-title">
      <div className="amen__pin">
        <div className="amen__track">
          <div className="amen__intro">
            <span className="label">amenities</span>
            <h2 id="amen-title" className="h-xl amen__title">
              Everything
              <br />
              you need.
              <br />
              <span className="serif-i amen__accent">Nothing</span> you
              <br />
              don’t.
            </h2>
            <p className="amen__lede muted">
              Little luxuries, honest comforts and a walled garden in the middle of town. Scroll on, it all slides by.
            </p>
            <span className="amen__hint" aria-hidden="true">
              <Icon name="arrowRight" size={18} /> {amenities.length} reasons to stay
            </span>
          </div>

          {amenities.map((a, i) => (
            <SpotlightCard
              key={a.title}
              className="amen__card"
              theme="light"
              spotlightColor="#eaa94b"
              intensity={0.25}
              spotlightSize={320}
              borderGlow={0.4}
            >
              <div className="amen__media">
                <Img name={a.image} sizes="(max-width: 900px) 92vw, 34vw" alt={a.title} />
              </div>
              <div className="amen__glass">
                <span className="amen__icon">
                  <Icon name={a.icon} size={22} />
                </span>
                <div>
                  <h3 className="amen__name">{a.title}</h3>
                  <p className="amen__text">{a.text}</p>
                </div>
                <span className="amen__num">{String(i + 1).padStart(2, '0')}</span>
              </div>
            </SpotlightCard>
          ))}
        </div>
        <div className="amen__progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
