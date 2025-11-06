import React, { useEffect, useState } from "react";

/**
 * Dashboard component
 * Props:
 *  - username: string
 *  - onLogout: () => void
 *  - onStartRating: (mine) => void
 *  - mines: array
 *  - setMines: (arr) => void
 */
export default function Dashboard({ username, onLogout, onStartRating, mines = [], setMines = () => {} }) {
  const [form, setForm] = useState({ name: "", owner: "", hectares: "", linNumber: "", leaseYear: "" });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    // ensure mines is always an array
    if (!Array.isArray(mines)) setMines([]);
  }, []); // eslint-disable-line

  const saveToStorage = (arr) => {
    try { localStorage.setItem("mines", JSON.stringify(arr)); } catch (e) { /* ignore */ }
    setMines(arr);
  };

  const handleAddOrUpdate = () => {
    if (!form.name?.trim()) return;
    const copy = [...(mines || [])];
    if (editIndex !== null) {
      copy[editIndex] = { ...copy[editIndex], ...form };
      setEditIndex(null);
    } else {
      copy.push({ ...form, scores: copy.scores || {}, proofs: {}, lastResult: null });
    }
    saveToStorage(copy);
    setForm({ name: "", owner: "", hectares: "", linNumber: "", leaseYear: "" });
  };

  const handleEdit = (idx) => {
    setEditIndex(idx);
    setForm({ ...(mines[idx] || {}) });
  };

  const handleDelete = (idx) => {
    if (!confirm(`Delete mine "${mines[idx]?.name}"?`)) return;
    const updated = (mines || []).filter((_, i) => i !== idx);
    saveToStorage(updated);
    if (editIndex === idx) {
      setEditIndex(null);
      setForm({ name: "", owner: "", hectares: "", linNumber: "", leaseYear: "" });
    }
  };

  return (
    <div className="container app-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <h2>Welcome, {username}</h2>
          <small style={{ color: "#6b7280" }}>Manage mines and start rating</small>
        </div>
        <div>
          <button className="btn btn-ghost btn-sm" type="button" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <section className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ marginBottom: 10 }}>{editIndex !== null ? "Edit Mine" : "Add Mine"}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label className="label">Mine name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Owner</label>
            <input type="text" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
          </div>
          <div>
            <label className="label">Hectares</label>
            <input type="text" value={form.hectares} onChange={(e) => setForm({ ...form, hectares: e.target.value })} />
          </div>
          <div>
            <label className="label">LIN number</label>
            <input type="text" value={form.linNumber} onChange={(e) => setForm({ ...form, linNumber: e.target.value })} />
          </div>
          <div>
            <label className="label">Lease year</label>
            <input type="text" value={form.leaseYear} onChange={(e) => setForm({ ...form, leaseYear: e.target.value })} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn btn-primary" type="button" onClick={handleAddOrUpdate}>
            {editIndex !== null ? "Update Mine" : "Add Mine"}
          </button>
          {editIndex !== null && (
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() => { setEditIndex(null); setForm({ name: "", owner: "", hectares: "", linNumber: "", leaseYear: "" }); }}
              style={{ marginLeft: 8 }}
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      <section>
        <h3>Mines ({(mines || []).length})</h3>
        {(mines || []).length === 0 && <div className="card">No mines yet. Add one above to start rating.</div>}
        <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
          {(mines || []).map((m, idx) => (
            <li key={idx} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700 }}>{m.name}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>
                  {m.owner ? `${m.owner} • ` : ""}{m.hectares ? `${m.hectares} ha` : ""}{m.linNumber ? ` • ${m.linNumber}` : ""}
                </div>
                <div style={{ marginTop: 6 }}>
                  <small style={{ color: "#6b7280" }}>
                    {Object.entries((m.scores || {})).map(([k, v]) => `${k}: ${v}`).join(" • ")}
                  </small>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" type="button" onClick={() => onStartRating(m)}>Rate</button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => handleEdit(idx)}>Edit</button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => handleDelete(idx)} style={{ color: "#ef4444" }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}