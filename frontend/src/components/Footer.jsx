
import { Link } from "react-router-dom";
import { Mountain, MapPin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="brand footer-logo">
            <span className="brand-icon"><Mountain size={25} /></span>
            <span>Swarajya <b>Trails</b></span>
          </Link>
          <p>
            Discover Maharashtra's legendary forts, explore its history,
            and plan your next heritage adventure.
          </p>
          <span className="footer-location">
            <MapPin size={15} /> Maharashtra, India
          </span>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <Link to="/forts">Discover Forts</Link>
          <Link to="/itinerary">Plan Your Journey</Link>
          <Link to="/compare">Compare Forts</Link>
        </div>

        <div className="footer-links">
          <h4>Discover History</h4>
          <Link to="/history">Ask History AI</Link>
          <Link to="/stories">Historical Stories</Link>
          <Link to="/">Home</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Swarajya Trails</span>
        <span>Rooted in history. Made for explorers.</span>
        <Link to="/" className="back-to-top">
          Back to top <ArrowUpRight size={15} />
        </Link>
      </div>
    </footer>
  );
}
