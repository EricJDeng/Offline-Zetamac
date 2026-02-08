import { Link, Route, Routes } from "react-router-dom";
import GamePage from "./GamePage.jsx";
import StatsPage from "./StatsPage.jsx";

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">Offline Zetamac</div>
        <nav className="nav">
          <Link to="/">Game</Link>
          <Link to="/stats">Stats</Link>
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
    </div>
  );
}
