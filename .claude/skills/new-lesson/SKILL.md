---
name: new-lesson
description: Creates or edits a Fret Quest lesson (reading or tab practice) from the user's ideas. Use when the user asks for "nueva lección", "nuevo ejercicio", "agrega una práctica", "nueva lectura", "agrega escalas/modos/patrones", or shares a pattern, lick or Guitar Pro file (MusicXML) to practice.
---

# New lesson in Fret Quest

The idea and the pattern come from the user. You bring them to the app's format, write the texts and propose variants (marked as proposals).

## Where things live

| File | What goes there |
|---|---|
| `src/data/questMock.ts` | Each lesson's card inside its module (`moduleFixtures`), and its date in `ADDED`. |
| `src/data/practiceStudies.ts` | Each practice's content: texts and tab (`practiceStudies[id]`). |

- Only modules in the `available` list (at the end of `questMock.ts`) are visible. If the module isn't there, say so.
- If the module isn't obvious, ask.
- For series (modes, positions, string pairs), use a data list plus a function that generates the study, like `SCALE_MODES`, `OCTAVE_MODES` or `TWO_STRING_PATTERNS`. Don't copy the same object by hand.

## Card in `questMock.ts`

```ts
{ id: 'modulo-tema-01', title: 'G menor por octavas', category: 'Modos por octavas', type: 'practice',
  difficulty: 'intermedio', minutes: 5, xp: 50, description: '', goal: '', tempo: { min: 40, max: 160 }, rounds: 1 }
```

- **Title unique across the app.** The URL slug comes from the title (checked by `tests/slugs.test.ts`).
- **`difficulty`:** scales and patterns use `intermedio` unless the user asks otherwise.
- **`category`:** groups lessons inside the module. With more than 12 lessons and 2 or more groups, the module page shows them in tabs.
- **Date:** add the id to `ADDED` with today's date, so it appears in «Últimas lecciones agregadas».
- `minutes` is stored but never shown.

## Study in `practiceStudies.ts`

```ts
{
    description: 'What the exercise conveys (see "Texts").',
    notation: 'G menor (G A Bb C D Eb F) · Semicorcheas · Púa alternada continua',
    goal: 'What the player should achieve.',
    steps: ['How it is played through.', 'Fingering and picking.', 'Key detail.'],
    mistakes: ['Typical mistake.', 'Another typical mistake.'],
    criterion: 'When to raise the BPM.',
    figure: 'semicorcheas',   // negras | corcheas | tresillos | semicorcheas | sextillos
    speed: 2,                 // 1–5, suggested speed
    ...withSections([{ title: 'Subida', pattern }, { title: 'Bajada', pattern }]),
}
```

- **Tab:** a list of `{ string, fret }`; string 1 = high e, 6 = low E. Each section starts on a new row.
- **`picking`:** `alternate` by default; `legato` for arpeggios/sweep; `tapping` with `tap: true` on right-hand notes.
- **User's pattern (tab or MusicXML):** transcribe it as is and show it as text to confirm. If something looks like a mistake, ask; don't correct it.
- **Generated patterns:** print the frets and check that none go past about fret 18. If one does, propose another root or string.
- If the user wants to hear it first, generate a `.musicxml` (string/fret in `<technical>`) and leave it on the Desktop.

## Texts

Lesson texts are written in Spanish.

- **`description`: describe the sound, not the technique.** What color or feeling it has, what it sounds like, who uses it, what it's for. Frets, formulas and notes go in `notation` and `steps`. Model:
  > Un patrón para ganar velocidad: dos cuerdas, tres notas en cada una y la misma forma siempre. Cada compás sube una nota y la escala menor se abre en horizontal.
- **200 characters at most** (checked by the test).
- **Each description is unique**, even when the lesson is a variant of another: say what makes it different (another string, another neck area, another color). Checked by the test.
- Spanish, informal "tú", short sentences. Notes in American notation (C D E…, Bb), never Do Re Mi.
- No empty motivation, points, levels or records.

## When finished

- `npx tsc --noEmit`, `npx eslint src` and `npx vitest run tests/slugs.test.ts`.
- Give the route to try it: `/ejercicios/<module-slug>/<title-slug>` (module slugs are in `src/lib/routes.ts`).
- Don't commit unless asked. **Never push**: only with the `push` skill and an explicit request.
