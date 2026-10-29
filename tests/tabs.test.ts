import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { generate } from "../scripts/tabs.mjs";
import { FIGURES, practiceStudies } from "@/data/practiceStudies";
import { TABS } from "@/data/tabs/tabs.generated";

describe("tablaturas en alphaTex", () => {
  it("tabs.generated.ts está al día con los .alphatex (npm run tabs)", () => {
    expect(readFileSync("src/data/tabs/tabs.generated.ts", "utf8")).toBe(generate());
  });

  it("cada tablatura es de una lección y suena igual que en el estudio", () => {
    for (const [id, bars] of Object.entries(TABS)) {
      const study = practiceStudies[id];
      expect(study, id).toBeDefined();
      const beats = (note: { beats?: number }) => note.beats ?? 1 / FIGURES[study.figure].notesPerBeat;
      expect(study.pattern.map(beats), id).toEqual(bars.flat().map(note => note.beats));
    }
  });
});
