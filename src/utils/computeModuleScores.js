export function computeModuleScores(answers = {}) {
  const toNumber = (v) => {
    if (v === "high") return 5;
    if (v === "medium") return 3;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const m1 = toNumber(answers.facilities) + toNumber(answers.waste) + toNumber(answers.fencing) + toNumber(answers.rejects) + toNumber(answers.dumpyard);
  const m2 = toNumber(answers.agriculture) + toNumber(answers.water) + toNumber(answers.energy);
  const m3 = toNumber(answers.equipment) + toNumber(answers.compliance) + toNumber(answers.safety) + toNumber(answers.vibration);
  const infra = answers.infrastructure === "high" ? 5 : answers.infrastructure === "medium" ? 3 : toNumber(answers.infrastructure);
  const m4 = infra + toNumber(answers.greenBelt) + toNumber(answers.greenExpenditure) + toNumber(answers.monitoring) + toNumber(answers.cer) + toNumber(answers.cerExpenditure) + toNumber(answers.rainwater) + toNumber(answers.ecoPark) + toNumber(answers.ecoRestoration);
  const m5 = toNumber(answers.ppeWorkers) + toNumber(answers.explosives) + toNumber(answers.nonExplosive) + toNumber(answers.pme) + toNumber(answers.it) + toNumber(answers.hazardous) + toNumber(answers.dustSuppression) + toNumber(answers.rescue);

  return {
    "Module I": m1,
    "Module II": m2,
    "Module III": m3,
    "Module IV": m4,
    "Module V": m5,
  };
}

export default computeModuleScores;