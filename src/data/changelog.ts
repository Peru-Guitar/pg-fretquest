// Novedades por versión, la más reciente arriba. Notas breves, en palabras del alumno.
// `date` es el día del pase (AAAA-MM-DD): la página junta las versiones del mismo día.
export const changelog: { version: string; date: string; notes: string[] }[] = [
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
