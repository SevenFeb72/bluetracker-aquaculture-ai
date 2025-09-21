import React, { useMemo, useState, useEffect } from "react";

/** ====== CONTENT (English) ====== */
const SECTIONS = {
  "Getting Started": `
- Create an account and sign in.
- Register your first farm via “New Farm”.
- Connect sensors (if available) or start with manual data entry.`,
  "Monitoring & Alerts": `
- View charts for Temperature, pH, Ammonia (NH₃), and Dissolved Oxygen (DO).
- Set alert thresholds and enable auto-refresh.
- See alert badges when values exceed safe ranges.`,
  "Farm Management Tips": `
- Reduce feed when pH is high and temperature rises.
- Increase aeration at night if DO trends downward.
- Check ammonia after heavy rain.`,
  "Account & Security": `
- Update your password regularly; 2FA support coming soon.
- Manage roles: admin / staff.`,
  "Troubleshooting": `
- No data? Check power, Wi-Fi, and sensor clock/timezone.
- Wrong timestamps? Go to Settings → Timezone.`,
  "FAQs": `
- Can I export CSV? Yes, at Current Farm → Export.
- How long is data retained? Standard plan stores up to 12 months.`,
  "Contact Support": `
Reach the BlueTracker team:
- Email: support@bluetracker.com
- Phone: +61 123 456 789`,
};

/** ====== INLINE STYLES (no external CSS) ====== */
const S = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#f5f9fc",
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  aside: {
    width: 260,
    background: "#04396c",
    color: "#fff",
    padding: "20px 14px",
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
    height: "100vh",
  },
  titleAside: { fontSize: 20, fontWeight: 900, margin: "0 0 12px" },
  list: { listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 },
  item: (active) => ({
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    userSelect: "none",
    background: active ? "#0d60c9" : "transparent",
    fontWeight: active ? 700 : 600,
    transition: "background .15s",
    whiteSpace: "nowrap",
  }),
  main: { flex: 1, padding: 24 },
  h1: { margin: "0 0 16px", fontSize: 28, fontWeight: 900, color: "#0d2a4a" },
  searchRow: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  search: {
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "10px 12px",
    minWidth: 260,
    font: "inherit",
    background: "#fff",
  },
  clearBtn: {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,.05)",
    overflow: "hidden",
  },
  groupTitle: {
    margin: 0,
    padding: "14px 16px",
    borderBottom: "1px solid #eff3f8",
    fontWeight: 900,
    color: "#0d2a4a",
    background: "#f8fbff",
  },
  sectionBtn: {
    width: "100%",
    textAlign: "left",
    padding: "14px 16px",
    border: 0,
    background: "transparent",
    borderBottom: "1px solid #f1f5f9",
    fontWeight: 800,
    cursor: "pointer",
  },
  panel: { padding: 16, whiteSpace: "pre-wrap", lineHeight: 1.5, color: "#0f172a" },
  // responsive tweaks (turn sidebar into a top bar on narrow screens)
  wrap: (isNarrow) => (isNarrow ? { flexDirection: "column" } : {}),
  asideNarrow: (isNarrow) =>
    isNarrow
      ? { width: "100%", height: "auto", borderBottom: "1px solid #0b507f", borderRight: 0 }
      : {},
  listNarrow: (isNarrow) =>
    isNarrow ? { gridAutoFlow: "column", overflowX: "auto", paddingBottom: 6 } : {},
};

export default function Help() {
  const [active, setActive] = useState("Getting Started");
  const [q, setQ] = useState("");
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== "undefined" ? window.innerWidth < 900 : false
  );

  // Handle simple responsiveness without CSS
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Filter sections by search query (title + content)
  const filteredKeys = useMemo(() => {
    const keys = Object.keys(SECTIONS);
    if (!q.trim()) return keys;
    const v = q.toLowerCase();
    return keys.filter(
      (k) => k.toLowerCase().includes(v) || SECTIONS[k].toLowerCase().includes(v)
    );
  }, [q]);

  // If the active section is filtered out, pick the first visible section
  useEffect(() => {
    if (!filteredKeys.includes(active) && filteredKeys.length) {
      setActive(filteredKeys[0]);
    }
  }, [filteredKeys, active]);

  return (
    <div style={{ ...S.page, ...S.wrap(isNarrow) }}>
      <aside style={{ ...S.aside, ...S.asideNarrow(isNarrow) }}>
        <h2 style={S.titleAside}>Help Center</h2>
        <ul style={{ ...S.list, ...S.listNarrow(isNarrow) }}>
          {filteredKeys.map((k) => (
            <li
              key={k}
              style={S.item(active === k)}
              onClick={() => setActive(k)}
              title={k}
            >
              {k}
            </li>
          ))}
        </ul>
      </aside>

      <main style={S.main}>
        <h1 style={S.h1}>Welcome to the BlueTracker Help Center</h1>

        <div style={S.searchRow}>
          <input
            style={S.search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles…"
          />
          {q && (
            <button style={S.clearBtn} onClick={() => setQ("")}>
              Clear
            </button>
          )}
        </div>

        <div style={S.card}>
          <h3 style={S.groupTitle}>Topics</h3>

          {/* Topic list */}
          {filteredKeys.map((k) => (
            <button
              key={k}
              style={{
                ...S.sectionBtn,
                background: active === k ? "#f1f5ff" : "transparent",
              }}
              onClick={() => setActive(k)}
            >
              {k}
            </button>
          ))}

          {/* Active topic content */}
          {active && (
            <div style={S.panel}>
              <h3 style={{ marginTop: 0, marginBottom: 8, color: "#1940ff" }}>{active}</h3>
              {SECTIONS[active]}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

