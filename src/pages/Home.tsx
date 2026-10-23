import { Clock3, Play, Target } from 'lucide-react';
import { Link } from 'react-router';
import { GuitarArt } from '@/components/quest/QuestUI';
import { Badge, Eyebrow, LinkButton, SectionTitle } from '@/components/ui';
import { courses, routines, tempoName, type PracticeLesson } from '@/data/questMock';
import { DailyGoal } from '@/components/DailyGoal';

export default function HomePage() {
 const currentModule = courses.find(course => course.id === 'fingering')!;
 const lastLesson = currentModule.lessons[1] as PracticeLesson;
 return <>
  <div className="mb-6 flex items-start justify-between gap-4 md:mb-7 lg:items-center">
   <div>
    <Eyebrow>TU GIMNASIO DE GUITARRA</Eyebrow>
    <h1 className="mt-2 mb-2.5 max-w-95 text-[1.625rem] xs:text-[1.75rem] md:max-w-none md:text-[clamp(1.5625rem,2.05vw,2.125rem)]">Mantén tus manos en forma<span className="text-accent">.</span></h1>
    <p className="max-w-78 text-sm leading-relaxed text-muted md:max-w-none md:text-base">Para guitarristas que ya tocan. Entrena coordinación, limpieza y control.</p>
   </div>
   <Badge>ENTRENAMIENTO TÉCNICO</Badge>
  </div>

  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_255px] xl:grid-cols-[minmax(0,2.5fr)_minmax(250px,1fr)] xl:gap-5">
   <section className="relative min-h-97 overflow-hidden rounded-xl border border-[#385078] bg-[radial-gradient(ellipse_at_85%_30%,#50307b88,transparent_55%),linear-gradient(120deg,#151e32,#101d2d_55%,#0b1522)] 2xl:min-h-105">
    <GuitarArt layout="hero"/>
    <div className="relative z-10 w-full max-w-122 p-6 xs:w-[64%] xs:p-7 lg:w-[65%] lg:p-8 xl:w-3/4 xl:p-6.5 2xl:w-[65%] 2xl:p-10">
     <Badge>TU ÚLTIMA PRÁCTICA</Badge>
     <p className="mt-6.5 mb-2 text-3xs tracking-[0.2em] text-[#c3b7dc] 2xl:mt-9">{currentModule.title.toUpperCase()}</p>
     <h2 className="text-4xl leading-[1.08] font-black tracking-tighter xs:text-[2.375rem] lg:text-[2.5rem] xl:text-[2.3125rem] 2xl:text-[clamp(1.8125rem,3vw,2.9375rem)]">Más control.<br/>Menos esfuerzo.</h2>
     <p className="mt-3.5 max-w-57 text-sm leading-relaxed text-[#bfcae0] md:max-w-68">Coordina ambas manos con patrones cortos y ataques uniformes.</p>
     <div className="mt-6 mb-4.5 max-w-62 xs:max-w-71 2xl:mt-7.5">
      <span className="flex justify-between text-sm text-[#abbad2]">{lastLesson.title} <b className="text-success">Récord: {tempoName(lastLesson.record!)} · {lastLesson.record}</b></span>
     </div>
     <LinkButton to={`/practice/${currentModule.id}?exercise=${lastLesson.id}&modo=progreso`}><Play size={17} fill="currentColor"/>Entrenar de nuevo</LinkButton>
     <span className="mt-3 flex items-center gap-1 text-3xs text-[#abbad2]"><Clock3 size={13}/> Última vez: ayer · datos de ejemplo</span>
    </div>
   </section>

   <DailyGoal className="hidden lg:block"/>
  </div>

  <SectionTitle title="¿Qué necesitas entrenar hoy?" to="/train" label="Ver todo en Entrenar" className="mt-7 mb-4"/>
  <div className="mb-7.5 grid gap-3 md:grid-cols-3 xl:gap-4.5">{routines.map((routine, index) =>
   <Link key={routine.id} to={routine.id === 'focus' ? '/train' : `/practice/${routine.moduleId}?routine=${routine.id}&modo=progreso`} className="flex flex-col items-start rounded-xl border border-line bg-card p-6 transition hover:-translate-y-0.5 hover:border-[#8570db] md:p-5 xl:p-6.5">
    <Eyebrow>{String(index + 1).padStart(2, '0')} · {routine.duration}</Eyebrow>
    <h2 className="mt-3 text-[1.3125rem] md:text-[1.0625rem] xl:text-xl">{routine.title}</h2>
    <p className="mt-3 mb-5 flex-1 text-sm leading-relaxed text-muted">{routine.description}</p>
    <span className="text-xs text-accent">{routine.id === 'focus' ? 'Elegir técnica' : 'Ver rutina'} →</span>
   </Link>)}
  </div>



  <section className="mt-7.5 flex flex-wrap items-center gap-4 rounded-lg border border-[#59468677] bg-[radial-gradient(ellipse_at_left,#54319333,transparent_60%),linear-gradient(110deg,#19213b,#111d2c)] p-5 md:p-6.5 lg:flex-nowrap lg:gap-6">
   <div className="hidden size-12 shrink-0 place-items-center rounded-full border border-[#aa7b4766] bg-[#d99a2010] text-gold drop-shadow-[0_0_8px_#eab14a22] xs:grid md:size-16"><Target size={34}/></div>
   <div className="flex-1">
    <Eyebrow>ENTRENA CON INTENCIÓN</Eyebrow>
    <h2 className="my-1.5 text-[1.0625rem] xs:text-lg xl:text-[1.3125rem]">La velocidad llega con el control.</h2>
    <p className="text-xs leading-relaxed text-muted">Repite patrones cómodos, observa la limpieza y descansa entre series.</p>
   </div>
   <LinkButton to="/modules/alternate-picking" variant="secondary" className="max-md:w-full md:max-lg:ml-19 lg:ml-auto">Ver alternate picking</LinkButton>
  </section>
 </>;
}
