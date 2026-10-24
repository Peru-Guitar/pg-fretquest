import { practiceStudies } from './practiceStudies';
export const player = { name: 'Eduardo', handle: 'edu.strings', level: 12, xp: '2.450', rank: 'Explorador de cuerdas', streak: 7 };
type LessonBase = { id: string; title: string; minutes: number; xp: number };
/** Lección de lectura: contenido para leer, sin tocar. */
export type ReadingLesson = LessonBase & { type: 'reading'; summary: string; points: { title: string; text: string }[]; note?: string };
/** Lección de práctica: patrón para tocar en la sala de práctica. */
/** Dificultad propia de cada ejercicio (factor de puntos). */
export type Difficulty = 'base' | 'intermedio' | 'avanzado' | 'experto';
export type PracticeLesson = LessonBase & { type: 'practice'; difficulty: Difficulty; /** Artista autor del patrón (id de `data/artists`). */ artist?: string; description: string; goal: string; tempo: { min: number; max: number }; rounds: number; record?: number };
export type Lesson = ReadingLesson | PracticeLesson;
export type TechniqueModule = { id: string; title: string; category: string; description: string; art: string; level: string; icon: string; completedLessons: number; skills: string[]; lessons: Lesson[] };
// Visual fixtures for guitarists with basic playing experience. No teaching, evaluation or persistence.
const moduleFixtures: TechniqueModule[] = [
  {
    "id": "recommendations",
    "title": "Recomendaciones",
    "category": "FUNDAMENTOS",
    "description": "Aprende a preparar, ejecutar y revisar una práctica con criterio, priorizando limpieza, control y constancia.",
    "art": "chord",
    "level": "Antes de empezar",
    "icon": "00",
    "completedLessons": 0,
    "skills": [
      "Preparación",
      "Criterio de práctica",
      "Constancia"
    ],
    "lessons": [
      {
        "id": "recommendations-01",
        "title": "Cómo usar los ejercicios",
        "minutes": 3,
        "xp": 20,
        "type": "reading",
        "summary": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "points": [
          {
            "title": "Lee todas las indicaciones antes de tocar",
            "text": "Antes de tomar la guitarra, recorre el ejercicio completo: el objetivo, el patrón, la digitación y cualquier nota adicional. Empezar a tocar sin leer suele llevar a practicar algo distinto de lo que el ejercicio busca, y corregir un movimiento aprendido cuesta más que aprenderlo bien desde el principio."
          },
          {
            "title": "Comprende el objetivo del ejercicio",
            "text": "Cada ejercicio entrena algo concreto: sincronizar las manos, independizar los dedos, controlar la púa o limpiar el sonido. Si sabes qué estás entrenando, sabrás también en qué fijarte y cuándo el ejercicio está cumpliendo su función, aunque todavía no salga perfecto."
          },
          {
            "title": "Revisa el patrón, la digitación y la dirección de púa",
            "text": "El patrón indica qué notas tocar; la digitación, con qué dedos; y la dirección de púa, cómo atacar cada nota. Las tres cosas forman parte del ejercicio. Cambiar la digitación o la púa por comodidad puede hacer que el patrón suene, pero deja sin entrenar justo lo que el ejercicio pretendía trabajar."
          },
          {
            "title": "Identifica qué escuchar y observar",
            "text": "Antes de empezar, decide qué vas a vigilar: que no suenen cuerdas de más, que los ataques sean parejos o que la mano no se tense. Practicar con una referencia clara convierte cada repetición en una oportunidad de mejora, en lugar de una simple repetición mecánica."
          }
        ]
      },
      {
        "id": "recommendations-02",
        "title": "Organiza tu práctica",
        "minutes": 3,
        "xp": 20,
        "type": "reading",
        "summary": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "points": [
          {
            "title": "Establece un horario y mantén la constancia",
            "text": "Practicar un poco cada día rinde más que una sesión larga de vez en cuando. Elegir un momento fijo ayuda a que la práctica se vuelva un hábito y no dependa del ánimo del día. La constancia es lo que consolida los movimientos y hace que se vuelvan naturales."
          },
          {
            "title": "Prioriza la atención y la calidad",
            "text": "Diez minutos atentos valen más que una hora tocando en piloto automático. Cuando notes que la atención se dispersa o que repites errores sin darte cuenta, es mejor hacer una pausa. Cada repetición debería tener una intención clara."
          },
          {
            "title": "Reparte el tiempo a lo largo del día",
            "text": "Si dispones de más tiempo, divídelo en varios bloques en distintos momentos del día. Las sesiones cortas cansan menos, mantienen la concentración y dan al cuerpo tiempo para asimilar lo que acabas de trabajar entre una sesión y otra."
          },
          {
            "title": "Repite el tiempo necesario",
            "text": "Avanzar no consiste solamente en terminar un ejercicio. Quédate en él hasta que puedas tocarlo con limpieza, regularidad y comodidad. Pasar al siguiente antes de tiempo suele dejar huecos que más adelante aparecen como errores difíciles de rastrear."
          }
        ],
        "note": "La hora diaria y la semana por lección son referencias del curso original, no requisitos de Fret Quest."
      },
      {
        "id": "recommendations-03",
        "title": "Prepara tu sonido",
        "minutes": 3,
        "xp": 20,
        "type": "reading",
        "summary": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "points": [
          {
            "title": "Mantén una configuración estable",
            "text": "Usa siempre la misma configuración de sonido para tus ejercicios. Si cambias el equipo o los ajustes en cada sesión, no podrás saber si una mejora viene de tu técnica o del sonido. Un punto de partida fijo te permite comparar tu ejecución de un día a otro."
          },
          {
            "title": "Escucha los detalles",
            "text": "Un sonido demasiado procesado esconde ruidos, cuerdas que resuenan y ataques irregulares. La idea es que la configuración te muestre lo que necesitas corregir, no que lo disimule. Si algo suena sucio, es información útil para tu práctica."
          },
          {
            "title": "Una referencia de partida",
            "text": "Como punto de partida puedes usar distorsión a la mitad, la pastilla del puente y una puerta de ruido, con el reductor de ruido, el compresor y los demás efectos apagados. Es una referencia, no una regla: lo importante es que el sonido sea claro y revele los detalles."
          },
          {
            "title": "Sigue las indicaciones del ejercicio",
            "text": "Algunos ejercicios piden una configuración específica, por ejemplo un sonido limpio para escuchar mejor la articulación. Cuando el ejercicio lo indique, esa configuración tiene prioridad sobre tu ajuste habitual."
          }
        ]
      },
      {
        "id": "recommendations-04",
        "title": "Cómo ejecutar los patrones",
        "minutes": 3,
        "xp": 20,
        "type": "reading",
        "summary": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "points": [
          {
            "title": "Empieza despacio",
            "text": "Toca el patrón lentamente hasta que el movimiento te resulte familiar. La lentitud no es un paso que haya que superar rápido: es el momento en que se aprende el movimiento correcto. Lo que se aprende bien a poca velocidad se mantiene cuando aceleras."
          },
          {
            "title": "Divide y enlaza",
            "text": "Si un patrón es complejo, sepáralo en fragmentos más pequeños y trabaja cada uno por separado. Cuando cada parte salga con comodidad, únelas poco a poco. Así resuelves las dificultades una por una en lugar de repetir el patrón entero con los mismos errores."
          },
          {
            "title": "Respeta la digitación y la púa",
            "text": "Sigue la digitación y la dirección de púa indicadas en cada ejercicio. Están pensadas para entrenar un aspecto concreto de la técnica, y mantenerlas es lo que hace que el ejercicio cumpla su objetivo."
          },
          {
            "title": "Usa el metrónomo cuando se indique",
            "text": "El metrónomo ayuda a medir la regularidad y a subir la velocidad de forma controlada. Úsalo en los ejercicios que lo requieran; en otros puede ser más útil tocar sin él para concentrarte primero en el movimiento."
          },
          {
            "title": "Aumenta la dificultad con control",
            "text": "Sube la velocidad o la complejidad solo cuando el patrón suene limpio y lo toques sin tensión. Si al acelerar aparecen errores, vuelve al tempo anterior. La velocidad es una consecuencia del control, no un objetivo en sí misma."
          }
        ],
        "note": "La púa alternada estricta y el trabajo sin metrónomo son indicaciones de ejercicios concretos; no se aplican automáticamente a todos los patrones."
      },
      {
        "id": "recommendations-05",
        "title": "Qué escuchar y observar",
        "minutes": 3,
        "xp": 20,
        "type": "reading",
        "summary": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "points": [
          {
            "title": "Notas claras y cuerdas en silencio",
            "text": "Que suenen solo las notas previstas. Las cuerdas que no tocas deben mantenerse en silencio, apagadas por la mano izquierda, la derecha o ambas. Con distorsión, cualquier cuerda que resuene de más se nota enseguida."
          },
          {
            "title": "Ataques regulares",
            "text": "Los ataques deben mantener un volumen y un tiempo parejos. Si algunas notas suenan más fuertes, más débiles o fuera de tiempo, ahí tienes un punto concreto que trabajar."
          },
          {
            "title": "Manos coordinadas",
            "text": "Cada nota debe sonar en el momento en que ambas manos coinciden: el dedo pisa y la púa ataca a la vez. Cuando no están sincronizadas aparecen notas cortadas, ruidos o ataques sin sonido."
          },
          {
            "title": "Movimientos pequeños y cómodos",
            "text": "Cuanto más pequeños y relajados sean los movimientos, más fácil será tocar con precisión y velocidad. Si sientes tensión en la mano, la muñeca o el hombro, baja el tempo y vuelve a buscar comodidad."
          },
          {
            "title": "Un agarre de púa estable",
            "text": "Sujeta la púa con firmeza suficiente para que no se mueva, pero sin apretar en exceso. Un agarre demasiado fuerte genera tensión y resta control; uno demasiado suelto hace que la púa gire o se escape."
          },
          {
            "title": "Dedos cerca del mástil",
            "text": "Mantén los dedos de la mano izquierda cerca del mástil, siempre según lo que pida el patrón. Así recorren menos distancia entre notas y los cambios resultan más rápidos y precisos."
          }
        ],
        "note": "Las explicaciones técnicas detalladas están en sus módulos correspondientes."
      },
      {
        "id": "recommendations-06",
        "title": "Cómo revisar y avanzar",
        "minutes": 3,
        "xp": 20,
        "type": "reading",
        "summary": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "points": [
          {
            "title": "Escúchate con atención",
            "text": "Mientras tocas es difícil percibir todos los detalles. Si te resulta útil, grábate y escucha la grabación con calma: notarás cosas que pasan desapercibidas en el momento, tanto errores como avances."
          },
          {
            "title": "Elige un aspecto concreto",
            "text": "En lugar de intentar corregirlo todo a la vez, identifica una sola cosa que mejorar: una cuerda que resuena, un ataque irregular o un cambio de posición. Un objetivo claro hace que la práctica sea más eficaz."
          },
          {
            "title": "Repite y compara",
            "text": "Trabaja el fragmento donde aparece el problema y vuelve a tocarlo. Compara el resultado con la versión anterior para comprobar si la corrección funciona."
          },
          {
            "title": "Limpieza antes que velocidad",
            "text": "Prioriza siempre la limpieza, la regularidad y la comodidad antes de subir la velocidad. Un patrón limpio y lento es una base sólida; uno rápido y sucio consolida los errores."
          },
          {
            "title": "Vuelve a estas recomendaciones",
            "text": "Cuando encuentres una dificultad en cualquier módulo, regresa a estas lecturas. Muchos problemas técnicos se resuelven revisando cómo estás practicando antes que el ejercicio en sí."
          }
        ]
      }
    ]
  },
  {
    "id": "fingering",
    "title": "Digitación y coordinación",
    "category": "DIGITACIÓN",
    "description": "Fortalece la mano izquierda y sincroniza ambas manos con patrones cromáticos y de cuatro dedos.",
    "art": "riff",
    "level": "Base técnica",
    "icon": "01",
    "completedLessons": 2,
    "skills": [
      "Independencia",
      "Sincronización",
      "Precisión"
    ],
    "lessons": [
      {
        "id": "fingering-01",
        "title": "Soltura de dedos",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1,
        "record": 100
      },
      {
        "id": "fingering-02",
        "title": "Fuerza en postura inversa",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1,
        "record": 80
      },
      {
        "id": "fingering-03",
        "title": "Independencia de dedos",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "fingering-04",
        "title": "Independencia en postura inversa",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "fingering-05",
        "title": "Apertura de la mano",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "",
        "goal": "",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      }
    ]
  },
  {
    "id": "alternate-picking",
    "title": "Alternate picking",
    "category": "PÚA",
    "description": "Alterna ataques abajo y arriba con regularidad, también en los cambios y saltos de cuerda.",
    "art": "rhythm",
    "level": "Base técnica",
    "icon": "02",
    "completedLessons": 0,
    "skills": [
      "Dirección de púa",
      "Cambios de cuerda",
      "Regularidad"
    ],
    "lessons": [
      {
        "id": "alternate-picking-01",
        "title": "Fundamentos: una cuerda, ataque abajo-arriba",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1,
        "record": 120
      },
      {
        "id": "alternate-picking-02",
        "title": "Cambios de cuerda: por fuera y por dentro",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "alternate-picking-03",
        "title": "Saltos de cuerda",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "alternate-picking-04",
        "title": "Ráfagas de notas",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "alternate-picking-05",
        "title": "Patrones horizontales",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "alternate-picking-06",
        "title": "Ejercicios de velocidad y precisión",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      }
    ]
  },
  {
    "id": "economy-picking",
    "title": "Economy picking",
    "category": "PÚA",
    "description": "Aprovecha la dirección de la púa en los cambios de cuerda para tocar con menos movimiento.",
    "art": "rhythm",
    "level": "Intermedio",
    "icon": "03",
    "completedLessons": 0,
    "skills": [
      "Cambios de cuerda",
      "Dirección de púa",
      "Eficiencia"
    ],
    "lessons": [
      {
        "id": "economy-picking-01",
        "title": "Fundamentos del economy picking",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "economy-picking-02",
        "title": "Cambios de cuerda",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "economy-picking-03",
        "title": "Patrones ascendentes",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "economy-picking-04",
        "title": "Patrones descendentes",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "economy-picking-05",
        "title": "Combinación con alternate picking",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "economy-picking-06",
        "title": "Secuencias de tres notas por cuerda",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "economy-picking-07",
        "title": "Ejercicios de velocidad y precisión",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      }
    ]
  },
  {
    "id": "scales",
    "title": "Escalas y patrones",
    "category": "ESCALAS",
    "description": "Recorre los siete modos y las pentatónicas en todas sus posiciones, tocadas con alternate picking.",
    "art": "solo",
    "level": "Base técnica",
    "icon": "04",
    "completedLessons": 0,
    "skills": [
      "Modos",
      "Pentatónicas",
      "Posiciones"
    ],
    "lessons": [
      {
        "id": "scales-01",
        "title": "Modo jónico",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "scales-02",
        "title": "Modo dórico",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "scales-03",
        "title": "Modo frigio",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "scales-04",
        "title": "Modo lidio",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "scales-05",
        "title": "Modo mixolidio",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "scales-06",
        "title": "Modo eólico",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "scales-07",
        "title": "Modo locrio",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "scales-08",
        "title": "Pentatónica mayor",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "scales-09",
        "title": "Pentatónica menor",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      }
    ]
  },
  {
    "id": "bending-vibrato",
    "title": "Bending y vibrato",
    "category": "EXPRESIÓN",
    "description": "Controla la afinación de cada bending y da vida a las notas largas con vibrato.",
    "art": "chord",
    "level": "Intermedio",
    "icon": "05",
    "completedLessons": 0,
    "skills": [
      "Afinación",
      "Control",
      "Expresión"
    ],
    "lessons": [
      {
        "id": "bending-vibrato-01",
        "title": "Bending de semitono",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 80
        },
        "rounds": 1
      },
      {
        "id": "bending-vibrato-02",
        "title": "Bending de tono completo",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 80
        },
        "rounds": 1
      },
      {
        "id": "bending-vibrato-03",
        "title": "Bending de tono y medio",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 80
        },
        "rounds": 1
      },
      {
        "id": "bending-vibrato-04",
        "title": "Pre-bending",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 80
        },
        "rounds": 1
      },
      {
        "id": "bending-vibrato-05",
        "title": "Release bending",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 80
        },
        "rounds": 1
      },
      {
        "id": "bending-vibrato-06",
        "title": "Vibrato",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 80
        },
        "rounds": 1
      },
      {
        "id": "bending-vibrato-07",
        "title": "Combinaciones expresivas de bending y vibrato",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 80
        },
        "rounds": 1
      }
    ]
  },
  {
    "id": "legato",
    "title": "Legato",
    "category": "LEGATO",
    "description": "Une notas con hammer-ons y pull-offs para frases fluidas y parejas en volumen.",
    "art": "solo",
    "level": "Intermedio",
    "icon": "06",
    "completedLessons": 0,
    "skills": [
      "Hammer-on",
      "Pull-off",
      "Fluidez"
    ],
    "lessons": [
      {
        "id": "legato-01",
        "title": "Hammer-ons",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "legato-02",
        "title": "Pull-offs",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "legato-03",
        "title": "Combinaciones de hammer-ons y pull-offs",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "legato-04",
        "title": "Legato de tres notas por cuerda",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "legato-05",
        "title": "Desplazamientos horizontales",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "legato-06",
        "title": "Secuencias avanzadas de legato",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      }
    ]
  },
  {
    "id": "sweep-picking",
    "title": "Sweep picking y arpegios",
    "category": "ARPEGIOS",
    "description": "Barre las cuerdas en un solo movimiento para tocar arpegios limpios en tres y cinco cuerdas.",
    "art": "chord",
    "level": "Avanzado",
    "icon": "07",
    "completedLessons": 0,
    "skills": [
      "Barrido",
      "Arpegios",
      "Muting"
    ],
    "lessons": [
      {
        "id": "sweep-picking-01",
        "title": "Introducción al sweep picking",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 120
        },
        "rounds": 1
      },
      {
        "id": "sweep-picking-02",
        "title": "Arpegios de tres cuerdas",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 120
        },
        "rounds": 1
      },
      {
        "id": "sweep-picking-03",
        "title": "Arpegios de cinco cuerdas",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 120
        },
        "rounds": 1
      },
      {
        "id": "sweep-picking-04",
        "title": "Arpegios mayores y menores",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 120
        },
        "rounds": 1
      },
      {
        "id": "sweep-picking-05",
        "title": "Arpegios de séptima",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 120
        },
        "rounds": 1
      },
      {
        "id": "sweep-picking-06",
        "title": "Inversiones",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 120
        },
        "rounds": 1
      },
      {
        "id": "sweep-picking-07",
        "title": "Combinaciones de sweep picking y legato",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 120
        },
        "rounds": 1
      }
    ]
  },
  {
    "id": "tapping",
    "title": "Tapping",
    "category": "TAPPING",
    "description": "Suma la mano derecha sobre el diapasón para ampliar el alcance de tus frases.",
    "art": "rhythm",
    "level": "Avanzado",
    "icon": "08",
    "completedLessons": 0,
    "skills": [
      "Mano derecha",
      "Desplazamientos",
      "Combinaciones"
    ],
    "lessons": [
      {
        "id": "tapping-01",
        "title": "Tapping básico",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "tapping-02",
        "title": "Tapping en una cuerda",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "base",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "tapping-03",
        "title": "Tapping con desplazamientos",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "tapping-04",
        "title": "Tapping en varias cuerdas",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "intermedio",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "tapping-05",
        "title": "Tapping combinado con legato",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      },
      {
        "id": "tapping-06",
        "title": "Secuencias avanzadas",
        "minutes": 5,
        "xp": 50,
        "type": "practice",
        "difficulty": "avanzado",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
        "goal": "Lorem ipsum dolor sit amet: ejecuta el patrón con limpieza, regularidad y movimientos pequeños.",
        "tempo": {
          "min": 40,
          "max": 160
        },
        "rounds": 1
      }
    ]
  },
  {
    "id": "licks-phrasing",
    "title": "Estudios",
    "category": "ESTUDIOS",
    "description": "Combina digitación, picking, ligados, arpegios y saltos de cuerda en estudios musicales de distintos estilos.",
    "art": "riff",
    "level": "Avanzado",
    "icon": "09",
    "completedLessons": 0,
    "skills": [
      "Licks",
      "Fraseo",
      "Musicalidad"
    ],
    "lessons": []
  }
];
const DIFFICULTY_ORDER: Difficulty[] = ['base', 'intermedio', 'avanzado', 'experto'];
const DIFFICULTY_LABEL: Record<Difficulty, string> = { base: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado', experto: 'Experto' };
/** Rango de dificultad del módulo según sus ejercicios (p. ej. «Base – Avanzado»); las lecturas no tienen dificultad. */
function difficultyRange(lessons: Lesson[], fallback: string) {
 const present = DIFFICULTY_ORDER.filter(level => lessons.some(lesson => lesson.type === 'practice' && lesson.difficulty === level));
 if (!present.length) return fallback;
 const [low, high] = [present[0], present[present.length - 1]];
 return low === high ? DIFFICULTY_LABEL[low] : `${DIFFICULTY_LABEL[low]} – ${DIFFICULTY_LABEL[high]}`;
}
// Módulo de arpegios (guía «No más arpegios aburridos»): va justo después de Digitación.
const arpeggioLesson = (id: string, title: string, difficulty: Difficulty = 'intermedio'): Lesson => ({ id, title, type: 'practice', difficulty, minutes: 8, xp: 60, description: '', goal: '', tempo: { min: 40, max: 160 }, rounds: 1 });
moduleFixtures.splice(moduleFixtures.findIndex(module => module.id === 'fingering') + 1, 0, {
 id: 'arpeggios', title: 'Arpegios', category: 'ARPEGIOS',
 description: 'Arpegios de séptima sobre la escala mayor de Do: el color de cada grado, de Maj7 a semidisminuido.',
 art: 'sweep', level: 'Intermedio', icon: '10', completedLessons: 0,
 skills: ['Armonía', 'Cruce de cuerdas', 'Fórmulas'],
 lessons: [
  arpeggioLesson('arpeggios-maj7', 'Arpegios Maj7'),
  arpeggioLesson('arpeggios-m7', 'Arpegios m7'),
  arpeggioLesson('arpeggios-dominant', 'Arpegio de dominante'),
  arpeggioLesson('arpeggios-half-diminished', 'Arpegio semidisminuido'),
  arpeggioLesson('arpeggios-harmonized', 'La escala armonizada', 'avanzado'),
 ],
});
moduleFixtures.find(module => module.id === 'licks-phrasing')!.lessons.push({
 id: 'licks-phrasing-yngwie-01', title: 'Sextillos neoclásicos en Si menor',
 type: 'practice', difficulty: 'avanzado', minutes: 8, xp: 80,
 description: '', goal: '', tempo: { min: 40, max: 160 }, rounds: 1,
});
// Sustituye las fichas provisionales del módulo por sus estudios completos.
for (const module of moduleFixtures) {
 if (module.id === 'fingering') module.completedLessons = 0;
 for (const lesson of module.lessons) {
  const study = practiceStudies[lesson.id];
  if (lesson.type !== 'practice' || !study) continue;
  lesson.description = study.description;
  lesson.goal = study.goal;
  lesson.artist = study.artist;
  lesson.tempo = { min: 40, max: lesson.difficulty === 'base' ? 100 : lesson.difficulty === 'intermedio' ? 120 : 160 };
  delete lesson.record;
 }
}
export const courses = moduleFixtures.map(module => ({
 ...module,
 available: ['recommendations', 'fingering', 'arpeggios', 'licks-phrasing'].includes(module.id),
 level: difficultyRange(module.lessons, module.level),
 difficulties: DIFFICULTY_ORDER.filter(level => module.lessons.some(lesson => lesson.type === 'practice' && lesson.difficulty === level)),
 image: `/images/modules/${module.id}.webp`,
 lessonCount: module.lessons.length,
 progress: Math.round(module.completedLessons / module.lessons.length * 100),
// Orden estable: disponibles primero; cada grupo conserva el orden del temario.
})).sort((a, b) => Number(b.available) - Number(a.available));
export const routines = [
 { id: 'warmup', title: 'Calentar', duration: '5–10 min', description: 'Patrones sencillos, movimientos cómodos y pausas breves.', moduleId: 'fingering' },
 { id: 'maintenance', title: 'Mantenerme en forma', duration: '15–20 min', description: 'Trabaja digitación, coordinación y limpieza.', moduleId: 'fingering' },
 { id: 'focus', title: 'Mejorar una técnica', duration: 'A tu medida', description: 'Elige una habilidad y concentra tu sesión.', moduleId: 'legato' },
];


/** Velocidades fijas (BPM con notas en corcheas). Los nombres describen la exigencia del ejercicio, no el nivel de quien toca. Cada lección acota su rango con `tempo.min` / `tempo.max`. */
export const tempos = [
 { bpm: 40, name: 'Base' },
 { bpm: 60, name: 'Estable' },
 { bpm: 80, name: 'Fluido' },
 { bpm: 100, name: 'Intenso' },
 { bpm: 120, name: 'Exigente' },
 { bpm: 140, name: 'Muy exigente' },
 { bpm: 160, name: 'Extremo' },
] as const;
export const tempoName = (bpm: number) => tempos.find(tempo => tempo.bpm === bpm)?.name ?? `${bpm} BPM`;
