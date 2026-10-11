
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  BookOpen,
  Map,
  Sparkles,
  MapPin,
  Mountain,
} from "lucide-react";

const forts = [
  {
    name: "Raigad Fort",
    location: "Raigad, Maharashtra",
    description: "The historic capital of Chhatrapati Shivaji Maharaj.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Raigad%20Fort%2C%20Maharashtra%20%282018%29.jpg",
    tag: "Historical",
    difficulty: "Moderate",
  },
  {
    name: "Sinhagad Fort",
    location: "Pune, Maharashtra",
    description: "Remembered for the legendary Battle of Sinhagad.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Sinhagad%20Fort%20%2847932%29.jpg",
    tag: "Trekking",
    difficulty: "Moderate",
  },
  {
    name: "Pratapgad Fort",
    location: "Satara, Maharashtra",
    description: "A landmark of Maratha military history.",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85",
    tag: "Historical",
    difficulty: "Moderate",
  },
  {
    name: "Torna Fort",
    location: "Pune district, Maharashtra",
    description: "A celebrated Sahyadri destination for trekkers.",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=85",
    tag: "Adventure",
    difficulty: "Difficult",
  },
];

const features = [
  {
    icon: Mountain,
    title: "Discover Forts",
    description: "Find forts matching your interests and adventure level.",
    to: "/forts",
  },
  {
    icon: Map,
    title: "Plan Itinerary",
    description: "Create a personalized heritage travel plan.",
    to: "/itinerary",
  },
  {
    icon: BookOpen,
    title: "Ask History AI",
    description: "Explore historical answers grounded in documents.",
    to: "/history",
  },
  {
    icon: Sparkles,
    title: "Stories & Insights",
    description: "Discover engaging stories about Maharashtra's heritage.",
    to: "/stories",
  },
];

export default function Home() {
  return (
    <div className="heritage-home">
      <section className="heritage-hero">
        <img
          className="hero-fort-image"
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Raigad%20Fort-Raigad%20-Maharashtra-001.jpg"
          alt="Historic stone fort at Raigad, Maharashtra"
        />

        <div className="hero-overlay" />

        <div className="hero-content">
          <p className="hero-kicker">
            DISCOVER · EXPLORE · EXPERIENCE
          </p>

          <h1>
            Maharashtra's
            <br />
            <span>Legacy</span> Awaits
          </h1>

          <p className="hero-copy">
            Explore historic forts, uncover timeless stories
            and plan your next heritage journey with AI.
          </p>

          <div className="hero-buttons">
            <Link to="/forts" className="gold-button">
              <Compass size={19} />
              Explore Forts
              <ArrowRight size={18} />
            </Link>

            <Link to="/history" className="outline-button">
              <BookOpen size={19} />
              Ask History AI
            </Link>
          </div>
        </div>

        <div className="hero-quote">
          <span>“</span>
          Not just forts,
          <br />
          but stories carved
          <br />
          in stone.
          <i />
        </div>

        <div className="hero-image-label">
          <span>RAIGAD FORT</span>
          <span className="image-dot" />
          <span className="image-dot" />
          <span className="image-dot" />
        </div>
      </section>

      <section className="heritage-main">
        <div className="heritage-intro">
          <div className="intro-art">
            <span className="intro-emblem">⚑</span>
            <span className="intro-art-caption">LAND OF SWARAJYA</span>
          </div>

          <div className="intro-copy-block">
            <p className="section-kicker">YOUR HERITAGE COMPANION</p>
            <h2>
              Explore Maharashtra
              <br />
              in a <span>New Way</span>
            </h2>
            <p>
              Get AI-powered recommendations, historical insights,
              personalized itineraries and immersive stories — all
              in one place.
            </p>
          </div>

          <div className="heritage-feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link
                  to={feature.to}
                  className="heritage-feature"
                  key={feature.title}
                >
                  <Icon size={35} strokeWidth={1.6} />
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <span className="feature-arrow">
                    Explore <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <section className="featured-section">
          <div className="featured-heading">
            <div className="featured-title">
              <h2>Featured Forts</h2>
              <span className="heading-rule" />
              <p>Explore iconic forts of Maharashtra</p>
            </div>

            <Link to="/forts" className="view-all">
              View All Forts <ArrowRight size={16} />
            </Link>
          </div>

          <div className="fort-grid">
            {forts.map((fort) => (
              <article className="fort-card" key={fort.name}>
                <img
                  src={fort.image}
                  alt={fort.name}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.visibility = "hidden";
                  }}
                />

                <div className="fort-card-overlay">
                  <h3>{fort.name}</h3>
                  <p className="fort-location">
                    <MapPin size={14} />
                    {fort.location}
                  </p>
                  <p className="fort-description">{fort.description}</p>

                  <div className="fort-tags">
                    <span>{fort.tag}</span>
                    <span>{fort.difficulty}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
