// Novedades por versión, la más reciente arriba. Notas breves, en palabras del alumno.
// `date` es el día del pase (AAAA-MM-DD): la página junta las versiones del mismo día.
export const changelog: { version: string; date: string; notes: string[] }[] = [
    {
        version: '0.12.0',
        date: '2026-11-02',
        notes: [
            'Tu meta semanal ahora es en horas: 1, 3, 5 o 7.',
            'Ves tu avance de la semana en horas y minutos.',
            '«Mi nivel» ahora se llama «Intensidad».',
            '«Mis datos» ahora se llama «Mi cuenta».',
            'La semana de Comunidad se ve como una línea de tiempo.',
        ],
    },
    {
        version: '0.11.0',
        date: '2026-11-02',
        notes: [
            'La práctica ahora es desde tablet o computadora, donde la tablatura se lee mejor.',
            'En el celular puedes explorar lecciones, escuchar y leer la tablatura sin moverla de lado.',
            '«Mi cuenta» ahora se llama «Mis datos».',
            'Reproducir y Practicar funcionan de forma más estable.',
        ],
    },
    {
        version: '0.10.1',
        date: '2026-11-01',
        notes: [
            'Arreglado: si dabas Practicar mientras sonaba Reproducir, la tablatura seguía marcando notas.',
        ],
    },
    {
        version: '0.10.0',
        date: '2026-11-01',
        notes: [
            'Los perfiles cargan mucho más rápido, sin importar cuánto hayas practicado.',
            'Módulos del perfil más claros: cada lección con cuántas veces la practicaste y cuánto tiempo.',
            'Comunidad y los perfiles abren al instante cuando vuelves a entrar.',
        ],
    },
    {
        version: '0.9.1',
        date: '2026-11-01',
        notes: [
            '¡Celebra cada nivel! Cuando una práctica te hace subir de nivel, lo verás en grande al cerrar el resumen.',
            'Al darle a Practicar, la tablatura empieza siempre desde el inicio, sin notas marcadas.',
            'En el celular, «Tu semana» se ve ordenada en el menú de tu cuenta.',
        ],
    },
    {
        version: '0.9.0',
        date: '2026-10-31',
        notes: [
            'Nuevos rangos y niveles: 50 niveles y 8 rangos, de Primer acorde a Fret Legend, que suben con las horas que entrenas. Mira la tabla completa en Rangos.',
            'Tu rango y tu nivel se ven arriba, junto a tu nombre, con la barra de avance al siguiente nivel.',
            'Los perfiles muestran el rango de cada guitarrista, su ciudad, su guitarra y su meta.',
            'Comunidad: el ranking muestra el rango de cada uno, hay una nueva sección de rangos de la comunidad y se ve claro qué semana es y cuándo se reinicia. Además carga mucho más rápido.',
        ],
    },
    {
        version: '0.8.4',
        date: '2026-10-30',
        notes: [
            'Nuevo eslogan: «Más práctica. Menos excusas.» y nueva imagen para compartir.',
        ],
    },
    {
        version: '0.8.3',
        date: '2026-10-30',
        notes: [
            'Las tablaturas ya pueden mostrar y hacer sonar bends, pre-bends, vibrato, ligados nota a nota y silencios.',
        ],
    },
    {
        version: '0.8.2',
        date: '2026-10-30',
        notes: [
            'Las lecturas de Recomendaciones ahora tienen su resumen.',
        ],
    },
    {
        version: '0.8.1',
        date: '2026-10-30',
        notes: [
            'Nuevas lecciones: «Serrana» de Jason Becker y el «Monster Lick» de Frank Gambale, con economy picking.',
            'Nueva velocidad «Original» en las lecciones de artistas: el BPM de la grabación, ordenado entre los demás niveles.',
            'El selector de velocidad muestra la figura de cada nivel (corcheas, semicorcheas…) junto al BPM.',
            'Of Sins And Shadows ahora suena en semicorcheas, como en el disco.',
            'Ajustes de dificultad en las lecciones de Becker y Gilbert.',
        ],
    },
    {
        version: '0.8.0',
        date: '2026-10-29',
        notes: [
            'Nuevo módulo Tapping: una cuerda, dos cuerdas, string skipping, escalas simétricas y diagonales.',
            'Nueva lección de Michael Romeo: Of Sins And Shadows.',
            'El módulo Estudios ahora se llama Artistas.',
            'En el inicio, «Hoy te recomendamos» te sugiere otra lección parecida a tu última práctica.',
            'La guía de la práctica empieza prendida y recuerda tu elección.',
            'Al entrar a un módulo se abre siempre la primera pestaña.',
            'Tablatura más limpia: sin textos repetidos y sin notas sueltas en una fila.',
            'Durante la práctica la pantalla avanza sola y la página de atrás ya no se mueve.',
            'Nueva sección sobre qué es Fret Quest y cómo pedir ayuda en el grupo de WhatsApp.',
        ],
    },
    {
        version: '0.7.2',
        date: '2026-10-29',
        notes: [
            'En Mi cuenta puedes usar tu nombre artístico o como te conocen: es el nombre que verán los demás en la Comunidad.',
        ],
    },
    {
        version: '0.7.1',
        date: '2026-10-28',
        notes: [
            'En el inicio ves cuántos ejercicios, módulos y niveles hay para practicar.',
            'Pentatónica: las subcategorías ahora se llaman Modales y Extendidos.',
        ],
    },
    {
        version: '0.7.0',
        date: '2026-10-28',
        notes: [
            'Pentatónica: nuevas posiciones horizontales, también en versión blues.',
            'Pentatónicas modales en caja: eólica, locria, jónica, dórica, frigia, lidia y mixolidia.',
            'Pentatónicas interválicas: en cuartas, quintas y séptimas.',
            'Las subcategorías de cada módulo se ordenan de la más fácil a la más difícil.',
            'Al volver de una lección regresas a su pestaña del módulo.',
            'Al detener la tablatura el sonido se corta en seco, sin eco.',
            'La guía de la práctica empieza apagada.',
            'En el inicio, «Para tu nivel» muestra 3 módulos al azar.',
            'Mejor lectura en celular del inicio, la comunidad y las estadísticas.',
        ],
    },
    {
        version: '0.6.0',
        date: '2026-10-28',
        notes: [
            'Nuevas escalas: los 8 modos de la bebop dominante, la tonal, la disminuida y la semitono disminuida.',
            'Púa alternada: modos por octavas, patrones de velocidad en dos cuerdas y string skipping, en menor natural y armónica.',
            'Descripciones más cortas y sobre el sonido de cada ejercicio.',
            'Los módulos con muchas lecciones se ordenan en pestañas, con enlace propio para compartir.',
        ],
    },
    {
        version: '0.5.0',
        date: '2026-10-27',
        notes: [
            'Escalas y patrones: los modos de la escala mayor ahora van en orden, de jónico a locrio.',
            'Nuevos modos de C menor armónica y C menor melódica.',
            'La velocidad ahora va en 5 niveles, de Base a Extremo: los más altos pasan a semicorcheas.',
            'La tablatura de guía recuerda si la dejaste activada.',
            'Retoques visuales al elegir velocidad y rondas.',
        ],
    },
    {
        version: '0.4.0',
        date: '2026-10-26',
        notes: [
            'Ahora ves quién está practicando cada módulo y cada lección esta semana.',
            'Las lecturas muestran quién las leyó esta semana.',
            'Los perfiles indican a qué hora se actualizaron sus datos.',
            'Las lecturas tienen la misma navegación de anterior y siguiente que los ejercicios.',
            'Retoques visuales en las lecciones y las tablaturas.',
        ],
    },
    {
        version: '0.3.2',
        date: '2026-10-26',
        notes: ['Nueva lección de Greg Howe: «Abrupt Terminal», transcrita por Koko Rengifo.', 'La tablatura ahora marca el tapping (T) también en los ejercicios con púa alternada.'],
    },
    {
        version: '0.3.1',
        date: '2026-10-26',
        notes: ['La página de invitación se puede ver aunque ya tengas sesión: «Unirme» te lleva directo a tu plan.'],
    },
    {
        version: '0.3.0',
        date: '2026-10-26',
        notes: [
            'Practicar ahora se abre en su propia pantalla completa, para que la tablatura tenga todo el espacio.',
            'Antes de practicar eliges la velocidad y las rondas.',
            'Nueva opción: practicar con la tablatura de guía sonando muy bajita.',
            'La cuenta de entrada aparece al instante.',
            'Las opciones de «¿Cómo te sentiste?» se resaltan al pasar el mouse.',
        ],
    },
    {
        version: '0.2.2',
        date: '2026-10-26',
        notes: [
            'Nuevo módulo Púa alternada con ejercicios de mano derecha en cuerdas al aire.',
            'Invitar a un amigo ahora está en el menú principal.',
            'Nuevo acceso para unirte al grupo de WhatsApp.',
        ],
    },
    {
        version: '0.2.1',
        date: '2026-10-25',
        notes: [
            'Los ejercicios de digitación ahora van en corcheas y empiezan a 60 BPM.',
            'Ahora puedes elegir libremente cuántas rondas practicar.',
            'El metrónomo se escucha más fuerte y la guitarra del tab un poco más suave.',
        ],
    },
    {
        version: '0.2.0',
        date: '2026-10-25',
        notes: [
            'Mi plan muestra las lecciones en columnas y separadas por tipo de patrón.',
            'Nuevo acceso a tu perfil desde el menú de tu cuenta.',
            'Tu perfil agrupa las lecciones por módulo.',
            'La pestaña Objetivo es más clara: objetivo, recomendaciones y pasos para practicar.',
            'Nuevo diseño de Novedades: toca la versión para verlas.',
            'Al unirte, se usa tu nombre de Google (lo puedes cambiar en Mi cuenta).',
            'Foto de Michael Romeo.',
        ],
    },
    { version: '0.1.0', date: '2026-10-25', notes: ['Lanzamiento de la beta.'] },
];
