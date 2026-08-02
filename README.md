# Future Power AI

**Production-ready AI platform** specialized in Generators, Solar Energy, Inverters, Batteries, ATS, AVR and Power Solutions.

> Not a demo. Fully functional chat with streaming, product catalog, articles, admin dashboard, PWA, SEO and Netlify-ready deployment.

## Features

- **AI Chat** (main page) — OpenRouter, streaming, conversation history, memory, image/PDF attachments, smart suggestions
- **Products** — full CRUD, images/videos/PDFs, status, specs, categories
- **Articles** — rich content, SEO fields, featured, categories
- **Contact** — fully editable phone, WhatsApp, email, maps, social links, logo
- **Admin Dashboard** (secret route) — Google Sign-In restricted to owner email
- **AI Settings** — choose any OpenRouter model, system prompt, temperature, max tokens
- **Premium Dark UI** — glassmorphism, Framer Motion, perfect mobile/tablet/desktop
- **Splash Screen** — Apple-quality type animation
- **PWA** — installable
- **SEO** — meta, Open Graph, Twitter Cards, robots.txt, sitemap
- **Security** — env vars, RLS, protected admin routes

## Quick Start

```bash
npm install --legacy-peer-deps
cp .env.example .env
# fill Supabase + owner email
npm run dev
```

See **docs/INSTALLATION.md** for complete Supabase, OpenRouter, Google Auth and Netlify instructions.

## Admin Access

Navigate to: `/fp-admin-login`  
Only the email set in `VITE_OWNER_EMAIL` can enter.

## Tech Stack

React 19 · Vite 6 · TypeScript · Tailwind CSS 4 · Framer Motion · Supabase · OpenRouter · React Router · PWA · Netlify

## Project Structure

See `docs/ARCHITECTURE.md`.

## License

Proprietary — for the project owner.
