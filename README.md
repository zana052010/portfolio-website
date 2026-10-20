# zana052010 — Portfolio

An editorial engineering portfolio for a cross-platform .NET / Avalonia UI and frontend developer. Built as a static site with Vite, Tailwind CSS, and vanilla JavaScript. No UI framework runtime is shipped.

## Highlights

- Dark obsidian and warm alabaster themes with persisted preference
- Bilingual interface (English / Russian) with persisted preference
- Sticky navigation with scroll-aware section state and a mobile drawer
- Interactive target inspector for desktop, mobile, and web surfaces
- Flagship music-player case study with a live Canvas spectrum, interactive five-band EQ, synced lyrics preview, and desktop/mobile layout switch
- Filterable project showcase with accessible technical specification dialogs
- Interactive architecture layer map and five-platform capability matrix
- Filterable technology matrix with focusable details
- Live public GitHub profile, repository cards, and activity graph with a bundled offline snapshot
- Raycast-style command palette (`Ctrl+K` / `Cmd+K`) with project search, theme and language actions, and clipboard feedback
- Cursor spotlight illumination, scroll reveals, and reduced-motion support
- Relative-path production build configured for GitHub Pages

## Stack

- Vite
- Tailwind CSS
- Vanilla JavaScript ES modules
- Lucide icons
- Self-hosted Geist and Geist Mono via Fontsource
- Official technology marks via Devicon and Simple Icons CDNs, with local fallbacks

## Local development

```bash
npm install
npm run dev
```

Open the URL printed by Vite. To check the production build:

```bash
npm run build
npm run preview
```

## Content and localization

- `src/data/portfolio-data.json` — profile, targets, projects, technical specifications, technologies, and architecture data
- `src/i18n/translations.json` — complete English and Russian interface copy
- `src/data/github-fallback.json` — bundled public GitHub snapshot used when the live read is unavailable

Both language dictionaries must keep the same shape. Project fields use `{ "en": "...", "ru": "..." }` values; UI copy is addressed by dotted keys such as `hero.status`.

## GitHub Pages deployment

The included workflow at `.github/workflows/deploy.yml` runs `npm install` and `npm run build`, uploads `dist`, and deploys it to GitHub Pages on every push to `main`.

1. Push the repository to GitHub.
2. Open **Settings → Pages** and set the source to **GitHub Actions**.
3. Push to `main` or run the workflow manually.

`vite.config.js` uses `base: './'`, so the site works from a project subpath as well as a user or custom-domain root.

## Accessibility and motion

- Keyboard support for tabs, the layer map, the command palette, filters, and the EQ controls
- Native modal dialog behavior with focus return and scroll locking
- Visible focus rings and skip link
- Decorative graphics marked `aria-hidden`
- `prefers-reduced-motion` disables animated reveals and the demo starts paused
- All interactive targets use touch-friendly sizing on small screens

## Structure

```text
.github/workflows/deploy.yml
public/favicon.svg
src/
  data/
    github-fallback.json
    portfolio-data.json
  i18n/translations.json
  lib/                 shared i18n, theme, icons, motion, and DOM helpers
  modules/             navigation, hero, projects, demo, architecture,
                       stack, GitHub activity, palette, footer
  main.js
  style.css
index.html
tailwind.config.js
vite.config.js
```
