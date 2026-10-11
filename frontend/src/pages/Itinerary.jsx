
import { useState } from "react";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";

const API = "http://127.0.0.1:8000";

export default function Itinerary() {
  const [destination, setDestination] = useState("Raigad Fort");
  const [days, setDays] = useState("2");
  const [travelStyle, setTravelStyle] = useState("Heritage and history");
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createItinerary(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setItinerary("");

    try {
      const response = await fetch(`${API}/plan-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          days: Number(days),
          travel_style: travelStyle,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not plan your trip.");

      setItinerary(
        typeof data === "string" ? data :
        data.itinerary || data.plan || data.result ||
        JSON.stringify(data, null, 2)
      );
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-container">
      <div className="page-header">
        <span className="eyebrow"><CalendarDays size={15} /> Your Heritage Journey</span>
        <h1>Plan a Journey <span className="gold-text">Through Time</span></h1>
        <p>Create a personalised travel plan for Maharashtra's historic forts, based on your destination, duration, and travel interests.</p>
      </div>

      <div className="tool-layout">
        <form className="tool-form" onSubmit={createItinerary}>
          <h2>Trip details</h2>

          <label>
            Destination or fort
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Raigad Fort" required />
          </label>

          <label>
            Trip duration
            <select value={days} onChange={(e) => setDays(e.target.value)}>
              <option value="1">1 day</option>
              <option value="2">2 days</option>
              <option value="3">3 days</option>
              <option value="4">4 days</option>
              <option value="5">5 days</option>
              <option value="7">7 days</option>
            </select>
          </label>

          <label>
            Travel style
            <select value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)}>
              <option>Heritage and history</option>
              <option>Adventure and trekking</option>
              <option>Nature and photography</option>
              <option>Family-friendly</option>
              <option>Relaxed exploration</option>
            </select>
          </label>

          <button className="primary-button" disabled={loading}>
            <Sparkles size={17} />
            {loading ? "Planning your trip..." : "Generate Itinerary"}
          </button>
        </form>

        <div className="results-panel">
          <div className="results-heading">
            <CalendarDays size={23} />
            <div><h2>Your travel plan</h2><p>A personalised day-by-day outline</p></div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading-message">Putting together your heritage journey...</div>}

          {!itinerary && !loading && !error && (
            <div className="empty-state">
              <MapPin size={38} />
              <h3>Your journey, thoughtfully planned</h3>
              <p>Enter your destination and preferences to create your itinerary.</p>
            </div>
          )}

          {itinerary && (
            <div className="itinerary-result">
              <div className="ai-label">Your itinerary</div>
              <p className="response-text">{itinerary}</p>
              <p className="small-note">Check current access conditions, weather, and local guidance before travelling.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
