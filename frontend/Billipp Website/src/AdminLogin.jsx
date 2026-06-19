import { useState } from "react";
import { supabase } from "./supabaseClient";
import billippLogo from "./assets/logo.png";

const T = {
  navy: "#0b2540", navyMid: "#163656", navyLight: "#1e4a73",
  gold: "#c8a96e", goldLight: "#e2c99a",
};

export default function AdminLogin({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onLogin(data.session);
  }

  const inp = {
    width: "100%", padding: "11px 14px", borderRadius: 6,
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(200,169,110,0.25)",
    color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", background: T.navy, display: "flex",
      alignItems: "center", justifyContent: "center",
      backgroundImage: "linear-gradient(rgba(200,169,110,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,169,110,0.03) 1px,transparent 1px)",
      backgroundSize: "60px 60px",
    }}>
      <div style={{
        background: T.navyMid, border: "1px solid rgba(200,169,110,0.2)",
        borderRadius: 12, padding: "3rem 2.5rem", width: "100%", maxWidth: 400,
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <img src={billippLogo} alt="Billipp Company" style={{ height: 48, width: "auto", objectFit: "contain", marginBottom: 10 }} />
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.16em", textTransform: "uppercase" }}>Admin Portal</div>
          <div style={{ width: 40, height: 1, background: T.gold, margin: "0.75rem auto 0" }} />
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@billipp.com" required style={inp} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required style={inp} />
          </div>

          {error && (
            <div style={{ background: "rgba(220,50,50,0.15)", border: "1px solid rgba(220,80,80,0.35)", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#fca5a5" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: 8, background: loading ? "rgba(200,169,110,0.5)" : T.gold,
            color: T.navy, border: "none", borderRadius: 6, padding: "13px",
            fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit", letterSpacing: "0.04em", transition: "background 0.2s",
          }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          Billipp Company · Restricted access
        </p>
      </div>
    </div>
  );
}
