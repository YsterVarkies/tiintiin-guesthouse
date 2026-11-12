import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/motion';
import { contact, nearby } from '../data/site';
import Icon, { Star } from './ui/Icon';
import './Location.css';

export default function Location() {
  const root = useRef(null);
  const [showMap, setShowMap] = useState(false);

  // Only load Google Maps when the section is close, to keep the first load light.
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top bottom+=300',
      once: true,
      onEnter: () => setShowMap(true),
    });
    return () => st.kill();
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.from(q('.location__info > *'), {
        y: 50,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.07,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      });
      gsap.from(q('.nearby li'), {
        x: -30,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.05,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.nearby')[0], start: 'top 85%' },
      });
      gsap.fromTo(
        q('.location__map'),
        { clipPath: 'inset(12% 12% 12% 12% round 300px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 30px)',
          ease: 'none',
          scrollTrigger: { trigger: q('.location__map')[0], start: 'top 95%', end: 'top 35%', scrub: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <section className="location" id="location" ref={root} aria-labelledby="location-title">
      <div className="location__grid">
        <div className="location__info">
          <span className="label">location</span>
          <h2 id="location-title" className="h-lg location__title">
            In the quiet heart
            <br />
            of <span className="serif-i location__accent">Potch</span>
          </h2>
          <address className="location__address">
            {contact.street}
            <br />
            {contact.city}, {contact.postal}
            <br />
            {contact.province}, {contact.country}
          </address>
          <p className="muted location__copy">
            A peaceful street a short drive from Mooi Rivier Mall, with De Rooie gift shop and café just around the corner
            for coffee, plants and a little something to take home.
          </p>
          <div className="location__actions">
            <a className="pill pill--cream pill--lg" href={contact.mapsUrl} target="_blank" rel="noreferrer">
              <Icon name="pin" /> Get directions
            </a>
            <a className="pill pill--lg" href={`tel:${contact.phoneIntl}`}>
              <Icon name="phone" /> {contact.phoneDisplay}
            </a>
          </div>
          <ul className="nearby" aria-label="Nearby">
            {nearby.map((n) => (
              <li key={n.place}>
                <span className="nearby__place">{n.place}</span>
                <span className="nearby__line" aria-hidden="true" />
                <span className="nearby__kind muted">{n.kind}</span>
                <span className="nearby__dist">{n.distance}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="location__map">
          {showMap ? (
            <iframe
              title="Map showing Guesthouse TiinTiin at 87 Chris Hani Street, Potchefstroom"
              src={contact.mapsEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="location__map-placeholder" />
          )}
          <div className="location__pin" aria-hidden="true">
            <span className="location__pin-dot">
              <Star />
            </span>
            <span className="location__pin-label">
              <strong>TiinTiin</strong>
              <span>{contact.street}</span>
            </span>
          </div>
          <div className="location__badge glass-card">
            <span className="tag">{'{ distances by road or on foot }'}</span>
            <p>
              <strong>132 km</strong> from Lanseria International Airport
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
