'use client';

import { useMemo, useState } from 'react';
import { ROUTES, moduleUrl, practiceUrl } from '@/lib/routes';
import { Check, LogIn, Play, Target } from 'lucide-react';
import { Link, useHydrated } from '@/lib/router';
import { Badge, Eyebrow, LinkButton, SectionTitle } from '@/components/ui';
import { courses, type PracticeLesson } from '@/data/questMock';
import { useLastExercise } from '@/lib/progress';
import { levelLabel, planFor, suggestion, useAccount } from '@/lib/account';

export default function HomePage() {
 // Con sesión: el último ejercicio practicado; si aún no hay ninguno, el que sigue en su plan. Sin sesión: el último abierto.
 const account = useAccount();
 // Lo que depende de la sesión espera a la hidratación (en el HTML estático aún no se sabe quién eres).
 const hydrated = useHydrated();
 const plan = account ? suggestion(account) : null;
 const opened = useLastExercise();
 const practicedId = account?.lastPractice?.lessonId;
 const practicedModule = practicedId ? courses.find(course => course.lessons.some(lesson => lesson.id === practicedId)) : undefined;
 const last = practicedModule ? { moduleId: practicedModule.id, exerciseId: practicedId } : plan ? { moduleId: plan.next.moduleId, exerciseId: plan.next.lesson.id } : opened;
 const isPractice = (lesson: { type: string }): lesson is PracticeLesson => lesson.type === 'practice';
 const remembered = courses.find(course => course.id === last?.moduleId);
 const currentModule = remembered?.lessons.some(lesson => lesson.id === last?.exerciseId) ? remembered : courses.find(course => course.id === 'fingering')!;
 const lastLesson = currentModule.lessons.filter(isPractice).find(lesson => lesson.id === last?.exerciseId) ?? currentModule.lessons.filter(isPractice)[0];
 // 12 ejercicios al azar de los módulos de tu nivel (sin nivel: base). Se barajan tras hidratar para no chocar con el HTML estático.
 const level = hydrated ? account?.level ?? null : null;
 const [seed] = useState(() => 1 + Math.floor(Math.random() * 2147483646));
 const levelLessons = useMemo(() => {
  let state = seed;
  const random = () => (state = (state * 48271) % 2147483647) / 2147483647;
  const all = planFor(level ?? 'base').flatMap(block => block.lessons.map(lesson => ({ lesson, moduleId: block.moduleId, moduleTitle: block.title })));
  if (hydrated) for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  return all.slice(0, 12);
 }, [level, hydrated, seed]);
 return <>
  <div className="mb-6 flex items-start justify-between gap-4 md:mb-7 lg:items-center">
   <div>
    <Eyebrow>TU GIMNASIO DE GUITARRA</Eyebrow>
    <h1 className="mt-2 mb-2.5 max-w-95 text-[1.625rem] xs:text-[1.75rem] md:max-w-none md:text-[clamp(1.5625rem,2.05vw,2.125rem)]">Mantén tus manos en forma<span className="text-accent">.</span></h1>
    <p className="max-w-78 text-sm leading-relaxed text-muted md:max-w-none md:text-base">Para guitarristas que ya tocan. Entrena coordinación, limpieza y control.</p>
   </div>
   <Badge className="hidden sm:inline-flex">ENTRENAMIENTO TÉCNICO</Badge>
  </div>

  {/* Sin sesión: invitación destacada a entrar (plan según tu nivel + progreso guardado). */}
  {hydrated && !account && <section className="relative mb-5 overflow-hidden rounded-xl border border-brand/50 bg-linear-120 from-brand/25 via-brand/8 to-transparent p-5 md:p-6">
   <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-10 size-64 rounded-full bg-brand/30 blur-3xl"/>
   <div className="relative flex flex-wrap items-center justify-between gap-5">
    <div className="max-w-2xl">
     <h2 className="text-xl md:text-2xl">Entra y entrena con un plan hecho para ti</h2>
     <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-fg-soft">
      {['Plan según tu nivel', 'Tu progreso guardado', 'Tu lugar en la comunidad'].map(item => <li key={item} className="flex items-center gap-1.5"><Check size={15} className="text-success"/>{item}</li>)}
     </ul>
    </div>
    <Link to={ROUTES.login} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-linear-135 from-brand to-brand-strong px-6 font-bold text-white shadow-[0_8px_30px_#e0662f55] transition hover:-translate-y-0.5"><LogIn size={18}/>Entrar gratis</Link>
   </div>
  </section>}

  <div>
   <section className="relative flex min-h-97 items-center overflow-hidden rounded-xl border border-line-strong bg-[radial-gradient(ellipse_at_85%_30%,#e0662f26,transparent_55%),linear-gradient(120deg,#24201c,#191817_55%,#111111)] 2xl:min-h-105">
    <img src={currentModule.image} alt="" width={960} height={640} fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[65%_center] xs:left-[25%] xs:w-3/4"/>
    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,#191817f5_0%,#191817e6_38%,#19181780_65%,#19181720_100%)] max-xs:bg-[#191817cc]"/>
    <div className="relative z-10 w-full max-w-180 p-6 xs:w-[80%] xs:p-7 lg:w-[80%] lg:p-8 xl:w-[85%] xl:p-6.5 2xl:w-[75%] 2xl:p-10">
     <p className="mb-2 text-3xs tracking-[0.2em] text-accent">{practicedModule ? 'TU ÚLTIMO EJERCICIO' : plan ? `TU PLAN · 1 DE ${plan.total}` : currentModule.title.toUpperCase()}</p>
     <h2 className="text-4xl leading-[1.08] font-black tracking-tighter xs:text-[2.375rem] lg:text-[2.5rem] xl:text-[2.3125rem] 2xl:text-[clamp(1.8125rem,3vw,2.9375rem)]">{lastLesson.title}</h2>
     <p className="mt-3.5 max-w-2xl text-sm leading-relaxed text-fg-soft md:text-base">{lastLesson.description}</p>
     <div className="mt-6 mb-4.5"/>
     <div className="flex flex-wrap items-center gap-3">
      <LinkButton to={practiceUrl(currentModule.id, lastLesson.id)}><Play size={17} fill="currentColor"/>Empezar a practicar</LinkButton>
      {practicedModule && plan && plan.next.lesson.id !== lastLesson.id && <LinkButton to={practiceUrl(plan.next.moduleId, plan.next.lesson.id)} variant="secondary">Sigue en tu plan: {plan.next.lesson.title}</LinkButton>}
     </div>
     {account && !account.level && <p className="mt-4 text-xs text-muted"><Link to={ROUTES.login} className="text-accent hover:underline">Elige tu nivel</Link> para tener tu plan.</p>}
    </div>
   </section>
  </div>

  <SectionTitle title={level ? `Para tu nivel · ${levelLabel(level)}` : 'Lecciones para empezar'} to={ROUTES.exercises} label="Ver todos los ejercicios" className="mt-7 mb-4"/>
  <div className="mb-7.5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{levelLessons.map(({ lesson, moduleId, moduleTitle }) =>
   <Link key={lesson.id} to={practiceUrl(moduleId, lesson.id)} className="flex flex-col rounded-lg border border-line bg-card p-4 transition hover:-translate-y-0.5 hover:border-accent/60">
    <div className="flex flex-1 flex-col">
     <p className="text-3xs tracking-[0.15em] text-accent">{moduleTitle.toUpperCase()}</p>
     <h3 className="mt-1 flex-1 text-sm leading-snug font-bold md:text-base">{lesson.title}</h3>
     <span className="mt-3 block text-2xs text-muted">{lesson.minutes} min · {levelLabel(lesson.difficulty)}</span>
    </div>
   </Link>)}
  </div>



  <section className="mt-7.5 flex flex-wrap items-center gap-4 rounded-lg border border-line bg-card p-5 md:p-6.5 lg:flex-nowrap lg:gap-6">
   <div className="hidden size-12 shrink-0 place-items-center rounded-full border border-[#aa7b4766] bg-[#d99a2010] text-gold drop-shadow-[0_0_8px_#eab14a22] xs:grid md:size-16"><Target size={34}/></div>
   <div className="flex-1">
    <Eyebrow>ENTRENA CON INTENCIÓN</Eyebrow>
    <h2 className="my-1.5 text-[1.0625rem] xs:text-lg xl:text-[1.3125rem]">La velocidad llega con el control.</h2>
    <p className="text-xs leading-relaxed text-muted">Repite patrones cómodos, observa la limpieza y descansa entre series.</p>
   </div>
   <LinkButton to={moduleUrl('fingering')} variant="secondary" className="max-md:w-full md:max-lg:ml-19 lg:ml-auto">Ver digitación y coordinación</LinkButton>
  </section>
 </>;
}
