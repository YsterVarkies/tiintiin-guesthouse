import { useCallback, useRef, useState } from 'react';
import { gsap, Flip, useGSAP, prefersReducedMotion } from '../lib/motion';
import { contact, rooms } from '../data/site';
import Img from './ui/Img';
import Icon from './ui/Icon';
import RoomDetail from './RoomDetail';
import './Rooms.css';

export default function Rooms() {
  const root = useRef(null);
  const flipState = useRef(null);
  const returnFocus = useRef(null);
  const [openIndex, setOpenIndex] = useState(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.from(q('.niche'), {
        yPercent: 18,
        autoAlpha: 0,
        duration: 1.4,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.niches')[0], start: 'top 80%' },
      });
      gsap.from(q('.rooms__head > *'), {
        y: 40,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.rooms__head')[0], start: 'top 82%' },
      });
      // the lamps warm up as the section arrives
      gsap.fromTo(
        q('.niche__lamp'),
        { opacity: 0, scale: 0.4 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: { trigger: q('.niches')[0], start: 'top 60%' },
        }
      );
    },
    { scope: root }
  );

  const open = useCallback((i, e) => {
    returnFocus.current = e?.currentTarget ?? null;
    const arch = root.current.querySelector(`[data-flip-id="room-${rooms[i].id}"]`);
    flipState.current = arch && !prefersReducedMotion() ? Flip.getState(arch, { props: 'borderRadius' }) : null;
    setOpenIndex(i);
  }, []);

  const close = useCallback(() => {
    setOpenIndex(null);
    requestAnimationFrame(() => returnFocus.current?.focus({ preventScroll: true }));
  }, []);

  return (
    <section className="rooms" id="rooms" ref={root} aria-labelledby="rooms-title">
      <div className="rooms__head">
        <span className="label">rooms</span>
        <h2 id="rooms-title" className="h-xl rooms__title">
          Four rooms,
          <br />
          <span className="serif-i rooms__accent">four</span> stories
        </h2>
        <div className="rooms__intro">
          <p className="muted">
            Every room has a king-size bed, an en-suite shower, air-conditioning, a tea &amp; coffee station and free Wi-Fi.
            Each one has a personality of its own.
          </p>
          <p className="rooms__price">
            <span className="muted">from</span> {contact.priceFrom} <span className="muted">/ night for two</span>
          </p>
        </div>
      </div>

      <ul className="niches" role="list">
        {rooms.map((room, i) => (
          <li className="niche" key={room.id} style={{ '--glow': room.theme.glow, '--accent': room.theme.accent }}>
            <button type="button" className="niche__btn" onClick={(e) => open(i, e)} aria-haspopup="dialog">
              <span className="niche__arch" data-flip-id={`room-${room.id}`}>
                <Img
                  name={room.images[0]}
                  className="niche__img"
                  sizes="(max-width: 900px) 46vw, 23vw"
                  alt={`${room.name.join('')} room: ${room.blurb}`}
                />
                <span className="niche__spot" aria-hidden="true" />
                <span className="niche__lamp" aria-hidden="true" />
                <span className="niche__cta" aria-hidden="true">
                  <Icon name="plus" size={16} /> step inside
                </span>
              </span>
              <span className="niche__reflection" aria-hidden="true">
                <Img name={room.images[0]} sizes="10vw" want={640} alt="" />
              </span>
              <span className="niche__label">
                <span className="niche__name">
                  {room.name[0]}
                  <em className="serif-i">{room.name[1]}</em>
                </span>
                <span className="niche__meta">
                  {room.no} · {room.type} · sleeps {room.sleeps}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="rooms__foot">
        <p className="rooms__collection">
          The <em className="serif-i">TiinTiin</em> collection
        </p>
        <p className="muted rooms__hint">Hover to light a room · click to step inside</p>
      </div>

      {openIndex !== null && (
        <RoomDetail index={openIndex} flipState={flipState} onClose={close} />
      )}
    </section>
  );
}
