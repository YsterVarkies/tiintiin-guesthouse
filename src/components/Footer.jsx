import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion, scrollToTarget } from '../lib/motion';
import { contact } from '../data/site';
import Icon, { Star } from './ui/Icon';
import './Footer.css';

const YEAR = new Date().getFullYear();

export default function Footer() {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.from(q('.footer__mark-char'), {
        yPercent: 100,
        duration: 1.4,
        stagger: 0.05,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.footer__mark')[0], start: 'top 95%' },
      });
      gsap.from(q('.footer__mark-star'), {
        scale: 0,
        rotate: -180,
        duration: 1.2,
        stagger: 0.1,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: q('.footer__mark')[0], start: 'top 90%' },
      });
    },
    { scope: root }
  );

  return (
    <footer className="footer" ref={root}>
      <div className="footer__top">
        <div className="footer__col footer__col--intro">
          <p className="footer__tagline">
            Hospitality, <em className="serif-i">unplugged.</em>
          </p>
          <p className="muted">Comfort. Tranquility. Hospitality. Stay, meet, create and connect.</p>
        </div>
        <div className="footer__col">
          <h3 className="eyebrow">Visit</h3>
          <a href={contact.mapsUrl} target="_blank" rel="noreferrer">
            {contact.street}
            <br />
            {contact.city}, {contact.postal}
            <br />
            {contact.province}
          </a>
        </div>
        <div className="footer__col">
          <h3 className="eyebrow">Talk to Lana</h3>
          <a href={`tel:${contact.phoneIntl}`}>{contact.phoneDisplay}</a>
          <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <span className="muted">{contact.hours}</span>
        </div>
        <div className="footer__col">
          <h3 className="eyebrow">Book &amp; follow</h3>
          <a href={contact.booking} target="_blank" rel="noreferrer">
            Booking.com
          </a>
          <a href={contact.lekkeslaap} target="_blank" rel="noreferrer">
            LekkeSlaap
          </a>
          <a href={contact.facebook} target="_blank" rel="noreferrer">
            Facebook
          </a>
        </div>
      </div>

      <div className="footer__mark display" aria-label="TiinTiin">
        <span className="footer__stars" aria-hidden="true">
          <Star className="footer__mark-star" />
          <Star className="footer__mark-star" />
        </span>
        <span className="footer__word" aria-hidden="true">
          {'TiinTiin'.split('').map((c, i) => (
            <span className="footer__mark-char" key={i}>
              {c}
            </span>
          ))}
        </span>
        <span className="footer__stars" aria-hidden="true">
          <Star className="footer__mark-star" />
          <Star className="footer__mark-star" />
        </span>
      </div>

      <div className="footer__bottom">
        <span>
          © {YEAR} {contact.name} · {contact.city}, {contact.country}
        </span>
        <button type="button" className="footer__top-btn" onClick={() => scrollToTarget(0)}>
          back to top <Icon name="arrowRight" size={16} style={{ transform: 'rotate(-90deg)' }} />
        </button>
      </div>
    </footer>
  );
}
