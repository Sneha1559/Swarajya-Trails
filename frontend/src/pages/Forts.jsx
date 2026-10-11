
import { useState } from "react";
import { Compass, Mountain, Sparkles } from "lucide-react";

const API = "http://127.0.0.1:8000";

export default function Forts() {
  const [interests, setInterests] = useState("History and architecture");
  const [difficulty, setDifficulty] = useState("Moderate");
  const [region, setRegion] = useState("Any region");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function recommend(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch(`${API}/recommend-forts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests, difficulty, region }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Request failed.");

      setResult(
        typeof data === "string" ? data :
        data.recommendations || data.result || data.answer ||
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
        <span className="eyebrow"><Mountain size={15} /> Discover Maharashtra</span>
        <h1>Find Your Next <span className="gold-text">Fort Adventure</span></h1>
        <p>Tell us what you enjoy. Let AI help you discover forts that match your interests and trekking comfort.</p>
      </div>

      <div className="tool-layout">
        <form className="tool-form" onSubmit={recommend}>
          <h2>Personalise your journey</h2>

          <label>
            What interests you?
            <select value={interests} onChange={(e) => setInterests(e.target.value)}>
              <option>History and architecture</option>
              <option>Trekking and adventure</option>
              <option>Photography and nature</option>
              <option>Maratha history</option>
              <option>Family heritage trip</option>
              <option>Offbeat destinations</option>
            </select>
          </label>

          <label>
            Preferred difficulty
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option>Easy</option>
              <option>Moderate</option>
              <option>Difficult</option>
              <option>Any difficulty</option>
            </select>
          </label>

          <label>
            Preferred region
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option>Any region</option>
              <option>Pune</option>
              <option>Raigad</option>
              <option>Nashik</option>
              <option>Satara</option>
              <option>Kolhapur</option>
            </select>
          </label>

          <button className="primary-button" disabled={loading}>
            <Sparkles size={17} />
            {loading ? "Finding forts..." : "Recommend Forts"}
          </button>
        </form>

        <div className="results-panel">
          <div className="results-heading">
            <Compass size={22} />
            <div>
              <h2>Your recommendations</h2>
              <p>Personalised heritage suggestions</p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading && <div className="loading-message">Exploring possible destinations...</div>}

          {!result && !loading && !error && (
            <div className="empty-state">
              <Mountain size={38} />
              <h3>Your adventure starts here</h3>
              <p>Choose your preferences and select Recommend Forts to see your results.</p>
            </div>
          )}

          {result && <div className="ai-response"><div className="ai-label">AI Recommendations</div><p className="response-text">{result}</p></div>}
        </div>
      </div>
    </section>
  );
}
