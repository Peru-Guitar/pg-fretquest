# Fret Quest

Gimnasio técnico de guitarra para quienes ya tocan: ejercicios con tablatura, metrónomo y guitarra de guía, un plan según tu nivel, rangos por horas practicadas y comunidad. Interfaz en español.

**Next.js con exportación estática** (GitHub Pages). Cada página pública sale como HTML con su contenido y sus meta, más `sitemap.xml` y `robots.txt`. Login con Google (Firebase Auth) y progreso en Firestore (`firestore.rules`); lo que necesita navegador (Firebase, audio, `localStorage`) se ejecuta en el cliente.

## Arrancar

```bash
npm install
npm run dev        # http://localhost:3000 (en el 4200 con `npm run dev:fretquest` desde la raíz del repo)
npm run build      # genera out/ (sitio estático, una página HTML por ruta)
npm run lint
npm test           # vitest
```

GitHub Actions publica `out/` en GitHub Pages al hacer push a `main`. Las reglas e índices de Firestore se publican aparte: `npx firebase-tools deploy --only firestore:rules,firestore:indexes`.

## Contenido

Los módulos y lecciones viven en `src/data/questMock.ts`; la tablatura y los datos de práctica de cada ejercicio, en `src/data/practiceStudies.ts` y `src/data/tabs/`.

## Estructura

```
src/
  app/                rutas de Next.js: cada page.tsx define sus meta (lib/seo.ts) y muestra su vista
  views/              las pantallas (componentes cliente)
  components/         AppShell, práctica, quest, ui
  data/               módulos, lecciones, tablaturas, artistas, rangos y novedades
  lib/
    router.tsx        Link, NavLink, Navigate, useParams… sobre la navegación de Next
    account.ts        cuenta, nivel, ritmo y plan
    progressDb.ts     registro de práctica en Firestore
    community*.ts     datos y reporte semanal de Comunidad
    domain/           cálculo de los reportes (lógica pura, con pruebas)
    audio/            guitarra (Tone.js, muestras descargadas al primer play), metrónomo y micrófono del afinador
  styles/globals.css  tema Tailwind
public/               manifest, service worker, iconos
tests/                vitest
```
