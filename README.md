# Fret Quest — prototipo visual

La aplicación activa implementa las diez pantallas con identidad Steam + RPG, interfaz en español y datos mock. Usa `npm run dev` para explorarla. No ejecuta audio, autenticación, evaluación, backend ni persistencia; solo navegación y estados visuales temporales.

Documentación de entrega para la integración posterior: `docs/visual-handoff.md`. El diseño vigente se resume en `redesign.md`. Los módulos anteriores se conservan desconectados.

Validación: `npm run build`, `npm run lint` y `npm test` (27 pruebas existentes).

---

## Documentación de la versión anterior

El contenido siguiente describe los módulos conservados y puede mencionar funcionalidades que no están conectadas al prototipo visual actual.

# FretQuest

Ruta de guitarra eléctrica **de principiante a avanzado**: 8 niveles y 72 lecciones en el orden en que se aprende la técnica. Cada lección tiene ejercicios con tablatura reproducible (play, tempo, dirección de púa) y un temporizador de práctica. Todo está abierto: se puede practicar cualquier lección en cualquier orden.

> **Next.js con exportación estática** (GitHub Pages). Cada página pública (inicio, ejercicios, módulos, lecciones, guía, herramientas) sale como HTML con su contenido, su `description` y su `og:image` (o la imagen por defecto), más `sitemap.xml` y `robots.txt`. Login con Google (Firebase Auth) y progreso en Firestore (`firestore.rules`); lo que necesita navegador (Firebase, audio, `localStorage`) se ejecuta en el cliente.

- **Mi ruta** (`/`): «Tu próxima práctica» (o «Reanudar sesión») y la ruta como lista vertical por niveles desplegables.
- **Mi progreso** (`/report`): minutos, racha, progreso por nivel, calendario e historial.
- **Ejercicio**: preparación (tablatura + panel Libre/Progreso), sesión centrada en la tablatura y resultado breve con detalles a demanda.

La entrada de audio, el afinador y la evaluación de notas son **simulados** (`src/lib/audio/fakeInput.ts`, `simulateStep` en `src/lib/domain/evaluation.ts`) y la interfaz lo indica. El plan de diseño está en `redesign.md`.

Cada ejercicio tiene dos modos: **Practicar** (libre, sin registro) e **Iniciar progreso** (sesión oficial con BPM y duración fijos, metrónomo; registra el resultado y suma XP). Un ejercicio cuenta como hecho con una sesión de progreso completada; una lección, cuando están hechos todos sus ejercicios. El nivel actual es el primero con lecciones pendientes.

## Arrancar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # genera out/ (sitio estático, una página HTML por ruta)
npm test           # vitest
```

GitHub Actions publica `out/` en GitHub Pages al hacer push a `main`. Las reglas e índices de Firestore se publican aparte: `npx firebase-tools deploy --only firestore:rules,firestore:indexes`.

## Contenido

La ruta vive en `src/lib/domain/catalog.ts` (`LEVELS`: nivel → lección → ejercicio). Por ahora cada lección tiene dos ejercicios **provisionales** con el mismo lick de pentatónica; se irán reemplazando por los ejercicios reales de cada tema. Los ejercicios de la versión anterior (organizados por técnica) están en `docs/borrador-ejercicios.ts` para reutilizarlos.

Tablatura: seis líneas (`e B G D A E`) en texto. Los dígitos son notas; letras como `h`, `p`, `t` son marcas de técnica que se dibujan pero no suenan. Cada ejercicio puede definir `picking` (dirección de púa) y `notesPerBeat`.

## Estructura

```
src/
  app/                rutas de Next.js: cada page.tsx define sus meta (lib/seo.ts) y muestra su vista
  views/              las pantallas (componentes cliente)
  lib/router.tsx      Link, NavLink, Navigate, useParams… sobre la navegación de Next
  components/         AppShell, TabPlayer, ui
  lib/
    domain/           catálogo, progreso, reporte y parser de tablatura (lógica pura, con pruebas)
    progress.ts       registro de práctica y perfil en localStorage
    audio/            guitarra (Tone.js, muestras descargadas al primer play) y metrónomo (Web Audio)
  styles/globals.css  tema Tailwind
public/               manifest, service worker, iconos
tests/                vitest
```
