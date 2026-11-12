# Guesthouse TiinTiin · website

A one-page site for Guesthouse TiinTiin, 87 Chris Hani Street, Potchefstroom.
Built with React + Vite, GSAP (ScrollTrigger, SplitText, Flip), Lenis smooth scrolling, Three.js and React Bits components.

**Live:** https://ystervarkies.github.io/tiintiin-guesthouse/
Deploys automatically on every push to `main` via `.github/workflows/deploy.yml` (GitHub Actions → GitHub Pages).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
npm run preview    # serve the production build on http://localhost:4173
```

`dist/` is plain static files, so it can go on any static host (Netlify, Vercel, Cloudflare Pages, cPanel hosting).

## What's on the page

| Section | What it does |
| --- | --- |
| Preloader | Wordmark with the gate's rusted stars and a counter, waits for the hero photo and fonts |
| Hero | Design based on MotionSites "Mountain Retreat". The giant title sits *behind* the tree, rusted TIINTIIN sign and tent (a cut-out layer of the same photo), with Three.js dust and light shafts, pointer parallax and glass hotspot cards pinned to the scene |
| Our story | Scroll-revealed statement, host card, count-up stats, and a **3D cobalt-glass bottle chime** (Three.js transmission glass refracting the stoep photo) that swings with scroll speed and the cursor |
| Rooms | Spotlit arched niches (hover to light one), which open into a full-screen room slider with a colour theme per room, a giant drifting room name, thumbnails, floating photo pebbles and booking buttons. Arrow keys and Esc work |
| Ticker | "Comfort ✦ Tranquility ✦ Hospitality" marquee whose speed follows your scrolling |
| Amenities | Pinned horizontal scroll of amenity cards with glass captions |
| Moments | Curved, draggable WebGL photo gallery (React Bits CircularGallery) |
| Guests | 10/10 score, category bars and short guest quotes |
| Location | Night-styled Google Map with a custom pin and walking/driving distances |
| Book | Dates, guests and room, which open Booking.com with those dates, or a pre-filled WhatsApp/email to Lana |

## Editing content

Nearly all copy lives in **`src/data/site.js`**: contact details, prices, rooms (names, descriptions, features,
colour themes, photos), amenities, gallery captions, reviews, nearby places and house rules.

- **Room names** (Aloe, Velvet, Saffron, Gallery) are décor-inspired suggestions. The official listing names
  (Double Room, Family Room, King Room, Family Room with Shower) are shown alongside them. Rename freely.
- **Price** "from R1 353" is the LekkeSlaap rate seen in November 2026. Update `contact.priceFrom` and each room's `price`.
- **Reviews** are short excerpts from Booking.com guest reviews (Nov 2026). The score block links to the full reviews.
- **Hero video (optional):** put an MP4 in `public/videos/` and set `hero.video` in `site.js`. The title then sits
  on top of the video instead of behind the sign, because the cut-out only matches the still photo.

## Photos

Source photos live in `source-images/` (from the owner's folder and the Booking.com listing).

```bash
node scripts/optimize-images.mjs   # → public/images/<name>-<width>.webp + src/data/images.json
node scripts/make-hero.mjs         # → graded hero photo + sky cut-out layer (hero-bg / hero-fg)
```

To swap a photo, replace the file in `source-images/` (keep the name), or add a new one and reference its name
in `site.js`, then run the optimiser.

## React Bits

Components were pulled from the React Bits registry into `src/components/reactbits/` with
`node scripts/add-reactbits.mjs <Name> ...` (SplitText, ScrollReveal, CountUp, CircularGallery, Magnet,
RotatingText, ScrollVelocity, SpotlightCard). Two small local changes are marked `TiinTiin:` in
`CircularGallery.jsx`: vertical mouse-wheel scrolling is no longer captured, and the WebGL context
isn't destroyed on unmount (React reuses the canvas).

## Accessibility & performance

- Respects `prefers-reduced-motion`: smooth scrolling, the intro and the 3D scenes switch off and the content shows plainly.
- Keyboard: skip link, visible focus rings, the room dialog traps focus and closes on Esc.
- Three.js and the bottle scene are code-split; the 3D chime and Google Map load only when you scroll near them;
  phones get lighter hero layers.
