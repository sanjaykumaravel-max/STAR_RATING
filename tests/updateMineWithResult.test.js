import { getMines, saveMines, updateMineWithResult } from "../src/storage";

beforeEach(() => {
  localStorage.clear();
});

test("updateMineWithResult by id updates lastResult", () => {
  const initial = [{ id: "m1", name: "TestMine", scores: {} }];
  saveMines(initial);
  const updated = updateMineWithResult("m1", { score: 10, totalPoints: 100, moduleScores: { "Module I": 10 } });
  const mines = getMines();
  expect(mines.length).toBe(1);
  expect(mines[0].lastResult.score).toBe(10);
});