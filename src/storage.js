export function getMines() {
  try {
    return JSON.parse(localStorage.getItem("mines")) || [];
  } catch {
    return [];
  }
}

export function saveMines(mines) {
  try {
    localStorage.setItem("mines", JSON.stringify(mines));
  } catch (e) {
    console.error("saveMines failed", e);
  }
}

/**
 * Update or append a mine with a result.
 * mineId may be:
 *  - a numeric index
 *  - a string id
 *  - an object { id?, name?, linNumber? } or the full mine object
 */
export function updateMineWithResult(mineId, result) {
  const mines = getMines();

  // determine index
  let idx = -1;
  if (typeof mineId === "number") {
    idx = mineId >= 0 && mineId < mines.length ? mineId : -1;
  } else if (typeof mineId === "string") {
    idx = mines.findIndex((m) => String(m.id || "") === String(mineId));
  } else if (mineId && typeof mineId === "object") {
    // if id provided, match by id first
    if (mineId.id) {
      idx = mines.findIndex((m) => String(m.id || "") === String(mineId.id));
    }
    if (idx === -1) {
      const idName = (mineId.name || "").trim();
      const idLin = (mineId.linNumber || "").trim();
      idx = mines.findIndex((m) => {
        const sameLin = idLin ? String(m.linNumber || "").trim() === idLin : false;
        const sameName = idName ? String(m.name || "").trim() === idName : false;
        return idLin ? sameLin || sameName : sameName;
      });
    }
  }

  // moduleScores incoming
  const moduleScores = result.moduleScores || result.scores || {};

  // compute numbers
  const scoreVal = Number(result.score ?? null);
  const totalVal = Number(result.totalPoints ?? null);
  const percentage =
    result.percentage ??
    (Number.isFinite(scoreVal) && Number.isFinite(totalVal) && totalVal > 0
      ? ((scoreVal / totalVal) * 100).toFixed(2)
      : result.percentage ?? null);

  const lastResult = {
    score: scoreVal,
    totalPoints: totalVal,
    percentage,
    date: new Date().toISOString(),
  };

  const incomingProofs = result.proofs || {};
  const existingMine = idx >= 0 ? mines[idx] : null;
  const existingProofs = existingMine?.proofs || {};
  const proofs = { ...existingProofs, ...incomingProofs };

  // preserve existing fields, then overwrite scores/proofs/lastResult
  const newMine = {
    ...(existingMine || {}),
    // if mineId supplied with name/linNumber and no existing mine, use those values
    ...(existingMine ? {} : { name: mineId?.name || "", linNumber: mineId?.linNumber || "", id: mineId?.id || undefined }),
    // merge scores (existing first, incoming overrides)
    scores: { ...(existingMine?.scores || {}), ...(moduleScores || {}) },
    proofs,
    lastResult,
  };

  let newMines;
  if (idx >= 0) {
    newMines = [...mines];
    newMines[idx] = { ...newMines[idx], ...newMine };
  } else {
    // ensure id for new mine isn't undefined — create a simple timestamp id if not provided
    if (!newMine.id) newMine.id = `mine_${Date.now()}`;
    newMines = [...mines, newMine];
  }

  saveMines(newMines);
  return newMines;
}