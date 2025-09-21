import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="hero hero--with-bg">
      <h1 className="hero-title hero-title--white">Welcome To BlueTracker</h1>

      <p className="hero-subtitle hero-subtitle--bigger">
        <span>AI-powered</span>
        <span className="dot">•</span>
        <span>Sustainable</span>
        <span className="dot">•</span>
        <span>Smarter</span>
      </p>

      <div className="cta-row">
        {/* ✅ giữ kiểu nút cũ: dùng class card-cta */}
        <Link className="card-cta" to="/current-farms"><strong>Current Farm</strong></Link>
        <Link className="card-cta" to="/new-farms"><strong>New Farm</strong></Link>
      </div>

      <footer className="site-copy">
        © 2025 BlueTracker | <a href="#">Terms of Use</a> | <a href="#">Privacy Policy</a> | Design by the BlueTracker Team
      </footer>
    </main>
  );
}

