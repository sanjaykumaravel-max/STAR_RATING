import axios from "axios";

export async function suggestScores(answers = {}, mine = {}) {
  const resp = await fetch("/api/ai/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, mine }),
  });
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    return { ok: false, error: "Invalid JSON from server", raw: text, status: resp.status };
  }
}

export default { suggestScores };