import React, { useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, ImageRun } from "docx";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateMineWithResult, getMines } from "./storage";
import { zipProofs } from "./utils/zipProofs";
import { buildReportHtml } from "./utils/exportHtml";
import exportPdf from "./utils/exportPdf";
import exportDocx from "./utils/exportdocx";
import { v4 as uuidv4 } from "uuid";

// ---------- STAR RATING LOGIC ----------
function getStarRating(percentage) {
  const p = Number(percentage);
  if (Number.isNaN(p)) return "No Rating";
  if (p <= 25) return "No Rating";
  if (p > 25 && p < 50) return "⭐";
  if (p >= 50 && p < 60) return "⭐⭐";
  if (p >= 60 && p < 70) return "⭐⭐⭐";
  if (p >= 70 && p < 80) return "⭐⭐⭐⭐";
  if (p >= 80) return "⭐⭐⭐⭐⭐";
  return "No Rating";
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
      <img src="/au-logo.png" alt="AU STAR logo" style={styles.logo} />
      <h2>Granite Mine Intelligence</h2>
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
    leaseDuration: "",
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
      setMine({ name: "", owner: "", hectares: "", linNumber: "", leaseDuration: "" });
      toast.success("Mine updated!");
    } else {
      // when adding
      const newMine = { id: uuidv4(), ...mine };
      setMines([...mines, newMine]);
      localStorage.setItem("mines", JSON.stringify([...mines, newMine]));
      setMine({ name: "", owner: "", hectares: "", linNumber: "", leaseDuration: "" });
      toast.success("Mine added!");
    }
  };

  return (
    <div style={styles.container}>
      <img src="/au-logo.png" alt="AU STAR logo" style={styles.logo} />
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
        placeholder="Area (Hectares)"
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
        name="leaseDuration"
        placeholder="Lease Period (Years)"
        value={mine.leaseDuration}
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
      
        {/* single Logout button kept */}

            <button type="button" onClick={handleAddMine} style={styles.button}>
        {editIndex !== null ? "Update Mine" : "Add Mine"}
      </button>
      {editIndex !== null && (
        <button
          type="button"
          onClick={() => {
            setMine({ name: "", owner: "", hectares: "", linNumber: "", leaseDuration: "" });
            setEditIndex(null);
            setEditScores(null);
          }}
          style={{ ...styles.smallButton, background: "#ccc", color: "#333", marginLeft: 8 }}
        >
          Cancel
        </button>
      )}

      <h3>Mine List</h3>
      <ul style={styles.list}>
        {mines.map((m, idx) => (
          <li key={idx} style={styles.listItem}>
            <span style={{ flex: 1, textAlign: "left" }}>
              <strong>{m.name}</strong> ({m.owner}) - {m.hectares} ha
            </span>
            <span style={{ display: "flex", gap: "8px", flexWrap: "nowrap", alignItems: "center" }}>
              <button
                type="button"
                style={{ ...styles.smallButton, padding: "8px 12px", minWidth: "110px" }}
                onClick={() => onStartRating(m)}
              >
                Start Rating
              </button>
              <button
                type="button"
                style={{ ...styles.smallButton, background: "#ffc371", color: "#333", padding: "8px 12px", minWidth: "110px" }}
                onClick={() => onStartRating(m)} // open rating to edit all module params
              >
                Edit Rating
              </button>

              <button
                type="button"
                style={{ ...styles.smallButton, background: "#ff5f6d", color: "#fff", padding: "8px 12px", minWidth: "70px" }}
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
    const [answersFiles, setAnswersFiles] = useState({});
    const totalPoints = 100;

    // Restore previous answers/proofs when reopening rating for an existing mine
    React.useEffect(() => {
      if (mine?.lastResult) {
        setAnswers(mine.lastResult.answers || {});
        setAnswersFiles(mine.lastResult.proofs || {});
      } else {
        setAnswers({});
        setAnswersFiles({});
      }
    }, [mine]);

    const handleChange = (param, value) => {
      setAnswers(prev => ({ ...prev, [param]: value }));
    };

    const handleFileChange = (param, file) => {
      if (!file) return;
      
      const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} exceeds 1MB limit. Please upload a smaller file.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setAnswersFiles(prev => ({ ...prev, [param]: { name: file.name, dataUrl: reader.result } }));
        toast.success(`${file.name} uploaded successfully!`);
      };
      reader.onerror = () => {
        toast.error(`Failed to read file ${file.name}`);
      };
      reader.readAsDataURL(file);
    };

    const handleRemoveFile = (param) => {
      setAnswersFiles(prev => {
        const copy = { ...prev };
        delete copy[param];
        return copy;
      });
      toast.info("Proof removed");
    };

    const FileUploader = ({ param }) => (
      <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
        <input
          type="file"
          accept="image/*,application/pdf"
          title="Upload proof (Max 1 MB)"
          style={{ fontSize: "0.9rem" }}
          onChange={(e) => {
            const f = e.target.files && e.target.files[0];
            if (f) {
              handleFileChange(param, f);
            }
          }}
        />
        <span style={{ fontSize: "0.8rem", color: "#666", whiteSpace: "nowrap" }}>Max 1 MB</span>
      </label>
    );

    const computeModuleScores = () => {
      const a = answers || {};
      const toNumber = (v) => {
        if (v === "high") return 5;
        if (v === "medium") return 3;
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };

      const m1 = toNumber(a.facilities) + toNumber(a.waste) + toNumber(a.fencing) + toNumber(a.rejects) + toNumber(a.dumpyard);
      const m2 = toNumber(a.agriculture) + toNumber(a.water) + toNumber(a.energy);
      const m3 = toNumber(a.equipment) + toNumber(a.compliance) + toNumber(a.safety) + toNumber(a.vibration);
      const infra = a.infrastructure === "high" ? 5 : a.infrastructure === "medium" ? 3 : toNumber(a.infrastructure);
      const m4 = infra + toNumber(a.greenBelt) + toNumber(a.greenExpenditure) + toNumber(a.monitoring) + toNumber(a.cer) + toNumber(a.cerExpenditure) + toNumber(a.rainwater) + toNumber(a.ecoPark) + toNumber(a.ecoRestoration);
      const m5 = toNumber(a.ppeWorkers) + toNumber(a.explosives) + toNumber(a.nonExplosive) + toNumber(a.pme) + toNumber(a.it) + toNumber(a.hazardous) + toNumber(a.dustSuppression) + toNumber(a.rescue);

      return {
        "Module I": m1,
        "Module II": m2,
        "Module III": m3,
        "Module IV": m4,
        "Module V": m5,
      };
    };

    const calculateScore = (moduleScores) => {
      return Object.values(moduleScores).reduce((s, v) => s + (Number(v) || 0), 0);
    };

    return (
      <div style={styles.container}>
        <img src="/au-logo.png" alt="AU STAR logo" style={styles.logo} />
        <h2>Star Rating for {mine.name}</h2>
        <button type="button" onClick={onBack} style={{ ...styles.smallButton, marginRight: 8 }}>Back</button>

        {/* ---------- MODULE I ---------- */}
        <h3>MODULE I: CONSTRUCTION, OPERATION OR DECOMMISSIONING (Max:15 pts)</h3>
        <label style={{ display: "block", marginBottom: 8 }}>
         Facilities for storage of goods or Materials (Yes:3, No:0)
         (Remarks: Check if proper storage sheds exist for safe stacking of materials)
          <select value={answers.facilities ?? "0"} onChange={(e) => handleChange("facilities", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="facilities" />
          {answersFiles.facilities && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.facilities.name} 
              <button type="button" onClick={() => handleRemoveFile("facilities")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Facilities for treatment or disposal of solid waste or liquid effluents (Yes:3, No:0)
          (Remarks: Ensure there is a system for handling mine water, sewage, or other effluents)
          <select value={answers.waste ?? "0"} onChange={(e) => handleChange("waste", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="waste" />
          {answersFiles.waste && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.waste.name} 
              <button type="button" onClick={() => handleRemoveFile("waste")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Fencing has done (Yes:3, No:0)
          (Remarks: Prevents unauthorized entry and ensures safety)
          <select value={answers.fencing ?? "0"} onChange={(e) => handleChange("fencing", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="fencing" />
          {answersFiles.fencing && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.fencing.name} 
              <button type="button" onClick={() => handleRemoveFile("fencing")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
         Rejects (blocks having cracks) properly dumped in a stable ground and adequate environment (Yes:3, No:0)
         (Remarks: Check whether quarry waste is stored or backfilled in a scientific way)
          <select value={answers.rejects ?? "0"} onChange={(e) => handleChange("rejects", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="rejects" />
          {answersFiles.rejects && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.rejects.name} 
              <button type="button" onClick={() => handleRemoveFile("rejects")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
         Garland drains has done (Yes:3, No:0)
         (Remarks: Validity of approved closure plan and initial implementation must be verified)
          <select value={answers.dumpyard ?? "0"} onChange={(e) => handleChange("dumpyard", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="dumpyard" />
          {answersFiles.dumpyard && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.dumpyard.name} 
              <button type="button" onClick={() => handleRemoveFile("dumpyard")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        {/* ---------- MODULE II ---------- */}
        <h3>MODULE II: USE OF NATURAL RESOURCES FOR CONSTRUCTION OR OPERATION (Max:12 pts)</h3>
        <label style={{ display: "block", marginBottom: 8 }}>
          Land especially used for agricultural purposes (ha) (Yes:3, No:0)
          (Remarks: Using agricultural land for mining is discouraged; should be avoided)
          <select value={answers.agriculture ?? "0"} onChange={(e) => handleChange("agriculture", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="agriculture" />
          {answersFiles.agriculture && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.agriculture.name} 
              <button type="button" onClick={() => handleRemoveFile("agriculture")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Water (expected source & competing users) unit: KLD
          (Remarks: Check if water abstraction is within permissible limits and does not affect local users)
          <select value={answers.water ?? "0"} onChange={(e) => handleChange("water", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">≤50% / NA</option>
            <option value="3">50–80%</option>
            <option value="5">80–100%</option>
          </select>
          <FileUploader param="water" />
          {answersFiles.water && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.water.name} 
              <button type="button" onClick={() => handleRemoveFile("water")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Energy including electricity and fuels
          (Remarks: Preference for renewable energy (solar) indicates better sustainability)
          <select value={answers.energy ?? "0"} onChange={(e) => handleChange("energy", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">Diesel Fuel</option>
            <option value="2">Electricity</option>
            <option value="4">Solar Energy</option>
          </select>
          <FileUploader param="energy" />
          {answersFiles.energy && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.energy.name} 
              <button type="button" onClick={() => handleRemoveFile("energy")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        {/* ---------- MODULE III ---------- */}
        <h3>MODULE III: GENERATION OF NOISE AND VIBRATION, AND EMISSIONS AND RISKS (Max:12 pts)</h3>
        <label style={{ display: "block", marginBottom: 8 }}>
          From operation of equipment e.g. engines, cranes, HEMM (within a permissible limit) (Yes:3, No:0)
          (Remarks: Noise and vibration levels should comply with CPCB/DGMS norms)
          <select value={answers.equipment ?? "0"} onChange={(e) => handleChange("equipment", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="equipment" />
          {answersFiles.equipment && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.equipment.name} 
              <button type="button" onClick={() => handleRemoveFile("equipment")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Compliance reporting of environmental parameters (air, water, etc.) (Yes:3, No:0)
          (Remarks: Ensure reports are regularly submitted as per statutory requirement)
          <select value={answers.compliance ?? "0"} onChange={(e) => handleChange("compliance", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="compliance" />
          {answersFiles.compliance && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.compliance.name} 
              <button type="button" onClick={() => handleRemoveFile("compliance")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Mines safety precautions followed in controlling the noise, vibration, etc. (Yes:3, No:0)
          (Remarks: Adequate signage, safety drills, and protective gear must be in place)
          <select value={answers.safety ?? "0"} onChange={(e) => handleChange("safety", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="safety" />
          {answersFiles.safety && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.safety.name} 
              <button type="button" onClick={() => handleRemoveFile("safety")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Whole body vibration test has been carried out while using HEMMs (Yes:3, No:0)
          (Remarks: Check if operators undergo periodic vibration exposure tests)
          <select value={answers.vibration ?? "0"} onChange={(e) => handleChange("vibration", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="vibration" />
          {answersFiles.vibration && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.vibration.name} 
              <button type="button" onClick={() => handleRemoveFile("vibration")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        {/* ---------- MODULE IV ---------- */}
        <h3>MODULE IV: POTENTIAL FOR CUMULATIVE IMPACTS WITH OTHER EXISTING OR PLANNED ACTIVITIES IN THE LOCALITY (Max:33 pts)</h3>
        <label style={{ display: "block", marginBottom: 8 }}>
          Development of infrastructure
          (Remarks: Check whether nearby development activities are aligned with EIA norms)
          <select value={answers.infrastructure ?? "0"} onChange={(e) => handleChange("infrastructure", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">≤50%</option>
            <option value="3">50–80%</option>
            <option value="high">80–100%</option>
          </select>
          <FileUploader param="infrastructure" />
          {answersFiles.infrastructure && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.infrastructure.name} 
              <button type="button" onClick={() => handleRemoveFile("infrastructure")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Green belt development activities (If Yes, mention the activities) (Yes:3, No:0)
          (Remarks: Mines must develop plantation along boundaries and haul roads)
          <select value={answers.greenBelt ?? "0"} onChange={(e) => handleChange("greenBelt", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="greenBelt" />
          {answersFiles.greenBelt && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.greenBelt.name} 
              <button type="button" onClick={() => handleRemoveFile("greenBelt")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Expenditure on green belt development 
          (Remarks: Verify plantation expenditure and survival rate of saplings)
          <select value={answers.greenExpenditure ?? "1"} onChange={(e) => handleChange("greenExpenditure", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="1">80%</option>
            <option value="5">100%</option>
          </select>
          <FileUploader param="greenExpenditure" />
          {answersFiles.greenExpenditure && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.greenExpenditure.name} 
              <button type="button" onClick={() => handleRemoveFile("greenExpenditure")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Environment Monitoring Programme has formulated (Yes:3, No:0)
          (Remarks :Periodic air, water, and noise quality checks must be carried out)
          <select value={answers.monitoring ?? "0"} onChange={(e) => handleChange("monitoring", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="monitoring" />
          {answersFiles.monitoring && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.monitoring.name} 
              <button type="button" onClick={() => handleRemoveFile("monitoring")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Corporate Environmental Responsibility (If yes, mention the activities) (Yes:3, No:0)
          (Remarks: Verify CSR activities specific to environmental welfare)
          <select value={answers.cer ?? "0"} onChange={(e) => handleChange("cer", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="cer" />
          {answersFiles.cer && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.cer.name} 
              <button type="button" onClick={() => handleRemoveFile("cer")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Expenditure on CER
          (Remarks: Funds must be utilized for environmental/community development.)
          <select value={answers.cerExpenditure ?? "1"} onChange={(e) => handleChange("cerExpenditure", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="1">80%</option>
            <option value="5">100%</option>
          </select>
          <FileUploader param="cerExpenditure" />
          {answersFiles.cerExpenditure && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.cerExpenditure.name} 
              <button type="button" onClick={() => handleRemoveFile("cerExpenditure")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          RWH (Rain Water Harvesting) structure has maintained (Yes:3, No:0)
          (Remarks: Check if proper catch pits, tanks, or harvesting systems exist) 
          <select value={answers.rainwater ?? "0"} onChange={(e) => handleChange("rainwater", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="rainwater" />
          {answersFiles.rainwater && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.rainwater.name} 
              <button type="button" onClick={() => handleRemoveFile("rainwater")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Eco-parks have been opened or not in the surrounding nearby location (Yes:3, No:0)
          (Remarks: Land reclaimed for eco-tourism or biodiversity purposes)
          <select value={answers.ecoPark ?? "0"} onChange={(e) => handleChange("ecoPark", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="ecoPark" />
          {answersFiles.ecoPark && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.ecoPark.name} 
              <button type="button" onClick={() => handleRemoveFile("ecoPark")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Eco-restoration including the mine closure plan has done (Yes:3, No:0)
          (Remarks: Rehabilitation of mined-out areas as per closure plan)
          <select value={answers.ecoRestoration ?? "0"} onChange={(e) => handleChange("ecoRestoration", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="ecoRestoration" />
          {answersFiles.ecoRestoration && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.ecoRestoration.name} 
              <button type="button" onClick={() => handleRemoveFile("ecoRestoration")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        {/* ---------- MODULE V ---------- */}
        <h3>MODULE V: HEALTH SAFETY AND WELFARE OF WORKERS (Max:28 pts)</h3>
        <label style={{ display: "block", marginBottom: 8 }}>
          The workers on the site should be provided with the required protective equipment such as ear muffs, helmet, etc. (Yes:3, No:0)
          (Remarks: PPE like helmets, ear muffs, masks, gloves must be issued and used)
          <select value={answers.ppeWorkers ?? "0"} onChange={(e) => handleChange("ppeWorkers", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="ppeWorkers" />
          {answersFiles.ppeWorkers && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.ppeWorkers.name} 
              <button type="button" onClick={() => handleRemoveFile("ppeWorkers")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Explosives should be stored in magazines in isolated place specified and approved by the explosives department used in accordance with MMDR act 1961 (NA:3, Yes:0, No:0)
          (Remarks: Storage magazine must comply with DGMS norms)
          <select value={answers.explosives ?? "0"} onChange={(e) => handleChange("explosives", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">Yes / No</option>
            <option value="3">NA</option>
          </select>
          <FileUploader param="explosives" />
          {answersFiles.explosives && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.explosives.name} 
              <button type="button" onClick={() => handleRemoveFile("explosives")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Usage of non-explosive & innovative techniques such as cutting saw fo¬r block extraction (Yes:4, No:0)
          (Remarks: Saw cutting and wire cutting reduce environmental and safety hazards)
          <select value={answers.nonExplosive ?? "0"} onChange={(e) => handleChange("nonExplosive", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="4">Yes</option>
          </select>
          <FileUploader param="nonExplosive" />
          {answersFiles.nonExplosive && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.nonExplosive.name} 
              <button type="button" onClick={() => handleRemoveFile("nonExplosive")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          %of total employment for whom Periodical Medical Examination (PME)has been done as per Mine Rules 1955
          (Remarks: Ensure 100% workers undergo PME every year)
          <select value={answers.pme ?? "0"} onChange={(e) => handleChange("pme", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">≤50%</option>
            <option value="1">50–100%</option>
            <option value="3">100%</option>
          </select>
          <FileUploader param="pme" />
          {answersFiles.pme && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.pme.name} 
              <button type="button" onClick={() => handleRemoveFile("pme")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          IT initiatives to check pilferage such as CCTV camera, link with state authorities, usage of satellite images (Yes:3, No:0)
          (Remarks: Improves safety, monitoring, and compliance reporting)
          <select value={answers.it ?? "0"} onChange={(e) => handleChange("it", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="3">Yes</option>
          </select>
          <FileUploader param="it" />
          {answersFiles.it && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.it.name} 
              <button type="button" onClick={() => handleRemoveFile("it")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Use of substances or materials, which are hazardous (as per MSIHC rules) to human health or the environment (flora, fauna, and water supplies) (Yes:0, No:2)
          (Remarks: Mines must avoid usage of chemicals classified under MSIHC Rules)
          <select value={answers.hazardous ?? "0"} onChange={(e) => handleChange("hazardous", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">Yes</option>
            <option value="2">No</option>
          </select>
          <FileUploader param="hazardous" />
          {answersFiles.hazardous && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.hazardous.name} 
              <button type="button" onClick={() => handleRemoveFile("hazardous")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Dust suppression measures within quarry and haul roads (Yes:5, No:0)
          (Remarks: Water sprinklers or chemical suppressants must be in place)
          <select value={answers.dustSuppression ?? "0"} onChange={(e) => handleChange("dustSuppression", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="5">Yes</option>
          </select>
          <FileUploader param="dustSuppression" />
          {answersFiles.dustSuppression && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.dustSuppression.name} 
              <button type="button" onClick={() => handleRemoveFile("dustSuppression")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Provision to tackle mine hazards /rescue operation (Yes:5, No:0)
          (Remarks: Adequate firefighting, rescue equipment, and trained personnel must be available)
          <select value={answers.rescue ?? "0"} onChange={(e) => handleChange("rescue", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="0">No</option>
            <option value="5">Yes</option>
          </select>
          <FileUploader param="rescue" />
          {answersFiles.rescue && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
              {answersFiles.rescue.name} 
              <button type="button" onClick={() => handleRemoveFile("rescue")} style={{ marginLeft: 6, ...styles.smallButton, padding: "4px 8px", fontSize: "0.75rem" }}>Remove</button>
            </span>
          )}
        </label>

        {/* SUBMIT */}
        <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              const moduleScores = computeModuleScores();
              const finalScore = calculateScore(moduleScores);
              onSubmit({
                answers,
                proofs: answersFiles,
                score: finalScore,
                totalPoints,
                moduleScores,
              });
            }}
            style={styles.button}
          >
            Submit Rating
          </button>
          <button type="button" onClick={onBack} style={styles.button}>
            Back
          </button>
        </div>
      </div>
    );
  }
  
// ADD: Module config with full names and max points
const MODULE_CONFIG = {
  "Module I": { fullName: "CONSTRUCTION, OPERATION OR DECOMMISSIONING", maxPoints: 15 },
  "Module II": { fullName: "USE OF NATURAL RESOURCES FOR CONSTRUCTION OR OPERATION", maxPoints: 12 },
  "Module III": { fullName: "GENERATION OF NOISE AND VIBRATION, AND EMISSIONS AND RISKS", maxPoints: 12 },
  "Module IV": { fullName: "POTENTIAL FOR CUMULATIVE IMPACTS WITH OTHER EXISTING OR PLANNED ACTIVITIES IN THE LOCALITY", maxPoints: 33 },
  "Module V": { fullName: "HEALTH SAFETY AND WELFARE OF WORKERS", maxPoints: 28 },
};

// ADD: improvement suggestions based on scored module
const getImprovementSuggestions = (moduleKey, scored, maxPoints) => {
  const percentage = (scored / maxPoints) * 100;
  const suggestions = {
    "Module I": {
      low: "Improve storage facilities for materials and ensure proper waste management systems are in place.",
      medium: "Complete fencing around the quarry and stabilize reject dumps on suitable ground.",
      high: "Maintain existing infrastructure and focus on other modules."
    },
    "Module II": {
      low: "Avoid using agricultural land; switch to renewable energy sources like solar power.",
      medium: "Implement water conservation measures and reduce dependency on natural resources.",
      high: "Continue sustainable resource management practices."
    },
    "Module III": {
      low: "Conduct noise and vibration tests; implement compliance reporting for environmental parameters.",
      medium: "Ensure all safety precautions are documented and workers are trained.",
      high: "Maintain current standards and periodic monitoring."
    },
    "Module IV": {
      low: "Develop green belt, establish eco-parks, and formulate an environment monitoring programme.",
      medium: "Increase green expenditure and implement CSR activities for community welfare.",
      high: "Continue ecological restoration and maintain existing initiatives."
    },
    "Module V": {
      low: "Provide PPE to all workers, conduct periodic medical exams, and install dust suppression systems.",
      medium: "Implement IT initiatives (CCTV) and enhance rescue operation capabilities.",
      high: "Maintain safety standards and worker health programs."
    }
  };

  const level = percentage < 50 ? "low" : percentage < 75 ? "medium" : "high";
  return suggestions[moduleKey]?.[level] || "";
};

// ---------- RESULT PAGE COMPONENT ----------
function ResultPage({ mine, result = {}, onBack, mines = [] }) {
  const answers = result.answers || {};
  const proofs = result.proofs || {};
  const score = Number(result.score || result.lastResult?.score || 0);
  const totalPoints = Number(result.totalPoints || result.lastResult?.totalPoints || 100);
  const percentage = (result.percentage ?? (totalPoints ? ((score / totalPoints) * 100).toFixed(2) : "0")) || "0";
  const star = getStarRating(percentage);

  const moduleScores = result.moduleScores || (mine && mine.scores) || {};
  const moduleNames = ["Module I", "Module II", "Module III", "Module IV", "Module V"];
  
  // ADD: prepare data for stacked bar chart (obtained vs. remaining)
  const moduleChartData = moduleNames.map(mod => {
    const maxPts = MODULE_CONFIG[mod].maxPoints;
    const obtained = moduleScores[mod] || 0;
    const remaining = Math.max(0, maxPts - obtained);
    return {
      module: mod.replace("Module ", "M"),
      obtained: Number(obtained),
      remaining: Number(remaining),
      maxPoints: maxPts,
      percentage: ((obtained / maxPts) * 100).toFixed(1),
    };
  });

  const minesWithScores = (mines || []).map(m => ({ ...m, scores: m.scores || { "Module I": 0, "Module II": 0, "Module III": 0, "Module IV": 0, "Module V": 0 } }));
  const moduleAverages = moduleNames.map(mod => ({
    module: mod,
    avg: minesWithScores.length ? (minesWithScores.reduce((s, m) => s + (m.scores[mod] || 0), 0) / minesWithScores.length).toFixed(2) : 0,
  }));
  const topMines = [...minesWithScores].map(m => ({ name: m.name, total: Object.values(m.scores || {}).reduce((a, b) => a + b, 0) })).sort((a, b) => b.total - a.total).slice(0, 3);
  const COLORS = ["#ff5f6d", "#ffc371", "#36d1dc"];

  const downloadProof = (file) => {
    try {
      if (!file || !file.dataUrl) return;
      const parts = file.dataUrl.split(",");
      const mime = parts[0].match(/:(.*?);/)[1];
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8 = new Uint8Array(n);
      while (n--) u8[n] = bstr.charCodeAt(n);
      const blob = new Blob([u8], { type: mime });
      saveAs(blob, file.name || "proof");
    } catch (err) {
      console.error(err);
    }
  };

  const exportTXT = () => {
    const d = { mine, result: { score, totalPoints, percentage, star, moduleScores }, answers, proofs };
    const lines = [
      `Star Rating Report - ${d.mine.name}`,
      `Date: ${new Date().toLocaleString()}`,
      "",
      `Score: ${d.result.score} / ${d.result.totalPoints}`,
      `Percentage: ${d.result.percentage}%`,
      `Star: ${d.result.star}`,
      "",
      "Module Scores:"
    ];
    Object.entries(d.result.moduleScores || {}).forEach(([k, v]) => lines.push(`${k}: ${v}`));
    lines.push("", "Answers:");
    Object.entries(d.answers).forEach(([k, v]) => lines.push(`${k}: ${v}`));
    lines.push("", "Proofs:");
    Object.entries(d.proofs).forEach(([k, f]) => lines.push(`${k}: ${f?.name || "n/a"}`));
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${(d.mine.name || "report")}_StarRating.txt`);
  };

  const exportCSV = () => {
    const rows = [];
    rows.push(['field', 'value']);
    Object.entries(mine || {}).forEach(([k, v]) => rows.push([k, `${v}`]));
    rows.push(['Score', `${score} / ${totalPoints}`], ['Percentage', `${percentage}%`], []);
    rows.push(['module', 'score']);
    Object.entries(moduleScores || {}).forEach(([k, v]) => rows.push([k, `${v}`]));
    rows.push([]);
    rows.push(['answer', 'value']);
    Object.entries(answers).forEach(([k, v]) => rows.push([k, `${v}`]));
    rows.push([]);
    rows.push(['proof_param', 'filename']);
    Object.entries(proofs).forEach(([k, f]) => rows.push([k, f?.name || ""]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${(mine.name || "report")}_StarRating.csv`);
  };

  const exportHTML = () => {
    const html = buildReportHtml(mine, { answers, proofs, score, totalPoints, percentage, moduleScores });
    saveAs(new Blob([html], { type: "text/html;charset=utf-8" }), `${(mine.name || "report")}_StarRating.html`);
  };

  const exportDOCX = async () => {
    try {
      await exportDocx(mine, { answers, proofs, score, totalPoints, percentage, moduleScores }, `${(mine.name || "report")}_StarRating.docx`);
    } catch (err) {
      console.error("DOCX export failed", err);
      alert("DOCX export failed. See console.");
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = async () => {
    try {
      setIsExporting(true);
      const fullResult = { answers, proofs, score, totalPoints, percentage, moduleScores };
      const res = await exportPdf(mine, fullResult, { filename: `${(mine.name || "report")}_StarRating.pdf`, download: true });
      if (!res.ok) { console.error(res.error); toast.error("PDF export failed"); }
      else toast.success("PDF exported");
    } catch (err) {
      console.error(err); toast.error("PDF export error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!proofs || Object.keys(proofs).length === 0) return;
    try {
      const { blob, name } = await zipProofs(proofs, `${mine.name || "proofs"}_proofs.zip`);
      saveAs(blob, name);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <img src="/au-logo.png" alt="AU STAR logo" style={styles.logo} />
      <h2>Result — {mine.name}</h2>
      <h3>Score: {score} / {totalPoints}</h3>
      <p>Percentage: {percentage}% — {star}</p>

      {/* UPDATED: Export & action buttons in aligned grid */}
      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <button type="button" style={styles.button} onClick={exportPDF} disabled={isExporting}>
          {isExporting ? "Exporting PDF…" : "Save as PDF"}
        </button>
        <button type="button" style={styles.button} onClick={exportDOCX}>
          Save as DOCX
        </button>
        <button type="button" style={styles.button} onClick={exportTXT}>
          Save as Notes
        </button>
        <button type="button" style={styles.button} onClick={exportCSV}>
          Save as CSV
        </button>
        <button type="button" style={styles.button} onClick={exportHTML}>
          Save as HTML
        </button>
        <button type="button" style={styles.button} onClick={handleDownloadZip}>
          Download Proofs (ZIP)
        </button>
        <button type="button" style={styles.button} onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

      <h3 style={{ marginTop: 20 }}>Uploaded Proofs</h3>
      <div>
        {Object.keys(proofs || {}).length === 0 && <small>No proofs uploaded.</small>}
        {Object.entries(proofs || {}).map(([param, file]) => (
          <div key={param} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "8px 0", padding: 8, border: "1px solid #eee", borderRadius: 8 }}>
            <div style={{ textAlign: "left" }}>
              <strong>{param}</strong><div style={{ fontSize: 12 }}>{file?.name}</div>
            </div>
            <div>
              {file?.dataUrl && <button type="button" style={styles.smallButton} onClick={() => downloadProof(file)}>Download</button>}
              {(file?.dataUrl && file.dataUrl.startsWith("data:image")) && <img src={file.dataUrl} alt={file.name} style={{ maxHeight: 80, marginLeft: 10 }} />}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 20 }}>Charts & Analytics</h3>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ width: 360, background: "#fff8", borderRadius: 12, padding: 12 }}>
          <h4>Module Points: Obtained vs. Remaining</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={moduleChartData}>
              <XAxis dataKey="module" />
              <YAxis />
              <Tooltip formatter={(v) => `${v} pts`} />
              <Bar dataKey="obtained" stackId="a" fill="#36d1dc" name="Obtained" />
              <Bar dataKey="remaining" stackId="a" fill="#b3e5fc" name="Remaining" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: 260, background: "#fff8", borderRadius: 12, padding: 12 }}>
          <h4>Top 3 Mines</h4>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={topMines} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {topMines.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* UPDATED: Module Scores Summary with full names and improvement suggestions */}
      <h3 style={{ marginTop: 24 }}>Module Scores Summary & Improvement Areas</h3>
      <div style={{ textAlign: "left", maxWidth: 720, margin: "16px auto" }}>
        {moduleNames.map((mod) => {
          const scored = moduleScores[mod] || 0;
          const maxPts = MODULE_CONFIG[mod].maxPoints;
          const percentage = ((scored / maxPts) * 100).toFixed(1);
          const suggestion = getImprovementSuggestions(mod, scored, maxPts);
          const isLow = percentage < 50;

          return (
            <div
              key={mod}
              style={{
                background: isLow ? "#fff5f5" : "#f5f5f5",
                padding: 14,
                margin: "12px 0",
                borderRadius: 10,
                border: isLow ? "2px solid #ff5f6d" : "1px solid #e0e0e0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <strong style={{ fontSize: 15 }}>{mod}</strong>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    {MODULE_CONFIG[mod].fullName}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: "bold", color: isLow ? "#ff5f6d" : "#36d1dc" }}>
                    {scored} / {maxPts}
                  </div>
                  <div style={{ fontSize: 12, color: "#999" }}>({percentage}%)</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ background: "#e0e0e0", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
                <div
                  style={{
                    height: "100%",
                    width: `${percentage}%`,
                    background: isLow ? "#ff5f6d" : "#36d1dc",
                    transition: "width 0.3s",
                  }}
                />
              </div>

              {/* Improvement suggestion */}
              {suggestion && (
                <div style={{ background: "#fff", padding: 10, borderRadius: 6, fontSize: 13, color: "#333", borderLeft: `4px solid ${isLow ? "#ff5f6d" : "#36d1dc"}` }}>
                  <strong style={{ color: isLow ? "#ff5f6d" : "#36d1dc" }}>💡 Suggestion:</strong> {suggestion}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- STYLES ----------
const styles = {
  container: {
    maxWidth: "800px",
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
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(90deg, #ff5f6d 0%, #ffc371 100%)",
    color: "#fff",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(255,95,109,0.12)",
    transition: "background 0.15s, transform 0.08s",
    minWidth: "120px",
    textAlign: "center",
  },

  smallButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(90deg, #ff5f6d 0%, #ffc371 100%)",
    color: "#fff",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(255,95,109,0.06)",
    transition: "background 0.12s, transform 0.06s",
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
    gap: "12px",
    flexWrap: "wrap",
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
  const [mines, setMines] = useState(() => {
    const raw = JSON.parse(localStorage.getItem("mines")) || [];
    // ensure every mine has id
    const normalized = raw.map(m => ({ id: m.id || uuidv4(), ...m }));
    localStorage.setItem("mines", JSON.stringify(normalized));
    return normalized;
  });

  // Persist rating result + proofs into mines[] (localStorage)
  const handleRatingSubmit = (result) => {
    // compute moduleScores if not provided
    const moduleScores = result.moduleScores && Object.keys(result.moduleScores).length
      ? result.moduleScores
      : (() => {
          const a = result.answers || {};
          return {
            "Module I":
              (Number(a.facilities) || 0) +
              (Number(a.waste) || 0) +
              (Number(a.fencing) || 0) +
              (Number(a.rejects) || 0) +
              (Number(a.dumpyard) || 0),
            "Module II":
              (Number(a.agriculture) || 0) +
              (Number(a.water) || 0) +
              (Number(a.energy) || 0),
            "Module III":
              (Number(a.equipment) || 0) +
              (Number(a.compliance) || 0) +
              (Number(a.safety) || 0) +
              (Number(a.vibration) || 0),
            "Module IV":
              (a.infrastructure === "high" ? 5 : a.infrastructure === "medium" ? 3 : Number(a.infrastructure) || 0) +
              (Number(a.greenBelt) || 0) +
              (Number(a.greenExpenditure) || 0) +
              (Number(a.monitoring) || 0) +
              (Number(a.cer) || 0) +
              (Number(a.cerExpenditure) || 0) +
              (Number(a.rainwater) || 0) +
              (Number(a.ecoPark) || 0) +
              (Number(a.ecoRestoration) || 0),
            "Module V":
              (Number(a.ppeWorkers) || 0) +
              (Number(a.explosives) || 0) +
              (Number(a.nonExplosive) || 0) +
              (Number(a.pme) || 0) +
              (Number(a.it) || 0) +
              (Number(a.hazardous) || 0) +
              (Number(a.dustSuppression) || 0) +
              (Number(a.rescue) || 0),
          };
        })();

    const score = Object.values(moduleScores).reduce((s, v) => s + (Number(v) || 0), 0);
    const total = result.totalPoints ?? 100;
    const fullResult = {
      ...result,
      moduleScores,
      score,
      totalPoints: total,
      percentage: total ? ((score / total) * 100).toFixed(2) : null,
      updatedAt: new Date().toISOString(),
    };

    // Persist into mines[] in localStorage and state so data remains after refresh
    const mineId = selectedMine?.id;
    let updatedMines = [];

    if (mineId) {
      updatedMines = mines.map(m => {
        if (m.id === mineId) {
          // merge existing mine data and attach lastResult + scores
          return {
            ...m,
            lastResult: fullResult,
            scores: moduleScores,
            // keep other fields intact
          };
        }
        return m;
      });
    } else {
      // create new mine entry (fallback)
      const newMine = {
        id: uuidv4(),
        name: fullResult.mineName || "Unnamed Mine",
        owner: fullResult.owner || "",
        hectares: fullResult.hectares || "",
        linNumber: fullResult.linNumber || "",
        leaseDuration: fullResult.leaseDuration || "",
        lastResult: fullResult,
        scores: moduleScores,
      };
      updatedMines = [...mines, newMine];
    }

    // save and update state
    try {
      localStorage.setItem("mines", JSON.stringify(updatedMines));
      setMines(updatedMines);
    } catch (err) {
      console.error("Failed to persist mines to localStorage", err);
      toast.error("Saving result failed");
    }

    // set rating result so UI shows result
    setRatingResult(fullResult);
  };

  if (!user) return <Login onLogin={setUser} />;

  if (selectedMine && !ratingResult)
    return (
      <RatingPage
        mine={selectedMine}
        onBack={() => setSelectedMine(null)}
        onSubmit={handleRatingSubmit}
      />
    );

  if (selectedMine && ratingResult)
    return (
      <ResultPage
        mine={selectedMine}
        result={ratingResult}
        onBack={() => {
          // clear result and go back to dashboard
          setRatingResult(null);
          setSelectedMine(null);
        }}
        mines={mines}
      />
    );

  return (
  <>
    <Dashboard
      username={user}
      onLogout={handleLogout}
      onStartRating={(m) => { setRatingResult(null); setSelectedMine(m); }}
      mines={mines}
      setMines={setMines}
    />
    <ToastContainer position="top-center" />
  </>
);
}
