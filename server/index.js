import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/ai/suggest", async (req, res) => {
  const { answers = {}, mine = {} } = req.body;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ ok: false, error: "OPENAI_API_KEY not set on server" });

  const prompt = `You are an expert environmental auditor. Given the mine metadata ${JSON.stringify(mine)} and the answers ${JSON.stringify(answers)}, return only valid JSON in this exact format:
{"moduleScores": {"Module I": 12, "Module II": 10, "Module III": 8, "Module IV": 30, "Module V": 20}, "notes": {"Module I":"short note"}}`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: "Return only JSON. Do not include extra text." }, { role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    const status = r.status;
    const text = await r.text();
    console.log("OpenAI status:", status);
    console.log("OpenAI raw response (truncated):", text.slice(0, 2000));

    if (!text || !text.trim()) return res.status(502).json({ ok: false, error: "Empty response from OpenAI", raw: text });

    try {
      const parsed = JSON.parse(text);
      return res.json({ ok: true, ai: parsed, raw: text });
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          const parsed = JSON.parse(m[0]);
          return res.json({ ok: true, ai: parsed, raw: text });
        } catch (err2) {
          console.error("JSON parse after extraction failed", err2);
          return res.status(502).json({ ok: false, error: "Failed to parse JSON from AI response", raw: text });
        }
      }
      return res.status(502).json({ ok: false, error: "AI returned non-JSON response", raw: text });
    }
  } catch (error) {
    console.error("AI proxy error", error);
    return res.status(500).json({ ok: false, error: String(error) });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`AI proxy listening on ${PORT}`));