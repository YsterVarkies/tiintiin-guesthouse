import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP, scrollToTarget, lockScroll } from '../lib/motion';
import { contact, nav } from '../data/site';
import Icon, { Star } from './ui/Icon';
import './Nav.css';

const sections = ['top', 'story', 'rooms', 'amenities', 'gallery', 'reviews', 'location', 'book'];

export function Wordmark({ className = '' }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark__stars" aria-hidden="true">
        <Star />
        <Star />
      </span>
      <span className="wordmark__text">TiinTiin</span>
    </span>
  );
}

function Roll({ children }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

export default function Nav({ ready }) {
  const root = useRef(null);
  const menuRef = useRef(null);
  const [active, setActive] = useState('top');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // which section is on screen
  useEffect(() => {
    const triggers = sections
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((el) =>
        ScrollTrigger.create({
          trigger: el,
          start: 'top 45%',
          end: 'bottom 45%',
          onToggle: (self) => self.isActive && setActive(el.id),
        })
      );
    const past = ScrollTrigger.create({
      start: () => window.innerHeight * 0.7,
      end: 'max',
      onToggle: (self) => setScrolled(self.isActive),
    });
    return () => {
      triggers.forEach((t) => t.kill());
      past.kill();
    };
  }, []);

  useGSAP(
    () => {
      if (!ready) {
        gsap.set('.nav__item, .nav__brand-wrap', { autoAlpha: 0, y: -16 });
        return;
      }
      gsap.to('.nav__item, .nav__brand-wrap', { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06, ease: 'expo.out', delay: 0.6 });
    },
    { scope: root, dependencies: [ready] }
  );

  // full-screen menu
  useGSAP(
    () => {
      const el = menuRef.current;
      if (!el) return;
      if (open) {
        lockScroll(true);
        gsap
          .timeline()
          .set(el, { display: 'flex' })
          .fromTo(el, { clipPath: 'circle(0% at 92% 4%)' }, { clipPath: 'circle(150% at 92% 4%)', duration: 0.9, ease: 'expo.inOut' })
          .from(el.querySelectorAll('.menu__link'), { yPercent: 110, duration: 0.9, stagger: 0.05, ease: 'expo.out' }, 0.35)
          .from(el.querySelectorAll('.menu__foot > *'), { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.05 }, 0.55);
      } else if (el.style.display === 'flex') {
        gsap
          .timeline({ onComplete: () => gsap.set(el, { display: 'none' }) })
          .to(el, { clipPath: 'circle(0% at 92% 4%)', duration: 0.7, ease: 'expo.inOut' });
        lockScroll(false);
      }
    },
    { dependencies: [open] }
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    setTimeout(() => scrollToTarget(href === '#top' ? 0 : href), open ? 450 : 0);
  };

  return (
    <>
      <header ref={root} className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="nav__brand-wrap">
          <a href="#top" className="nav__brand" onClick={(e) => go(e, '#top')} aria-label="Guesthouse TiinTiin, back to top">
            <Wordmark />
          </a>
        </div>

        <nav className="nav__links" aria-label="Main">
          {nav.slice(1).map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`pill nav__item nav__link ${active === item.href.slice(1) ? 'is-active' : ''}`}
              onClick={(e) => go(e, item.href)}
            >
              <Roll>{item.label}</Roll>
            </a>
          ))}
          <a href={`tel:${contact.phoneIntl}`} className="pill pill--cream nav__item nav__phone">
            <Roll>{contact.phoneDisplay}</Roll>
          </a>
          <a href="#book" className="pill pill--amber nav__item nav__book" onClick={(e) => go(e, '#book')}>
            <Roll>book a stay</Roll>
          </a>
        </nav>

        <button
          type="button"
          className="pill nav__item nav__menu-btn"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`burger ${open ? 'is-open' : ''}`} aria-hidden="true">
            <i />
            <i />
          </span>
          {open ? 'close' : 'menu'}
        </button>
      </header>

      <div className="menu" id="site-menu" ref={menuRef} role="dialog" aria-modal="true" aria-label="Menu">
        <nav className="menu__nav" aria-label="Mobile">
          {nav.map((item) => (
            <div className="menu__row" key={item.href}>
              <a href={item.href} className="menu__link display" onClick={(e) => go(e, item.href)}>
                {item.label}
              </a>
            </div>
          ))}
          <div className="menu__row">
            <a href="#book" className="menu__link display menu__link--amber" onClick={(e) => go(e, '#book')}>
              book a stay
            </a>
          </div>
        </nav>
        <div className="menu__foot">
          <a href={`tel:${contact.phoneIntl}`} className="pill pill--cream">
            <Icon name="phone" /> {contact.phoneDisplay}
          </a>
          <a href={`https://wa.me/${contact.whatsapp}`} className="pill" target="_blank" rel="noreferrer">
            <Icon name="whatsapp" /> WhatsApp
          </a>
          <a href={`mailto:${contact.email}`} className="pill">
            <Icon name="mail" /> Email
          </a>
        </div>
      </div>
    </>
  );
}
