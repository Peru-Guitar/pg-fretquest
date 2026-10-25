const FACE_TONES = ['bg-[#7a2e26]', 'bg-[#7a5a1f]', 'bg-[#2b4f6e]', 'bg-[#2f5e38]', 'bg-[#4f3473]', 'bg-[#733445]'];
/** Color estable por usuario (mismo en Comunidad y Analytics). */
export const toneOf = (uid: string) => FACE_TONES[[...uid].reduce((sum, char) => sum + char.charCodeAt(0), 0) % FACE_TONES.length];
export const initials = (name: string) => name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
