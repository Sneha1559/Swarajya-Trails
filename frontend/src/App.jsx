
import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Link, useNavigate } from "react-router-dom";
import {
  Mountain, Map, BookOpen, Sparkles, ArrowRight, ArrowUpRight,
  MapPin, Clock, CalendarDays, Compass, Menu, X, Send,
  LoaderCircle, ScrollText, GitCompareArrows, AlertCircle, Landmark
} from "lucide-react";
import "./App.css";

const API = "http://127.0.0.1:8000";

// Real photographs of Maharashtra forts from Wikimedia Commons.
const forts = [
  {
    name: "Raigad Fort",
    place: "Raigad district",
    category: "Capital of Swarajya",
    difficulty: "Moderate",
    description: "The historic capital associated with Chhatrapati Shivaji Maharaj.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Raigad%20Fort%2C%20Maharashtra%20%282018%29.jpg?width=1000"
  },
  {
    name: "Sinhagad Fort",
    place: "Near Pune",
    category: "Battle of Sinhagad",
    difficulty: "Moderate",
    description: "A celebrated hill fort associated with Tanaji Malusare.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Sinhagad%20Fort%20%2847642%29.jpg?width=1000"
  },
  {
    name: "Pratapgad Fort",
    place: "Satara district",
    category: "Maratha history",
    difficulty: "Moderate",
    description: "A historic fort near Mahabaleshwar, known for the encounter of 1659.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Pratapgad%20fort%20in%20Maharashtra.jpg?width=1000"
  },
  {
    name: "Torna Fort",
    place: "Pune district",
    category: "Mountain adventure",
    difficulty: "Difficult",
    description: "A prominent Sahyadri fort associated with Shivaji Maharaj's early conquests.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/A%20view%20of%20fort%20torna%20in%20monsoon.jpg?width=1000"
  }
];

const heroImage = forts[0].image;

async function postData(path, body) {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : "The request could not be completed.");
  }
  return data;
}

async function getData(path) {
  const response = await fetch(`${API}${path}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : "The request could not be completed.");
  }
  return data;
}

function getText(data, keys) {
  for (const key of keys) {
    if (data?.[key] !== undefined && data[key] !== null) {
      return typeof data[key] === "string"
        ? data[key]
        : JSON.stringify(data[key], null, 2);
    }
  }
  return typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    ["/", "Home"],
    ["/forts", "Explore Forts"],
    ["/history", "शिवदूत"],
    ["/itinerary", "Itinerary"],
    ["/stories", "Stories"],
    ["/compare", "Compare Forts"]
  ];

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-mark"><Mountain size={25} /></span>
          <span>Swarajya <b>Trails</b></span>
        </Link>
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "nav-links nav-open" : "nav-links"}>
          {links.map(([path, label]) => (
            <NavLink end={path === "/"} key={path} to={path} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <Link className="nav-cta" to="/forts">Begin Exploring <ArrowUpRight size={16} /></Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-about">
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark"><Mountain size={25} /></span>
            <span>Swarajya <b>Trails</b></span>
          </Link>
          <p>Discover Maharashtra's forts, uncover their stories and plan a journey through Maratha heritage.</p>
          <span className="footer-location"><MapPin size={16} /> Maharashtra, India</span>
        </div>
        <div className="footer-column">
          <h3>Explore</h3>
          <Link to="/forts">Explore Forts</Link>
          <Link to="/itinerary">Plan a Journey</Link>
          <Link to="/compare">Compare Forts</Link>
        </div>
        <div className="footer-column">
          <h3>Discover History</h3>
          <Link to="/history">Ask शिवदूत</Link>
          <Link to="/stories">Historical Stories</Link>
          <Link to="/">Home</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Swarajya Trails</span>
        <span>Rooted in history. Made for explorers.</span>
        <a href="#top">Back to top <ArrowUpRight size={15} /></a>
      </div>
    </footer>
  );
}

function PageHeading({ eyebrow, title, accent, description }) {
  return (
    <div className="page-heading">
      <span className="eyebrow"><Sparkles size={15} /> {eyebrow}</span>
      <h1>{title} <span>{accent}</span></h1>
      <p>{description}</p>
    </div>
  );
}

function Message({ error }) {
  if (!error) return null;
  return <div className="error-message" role="alert"><AlertCircle size={19} /><span>{error}</span></div>;
}

function ResultPanel({ title, subtitle, icon: Icon = Sparkles, children }) {
  return (
    <section className="panel result-panel">
      <div className="panel-heading">
        <span className="icon-tile"><Icon size={21} /></span>
        <div><h2>{title}</h2><p>{subtitle}</p></div>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ title, text }) {
  return <div className="empty-state"><span><Mountain size={27} /></span><h3>{title}</h3><p>{text}</p></div>;
}

function LoadingState({ text }) {
  return <div className="loading-state"><LoaderCircle className="spin" size={25} /><p>{text}</p></div>;
}

function FortCard({ fort, directory = false }) {
  if (directory) {
    return (
      <article className="directory-card">
        <div className="directory-image">
          <img src={fort.image} alt={`${fort.name}, Maharashtra`} loading="lazy" />
          <span className="image-location"><MapPin size={13} /> {fort.place}</span>
        </div>
        <div className="directory-copy">
          <span className="eyebrow">{fort.category}</span>
          <h3>{fort.name}</h3>
          <p>{fort.description}</p>
          <span className="pill">{fort.difficulty} trek</span>
        </div>
      </article>
    );
  }

  return (
    <Link className="fort-card" to="/forts" key={fort.name}>
      <img src={fort.image} alt={`${fort.name}, Maharashtra`} loading="lazy" />
      <div className="fort-card-overlay" />
      <div className="fort-card-copy">
        <span className="fort-category">{fort.category}</span>
        <h3>{fort.name}</h3>
        <p><MapPin size={14} /> {fort.place}</p>
        <span className="fort-difficulty">{fort.difficulty} trek</span>
      </div>
    </Link>
  );
}

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero">
        <img className="hero-image" src={heroImage} alt="Raigad Fort, Maharashtra" />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="hero-eyebrow">THE LAND OF CHHATRAPATI SHIVAJI MAHARAJ</span>
          <h1>Walk Through<br /><span>Maratha History.</span></h1>
          <p>Explore Maharashtra's legendary forts, uncover the stories of Swarajya and plan your own heritage journey with AI.</p>
          <div className="hero-actions">
            <button className="button button-gold" onClick={() => navigate("/forts")}>
              <Compass size={19} /> Explore Forts <ArrowRight size={18} />
            </button>
            <button className="button button-outline-light" onClick={() => navigate("/history")}>
              <BookOpen size={19} /> Ask शिवदूत
            </button>
          </div>
        </div>
        <div className="hero-caption"><span /> RAIGAD FORT · MAHARASHTRA</div>
        <div className="hero-quote">Every stone holds<br />a story of Swarajya.</div>
      </section>

      <section className="intro-section section-wrap">
        <div className="intro-art">
          <img src={forts[1].image} alt="Sinhagad Fort in the Sahyadri mountains" loading="lazy" />
          <div className="art-label"><Landmark size={18} /> THE SAHYADRI LEGACY</div>
        </div>
        <div className="intro-copy">
          <span className="eyebrow">MORE THAN DESTINATIONS</span>
          <h2>Discover the legacy<br />behind every fort.</h2>
          <p>From stone gateways and mountain strongholds to the stories of Maratha courage, explore Maharashtra's heritage with a little help from AI.</p>
          <Link className="text-link" to="/history">Discover the history <ArrowRight size={17} /></Link>
        </div>
      </section>

      <section className="features-section section-wrap">
        <div className="section-title-row">
          <div><span className="eyebrow">YOUR HERITAGE COMPANION</span><h2>Explore. Learn. Experience.</h2></div>
        </div>
        <div className="feature-grid">
          {[
            { icon: Mountain, title: "Explore Forts", text: "Discover forts by region, history and trekking difficulty.", link: "/forts", cta: "Discover forts" },
            { icon: Map, title: "Plan Itinerary", text: "Build a personalised travel plan for your next adventure.", link: "/itinerary", cta: "Plan your trip" },
            { icon: BookOpen, title: "Ask शिवदूत", text: "Ask questions and explore Maharashtra's historic past.", link: "/history", cta: "Ask history" },
            { icon: ScrollText, title: "Historic Stories", text: "Explore stories and events linked to legendary forts.", link: "/stories", cta: "Read stories" }
          ].map(({ icon: Icon, title, text, link, cta }) => (
            <Link className="feature-card" to={link} key={title}>
              <span className="feature-icon"><Icon size={26} /></span>
              <h3>{title}</h3><p>{text}</p>
              <span className="feature-link">{cta} <ArrowRight size={16} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-section section-wrap">
        <div className="section-title-row">
          <div><span className="eyebrow">FORTS OF SWARAJYA</span><h2>Explore these legends</h2><p>Discover four remarkable forts of Maharashtra.</p></div>
          <Link className="text-link" to="/forts">Explore all <ArrowRight size={17} /></Link>
        </div>
        <div className="fort-card-grid">
          {forts.map(fort => <FortCard fort={fort} key={fort.name} />)}
        </div>
      </section>

      <section className="closing-banner section-wrap">
        <div><span className="eyebrow">YOUR NEXT CHAPTER BEGINS HERE</span><h2>Let the trails of Maharashtra lead you into history.</h2></div>
        <Link className="button button-gold" to="/itinerary">Plan your journey <ArrowRight size={17} /></Link>
      </section>
    </>
  );
}

function Forts() {
  const [interest, setInterest] = useState("History and architecture");
  const [difficulty, setDifficulty] = useState("Moderate");
  const [region, setRegion] = useState("Any region");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function recommend(e) {
    e.preventDefault(); setLoading(true); setError(""); setResult("");
    try {
      const data = await postData("/recommend-forts", { interests: interest, difficulty, region });
      setResult(getText(data, ["recommendations", "answer", "result"]));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="page-shell">
      <PageHeading eyebrow="DISCOVER MAHARASHTRA" title="Find your next fort" accent="adventure." description="Choose your interests and trekking comfort to get personalised fort recommendations." />
      <div className="workspace two-column">
        <form className="panel form-panel" onSubmit={recommend}>
          <h2>Personalise your journey</h2><p className="panel-description">Tell us what kind of experience you want.</p>
          <label>What interests you?
            <select value={interest} onChange={e => setInterest(e.target.value)}>
              <option>History and architecture</option><option>Photography and nature</option><option>Trekking and adventure</option><option>Family sightseeing</option>
            </select>
          </label>
          <label>Preferred difficulty
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option>Easy</option><option>Moderate</option><option>Difficult</option>
            </select>
          </label>
          <label>Preferred region
            <select value={region} onChange={e => setRegion(e.target.value)}>
              <option>Any region</option><option>Pune</option><option>Raigad</option><option>Satara</option><option>Nashik</option><option>Kolhapur</option>
            </select>
          </label>
          <button className="button button-dark full-button" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}{loading ? "Finding forts..." : "Recommend Forts"}</button>
        </form>
        <ResultPanel title="Your recommendations" subtitle="Suggestions based on your preferences" icon={Compass}>
          <Message error={error} />
          {loading && <LoadingState text="Finding forts for your preferences..." />}
          {!loading && !result && !error && <EmptyState title="Your adventure starts here" text="Choose your preferences and request your recommendations." />}
          {!loading && result && <div className="ai-result">{result}</div>}
        </ResultPanel>
      </div>
      <section className="known-forts">
        <div className="section-title-row"><div><span className="eyebrow">START EXPLORING</span><h2>Forts of Maharashtra</h2></div></div>
        <div className="fort-card-grid">{forts.map(fort => <FortCard fort={fort} directory key={fort.name} />)}</div>
      </section>
    </main>
  );
}

function History() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const samples = [
    "What is the historical importance of Raigad Fort?",
    "Why is Sinhagad Fort famous?",
    "What role did forts play in Swarajya?"
  ];

  async function ask(q = question) {
    if (!q.trim()) return;
    setQuestion(q); setLoading(true); setError(""); setAnswer("");
    try {
      const data = await getData(`/ask-history?question=${encodeURIComponent(q.trim())}`);
      setAnswer(getText(data, ["answer", "response", "result"]));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="page-shell">
      <PageHeading eyebrow="HISTORY, EXPLAINED" title="Ask" accent="शिवदूत" description="Ask about Maharashtra's forts, Maratha history, architecture and historical events." />
      <div className="workspace two-column">
        <aside className="panel prompt-panel">
          <span className="large-icon"><BookOpen size={25} /></span>
          <h2>Every fort has a story.</h2>
          <p>Ask शिवदूत a question and explore answers from the historical knowledge available to Swarajya Trails.</p>
          <h3>Try asking</h3>
          <div className="sample-list">{samples.map(q => <button key={q} onClick={() => ask(q)} disabled={loading}>{q}<ArrowUpRight size={15} /></button>)}</div>
        </aside>
        <ResultPanel title="शिवदूत — Your Historical Guide" subtitle="Ask a question about the past" icon={Sparkles}>
          <form className="question-form" onSubmit={e => { e.preventDefault(); ask(); }}>
            <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask about Raigad, Shivaji Maharaj, Maratha history..." rows={4} />
            <button className="button button-dark full-button" disabled={loading || !question.trim()}>{loading ? <LoaderCircle className="spin" size={18} /> : <Send size={17} />}{loading ? "Researching..." : "Ask शिवदूत"}</button>
          </form>
          <Message error={error} />
          {loading && <LoadingState text="Searching the historical knowledge base..." />}
          {!loading && !answer && !error && <EmptyState title="Ready to explore history?" text="Enter a question or choose a suggestion." />}
          {!loading && answer && <div className="ai-result answer-result">{answer}</div>}
        </ResultPanel>
      </div>
    </main>
  );
}

function Itinerary() {
  const [destination, setDestination] = useState("Raigad Fort");
  const [days, setDays] = useState("2");
  const [style, setStyle] = useState("Heritage and history");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate(e) {
    e.preventDefault(); setLoading(true); setError(""); setResult("");
    try {
      const data = await postData("/plan-itinerary", { destination, days: Number(days), travel_style: style });
      setResult(getText(data, ["itinerary", "answer", "result"]));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const lines = result.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const sections = [];
  lines.forEach(line => {
    if (/^#{1,4}\s*day\s*\d+|^day\s*\d+/i.test(line)) sections.push({ title: line.replace(/^#+\s*/, ""), items: [] });
    else {
      if (!sections.length) sections.push({ title: "Your Heritage Journey", items: [] });
      sections[sections.length - 1].items.push(line.replace(/^[-*•#]\s*/, ""));
    }
  });

  return (
    <main className="page-shell">
      <PageHeading eyebrow="YOUR JOURNEY, THOUGHTFULLY PLANNED" title="Plan your" accent="journey." description="Create a personalised Maharashtra heritage trip, organised into daily steps." />
      <div className="workspace itinerary-layout">
        <form className="panel form-panel" onSubmit={generate}>
          <div className="panel-heading"><span className="icon-tile"><MapPin size={21} /></span><div><h2>Your trip details</h2><p>Start with the basics.</p></div></div>
          <label>Destination or starting point<input required value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Raigad Fort, Pune" /></label>
          <label>Trip duration<select value={days} onChange={e => setDays(e.target.value)}><option value="1">1 day</option><option value="2">2 days</option><option value="3">3 days</option><option value="4">4 days</option><option value="5">5 days</option><option value="7">7 days</option></select></label>
          <label>Travel style<select value={style} onChange={e => setStyle(e.target.value)}><option>Heritage and history</option><option>Adventure and trekking</option><option>Nature and photography</option><option>Family-friendly</option><option>Relaxed exploration</option></select></label>
          <button className="button button-dark full-button" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}{loading ? "Planning your journey..." : "Generate My Itinerary"}</button>
          <p className="form-note"><span className="check-dot">✓</span> Personalised planning powered by AI</p>
        </form>
        <ResultPanel title="Your itinerary" subtitle="Your travel blueprint, day by day" icon={CalendarDays}>
          <Message error={error} />
          {loading && <LoadingState text="Crafting your heritage journey..." />}
          {!loading && !result && !error && <EmptyState title="Your journey starts here" text="Choose your destination and generate a daily plan." />}
          {!loading && result && <div className="timeline">
            {sections.map((section, i) => <article className="timeline-day" key={`${section.title}-${i}`}>
              <div className="timeline-marker"><span>{i + 1}</span>{i < sections.length - 1 && <i />}</div>
              <div className="timeline-content"><span className="eyebrow">DAY {i + 1}</span><h3>{section.title}</h3>
                {section.items.map((item, j) => <div className="timeline-item" key={`${item}-${j}`}><Clock size={16} /><p>{item}</p></div>)}
              </div>
            </article>)}
            <div className="travel-tip"><Sparkles size={18} /><p><b>Travel tip</b><br />Check fort access, local weather and trekking safety before leaving.</p></div>
          </div>}
        </ResultPanel>
      </div>
    </main>
  );
}

function Stories() {
  const [fort, setFort] = useState("Raigad Fort");
  const [story, setStory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function tell(e) {
    e.preventDefault(); setLoading(true); setError(""); setStory("");
    try {
      const data = await postData("/tell-story", { fort });
      setStory(getText(data, ["story", "answer", "result"]));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="page-shell">
      <PageHeading eyebrow="THE LEGACY LIVES ON" title="Stories etched in" accent="stone." description="Discover legends, historical events and the legacy of Maharashtra's forts." />
      <section className="story-banner">
        <img src={forts[2].image} alt="Pratapgad Fort in Maharashtra" />
        <div className="story-banner-overlay" />
        <div><span className="eyebrow">A JOURNEY INTO THE PAST</span><h2>History is more than dates.<br />It is the stories we carry forward.</h2><p>Choose a fort and discover its history.</p></div>
      </section>
      <div className="workspace two-column">
        <form className="panel form-panel" onSubmit={tell}>
          <span className="large-icon"><BookOpen size={24} /></span><h2>Choose your story</h2><p className="panel-description">Select or enter a fort name.</p>
          <label>Fort name<input value={fort} onChange={e => setFort(e.target.value)} required placeholder="Enter fort name" /></label>
          <button className="button button-dark full-button" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}{loading ? "Writing your story..." : "Tell Me the Story"}</button>
        </form>
        <ResultPanel title="The chronicle" subtitle="A journey into the past" icon={ScrollText}>
          <Message error={error} />
          {loading && <LoadingState text="Bringing history to life..." />}
          {!loading && !story && !error && <EmptyState title="A story is waiting" text="Choose a fort and select Tell Me the Story." />}
          {!loading && story && <div className="ai-result story-result">{story}</div>}
        </ResultPanel>
      </div>
    </main>
  );
}

function Compare() {
  const [fortA, setFortA] = useState("Raigad Fort");
  const [fortB, setFortB] = useState("Sinhagad Fort");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function compare(e) {
    e.preventDefault(); setLoading(true); setError(""); setResult("");
    try {
      const data = await postData("/compare-forts", { fort_a: fortA, fort_b: fortB });
      setResult(getText(data, ["comparison", "answer", "result"]));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="page-shell">
      <PageHeading eyebrow="DISCOVER THE DIFFERENCES" title="Two forts. Two legacies." accent="One journey." description="Compare historic forts and explore their history, setting, architecture and visitor experience." />
      <form className="panel compare-form" onSubmit={compare}>
        <div className="compare-inputs">
          <label><Mountain size={17} /> First fort<input value={fortA} onChange={e => setFortA(e.target.value)} required /></label>
          <span className="versus">VS</span>
          <label><Mountain size={17} /> Second fort<input value={fortB} onChange={e => setFortB(e.target.value)} required /></label>
        </div>
        <button className="button button-dark" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} /> : <GitCompareArrows size={18} />}{loading ? "Comparing..." : "Compare Forts"}</button>
      </form>
      {(error || result || loading) && <ResultPanel title="Your comparison" subtitle={`${fortA} and ${fortB}`} icon={GitCompareArrows}>
        <Message error={error} />
        {loading && <LoadingState text="Comparing the two forts..." />}
        {!loading && result && <div className="ai-result comparison-result">{result}</div>}
      </ResultPanel>}
      <div className="compare-note"><Landmark size={22} /><div><h3>Every fort has its own legacy.</h3><p>Compare historical context and visitor considerations before planning your journey.</p></div></div>
    </main>
  );
}

function NotFound() {
  return <main className="page-shell not-found"><Mountain size={42} /><h1>Trail not found</h1><p>Let's get you back to exploring Maharashtra.</p><Link className="button button-dark" to="/">Return home <ArrowRight size={17} /></Link></main>;
}

function SiteLayout() {
  return <>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/forts" element={<Forts />} />
      <Route path="/history" element={<History />} />
      <Route path="/itinerary" element={<Itinerary />} />
      <Route path="/stories" element={<Stories />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Footer />
  </>;
}

export default function App() {
  return <BrowserRouter><SiteLayout /></BrowserRouter>;
}
