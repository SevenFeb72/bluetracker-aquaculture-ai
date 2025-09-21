import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <Link to="/" className="brand" aria-label="BlueTracker">
        <img src={logo} alt="" />
        <span>BlueTracker</span>
      </Link>

      <button
        className="hamburger"
        aria-label="Toggle menu"
        onClick={() => setOpen((s) => !s)}
      >
        <span></span><span></span><span></span>
      </button>

      <nav className={`nav-links ${open ? "open" : ""}`}>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/help">Help</NavLink>
        <NavLink to="/contact">Contact Us</NavLink>
        <NavLink to="/login" className="login-btn">Login</NavLink>
        
      </nav>
    </header>
  );
}
