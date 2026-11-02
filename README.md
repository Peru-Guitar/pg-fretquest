# Fret Quest

Guitar technique gym for people who already play: tab exercises with a metronome and guide guitar, a plan based on your level, ranks based on hours practiced, and a community. The interface is in Spanish.

**Next.js with static export** (GitHub Pages). Each public page is generated as HTML with its content and meta tags, plus `sitemap.xml` and `robots.txt`. Login uses Google (Firebase Auth) and progress lives in Firestore (`firestore.rules`). Anything that needs a browser (Firebase, audio, `localStorage`) runs on the client.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000 (port 4200 with `npm run dev:fretquest` from the workspace root)
npm run build      # generates out/ (static site, one HTML page per route)
npm run lint
npm test           # vitest
```

GitHub Actions publishes `out/` to GitHub Pages on every push to `main`. Firestore rules and indexes are deployed separately: `npx firebase-tools deploy --only firestore:rules,firestore:indexes`.

## Content

Modules and lessons live in `src/data/questMock.ts`. Each exercise's tab and practice data live in `src/data/practiceStudies.ts` and `src/data/tabs/`.

## Structure

```
src/
  app/                Next.js routes: each page.tsx defines its meta tags (lib/seo.ts) and renders its view
  views/              screens (client components)
  components/         AppShell, practice, quest, ui
  data/               modules, lessons, tabs, artists, ranks and release notes
  lib/
    router.tsx        Link, NavLink, Navigate, useParams… on top of Next navigation
    account.ts        account, level, rhythm and plan
    progressDb.ts     practice records in Firestore
    community*.ts     Community data and weekly report
    domain/           report calculations (pure logic, with tests)
    audio/            guitar (Tone.js, samples downloaded on first play), metronome and tuner microphone
  styles/globals.css  Tailwind theme
public/               manifest, service worker, icons
tests/                vitest
```
