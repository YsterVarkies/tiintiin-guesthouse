// All copy and facts for the site live here, so the owner can edit one file.
// Facts come from the Booking.com, LekkeSlaap and Facebook listings (Nov 2026).

export const contact = {
  name: 'Guesthouse TiinTiin',
  short: 'TiinTiin',
  phoneDisplay: '079 309 3589',
  phoneIntl: '+27793093589',
  whatsapp: '27793093589',
  email: 'guesthousetiintiin@gmail.com',
  street: '87 Chris Hani Street',
  city: 'Potchefstroom',
  postal: '2520',
  province: 'North West',
  country: 'South Africa',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Guesthouse+TiinTiin+87+Chris+Hani+Street+Potchefstroom',
  mapsEmbed:
    'https://www.google.com/maps?q=87+Chris+Hani+Street,+Potchefstroom,+2520,+South+Africa&z=15&output=embed',
  facebook: 'https://www.facebook.com/guesthousetiintiin/',
  booking: 'https://www.booking.com/hotel/za/tiintiin-guesthouse.en-gb.html',
  lekkeslaap: 'https://www.lekkeslaap.co.za/accommodation/guesthouse-tiintiin',
  hours: 'Open 24/7',
  priceFrom: 'R1 353',
};

// Optional hero video. Drop an MP4 into public/videos/ and set e.g. video: '/videos/tiintiin-hero.mp4'.
// With a video the title sits on top of it (the behind-the-sign layering needs the still photo).
export const hero = {
  video: null,
};

export const nav = [
  { label: 'home', href: '#top' },
  { label: 'our story', href: '#story' },
  { label: 'rooms', href: '#rooms' },
  { label: 'amenities', href: '#amenities' },
  { label: 'location', href: '#location' },
];

export const rating = {
  score: 10,
  label: 'Exceptional',
  count: 8,
  source: 'Booking.com',
  categories: [
    { label: 'Staff', value: 10 },
    { label: 'Cleanliness', value: 10 },
    { label: 'Comfort', value: 10 },
    { label: 'Facilities', value: 10 },
    { label: 'Value for money', value: 10 },
    { label: 'Location', value: 9.2 },
  ],
};

// Short excerpts from guest reviews on Booking.com.
export const reviews = [
  { quote: 'An absolute gem of a guesthouse in Potchefstroom!', name: 'Marelize', from: 'South Africa' },
  { quote: 'Lana is such an interesting person with the most vibrant personality.', name: 'Susan', from: 'South Africa' },
  { quote: 'She stood up at 3 to prepare breakfast for us.', name: 'Surine', from: 'South Africa' },
  { quote: "It's all the small extras that made our stay super special.", name: 'Arno', from: 'South Africa' },
];

// Room names are décor-inspired suggestions; the official listing names are in `type`.
export const rooms = [
  {
    id: 'aloe',
    no: 'Room 1',
    name: ['Al', 'oe'],
    type: 'Double Room',
    sleeps: 2,
    beds: 'King-size bed',
    blurb: 'Crisp white linen and a garden porch',
    description:
      'Crisp white linen, a sage-green headboard and hand-painted aloe cushions. Botanical prints, a reading desk with a silvered mirror, and your own little porch with a green chair for a slow first coffee.',
    features: ['King-size bed', 'En-suite shower', 'Air-conditioning', 'Fridge, microwave & kettle', 'TV & work desk', 'Private porch'],
    price: 'from R1 353',
    theme: { a: '#2c3a31', b: '#0e1411', glow: '#7f9b84', accent: '#e0644a' },
    images: ['aloe-1', 'aloe-2', 'aloe-3', 'aloe-4', 'aloe-5', 'aloe-6'],
  },
  {
    id: 'velvet',
    no: 'Room 2',
    name: ['Vel', 'vet'],
    type: 'Family Room',
    sleeps: 2,
    beds: 'King-size bed',
    blurb: 'Forest-green walls and crushed velvet',
    description:
      'Deep forest-green walls, a crushed-velvet throw and plump cushions. A shabby-chic dresser doubles as your tea station, and a rustic table waits on the private patio under the corrugated-iron eaves.',
    features: ['King-size bed', 'En-suite shower', 'Air-conditioning', 'Kitchenette with fridge', 'TV & work desk', 'Private patio'],
    price: 'from R1 353',
    theme: { a: '#1f3a2c', b: '#09130e', glow: '#4f8a5f', accent: '#c9d9a0' },
    images: ['velvet-1', 'velvet-2', 'velvet-3', 'velvet-4', 'velvet-5', 'velvet-6'],
  },
  {
    id: 'saffron',
    no: 'Room 3',
    name: ['Saf', 'fron'],
    type: 'King Room',
    sleeps: 2,
    beds: 'King-size bed',
    blurb: 'A hand-carved bed under a rust-washed ceiling',
    description:
      'A hand-carved ebony bed beneath a rust-washed tin ceiling, a saffron quilted throw, gilded mirror and a fretwork screen. Our most dramatic room, made for long lie-ins.',
    features: ['Carved king-size bed', 'En-suite shower', 'Air-conditioning', 'Dressing table & mirror', 'Tea & coffee station', 'Free Wi-Fi'],
    price: 'from R1 353',
    theme: { a: '#6a4512', b: '#180f06', glow: '#e3a93c', accent: '#f4cf7a' },
    images: ['saffron-1', 'saffron-2', 'saffron-3', 'saffron-4', 'saffron-5', 'saffron-6'],
  },
  {
    id: 'gallery',
    no: 'Room 4',
    name: ['Gal', 'lery'],
    type: 'Family Room with Shower',
    sleeps: 4,
    beds: 'King bed + 2 singles',
    blurb: 'A living art gallery for the whole family',
    description:
      'Our family suite is a living gallery: portrait-lined walls in violet and saffron, a patterned feature wall and layered Persian rugs. A king bed plus two singles, a kitchenette and a shower en-suite, with room for everyone.',
    features: ['King bed + 2 single beds', 'Sleeps 4', 'En-suite shower', 'Kitchenette with fridge', 'TV & work desk', 'Air-conditioning'],
    price: 'family rates on request',
    theme: { a: '#3b2466', b: '#120a1f', glow: '#8f5bd6', accent: '#f0c341' },
    images: ['gallery-1', 'gallery-2', 'gallery-3', 'gallery-4', 'gallery-5', 'gallery-6'],
  },
];

export const amenities = [
  {
    title: 'Plunge pool',
    text: 'A cool blue pool in the walled garden, watched over by a stone Buddha. Open all year.',
    image: 'pool-tall',
    icon: 'pool',
  },
  {
    title: 'Breakfast, with love',
    text: 'Served at the long table by arrangement, or packed to go for early starts.',
    image: 'breakfast',
    icon: 'cup',
  },
  {
    title: 'Treats in your room',
    text: 'Complimentary snacks and cold non-alcoholic drinks waiting when you arrive.',
    image: 'dessert',
    icon: 'gift',
  },
  {
    title: 'Secure parking',
    text: 'Free, on-site and behind electric fencing. Your host lives on the property.',
    image: 'doorway',
    icon: 'shield',
  },
  {
    title: 'Kitchenettes',
    text: 'Fridge, microwave, kettle and crockery, so you can make yourself at home.',
    image: 'aloe-5',
    icon: 'kettle',
  },
  {
    title: 'Work-friendly',
    text: 'Free Wi-Fi and a desk in every room. Business trips welcome.',
    image: 'aloe-4',
    icon: 'wifi',
  },
  {
    title: 'Garden & stoep',
    text: 'Blue bottles chiming overhead and shady corners to read, write or do nothing.',
    image: 'stoep',
    icon: 'leaf',
  },
  {
    title: 'Air-conditioned',
    text: 'Every room is air-conditioned, with a private en-suite shower.',
    image: 'saffron-6',
    icon: 'air',
  },
];

export const tickerItems = [
  'Plunge pool',
  'Breakfast by arrangement',
  'Free secure parking',
  'Free Wi-Fi',
  'Air-conditioning',
  'Kitchenettes',
  'Garden & patios',
  'Afrikaans & English spoken',
  'Card payments',
];

export const gallery = [
  { image: 'lounge', text: 'The lounge' },
  { image: 'dining', text: 'Candlelit table' },
  { image: 'couch', text: 'Art on every wall' },
  { image: 'pool-wide', text: 'Plunge pool' },
  { image: 'stoep', text: 'Blue-bottle stoep' },
  { image: 'courtyard', text: 'Courtyard corner' },
  { image: 'long-table', text: 'Long-table dinners' },
  { image: 'breakfast-2', text: 'Breakfast' },
  { image: 'green-room', text: 'Carved & cosy' },
  { image: 'doorway', text: 'The guardians' },
  { image: 'bath-art', text: 'Even the bathrooms' },
  { image: 'velvet-3', text: 'Private patio' },
];

export const nearby = [
  { place: 'Equatorial Coffee', distance: '400 m', kind: 'Café' },
  { place: 'Discovery Pub', distance: '600 m', kind: 'Pub' },
  { place: 'Potchefstroom station', distance: '2 km', kind: 'Train' },
  { place: 'Potchefstroom Museum', distance: '2.5 km', kind: 'Museum' },
  { place: 'Goetz/Fleischack Museum', distance: '2.5 km', kind: 'Museum' },
  { place: 'Potchefstroom Country Club', distance: '2.7 km', kind: 'Golf' },
  { place: 'OPM Prozesky Bird Sanctuary', distance: '3 km', kind: 'Nature' },
  { place: 'Senwes Park', distance: '4.3 km', kind: 'Stadium' },
  { place: 'NWU Botanical Garden', distance: '5 km', kind: 'Garden' },
  { place: 'Lanseria International Airport', distance: '132 km', kind: 'Airport' },
];

export const houseRules = [
  { label: 'Check-in', value: 'from 10:00' },
  { label: 'Check-out', value: 'by 10:00' },
  { label: 'Children', value: 'all ages welcome' },
  { label: 'Pets', value: 'not allowed' },
  { label: 'Smoking', value: 'not allowed' },
  { label: 'Parties & events', value: 'not allowed' },
];
