// Tablaturas escritas en alphaTex (src/data/tabs/*.alphatex) → datos de la app (src/data/tabs/tabs.generated.ts).
// alphaTab solo se usa aquí, al generar: la app nunca lo carga. `npm run tabs` regenera; `--check` falla si el
// archivo generado no coincide con los .alphatex (lo usa el test).
import * as alphaTab from '@coderline/alphatab';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('../src/data/tabs/', import.meta.url));
const OUT = `${DIR}tabs.generated.ts`;
const TICKS_PER_BEAT = 960;

/**
 * Un .alphatex → compases de notas: cuerda (1 = la más aguda), traste, duración en pulsos, tap, slide desde la nota anterior,
 * hammer-on/pull-off desde la anterior (`legato`), bend (semitonos que sube, con `release` si vuelve y `prebend` si ya
 * empieza estirada), vibrato y silencios
 * (`rest`, cuerda 0).
 */
export function parseTab(text) {
    const score = alphaTab.importer.ScoreLoader.loadAlphaTex(text, new alphaTab.Settings());
    const staff = score.tracks[0].staves[0];
    const strings = staff.tuning.length;
    let slideIn = false;
    return staff.bars.map(bar => bar.voices[0].beats.flatMap(beat => {
        const beats = beat.playbackDuration / TICKS_PER_BEAT;
        if (beat.isRest) { slideIn = false; return [{ string: 0, fret: 0, beats, rest: true }]; }
        return beat.notes.map(note => {
            const parsed = { string: strings + 1 - note.string, fret: note.fret, beats };
            if (beat.tap) parsed.tap = true;
            if (slideIn) parsed.slide = true;
            if (note.isHammerPullDestination) parsed.legato = true;
            // Puntos del bend en cuartos de tono: el más alto es hasta dónde sube; si el último baja, hay release.
            const points = note.bendPoints ?? [];
            if (points.length) {
                const top = Math.max(...points.map(point => point.value));
                parsed.bend = top / 2;
                if (points.at(-1).value < top) parsed.release = true;
                if (points[0].value > 0) parsed.prebend = true;
            }
            if (note.vibrato) parsed.vibrato = true;
            slideIn = note.slideOutType !== 0;
            return parsed;
        });
    }));
}

export function generate() {
    const files = readdirSync(DIR).filter(file => file.endsWith('.alphatex')).sort();
    const tabs = Object.fromEntries(files.map(file => [file.replace('.alphatex', ''), parseTab(readFileSync(DIR + file, 'utf8'))]));
    return `// Generado por scripts/tabs.mjs desde los .alphatex de esta carpeta: no lo edites a mano (npm run tabs).\n`
        + `import type { PatternNote } from '@/lib/audio/practiceRound';\n\n`
        + `export const TABS: Record<string, PatternNote[][]> = ${JSON.stringify(tabs)};\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const code = generate();
    if (process.argv.includes('--check')) {
        if (readFileSync(OUT, 'utf8') !== code) { console.error('tabs.generated.ts no coincide con los .alphatex: corre npm run tabs'); process.exit(1); }
    } else writeFileSync(OUT, code);
}
