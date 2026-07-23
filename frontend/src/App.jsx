import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Planner from './pages/Planner';

function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-6">FMCSA Trip Planner</h1>
        <p className="text-gray-600 mb-8 text-lg">Phase 2 Route Integration is ready.</p>
        <Link to="/planner" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
          Launch Trip Planner
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planner" element={<Planner />} />
      </Routes>
    </Router>
  );
}

export default App;
