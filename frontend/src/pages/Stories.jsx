
import { useState } from "react";
import { BookOpen, ScrollText, Sparkles } from "lucide-react";

const API = "http://127.0.0.1:8000";

export default function Stories() {
  const [fort, setFort] = useState("Raigad Fort");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateStory(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStory("");

    try {
      const response = await fetch(`${API}/tell-story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fort }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not generate the story.");

      setStory(
        typeof data === "string" ? data :
        data.story || data.result || data.answer ||
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
        <span className="eyebrow"><ScrollText size={15} /> Tales from the Past</span>
        <h1>Stories Etched in <span className="gold-text">Stone</span></h1>
        <p>Discover the legends, events, and historical significance of Maharashtra's forts through AI-generated storytelling.</p>
      </div>

      <div className="story-banner">
        <div className="story-banner-content">
          <span className="eyebrow">The legacy lives on</span>
          <h2>History is more than dates. It is the stories we carry forward.</h2>
          <p>Choose a fort and let Swarajya Trails bring its history to life.</p>
        </div>
      </div>

      <div className="story-workspace">
        <form className="tool-form" onSubmit={generateStory}>
          <div className="round-icon"><BookOpen size={24} /></div>
          <h2>Choose your story</h2>

          <label>
            Select or enter a fort
            <input
              value={fort}
              onChange={(e) => setFort(e.target.value)}
              placeholder="e.g. Raigad Fort"
              required
            />
          </label>

          <button className="primary-button" disabled={loading}>
            <Sparkles size={17} />
            {loading ? "Writing your story..." : "Tell Me the Story"}
          </button>
        </form>

        <div className="story-content">
          <div className="results-heading">
            <ScrollText size={23} />
            <div><h2>The Chronicle</h2><p>A journey into the past</p></div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading-message">Preparing your historical story...</div>}

          {!story && !loading && !error && (
            <div className="empty-state">
              <BookOpen size={36} />
              <h3>A story awaits</h3>
              <p>Select a fort to explore its historical legacy.</p>
            </div>
          )}

          {story && <div className="response-text story-text">{story}</div>}
        </div>
      </div>
    </section>
  );
}
