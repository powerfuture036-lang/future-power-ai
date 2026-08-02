# Architecture Overview — Future Power AI

## Stack

- **Frontend**: React 19 + Vite 6 + TypeScript (strict)
- **Styling**: Tailwind CSS v4 + custom glassmorphism theme
- **Animation**: Framer Motion
- **Routing**: React Router v7
- **Backend / DB / Auth / Storage**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: OpenRouter (any model: GPT, Claude, Gemini, Qwen, DeepSeek…)
- **PWA**: vite-plugin-pwa
- **Deployment**: Netlify (manual or CLI)

## Folder Structure

```
src/
  components/
    admin/          Admin shell
    chat/           Chat bubbles, suggestions
    common/         SEO, Splash, ProtectedRoute, Loader
    layout/         Header, SideMenu, AppLayout
  contexts/         AuthContext, AppContext
  hooks/            (extensible)
  lib/              supabase, openrouter, utils
  pages/            Public + admin pages
  types/            Shared TypeScript interfaces
  styles/           Extra styles if needed
  App.tsx           Routes + Splash
  main.tsx          Providers
supabase/
  schema.sql        Full database schema + RLS + seed
public/
  icons/            PWA icons
  robots.txt
  sitemap.xml
  manifest.webmanifest
docs/               Installation & architecture
```

## Key Design Decisions

1. **No hardcoded business data** — products, contact, articles, AI settings live in Supabase and are editable from the dashboard.
2. **AI knowledge is model-native** — the system prompt specializes the model; the owner does not need to upload technical knowledge.
3. **Secret admin entry** — `/fp-admin-login` (no visible link). Only the configured owner email can enter.
4. **Guest chat** — visitors chat anonymously; conversations are keyed by a browser fingerprint stored in localStorage.
5. **Streaming** — OpenRouter SSE streaming with typing indicator and auto-scroll.
6. **Suggestions** — after each assistant reply the AI can generate 3 follow-up questions.
7. **PWA + responsive** — works as installable app on mobile/tablet/desktop.
8. **Security** — environment variables only; RLS on all tables; authenticated writes only for admin tables.

## Data Flow (Chat)

1. User types message → saved to `messages` (and creates `conversations` if needed).
2. Client builds context (memory) → streams to OpenRouter.
3. Tokens stream back → live update of assistant bubble.
4. Final message saved; optional suggestion generation.

## Admin Routes

| Path | Purpose |
|------|---------|
| /fp-admin-login | Google sign-in (owner only) |
| /admin | Dashboard overview |
| /admin/products | CRUD products + media |
| /admin/articles | CRUD articles |
| /admin/contact | Edit contact & socials |
| /admin/ai | OpenRouter key, model, prompt, temperature |
| /admin/settings | Site name, SEO, maintenance |

## Extending

- Add new models: just select them in AI Settings (OpenRouter list is fetched live).
- Add video support: already prepared in attachment types.
- Multi-language: system prompt already answers in user language.
EOF
