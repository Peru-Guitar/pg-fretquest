import { describe, expect, it } from "vitest";
import { timeLabel, weeklyHoursOf } from "@/lib/domain/weeklyGoal";

describe("weeklyHoursOf", () => {
  it("devuelve la meta guardada", () => {
    expect(weeklyHoursOf({ weeklyHours: 7 })).toBe(7);
  });

  it("sin meta válida devuelve undefined", () => {
    expect(weeklyHoursOf({})).toBeUndefined();
    expect(weeklyHoursOf({ weeklyHours: 2 })).toBeUndefined();
  });
});

describe("timeLabel", () => {
  it.each([
    [0, "0 min"], [59, "0 min"], [1500, "25 min"], [3599, "59 min"], [3600, "1 h"], [4800, "1 h 20 min"], [10799, "2 h 59 min"], [10800, "3 h"],
  ])("%i s → %s", (seconds, label) => {
    expect(timeLabel(seconds)).toBe(label);
  });
});
