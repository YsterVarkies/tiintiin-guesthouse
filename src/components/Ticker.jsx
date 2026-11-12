import ScrollVelocity from './reactbits/ScrollVelocity';
import './Ticker.css';

// Speed follows your scroll: "Comfort. Tranquility. Hospitality." from TiinTiin's own welcome board.
export default function Ticker() {
  return (
    <section className="ticker" aria-label="Comfort, tranquility, hospitality. Stay, meet, create, connect.">
      <div aria-hidden="true">
        <ScrollVelocity
          texts={['Comfort ✦ Tranquility ✦ Hospitality ✦ ', 'Stay ✦ Meet ✦ Create ✦ Connect ✦ ']}
          velocity={55}
          numCopies={5}
          damping={50}
          stiffness={400}
          skewWithVelocity={8}
          outlineAlternate
          className="ticker__text"
          parallaxClassName="ticker__parallax"
          scrollerClassName="ticker__scroller"
        />
      </div>
    </section>
  );
}
