
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Forts from "./pages/Forts";
import History from "./pages/History";
import Itinerary from "./pages/Itinerary";
import Stories from "./pages/Stories";
import Compare from "./pages/Compare";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="site-shell">
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/forts" element={<Forts />} />
            <Route path="/history" element={<History />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
