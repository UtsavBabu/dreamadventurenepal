# Dream Adventure Nepal Pro

A travel website with:
- secure admin login using hashed passwords + sessions
- SQLite database for content and inquiries
- real image upload from admin
- editable packages, blog, gallery, homepage, About Us, leadership team, footer, and SEO fields
- inquiry management panel

## Run locally

```bash
npm install
npm start
```

Open:
- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login

Default admin:
- username: admin
- password: admin123

## If localhost does not open

This means the server is not running.
Start it again with:

```bash
npm start
```

## Hosting suggestions

### Vercel
This project uses Express + SQLite + sessions + uploads. It is **not ideal for Vercel** because local file uploads and SQLite are not durable on serverless hosting.

### Netlify
Not recommended for the same reason.

### Best options
Use one of these:
- Render
- Railway
- VPS / Ubuntu server

These support a long-running Node.js app and persistent storage more naturally.

## Production notes
Before going live, change:
- SESSION_SECRET
- ADMIN_PASSWORD

You can reset the admin password with:

```bash
ADMIN_PASSWORD=newstrongpassword npm run seed-admin
```
