
import { Link } from "react-router-dom";
import { Mountain, MapPin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="heritage-footer">
      <div className="heritage-footer-grid">
        <div>
          <Link to="/" aria-label="Swarajya Trails home">
            <span className="footer-brand">
              <Mountain size={25} />
              <span>Swarajya <strong>Trails</strong></span>
            </span>
          </Link>

          <p>
            Discover Maharashtra's legendary forts, explore their history,
            and plan your next heritage adventure with AI.
          </p>

          <p className="footer-location">
            <MapPin size={17} /> Maharashtra, India
          </p>
        </div>

        <div>
          <h3>Explore</h3>
          <Link to="/forts">Discover Forts</Link><br />
          <Link to="/itinerary">Plan Your Journey</Link><br />
          <Link to="/compare">Compare Forts</Link>
        </div>

        <div>
          <h3>Discover History</h3>
          <Link to="/history">Ask शिवदूत</Link><br />
          <Link to="/stories">Historical Stories</Link><br />
          <Link to="/">Home</Link>
        </div>
      </div>

      <div className="heritage-footer-bottom">
        <span>© {new Date().getFullYear()} Swarajya Trails</span>
        <span>Rooted in history. Made for explorers.</span>
        <a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Back to top <ArrowUpRight size={15} />
        </a>
      </div>
    </footer>
  );
}
