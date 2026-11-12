import { useEffect, useState } from 'react';
import { startSmoothScroll, ScrollTrigger } from './lib/motion';
import Preloader from './components/Preloader';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Story from './components/Story';
import Rooms from './components/Rooms';
import Ticker from './components/Ticker';
import Amenities from './components/Amenities';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Location from './components/Location';
import Book from './components/Book';
import Footer from './components/Footer';
import Cursor from './components/Cursor';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    startSmoothScroll();
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    // Layout settles once fonts and images are in; re-measure every trigger.
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => {
      clearTimeout(t);
      window.removeEventListener('load', onLoad);
    };
  }, [ready]);

  return (
    <>
      <a href="#story" className="skip-link">
        Skip to content
      </a>
      <Preloader onDone={() => setReady(true)} />
      <Nav ready={ready} />
      <main>
        <Hero ready={ready} />
        <Story />
        <Rooms />
        <Ticker />
        <Amenities />
        <Gallery />
        <Reviews />
        <Location />
        <Book />
      </main>
      <Footer />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
