import React, { useState } from "react";

const initial = { name: "", email: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null); // { type: "ok"|"error", text: string }

  function validate(values) {
    const e = {};
    if (!values.name.trim()) e.name = "Please enter your name.";
    if (!values.email.trim()) e.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      e.email = "Please enter a valid email address.";
    if (!values.subject.trim()) e.subject = "Please add a subject.";
    if (!values.message.trim()) e.message = "Please write your message.";
    return e;
  }

  async function onSubmit(evt) {
    evt.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setSending(true);
    try {
      // giả lập call API
      await new Promise((r) => setTimeout(r, 1200));
      setToast({ type: "ok", text: "Thanks! Your message has been sent." });
      setForm(initial);
    } catch (err) {
      setToast({ type: "error", text: "Oops, something went wrong. Please try again." });
    } finally {
      setSending(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  return (
    <div className="overlay overlay-wide">
      <div className="contact-grid">
        {/* LEFT: form */}
        <section className="contact-card">
          <h1>Contact Us</h1>
          <form className="contact-form" onSubmit={onSubmit} noValidate>
            <label>
              <span>Your Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby="err-name"
                placeholder="Your Name"
              />
              {errors.name && <small id="err-name" className="error">{errors.name}</small>}
            </label>

            <label>
              <span>Your Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby="err-email"
                placeholder="you@example.com"
              />
              {errors.email && <small id="err-email" className="error">{errors.email}</small>}
            </label>

            <label>
              <span>Subject</span>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setField("subject", e.target.value)}
                aria-invalid={!!errors.subject}
                aria-describedby="err-subject"
                placeholder="Subject"
              />
              {errors.subject && <small id="err-subject" className="error">{errors.subject}</small>}
            </label>

            <label>
              <span>Your Message</span>
              <textarea
                rows={8}
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
                aria-invalid={!!errors.message}
                aria-describedby="err-message"
                placeholder="Write your message…"
              />
              {errors.message && <small id="err-message" className="error">{errors.message}</small>}
            </label>

            <div className="actions">
              <button className="btn-primary" type="submit" disabled={sending}>
                {sending ? "Sending…" : "Send Message"}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setForm(initial)} disabled={sending}>
                Clear
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT: info */}
        <aside className="contact-info">
          <h3>Contact Information</h3>
          <ul>
            <li><b>Email:</b> support@bluetracker.com</li>
            <li><b>Phone:</b> +61 123 456 789</li>
            <li><b>Address:</b> 123 Ocean Drive, Sydney, Australia</li>
          </ul>

          <h4>Follow Us</h4>
          <p className="socials">
            <a href="#" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="#" target="_blank" rel="noreferrer">GitHub</a>
            <a href="#" target="_blank" rel="noreferrer">Twitter</a>
          </p>

          {/* Optional: Google Map (bật lên nếu bạn muốn) */}
          {/* <div className="map">
            <iframe
              title="map"
              width="100%"
              height="220"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.975... (your map url)"
            />
          </div> */}
        </aside>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
