---
name: whatsapp-release
description: WhatsApp message announcing a published Fret Quest version to students. Use when the user asks for "mensaje para WhatsApp", "anuncio de la versión", "qué hay de nuevo para el grupo" or similar. Uses the current package.json version unless another is requested.
---

# WhatsApp version announcement

It's for **students**, in the WhatsApp group, and it's written in Spanish. It says what they can practice now and what improves their experience; nothing technical.

## 1. Gather the information

1. Version: `"version"` in `package.json` (or the one the user asks for). It must be **published** (on `origin/main`); if not, say so.
2. Release notes: that version's entry in `src/data/changelog.ts`.
3. New lessons: those with the version's date in `ADDED` (`src/data/questMock.ts`). Group them by module and subcategory (`category`) and count each one. Also check `git log` and `git diff` between the previous version and this one so nothing is left out.
4. Anything in the code but **not published** doesn't go in.

## 2. What goes in and what doesn't

- **Yes:** new lessons (the main thing) and improvements students notice when practicing: a new way to navigate, ordering, a new feature.
- **No:** bug fixes, sound or audio, design or mobile tweaks, internal changes, performance, security. They don't go in even if they're in the release notes.
- If there are no new lessons or visible improvements, say so and don't write the message.

## 3. Format

WhatsApp format, not Markdown: `*bold*`, `_italics_`, lists with `- `. No `#` or bracket links. Deliver it in a code block so it can be copied as is.

- Links always with `https://` (WhatsApp only makes them clickable that way).
- Notes in American notation (C, Eb, Am), never Do Re Mi.
- Never the duration of lessons.
- Short sentences, in the second person, about how each group of lessons sounds or what it's for.
- One emoji per section at most; 🔹 for each group of lessons.

## 4. Template

```
🎸 *Fret Quest <versión>* — ¡<N> lecciones nuevas de <tema>!

<Una o dos frases con la idea general de la versión.>

*🔹 <Subcategoría>* (<n> lecciones)
<Qué practicas y cómo suena, en una o dos frases.>

*🔹 <Subcategoría>* (<n> lecciones)
<…>
- <Lección o variante, si conviene listarlas>

*✨ Además*
- <Mejora visible para el alumno.>

👉 https://fretquest.peruguitar.com
```

Real example (0.7.0):

```
🎸 *Fret Quest 0.7.0* — ¡20 lecciones nuevas de pentatónica!

La pentatónica deja de ser una caja: ahora la recorres por todo el mástil, con nuevos colores y por saltos.

*🔹 Horizontales* (5 lecciones)
Cruza el mástil de la sexta a la primera cuerda con slides que te llevan de una posición a la siguiente. Cinco posiciones, cada una desde otra nota de Am.

*🔹 Horizontales blues* (5 lecciones)
El mismo recorrido con la _blue note_ (Eb): suena a blues desde la primera nota.

*🔹 Modales* (7 lecciones)
Una pentatónica para cada modo de C menor, con la nota que le da su color: eólica, locria, jónica, dórica, frigia, lidia y mixolidia.

*🔹 Interválicas* (3 lecciones)
La pentatónica por saltos y en zigzag, para que no suene a escalera:
- En cuartas
- En quintas
- En séptimas, con sonido de fusión 🔥

*✨ Además*
- Las subcategorías de cada módulo ahora van de la más fácil a la más difícil.
- Al volver de una lección regresas directo a su pestaña del módulo.

👉 https://fretquest.peruguitar.com
```

After the block, say in one line what you left out (fixes, sound, mobile…) so the user can confirm.
