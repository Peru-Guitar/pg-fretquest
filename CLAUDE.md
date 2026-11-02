# Fret Quest

Guitar technique gym for people who already play. Next.js static export on GitHub Pages, with Firebase Auth and Firestore. See `README.md` for setup and structure.

## Verify

```bash
npm test
npm run lint
npm run build   # includes typecheck
```

Deploy CI runs tests and build, but not lint, so run lint yourself.

## Pushing and versions

- Pushing to `main` publishes the site. Never push unless the current message explicitly asks for it, and follow the workspace push skill (`../.claude/skills/push/SKILL.md`).
- New lessons are always a patch. Every push proposes a version and waits for confirmation.
- Firestore rules and indexes are not deployed by CI: `npx firebase-tools deploy --only firestore:rules,firestore:indexes`.

## Language

UI copy and lesson content are in Spanish. New docs and identifiers are in English. Existing comments are mostly in Spanish, so match the file you are editing.

## Content rules

Use `.claude/skills/new-lesson/SKILL.md` when adding or editing lessons.

- Write notes and keys in American notation (C, Eb, Em), never Do, Re, Mi. Spanish words like "mayor" and "armónica" stay.
- Never show lesson duration in the UI, even though `minutes` exists in the data.
- Lesson titles and slugs are unique across the app, and the slug comes from the title alone (`tests/slugs.test.ts`).
- Scale and pattern lessons default to `intermedio`.
- Subcategories in a module are sorted by difficulty, easiest first (`groupByArtist` in `src/data/artists.ts`), so a lesson's difficulty can move its group.

## Firestore costs

There is no server, and all reads and writes come from the browser. Keep screens on precomputed documents, and don't add per-visit queries over other users' data.

- `communityReports/{monday}`: Community reads this one document. The browser of someone finishing a lesson regenerates it at most once an hour (`src/lib/communityReport.ts`).
- `progressReports/{uid}`: profiles read this one document, plus `users/{uid}`. It is updated after each finished practice and can be rebuilt from `users/{uid}/days` (`src/lib/progressReport.ts`).
- `users/{uid}/days/{date}` is the source of truth for practice time. The weekly ranking is ordered by seconds practiced.
