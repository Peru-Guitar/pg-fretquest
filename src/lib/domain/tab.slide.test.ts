import { expect, test } from "vitest";
import { parseTab } from "./tab";

test("slides y armónicos", () => {
  const { rows } = parseTab("e|----------|\nB|----------|\nG|-5/7-7\\5-<12>-|");
  const g = rows[0].notes;
  expect(g.map((n) => [n.fret, n.slideTo, !!n.slid, !!n.harmonic])).toEqual([
    [5, 7, false, false], [7, undefined, true, false], [7, 5, false, false], [5, undefined, true, false], [12, undefined, false, true],
  ]);
});
