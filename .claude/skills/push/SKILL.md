---
name: push
description: Reglas para hacer push en Fret Quest. Úsalo cuando el usuario pida "push", "sube los cambios", o "sube a main", y también antes de cualquier git push. Nunca hagas push si el usuario no lo pidió explícitamente; al pedirlo, propone si la versión es patch, minor o major y actualiza package.json.
---

# Push en Fret Quest

Hacer push a `main` publica el sitio en GitHub Pages (fretquest.peruguitar.com). Por eso:

## 1. Nunca hagas push sin que te lo pidan

- **No ejecutes `git push`** a menos que el usuario lo pida explícitamente en ese mensaje ("haz push", "sube", "publica"…).
- Solo cuenta como pedido un mensaje que diga **push** o **sube a main** de forma explícita. "dale", "listo", "excelente", "hazlo", "adelante" o "publica el artículo" significan implementar, **no** subir. Si hay duda, pregunta.
- Un push pedido en un mensaje anterior no autoriza los cambios que vengan después: cada push necesita su propio pedido.
- Hacer commit no implica push. Terminar una tarea no implica push. Un push aprobado antes no autoriza el siguiente.
- Si crees que convendría subir, dilo en una línea y espera.

## 2. Cuando pida push: primero la versión

Fret Quest **está en beta**: la versión se queda en `0.x.y`. El `1.0.0` es el lanzamiento oficial y solo se usa cuando el usuario diga que salimos de beta. Mientras tanto, lo que sería **major** sube el minor.

Antes de subir, revisa lo que se va a publicar (`git log origin/main..HEAD`, `git diff origin/main --stat` y lo que esté sin commitear) y dile al usuario qué tipo de versión es, con la versión actual de `package.json` y la propuesta:

| Tipo | Cuándo | Ejemplo |
|---|---|---|
| **minor** | Algo nuevo: lección, artista, modo, pantalla o función nueva; o un cambio grande (progreso guardado incompatible, rediseño) | `0.9.2 → 0.10.0` |
| **patch** | Arreglos, ajustes de lecciones (BPM, notas, textos), retoques visuales | `0.9.2 → 0.9.3` |

Formato de la respuesta:

> Cambios: <resumen corto>
> Versión: **patch** — 0.9.2 → 0.9.3 (motivo en una línea)
> ¿Subo con esa versión?

Espera la confirmación (el usuario puede elegir otro tipo).

## 3. Al confirmar

1. Actualiza `"version"` en `package.json` y `package-lock.json` con `npm version <tipo> --no-git-tag-version`. La app muestra esa versión sola (`NEXT_PUBLIC_APP_VERSION`).
2. Agrega la versión a las **Novedades** (`src/data/changelog.ts`), arriba de todo: `version`, `date` (hoy, `AAAA-MM-DD`; la página junta sola las versiones del mismo día) y `notes`.
   - Notas **muy breves**, una por mejora, en palabras del alumno ("Nueva lección de Michael Romeo."), sin detalles técnicos.
   - **Nunca información técnica ni de seguridad**: nada de claves, correos, URLs internas, nombres de archivos o servicios, ni datos de alumnos. Una nota nunca debe revelar qué estaba expuesto o cómo se podía aprovechar un fallo.
   - Los arreglos de seguridad se describen de forma **superficial**, por lo que el alumno ve: "Se corrigió un error con el nombre de usuario.", nunca "Antes se exponían las contraseñas.".
   - Si no hay nada visible para el alumno, una sola nota genérica ("Mejoras y arreglos.").
3. Corre la build (`npm run build`) y los tests (`npx vitest run`). Si fallan, para y avisa.
4. Haz commit (incluye el cambio de versión y las novedades). No agregues archivos sin seguimiento que no sean parte del cambio.
5. `git push` como **último paso, separado**, nunca encadenado con el commit: el usuario puede escribir "espera" a último momento.
