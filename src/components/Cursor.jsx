import { useEffect, useRef } from 'react';
import { gsap, isFinePointer, prefersReducedMotion } from '../lib/motion';
import './Cursor.css';

// A soft dot that trails the pointer and grows into a label over rooms and the gallery.
export default function Cursor() {
  const dot = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return undefined;
    const el = dot.current;
    document.documentElement.classList.add('has-cursor');
    const x = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
    let mode = '';

    const onMove = (e) => {
      x(e.clientX);
      y(e.clientY);
      const t = e.target instanceof Element ? e.target : null;
      const next = t?.closest('.niche__btn')
        ? 'step inside'
        : t?.closest('.circular-gallery')
          ? 'drag'
          : t?.closest('.story__canvas')
            ? 'stir'
            : t?.closest('a, button, select, input, label')
              ? 'link'
              : '';
      if (next !== mode) {
        mode = next;
        el.dataset.mode = mode ? (mode === 'link' ? 'link' : 'label') : '';
        label.current.textContent = mode && mode !== 'link' ? mode : '';
      }
    };
    const onLeave = () => gsap.to(el, { autoAlpha: 0, duration: 0.3 });
    const onEnter = () => gsap.to(el, { autoAlpha: 1, duration: 0.3 });

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
    };
  }, []);

  return (
    <div className="cursor" ref={dot} aria-hidden="true">
      <span className="cursor__label" ref={label} />
    </div>
  );
}
