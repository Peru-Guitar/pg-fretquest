---
name: whatsapp-release
description: Mensaje de WhatsApp para anunciar una versión publicada de Fret Quest a los alumnos. Úsalo cuando el usuario pida "mensaje para WhatsApp", "anuncio de la versión", "qué hay de nuevo para el grupo" o similar. Usa la versión actual de package.json salvo que pida otra.
---

# Anuncio de versión para WhatsApp

Es para los **alumnos**, en el grupo de WhatsApp. Cuenta qué pueden practicar ahora y qué les mejora la experiencia; nada técnico.

## 1. Junta la información

1. Versión: `"version"` en `package.json` (o la que pida el usuario). Debe estar **publicada** (en `origin/main`); si no, avísalo.
2. Novedades: la entrada de esa versión en `src/data/changelog.ts`.
3. Lecciones nuevas: las que tienen la fecha de la versión en `ADDED` (`src/data/questMock.ts`). Agrúpalas por módulo y subcategoría (`category`), y cuenta cuántas hay en cada una. Revisa también `git log` y `git diff` entre la versión anterior y esta para no dejar nada fuera.
4. Lo que está en el código pero **no publicado** no va.

## 2. Qué entra y qué no

- **Sí:** lecciones nuevas (lo principal) y mejoras que el alumno nota al practicar: nueva forma de navegar, orden, una función nueva.
- **No:** arreglos de bugs, sonido o audio, ajustes de diseño o de mobile, cambios internos, rendimiento, seguridad. Aunque estén en las novedades, no suman en el anuncio.
- Si no hay lecciones nuevas ni mejoras visibles, dilo y no armes el mensaje.

## 3. Formato

Formato de WhatsApp, no Markdown: `*negrita*`, `_cursiva_`, listas con `- `. Sin `#` ni enlaces con corchetes. Entrégalo dentro de un bloque de código para copiarlo tal cual.

- Notas en notación americana (C, Eb, Am), nunca Do Re Mi.
- Nunca la duración de las lecciones.
- Frases cortas, en segunda persona, sobre cómo suena o para qué sirve cada grupo de lecciones.
- Un emoji por sección como máximo; 🔹 para cada grupo de lecciones.

## 4. Plantilla

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

👉 fretquest.peruguitar.com
```

Ejemplo real (0.7.0):

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

👉 fretquest.peruguitar.com
```

Después del bloque, di en una línea qué dejaste fuera (arreglos, sonido, mobile…) para que el usuario lo confirme.
