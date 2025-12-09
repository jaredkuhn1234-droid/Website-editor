
# Website Builder Platform (Professional Edition)

A modern, extensible, and production-ready SaaS website builder. Features a landing site, dashboard, visual editor, template system, autosave, preview, and full Supabase/Netlify integration.

---

## Features

- **Landing Site**: Clean marketing homepage (`landing-site/`)
- **Dashboard**: Modern card UI, static thumbnails, new project flow, and Supabase auth
- **Visual Editor**: Drag-and-drop, section-based, with template loading, autosave, and preview mode
- **Templates**: JSON-based, easily extendable (`templates/`)
- **Sections Library**: Modular, editable, and themeable (`editor/sections/`)
- **Autosave**: Saves every 15s or on changes, with "Saved" and "Saving…" indicators
- **Preview Mode**: Instantly preview your site in read-only, pixel-perfect mode
- **Supabase Integration**: Auth, storage, and site data
- **Netlify Integration**: One-click publish
- **.env.example**: All required environment variables

---

## How It Works

- **Preview Mode**: Click the Preview button in the editor to see your site as visitors will. The editor switches to a read-only, pixel-perfect view.
- **Autosave**: Your work is automatically saved every 15 seconds or whenever you make changes. A "Saved" indicator appears when complete, and "Saving…" shows while in progress.
- **Templates**: Start new sites from professionally designed templates. Templates are stored as JSON files in `/templates/` and can be extended or customized.
- **Sections Library**: Build pages by adding modular sections (hero, gallery, features, testimonials, pricing, stats-strip, etc.) from `/editor/sections/`. Each section supports text, images, and style controls.
- **Publishing**: When ready, click Publish. The backend generates static HTML for each page and deploys to Netlify. The published URL is displayed on success.

---

## Quick Start

1. **Clone the repo**
2. Copy `.env.example` to `.env` and fill in your Supabase/Netlify keys
3. Run `npm install`
4. Start the Node.js HTTP server: `node server.js`
5. Open `landing-site/index.html` in your browser

---

## Project Structure

- `landing-site/` — Marketing homepage
- `app/` — Dashboard, login, signup
- `editor/` — Visual editor UI
- `backend/` — Node.js HTTP server, Supabase/Netlify logic
- `templates/` — Site templates (JSON)
- `assets/` — Icons, images, thumbnails

---


## Final Professionalization & SAFE MODE Upgrade (2025)

- All unwanted files/folders removed (no .env, node_modules, logs, tests, Copilot instructions, etc.)
- `.env.example` provided (no secrets in repo)
- Security: Supabase config sanitized, no real keys/URLs
- Bug fixes: publish.js, template loading, section rendering
- Templates aligned: only supported sections, all loadable
- Editor polished: autosave, preview, publish, section controls (move up/down/delete for custom sections only)
- Lint/safety: All files checked, no errors
- README updated: full feature list, setup, SAFE MODE rules

### SAFE MODE Rules
- No rewrite of core logic or architecture
- No breaking changes to publish, editor, dashboard, Supabase flows
- Only additive fixes, polish, and professionalization
- All changes documented in final report

### Final Checklist
- [x] Clean repo, no junk files
- [x] Security: no secrets, safe config
- [x] Bug fixes: publish, templates, editor
- [x] Templates: aligned, loadable
- [x] Editor: autosave, preview, publish, section controls
- [x] Lint/safety: no errors
- [x] README: updated
- [x] Ready for sale as SaaS starter

---

## Environment Variables

All required environment variables are listed in `.env.example`. **Never commit your actual `.env` file.**

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NETLIFY_AUTH_TOKEN=
PORT=4000
```

Copy `.env.example` to `.env` and fill in your own values before running the server.

---

## License

MIT
