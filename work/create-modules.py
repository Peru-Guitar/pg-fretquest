import json
from pathlib import Path
modules=[
('guitar-basics','Conoce tu guitarra','FUNDAMENTOS','Prepara tu guitarra eléctrica y da el primer paso con confianza.','riff','Principiante',4,['Equipo','Afinación','Tablatura'],['Partes de la guitarra eléctrica','Conecta tu guitarra al amplificador','Afinación estándar: E A D G B e','Postura y manos relajadas','Cómo sujetar y mover la púa','Lee tu primera tablatura','Desafío: prepara tu primera sesión']),
('first-notes','Tus primeras notas','TÉCNICA INICIAL','Haz sonar tus primeras melodías con claridad y coordinación.','rhythm','Principiante',2,['Coordinación','Digitación','Púa alternada'],['Haz sonar las cuerdas al aire','Pisa los trastes con claridad','Coordina las dos manos','Tu primer ejercicio cromático','Púa alternada: abajo y arriba','Cambia de cuerda sin perderte','Desafío: toca tu primera melodía']),
('rhythm-lab','Encuentra tu ritmo','RITMO','Construye un pulso estable antes de subir la velocidad.','rhythm','Principiante',0,['Pulso','Subdivisión','Acentos'],['Siente el pulso y cuenta cuatro tiempos','Conoce al metrónomo','Negras: una nota por pulso','Corcheas: divide el pulso en dos','Silencios: aprende a dejar espacio','Acentos y patrones de ritmo','Desafío: mantén el pulso de principio a fin']),
('chord-world','El mundo de los acordes','ACORDES ABIERTOS','Une tus primeras posiciones y acompaña una progresión completa.','chord','Principiante',0,['Acordes abiertos','Cambios','Rasgueo'],['Cómo leer un diagrama de acordes','Tus primeros menores: Em y Am','Mayores esenciales: E A y D','Completa tu paleta con C y G','Cambia de acorde con calma','Tu primer patrón de rasgueo','Desafío: acompaña una progresión de cuatro acordes']),
('first-riffs','Tus primeros riffs','ROCK Y RIFFS','Combina potencia, silencios y precisión para construir un riff de rock.','riff','Principiante',0,['Power chords','Palm mute','Control del ruido'],['Qué hace que un riff funcione','Power chords de dos notas','Mueve los power chords por el mástil','Palm mute: controla la resonancia','Silencia las cuerdas que no tocas','Une notas y acordes en un riff','Desafío: toca tu primer riff de rock']),
('fretboard-map','Explora el mástil','MAPA MUSICAL','Descubre cómo se conectan las notas y orienta tus manos en el mástil.','solo','Principiante',0,['Notas','Intervalos','Octavas'],['Las doce notas y los nombres de las cuerdas','Tonos y semitonos en el mástil','Encuentra notas en la sexta y quinta cuerda','Octavas: la misma nota en otro lugar','Intervalos: distancia entre notas','Conecta posiciones con notas de referencia','Desafío: encuentra tu camino por el mástil']),
('movable-chords','Acordes con más fuerza','ARMONÍA','Amplía tu acompañamiento con cejillas y formas que puedes mover.','chord','Intermedio',0,['Cejilla','Formas móviles','Progresiones'],['Prepara una cejilla sin tensión','La forma de E: mayores y menores','La forma de A: mayores y menores','Muévete entre acordes abiertos y cejillas','Progresiones y grados: I IV y V','Acompaña con dinámica y silencios','Desafío: lleva una progresión a otra tonalidad']),
('solo-quest','El camino del solista','ESCALAS E IMPROVISACIÓN','Convierte patrones sencillos en frases con intención musical.','solo','Intermedio',0,['Pentatónica','Escala mayor','Fraseo'],['Tu primera pentatónica menor','Recorre la escala con púa alternada','Crea secuencias de tres y cuatro notas','Descubre el patrón de la escala mayor','Construye frases con pausas y repeticiones','Pregunta y respuesta sobre una base','Desafío: improvisa un solo de ocho compases']),
('expression-lab','Dale expresión','TÉCNICA Y EXPRESIÓN','Haz que una misma nota tenga muchas formas de contar algo.','solo','Intermedio',0,['Ligados','Bends','Vibrato'],['Slides: conecta dos notas','Hammer-ons: haz sonar la segunda nota','Pull-offs: claridad al soltar','Bends: llega a la nota objetivo','Vibrato: controla el movimiento','Dinámica: cambia la intensidad de tu frase','Desafío: interpreta un lick con expresión']),
('first-stage','Tu primer escenario','REPERTORIO','Une lo aprendido en una pieza de práctica completa y propia.','riff','Intermedio',0,['Estructura','Acompañamiento','Interpretación'],['Reconoce verso estribillo y puente','Divide una pieza en secciones','Construye el acompañamiento','Añade un riff entre secciones','Prepara un solo sencillo','Ensaya transiciones y final','Desafío: interpreta tu primera pieza completa']),
]
courses=[]
for i,(id,title,category,description,art,level,completed,skills,titles) in enumerate(modules):
 items=[dict(id=f'{id}-{n+1:02}',title=t,minutes=5+n,xp=150 if n==len(titles)-1 else 50,kind='challenge' if n==len(titles)-1 else 'lesson') for n,t in enumerate(titles)]
 courses.append(dict(id=id,title=title,category=category,description=description,art=art,level=level,icon=f'{i+1:02}',completedLessons=completed,skills=skills,lessonItems=items))
p=Path('src/data/questMock.ts');s=p.read_text();leader=s[s.index('export const leaderboard'):];player=s[:s.index('export const courses')]
types='''export type ModuleLesson = { id: string; title: string; minutes: number; xp: number; kind: 'lesson' | 'challenge' };
export type LearningModule = { id: string; title: string; category: string; description: string; art: string; level: string; icon: string; completedLessons: number; skills: string[]; lessonItems: ModuleLesson[] };
// Original placeholder outline inspired by public Rockschool and Berklee syllabuses.
// Completion and XP are display fixtures only, never stored or evaluated.
'''
p.write_text(player+types+'const moduleFixtures: LearningModule[] = '+json.dumps(courses,ensure_ascii=False,indent=2)+''';
export const courses = moduleFixtures.map(module => ({
  ...module,
  lessons: module.lessonItems.length,
  duration: `${module.lessonItems.reduce((total, lesson) => total + lesson.minutes, 0)} min`,
  progress: Math.round(module.completedLessons / module.lessonItems.length * 100),
}));
'''+leader)
