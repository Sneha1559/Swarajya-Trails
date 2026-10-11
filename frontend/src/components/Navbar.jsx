
import { Link, NavLink } from "react-router-dom";
import { Mountain, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/forts", label: "Explore Forts" },
  { to: "/history", label: "शिवदूत" },
  { to: "/itinerary", label: "Itinerary" },
  { to: "/stories", label: "Stories" },
  { to: "/compare", label: "Compare Forts" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
        <span className="brand-icon"><Mountain size={25} /></span>
        <span>Swarajya <b>Trails</b></span>
      </Link>

      <button
        className="mobile-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        {menuOpen ? <X size={23} /> : <Menu size={23} />}
      </button>

      <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <Link to="/forts" className="nav-cta">
        Begin Exploring <span>↗</span>
      </Link>
    </header>
  );
}
