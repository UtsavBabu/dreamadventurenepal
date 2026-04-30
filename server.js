const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { initDb, getSetting, setSetting, all, get, run } = require('./lib/db');

const app = express();
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, 'public');
const uploadDir = path.join(publicDir, 'images', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const name = path.basename(file.originalname || 'upload', ext).replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${name}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if ((file.mimetype || '').startsWith('image/')) cb(null, true);
    else cb(new Error('Only image uploads are allowed'));
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(publicDir));
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: path.join(__dirname, 'data') }),
  secret: process.env.SESSION_SECRET || 'dream-adventure-nepal-super-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24,
    secure: false
  }
}));

function slugify(text = '') {
  return text.toString().toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function loadSiteData() {
  const [brand, seo, home, about, aboutStats, values, footer, team, packages, blogs, gallery] = await Promise.all([
    getSetting('brand', {}),
    getSetting('seo', {}),
    getSetting('home', {}),
    getSetting('about', {}),
    getSetting('aboutStats', []),
    getSetting('values', []),
    getSetting('footer', {}),
    all(`SELECT * FROM team ORDER BY id ASC`),
    all(`SELECT * FROM packages ORDER BY featured DESC, id ASC`),
    all(`SELECT * FROM blogs ORDER BY date(COALESCE(published_at, created_at)) DESC, id DESC`),
    all(`SELECT * FROM gallery ORDER BY id DESC`)
  ]);
  return { brand, seo, home, about, aboutStats, values, footer, team, packages, blogs, gallery };
}

async function adminData() {
  const [brand, seo, home, about, aboutStats, values, footer, team, packages, blogs, gallery, inquiries] = await Promise.all([
    getSetting('brand', {}),
    getSetting('seo', {}),
    getSetting('home', {}),
    getSetting('about', {}),
    getSetting('aboutStats', []),
    getSetting('values', []),
    getSetting('footer', {}),
    all(`SELECT * FROM team ORDER BY id ASC`),
    all(`SELECT * FROM packages ORDER BY featured DESC, id ASC`),
    all(`SELECT * FROM blogs ORDER BY date(COALESCE(published_at, created_at)) DESC, id DESC`),
    all(`SELECT * FROM gallery ORDER BY id DESC`),
    all(`SELECT * FROM inquiries ORDER BY id DESC`)
  ]);
  return { brand, seo, home, about, aboutStats, values, footer, team, packages, blogs, gallery, inquiries };
}

function requireAdmin(req, res, next) {
  if (!req.session.user) return res.redirect('/admin/login');
  next();
}

app.use(async (req, res, next) => {
  try {
    res.locals.site = await loadSiteData();
    res.locals.currentPath = req.path;
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/', async (req, res) => {
  res.render('index', { title: res.locals.site.seo.homeTitle });
});

app.get('/about', async (req, res) => {
  res.render('about', { title: res.locals.site.seo.aboutTitle });
});

app.get('/packages', async (req, res) => {
  res.render('packages', { title: res.locals.site.seo.packagesTitle });
});

app.get('/blog', async (req, res) => {
  res.render('blog', { title: res.locals.site.seo.blogTitle });
});

app.get('/gallery', async (req, res) => {
  res.render('gallery', { title: res.locals.site.seo.galleryTitle });
});

app.get('/contact', async (req, res) => {
  res.render('contact', { title: res.locals.site.seo.contactTitle, success: req.query.success || '' });
});

app.get('/package/:slug', async (req, res, next) => {
  const pkg = await get(`SELECT * FROM packages WHERE slug = ?`, [req.params.slug]);
  if (!pkg) return next();
  res.render('package-detail', { title: pkg.seo_title || pkg.title, pkg });
});

app.get('/blog/:slug', async (req, res, next) => {
  const blog = await get(`SELECT * FROM blogs WHERE slug = ?`, [req.params.slug]);
  if (!blog) return next();
  res.render('blog-detail', { title: blog.seo_title || blog.title, blog });
});

app.post('/inquiry', async (req, res) => {
  const { name, email, phone, trip, travel_date, group_size, message } = req.body;
  await run(`INSERT INTO inquiries (name, email, phone, trip, travel_date, group_size, message) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name || '', email || '', phone || '', trip || '', travel_date || '', group_size || '', message || '']);
  res.redirect('/contact?success=Thank%20you!%20Your%20inquiry%20has%20been%20received.');
});

app.get('/admin/login', (req, res) => {
  if (req.session.user) return res.redirect('/admin');
  res.render('admin/login', { title: 'Admin Login', error: req.query.error || '' });
});

app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await get(`SELECT * FROM users WHERE username = ?`, [username]);
  if (!user) return res.redirect('/admin/login?error=Invalid%20username%20or%20password');
  const ok = user.password_hash && user.password_hash.startsWith('$2')
    ? await bcrypt.compare(password, user.password_hash)
    : password === user.password_hash;
  if (!ok) return res.redirect('/admin/login?error=Invalid%20username%20or%20password');
  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.redirect('/admin');
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

app.get('/admin', requireAdmin, async (req, res) => {
  res.render('admin/dashboard', { title: 'Admin Dashboard', admin: await adminData(), success: req.query.success || '' });
});

app.post('/admin/upload', requireAdmin, upload.single('image'), async (req, res) => {
  const imagePath = `/images/uploads/${req.file.filename}`;
  res.json({ success: true, path: imagePath });
});

app.post('/admin/settings', requireAdmin, async (req, res) => {
  const { section, payload } = req.body;
  if (!section) return res.redirect('/admin');
  let parsed = {};
  try {
    parsed = JSON.parse(payload || '{}');
  } catch (e) {
    return res.redirect('/admin?success=Invalid%20JSON%20payload%20for%20settings');
  }
  await setSetting(section, parsed);
  res.redirect('/admin?success=Settings%20updated%20successfully');
});

app.post('/admin/package/save', requireAdmin, async (req, res) => {
  const data = {
    slug: slugify(req.body.slug || req.body.title),
    title: req.body.title,
    subtitle: req.body.subtitle,
    description: req.body.description,
    region: req.body.region,
    duration: req.body.duration,
    altitude: req.body.altitude,
    difficulty: req.body.difficulty,
    price: req.body.price,
    image: req.body.image,
    category: req.body.category,
    featured: req.body.featured ? 1 : 0,
    seo_title: req.body.seo_title,
    seo_description: req.body.seo_description
  };
  if (req.body.id) {
    await run(`UPDATE packages SET slug=?, title=?, subtitle=?, description=?, region=?, duration=?, altitude=?, difficulty=?, price=?, image=?, category=?, featured=?, seo_title=?, seo_description=? WHERE id=?`,
      [data.slug, data.title, data.subtitle, data.description, data.region, data.duration, data.altitude, data.difficulty, data.price, data.image, data.category, data.featured, data.seo_title, data.seo_description, req.body.id]);
  } else {
    await run(`INSERT INTO packages (slug, title, subtitle, description, region, duration, altitude, difficulty, price, image, category, featured, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.slug, data.title, data.subtitle, data.description, data.region, data.duration, data.altitude, data.difficulty, data.price, data.image, data.category, data.featured, data.seo_title, data.seo_description]);
  }
  res.redirect('/admin?success=Package%20saved%20successfully');
});

app.post('/admin/package/delete', requireAdmin, async (req, res) => {
  await run(`DELETE FROM packages WHERE id = ?`, [req.body.id]);
  res.redirect('/admin?success=Package%20deleted');
});

app.post('/admin/blog/save', requireAdmin, async (req, res) => {
  const data = {
    slug: slugify(req.body.slug || req.body.title),
    title: req.body.title,
    excerpt: req.body.excerpt,
    content: req.body.content,
    cover_image: req.body.cover_image,
    published_at: req.body.published_at,
    seo_title: req.body.seo_title,
    seo_description: req.body.seo_description
  };
  if (req.body.id) {
    await run(`UPDATE blogs SET slug=?, title=?, excerpt=?, content=?, cover_image=?, published_at=?, seo_title=?, seo_description=? WHERE id=?`,
      [data.slug, data.title, data.excerpt, data.content, data.cover_image, data.published_at, data.seo_title, data.seo_description, req.body.id]);
  } else {
    await run(`INSERT INTO blogs (slug, title, excerpt, content, cover_image, published_at, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.slug, data.title, data.excerpt, data.content, data.cover_image, data.published_at, data.seo_title, data.seo_description]);
  }
  res.redirect('/admin?success=Blog%20saved%20successfully');
});

app.post('/admin/blog/delete', requireAdmin, async (req, res) => {
  await run(`DELETE FROM blogs WHERE id = ?`, [req.body.id]);
  res.redirect('/admin?success=Blog%20deleted');
});

app.post('/admin/gallery/save', requireAdmin, async (req, res) => {
  const data = { title: req.body.title, image: req.body.image, category: req.body.category, description: req.body.description };
  if (req.body.id) {
    await run(`UPDATE gallery SET title=?, image=?, category=?, description=? WHERE id=?`, [data.title, data.image, data.category, data.description, req.body.id]);
  } else {
    await run(`INSERT INTO gallery (title, image, category, description) VALUES (?, ?, ?, ?)`, [data.title, data.image, data.category, data.description]);
  }
  res.redirect('/admin?success=Gallery%20item%20saved%20successfully');
});

app.post('/admin/gallery/delete', requireAdmin, async (req, res) => {
  await run(`DELETE FROM gallery WHERE id = ?`, [req.body.id]);
  res.redirect('/admin?success=Gallery%20item%20deleted');
});

// Team member management
app.post('/admin/team/save', requireAdmin, async (req, res) => {
  const data = { role: req.body.role, name: req.body.name, bio: req.body.bio, image: req.body.image };
  if (req.body.id) {
    await run(`UPDATE team SET role=?, name=?, bio=?, image=? WHERE id=?`, [data.role, data.name, data.bio, data.image, req.body.id]);
  } else {
    await run(`INSERT INTO team (role, name, bio, image) VALUES (?, ?, ?, ?)`, [data.role, data.name, data.bio, data.image]);
  }
  res.redirect('/admin?success=Team%20member%20saved%20successfully');
});

app.post('/admin/team/delete', requireAdmin, async (req, res) => {
  await run(`DELETE FROM team WHERE id = ?`, [req.body.id]);
  res.redirect('/admin?success=Team%20member%20deleted');
});

app.post('/admin/inquiry/status', requireAdmin, async (req, res) => {
  await run(`UPDATE inquiries SET status=? WHERE id=?`, [req.body.status, req.body.id]);
  res.redirect('/admin?success=Inquiry%20status%20updated');
});

app.post('/admin/inquiry/delete', requireAdmin, async (req, res) => {
  await run(`DELETE FROM inquiries WHERE id=?`, [req.body.id]);
  res.redirect('/admin?success=Inquiry%20deleted');
});

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send('Something went wrong. Please restart the server and try again.');
});

(async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Dream Adventure Nepal running at http://localhost:${PORT}`);
  });
})();
