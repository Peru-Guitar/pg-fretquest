// Novedades por versión, la más reciente arriba. Notas breves, en palabras del alumno.
// `date` es el día del pase (AAAA-MM-DD): la página junta las versiones del mismo día.
export const changelog: { version: string; date: string; notes: string[] }[] = [
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
