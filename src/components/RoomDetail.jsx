import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap, Flip, lockScroll, prefersReducedMotion, isFinePointer } from '../lib/motion';
import { contact, rooms } from '../data/site';
import Img from './ui/Img';
import Icon from './ui/Icon';
import { Wordmark } from './Nav';
import './RoomDetail.css';

// Pebbles float around the arch like the fruit in a product slider; spots in % of the stage.
const PEBBLES = [
  { x: -14, y: 14, size: 92, depth: 1.6, img: 1 },
  { x: 92, y: 6, size: 64, depth: 2.4, img: 2 },
  { x: 96, y: 72, size: 104, depth: 1.2, img: 3 },
  { x: -8, y: 80, size: 58, depth: 2.8, img: 4 },
];

const themeVars = (t) => ({ '--a': t.a, '--b': t.b, '--glow': t.glow, '--accent': t.accent });
const wrap = (i) => (i + rooms.length) % rooms.length;

export default function RoomDetail({ index, flipState, onClose }) {
  const root = useRef(null);
  const closeRef = useRef(null);
  const busy = useRef(true);
  const dir = useRef(1);
  const lastShown = useRef(index);
  const [shown, setShown] = useState(index);
  const [photo, setPhoto] = useState(0);
  const room = rooms[shown];
  const name = room.name.join('');
  const reduce = prefersReducedMotion();

  // ---------- open ----------
  useLayoutEffect(() => {
    lockScroll(true);
    const el = root.current;
    const q = gsap.utils.selector(el);
    gsap.set(el, themeVars(room.theme));

    if (reduce) {
      busy.current = false;
      closeRef.current?.focus({ preventScroll: true });
      return () => lockScroll(false);
    }

    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false;
      },
    });
    tl.fromTo(q('.rd__bg'), { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0);
    if (flipState.current) {
      tl.add(
        Flip.from(flipState.current, {
          targets: q('.rd__arch'),
          duration: 1.15,
          ease: 'expo.inOut',
          props: 'borderRadius',
          absolute: true,
          zIndex: 30,
        }),
        0
      );
    } else {
      tl.from(q('.rd__arch'), { autoAlpha: 0, scale: 0.9, duration: 1, ease: 'expo.out' }, 0.1);
    }
    tl.fromTo(q('.rd__giant-track'), { xPercent: 18, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 1.4, ease: 'expo.out' }, 0.35)
      .from(q('.rd__top > *, .rd__bottom > *'), { autoAlpha: 0, y: -14, duration: 0.8, stagger: 0.06 }, 0.5)
      .from(q('[data-anim]'), { yPercent: 40, autoAlpha: 0, duration: 1, stagger: 0.04, ease: 'expo.out' }, 0.6)
      .from(q('.rd__pebble'), { scale: 0, rotate: -40, duration: 1.2, stagger: 0.08, ease: 'back.out(1.6)' }, 0.75);

    closeRef.current?.focus({ preventScroll: true });
    return () => {
      tl.revert();
      // An interrupted Flip can leave absolute positioning behind; wipe it so a re-run measures the real layout.
      gsap.set(q('.rd__arch'), { clearProps: 'all' });
      lockScroll(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- switch room: "in" half ----------
  useLayoutEffect(() => {
    // Compare with the last room we animated in, so a re-run (React dev double-mount) is a no-op.
    if (lastShown.current === shown) return undefined;
    lastShown.current = shown;
    const q = gsap.utils.selector(root);
    const d = dir.current;
    if (reduce) {
      busy.current = false;
      return undefined;
    }
    const tl = gsap.timeline({ onComplete: () => (busy.current = false) });
    tl.fromTo(q('.rd__giant-track'), { xPercent: 22 * d, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 1.3, ease: 'expo.out' }, 0)
      .fromTo(
        q('.rd__arch'),
        { xPercent: 45 * d, rotate: 9 * d, scale: 0.9, autoAlpha: 0 },
        { xPercent: 0, rotate: 0, scale: 1, autoAlpha: 1, duration: 1.3, ease: 'expo.out' },
        0
      )
      .fromTo(q('[data-anim]'), { yPercent: 45, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.035, ease: 'expo.out' }, 0.12)
      .fromTo(
        q('.rd__pebble'),
        { scale: 0, rotate: -50 * d, autoAlpha: 0 },
        { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.1, stagger: 0.07, ease: 'back.out(1.7)' },
        0.2
      );
    return () => tl.revert();
  }, [shown, reduce]);

  // ---------- photo swap inside a room (only when a thumbnail was clicked) ----------
  const photoAnim = useRef(false);
  const pickPhoto = (i) => {
    if (i === photo) return;
    photoAnim.current = true;
    setPhoto(i);
  };
  useLayoutEffect(() => {
    if (!photoAnim.current || reduce) return;
    photoAnim.current = false;
    gsap.fromTo(
      root.current.querySelector('.rd__main-img'),
      { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.15 },
      { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1, ease: 'expo.out' }
    );
  }, [photo, reduce]);

  // ---------- swipe (touch or mouse drag) and scroll/wheel through a room's own photos ----------
  const archRef = useRef(null);
  const liveLen = useRef(room.images.length);
  useEffect(() => {
    liveLen.current = room.images.length;
  });
  useEffect(() => {
    const el = archRef.current;
    if (!el) return undefined;

    const stepPhoto = (dir) => {
      const len = liveLen.current;
      if (len < 2) return;
      photoAnim.current = true;
      setPhoto((p) => (p + dir + len) % len);
    };

    const THRESHOLD = 36;
    let down = false;
    let moved = false;
    let startX = 0;
    let startY = 0;

    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      el.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e) => {
      if (!down) return;
      if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) moved = true;
    };
    const onPointerUp = (e) => {
      if (!down) return;
      down = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (moved && Math.abs(dx) > THRESHOLD && Math.abs(dx) > Math.abs(dy)) stepPhoto(dx < 0 ? 1 : -1);
    };

    // Desktop: a plain mouse wheel over the photo also steps through it (the dialog doesn't
    // otherwise scroll on desktop, so this is free to use); debounced so one notch = one step.
    let lastWheel = 0;
    const onWheel = (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!delta) return;
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel < 420) return;
      lastWheel = now;
      stepPhoto(delta > 0 ? 1 : -1);
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // ---------- switch room: "out" half ----------
  const go = useCallback(
    (next, direction) => {
      next = wrap(next);
      if (busy.current || next === shown) return;
      busy.current = true;
      dir.current = direction ?? (next > shown ? 1 : -1);
      const d = dir.current;
      const el = root.current;
      const q = gsap.utils.selector(el);
      const swap = () => {
        setPhoto(0);
        setShown(next);
      };
      if (reduce) {
        gsap.set(el, themeVars(rooms[next].theme));
        swap();
        return;
      }
      gsap
        .timeline({ onComplete: swap })
        .to(el, { ...themeVars(rooms[next].theme), duration: 1.3, ease: 'power2.inOut' }, 0)
        .to(q('.rd__giant-track'), { xPercent: -22 * d, autoAlpha: 0, duration: 0.65, ease: 'power3.in' }, 0)
        .to(q('.rd__arch'), { xPercent: -45 * d, rotate: -9 * d, scale: 0.9, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, 0)
        .to(q('[data-anim]'), { yPercent: -40, autoAlpha: 0, duration: 0.42, stagger: 0.015, ease: 'power2.in' }, 0)
        .to(q('.rd__pebble'), { scale: 0, rotate: 50 * d, duration: 0.5, stagger: 0.04, ease: 'power2.in' }, 0);
    },
    [shown, reduce]
  );

  const close = useCallback(() => {
    if (busy.current && !reduce) return;
    busy.current = true;
    const q = gsap.utils.selector(root);
    if (reduce) {
      onClose();
      return;
    }
    gsap
      .timeline({ onComplete: onClose })
      .to(q('[data-anim], .rd__top > *, .rd__bottom > *, .rd__pebble'), { autoAlpha: 0, y: 20, duration: 0.4, stagger: 0.01, ease: 'power2.in' }, 0)
      .to(q('.rd__arch'), { scale: 0.88, autoAlpha: 0, duration: 0.6, ease: 'power3.in' }, 0.05)
      .to(q('.rd__giant-track'), { autoAlpha: 0, duration: 0.4 }, 0)
      .to(root.current, { autoAlpha: 0, duration: 0.5, ease: 'power2.inOut' }, 0.3);
  }, [onClose, reduce]);

  // keyboard: arrows switch rooms, Esc closes, Tab stays inside the dialog
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(shown + 1, 1);
      else if (e.key === 'ArrowLeft') go(shown - 1, -1);
      else if (e.key === 'Tab') {
        const f = [...root.current.querySelectorAll('a[href], button:not([disabled])')];
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, go, shown]);

  // pebbles + arch drift with the cursor at different depths
  useEffect(() => {
    if (reduce || !isFinePointer()) return undefined;
    const el = root.current;
    const pebbles = [...el.querySelectorAll('.rd__pebble-inner')];
    const arch = el.querySelector('.rd__stage-tilt');
    const movers = pebbles.map((p) => ({
      x: gsap.quickTo(p, 'x', { duration: 1.2, ease: 'power3.out' }),
      y: gsap.quickTo(p, 'y', { duration: 1.2, ease: 'power3.out' }),
      depth: Number(p.dataset.depth),
    }));
    const rx = gsap.quickTo(arch, 'rotationY', { duration: 1.4, ease: 'power3.out' });
    const ry = gsap.quickTo(arch, 'rotationX', { duration: 1.4, ease: 'power3.out' });
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      movers.forEach((m) => {
        m.x(nx * 18 * m.depth);
        m.y(ny * 14 * m.depth);
      });
      rx(nx * 5);
      ry(-ny * 4);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduce, shown]);

  const prev = rooms[wrap(shown - 1)];
  const next = rooms[wrap(shown + 1)];
  const ask = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
    `Hi Lana! I'd like to ask about the ${name} room (${room.no}, ${room.type}) at Guesthouse TiinTiin.`
  )}`;

  return createPortal(
    <div className="rd" ref={root} role="dialog" aria-modal="true" aria-labelledby="rd-title" data-lenis-prevent>
      <div className="rd__bg" aria-hidden="true" />

      <div className="rd__giant" aria-hidden="true">
        <div className="rd__giant-track">
          <div className="rd__giant-run">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i}>
                {name}
                <i>—</i>
              </span>
            ))}
          </div>
        </div>
      </div>

      <header className="rd__top">
        <span className="rd__crumb">
          <Wordmark />
          <span className="rd__crumb-sep">rooms</span>
        </span>
        <span className="rd__counter" aria-live="polite">
          {String(shown + 1).padStart(2, '0')} <span>/ {String(rooms.length).padStart(2, '0')}</span>
        </span>
        <button type="button" className="pill rd__close" ref={closeRef} onClick={close}>
          close <Icon name="close" size={16} />
        </button>
      </header>

      <div className="rd__body">
        <div className="rd__info">
          <p className="rd__kicker" data-anim>
            {room.no} · {room.type}
          </p>
          <h2 id="rd-title" className="rd__name" data-anim>
            {room.name[0]}
            <em className="serif-i">{room.name[1]}</em>
          </h2>
          <p className="rd__desc" data-anim>
            {room.description}
          </p>
          <ul className="rd__features" data-anim>
            {room.features.map((f) => (
              <li key={f}>
                <Icon name="check" size={15} /> {f}
              </li>
            ))}
          </ul>
          <p className="rd__price" data-anim>
            {room.price}
            {room.price.startsWith('from') && <span> / night</span>}
          </p>
          <div className="rd__ctas" data-anim>
            <a className="pill pill--cream pill--lg" href={contact.booking} target="_blank" rel="noreferrer">
              Book on Booking.com <Icon name="arrowUpRight" />
            </a>
            <a className="pill pill--lg rd__ask" href={ask} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" /> Ask Lana
            </a>
          </div>
        </div>

        <div className="rd__stage">
          <div className="rd__stage-tilt">
            <div className="rd__arch" ref={archRef} data-flip-id={`room-${room.id}`}>
              <Img
                key={room.images[photo]}
                name={room.images[photo]}
                className="rd__main-img"
                sizes="(max-width: 900px) 86vw, 34vw"
                eager
                alt={`${name} room, photo ${photo + 1} of ${room.images.length}`}
              />
              <span className="rd__arch-light" aria-hidden="true" />
              {room.images.length > 1 && (
                <span className="rd__photo-count" aria-hidden="true">
                  {photo + 1} / {room.images.length}
                </span>
              )}
            </div>
          </div>
          {PEBBLES.map((p, i) => (
            <span
              className="rd__pebble"
              key={`${room.id}-${i}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
              aria-hidden="true"
            >
              <span className="rd__pebble-inner" data-depth={p.depth}>
                <Img name={room.images[p.img % room.images.length]} sizes="120px" want={640} eager alt="" />
              </span>
            </span>
          ))}
        </div>

        <div className="rd__side">
          <p className="rd__side-label" data-anim>
            more of <em className="serif-i">{name}</em>
          </p>
          <div className="rd__thumbs">
            {room.images.map((img, i) => (
              <button
                type="button"
                key={img}
                className={`rd__thumb ${i === photo ? 'is-active' : ''}`}
                onClick={() => pickPhoto(i)}
                aria-label={`Show photo ${i + 1} of the ${name} room`}
                aria-pressed={i === photo}
                data-anim
              >
                <Img name={img} sizes="110px" want={640} eager alt="" />
              </button>
            ))}
          </div>
          <p className="rd__sleeps" data-anim>
            <Icon name="users" size={16} /> sleeps {room.sleeps} <span className="rd__dot-sep" />
            <Icon name="bed" size={16} /> {room.beds}
          </p>
        </div>
      </div>

      <footer className="rd__bottom">
        <nav className="rd__dots" aria-label="Rooms">
          {rooms.map((r, i) => (
            <button
              type="button"
              key={r.id}
              className={`rd__dot ${i === shown ? 'is-active' : ''}`}
              onClick={() => go(i)}
              aria-current={i === shown ? 'true' : undefined}
            >
              <span className="rd__dot-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="rd__dot-name">{r.name.join('')}</span>
            </button>
          ))}
        </nav>
        <div className="rd__arrows">
          <button type="button" className="rd__arrow" onClick={() => go(shown - 1, -1)} aria-label={`Previous room: ${prev.name.join('')}`}>
            <Icon name="arrowLeft" size={20} />
          </button>
          <button type="button" className="rd__arrow" onClick={() => go(shown + 1, 1)} aria-label={`Next room: ${next.name.join('')}`}>
            <Icon name="arrowRight" size={20} />
          </button>
        </div>
      </footer>
    </div>,
    document.body
  );
}
