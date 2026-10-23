# Fret Quest — Diseño visual vigente

La interfaz activa es un prototipo visual de las diez pantallas: Inicio, Aprender, Detalle de lección, Practicar, Resultados, Mi progreso, Competir, Mi perfil, Herramientas y Ajustes.

La identidad combina biblioteca de juegos tipo Steam con aventura RPG: fondos carbón, acciones en degradado azul eléctrico a violeta, rutas ilustradas, misiones, niveles e insignias. La interfaz está en español; los nombres nuevos de código están en inglés.

Los datos son de demostración. Los controles solo cambian estados visuales temporales. No se ejecuta audio, evaluación, autenticación, backend ni persistencia. Los módulos anteriores de dominio y audio se conservan desconectados para su futura integración por Claude.

El sidebar de escritorio pasa a menú desplegable y navegación inferior en móvil. El contenido se adapta mediante breakpoints a 1200, 1000, 760 y 420 px.

La documentación de rutas, componentes y límites de integración está en `docs/visual-handoff.md`. Este documento sustituye el diseño anterior basado en dos destinos de navegación.

Identidad actualizada según la referencia visual del usuario: azul noche, azul eléctrico y violeta; logotipo vectorial de guitarra blanca sobre púa azul-violeta, y nombre Fret Quest con degradado.

## Enfoque vigente: gimnasio técnico

Fret Quest se dirige a guitarristas que ya saben tocar lo básico. El catálogo Ejercicios contiene 10 módulos y 60 patrones mecánicos de demostración. Inicio ofrece Calentar, Mantenerme en forma y Mejorar una técnica. La progresión se centra en control, limpieza, comodidad y complejidad, no solo BPM. Se sustituye el antiguo temario desde cero.
