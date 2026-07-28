import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tripApi } from '../services/tripApi';
import TripMap from '../components/Map/TripMap';
import TripSummary from '../components/Cards/TripSummary';
import LogSheet from '../components/Cards/LogSheet';
import Icon from '../components/ui/Icon';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', active: false },
  { label: 'Trip Planner', icon: 'map', path: '/planner', active: true },
];

function TopNav() {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-700/50 flex items-center justify-between px-6 py-4 h-16 animate-fade-in-up">
      <a href="/" className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Icon name="local_shipping" fill className="text-white text-xl drop-shadow-md" />
        </span>
        <h1 className="text-lg font-bold tracking-tight text-white hidden sm:block">HOS Trip Planner</h1>
      </a>
      <div className="hidden md:flex items-center gap-8 text-sm">
        <span className="text-blue-400 font-bold border-b-2 border-blue-400 py-1 cursor-pointer">Planner</span>
      </div>
      <div className="flex items-center gap-5">
        <button onClick={() => toast.success('ELD Data Synced!')} className="hidden lg:block gradient-btn text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">Sync ELD</button>
        <button onClick={() => navigate('/dashboard')} className="text-slate-300 hover:text-blue-400 transition-colors text-sm font-semibold">Dashboard</button>
      </div>
    </nav>
  );
}

function Sidebar({ onNewRoute, onSelectTrip }) {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [recentTrips, setRecentTrips] = useState([]);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:8000/api/trips/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        const tripsArray = Array.isArray(data) ? data : (data.results || []);
        setRecentTrips(tripsArray.slice(0, 5));
      })
      .catch(console.error);
    }
  }, [token]);

  return (
    <aside className="w-[280px] h-[calc(100vh-64px)] fixed left-0 top-16 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 hidden xl:flex flex-col py-8 z-30 animate-fade-in-up">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-4 mb-8 p-4 premium-card">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Icon name="verified_user" className="text-blue-400 text-xl" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">Fleet Manager</p>
            <p className="text-blue-300/80 text-xs font-medium">HOS Compliance</p>
          </div>
        </div>
        <button onClick={onNewRoute} className="w-full gradient-btn text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg">
          <Icon name="add" /> New Trip Plan
        </button>
      </div>
      <nav className="flex-1 px-4 space-y-1.5">
        {NAV_ITEMS.map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              item.active
                ? 'text-white bg-blue-500/10 border border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)] font-semibold'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}>
            <Icon name={item.icon} fill={item.active} className={item.active ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : ''} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}

        <div className="pt-8 pb-3">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest px-4">Recent Routes</p>
        </div>
        {recentTrips.map(trip => (
          <button key={trip.id} onClick={() => onSelectTrip(trip)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/50 rounded-xl group transition-all border border-transparent hover:border-slate-700/50">
            <Icon name="history" className="text-slate-500 text-sm group-hover:text-blue-400 transition-colors" />
            <div className="truncate flex-1">
              <p className="text-xs font-medium text-slate-300 truncate group-hover:text-white transition-colors">{trip.current_location} &rarr; {trip.dropoff_location}</p>
            </div>
          </button>
        ))}
      </nav>
      <div className="px-4 pt-6 border-t border-slate-700/50 mt-auto space-y-1.5 pb-4">
        <button onClick={() => toast('Settings coming soon!')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all text-left">
          <Icon name="settings" /> <span className="text-sm font-medium">Settings</span>
        </button>
        <button onClick={() => toast('Support coming soon!')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all text-left">
          <Icon name="help" /> <span className="text-sm font-medium">Support</span>
        </button>
      </div>
    </aside>
  );
}

function TripForm({ formData, onChange, onSubmit, loading, error }) {
  return (
    <div className="premium-card p-8 relative overflow-hidden animate-fade-in-up">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-emerald-500" />
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white tracking-tight">
        <Icon name="route" className="text-blue-400 text-3xl drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" /> Trip Details
      </h2>
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Current Location</label>
            <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all glow-hover">
              <Icon name="my_location" className="text-lg mr-3 text-slate-500" />
              <input required name="current_location" value={formData.current_location} onChange={onChange}
                placeholder="e.g. Chicago, IL"
                className="bg-transparent border-none p-0 focus:ring-0 w-full text-white placeholder:text-slate-600 outline-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Cycle Hours Used</label>
            <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all glow-hover">
              <Icon name="schedule" className="text-lg mr-3 text-emerald-500/70" />
              <input required type="number" step="0.1" name="current_cycle_hours" value={formData.current_cycle_hours} onChange={onChange}
                placeholder="22"
                className="bg-transparent border-none p-0 focus:ring-0 w-full text-white placeholder:text-slate-600 outline-none font-mono" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pickup Point</label>
          <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all glow-hover">
            <Icon name="upload" className="text-lg mr-3 text-purple-400/70" />
            <input required name="pickup_location" value={formData.pickup_location} onChange={onChange}
              placeholder="Enter Pickup Address"
              className="bg-transparent border-none p-0 focus:ring-0 w-full text-white placeholder:text-slate-600 outline-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Dropoff Destination</label>
          <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all glow-hover">
            <Icon name="download" className="text-lg mr-3 text-rose-400/70" />
            <input required name="dropoff_location" value={formData.dropoff_location} onChange={onChange}
              placeholder="Enter Dropoff Address"
              className="bg-transparent border-none p-0 focus:ring-0 w-full text-white placeholder:text-slate-600 outline-none" />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-fade-in-up">
            <Icon name="error" className="text-lg mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full gradient-btn text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed text-lg">
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              Calculating…
            </>
          ) : (
            <>
              <Icon name="alt_route" className="text-xl" /> Plan Route
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function Planner() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialData = {
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_hours: '',
  };

  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tripResult, setTripResult] = useState(null);

  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      const demoData = {
        current_location: 'New York, NY',
        pickup_location: 'Philadelphia, PA',
        dropoff_location: 'Los Angeles, CA',
        current_cycle_hours: '15'
      };
      setFormData(demoData);
      setSearchParams({});
      setTimeout(() => {
        submitData(demoData);
      }, 500);
    }
  }, [searchParams, setSearchParams]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitData = async (dataToSubmit) => {
    setLoading(true);
    setError(null);
    try {
      const data = { ...dataToSubmit, current_cycle_hours: parseFloat(dataToSubmit.current_cycle_hours) };
      const result = await tripApi.createTrip(data);
      setTripResult(result);
      toast.success('Route calculated successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to calculate route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitData(formData);
  };

  const handleNewRoute = () => {
    setFormData(initialData);
    setTripResult(null);
    setError(null);
  };

  const handleSelectTrip = (trip) => {
    setFormData({
      current_location: trip.current_location,
      pickup_location: trip.pickup_location,
      dropoff_location: trip.dropoff_location,
      current_cycle_hours: trip.current_cycle_hours.toString(),
    });
    setTripResult(trip);
    toast.success('Loaded recent trip');
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="xl:ml-[280px] p-6 lg:p-10 space-y-8 relative">
        {/* Planner grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left: form + summary */}
          <div className="col-span-12 lg:col-span-5 space-y-8">
            <TripForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
            {tripResult && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <TripSummary trip={tripResult} />
              </div>
            )}
          </div>

          {/* Right: map */}
          <div className="col-span-12 lg:col-span-7">
            <div className="premium-card overflow-hidden h-full min-h-[420px] lg:min-h-[600px] flex flex-col relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="px-6 py-4 bg-slate-900/60 backdrop-blur-md flex justify-between items-center border-b border-slate-700/50 absolute top-0 w-full z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <Icon name="map" className="text-blue-400 text-sm" />
                  </div>
                  <span className="font-bold text-white tracking-wide">Live Route Map</span>
                </div>
              </div>
              <div className="flex-1 relative mt-16 bg-slate-900/50">
                <TripMap trip={tripResult} />
              </div>
            </div>
          </div>
        </div>

        {/* ELD log section */}
        {tripResult && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <LogSheet logSheets={tripResult.log_sheets || []} />
          </div>
        )}
      </main>

      <footer className="w-full py-8 xl:ml-[280px] bg-slate-900/50 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-center px-6 lg:px-10 gap-4 backdrop-blur-sm">
        <p className="text-sm text-slate-500 text-center md:text-left">
          © 2024 FMCSA Compliance Systems. All rights reserved. Data density compliant with FMCSA 395.24.
        </p>
        <div className="flex gap-6">
          <button onClick={() => toast('Regulatory data modal coming soon!')} className="text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors text-left">Regulatory Data</button>
          <button onClick={() => toast('Privacy Policy modal coming soon!')} className="text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors text-left">Privacy Policy</button>
          <button onClick={() => toast('Support modal coming soon!')} className="text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors text-left">Contact Support</button>
        </div>
      </footer>

      {/* FAB */}
      <button onClick={() => toast('Compliance AI agent is offline.')} className="fixed bottom-8 right-8 gradient-btn text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95 group z-50 animate-bounce">
        <Icon name="chat_bubble" className="text-2xl drop-shadow-md" />
        <span className="absolute right-20 glass-panel border border-slate-700/50 px-4 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap text-white shadow-xl pointer-events-none transform translate-x-2 group-hover:translate-x-0">
          Compliance AI
        </span>
      </button>
    </div>
  );
}
