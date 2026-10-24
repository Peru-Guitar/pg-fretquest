---
name: new-lesson
description: Crea o edita una lección de FretQuest (lectura o práctica con tablatura) a partir de las ideas del usuario. Úsalo cuando pida "nueva lección", "nuevo ejercicio", "agrega una práctica", "nueva lectura" o comparta un patrón o lick para practicar.
---

# Lección nueva en FretQuest

El usuario da la idea: un patrón, un lick, una técnica o unos consejos. Tú la completas con el formato de las lecciones existentes. La idea y el patrón son del usuario. Tú redactas, ordenas y propones las variantes.

## 1. Dónde vive cada cosa

- `src/data/questMock.ts` → `moduleFixtures`: módulos y su lista de `lessons`. Cada lección de práctica necesita aquí su ficha básica.
- `src/data/practiceStudies.ts` → `practiceStudies[lessonId]`: el contenido real de una práctica (texto + patrones que suenan).
- Solo se ven los módulos listados en `available` (al final de `questMock.ts`). Si la lección va en un módulo "Próximamente", avisa al usuario.

Pregunta en qué módulo va si no es obvio. Usa el siguiente id libre del módulo (`fingering-07`, `legato-03`…).

## 2. Lección de lectura

En `lessons` del módulo:

```ts
{
  "id": "modulo-NN", "title": "...", "minutes": 3, "xp": 20, "type": "reading",
  "summary": "Una frase que diga de qué trata.",
  "points": [{ "title": "Idea en forma de instrucción", "text": "2–4 frases que expliquen el porqué y el cómo." }],
  "note": "Opcional: criterio final, una frase."
}
```

Usa de 3 a 5 `points`. Toma como modelo `recommendations-01`.

## 3. Lección de práctica

**a) Ficha en `questMock.ts`:**

```ts
{
  "id": "modulo-NN", "title": "...", "minutes": 5, "xp": 50, "type": "practice",
  "difficulty": "base" | "intermedio" | "avanzado",   // de ESTA lección, no del módulo
  "description": "", "goal": "", "variants": [],       // los rellena practiceStudies
  "tempo": { "min": 40, "max": 160 }, "rounds": 1
}
```

`xp`, `rounds` y `record` quedan del sistema de progreso, que está desactivado. Pon los valores por defecto y no agregues `record`.

**b) Estudio en `practiceStudies.ts`** (modelo: `fingering-01` … `fingering-06`):

```ts
'modulo-NN': {
    description: 'Qué se toca, en una o dos frases.',
    goal: 'Qué debe lograr quien practica (medible: limpieza, pulso, digitación).',
    steps: ['Posición y digitación.', 'Cómo se recorre el patrón y con qué púa.', 'Detalle técnico clave.'],
    mistakes: ['Error típico 1.', 'Error típico 2.'],
    criterion: 'Cuándo está listo para subir la velocidad o pasar a otra variante.',
    variants: [variant('Nombre corto', patrón), /* 2–3 en total, de menor a mayor exigencia */],
},
```

- **Patrón:** lista de `{ string, fret }`, donde la cuerda 1 es la e aguda y la 6 la E grave. Una nota por clic, y la tablatura se dibuja en compases de 16 notas, así que conviene que el largo sea múltiplo de 16.
- Usa los helpers del archivo: `line(cuerda, dedos)` (dedo 1 = traste 5) y `across(dedos, cuerdas)`. Si el patrón no está en quinta posición, escribe los `{ string, fret }` directamente o define un helper como `neoclassicalCell`.
- La púa se muestra alternada (⊓ V) siempre. Si el ejercicio usa legato o sweep, dilo en `steps`.
- Si el usuario da el patrón en tablatura, transcríbelo exactamente y muéstraselo de vuelta en texto para que lo confirme. No "corrijas" sus notas. Si algo parece un error, pregunta.
- **Rondas:** la app calcula sola cuántas rondas se pueden elegir (`MAX_ROUNDS` y `ROUNDS_BUDGET_SECONDS` en `src/views/Practice.tsx`). El máximo es el menor entre el tope por `difficulty` (base 10, intermedio 5, avanzado 3, experto 1) y las rondas que caben en 90 s: `notas ÷ notas por pulso (figure) ÷ bpm × 60` es lo que dura una ronda. El selector se ve siempre, y las opciones que pasan del máximo salen desactivadas. Al elegir `difficulty`, `figure`, `bpm` y el largo del patrón, avisa al usuario cuántas rondas quedarán disponibles. Ejemplo: Becker, 260 notas en semicorcheas a 80 BPM, dura ~49 s por ronda, así que solo permite 1.
- Las variantes que propongas tú deben salir del patrón del usuario (otra cuerda, otra digitación, mitad del recorrido). Indícalas como propuesta.

## 4. Estilo del texto

Español, tuteo, frases cortas e instrucciones concretas: dedo, traste, cuerda, dirección de púa. Sin motivación vacía. La velocidad es siempre consecuencia de la limpieza. No menciones puntos, niveles, récords ni planes diarios: la app es solo de práctica libre por ahora.

## 5. Al terminar

- Ejecuta `npx tsc --noEmit` y `npx eslint src`.
- Dile al usuario la ruta para probarla: `/practice/<moduloId>?exercise=<lessonId>` o `/modules/<moduloId>/<lessonId>`.
- No hagas commit ni push si no te lo piden.
