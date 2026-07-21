import { computeModuleScores } from "../src/utils/computeModuleScores";

describe("computeModuleScores", () => {
  test("calculates the supplied module values", () => {
    const answers = {
      facilities: "3",
      waste: "3",
      fencing: "3",
      rejects: "3",
      dumpyard: "3",
      agriculture: "3",
      water: "5",
      energy: "4",
    };

    const scores = computeModuleScores(answers);

    expect(scores["Module I"]).toBe(15);
    expect(scores["Module II"]).toBe(12);
    expect(scores["Module III"]).toBe(0);
    expect(scores["Module IV"]).toBe(0);
    expect(scores["Module V"]).toBe(0);
  });

  test("supports named ratings and treats invalid input as zero", () => {
    const scores = computeModuleScores({
      facilities: "high",
      waste: "medium",
      fencing: "2",
      rejects: "not-a-number",
      infrastructure: "high",
      greenBelt: "medium",
      ppeWorkers: "medium",
      explosives: "high",
    });

    expect(scores["Module I"]).toBe(10);
    expect(scores["Module IV"]).toBe(8);
    expect(scores["Module V"]).toBe(8);
  });
});
