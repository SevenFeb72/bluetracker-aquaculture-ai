import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

/* -------------------- Demo farms + data -------------------- */
const FARMS = [
  { id: "farm-a", name: "Blue Bay Salmon", ponds: ["Pond A1", "Pond A2"] },
  { id: "farm-b", name: "Coral Prawn Estate", ponds: ["Pond B1", "Pond B2", "Pond B3"] },
  { id: "farm-c", name: "Mussel Cove", ponds: ["Pond C1"] },
];

function generateData({ days = 7, stepHrs = 6, farmId = "farm-a" }) {
  const out = [];
  const now = new Date();
  const start = new Date(now.getTime() - days * 24 * 3600 * 1000);
  const ponds = FARMS.find(f => f.id === farmId)?.ponds ?? ["Pond"];
  for (let t = start.getTime(); t <= now.getTime(); t += stepHrs * 3600 * 1000) {
    const d = new Date(t);
    const temp = 23 + 3 * Math.sin(t / 3.6e6 / 6) + (Math.random() - 0.5) * 1.2;
    const ph   = 6.9 + 0.5 * Math.sin(t / 3.6e6 / 10) + (Math.random() - 0.5) * 0.18;
    const nh3  = Math.max(0.06, 0.12 + 0.25 * Math.random());
    const dox  = 7.2 + 0.8 * Math.cos(t / 3.6e6 / 8) + (Math.random() - 0.5) * 0.3;
    out.push({
      ts: d.toISOString(),
      temp: +temp.toFixed(2),
      ph:   +ph.toFixed(2),
      nh3:  +nh3.toFixed(2),
      dox:  +dox.toFixed(2),
      farm: farmId,
      pond: ponds[Math.floor(Math.random() * ponds.length)],
    });
  }
  return out;
}

/* -------------------- Responsive SVG line chart + tooltip -------------------- */
function useContainerWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => setW(entries[0].target.clientWidth));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function LineChart({
  data, xKey = "ts", yKey,
  minY, maxY, bands = [],
  color = "currentColor",
  tooltipFmt = (d) => `${new Date(d.ts).toLocaleString()}\n${d[yKey]}`
}) {
  const [wrapRef, width] = useContainerWidth();
  const height = 200;
  const pad = { l: 44, r: 10, t: 12, b: 26 };

  const xs = data.map(d => new Date(d[xKey]).getTime());
  const ys = data.map(d => d[yKey]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = minY ?? Math.min(...ys), yMax = maxY ?? Math.max(...ys);

  const sx = (t) => pad.l + ((t - xMin) / (xMax - xMin || 1)) * (width - pad.l - pad.r);
  const sy = (v) => height - pad.b - ((v - yMin) / (yMax - yMin || 1)) * (height - pad.t - pad.b);

  const dPath = data.map((d, i) =>
    `${i ? "L" : "M"} ${sx(new Date(d[xKey]).getTime())} ${sy(d[yKey])}`
  ).join(" ");

  // tooltip
  const [hover, setHover] = useState(null); // {i,x,y,row}
  function onMove(e) {
    if (!data.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let bestI = 0, best = Infinity;
    data.forEach((d, i) => {
      const tx = sx(new Date(d[xKey]).getTime());
      const dist = Math.abs(tx - x);
      if (dist < best) { best = dist; bestI = i; }
    });
    const row = data[bestI];
    setHover({ i: bestI, x: sx(new Date(row[xKey]).getTime()), y: sy(row[yKey]), row });
  }
  function onLeave() { setHover(null); }

  // ticks
  const ticks = 4;
  const tvals = [...Array(ticks + 1)].map((_, i) => new Date(xMin + (i / ticks) * (xMax - xMin)));

  return (
    <div className="chart-wrap" ref={wrapRef}>
      <svg width={width} height={height} onMouseMove={onMove} onMouseLeave={onLeave} role="img">
        {/* safe bands */}
        {bands.map(([y0, y1, c], i) => (
          <rect key={i}
            x={pad.l} y={sy(y1)}
            width={width - pad.l - pad.r}
            height={Math.max(0, sy(y0) - sy(y1))}
            fill={c} opacity="0.12" />
        ))}

        {/* axes */}
        <line x1={pad.l} y1={height - pad.b} x2={width - pad.r} y2={height - pad.b} stroke="#dbe4f3" />
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={height - pad.b} stroke="#dbe4f3" />

        {/* x ticks */}
        {tvals.map((t, i) => (
          <g key={i} transform={`translate(${sx(t.getTime())}, ${height - pad.b})`}>
            <line y2="6" stroke="#dbe4f3" />
            <text y="18" textAnchor="middle" fontSize="11" fill="#64748b">
              {t.toLocaleDateString()}
            </text>
          </g>
        ))}

        {/* y min/max */}
        <text x="6" y={sy(yMax)} fontSize="10" fill="#64748b">{yMax}</text>
        <text x="6" y={sy(yMin)} fontSize="10" fill="#64748b">{yMin}</text>

        {/* line */}
        <path d={dPath} fill="none" stroke={color} strokeWidth="2.5" />

        {hover && (
          <>
            <line x1={hover.x} x2={hover.x} y1={pad.t} y2={height - pad.b} stroke="#94a3b8" strokeDasharray="3 3" />
            <circle cx={hover.x} cy={hover.y} r="3.5" fill={color} />
          </>
        )}
      </svg>

      {hover && (
        <div className="chart-tooltip" style={{ left: hover.x + 8, top: hover.y + 8 }}>
          {tooltipFmt(hover.row).split("\n").map((s, i) => <div key={i}>{s}</div>)}
        </div>
      )}
    </div>
  );
}

/* -------------------- utils -------------------- */
const THRESHOLDS = {
  temp: { min: 24,  max: 30,  label: "Water Temp (°C)" },
  ph:   { min: 6.5, max: 8.2, label: "pH" },
  nh3:  { min: 0,   max: 0.5, label: "Ammonia (mg/L)" },
  dox:  { min: 6.5, max: 8.5, label: "Dissolved Oxygen (mg/L)" },
};
const pretty = {
  temp: "Water Temp (°C)",
  ph:   "pH",
  nh3:  "Ammonia (mg/L)",
  dox:  "Dissolved Oxygen (mg/L)",
};
const avg = (arr) => arr.length ? (arr.reduce((a,b)=>a+b,0) / arr.length) : 0;
const fmtTS = (iso) => new Date(iso).toLocaleString();

/* -------------------- page -------------------- */
export default function CurrentFarms() {
  const [search, setSearch] = useSearchParams();

  // init from URL
  const initShow = JSON.parse(search.get("show") || '{"temp":true,"ph":true,"nh3":true,"dox":true}');
  const [farm, setFarm]   = useState(search.get("farm") || FARMS[0].id);
  const ponds             = FARMS.find(f=>f.id===farm)?.ponds ?? [];
  const [pond, setPond]   = useState(search.get("pond") || "All");
  const [from, setFrom]   = useState(search.get("from") || "");
  const [to, setTo]       = useState(search.get("to") || "");
  const [show, setShow]   = useState(initShow);
  const [auto, setAuto]   = useState(search.get("auto") === "1");

  const [raw, setRaw] = useState(() => generateData({ farmId: farm }));
  useEffect(() => { setRaw(generateData({ farmId: farm })); setPond("All"); }, [farm]);

  // sync → URL
  useEffect(() => {
    const next = new URLSearchParams(search);
    next.set("farm", farm);
    next.set("pond", pond);
    if (from) next.set("from", from); else next.delete("from");
    if (to)   next.set("to", to);     else next.delete("to");
    next.set("auto", auto ? "1" : "0");
    next.set("show", JSON.stringify(show));
    setSearch(next, { replace: true });
  }, [farm, pond, from, to, auto, show]); // eslint-disable-line

  // auto refresh demo
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      const last = raw[raw.length - 1];
      const t = new Date(last ? last.ts : new Date()).getTime() + 6 * 3600 * 1000;
      const base = { farm, pond: ponds[(Math.random()*ponds.length)|0] };
      const temp = 23 + 3 * Math.sin(t / 3.6e6 / 6) + (Math.random() - 0.5) * 1.2;
      const ph   = 6.9 + 0.5 * Math.sin(t / 3.6e6 / 10) + (Math.random() - 0.5) * 0.18;
      const nh3  = Math.max(0.06, 0.12 + 0.25 * Math.random());
      const dox  = 7.2 + 0.8 * Math.cos(t / 3.6e6 / 8) + (Math.random() - 0.5) * 0.3;
      setRaw(r => [...r.slice(-200), {
        ...base, ts: new Date(t).toISOString(),
        temp:+temp.toFixed(2), ph:+ph.toFixed(2),
        nh3:+nh3.toFixed(2), dox:+dox.toFixed(2)
      }]);
    }, 10000);
    return () => clearInterval(id);
  }, [auto, farm, ponds, raw]);

  const filtered = useMemo(() => {
    return raw.filter(r => {
      if (pond !== "All" && r.pond !== pond) return false;
      if (from && new Date(r.ts) < new Date(from)) return false;
      if (to   && new Date(r.ts) > new Date(to + "T23:59:59")) return false;
      return true;
    });
  }, [raw, pond, from, to]);

  const stats = useMemo(() => ({
    temp: { avg: avg(filtered.map(d=>d.temp)), min: Math.min(...filtered.map(d=>d.temp)), max: Math.max(...filtered.map(d=>d.temp)) },
    ph:   { avg: avg(filtered.map(d=>d.ph)),   min: Math.min(...filtered.map(d=>d.ph)),   max: Math.max(...filtered.map(d=>d.ph)) },
    nh3:  { avg: avg(filtered.map(d=>d.nh3)),  min: Math.min(...filtered.map(d=>d.nh3)),  max: Math.max(...filtered.map(d=>d.nh3)) },
    dox:  { avg: avg(filtered.map(d=>d.dox)),  min: Math.min(...filtered.map(d=>d.dox)),  max: Math.max(...filtered.map(d=>d.dox)) },
    count: filtered.length,
    latest: filtered[filtered.length - 1],
  }), [filtered]);

  // % thời gian an toàn
  const safePct = useMemo(() => {
    const out = {};
    const total = filtered.length || 1;
    ["temp","ph","nh3","dox"].forEach(k => {
      const thr = THRESHOLDS[k];
      const ok = filtered.filter(d => d[k] >= thr.min && d[k] <= thr.max).length;
      out[k] = Math.round((ok / total) * 100);
    });
    return out;
  }, [filtered]);

  const alerts = useMemo(() => {
    const res = [];
    if (!stats.latest) return res;
    for (const k of ["temp","ph","nh3","dox"]) {
      const thr = THRESHOLDS[k], v = stats.latest[k];
      if (v < thr.min) res.push({ level:"warning", text:`${pretty[k]} ${v} < min ${thr.min}` });
      else if (v > thr.max) res.push({ level:"danger", text:`${pretty[k]} ${v} > max ${thr.max}` });
    }
    return res;
  }, [stats.latest]);

  function downloadCSV(rows, name="current-farm.csv"){
    if (!rows.length) return;
    const header = Object.keys(rows[0]).join(",");
    const body = rows.map(r => Object.values(r).join(",")).join("\n");
    const blob = new Blob([header+"\n"+body], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href:url, download:name });
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  return (
    <div className="overlay overlay-wide">
      <h1>Current Farm</h1>

      {/* Filters */}
      <div className="filter-row wrap">
        <label>Farm
          <select value={farm} onChange={e=>setFarm(e.target.value)}>
            {FARMS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </label>
        <label>Pond
          <select value={pond} onChange={e=>setPond(e.target.value)}>
            <option>All</option>
            {ponds.map(p => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label>From
          <input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        </label>
        <label>To
          <input type="date" value={to} onChange={e=>setTo(e.target.value)} />
        </label>
        <label className="toggle on" style={{alignSelf:"end"}}>
          <input type="checkbox" checked={auto} onChange={()=>setAuto(a=>!a)} />
          <span>Auto refresh</span>
        </label>
        <button className="btn-primary" onClick={()=>downloadCSV(filtered)}>Export CSV</button>
      </div>

      {/* 2 columns */}
      <div className="dash-grid">
        {/* LEFT */}
        <section className="card">
          <div className="section-title">Farm Overview</div>
          <div className="overview">
            <div><b>Farm:</b> {FARMS.find(f=>f.id===farm)?.name}</div>
            <div><b>Ponds:</b> {ponds.join(", ")}</div>
            <div><b>Records:</b> {stats.count}</div>
            {stats.latest && <div><b>Last sample:</b> {fmtTS(stats.latest.ts)}</div>}
          </div>

          <div className="kpi-grid">
            <KPI title="Avg Temp (°C)" value={stats.temp.avg.toFixed(2)} sub={`min ${stats.temp.min.toFixed(2)} • max ${stats.temp.max.toFixed(2)}`} />
            <KPI title="Avg pH" value={stats.ph.avg.toFixed(2)} sub={`min ${stats.ph.min.toFixed(2)} • max ${stats.ph.max.toFixed(2)}`} />
            <KPI title="Avg NH₃ (mg/L)" value={stats.nh3.avg.toFixed(2)} sub={`min ${stats.nh3.min.toFixed(2)} • max ${stats.nh3.max.toFixed(2)}`} />
            <KPI title="Avg DO (mg/L)" value={stats.dox.avg.toFixed(2)} sub={`min ${stats.dox.min.toFixed(2)} • max ${stats.dox.max.toFixed(2)}`} />
          </div>

          <h2>Sensor Data</h2>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Water Temp (°C)</th>
                  <th>pH</th>
                  <th>Ammonia (mg/L)</th>
                  <th>DO (mg/L)</th>
                  <th>Pond</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r,i)=>(
                  <tr key={i}>
                    <td>{fmtTS(r.ts)}</td>
                    <td>{r.temp}</td>
                    <td>{r.ph}</td>
                    <td>{r.nh3}</td>
                    <td>{r.dox}</td>
                    <td>{r.pond}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* RIGHT */}
        <section className="card">
          <div className="section-title">Live Data Panel</div>
          {stats.latest ? (
            <div className="live-grid">
              {["temp","ph","nh3","dox"].map(k => (
                <div key={k} className="live-item">
                  <div className="live-name">{pretty[k]}</div>
                  <div className="live-value">{stats.latest[k]}</div>
                  <BadgeFor k={k} v={stats.latest[k]} />
                </div>
              ))}
            </div>
          ) : <div>No data.</div>}

          <div className="section-title" style={{marginTop:".8rem"}}>AI Alerts</div>
          {alerts.length ? (
            <ul className="alerts">
              {alerts.map((a,i)=>(
                <li key={i} className={`badge ${a.level}`}>{a.text}</li>
              ))}
            </ul>
          ) : <div className="muted">All sensors within safe ranges.</div>}

          {/* toggle bar ABOVE charts */}
          <div className="toggle-bar">
            {Object.keys(show).map(k=>(
              <label key={k} className={`toggle ${show[k]?"on":""}`}>
                <input type="checkbox" checked={show[k]} onChange={()=>setShow(s=>({...s,[k]:!s[k]}))}/>
                <span>{pretty[k]} <em className="muted">• {safePct[k]}% safe</em></span>
              </label>
            ))}
          </div>

          {/* charts */}
          <div className="charts">
            {show.temp && (
              <ChartCard title="Water Temperature (°C)" color="#0ea5e9">
                <LineChart
                  data={filtered}
                  yKey="temp"
                  minY={20}
                  maxY={32}
                  bands={[[THRESHOLDS.temp.min, THRESHOLDS.temp.max, "#22d3ee"]]}
                  color="#0ea5e9"
                  tooltipFmt={(d)=>`${new Date(d.ts).toLocaleString()}\n${d.temp} °C`}
                />
              </ChartCard>
            )}
            {show.ph && (
              <ChartCard title="pH Level" color="#10b981">
                <LineChart
                  data={filtered}
                  yKey="ph"
                  minY={6.2}
                  maxY={8.6}
                  bands={[[THRESHOLDS.ph.min, THRESHOLDS.ph.max, "#34d399"]]}
                  color="#10b981"
                  tooltipFmt={(d)=>`${new Date(d.ts).toLocaleString()}\npH ${d.ph}`}
                />
              </ChartCard>
            )}
            {show.nh3 && (
              <ChartCard title="Ammonia (mg/L)" color="#f59e0b">
                <LineChart
                  data={filtered}
                  yKey="nh3"
                  minY={0}
                  maxY={1.2}
                  bands={[[THRESHOLDS.nh3.min, THRESHOLDS.nh3.max, "#fbbf24"]]}
                  color="#f59e0b"
                  tooltipFmt={(d)=>`${new Date(d.ts).toLocaleString()}\nNH₃ ${d.nh3} mg/L`}
                />
              </ChartCard>
            )}
            {show.dox && (
              <ChartCard title="Dissolved Oxygen (mg/L)" color="#6366f1">
                <LineChart
                  data={filtered}
                  yKey="dox"
                  minY={5.5}
                  maxY={9}
                  bands={[[THRESHOLDS.dox.min, THRESHOLDS.dox.max, "#818cf8"]]}
                  color="#6366f1"
                  tooltipFmt={(d)=>`${new Date(d.ts).toLocaleString()}\nDO ${d.dox} mg/L`}
                />
              </ChartCard>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function KPI({title, value, sub}) {
  return (
    <div className="kpi">
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

function ChartCard({title, color="#6366f1", children}) {
  return (
    <div className="chart-card" style={{color}}>
      <div className="chart-title">{title}</div>
      {children}
    </div>
  );
}

function BadgeFor({k, v}) {
  const thr = THRESHOLDS[k];
  if (v < thr.min) return <span className="badge warning">low</span>;
  if (v > thr.max) return <span className="badge danger">high</span>;
  return <span className="badge ok">ok</span>;
}
