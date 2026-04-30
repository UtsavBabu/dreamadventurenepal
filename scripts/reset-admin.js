const bcrypt = require('bcryptjs');
const { initDb, run } = require('../lib/db');

(async () => {
  await initDb();
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  await run(`UPDATE users SET password_hash=? WHERE username='admin'`, [hash]);
  console.log('Admin password reset to:', process.env.ADMIN_PASSWORD || 'admin123');
  process.exit(0);
})();
