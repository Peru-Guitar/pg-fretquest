import { describe, expect, it } from "vitest";
import { MAX_LEVEL, MAX_LEVEL_HOURS, RANKS } from "@/data/ranks";
import { LEVELS, levelFromSeconds, rankLevels } from "@/lib/ranks";

describe("ranks", () => {
  it("builds levels 1..MAX_LEVEL with growing minutes", () => {
    expect(LEVELS.map(l => l.level)).toEqual(Array.from({ length: MAX_LEVEL }, (_, i) => i + 1));
    for (let i = 1; i < LEVELS.length; i++) expect(LEVELS[i].minutes).toBeGreaterThan(LEVELS[i - 1].minutes);
    expect(LEVELS.at(-1)!.minutes).toBe(MAX_LEVEL_HOURS * 60);
  });

  it("starts each rank at its declared level and hours", () => {
    for (const rank of RANKS) {
      const level = LEVELS[rank.fromLevel - 1];
      expect(level.rank).toBe(rank);
      expect(level.minutes).toBe(rank.hours * 60);
    }
    expect(rankLevels(RANKS[0])).toEqual({ from: 1, to: 5 });
    expect(rankLevels(RANKS.at(-1)!)).toEqual({ from: 42, to: 50 });
  });

  it("computes level from practiced seconds", () => {
    expect(levelFromSeconds(0)).toMatchObject({ level: 1, progress: 0 });
    expect(levelFromSeconds(2 * 3600)).toMatchObject({ level: 6, rank: RANKS[1] });
    expect(levelFromSeconds(149.9 * 3600).rank).toBe(RANKS[6]);
    expect(levelFromSeconds(10_000 * 3600)).toMatchObject({ level: 50, next: null, progress: 1 });
  });
});
