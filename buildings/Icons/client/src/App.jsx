import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import IconsPage from './pages/IconsPage';
import AddIconPage from './pages/AddIconPage';
import Navbar from './components/common/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/icons" element={<IconsPage />} />
            <Route path="/add-icon" element={<AddIconPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;