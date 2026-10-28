---
name: new-lesson
description: Crea o edita una lección de FretQuest (lectura o práctica con tablatura) a partir de las ideas del usuario. Úsalo cuando pida "nueva lección", "nuevo ejercicio", "agrega una práctica", "nueva lectura", "agrega escalas/modos/patrones" o comparta un patrón, lick o archivo de Guitar Pro (MusicXML) para practicar.
---

# Lección nueva en FretQuest

La idea y el patrón son del usuario; tú los pasas al formato de la app, redactas los textos y propones variantes (marcadas como propuesta).

## Dónde vive cada cosa

| Archivo | Qué va ahí |
|---|---|
| `src/data/questMock.ts` | Ficha de cada lección dentro de su módulo (`moduleFixtures`), y la fecha en `ADDED`. |
| `src/data/practiceStudies.ts` | El contenido de cada práctica: textos y tablatura (`practiceStudies[id]`). |

- Solo se ven los módulos de la lista `available` (al final de `questMock.ts`). Si el módulo no está, avisa.
- Si no es obvio en qué módulo va, pregunta.
- Para series (modos, posiciones, parejas de cuerdas), usa una lista de datos + una función que genere el estudio, como `SCALE_MODES`, `OCTAVE_MODES` o `TWO_STRING_PATTERNS`. No copies el mismo objeto a mano.

## Ficha en `questMock.ts`

```ts
{ id: 'modulo-tema-01', title: 'G menor por octavas', category: 'Modos por octavas', type: 'practice',
  difficulty: 'intermedio', minutes: 5, xp: 50, description: '', goal: '', tempo: { min: 40, max: 160 }, rounds: 1 }
```

- **Título único en toda la app.** El slug de la URL sale del título (`tests/slugs.test.ts` lo comprueba).
- **`difficulty`:** escalas y patrones van en `intermedio` salvo que el usuario pida otra.
- **`category`:** agrupa las lecciones dentro del módulo. Con más de 12 lecciones y 2 grupos o más, la página del módulo las muestra en pestañas.
- **Fecha:** agrega el id a `ADDED` con la fecha de hoy, para que salga en «Últimas lecciones agregadas».
- `minutes` se guarda pero nunca se muestra.

## Estudio en `practiceStudies.ts`

```ts
{
    description: 'Lo que transmite el ejercicio (ver «Textos»).',
    notation: 'G menor (G A Bb C D Eb F) · Semicorcheas · Púa alternada continua',
    goal: 'Qué debe lograr quien practica.',
    steps: ['Cómo se recorre.', 'Digitación y púa.', 'Detalle clave.'],
    mistakes: ['Error típico.', 'Otro error típico.'],
    criterion: 'Cuándo subir el BPM.',
    figure: 'semicorcheas',   // negras | corcheas | tresillos | semicorcheas | sextillos
    speed: 2,                 // 1–5, velocidad sugerida
    ...withSections([{ title: 'Subida', pattern }, { title: 'Bajada', pattern }]),
}
```

- **Tablatura:** lista de `{ string, fret }`; cuerda 1 = e aguda, 6 = E grave. Cada sección empieza en una fila nueva.
- **`picking`:** `alternate` por defecto; `legato` para arpegios/sweep; `tapping` con `tap: true` en las notas de la mano derecha.
- **Patrón del usuario (tab o MusicXML):** transcríbelo tal cual y muéstraselo en texto para confirmar. Si algo parece un error, pregunta; no lo corrijas.
- **Patrones generados:** imprime los trastes y revisa que ninguno pase del ~traste 18. Si se pasa, propón otra tónica o cuerda.
- Si el usuario quiere escucharlo antes, genera un `.musicxml` (cuerda/traste en `<technical>`) y déjalo en el Escritorio.

## Textos

- **`description`: describe el sonido, no la técnica.** Qué color o sensación tiene, a qué suena, quién lo usa, para qué sirve. Trastes, fórmulas y notas van en `notation` y `steps`. Modelo:
  > Un patrón para ganar velocidad: dos cuerdas, tres notas en cada una y la misma forma siempre. Cada compás sube una nota y la escala menor se abre en horizontal.
- **Máximo 200 caracteres** (el test lo comprueba).
- **Cada descripción es única**, aunque la lección sea una variante de otra: di qué la hace distinta (otra cuerda, otra zona del mástil, otro color). El test lo comprueba.
- Español, tuteo, frases cortas. Notas en sistema americano (C D E…, Bb), nunca Do Re Mi.
- Sin motivación vacía ni puntos, niveles o récords.

## Al terminar

- `npx tsc --noEmit`, `npx eslint src` y `npx vitest run tests/slugs.test.ts`.
- Da la ruta para probarla: `/ejercicios/<slug-del-módulo>/<slug-del-título>` (slugs de módulo en `src/lib/routes.ts`).
- No hagas commit si no te lo piden. **Nunca hagas push**: solo con la skill `push` y un pedido explícito.
