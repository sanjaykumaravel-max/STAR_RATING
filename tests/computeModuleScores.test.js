import { computeModuleScores } from "../src/utils/computeModuleScores";

test("computeModuleScores basic", () => {
  const answers = { facilities: "3", waste: "3", fencing: "3", rejects: "3", dumpyard: "3", agriculture: "3", water: "5", energy: "4" };
  const m = computeModuleScores(answers);
  expect(m["Module I"]).toBe(15);
  expect(m["Module II"]).toBe(12);
});