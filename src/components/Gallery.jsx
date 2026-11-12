import { useMemo, useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion';
import { imageUrl } from '../lib/images';
import { gallery } from '../data/site';
import CircularGallery from './reactbits/CircularGallery';
import SplitText from './reactbits/SplitText/SplitText';
import './Gallery.css';

export default function Gallery() {
  const root = useRef(null);
  const items = useMemo(() => gallery.map((g) => ({ image: imageUrl(g.image, 1280), text: g.text })), []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(root.current.querySelector('.gallery__stage'), {
        autoAlpha: 0,
        yPercent: 12,
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 65%' },
      });
    },
    { scope: root }
  );

  return (
    <section className="gallery" id="gallery" ref={root} aria-label="Life at TiinTiin: photo gallery">
      <div className="gallery__head">
        <span className="label">moments</span>
        <SplitText
          tag="h2"
          text="Life at TiinTiin"
          className="h-xl gallery__title"
          splitType="chars"
          delay={35}
          duration={1.2}
          effect="rise"
          textAlign="left"
        />
        <p className="muted gallery__hint">Drag, swipe or use your arrow keys. Click a photo to look closer.</p>
      </div>
      <div className="gallery__stage">
        <CircularGallery
          items={items}
          bend={2.2}
          textColor="#f3eee6"
          borderRadius={0.05}
          font='560 22px "Inter Tight Variable"'
          scrollSpeed={2}
          scrollEase={0.045}
          itemAspect={0.8}
          gap={0.22}
          shadow={0.35}
          autoScroll={0.12}
        />
      </div>
    </section>
  );
}
