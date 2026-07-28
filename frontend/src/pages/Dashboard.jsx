import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import Icon from '../components/ui/Icon';
import LogSheet, { ELDPage } from '../components/Cards/LogSheet';
import html2pdf from 'html2pdf.js';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout, user } = useContext(AuthContext);
  const [printingTrip, setPrintingTrip] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/trips/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401 || res.status === 403) {
          logout();
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch trips');
        const data = await res.json();
        // Handle paginated or list response
        const tripsArray = Array.isArray(data) ? data : (data.results || []);
        setTrips(tripsArray);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [token, logout]);

  useEffect(() => {
    if (printingTrip) {
      if (!printingTrip.log_sheets || printingTrip.log_sheets.length === 0) {
        toast.error("No ELD log sheets available for this trip.");
        setPrintingTrip(null);
        return;
      }

      // Safety timeout so user is never stuck in infinite loading
      const safetyTimer = setTimeout(() => {
        toast.error("PDF generation timed out. Please try again.");
        setPrintingTrip(null);
      }, 15000);

      // Allow DOM to update before capturing
      setTimeout(() => {
        const element = document.getElementById('print-container');
        if (!element) {
          clearTimeout(safetyTimer);
          setPrintingTrip(null);
          return;
        }
        
        const opt = {
          margin:       [0.5, 0.5, 0.5, 0.5],
          filename:     `ELD_Logs_${printingTrip.id}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { 
            scale: 1.5, 
            useCORS: true, 
            logging: false, 
            allowTaint: true,
            onclone: (clonedDoc) => {
              const styleTags = clonedDoc.querySelectorAll('style');
              styleTags.forEach((styleEl) => {
                if (styleEl.innerHTML) {
                  styleEl.innerHTML = styleEl.innerHTML
                    .replace(/color-mix\([^{};]+/ig, '#34d399')
                    .replace(/oklab\([^{};]+/ig, '#3b82f6')
                    .replace(/oklch\([^{};]+/ig, '#3b82f6');
                }
              });
              const allEls = clonedDoc.querySelectorAll('[style]');
              allEls.forEach((el) => {
                const s = el.getAttribute('style');
                if (s && (s.includes('oklab') || s.includes('oklch') || s.includes('color-mix'))) {
                  el.setAttribute('style', s
                    .replace(/color-mix\([^{};]+/ig, '#34d399')
                    .replace(/oklab\([^{};]+/ig, '#3b82f6')
                    .replace(/oklch\([^{};]+/ig, '#3b82f6'));
                }
              });
            }
          },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' },
          pagebreak:    { mode: 'css', before: '.eld-page' }
        };
        
        html2pdf().set(opt).from(element).save()
          .then(() => {
            toast.success("ELD Logs PDF downloaded successfully!");
          })
          .catch((err) => {
            console.error("PDF generation failed:", err);
            toast.error("Failed to generate PDF: " + (err?.message || "Unknown error"));
          })
          .finally(() => {
            clearTimeout(safetyTimer);
            setPrintingTrip(null);
          });
      }, 300);

      return () => clearTimeout(safetyTimer);
    }
  }, [printingTrip]);

  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : 'Driver';

  return (
    <div className="min-h-screen bg-background relative">
      
      {/* Main Dashboard Content - Hide when printing to guarantee PDF capture success */}
      <div style={{ display: printingTrip ? 'none' : 'block' }} className="p-margin-mobile md:p-margin-desktop">
        <div className="flex justify-between items-center mb-10 animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Welcome, {fullName}</h1>
            <p className="text-sm text-slate-400 mt-2">Manage your planned routes and ELD logs</p>
          </div>
          <div className="flex gap-4">
            <a href="/planner" className="gradient-btn text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2">
              <Icon name="add" /> New Trip
            </a>
            <button onClick={logout} className="bg-slate-800/50 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 border border-slate-700/50">
              <Icon name="logout" /> Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Icon name="autorenew" className="animate-spin text-4xl text-blue-500" /></div>
        ) : error ? (
          <div className="text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl animate-fade-in-up">{error}</div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 premium-card animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
              <Icon name="route" className="text-5xl text-slate-500" />
            </div>
            <p className="text-lg text-slate-300 font-medium">You haven't planned any trips yet.</p>
            <p className="text-sm text-slate-500 mt-2">Click "New Trip" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {trips.map(trip => (
              <div key={trip.id} className="premium-card p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className="text-xs font-mono text-slate-500">{new Date(trip.created_at).toLocaleDateString()}</span>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-md font-bold tracking-wide shadow-[0_0_10px_rgba(16,185,129,0.1)]">COMPLIANT</span>
                </div>
                
                <div className="mb-8 flex-1 relative z-10">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="mt-0.5">
                      <Icon name="my_location" className="text-slate-500 text-sm" />
                    </div>
                    <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">{trip.current_location}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Icon name="location_on" className="text-blue-400 text-sm drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                    </div>
                    <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">{trip.dropoff_location}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-slate-700/50 pt-5 mt-auto relative z-10">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Icon name="route" className="text-sm" />
                    <p className="text-xs font-mono font-medium">{trip.summary.distance.toFixed(0)} mi</p>
                  </div>
                  <button 
                    onClick={() => setPrintingTrip(trip)}
                    disabled={!!printingTrip}
                    className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50">
                    <Icon name={printingTrip?.id === trip.id ? "autorenew" : "download"} className={`text-lg ${printingTrip?.id === trip.id ? 'animate-spin text-blue-500' : ''}`} /> 
                    {printingTrip?.id === trip.id ? 'Generating...' : 'ELD Logs'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print container - In normal document flow so html2canvas renders it perfectly */}
      {printingTrip && (
        <div className="w-full flex justify-center bg-white" style={{ minHeight: '100vh' }}>
          <div id="print-container" className="p-8 bg-white text-black" style={{ width: '1200px' }}>
            {printingTrip.log_sheets && printingTrip.log_sheets.map((sheet, index) => (
              <div key={sheet.day} className={index > 0 ? 'eld-page' : ''} style={{ pageBreakBefore: index > 0 ? 'always' : 'auto' }}>
                <ELDPage sheet={sheet} driverName={fullName} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading overlay when printing */}
      {printingTrip && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">
          <Icon name="autorenew" className="animate-spin text-6xl text-primary mb-4" />
          <h2 className="text-headline-md text-on-surface">Generating ELD Logs PDF...</h2>
          <p className="text-body-sm text-on-surface-variant mt-2">Please wait, compiling daily sheets.</p>
        </div>
      )}
    </div>
  );
}
