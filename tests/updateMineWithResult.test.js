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

test("returns an empty list when stored mine data is invalid", () => {
  localStorage.setItem("mines", "not valid JSON");

  expect(getMines()).toEqual([]);
});

test("merges scores and proofs when updating by numeric index", () => {
  saveMines([
    {
      id: "m1",
      name: "Test Mine",
      scores: { "Module I": 10 },
      proofs: { facilities: { name: "existing.jpg" } },
    },
  ]);

  updateMineWithResult(0, {
    score: 50,
    totalPoints: 100,
    moduleScores: { "Module II": 12 },
    proofs: { water: { name: "new.jpg" } },
  });

  const [mine] = getMines();
  expect(mine.name).toBe("Test Mine");
  expect(mine.scores).toEqual({ "Module I": 10, "Module II": 12 });
  expect(mine.proofs).toEqual({ facilities: { name: "existing.jpg" }, water: { name: "new.jpg" } });
  expect(mine.lastResult.percentage).toBe("50.00");
});
