# Future Power AI — Installation & Deployment Guide

## 1. Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account (free tier works)
- OpenRouter account + API key
- Netlify account (for deployment)

## 2. Local Setup

```bash
# Clone or extract the project
cd future-power-ai

# Install dependencies
npm install --legacy-peer-deps

# Copy environment file
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_URL=http://localhost:5173
VITE_OWNER_EMAIL=your-owner@email.com
```

## 3. Supabase Setup

1. Create a new Supabase project.
2. Go to **SQL Editor** → New query.
3. Paste the entire content of `supabase/schema.sql` and run it.
4. Go to **Authentication → Providers** → Enable **Google**.
5. Add your domain / localhost to authorized redirect URLs:
   - `http://localhost:5173`
   - `https://your-netlify-site.netlify.app`
6. (Optional) Storage: create buckets `products`, `articles`, `media` with public read if you plan to upload images.

## 4. OpenRouter

1. Sign up at https://openrouter.ai
2. Create an API key.
3. After the site is running, log in to Admin (`/fp-admin-login`) and paste the key in **AI Settings**.
   The key can also be set via `VITE_OPENROUTER_API_KEY` (not recommended for production).

## 5. Owner Login (Google)

Only the email listed in `VITE_OWNER_EMAIL` (and/or the `admins` table) can access the dashboard.

1. Visit `/fp-admin-login`
2. Sign in with Google using the owner email.
3. You will be redirected to `/admin`.

## 6. Netlify Deployment (Manual – No GitHub required)

1. Run locally:
   ```bash
   npm run build
   ```
2. In Netlify dashboard → **Add new site → Deploy manually**.
3. Drag & drop the `dist` folder.
4. In **Site settings → Environment variables** add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL` = your Netlify URL
   - `VITE_OWNER_EMAIL`
5. Trigger a rebuild if needed (or re-upload after changing env).

The included `netlify.toml` already configures SPA redirects and security headers.

## 7. Post-Deployment Checklist

- [ ] Update `public/sitemap.xml` and `public/robots.txt` with your real domain
- [ ] Add products, contact info and articles from Admin
- [ ] Configure AI model & system prompt
- [ ] Test chat streaming
- [ ] Test Google login with owner email
- [ ] Verify mobile + tablet layout

## 8. Backup & Restore

- Database: use Supabase **Database → Backups** or `pg_dump`.
- Storage: download buckets from Supabase dashboard.
- Code: keep a copy of the source zip.

## 9. Troubleshooting

| Issue | Solution |
|-------|----------|
| Chat says "API key not configured" | Set key in Admin → AI Settings |
| Admin login fails | Confirm email matches `VITE_OWNER_EMAIL` and Google provider is enabled |
| Blank page after deploy | Check browser console + Netlify env vars; ensure redirect rule exists |
| Images not loading | Check Supabase Storage policies and public URLs |

## Support

This is a production-ready codebase. All business data is managed from the Admin Dashboard — nothing is hardcoded.
