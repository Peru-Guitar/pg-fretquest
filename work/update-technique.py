import json
from pathlib import Path
modules=[
('hand-sync','Coordinación y sincronización','SINCRONIZACIÓN','Alinea ambas manos con ataques regulares y movimientos pequeños.',['Ataque conjunto','Cambios de cuerda','Regularidad'],['Cromático 1-2-3-4 ascendente','Cromático 4-3-2-1 descendente','Alternancia 1-3-2-4','Dos cuerdas, cuatro dedos','Sincronización al cambiar de posición','Control: patrón continuo de cuatro compases']),
('finger-independence','Independencia de dedos','CONTROL DE DEDOS','Trabaja el control individual y reduce movimientos innecesarios.',['Independencia','Economía de movimiento','Control'],['Pares 1-2 y 3-4','Pares 1-3 y 2-4','Permutación 1-4-2-3','Permutación 2-3-1-4','Dedos de apoyo y movimiento mínimo','Control: permutaciones enlazadas']),
('alternate-picking','Púa alternada','PRECISIÓN DE ATAQUE','Mantén ataques uniformes al alternar abajo y arriba.',['Alternancia','Ataque','Cruces'],['Una cuerda, ataques alternados','Dos notas por cuerda','Tres notas por cuerda','Cuatro notas por cuerda','Entrada con púa hacia arriba','Control: combina grupos pares e impares']),
('string-crossing','Cruces y saltos de cuerda','TRAYECTORIA DE PÚA','Desplaza la púa con precisión entre cuerdas contiguas y separadas.',['Cruce interior','Cruce exterior','Saltos'],['Cruces interiores entre dos cuerdas','Cruces exteriores entre dos cuerdas','Alterna pares de cuerdas','Salta una cuerda','Salta dos cuerdas','Control: recorrido de cuerdas mixto']),
('legato-lab','Ligados','HAMMER-ONS Y PULL-OFFS','Equilibra volumen y claridad con menos ataques de púa.',['Hammer-ons','Pull-offs','Trinos'],['Hammer-ons por pares de dedos','Pull-offs por pares de dedos','Trinos cortos y regulares','Tres notas ascendentes por cuerda','Tres notas descendentes por cuerda','Control: combina ligados y púa']),
('position-shifts','Desplazamientos y digitación','MOVILIDAD','Cambia de posición con precisión y usa digitaciones cómodas.',['Desplazamientos','Digitación','Posiciones'],['Desplazamientos cortos de posición','Una digitación en tres posiciones','Recorrido diagonal ascendente','Recorrido diagonal descendente','Apertura cómoda y regreso a posición','Control: enlaza posiciones sin pausas']),
('rhythm-control','Ritmo y control de púa','REGULARIDAD RÍTMICA','Sostén el pulso al cambiar acentos y subdivisiones.',['Subdivisiones','Acentos','Pulso'],['Corcheas con ataque uniforme','Semicorcheas en grupos de cuatro','Tresillos en una cuerda','Acentos desplazados','Alternancia de subdivisiones','Control: patrón con silencios y acentos']),
('muting-lab','Muting y articulación','LIMPIEZA','Controla resonancias y duración para que suene solo lo que buscas.',['Palm mute','Silenciamiento','Staccato'],['Palm mute uniforme','Alterna notas abiertas y apagadas','Silenciamiento con mano izquierda','Silenciamiento al cruzar cuerdas','Notas cortas y silencios precisos','Control: patrón limpio entre cuerdas']),
('bend-vibrato','Bends y vibrato','AFINACIÓN Y EXPRESIÓN','Controla la nota objetivo y la regularidad de cada oscilación.',['Afinación','Bends','Vibrato'],['Bend de semitono con nota de referencia','Bend de tono con nota de referencia','Mantén y libera la nota objetivo','Bend y regreso controlado','Vibrato lento y regular','Control: frase breve con bend y vibrato']),
('speed-control','Velocidad controlada','PRECISIÓN A VELOCIDAD','Trabaja ráfagas breves y cambios de velocidad sin perder limpieza.',['Ráfagas','Consistencia','Relajación'],['Ráfagas de cuatro notas','Ráfagas de seis notas','Alternancia lenta y rápida','Ráfagas con cambio de cuerda','Repeticiones cortas con descanso','Control: conserva claridad en una secuencia']),
]
p=Path('src/data/questMock.ts');old=p.read_text();player=old[:old.index('export type')];leader=old[old.index('export const leaderboard'):]
fixtures=[]
for i,(id,title,category,description,skills,titles) in enumerate(modules):
 fixtures.append(dict(id=id,title=title,category=category,description=description,art=['riff','solo','rhythm','rhythm','solo','chord','rhythm','riff','solo','chord'][i],level='Base técnica' if i<3 else 'Desarrollo técnico',icon=f'{i+1:02}',completedExercises=2 if i==0 else 0,skills=skills,exerciseItems=[dict(id=f'{id}-{j+1:02}',title=t,minutes=3 if j<5 else 4,xp=50,kind='control' if j==5 else 'drill',goal=description,variants=['Patrón aislado','Patrón enlazado','Variación de acento']) for j,t in enumerate(titles)]))
s=player+'''export type TechniqueExercise = { id: string; title: string; minutes: number; xp: number; kind: 'drill' | 'control'; goal: string; variants: string[] };
export type TechniqueModule = { id: string; title: string; category: string; description: string; art: string; level: string; icon: string; completedExercises: number; skills: string[]; exerciseItems: TechniqueExercise[] };
// Visual fixtures for guitarists with basic playing experience. No teaching, evaluation or persistence.
const moduleFixtures: TechniqueModule[] = '''+json.dumps(fixtures,ensure_ascii=False,indent=2)+''';
export const courses = moduleFixtures.map(module => ({
 ...module,
 exercises: module.exerciseItems.length,
 duration: `${module.exerciseItems.reduce((total, exercise) => total + exercise.minutes, 0)} min`,
 progress: Math.round(module.completedExercises / module.exerciseItems.length * 100),
}));
export const routines = [
 { id: 'warmup', title: 'Calentar', duration: '5–10 min', description: 'Patrones sencillos, movimientos cómodos y pausas breves.', moduleId: 'hand-sync' },
 { id: 'maintenance', title: 'Mantenerme en forma', duration: '15–20 min', description: 'Combina coordinación, púa, ritmo y limpieza.', moduleId: 'alternate-picking' },
 { id: 'focus', title: 'Mejorar una técnica', duration: 'A tu medida', description: 'Elige una habilidad y concentra tu sesión.', moduleId: 'legato-lab' },
];
'''+leader
p.write_text(s)
# Rename active display fields and links, retaining existing route structure.
for filename in ['src/pages/Learn.tsx','src/pages/Lesson.tsx','src/pages/Practice.tsx','src/components/quest/QuestUI.tsx']:
 p=Path(filename);s=p.read_text().replace('completedLessons','completedExercises').replace('lessonItems','exerciseItems').replace('course.lessons','course.exercises').replace('currentModule.lessons','currentModule.exercises').replace('module.lessonItems','module.exerciseItems')
 s=s.replace('activeLesson','activeExercise').replace('nextLesson','nextExercise').replace('lessonId: string','exerciseId: string')
 s=s.replace('lecciones','ejercicios').replace('lección','ejercicio').replace('Lección','Ejercicio').replace('LECCIÓN','EJERCICIO')
 s=s.replace('10 módulos de guitarra eléctrica. Desde tu primera nota hasta tu primer escenario.','Tu gimnasio de guitarra eléctrica. Coordinación, precisión y control para quienes ya tocan.').replace('Una progresión de principiante a intermedio · Contenido dummy','Entrenamiento técnico · Requiere experiencia básica · Datos de ejemplo').replace('Incluye un desafío final por módulo','Patrones repetibles y controles técnicos').replace('cada desafío','cada control').replace('No encontramos ese módulo','No encontramos ese entrenamiento')
 s=s.replace('lesson.kind === \'challenge\'','lesson.kind === \'control\'').replace('DESAFÍO FINAL','CONTROL TÉCNICO').replace('Desafío de módulo','Control técnico').replace('Explicación y ejercicios','Patrón técnico repetible').replace('El módulo termina con un desafío para reunir las habilidades de sus ejercicios.','Trabaja primero la limpieza y la comodidad. Aumenta la complejidad del patrón antes de perseguir velocidad.').replace('Tu sonido.','Tu técnica.').replace('Tu aventura.','Tu entrenamiento.').replace('Una nueva aventura.','Un nuevo entrenamiento.').replace('Cómo tocar','Cómo ejecutar')
 s=s.replace('Continuar ejercicio','Entrenar ejercicio').replace('Comenzar módulo','Entrenar módulo').replace('Explora sin límites.','Calidad antes que velocidad.').replace('Los tiempos, avances y recompensas son de ejemplo.','Los tiempos, avances y recompensas son de ejemplo. Prioriza el control y evita forzar el movimiento.')
 s=s.replace('guitar-basics','hand-sync').replace('Todos los módulos','Todos los módulos').replace('Encuentra tu próximo gran riff.','Mantén tu técnica en forma.').replace('ELIGE TU CAMINO','ELIGE QUÉ ENTRENAR')
 p.write_text(s)
