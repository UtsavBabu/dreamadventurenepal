const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'site.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

const defaultSettings = {
  brand: {
    siteName: 'Dream Adventure Nepal',
    tagline: 'Explore • Experience • Inspire',
    sinceYear: '2026',
    logoPath: '/images/logo.jpeg',
    phone: '+977-985-1234567',
    whatsapp: '+977-985-1234567',
    email: 'info@dreamadventurenepal.com',
    address: 'Thamel-26, Kathmandu, Nepal',
    openingHours: 'Daily: 7:00 AM - 8:00 PM',
    regNo: '113456/079',
    tourismNo: '2156',
    vatNo: '601221900'
  },
  seo: {
    homeTitle: 'Dream Adventure Nepal | Trekking, Tours & Himalayan Journeys',
    homeDescription: 'Book Nepal treks, Kathmandu tours, heritage trips, and custom Himalayan adventures with a trusted local team.',
    aboutTitle: 'About Us | Dream Adventure Nepal',
    aboutDescription: 'Meet the team behind Dream Adventure Nepal and discover our story, values, and travel leadership.',
    packagesTitle: 'Trekking Packages | Dream Adventure Nepal',
    packagesDescription: 'Explore trekking packages, cultural tours, Tibet journeys, and Kathmandu sightseeing experiences.',
    blogTitle: 'Travel Blog | Dream Adventure Nepal',
    blogDescription: 'Read Nepal trekking tips, travel planning guides, and destination stories.',
    galleryTitle: 'Gallery | Dream Adventure Nepal',
    galleryDescription: 'See mountains, heritage sites, and memorable moments from journeys across Nepal and Tibet.',
    contactTitle: 'Contact | Dream Adventure Nepal',
    contactDescription: 'Send an inquiry and plan your next trip with Dream Adventure Nepal.'
  },
  home: {
    badge: 'Trusted Nepal Travel Team',
    heroTitleLine1: "Nepal's Premier",
    heroTitleAccent: 'Himalayan Adventure',
    heroTitleLine3: 'Specialists',
    heroSubtitle: 'Simple planning, real local support, and unforgettable journeys across Nepal, Tibet, and Kathmandu Valley.',
    heroImage: '/images/hero-nepal.svg',
    stat1Value: '100+',
    stat1Label: 'Happy Tourists',
    stat2Value: 'Expert Guides',
    stat2Label: 'Local Team',
    stat3Value: '20+',
    stat3Label: 'Countries',
    stat4Value: '100%',
    stat4Label: 'Safety Focus',
    sectionHeading: 'Popular Journeys',
    sectionText: 'Clear itineraries, real visuals, and easy inquiry options so every traveler can plan with confidence.'
  },
  about: {
    badgeLabel: 'Our Story',
    heroTitle: 'Built for Travelers Who Want Nepal Done Right',
    heroSubtitle: 'A local company established in 2026, supported by expert guides and a leadership team focused on safe, simple, and memorable travel.',
    established: '2026',
    establishedLocation: 'Kathmandu',
    storyHeading: 'Inspired by the Himalayas, Driven by Service',
    storyParagraph1: 'Dream Adventure Nepal was established in 2026 with one clear goal: help travelers experience Nepal with proper planning, honest guidance, and warm hospitality. We believe travel should feel exciting, not confusing.',
    storyParagraph2: 'Our strength comes from our guide team and leadership team working together. From mountain routes to city sightseeing, every trip is shaped with local knowledge, practical support, and a focus on comfort and safety.',
    storyParagraph3: 'Whether someone wants a major Himalayan trek, a Tibet journey, or a heritage tour around Kathmandu Valley, we want the experience to feel simple from the first inquiry to the final goodbye.',
    mainImage: '/images/about-main.svg',
    sideImage: '/images/heritage-kathmandu.svg'
  },
  aboutStats: [
    { value: '2026', label: 'Established' },
    { value: 'Expert Guides', label: 'Experienced Team' },
    { value: '100+', label: 'Happy Tourists' },
    { value: '20+', label: 'Countries Reached' }
  ],
  values: [
    { icon: '🧭', title: 'Local Knowledge', description: 'Trips are shaped by guides and planners who understand routes, weather, culture, and guest needs.' },
    { icon: '🛡️', title: 'Safety First', description: 'Clear planning, realistic pacing, and strong support help travelers feel secure throughout the journey.' },
    { icon: '🤝', title: 'Human Support', description: 'We keep communication easy and friendly so travelers always know what to expect.' },
    { icon: '🌿', title: 'Responsible Travel', description: 'We promote tourism that respects nature, heritage, and local communities.' }
  ],
  footer: {
    description: 'Dream Adventure Nepal Tours and Trek Pvt. Ltd. is your trusted local travel partner for trekking, culture, sightseeing, and Himalayan experiences across Nepal.',
    badge1: 'NTB Certified',
    badge2: 'TAAN Member',
    badge3: 'Eco Friendly'
  },
  team: [
    { role: 'Chief Executive Officer', name: 'Add CEO Name', bio: 'Leads the company vision, client trust, and service quality across all travel experiences.', image: '/images/team-ceo.svg' },
    { role: 'Chief Trekking Officer', name: 'Add CTO Name', bio: 'Oversees route planning, trek quality, guide coordination, and mountain readiness.', image: '/images/team-cto.svg' },
    { role: 'Director', name: 'Add Director Name', bio: 'Supports business operations, partnerships, and smooth travel management for guests.', image: '/images/team-director.svg' },
    { role: 'Advisor', name: 'Add Advisor Name', bio: 'Provides strategic guidance on service development, traveler experience, and brand direction.', image: '/images/team-advisor.svg' }
  ]
};

const defaultPackages = [
  {
    slug: 'everest-base-camp-trek', title: 'Everest Base Camp Trek', subtitle: 'The classic Himalayan journey',
    description: 'A bucket-list adventure through Sherpa villages, monasteries, and unforgettable Himalayan scenery on the way to Everest Base Camp.',
    region: 'Everest', duration: '14 Days', altitude: '5,364m', difficulty: 'Challenging', price: '$1,299', image: '/images/everest-base-camp.svg', category: 'Mountain Trek', featured: 1,
    seo_title: 'Everest Base Camp Trek | Dream Adventure Nepal', seo_description: 'Book the Everest Base Camp Trek with a trusted Nepal-based team.'
  },
  {
    slug: 'everest-base-camp-trek-with-helicopter-return', title: 'Everest Base Camp Trek with Helicopter Return', subtitle: 'A shorter Everest route with a scenic helicopter return',
    description: 'A premium Everest journey for travelers who want the classic trail atmosphere with a faster and more scenic helicopter return from the high Himalayas.',
    region: 'Everest', duration: '9 Days', altitude: '5,545m', difficulty: 'Moderate', price: '$2,850', image: '/images/everest-base-camp.svg', category: 'Helicopter Trek', featured: 1,
    seo_title: 'Everest Base Camp Trek with Helicopter Return | Dream Adventure Nepal', seo_description: 'Explore Everest Base Camp in 9 days with a scenic helicopter return and local support from Dream Adventure Nepal.'
  },
  {
    slug: 'annapurna-circuit-trek', title: 'Annapurna Circuit Trek', subtitle: 'Epic landscapes and culture',
    description: 'A world-famous trek crossing varied landscapes, villages, and the dramatic Thorong La Pass.',
    region: 'Annapurna', duration: '15 Days', altitude: '5,416m', difficulty: 'Moderate to Challenging', price: '$899', image: '/images/annapurna-circuit.svg', category: 'Mountain Trek', featured: 1,
    seo_title: 'Annapurna Circuit Trek | Dream Adventure Nepal', seo_description: 'Explore Annapurna Circuit with local guides and flexible support.'
  },
  {
    slug: 'poon-hill-trek', title: 'Poon Hill Trek', subtitle: 'Short and rewarding',
    description: 'Perfect for beginners who want sunrise views over Dhaulagiri and Annapurna without a very long trek.',
    region: 'Annapurna', duration: '5 Days', altitude: '3,210m', difficulty: 'Easy', price: '$349', image: '/images/poon-hill.svg', category: 'Hill Trek', featured: 1,
    seo_title: 'Poon Hill Trek | Dream Adventure Nepal', seo_description: 'See iconic sunrise views on a short and beginner-friendly Nepal trek.'
  },
  {
    slug: 'langtang-valley-trek', title: 'Langtang Valley Trek', subtitle: 'Close to Kathmandu, rich in beauty',
    description: 'A beautiful route with glaciers, mountain views, yak pastures, and Tamang culture.',
    region: 'Langtang', duration: '10 Days', altitude: '4,984m', difficulty: 'Easy to Moderate', price: '$599', image: '/images/langtang-valley.svg', category: 'Mountain Trek', featured: 1,
    seo_title: 'Langtang Valley Trek | Dream Adventure Nepal', seo_description: 'Plan your Langtang Valley trek with easy support from a local team.'
  },
  {
    slug: 'manaslu-circuit-trek', title: 'Manaslu Circuit Trek', subtitle: 'Remote and raw Himalayan beauty',
    description: 'A quieter high-altitude circuit for travelers who want big mountain scenery and authentic trail life.',
    region: 'Manaslu', duration: '14 Days', altitude: '5,160m', difficulty: 'Challenging', price: '$1,099', image: '/images/manaslu-circuit.svg', category: 'Mountain Trek', featured: 0,
    seo_title: 'Manaslu Circuit Trek | Dream Adventure Nepal', seo_description: 'Discover the Manaslu Circuit with experienced local support.'
  },
  {
    slug: 'upper-mustang-tour', title: 'Upper Mustang Journey', subtitle: 'The desert mountain kingdom',
    description: 'Explore the hidden Himalayan kingdom of Mustang with dramatic cliffs, monasteries, and ancient villages.',
    region: 'Mustang', duration: '12 Days', altitude: '3,840m', difficulty: 'Moderate', price: '$1,499', image: '/images/upper-mustang.svg', category: 'Mountain Tour', featured: 0,
    seo_title: 'Upper Mustang Tour | Dream Adventure Nepal', seo_description: 'Travel through Upper Mustang with a guided cultural and mountain itinerary.'
  },
  {
    slug: 'tibet-overland-tour', title: 'Tibet Overland Tour', subtitle: 'Nepal to Tibet overland experience',
    description: 'A scenic cross-border journey combining mountain roads, monasteries, and Tibetan landscapes.',
    region: 'Tibet', duration: '8 Days', altitude: '3,650m', difficulty: 'Easy to Moderate', price: '$1,250', image: '/images/tibet-overland.svg', category: 'Tibet Tour', featured: 0,
    seo_title: 'Tibet Overland Tour | Dream Adventure Nepal', seo_description: 'Plan a Nepal to Tibet overland journey with trusted travel support.'
  },
  {
    slug: 'kathmandu-valley-heritage-tour', title: 'Kathmandu Valley Heritage Tour', subtitle: 'Culture, temples, and local stories',
    description: 'Discover Kathmandu, Bhaktapur, and Patan through heritage squares, temples, and local culture.',
    region: 'Kathmandu Valley', duration: '3 Days', altitude: '1,400m', difficulty: 'Easy', price: '$199', image: '/images/kathmandu-heritage.svg', category: 'Sightseeing', featured: 0,
    seo_title: 'Kathmandu Valley Heritage Tour | Dream Adventure Nepal', seo_description: 'Visit Kathmandu Valley heritage sites with an easy, guided cultural tour.'
  }
];

const defaultBlogs = [
  {
    slug: 'best-time-to-trek-in-nepal', title: 'Best Time to Trek in Nepal', excerpt: 'A simple guide to choosing the right season for your adventure.',
    content: 'Spring and autumn are usually the most popular seasons for trekking in Nepal because of stable weather and clear mountain views.',
    cover_image: '/images/blog-season.svg', published_at: '2026-04-01', seo_title: 'Best Time to Trek in Nepal', seo_description: 'Understand the best trekking seasons in Nepal.'
  },
  {
    slug: 'what-to-pack-for-everest-base-camp', title: 'What to Pack for Everest Base Camp', excerpt: 'Keep your bag light, practical, and suitable for the trail.',
    content: 'Packing well can make a big difference on high-altitude treks. Focus on layers, boots, simple medicines, and essential documents.',
    cover_image: '/images/blog-packing.svg', published_at: '2026-04-05', seo_title: 'What to Pack for Everest Base Camp', seo_description: 'A practical Everest Base Camp packing guide.'
  }
];

const defaultGallery = [
  { title: 'Everest Region', image: '/images/everest-base-camp.svg', category: 'Mountain', description: 'High alpine views and classic Himalayan landscapes.' },
  { title: 'Annapurna Sunrise', image: '/images/poon-hill.svg', category: 'Mountain', description: 'Golden light over the Annapurna range.' },
  { title: 'Kathmandu Heritage', image: '/images/kathmandu-heritage.svg', category: 'Heritage', description: 'Temples, courtyards, and living history.' },
  { title: 'Tibet Route', image: '/images/tibet-overland.svg', category: 'Tour', description: 'A scenic overland journey beyond Nepal.' }
];

async function setSetting(key, value) {
  await run(
    `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [key, JSON.stringify(value)]
  );
}

async function getSetting(key, fallback = null) {
  const row = await get(`SELECT value FROM settings WHERE key = ?`, [key]);
  return row ? JSON.parse(row.value) : fallback;
}

async function initDb() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'super_admin',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    region TEXT,
    duration TEXT,
    altitude TEXT,
    difficulty TEXT,
    price TEXT,
    image TEXT,
    category TEXT,
    featured INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    cover_image TEXT,
    published_at TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image TEXT,
    category TEXT,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT,
    trip TEXT,
    travel_date TEXT,
    group_size TEXT,
    message TEXT,
    status TEXT DEFAULT 'New',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS team (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    bio TEXT,
    image TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  const adminExists = await get(`SELECT * FROM users WHERE username = ?`, ['admin']);
  if (!adminExists) {
    const passwordHash = process.env.ADMIN_PASSWORD || 'admin123';
    await run(`INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`, ['admin', passwordHash, 'super_admin']);
  }

  const settingsKeys = [
    ['brand', defaultSettings.brand],
    ['seo', defaultSettings.seo],
    ['home', defaultSettings.home],
    ['about', defaultSettings.about],
    ['aboutStats', defaultSettings.aboutStats],
    ['values', defaultSettings.values],
    ['footer', defaultSettings.footer],
    ['team', defaultSettings.team]
  ];

  for (const [key, value] of settingsKeys) {
    const current = await getSetting(key);
    if (!current) await setSetting(key, value);
  }

  const packageCount = await get(`SELECT COUNT(*) as count FROM packages`);
  if (!packageCount || packageCount.count === 0) {
    for (const pkg of defaultPackages) {
      await run(`INSERT INTO packages (slug, title, subtitle, description, region, duration, altitude, difficulty, price, image, category, featured, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [pkg.slug, pkg.title, pkg.subtitle, pkg.description, pkg.region, pkg.duration, pkg.altitude, pkg.difficulty, pkg.price, pkg.image, pkg.category, pkg.featured, pkg.seo_title, pkg.seo_description]);
    }
  }

  const blogCount = await get(`SELECT COUNT(*) as count FROM blogs`);
  if (!blogCount || blogCount.count === 0) {
    for (const blog of defaultBlogs) {
      await run(`INSERT INTO blogs (slug, title, excerpt, content, cover_image, published_at, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [blog.slug, blog.title, blog.excerpt, blog.content, blog.cover_image, blog.published_at, blog.seo_title, blog.seo_description]);
    }
  }

  const galleryCount = await get(`SELECT COUNT(*) as count FROM gallery`);
  if (!galleryCount || galleryCount.count === 0) {
    for (const item of defaultGallery) {
      await run(`INSERT INTO gallery (title, image, category, description) VALUES (?, ?, ?, ?)`, [item.title, item.image, item.category, item.description]);
    }
  }
}

module.exports = { db, run, get, all, initDb, getSetting, setSetting, defaultSettings };
