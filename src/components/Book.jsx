import { useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion, isCoarsePointer } from '../lib/motion';
import { contact, houseRules, rooms } from '../data/site';
import Icon from './ui/Icon';
import Magnet from './reactbits/Magnet/Magnet';
import RotatingText from './reactbits/RotatingText';
import Img from './ui/Img';
import './Book.css';

const TODAY = new Date();

const iso = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const pretty = (s) =>
  s ? new Date(`${s}T12:00:00`).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function Book() {
  const root = useRef(null);
  const today = TODAY;
  const [checkin, setCheckin] = useState(iso(addDays(today, 7)));
  const [checkout, setCheckout] = useState(iso(addDays(today, 9)));
  const [guests, setGuests] = useState(2);
  const [room, setRoom] = useState('any');
  const [error, setError] = useState('');

  const nights = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
  const roomName = room === 'any' ? 'any room' : `the ${rooms.find((r) => r.id === room)?.name.join('')} room`;

  const valid = () => {
    if (!checkin || !checkout) return 'Pick your dates first.';
    if (nights < 1) return 'Check-out needs to be after check-in.';
    if (checkin < iso(today)) return 'Check-in can’t be in the past.';
    return '';
  };

  const bookingUrl = `${contact.booking}?checkin=${checkin}&checkout=${checkout}&group_adults=${guests}&group_children=0&no_rooms=1`;
  const message = `Hi Lana! I'd like to book ${roomName} at Guesthouse TiinTiin from ${pretty(checkin)} to ${pretty(
    checkout
  )} (${nights} night${nights === 1 ? '' : 's'}) for ${guests} guest${guests === 1 ? '' : 's'}. Is it available?`;
  const whatsappUrl = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
  const mailUrl = `mailto:${contact.email}?subject=${encodeURIComponent('Booking enquiry: Guesthouse TiinTiin')}&body=${encodeURIComponent(message)}`;

  const guard = (e) => {
    const msg = valid();
    setError(msg);
    if (msg) e.preventDefault();
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.from(q('.book__panel > *'), {
        y: 50,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.07,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 65%' },
      });
      // photo parallax is scrubbed to the scroll position: desktop only (it judders on phones)
      if (isCoarsePointer()) return;
      gsap.fromTo(
        q('.book__photo img'),
        { scale: 1.25, yPercent: -6 },
        {
          scale: 1.05,
          yPercent: 6,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <section className="book" id="book" ref={root} aria-labelledby="book-title">
      <div className="book__photo" aria-hidden="true">
        <Img name="lounge" sizes="100vw" alt="" />
      </div>
      <div className="book__veil" aria-hidden="true" />

      <div className="book__panel">
        <span className="label">book a stay</span>
        <h2 id="book-title" className="h-xl book__title">
          Stay a <span className="serif-i book__accent">while.</span>
        </h2>
        <p className="book__lede">
          Book online, or message Lana directly for{' '}
          <RotatingText
            texts={['weekend getaways', 'business trips', 'family visits', 'graduation week', 'passing through']}
            mainClassName="book__rotator"
            splitLevelClassName="book__rotator-split"
            staggerFrom="last"
            staggerDuration={0.02}
            rotationInterval={2400}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-120%' }}
          />
        </p>

        <form className="book__form" onSubmit={(e) => e.preventDefault()} noValidate>
          <label className="field">
            <span className="field__label">
              <Icon name="calendar" size={16} /> Check-in
            </span>
            <input
              type="date"
              value={checkin}
              min={iso(today)}
              onChange={(e) => {
                setCheckin(e.target.value);
                if (e.target.value >= checkout) setCheckout(iso(addDays(new Date(`${e.target.value}T12:00:00`), 1)));
              }}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">
              <Icon name="calendar" size={16} /> Check-out
            </span>
            <input type="date" value={checkout} min={checkin} onChange={(e) => setCheckout(e.target.value)} required />
          </label>
          <label className="field">
            <span className="field__label">
              <Icon name="users" size={16} /> Guests
            </span>
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">
              <Icon name="bed" size={16} /> Room
            </span>
            <select value={room} onChange={(e) => setRoom(e.target.value)}>
              <option value="any">Any room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name.join('')} · {r.type}
                </option>
              ))}
            </select>
          </label>

          <div className="book__summary" aria-live="polite">
            {error ? (
              <span className="book__error">{error}</span>
            ) : (
              <span>
                {nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : '—'} · {guests} guest{guests === 1 ? '' : 's'} ·{' '}
                {room === 'any' ? 'any room' : rooms.find((r) => r.id === room)?.name.join('')}
              </span>
            )}
          </div>

          <div className="book__actions">
            <Magnet padding={60} magnetStrength={4}>
              <a className="pill pill--amber pill--lg book__primary" href={bookingUrl} target="_blank" rel="noreferrer" onClick={guard}>
                Check availability <Icon name="arrowUpRight" />
              </a>
            </Magnet>
            <a className="pill pill--lg book__wa" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={guard}>
              <Icon name="whatsapp" /> WhatsApp Lana
            </a>
            <a className="pill pill--lg pill--outline" href={mailUrl} onClick={guard}>
              <Icon name="mail" /> Email
            </a>
          </div>
          <p className="book__fine muted">
            “Check availability” opens Booking.com with your dates. Also listed on{' '}
            <a href={contact.lekkeslaap} target="_blank" rel="noreferrer">
              LekkeSlaap
            </a>
            .
          </p>
        </form>

        <ul className="book__rules" aria-label="House rules">
          {houseRules.map((r) => (
            <li key={r.label}>
              <span className="muted">{r.label}</span> {r.value}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
