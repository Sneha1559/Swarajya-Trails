
import { useState } from "react";
import { ArrowLeftRight, Mountain, Sparkles } from "lucide-react";

const API = "http://127.0.0.1:8000";

export default function Compare() {
  const [fortA, setFortA] = useState("Raigad Fort");
  const [fortB, setFortB] = useState("Sinhagad Fort");
  const [comparison, setComparison] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function compare(e) {
    e.preventDefault();

    if (fortA.trim().toLowerCase() === fortB.trim().toLowerCase()) {
      setError("Choose two different forts to compare.");
      return;
    }

    setLoading(true);
    setError("");
    setComparison("");

    try {
      const response = await fetch(`${API}/compare-forts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fort_a: fortA, fort_b: fortB }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not compare forts.");

      setComparison(
        typeof data === "string" ? data :
        data.comparison || data.result || data.answer ||
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
        <span className="eyebrow"><ArrowLeftRight size={15} /> Discover the Differences</span>
        <h1>Two Forts. Two Legacies. <span className="gold-text">One Journey.</span></h1>
        <p>Compare historic forts to explore their history, geographical setting, architectural features, and visitor experience.</p>
      </div>

      <form className="compare-form content-card" onSubmit={compare}>
        <div className="comparison-grid">
          <label>
            <span className="fort-field-label"><Mountain size={17} /> First fort</span>
            <input value={fortA} onChange={(e) => setFortA(e.target.value)} required />
          </label>

          <div className="versus">VS</div>

          <label>
            <span className="fort-field-label"><Mountain size={17} /> Second fort</span>
            <input value={fortB} onChange={(e) => setFortB(e.target.value)} required />
          </label>
        </div>

        <button className="primary-button compare-submit" disabled={loading}>
          <Sparkles size={17} />
          {loading ? "Comparing forts..." : "Compare Forts"}
        </button>
      </form>

      {error && <div className="error-message comparison-message">{error}</div>}
      {loading && <div className="loading-message">Examining the history and characteristics of both forts...</div>}

      {comparison && (
        <section className="comparison-result">
          <div className="results-heading">
            <ArrowLeftRight size={23} />
            <div><h2>Your comparison</h2><p>{fortA} and {fortB}</p></div>
          </div>
          <div className="ai-response">
            <div className="ai-label">Comparative Analysis</div>
            <p className="response-text">{comparison}</p>
          </div>
        </section>
      )}

      {!comparison && !loading && !error && (
        <div className="empty-state compare-empty">
          <Mountain size={38} />
          <h3>Discover what makes each fort unique</h3>
          <p>Choose two forts above to generate a historical comparison.</p>
        </div>
      )}
    </section>
  );
}
