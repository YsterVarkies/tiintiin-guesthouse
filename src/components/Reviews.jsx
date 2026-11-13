import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion, isCoarsePointer } from '../lib/motion';
import { contact, rating, reviews } from '../data/site';
import CountUp from './reactbits/CountUp/CountUp';
import Icon, { Star } from './ui/Icon';
import './Reviews.css';

export default function Reviews() {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.from(q('.reviews__bar i'), {
        scaleX: 0,
        duration: 1.6,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.reviews__bars')[0], start: 'top 85%' },
      });
      gsap.from(q('.quote'), {
        y: 80,
        autoAlpha: 0,
        rotate: (i) => (i % 2 ? 3 : -3),
        duration: 1.3,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.reviews__quotes')[0], start: 'top 80%' },
      });
      // the two quote columns drift at different speeds (scrubbed to scroll: desktop only)
      if (isCoarsePointer()) return;
      gsap.to(q('.reviews__col--b'), {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    },
    { scope: root }
  );

  const colA = reviews.filter((_, i) => i % 2 === 0);
  const colB = reviews.filter((_, i) => i % 2 === 1);
  const Quote = ({ r }) => (
    <figure className="quote glass-card">
      <div className="quote__stars" aria-label="5 out of 5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} />
        ))}
      </div>
      <blockquote>
        <p>“{r.quote}”</p>
      </blockquote>
      <figcaption>
        <span className="quote__avatar" aria-hidden="true">
          {r.name[0]}
        </span>
        <span>
          <strong>{r.name}</strong>
          <span className="muted"> · {r.from}</span>
        </span>
      </figcaption>
    </figure>
  );

  return (
    <section className="reviews" id="reviews" ref={root} aria-labelledby="reviews-title">
      <div className="reviews__grid">
        <div className="reviews__score">
          <span className="label">guests</span>
          <h2 id="reviews-title" className="reviews__heading">
            Guests who stayed here <em className="serif-i">loved</em> it
          </h2>
          <div className="reviews__big" aria-label={`${rating.score} out of 10`}>
            <CountUp to={rating.score} mode="roll" duration={2} />
            <span className="reviews__outof">/10</span>
          </div>
          <p className="reviews__label">
            {rating.label} <span className="muted">· {rating.count} verified reviews on {rating.source}</span>
          </p>
          <ul className="reviews__bars">
            {rating.categories.map((c) => (
              <li key={c.label}>
                <span>{c.label}</span>
                <span className="reviews__bar" aria-hidden="true">
                  <i style={{ '--v': c.value / 10 }} />
                </span>
                <span className="reviews__val">{c.value}</span>
              </li>
            ))}
          </ul>
          <a className="pill pill--outline" href={contact.booking} target="_blank" rel="noreferrer">
            Read every review on Booking.com <Icon name="arrowUpRight" />
          </a>
        </div>

        <div className="reviews__quotes">
          <div className="reviews__col">
            {colA.map((r) => (
              <Quote key={r.name} r={r} />
            ))}
          </div>
          <div className="reviews__col reviews__col--b">
            {colB.map((r) => (
              <Quote key={r.name} r={r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
