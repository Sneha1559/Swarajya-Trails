
import { useState } from "react";
import { BookOpen, Send, Sparkles } from "lucide-react";

const API = "http://127.0.0.1:8000";

export default function History() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);

    try {
      const response = await fetch(
        `${API}/ask-history?question=${encodeURIComponent(question)}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not answer the question.");

      setAnswer(data.answer || data.result || JSON.stringify(data, null, 2));
      setSources(Array.isArray(data.sources) ? data.sources : []);
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "What is the historical importance of Raigad Fort?",
    "Who was Chhatrapati Shivaji Maharaj?",
    "Why were hill forts important in Maharashtra?",
  ];

  return (
    <section className="page-container">
      <div className="page-header">
        <span className="eyebrow"><BookOpen size={15} /> History, Explained</span>
        <h1>Ask the <span className="gold-text">History AI</span></h1>
        <p>Explore Maharashtra's past through questions about forts, historical events, architecture, and the Maratha legacy.</p>
      </div>

      <div className="history-layout">
        <div className="history-intro content-card">
          <div className="round-icon"><BookOpen size={25} /></div>
          <h2>Every fort has a story.</h2>
          <p>Ask a question and get an answer from the historical knowledge available to Swarajya Trails.</p>

          <h3>Try asking</h3>
          <div className="suggestion-list">
            {suggestions.map((item) => (
              <button key={item} className="suggestion-button" onClick={() => setQuestion(item)}>
                {item} <span>↗</span>
              </button>
            ))}
          </div>
        </div>

        <div className="history-chat content-card">
          <div className="results-heading">
            <span className="round-icon small"><Sparkles size={19} /></span>
            <div><h2>Historical Guide</h2><p>Ask your question below</p></div>
          </div>

          <form className="question-form" onSubmit={ask}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about Raigad Fort, Maratha history, or an important event..."
              rows={4}
              required
            />
            <button className="primary-button" disabled={loading}>
              <Send size={16} /> {loading ? "Researching..." : "Ask Question"}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading-message">Searching the historical knowledge base...</div>}

          {answer && (
            <div className="ai-response">
              <div className="ai-label">Historical Answer</div>
              <p className="response-text">{answer}</p>
              {sources.length > 0 && (
                <div className="source-list">
                  <h4>Retrieved sources</h4>
                  {sources.map((source, index) => (
                    <div className="source-item" key={index}>
                      {typeof source === "string" ? source : JSON.stringify(source)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
