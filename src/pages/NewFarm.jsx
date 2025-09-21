import { useState } from "react";

const SENSOR_OPTIONS = [
  { key: "do", label: "Dissolved Oxygen" },
  { key: "ph", label: "pH" },
  { key: "temp", label: "Temperature" },
  { key: "nh3", label: "Ammonia (NH₃)" },
  { key: "sal", label: "Salinity" },
  { key: "turb", label: "Turbidity" },
];

const SPECIES_OPTIONS = [
  "Salmon",
  "Prawn",
  "Barramundi",
  "Oyster",
  "Mussel",
  "Other",
];

export default function NewFarm() {
  const [form, setForm] = useState({
    name: "",
    location: "",
    species: "",
    ponds: 1,
    sensors: [],
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "ponds" ? Number(value) : value }));
  }

  function toggleSensor(key) {
    setForm((f) => {
      const has = f.sensors.includes(key);
      return { ...f, sensors: has ? f.sensors.filter((k) => k !== key) : [...f.sensors, key] };
    });
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Please enter a farm name.";
    if (!form.location.trim()) errs.location = "Please enter a location.";
    if (!form.species) errs.species = "Please select a species.";
    if (!Number.isFinite(form.ponds) || form.ponds < 1) errs.ponds = "Number of ponds must be at least 1.";
    if (form.sensors.length === 0) errs.sensors = "Select at least one sensor.";
    return errs;
  }

  function onSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = {
      ...form,
      createdAt: new Date().toISOString(),
    };

    // Lưu tạm để demo; bạn có thể gửi payload này lên API sau
    try {
      localStorage.setItem("bluetracker:newFarmDraft", JSON.stringify(payload));
    } catch {}

    setSubmitted(payload);
    // optionally reset
    // setForm({ name:"", location:"", species:"", ponds:1, sensors:[], notes:"" })
  }

  return (
    <div className="overlay card-md">
      <h1>Register New Farm</h1>
      <form className="form-grid two-col" onSubmit={onSubmit} noValidate>
        {/* Farm Name */}
        <div className="form-group">
          <label htmlFor="name">Farm Name</label>
          <input
            id="name"
            name="name"
            placeholder="e.g., Coral Bay Aquafarm"
            value={form.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            required
          />
          {errors.name && <small className="error">{errors.name}</small>}
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            placeholder="e.g., Huon Valley, TAS"
            value={form.location}
            onChange={handleChange}
            aria-invalid={!!errors.location}
            required
          />
          {errors.location && <small className="error">{errors.location}</small>}
        </div>

        {/* Species */}
        <div className="form-group">
          <label htmlFor="species">Species Farmed</label>
          <select
            id="species"
            name="species"
            value={form.species}
            onChange={handleChange}
            aria-invalid={!!errors.species}
            required
          >
            <option value="">Select species…</option>
            {SPECIES_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.species && <small className="error">{errors.species}</small>}
        </div>

        {/* Number of Ponds */}
        <div className="form-group">
          <label htmlFor="ponds">Number of Ponds</label>
          <input
            id="ponds"
            name="ponds"
            type="number"
            min={1}
            placeholder="e.g., 8"
            value={form.ponds}
            onChange={handleChange}
            aria-invalid={!!errors.ponds}
            required
          />
          {errors.ponds && <small className="error">{errors.ponds}</small>}
        </div>

        {/* Sensor Setup */}
        <div className="form-group full-span">
          <fieldset className="fieldset">
            <legend>Sensor Setup</legend>
            <div className="checkbox-list">
              {SENSOR_OPTIONS.map((s) => (
                <label key={s.key} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={form.sensors.includes(s.key)}
                    onChange={() => toggleSensor(s.key)}
                  />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
            {errors.sensors && <small className="error">{errors.sensors}</small>}
            <small className="help">You can add/remove sensors later in farm settings.</small>
          </fieldset>
        </div>

        {/* Notes (optional) */}
        <div className="form-group full-span">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Any special requirements or remarks..."
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        {/* Actions */}
        <div className="actions full-span">
          <button type="submit" className="btn-primary">Register Farm</button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setForm({ name:"", location:"", species:"", ponds:1, sensors:[], notes:"" });
              setErrors({});
              setSubmitted(null);
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Success preview */}
      {submitted && (
        <div className="success-panel">
          <strong>✅ Farm registered (demo)!</strong>
          <div className="success-grid">
            <div><b>Name:</b> {submitted.name}</div>
            <div><b>Location:</b> {submitted.location}</div>
            <div><b>Species:</b> {submitted.species}</div>
            <div><b>Ponds:</b> {submitted.ponds}</div>
            <div className="full-span"><b>Sensors:</b> {submitted.sensors.map(k => SENSOR_OPTIONS.find(o=>o.key===k)?.label).join(", ")}</div>
            {submitted.notes && <div className="full-span"><b>Notes:</b> {submitted.notes}</div>}
          </div>
          <small className="help">Data is saved locally for demo. Wire up to your API when ready.</small>
        </div>
      )}
    </div>
  );
}
