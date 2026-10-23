# Fret Quest — Visual handoff

The active application is a Spanish visual prototype. All new component names, filenames and variables are English. Existing domain, audio, persistence and session modules remain available for later integration but are not imported by the active screens. No dependencies were added.

## Routes

| Route | Screen |
| --- | --- |
| `/` | Home |
| `/learn` | Learn and local catalog filters |
| `/lessons/:lessonId` | Lesson Detail |
| `/practice`, `/practice/:exerciseId` | Practice |
| `/results` | Results |
| `/progress` | Progress |
| `/compete` | Compete |
| `/profile` | Profile |
| `/tools` | Tuner and metronome |
| `/settings` | Settings |
| `/report` | Legacy redirect to Progress |

## Integration boundaries

- Mock catalog and player: `src/data/questMock.ts`. Some screen-specific display fixtures are inline.
- Shared presentation components: `src/components/quest/QuestUI.tsx`.
- Shared navigation: `src/components/AppShell.tsx`.
- Routing: `src/main.tsx`.
- Design tokens and responsive rules: final Fret Quest section in `src/styles/globals.css`. Earlier Tailwind theme remains to support retained legacy components.
- Local React state only controls demonstrative selections, tabs, filters, play/pause appearance, BPM, bookmarking and temporary form feedback.
- Play does not schedule notes or produce audio. Results never evaluate or record a session. XP, activity, ranks, progress and player data are static examples. Profile edits do not update player identity. Settings do not persist or change global appearance/accessibility preferences.
- The former service worker is not registered by this version. Existing previously installed workers are not forcibly removed.
- No microphone, backend, authentication, storage, external fonts or remote assets are used by the active screens. All fonts are bundled and guitar art uses existing Lucide icons plus CSS.

## Visual system

Charcoal backgrounds, electric blue-to-violet primary actions, violet/amber/blue route artwork, compact game-library cards, seasonal quests and collectible badges. Desktop sidebar becomes a drawer with a five-destination bottom navigation on mobile. Secondary destinations remain in the mobile drawer. Tablature has its own horizontal scroll area. Reduced-motion OS preference is respected.

## Validation

Production compilation, ESLint and the existing six test suites (27 tests) pass. Existing tests cover retained domain modules; they do not validate these mock screens.

Browser review: all ten routes rendered successfully; Home and Practice were visually inspected on desktop. Home at 390 px and Practice at 320 px were reviewed using isolated iframe viewports, and the practice grid was corrected to contain tablature overflow. Full device/keyboard accessibility testing remains outside this verification.

Identidad actualizada según la referencia visual del usuario: azul noche, azul eléctrico y violeta; logotipo vectorial de guitarra blanca sobre púa azul-violeta, y nombre Fret Quest con degradado.

## Current scope: technique gym

This replaces the beginner-course concept. The audience already has basic guitar-playing experience. There are 10 technique modules with 60 mechanical exercise fixtures, including one technical control per module. There are no introductory instrument lessons, chord-learning sequence or repertoire course.

Primary catalog: `/exercises`. Module detail: `/modules/:lessonId`. Legacy `/learn` redirects to the catalog; `/lessons/:lessonId` remains a compatibility route. Existing component filenames are retained to minimize structural churn.

Data: `TechniqueModule`, `TechniqueExercise`, `exerciseItems`, `completedExercises` and three routine fixtures in `src/data/questMock.ts`. Local lookup supports `?exercise=...` and legacy `?lesson=...` in the practice route. `?routine=warmup` and `?routine=maintenance` display sample routine plans. No timers, scheduling, audio, evaluation, progression engine or persistence are implemented.

Home offers warmup, maintenance and targeted technique. The catalog covers synchronization, finger independence, alternate picking, string crossing/skipping, legato, position shifts, rhythm, muting/articulation, bends/vibrato and controlled speed. Complexity and control take precedence over speed.

The practice view shows exercise-specific title, goal and placeholder variants. Its tablature is a generic chromatic visual sample and explicitly does not represent the selected exercise; exact notation, fingering and drill-specific variants remain for future content work. Routine durations, XP and progress are sample display values.
