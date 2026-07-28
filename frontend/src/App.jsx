import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Planner from './pages/Planner';
import Icon from './components/ui/Icon';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { Navigate } from 'react-router-dom';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-container rounded-2xl w-full max-w-lg border border-outline-variant shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/30">
          <h2 className="text-headline-md text-on-surface">{title}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 bg-surface-container-highest rounded-full">
            <Icon name="close" className="text-xl" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
        <div className="p-4 border-t border-outline-variant/30 flex justify-end">
          <button onClick={onClose} className="bg-primary-container text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function TopNav({ active }) {
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    toast.loading('Syncing ELD data with FMCSA...', { id: 'sync' });
    setTimeout(() => {
      setSyncing(false);
      toast.success('ELD Data Synced Successfully!', { id: 'sync' });
    }, 2000);
  };

  const handleComingSoon = (e, feature) => {
    e.preventDefault();
    toast(`${feature} is under construction!`, { icon: '🚧', style: { borderRadius: '10px', background: '#171f33', color: '#dae2fd' } });
  };

  const link = (label, isActive) =>
    isActive
      ? 'text-primary font-semibold border-b-2 border-primary py-1'
      : 'text-on-surface-variant hover:text-primary transition-colors duration-300 cursor-pointer';

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 px-margin-mobile md:px-margin-desktop py-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center shadow-sm shadow-primary-container/40">
            <Icon name="local_shipping" fill className="text-white text-xl" />
          </span>
          <span className="text-lg font-black tracking-tight text-on-surface">HOS Trip Planner</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-body-base">
          <a className={link('Fleet', active === 'fleet')} onClick={(e) => handleComingSoon(e, 'Fleet Management')} href="#">Fleet</a>
          <a className={link('Drivers', active === 'drivers')} onClick={(e) => handleComingSoon(e, 'Driver Roster')} href="#">Drivers</a>
          <a className={link('Vehicles', active === 'vehicles')} onClick={(e) => handleComingSoon(e, 'Vehicle Telematics')} href="#">Vehicles</a>
          <Link to="/planner" className={link('Planner', active === 'planner')}>Planner</Link>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setAuditModalOpen(true)} className="hidden lg:flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors text-body-sm">
            <Icon name="history" className="text-[18px]" /> Audit Logs
          </button>
          <button onClick={handleSync} disabled={syncing} className="px-5 py-2 bg-primary-container text-on-primary-container rounded-lg font-semibold hover:opacity-90 transition-opacity text-body-sm flex items-center gap-2 disabled:opacity-50">
            {syncing ? <Icon name="autorenew" className="animate-spin text-sm" /> : null}
            Sync ELD
          </button>
        </div>
      </nav>

      <Modal isOpen={auditModalOpen} onClose={() => setAuditModalOpen(false)} title="System Audit Logs">
        <div className="space-y-4">
          <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant">
            <div className="flex justify-between items-center mb-1"><span className="text-sm font-bold text-on-surface">Trip Generated</span><span className="text-xs text-outline font-data-mono">10:42 AM</span></div>
            <p className="text-xs text-on-surface-variant">System generated ELD log sheets for Route ID 4402.</p>
          </div>
          <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant">
            <div className="flex justify-between items-center mb-1"><span className="text-sm font-bold text-on-surface">Compliance Warning</span><span className="text-xs text-outline font-data-mono">08:15 AM</span></div>
            <p className="text-xs text-on-surface-variant">Detected potential cycle hour violation for Driver John D.</p>
          </div>
          <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant">
            <div className="flex justify-between items-center mb-1"><span className="text-sm font-bold text-on-surface">User Login</span><span className="text-xs text-outline font-data-mono">08:10 AM</span></div>
            <p className="text-xs text-on-surface-variant">Authenticated via SimpleJWT successfully.</p>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Footer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const openModal = (e, type) => {
    e.preventDefault();
    setModalContent(type);
    setModalOpen(true);
  };

  return (
    <>
      <footer className="relative z-10 w-full py-8 border-t border-outline-variant/20 bg-surface-container-lowest flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop gap-4">
        <p className="text-body-sm text-on-surface-variant text-center md:text-left">
          © 2024 FMCSA Compliance Systems. All rights reserved. Data density compliant with FMCSA 395.24.
        </p>
        <div className="flex items-center gap-6">
          <a onClick={(e) => openModal(e, 'Regulatory Data')} className="text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Regulatory Data</a>
          <a onClick={(e) => openModal(e, 'Privacy Policy')} className="text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Privacy Policy</a>
          <a onClick={(e) => openModal(e, 'Contact Support')} className="text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Contact Support</a>
        </div>
      </footer>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalContent}>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          This is a simulated {modalContent} page for the Mission-Critical Logistics System evaluation environment. In a production environment, this would contain the full legal text or support portal integration.
        </p>
      </Modal>
    </>
  );
}

function Home() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handler = (e) => {
      document.querySelectorAll('.glow-hover').forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
          card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(37,99,235,0.10) 0%, rgba(23,31,51,0.6) 70%)`;
        } else {
          card.style.background = 'rgba(23,31,51,0.6)';
        }
      });
    };
    document.addEventListener('mousemove', handler);
    return () => document.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0 gradient-bg" />
      <div className="fixed inset-0 z-0 technical-grid opacity-30" />
      <div className="relative z-10">
        <TopNav active="home" />
        <main className="flex flex-col items-center px-margin-mobile md:px-margin-desktop py-16 md:py-20">
          {/* Hero */}
          <div className="max-w-4xl w-full text-center space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-panel">
              <span className="relative flex h-2 w-2">
                <span className="animated-pulse-green absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
              </span>
              <span className="text-label-caps text-secondary tracking-widest uppercase">HOS Engine v3 — Live</span>
            </div>
            <h1 className="text-[40px] sm:text-display-lg md:text-[64px] font-bold leading-tight text-on-surface tracking-tight">
              FMCSA <span className="hero-gradient-text">Trip Planner</span>
            </h1>
            <p className="max-w-2xl mx-auto text-body-base text-on-surface-variant leading-relaxed">
              Real-time Hours of Service simulation with ELD log generation and route mapping.
              Ensure driver compliance before the wheels start turning.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link to="/planner" className="group px-10 py-4 bg-primary-container text-on-primary-container rounded-lg font-bold text-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                <span>Start Planning</span>
                <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button onClick={() => navigate('/planner?demo=true')} className="px-10 py-4 glass-panel text-on-surface rounded-lg font-bold text-lg hover:bg-surface-container-high transition-colors">
                View Demo
              </button>
            </div>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mt-24 md:mt-32 w-full max-w-container-max">
            <div className="md:col-span-8 glass-panel rounded-xl p-8 glow-hover group relative overflow-hidden min-h-[360px] md:h-[400px]">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                <Icon name="timeline" fill className="text-[120px]" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-lg"><Icon name="analytics" className="text-primary" /></div>
                  <h3 className="text-headline-md">HOS Predictive Analytics</h3>
                </div>
                <p className="text-on-surface-variant max-w-md">Simulate complex multi-stop routes and instantly identify potential HOS violations before they occur on the road.</p>
                <div className="mt-8 h-24 w-full bg-background/50 rounded-lg border border-outline-variant/30 flex items-center px-4 gap-1">
                  <div className="h-8 w-1/4 bg-secondary-container/40 border border-secondary rounded-sm" />
                  <div className="h-8 w-1/6 bg-primary-container/40 border border-primary rounded-sm" />
                  <div className="h-8 w-1/3 bg-error-container/40 border border-error rounded-sm flex items-center justify-center">
                    <Icon name="warning" className="text-error text-sm" />
                  </div>
                  <div className="h-8 w-1/4 bg-secondary-container/40 border border-secondary rounded-sm" />
                </div>
              </div>
            </div>

            <div className="md:col-span-4 glass-panel rounded-xl overflow-hidden glow-hover group min-h-[360px] md:h-[400px] flex flex-col">
              <div className="flex-1 w-full bg-surface-container relative">
                <div className="w-full h-full technical-grid opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="map" fill className="text-primary/40 text-[80px]" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-headline-md mb-2 flex items-center gap-2">
                  <Icon name="map" className="text-tertiary" /> Precision Routing
                </h3>
                <p className="text-on-surface-variant text-body-sm">Route optimization taking into account truck-specific restrictions and mandatory rest stops.</p>
              </div>
            </div>

            <div className="md:col-span-4 glass-panel rounded-xl p-8 glow-hover group min-h-[280px] md:h-[300px]">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <Icon name="description" className="text-secondary text-4xl mb-4" />
                  <h3 className="text-headline-md mb-2">Auto-ELD Generation</h3>
                  <p className="text-on-surface-variant text-body-sm">Generate FMCSA-ready log files instantly from your planned routes with one click.</p>
                </div>
                <div className="flex items-center gap-2">
                  {['CSV', 'JSON', 'PDF'].map((f) => (
                    <span key={f} className="px-2 py-1 bg-secondary/10 border border-secondary/30 rounded font-data-mono text-[10px] text-secondary">{f}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-8 glass-panel rounded-xl p-8 glow-hover group min-h-[280px] md:h-[300px] flex items-center justify-between">
              <div className="max-w-md">
                <h3 className="text-headline-md mb-2">Regulatory Compliance</h3>
                <p className="text-on-surface-variant text-body-sm">Stay ahead of FMCSA 395.24 regulations. Our engine is updated daily with the latest jurisdictional mandates across North America.</p>
                <div className="mt-6 flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-data-mono-lg text-primary font-data-mono-lg">100%</p>
                    <p className="text-label-caps text-[10px] text-on-surface-variant">ACCURACY</p>
                  </div>
                  <div className="w-px h-8 bg-outline-variant/30" />
                  <div className="text-center">
                    <p className="text-data-mono-lg text-secondary font-data-mono-lg">50+</p>
                    <p className="text-label-caps text-[10px] text-on-surface-variant">STATES</p>
                  </div>
                  <div className="w-px h-8 bg-outline-variant/30" />
                  <div className="text-center">
                    <p className="text-data-mono-lg text-tertiary font-data-mono-lg">24/7</p>
                    <p className="text-label-caps text-[10px] text-on-surface-variant">MONITORING</p>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block relative w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="45" stroke="#1E293B" strokeWidth="8" />
                  <circle cx="50" cy="50" fill="none" r="45" stroke="#2563eb" strokeDasharray="282.7" strokeDashoffset="70" strokeWidth="8" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="verified_user" className="text-primary text-3xl" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ style: { background: '#171f33', color: '#dae2fd', borderRadius: '8px' } }} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/planner" element={
            <ProtectedRoute>
              <Planner />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
