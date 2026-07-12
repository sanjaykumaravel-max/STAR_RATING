import React, { useState } from "react";

export default function Login({ onLogin = () => {} }) {
  const [name, setName] = useState("");

  const submit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    onLogin(name?.trim() || "User");
  };

  return (
    <div className="container app-container" style={{ textAlign: "center", maxWidth: 480 }}>
      <img src="/au-logo.png" alt="AU STAR logo" style={{ display: "block", margin: "12px auto", maxWidth: 120 }} />
      <h2>Sign in</h2>
      <form onSubmit={submit} style={{ marginTop: 12 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600, textAlign: "left" }}>Your name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          autoFocus
        />
        <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
          <button type="submit" className="btn btn-primary">Enter</button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => { setName(""); }}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
