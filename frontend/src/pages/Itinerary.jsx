
import { useState } from "react";
import { MapPin, CalendarDays, Clock, Compass, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import "../App.css";

const API_URL = "http://127.0.0.1:8000";

function formatItinerary(value) {
  if (typeof value !== "string") {
    if (Array.isArray(value)) return value.map(String);
    if (value && typeof value === "object") {
      return Object.entries(value).map(([key, item]) => `${key}: ${item}`);
    }
    return [String(value ?? "")];
  }

  return value
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
}

function getDayTitle(line) {
  return /^(day\s*\d+|day\s*one|day\s*two|day\s*three|दिन\s*\d+)/i.test(line);
}

function getTime(line) {
  return /^(\d{1,2}(:\d{2})?\s?(AM|PM)|morning|afternoon|evening|night|early morning)\b/i.test(line);
}

function Itinerary() {
  const [destination, setDestination] = useState("Raigad Fort");
  const [days, setDays] = useState("2");
  const [travelStyle, setTravelStyle] = useState("Heritage and history");
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateItinerary(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setItinerary("");

    try {
      const response = await fetch(`${API_URL}/plan-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destination.trim(),
          days: Number(days),
          travel_style: travelStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to generate your itinerary. Please try again."
        );
      }

      const result = data.itinerary ?? data.answer ?? data;
      setItinerary(
        typeof result === "string" ? result : JSON.stringify(result, null, 2)
      );
    } catch (err) {
      setError(err.message || "Could not connect to the Swarajya Trails server.");
    } finally {
      setLoading(false);
    }
  }

  const lines = formatItinerary(itinerary);
  const sections = [];
  let currentSection = null;

  lines.forEach((line) => {
    if (getDayTitle(line)) {
      currentSection = { title: line, items: [] };
      sections.push(currentSection);
    } else if (currentSection) {
      currentSection.items.push(line);
    } else {
      if (!sections.length) {
        currentSection = { title: "Your Heritage Journey", items: [] };
        sections.push(currentSection);
      }
      currentSection.items.push(line);
    }
  });

  return (
    <main className="itinerary-page">
      <section className="itinerary-heading">
        <span className="itinerary-eyebrow">
          <Compass size={16} /> YOUR JOURNEY, THOUGHTFULLY PLANNED
        </span>
        <h1>
          Your next <span>great journey.</span>
        </h1>
        <p>
          Build a personalised Maharashtra heritage trip, one day at a time.
        </p>
      </section>

      <section className="itinerary-layout">
        <form className="itinerary-form" onSubmit={generateItinerary}>
          <div className="itinerary-card-heading">
            <span className="itinerary-icon"><MapPin size={21} /></span>
            <div>
              <h2>Plan your journey</h2>
              <p>Tell us what your trip should look like.</p>
            </div>
          </div>

          <label htmlFor="destination">Destination or starting point</label>
          <input
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Raigad Fort, Pune"
            required
          />

          <label htmlFor="days">Trip duration</label>
          <select id="days" value={days} onChange={(e) => setDays(e.target.value)}>
            <option value="1">1 day</option>
            <option value="2">2 days</option>
            <option value="3">3 days</option>
            <option value="4">4 days</option>
            <option value="5">5 days</option>
            <option value="7">7 days</option>
          </select>

          <label htmlFor="travelStyle">Travel style</label>
          <select
            id="travelStyle"
            value={travelStyle}
            onChange={(e) => setTravelStyle(e.target.value)}
          >
            <option>Heritage and history</option>
            <option>Adventure and trekking</option>
            <option>Nature and photography</option>
            <option>Family-friendly</option>
            <option>Relaxed exploration</option>
          </select>

          <button className="itinerary-submit" type="submit" disabled={loading}>
            <Sparkles size={17} />
            {loading ? "Planning your journey..." : "Generate My Itinerary"}
          </button>

          <p className="itinerary-form-note">
            <CheckCircle2 size={15} />
            Personalised planning powered by AI
          </p>
        </form>

        <section className="itinerary-results">
          <div className="itinerary-results-heading">
            <div>
              <span className="itinerary-eyebrow">YOUR TRAVEL BLUEPRINT</span>
              <h2>Your itinerary</h2>
              <p>Your journey, organised into clear daily steps.</p>
            </div>
            <span className="itinerary-icon"><CalendarDays size={22} /></span>
          </div>

          {error && (
            <div className="itinerary-error" role="alert">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="itinerary-empty">
              <span className="itinerary-loader"><Sparkles size={24} /></span>
              <h3>Crafting your journey</h3>
              <p>Finding a useful flow for your heritage adventure...</p>
            </div>
          )}

          {!loading && !itinerary && !error && (
            <div className="itinerary-empty">
              <span className="itinerary-empty-icon"><MapPin size={29} /></span>
              <h3>Your journey starts here</h3>
              <p>
                Choose your destination and preferences, then generate your
                personalised day-by-day plan.
              </p>
            </div>
          )}

          {!loading && itinerary && (
            <div className="itinerary-timeline">
              {sections.map((section, index) => (
                <article className="itinerary-day" key={`${section.title}-${index}`}>
                  <div className="itinerary-day-marker">
                    <span>{index + 1}</span>
                    {index !== sections.length - 1 && (
                      <div className="itinerary-day-line" />
                    )}
                  </div>

                  <div className="itinerary-day-content">
                    <span className="itinerary-day-label">
                      DAY {index + 1}
                    </span>
                    <h3>{section.title}</h3>

                    {section.items.length === 0 ? (
                      <p>{section.title}</p>
                    ) : (
                      <div className="itinerary-activities">
                        {section.items.map((item, itemIndex) => (
                          <div className="itinerary-activity" key={`${item}-${itemIndex}`}>
                            <Clock size={16} />
                            <p>{item}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}

              <div className="itinerary-tip">
                <Sparkles size={18} />
                <p>
                  <strong>Before you travel:</strong> Check local conditions,
                  opening arrangements and trekking safety. Travel times and
                  access may vary.
                </p>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Itinerary;
