// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const S = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(1400px 700px at 50% 30%, #ffffff, #f5f7ff 60%, #eef2ff)",
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    padding: "24px",
  },
  card: {
    width: "min(520px, 92vw)",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    boxShadow: "0 16px 60px rgba(2,6,23,.08)",
    padding: "20px",
  },
  header: { margin: "6px 0 14px", color: "#0f2540", fontWeight: 900, fontSize: 28 },
  sub: { margin: "0 0 14px", color: "#475569" },
  form: { display: "grid", gap: 10 },
  label: { display: "grid", gap: 6, fontWeight: 700, color: "#0f2540" },
  inputWrap: {
    position: "relative",
    display: "grid",
  },
  input: (err) => ({
    border: `1px solid ${err ? "#f97316" : "#cbd5e1"}`,
    borderRadius: 12,
    padding: "12px 14px",
    font: "inherit",
    background: err ? "#fff7ed" : "#fff",
    outline: "none",
  }),
  toggle: {
    position: "absolute",
    right: 10,
    top: 7,
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    color: "#334155",
  },
  smallErr: { color: "#9a3412", fontWeight: 700 },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    flexWrap: "wrap",
    gap: 8,
  },
  remember: { display: "flex", alignItems: "center", gap: 8, color: "#0f2540" },
  link: { color: "#1940ff", fontWeight: 800, textDecoration: "none" },
  actions: { display: "grid", gap: 8, marginTop: 8 },
  btnPrimary: {
    background: "#1940ff",
    color: "#fff",
    border: 0,
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  btnOutline: {
    background: "#fff",
    color: "#0f2540",
    border: "1px solid #cbd5e1",
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  divider: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 8,
    color: "#64748b",
    margin: "8px 0",
  },
  line: { height: 1, background: "#e2e8f0" },
  oauthRow: { display: "grid", gap: 8 },
  oauthBtn: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 800,
  },
  foot: { marginTop: 10, color: "#475569", textAlign: "center" },
  toast: (type) => ({
    position: "fixed",
    right: 16,
    bottom: 16,
    padding: "10px 14px",
    borderRadius: 10,
    boxShadow: "0 10px 40px rgba(0,0,0,.15)",
    background: type === "ok" ? "#e7f8ef" : "#fff1f2",
    border: `1px solid ${type === "ok" ? "#a7f3d0" : "#fecaca"}`,
    color: "#0f172a",
    fontWeight: 700,
  }),
};

const initial = { email: "", password: "", remember: true };

export default function Login() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email.";
    if (!form.password.trim()) e.password = "Password is required.";
    return e;
  };

  async function onSubmit(e) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      // Simulate API
      await new Promise((r) => setTimeout(r, 1000));
      setToast({ type: "ok", text: "Signed in successfully!" });
      // Example: persist remember me
      if (form.remember) localStorage.setItem("rememberedEmail", form.email);
      else localStorage.removeItem("rememberedEmail");
      // Navigate to dashboard (change path if needed)
      setTimeout(() => navigate("/dashboard"), 350);
    } catch (err) {
      setToast({ type: "error", text: "Invalid credentials. Please try again." });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 2500);
    }
  }

  // Prefill remembered email if available (optional)
  React.useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) setForm((f) => ({ ...f, email: saved }));
  }, []);

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.header}>Login</h1>
        <p style={S.sub}>Welcome back to BlueTracker. Please sign in to continue.</p>

        <form style={S.form} onSubmit={onSubmit} noValidate>
          <label>
            <span>Email</span>
            <div style={S.inputWrap}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                style={S.input(errors.email)}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && <small style={S.smallErr}>{errors.email}</small>}
          </label>

          <label>
            <span>Password</span>
            <div style={S.inputWrap}>
              <input
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                style={S.input(errors.password)}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                style={S.toggle}
                aria-label="Toggle password visibility"
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <small style={S.smallErr}>{errors.password}</small>}
          </label>

          <div style={S.row}>
            <label style={S.remember}>
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setField("remember", e.target.checked)}
              />
              Remember me
            </label>

            <a href="/forgot-password" style={S.link}>
              Forgot password?
            </a>
          </div>

          <div style={S.actions}>
            <button type="submit" style={S.btnPrimary} disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
            <button
              type="button"
              style={S.btnOutline}
              onClick={() => setForm(initial)}
              disabled={loading}
            >
              Clear
            </button>
          </div>

          <div style={S.divider}>
            <div style={S.line} />
            <span>or</span>
            <div style={S.line} />
          </div>

          {/* OAuth placeholders (wire up later if you add real providers) */}
          <div style={S.oauthRow}>
            <button type="button" style={S.oauthBtn} disabled={loading}>
              Continue with Google
            </button>
            <button type="button" style={S.oauthBtn} disabled={loading}>
              Continue with GitHub
            </button>
          </div>

          <p style={S.foot}>
            Don’t have an account?{" "}
            <a href="/register" style={S.link}>
              Create one
            </a>
          </p>
        </form>
      </div>

      {toast && <div style={S.toast(toast.type)}>{toast.text}</div>}
    </div>
  );
}
