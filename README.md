# Engineering Portfolio Platform

A dark-first, animated engineering portfolio with a full content-management admin portal.
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Motion · MongoDB (Mongoose) · Cloudinary · Vercel.

Everything visitors see — projects, case studies, engineering domains, articles, timeline, skills,
certifications, homepage copy, navigation, social links and SEO — is edited in `/admin` and stored in MongoDB.
Adding a new domain such as "MLOps" or publishing a case study never requires a code change.

---

## Contents

1. [Quick start (local)](#1-quick-start-local)
2. [Environment variables](#2-environment-variables)
3. [MongoDB Atlas setup](#3-mongodb-atlas-setup)
4. [Admin provisioning](#4-admin-provisioning)
5. [Cloudinary image uploads](#5-cloudinary-image-uploads)
6. [Deploying to Vercel](#6-deploying-to-vercel)
7. [Post-deployment checklist](#7-post-deployment-checklist)
8. [Troubleshooting](#8-troubleshooting)
9. [Architecture](#9-architecture)
10. [Data model](#10-data-model)
11. [Security model](#11-security-model)
12. [Features](#12-features)
13. [Known limitations](#13-known-limitations)

---

## 1. Quick start (local)

Requirements: **Node.js 20.12+** (22 recommended) and a MongoDB database (Atlas free tier, or a local `mongod`).

```bash
npm install
cp .env.example .env.local        # then fill in MONGODB_URI, AUTH_SECRET, ADMIN_EMAIL
npm run db:init                   # indexes + settings + the 8 engineering domains
npm run admin:create              # creates your admin (prints a password if you left it blank)
npm run dev                       # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

Optional, development only — clearly-labelled sample content to see every layout:

```bash
npm run db:seed:dev               # adds "[Sample]" projects + article, marked "Sample content"
npm run db:seed:dev -- --remove   # removes all sample content
```

The seed script refuses to run when `NODE_ENV` or `VERCEL_ENV` is `production`.

### Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm run check` | typecheck + lint + build |
| `npm run db:init` | Create indexes, the settings document and (if none exist) the 8 domains. Safe to re-run. |
| `npm run admin:create` | Provision an admin from `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD` |
| `npm run admin:create -- --reset` | Reset that admin's password and revoke all of their sessions |
| `npm run db:seed:dev` | Dev-only sample content (`-- --remove` to delete it) |

---

## 2. Environment variables

See `.env.example`. **Never** put real values in that file or commit `.env.local` (it is git-ignored).

| Variable | Required | Where | Notes |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | Local + Vercel | Atlas connection string (`mongodb+srv://…`). |
| `MONGODB_DB` | No | Local + Vercel | Database name. Default `portfolio`. |
| `AUTH_SECRET` | Yes | Local + Vercel | ≥ 32 chars. Signs admin sessions. `openssl rand -base64 48`. Rotating it signs everyone out. |
| `NEXT_PUBLIC_SITE_URL` | Yes in prod | Local + Vercel | e.g. `https://your-domain.com`. Canonical URLs, sitemap, Open Graph. Falls back to the Vercel URL. |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Local + Vercel | Without the three Cloudinary vars, uploads are disabled and the admin uses pasted image URLs. |
| `CLOUDINARY_API_KEY` | For uploads | Local + Vercel | |
| `CLOUDINARY_API_SECRET` | For uploads | Local + Vercel | Server-only. Never exposed to the browser. |
| `CLOUDINARY_UPLOAD_FOLDER` | No | Local + Vercel | Default `portfolio`. |
| `IMAGE_REMOTE_HOSTS` | No | Local + Vercel | Extra hosts for `next/image` optimisation, comma-separated. Other hosts still display, unoptimised. |
| `ADMIN_EMAIL` | Provisioning only | Local only | Read by `npm run admin:create`. Not needed on Vercel. |
| `ADMIN_INITIAL_PASSWORD` | Provisioning only | Local only | Leave blank to auto-generate. **Delete it after provisioning.** |
| `DEV_ALLOWED_ORIGINS` | No | Local only | Extra hosts allowed to load the dev server (e.g. testing from a phone on your LAN). |

The only `NEXT_PUBLIC_` variable is the site URL. Every secret is read on the server only (`src/lib/env.ts` is marked `server-only`).

---

## 3. MongoDB Atlas setup

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com) (M0 is fine).
2. **Database Access → Add New Database User.** Use password auth and give it the built-in role **readWrite** on your database only (Specific Privileges → `readWrite@portfolio`), not Atlas admin.
3. **Network Access → Add IP Address.**
   - Local development: add your current IP.
   - Vercel: Vercel functions don't have fixed IPs on standard plans, so add `0.0.0.0/0`. That's normal for serverless; the database user's password and scoped role are what protect it. Use a long generated password. (If you're on a plan with Secure Compute / static IPs, allow-list only those.)
4. **Database → Connect → Drivers** and copy the `mongodb+srv://` string into `MONGODB_URI`, replacing `<password>`. URL-encode special characters in the password.
5. Run `npm run db:init` once from your machine. This builds every index (in production the app does not build indexes on cold start) and creates the eight domains from the brief.

---

## 4. Admin provisioning

There is no public registration page and no default password.

```bash
# .env.local
ADMIN_EMAIL="you@example.com"
ADMIN_INITIAL_PASSWORD=""          # blank → a strong password is generated and printed once

npm run admin:create
```

- Store the printed password in a password manager, then remove `ADMIN_INITIAL_PASSWORD` from the file.
- Sign in at `/admin/login`. Change the password anytime under **Admin → Account**.
- **Lost password:** `npm run admin:create -- --reset` (sets a new one and revokes all sessions).
- **Lost device:** Admin → Account → *Sign out of all sessions*.
- Run these scripts from your machine with `MONGODB_URI` pointing at the production database; they never run on Vercel.

---

## 5. Cloudinary image uploads

Uploads go **directly from the browser to Cloudinary** using a short-lived signature issued by an admin-only Server Action. Files never touch the Vercel filesystem (which doesn't persist). Only the URL, alt text, caption and dimensions are stored in MongoDB.

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Dashboard → copy **Cloud name**, **API Key**, **API Secret** into the three `CLOUDINARY_*` variables.
3. Restart the dev server / redeploy. The **Upload** buttons in the admin now work; allowed formats are JPG, PNG, WebP, GIF and AVIF up to 10 MB.

Without Cloudinary you can still paste any `https://` image URL. Clicking Upload explains what to configure instead of failing silently. Images from `res.cloudinary.com` (and any `IMAGE_REMOTE_HOSTS`) are served through `next/image` with AVIF/WebP and responsive sizes.

---

## 6. Deploying to Vercel

1. Push this repository to GitHub (`.env.local` is git-ignored).
2. In Vercel: **Add New → Project →** import the repo. Framework preset: Next.js (auto-detected). No build settings to change.
3. **Settings → Environment Variables** (Production, and Preview if you use it):
   `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, and the `CLOUDINARY_*` variables if using uploads.
   Do **not** add `ADMIN_INITIAL_PASSWORD`.
4. Deploy. The build doesn't need database access (every data-driven page renders on demand), so a missing or unreachable database can't break the build.
5. Add your domain under **Settings → Domains**, then set `NEXT_PUBLIC_SITE_URL` to it and redeploy.
6. From your machine (pointing at the production database): `npm run db:init` then `npm run admin:create`.

Use a separate database (`MONGODB_DB=portfolio_preview`) for Preview deployments if you don't want previews editing production content.

---

## 7. Post-deployment checklist

- [ ] `/` loads and shows your domains; `/admin` redirects to `/admin/login`.
- [ ] Sign in, then **Site settings**: set your name, role, headline, status line, GitHub/LinkedIn. Save and confirm the homepage updates.
- [ ] Create a draft project: it 404s at `/projects/<slug>`; **Preview** shows it; **Publish** makes it public.
- [ ] Create a test domain: it appears on the homepage, in the footer and in `/projects` filters. Delete it.
- [ ] Upload an image (if Cloudinary is configured).
- [ ] Send yourself a message from `/contact`; it appears in **Admin → Messages**.
- [ ] `/sitemap.xml` and `/robots.txt` use your real domain.
- [ ] If you ran the dev seed against this database, run `npm run db:seed:dev -- --remove` locally.

---

## 8. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Page says it couldn't reach its database | `MONGODB_URI` missing/wrong, or Atlas **Network Access** doesn't allow Vercel (`0.0.0.0/0`). Check Vercel → Logs. |
| `querySrv ENOTFOUND` | Typo in the cluster host, or a DNS issue; copy the string again from Atlas. |
| `bad auth : authentication failed` | Wrong DB user/password, or special characters in the password not URL-encoded. |
| `AUTH_SECRET must be at least 32 characters` | Generate one: `openssl rand -base64 48`. |
| Login succeeds but you bounce back to the login page | `AUTH_SECRET` differs between environments, or the site is served over plain HTTP in production (the cookie is `Secure`). Use HTTPS. |
| "Too many sign-in attempts" | 5 failures per email (or 20 per IP) in 15 minutes. Wait, or delete documents from the `ratelimits` collection. |
| Upload button says uploads aren't configured | Set all three `CLOUDINARY_*` vars and redeploy. |
| "Cloudinary rejected the upload: Invalid Signature" | `CLOUDINARY_API_SECRET` doesn't match the API key. |
| An image from some site doesn't look optimised | Expected for hosts not in `IMAGE_REMOTE_HOSTS`; add the host and redeploy. |
| Slow first request after idle | Serverless cold start + new DB connection. The connection is cached per instance afterwards. |
| New indexes missing in production | Run `npm run db:init` against the production database (indexes aren't auto-built in prod). |

---

## 9. Architecture

```
src/
  proxy.ts                     Optimistic gate for /admin/* and /preview/* (Next 16 "proxy" = middleware)
  app/
    (site)/                    Public site: nav + footer layout
      page.tsx                 Homepage
      projects/ [slug]/        Explorer + case study pages
      categories/[slug]/       Engineering domain pages
      blog/ [slug]/ category/[slug]/
      about/ contact/ search/
      preview/projects|blog/[id]   Admin-only draft previews (noindex)
    admin/
      (auth)/login/            Sign-in
      (panel)/                 Every protected admin screen (layout re-checks the session)
    sitemap.ts robots.ts rss.xml/route.ts not-found.tsx error.tsx
  components/
    site/                      Public UI (hero topology, domain list, cards, explorer, timeline…)
    case-study/                Case-study renderer + sticky scroll-spy nav
    content/                   Safe Markdown, code blocks, gallery/lightbox
    admin/                     Editors, managers, tables, form widgets
    motion/                    Reveal, Stagger, Magnetic, PointerGlow, Counter
    media/ ui/                 SmartImage, generated cover art, buttons, fields, dialog
  lib/
    db.ts env.ts               Cached connection; server-only env access
    models/                    Mongoose schemas + indexes
    validation/schemas.ts      Zod schemas shared by forms and Server Actions
    actions/                   Server Actions (each one calls requireAdmin first)
    queries/public.ts admin.ts Server-side reads (admin reads re-check the session)
    auth/                      JWT session (jose) + guards
    rate-limit.ts              MongoDB-backed fixed-window limiter
    content/                   Section definitions, icons, defaults, DTO types
scripts/                       db:init, admin:create, db:seed:dev
```

**Rendering.** Data pages are server-rendered on demand (`dynamic = "force-dynamic"`), so edits appear instantly and builds don't need the database. Server Components are the default; client components are limited to interactive pieces (nav, topology, explorer filters, gallery, forms, editors).

**Motion system.** Each component family has its own treatment instead of one fade on everything: a CSS-only headline rise with an optical-size sweep (the page's single orchestrated moment), SMIL packets along the topology edges with pointer parallax, a scan sweep on domain rows, clip-path reveals on featured work, a scroll-linked spine on the timeline, a reading-progress bar on case studies, a magnetic primary CTA, pointer-tracked glow on tiles and `layoutId` indicators for navigation, tabs and view toggles. All of it respects `prefers-reduced-motion` (packets and transforms removed), parallax and magnetism only run on fine pointers, and a `<noscript>` rule keeps every revealed element visible without JavaScript. Three.js was deliberately not used: the SVG topology is lighter, accessible (nodes are real buttons) and needs no separate fallback.

---

## 10. Data model

| Collection | Purpose | Key indexes |
| --- | --- | --- |
| `adminusers` | Email, bcrypt hash (cost 12), role, `sessionVersion` | `email` unique |
| `categories` | Engineering domains: name, slug, tagline, description (Markdown), icon key, colour, cover, order, `showOnHome` | `slug` unique, `order` |
| `projects` | See below | `slug` unique; `status+featured+order+publishedAt`; `category+status`; `technologies.name`; `tags`; text index |
| `blogcategories` | Name, slug, description, colour, order | `slug` unique |
| `blogposts` | Title, slug, excerpt, Markdown, categories[], tags, reading time, related projects, status, `publishedAt` (future = scheduled), SEO | `slug` unique; `status+publishedAt`; `categories+status+publishedAt`; text index |
| `skills` / `certifications` / `timelineevents` | Profile content | `group+order` / — / `date` |
| `sitesettings` | Singleton (`key: "site"`): profile, hero, impact items, socials, contact, nav, homepage toggles, SEO | `key` unique |
| `media` | Metadata of Cloudinary uploads (URL, public id, size, format) | — |
| `contactmessages` | Contact form inbox | `createdAt` |
| `ratelimits` | Login/contact counters | `key` unique, TTL on `expiresAt` |

**Projects and flexible case studies.** A project keeps structured fields (`technologies[{name, role}]`, `implementationSteps[]`, `codeSnippets[]`, `gallery[]`, `architectureImages[]`, links, related projects) plus an ordered `sections[]` array of `{type, title, enabled, content}`. The 18 section types from the brief (overview, problem, goals, architecture, stack, implementation, code, screenshots, diagrams, challenges, solutions, security, observability, lessons, outcomes, future, links, related) can each be renamed, toggled and reordered. Narrative sections hold Markdown; structured ones render from the fields above (with optional intro text). Enabled sections with no content are skipped automatically, so a short project shows only what it has. This keeps one document per project and no join tables, while still allowing per-project section order.

---

## 11. Security model

- **Two-layer auth.** `proxy.ts` rejects requests to `/admin/*` and `/preview/*` without a validly signed session. Then every admin page, every admin read in `lib/queries/admin.ts`, and **every** Server Action calls `requireAdmin()`, which re-verifies the JWT, loads the user from MongoDB and checks `sessionVersion`. A stolen token is revoked by changing the password or "sign out of all sessions".
- **Sessions.** HS256 JWT (jose) in an `httpOnly`, `SameSite=Lax`, `Secure` (in production) cookie, 8-hour lifetime. Server Actions additionally get Next.js's built-in Origin check (CSRF).
- **Passwords.** bcrypt cost 12; constant-time comparison against a dummy hash for unknown emails, so timing doesn't reveal valid accounts.
- **Rate limiting.** 5 failed logins per email and 20 per IP per 15 minutes; 5 contact messages per IP per hour. Stored in MongoDB so limits hold across serverless instances.
- **Validation.** Zod schemas validate in the browser and again on the server for every mutation; slugs, colours, URLs, enums and lengths are constrained; ObjectId references are checked before use.
- **No admin-supplied code runs on the site.** Markdown is rendered without raw HTML, unsafe URL protocols (`javascript:`) are stripped, code blocks are escaped, and JSON-LD is serialised with `<` escaped.
- **Contact form spam protection.** Honeypot field, minimum fill time, rate limit; messages stored, never emailed from user input.
- **Headers.** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`; `X-Robots-Tag: noindex` on admin; robots.txt disallows admin/preview.
- **Privacy.** The contact email is never shown unless you enable "Show email publicly".

---

## 12. Features

**Public site:** hero with interactive cluster topology and honest, editable status line · dynamic engineering-domains list with live project counts · editorial featured work · problem areas with optional, owner-entered metrics only · scroll-linked timeline · latest articles · contact form · footer with domains · `/projects` with search, category and technology filters, sorting, grid/editorial views and pagination (all server-side, URL-driven, no-JS friendly) · case studies with 18 configurable sections, sticky scroll-spy nav, reading progress, syntax-highlighted code with copy, galleries with keyboard lightbox · domain pages · blog with categories, tags, reading time, scheduling, related projects · About with bio, skills, certifications (verify links), timeline · site search · light/dark theme · RSS · sitemap · robots · canonical URLs, Open Graph/Twitter metadata and JSON-LD (Person, CreativeWork, BlogPosting) · real 404s · generated cover art when a project has no image.

**Admin:** dashboard with live counts, projects-per-domain chart and recent edits · project editor (tabs, auto slug, technologies with roles, related projects, drag-and-drop or arrow-key section ordering, Markdown editor with toolbar/preview/image upload, repeatable reorderable steps, code snippets, cover/screenshots/diagrams with alt text and captions, SEO, featured, order, unsaved-changes warning) · publish/unpublish/feature/duplicate/delete/preview from the list · searchable, filterable, paginated tables · domain manager (icons, colours, covers, order, homepage visibility, safe delete with reassignment) · blog editor with scheduling and blog categories · timeline, skills, certifications · site settings (profile, hero, homepage sections, impact items, about, socials, contact, navigation, SEO) · contact inbox · account (password change, sign out everywhere) · responsive sidebar with mobile drawer · toasts, confirmations, loading and empty states.

### Verified in this build

Run against a real MongoDB 8 instance with a scripted browser, all passing:

- `npm run typecheck`, `npm run lint` (0 errors), `npm run build` — including a build with **no environment variables at all**.
- 52 end-to-end checks: auth gate and forged cookies; wrong-password message; httpOnly/SameSite cookie; creating a domain and seeing it on the homepage, footer and its own page; full project create → draft (private, 404) → preview → publish (public) → unpublish → duplicate → delete; step reordering persisted; image metadata stored; Markdown rendering with `<script>` and `javascript:` links neutralised; syntax highlighting; JSON-LD; category, technology and text filters; sitemap; images loading; lightbox open/Escape; safe category deletion with reassignment; blog draft/publish/schedule; reading time; RSS; settings driving the public site; private email hidden; invalid URL rejected; contact validation and inbox; Server Action replay without a cookie and with a **validly-signed but revoked** session both refused while the database stays unchanged; login rate limit after 5 failures; sign-out.
- Production server: real 404 status codes, security headers, `Secure` cookie, no page errors.
- Mobile (390 px): no horizontal overflow on any public page; admin usable. Reduced motion: no animated packets, no hydration mismatches. JavaScript disabled: all content visible. Keyboard: skip link first, visible focus. Light theme primary button contrast 5.0:1.
- Empty database: every public page renders with honest empty states.
- Cloudinary signing matches Cloudinary's documented example signature.

---

## 13. Known limitations

- **Cloudinary uploads were not exercised against a live account** here (no credentials). The signature algorithm is verified; do one test upload after configuring.
- **Contact messages are stored, not emailed.** Read them in Admin → Messages. Adding email notifications (e.g. Resend) is a small change in `lib/actions/public.ts`.
- **Single owner by default.** The `editor` role exists in the schema and session, but there's no in-app user management; add admins with `npm run admin:create`.
- **Scheduled articles** go live by date filtering at request time; there's no publish notification.
- **Search** uses case-insensitive matching on titles, summaries, tags and technologies, which is right for portfolio-sized data. For thousands of documents, switch to Atlas Search.
- **Lighthouse** wasn't run in this environment; the build is designed for good Core Web Vitals (self-hosted variable font, no Three.js, server rendering, `next/image`, CSS/SMIL animations), but measure on your deployed domain.
- `next-themes` logs a harmless React warning about its inline theme script in development.
