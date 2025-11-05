import React, { useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, ImageRun } from "docx";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ---------- STAR RATING LOGIC ----------
function getStarRating(percentage) {
  if (percentage <= 25) return "No Rating";
  if (percentage > 25 && percentage < 50) return "⭐";
  if (percentage >= 50 && percentage < 60) return "⭐⭐";
  if (percentage >= 60 && percentage < 70) return "⭐⭐⭐";
  if (percentage >= 70 && percentage < 80) return "⭐⭐⭐⭐";
  if (percentage >= 80) return "⭐⭐⭐⭐⭐";
}

// ---------- LOGIN COMPONENT ----------
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  // Set your fixed credentials here
  const VALID_USERNAME = "sanjay";
  const VALID_PASSWORD = localStorage.getItem("appPassword") || "starrate";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setError("");
      localStorage.setItem("loggedInUser", username); // Save username locally
      onLogin(username);
    } else {
      setError("Invalid username or password.");
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setResetMsg("Password must be at least 4 characters.");
      return;
    }
    localStorage.setItem("appPassword", newPassword);
    setResetMsg("Password reset! Use your new password to login.");
    setShowReset(false);
  };

  return (
    <div style={styles.container}>
      <img src="/logo.png" alt="Logo" style={styles.logo} />
      <h2>Mine Star Rating Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
      </form>
      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      <button
        type="button"
        style={{ ...styles.button, background: "#ffc371", color: "#333", marginTop: 10 }}
        onClick={() => setShowReset(true)}
      >
        Forgot Password?
      </button>
      {showReset && (
        <form onSubmit={handleReset} style={{ marginTop: 20 }}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Reset Password</button>
          {resetMsg && <p style={{ color: "green", marginTop: 10 }}>{resetMsg}</p>}
        </form>
      )}
    </div>
  );
}

// ---------- DASHBOARD COMPONENT ----------
function Dashboard({ username, onLogout, onStartRating, mines, setMines }) {
  const [mine, setMine] = useState({
    name: "",
    owner: "",
    hectares: "",
    linNumber: "",
    leaseYear: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editScores, setEditScores] = useState(null);

  // Add missing logic for moduleNames and handlers
  const moduleNames = ["Module I", "Module II", "Module III", "Module IV", "Module V"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMine((prev) => ({ ...prev, [name]: value }));
  };

  const handleScoreChange = (mod, value) => {
    setEditScores((prev) => ({ ...prev, [mod]: value }));
  };

  const handleAddMine = () => {
    if (!mine.name || !mine.owner) {
      toast.error("Please fill all mine details!");
      return;
    }
    if (editIndex !== null) {
      const updatedMines = [...mines];
      updatedMines[editIndex] = { ...mine, scores: editScores };
      setMines(updatedMines);
      localStorage.setItem("mines", JSON.stringify(updatedMines));
      setEditIndex(null);
      setEditScores(null);
      setMine({ name: "", owner: "", hectares: "", linNumber: "", leaseYear: "" });
      toast.success("Mine updated!");
    } else {
      setMines([...mines, { ...mine }]);
      localStorage.setItem("mines", JSON.stringify([...mines, { ...mine }]));
      setMine({ name: "", owner: "", hectares: "", linNumber: "", leaseYear: "" });
      toast.success("Mine added!");
    }
  };

  return (
    <div style={styles.container}>
      <img src="/logo.png" alt="Logo" style={styles.logo} />
      <h2>Welcome, {username}</h2>
      <button onClick={onLogout} style={styles.button}>Logout</button>
      <h3>Add/Edit Mine Details</h3>
      <input
        type="text"
        name="name"
        placeholder="Mine Name"
        value={mine.name}
        onChange={handleChange}
        style={styles.input}
      />
      <input
        type="text"
        name="owner"
        placeholder="Owner Name"
        value={mine.owner}
        onChange={handleChange}
        style={styles.input}
      />
      <input
        type="number"
        name="hectares"
        placeholder="Hectares"
        value={mine.hectares}
        onChange={handleChange}
        style={styles.input}
      />
      <input
        type="text"
        name="linNumber"
        placeholder="LIN Number"
        value={mine.linNumber}
        onChange={handleChange}
        style={styles.input}
      />
      <input
        type="number"
        name="leaseYear"
        placeholder="Lease Year"
        value={mine.leaseYear}
        onChange={handleChange}
        style={styles.input}
      />
      {editIndex !== null && (
        <div style={{ background: "#fff4", padding: 16, borderRadius: 10, margin: "16px 0" }}>
          <h4>Edit Module Scores</h4>
          {moduleNames.map((mod, idx) => (
            <label key={mod}>
              {mod} Score:
              <input
                type="number"
                value={editScores?.[mod] || 0}
                min={0}
                max={mod === "Module I" ? 15 : mod === "Module II" ? 12 : mod === "Module III" ? 12 : mod === "Module IV" ? 33 : 28}
                onChange={e => handleScoreChange(mod, Number(e.target.value))}
                style={styles.input}
              />
            </label>
          ))}
        </div>
      )}

      <button onClick={handleAddMine} style={styles.button}>
        {editIndex !== null ? "Update Mine" : "Add Mine"}
      </button>
      {editIndex !== null && (
        <button
          onClick={() => {
            setMine({ name: "", owner: "", hectares: "", linNumber: "", leaseYear: "" });
            setEditIndex(null);
            setEditScores(null);
          }}
          style={{ ...styles.button, background: "#ccc", color: "#333", marginLeft: 10 }}
        >
          Cancel
        </button>
      )}
      <h3>Mine List</h3>
      <ul style={styles.list}>
        {mines.map((m, idx) => (
          <li key={idx} style={styles.listItem}>
            <span>
              <strong>{m.name}</strong> ({m.owner}) - {m.hectares} ha
            </span>
            <span>
              <button
                style={{ ...styles.button, padding: "6px 12px", fontSize: "0.9rem" }}
                onClick={() => onStartRating(m)}
              >
                Rate
              </button>
              <button
                style={{ ...styles.button, background: "#ffc371", color: "#333", marginLeft: 8, padding: "6px 12px", fontSize: "0.9rem" }}
                onClick={() => {
                  setMine(m);
                  setEditIndex(idx);
                  setEditScores(m.scores || {});
                }}
              >
                Edit
              </button>
              <button
                style={{ ...styles.button, background: "#ff5f6d", color: "#fff", marginLeft: 8, padding: "6px 12px", fontSize: "0.9rem" }}
                onClick={() => {
                  const updatedMines = mines.filter((_, i) => i !== idx);
                  setMines(updatedMines);
                  localStorage.setItem("mines", JSON.stringify(updatedMines));
                  toast.success("Mine deleted!");
                }}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- RATING PAGE COMPONENT ----------
function RatingPage({ mine, onBack, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const totalPoints = 100;

  const handleChange = (param, value) => {
    setAnswers({ ...answers, [param]: value });
  };

  // ----------- SCORING FUNCTION -----------
  const calculateScore = () => {
    let score = 0;
    if (answers.facilities) score += parseInt(answers.facilities);
    if (answers.waste) score += parseInt(answers.waste);
    if (answers.fencing) score += parseInt(answers.fencing);
    if (answers.rejects) score += parseInt(answers.rejects);
    if (answers.dumpyard) score += parseInt(answers.dumpyard);
    if (answers.agriculture) score += parseInt(answers.agriculture);
    if (answers.water) score += parseInt(answers.water);
    if (answers.energy) score += parseInt(answers.energy);
    if (answers.equipment) score += parseInt(answers.equipment);
    if (answers.compliance) score += parseInt(answers.compliance);
    if (answers.safety) score += parseInt(answers.safety);
    if (answers.vibration) score += parseInt(answers.vibration);
    if (answers.infrastructure) {
      if (answers.infrastructure === "high") score += 5;
      else if (answers.infrastructure === "medium") score += 3;
    }
    if (answers.greenBelt) score += parseInt(answers.greenBelt);
    if (answers.greenExpenditure) score += parseInt(answers.greenExpenditure);
    if (answers.monitoring) score += parseInt(answers.monitoring);
    if (answers.cer) score += parseInt(answers.cer);
    if (answers.cerExpenditure) score += parseInt(answers.cerExpenditure);
    if (answers.rainwater) score += parseInt(answers.rainwater);
    if (answers.ecoPark) score += parseInt(answers.ecoPark);
    if (answers.ecoRestoration) score += parseInt(answers.ecoRestoration);
    if (answers.ppeWorkers) score += parseInt(answers.ppeWorkers);
    if (answers.explosives) score += parseInt(answers.explosives);
    if (answers.nonExplosive) score += parseInt(answers.nonExplosive);
    if (answers.pme) score += parseInt(answers.pme);
    if (answers.it) score += parseInt(answers.it);
    if (answers.hazardous) score += parseInt(answers.hazardous);
    if (answers.dustSuppression) score += parseInt(answers.dustSuppression);
    if (answers.rescue) score += parseInt(answers.rescue);
    return score;
  };

  return (
    <div style={styles.container}>
      <img src="/logo.png" alt="Logo" style={styles.logo} />
      <h2>Star Rating for {mine.name}</h2>
      <button onClick={onBack} style={styles.button}>Back</button>
      {/* ---------- RATING FORM ---------- */}
      <h3>Module I: Construction, Operation or Decommissioning (15 pts)</h3>
      <label>
        Facilities for storage (Yes:3, No:0)
        <select onChange={(e) => handleChange("facilities", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Waste/effluent treatment (Yes:3, No:0)
        <select onChange={(e) => handleChange("waste", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Fencing done (Yes:3, No:0)
        <select onChange={(e) => handleChange("fencing", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Rejects properly stacked (Yes:3, No:0)
        <select onChange={(e) => handleChange("rejects", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Separate dump yard (Yes:3, No:0)
        <select onChange={(e) => handleChange("dumpyard", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <h3>Module II: Use of Natural Resources (12 pts)</h3>
      <label>
        Land used for agriculture (Yes:3, No:0)
        <select onChange={(e) => handleChange("agriculture", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Water source & competing users
        <select onChange={(e) => handleChange("water", e.target.value)}>
          <option value="0">≤50% / NA</option>
          <option value="3">50–80%</option>
          <option value="5">80–100%</option>
        </select>
      </label>
      <label>
        Energy type
        <select onChange={(e) => handleChange("energy", e.target.value)}>
          <option value="0">Diesel</option>
          <option value="2">Electricity</option>
          <option value="4">Solar</option>
        </select>
      </label>
      <h3>Module III: Noise, Vibration, Emissions, Risks (12 pts)</h3>
      <label>
        Equipment within permissible limits (Yes:3, No:0)
        <select onChange={(e) => handleChange("equipment", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Compliance reporting (MoEFCC/SPCB) (Yes:3, No:0)
        <select onChange={(e) => handleChange("compliance", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Mine safety precautions (Yes:3, No:0)
        <select onChange={(e) => handleChange("safety", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Whole body vibration test (Yes:3, No:0)
        <select onChange={(e) => handleChange("vibration", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <h3>Module IV: Cumulative Impacts & Environmental Activities (33 pts)</h3>
      <label>
        Development of infrastructure
        <select onChange={(e) => handleChange("infrastructure", e.target.value)}>
          <option value="0">≤50%</option>
          <option value="3">50–80%</option>
          <option value="high">80–100%</option>
        </select>
      </label>
      <label>
        Green belt development (Yes:3, No:0)
        <select onChange={(e) => handleChange("greenBelt", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Expenditure on green belt (1–5)
        <select onChange={(e) => handleChange("greenExpenditure", e.target.value)}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </label>
      <label>
        Environment Monitoring Programme (Yes:3, No:0)
        <select onChange={(e) => handleChange("monitoring", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Corporate Environmental Responsibility (Yes:3, No:0)
        <select onChange={(e) => handleChange("cer", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Expenditure on CER (1–5)
        <select onChange={(e) => handleChange("cerExpenditure", e.target.value)}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </label>
      <label>
        Rainwater harvesting maintained (Yes:3, No:0)
        <select onChange={(e) => handleChange("rainwater", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Eco-parks nearby (Yes:3, No:0)
        <select onChange={(e) => handleChange("ecoPark", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Eco-restoration/closure plan (Yes:3, No:0)
        <select onChange={(e) => handleChange("ecoRestoration", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <h3>Module V: Health, Safety & Welfare of Workers (28 pts)</h3>
      <label>
        PPE provided to workers (Yes:3, No:0)
        <select onChange={(e) => handleChange("ppeWorkers", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Explosives stored as per MMDR Act (NA:3, Yes:0, No:0)
        <select onChange={(e) => handleChange("explosives", e.target.value)}>
          <option value="0">Yes / No</option>
          <option value="3">NA</option>
        </select>
      </label>
      <label>
        Non-explosive techniques used (Yes:4, No:0)
        <select onChange={(e) => handleChange("nonExplosive", e.target.value)}>
          <option value="0">No</option>
          <option value="4">Yes</option>
        </select>
      </label>
      <label>
        PME for workers
        <select onChange={(e) => handleChange("pme", e.target.value)}>
          <option value="0">≤50%</option>
          <option value="1">50–100%</option>
          <option value="3">100%</option>
        </select>
      </label>
      <label>
        IT initiatives (Yes:3, No:0)
        <select onChange={(e) => handleChange("it", e.target.value)}>
          <option value="0">No</option>
          <option value="3">Yes</option>
        </select>
      </label>
      <label>
        Use of hazardous substances (Yes:0, No:2)
        <select onChange={(e) => handleChange("hazardous", e.target.value)}>
          <option value="0">Yes</option>
          <option value="2">No</option>
        </select>
      </label>
      <label>
        Dust suppression on haul roads (Yes:5, No:0)
        <select onChange={(e) => handleChange("dustSuppression", e.target.value)}>
          <option value="0">No</option>
          <option value="5">Yes</option>
        </select>
      </label>
      <label>
        Mine hazard/rescue provision (Yes:5, No:0)
        <select onChange={(e) => handleChange("rescue", e.target.value)}>
          <option value="0">No</option>
          <option value="5">Yes</option>
        </select>
      </label>
      <button
        onClick={() => onSubmit({
          answers,
          score: calculateScore(),
          totalPoints
        })}
        style={styles.button}
      >
        Submit
      </button>
    </div>
  );
}

// ---------- RESULT PAGE COMPONENT ----------
function ResultPage({ mine, result, onBack, mines }) {
  const { answers, score, totalPoints } = result;
  const percentage = ((score / totalPoints) * 100).toFixed(2);
  const star = getStarRating(percentage);

  // --- Chart Data Preparation ---
  const moduleNames = ["Module I", "Module II", "Module III", "Module IV", "Module V"];
  const minesWithScores = mines.map(m => ({
    ...m,
    scores: m.scores || {
      "Module I": Math.floor(Math.random() * 16),
      "Module II": Math.floor(Math.random() * 13),
      "Module III": Math.floor(Math.random() * 13),
      "Module IV": Math.floor(Math.random() * 34),
      "Module V": Math.floor(Math.random() * 29),
    }
  }));
  const moduleAverages = moduleNames.map(mod => ({
    module: mod,
    avg: minesWithScores.length
      ? (
          minesWithScores.reduce((sum, m) => sum + (m.scores[mod] || 0), 0) / minesWithScores.length
        ).toFixed(2)
      : 0,
  }));
  const topMines = [...minesWithScores]
    .map(m => ({
      name: m.name,
      total: Object.values(m.scores).reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
  const COLORS = ["#ff5f6d", "#ffc371", "#36d1dc"];

  // ---------- SAVE AS DOCX ----------
  const handleSaveDoc = async () => {
    try {
    // Fetch logo from public folder - ensure /logo.png exists in your project's public folder
      const logoResp = await fetch("/logo.png");
      if (!logoResp.ok) throw new Error(`Logo fetch failed: ${logoResp.status}`);

      const logoArrayBuffer = await logoResp.arrayBuffer();
      const logoUint8 = new Uint8Array(logoArrayBuffer); // docx expects binary data

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: logoUint8,
                    transformation: { width: 150, height: 150 },
                  }),
                ],
              alignment: "center",
            }),
            new Paragraph({ text: `Star Rating Report for ${mine.name}`, heading: "Heading1" }),
            new Paragraph({ text: `Score: ${score} / ${totalPoints}` }),
            new Paragraph({ text: `Percentage: ${percentage}%` }),
            new Paragraph({ text: `Star Rating: ${star}` }),
            // ...rest of the answers as in your original doc...
            new Paragraph({ text: `\nModule I: Construction, Operation or Decommissioning` }),
            new Paragraph({ text: `Facilities: ${answers.facilities || 0}` }),
            new Paragraph({ text: `Waste: ${answers.waste || 0}` }),
            new Paragraph({ text: `Fencing: ${answers.fencing || 0}` }),
            new Paragraph({ text: `Rejects: ${answers.rejects || 0}` }),
            new Paragraph({ text: `Dumpyard: ${answers.dumpyard || 0}` }),
            new Paragraph({ text: `\nModule II: Use of Natural Resources` }),
            new Paragraph({ text: `Agriculture: ${answers.agriculture || 0}` }),
            new Paragraph({ text: `Water: ${answers.water || 0}` }),
            new Paragraph({ text: `Energy: ${answers.energy || 0}` }),
            new Paragraph({ text: `\nModule III: Noise, Vibration, Emissions, Risks` }),
            new Paragraph({ text: `Equipment: ${answers.equipment || 0}` }),
            new Paragraph({ text: `Compliance: ${answers.compliance || 0}` }),
            new Paragraph({ text: `Safety: ${answers.safety || 0}` }),
            new Paragraph({ text: `Vibration: ${answers.vibration || 0}` }),
            new Paragraph({ text: `\nModule IV: Cumulative Impacts & Environmental Activities` }),
            new Paragraph({ text: `Infrastructure: ${answers.infrastructure || 0}` }),
            new Paragraph({ text: `Green Belt: ${answers.greenBelt || 0}` }),
            new Paragraph({ text: `Green Expenditure: ${answers.greenExpenditure || 0}` }),
            new Paragraph({ text: `Monitoring: ${answers.monitoring || 0}` }),
            new Paragraph({ text: `CER: ${answers.cer || 0}` }),
            new Paragraph({ text: `CER Expenditure: ${answers.cerExpenditure || 0}` }),
            new Paragraph({ text: `Rainwater: ${answers.rainwater || 0}` }),
            new Paragraph({ text: `Eco Park: ${answers.ecoPark || 0}` }),
            new Paragraph({ text: `Eco Restoration: ${answers.ecoRestoration || 0}` }),
            new Paragraph({ text: `\nModule V: Health, Safety & Welfare of Workers` }),
            new Paragraph({ text: `PPE Workers: ${answers.ppeWorkers || 0}` }),
            new Paragraph({ text: `Explosives: ${answers.explosives || 0}` }),
            new Paragraph({ text: `Non Explosive: ${answers.nonExplosive || 0}` }),
            new Paragraph({ text: `PME: ${answers.pme || 0}` }),
            new Paragraph({ text: `IT: ${answers.it || 0}` }),
            new Paragraph({ text: `Hazardous: ${answers.hazardous || 0}` }),
            new Paragraph({ text: `Dust Suppression: ${answers.dustSuppression || 0}` }),
            new Paragraph({ text: `Rescue: ${answers.rescue || 0}` }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc); // returns a Blob in browser
    saveAs(blob, `${mine.name || "report"}_StarRating.docx`);
    toast.success("Report downloaded");
  } catch (err) {
    console.error("Save DOCX error:", err);
    toast.error("Failed to generate/download report. See console for details.");
  }
};

  return (
    <div style={styles.container}>
      <img src="/logo.png" alt="Logo" style={styles.logo} />
      <h2>Star Rating Result for {mine.name}</h2>
      <h3>Score: {score} / {totalPoints}</h3>
      <p>Percentage: {percentage}%</p>
      <p>Star Rating: {star}</p>
      <button onClick={handleSaveDoc} style={styles.button}>Save Report as DOCX</button>
      <button onClick={onBack} style={{ ...styles.button, marginLeft: 10 }}>Back to Dashboard</button>

    {/* --- Charts & Analytics Section --- */}
      <h3>Charts & Analytics</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center", marginBottom: 32 }}>
        <div style={{ width: 320, background: "#fff8", borderRadius: 12, padding: 16 }}>
          <h4>Average Module Scores</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={moduleAverages}>
              <XAxis dataKey="module" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg" fill="#ff5f6d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: 320, background: "#fff8", borderRadius: 12, padding: 16 }}>
          <h4>Top 3 Rated Mines</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={topMines}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {topMines.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Mine List Section --- */}
      <h3>Mine List</h3>
      <ul style={styles.list}>
        {mines.map((m, index) => (
          <li key={index} style={styles.listItem}>
            <span>
              <strong>{m.name}</strong> — {m.owner} ({m.hectares} ha)
              <br />
              <small>
                {moduleNames.map(mod =>
                  <span key={mod} style={{ marginRight: 8 }}>
                    {mod}: {(m.scores && m.scores[mod]) || 0}
                  </span>
                )}
              </small>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}      

// ---------- STYLES ----------
const styles = {
  container: {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "36px 28px",
    borderRadius: "22px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(8px)",
    border: "1.5px solid rgba(255,255,255,0.25)",
    fontFamily: "Segoe UI, Arial, sans-serif",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
    transition: "box-shadow 0.2s",
  },
  logo: {
    display: "block",
    margin: "0 auto 28px auto",
    maxWidth: "120px",
    height: "auto",
    filter: "drop-shadow(0 0 18px #ffb347) drop-shadow(0 0 32px #ff5f6d66)",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.4)",
    padding: "8px",
  },
  input: {
    margin: "10px 0",
    padding: "12px 16px",
    width: "100%",
    borderRadius: "10px",
    border: "1.5px solid #e0e0e0",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
    background: "rgba(255,255,255,0.85)",
    transition: "border 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 4px rgba(255,95,109,0.07)",
  },
  button: {
    marginTop: "16px",
    padding: "12px 28px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #ff5f6d 0%, #ffc371 100%)",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1.05rem",
    cursor: "pointer",
    boxShadow: "0 2px 12px rgba(255,95,109,0.13)",
    transition: "background 0.2s, transform 0.1s, box-shadow 0.2s",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: "24px 0 0 0",
  },
  listItem: {
    background: "rgba(255,255,255,0.92)",
    margin: "14px 0",
    padding: "18px 14px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(255,95,109,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },
};

// ---------- MAIN APP ----------
export default function App() {
  const [user, setUser] = useState(localStorage.getItem("loggedInUser"));
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setUser(null);
  };  
  const [selectedMine, setSelectedMine] = useState(null);
  const [ratingResult, setRatingResult] = useState(null);
  const [mines, setMines] = useState(
    JSON.parse(localStorage.getItem("mines")) || []  
  );

  if (!user) return <Login onLogin={setUser} />;
  if (selectedMine && !ratingResult)
    return (
      <RatingPage
        mine={selectedMine}
        onBack={() => setSelectedMine(null)}
        onSubmit={result => setRatingResult(result)}
      />
    );
if (selectedMine && ratingResult)
  return (
    <ResultPage
      mine={selectedMine}
      result={ratingResult}
      onBack={() => {
        setSelectedMine(null);
        setRatingResult(null);
      }}
      mines={mines} // <-- add this line
    />
  );

  return (
    <>
      <Dashboard
        username={user}
        onLogout={handleLogout}
        onStartRating={setSelectedMine}
        mines={mines}
        setMines={setMines}
      />
      <ToastContainer position="top-center" />
    </>
  );
}