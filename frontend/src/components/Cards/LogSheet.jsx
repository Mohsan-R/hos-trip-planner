// Authentic paper ELD daily-log rendering — premium responsive edition

const STATUSES = [
  { key: "OFF_DUTY",  label: "1: OFF DUTY",            color: "#8d90a0", fill: "rgba(141,144,160,0.1)" },
  { key: "SLEEPER",   label: "2: SLEEPER BERTH",        color: "#8B5CF6", fill: "rgba(139,92,246,0.1)" },
  { key: "DRIVING",   label: "3: DRIVING",              color: "#3B82F6", fill: "rgba(59,130,246,0.1)" },
  { key: "ON_DUTY",   label: "4: ON DUTY (NOT DRIVING)", color: "#F59E0B", fill: "rgba(245,158,11,0.1)" },
];

const STATUS_ROW  = { OFF_DUTY: 0, SLEEPER: 1, DRIVING: 2, ON_DUTY: 3 };
const STATUS_COLOR = Object.fromEntries(STATUSES.map(s => [s.key, s.color]));
const STATUS_FILL  = Object.fromEntries(STATUSES.map(s => [s.key, s.fill]));

const ROW_H    = 44;
const LABEL_W  = 160;
const GRID_W   = 960;
const RIGHT_W  = 72;
const TOP_H    = 26;
const BOTTOM_H = 26;

const GRID_TOP    = TOP_H;
const GRID_H      = ROW_H * STATUSES.length;
const GRID_BOTTOM = GRID_TOP + GRID_H;
const SVG_W       = LABEL_W + GRID_W + RIGHT_W;

const xOf = (h) => LABEL_W + (h / 24) * GRID_W;
const yOf = (k) => GRID_TOP + STATUS_ROW[k] * ROW_H + ROW_H / 2;

function hourLabel(h) {
  if (h === 0 || h === 24) return "Midnight";
  if (h === 12) return "Noon";
  return String(h > 12 ? h - 12 : h);
}

function buildPath(segments = []) {
  if (!segments.length) return "";
  const sorted = [...segments].sort((a, b) => a.start_hour - b.start_hour);
  let d = "", prevY = null;
  for (const seg of sorted) {
    const x1 = xOf(seg.start_hour);
    const x2 = xOf(seg.start_hour + seg.duration);
    const y  = yOf(seg.status);
    if (prevY === null) d += `M ${x1} ${y}`;
    else if (prevY !== y) d += ` L ${x1} ${prevY} L ${x1} ${y}`;
    else d += ` L ${x1} ${y}`;
    d += ` L ${x2} ${y}`;
    prevY = y;
  }
  return d;
}

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function LogSheet({ logSheets = [], driverName = '' }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isCertified, setIsCertified] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [signature, setSignature] = useState('');

  if (!logSheets.length) return null;

  const sheet = logSheets[currentPage];
  const hasNext = currentPage < logSheets.length - 1;
  const hasPrev = currentPage > 0;

  const handleCertify = (e) => {
    e.preventDefault();
    if (signature.trim().length < 2) {
      toast.error("Please enter a valid signature.");
      return;
    }
    setShowCertModal(false);
    setIsCertified(true);
    toast.success("Logs Certified Successfully!");
  };

  return (
    <div className="space-y-6 pt-gutter relative">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-headline-md flex items-center gap-3 text-on-surface">
          <span className="material-symbols-outlined text-primary-container">fact_check</span>
          ELD Daily Log — Current Trip
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(c => Math.max(0, c - 1))}
              disabled={!hasPrev}
              className="bg-surface-container-high border border-outline-variant px-3 py-2 rounded-lg text-body-sm text-on-surface hover:bg-surface-bright transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              Previous Day
            </button>
            <span className="text-body-sm text-on-surface-variant font-data-mono">
              Day {currentPage + 1} of {logSheets.length}
            </span>
            <button 
              onClick={() => setCurrentPage(c => Math.min(logSheets.length - 1, c + 1))}
              disabled={!hasNext}
              className="bg-surface-container-high border border-outline-variant px-3 py-2 rounded-lg text-body-sm text-on-surface hover:bg-surface-bright transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              Next Day
            </button>
          </div>

          {!isCertified ? (
            <button onClick={() => setShowCertModal(true)} className="bg-[#059669] text-white px-4 py-2 rounded-lg font-bold text-body-sm hover:bg-emerald-700 transition-colors">
              Certify All Logs
            </button>
          ) : (
            <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-500 px-4 py-2 rounded-lg font-bold text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">verified</span> CERTIFIED BY {signature.toUpperCase()}
            </div>
          )}
        </div>
      </div>
      
      {/* For printing all pages, we map them but hide non-current unless printing, or just print them all if in print container */}
      <ELDPage key={sheet.day} sheet={sheet} driverName={driverName} />

      {/* Certification Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container rounded-2xl w-full max-w-sm border border-outline-variant shadow-2xl p-6">
            <h3 className="text-headline-md text-on-surface mb-2">Digital Signature</h3>
            <p className="text-body-sm text-on-surface-variant mb-6">By signing below, you certify that these log entries are true and correct according to FMCSA guidelines.</p>
            <form onSubmit={handleCertify} className="space-y-4">
              <div>
                <label className="text-label-caps text-on-surface-variant mb-2 block">Driver Signature (Full Name)</label>
                <input 
                  type="text" 
                  value={signature} 
                  onChange={(e) => setSignature(e.target.value)} 
                  autoFocus
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container font-medium outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowCertModal(false)} className="px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors font-semibold">Cancel</button>
                <button type="submit" className="bg-[#059669] hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold transition-colors">Sign & Certify</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function ELDPage({ sheet, driverName = '' }) {
  const path      = buildPath(sheet.segments);
  const remarksH  = Math.max(160, sheet.remarks.length * 30 + 48);
  const totalSVGH = TOP_H + GRID_H + BOTTOM_H + remarksH;

  return (
    <div className="eld-page bg-surface-container border border-outline-variant rounded-2xl overflow-hidden shadow-sm mb-6">
      {/* Header bar */}
      <div className="bg-surface-container-highest border-b border-outline-variant px-5 py-3 flex justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-[#064e3b] border border-emerald-500 text-emerald-500 rounded-full px-3 py-0.5 text-label-caps">
            DAY {sheet.day}
          </span>
          <span className="font-bold text-sm tracking-wide text-on-surface">
            DRIVER'S DAILY LOG
          </span>
          {driverName && (
            <span className="ml-4 text-sm font-semibold text-primary">Driver: {driverName}</span>
          )}
        </div>
        <div className="flex gap-6 text-body-sm text-on-surface-variant font-data-mono">
          <span>Dist: <strong className="text-on-surface">{sheet.total_miles} mi</strong></span>
          <span className={sheet.is_valid_24h ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
            {sheet.total_hours?.toFixed(2)} / 24.00 h {sheet.is_valid_24h ? "✓" : "✗"}
          </span>
        </div>
      </div>

      {/* SVG grid — horizontally scrollable on small screens */}
      <div className="overflow-x-auto technical-grid">
        <svg xmlns="http://www.w3.org/2000/svg" width={SVG_W} height={totalSVGH}
             style={{ display: "block", fontFamily: "'Inter', Arial, sans-serif" }}>

          {/* Top hour labels */}
          {Array.from({ length: 25 }, (_, h) => (
            <text key={h} x={xOf(h)} y={17} textAnchor="middle"
                  fontSize={h % 6 === 0 ? 10 : 9}
                  fill={h % 6 === 0 ? "#dae2fd" : "#8d90a0"}
                  fontWeight={h % 6 === 0 ? "700" : "500"}>
              {hourLabel(h)}
            </text>
          ))}

          {/* Status rows */}
          {STATUSES.map(({ key, label, color, fill }, i) => {
            const ry = GRID_TOP + i * ROW_H;
            return (
              <g key={key}>
                {/* Row fill */}
                <rect x={LABEL_W} y={ry} width={GRID_W} height={ROW_H} fill={fill} />
                {/* Row border */}
                <rect x={LABEL_W} y={ry} width={GRID_W} height={ROW_H}
                      fill="none" stroke="#2d3449" strokeWidth={1} />
                {/* Label background */}
                <rect x={0} y={ry} width={LABEL_W} height={ROW_H} fill="#131b2e" />
                <rect x={0} y={ry} width={4} height={ROW_H} fill={color} />
                {/* Label text */}
                <text x={12} y={ry + ROW_H / 2 + 4} fontSize={9.5} fill={color} fontWeight="700">
                  {label}
                </text>

                {/* Segment fills */}
                {sheet.segments
                  .filter(s => s.status === key)
                  .map((s, si) => (
                    <rect key={si}
                      x={xOf(s.start_hour)} y={ry + 4}
                      width={Math.max(0, xOf(s.start_hour + s.duration) - xOf(s.start_hour))}
                      height={ROW_H - 8}
                      fill={color} opacity={0.3} rx={2} />
                  ))}

                {/* Hour vertical lines */}
                {Array.from({ length: 25 }, (_, h) => (
                  <line key={h} x1={xOf(h)} y1={ry} x2={xOf(h)} y2={ry + ROW_H}
                        stroke={h % 6 === 0 ? "#8d90a0" : "#2d3449"}
                        strokeWidth={h % 6 === 0 ? 1 : 0.5} />
                ))}
                {/* 15-min ticks */}
                {Array.from({ length: 96 }, (_, q) => {
                  const hq = q / 4;
                  if (Number.isInteger(hq)) return null;
                  const isMajor = q % 2 === 0;
                  return (
                    <line key={q}
                      x1={xOf(hq)} y1={ry + ROW_H - (isMajor ? 9 : 5)}
                      x2={xOf(hq)} y2={ry + ROW_H}
                      stroke="#434655" strokeWidth={0.5} />
                  );
                })}

                {/* Hours total */}
                <text x={LABEL_W + GRID_W + 8} y={ry + ROW_H / 2 + 4}
                      fontSize={11} fill={color} fontWeight="700" fontFamily="'JetBrains Mono', monospace">
                  {(sheet.totals[key] || 0).toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Bottom hour labels */}
          {Array.from({ length: 25 }, (_, h) => (
            <text key={h} x={xOf(h)} y={GRID_BOTTOM + 18} textAnchor="middle"
                  fontSize={h % 6 === 0 ? 10 : 9}
                  fill={h % 6 === 0 ? "#dae2fd" : "#8d90a0"}
                  fontWeight={h % 6 === 0 ? "700" : "500"}>
              {hourLabel(h)}
            </text>
          ))}

          {/* HRS column header */}
          <text x={LABEL_W + GRID_W + 8} y={GRID_TOP - 8}
                fontSize={9} fill="#b4c5ff" fontWeight="700">HRS</text>

          {/* Duty-status stepped line */}
          {/* We will draw segments individually to color them correctly */}
          {sheet.segments.map((seg, i) => {
             const x1 = xOf(seg.start_hour);
             const x2 = xOf(seg.start_hour + seg.duration);
             const y = yOf(seg.status);
             const color = STATUS_COLOR[seg.status] || "#dae2fd";
             return <line key={`h-${i}`} x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={3} />;
          })}
          
          {/* Draw vertical connecting lines between segments */}
          {(() => {
             const sorted = [...sheet.segments].sort((a, b) => a.start_hour - b.start_hour);
             const connections = [];
             for(let i=0; i<sorted.length-1; i++) {
                const seg1 = sorted[i];
                const seg2 = sorted[i+1];
                if (seg1.start_hour + seg1.duration === seg2.start_hour) {
                   const x = xOf(seg2.start_hour);
                   const y1 = yOf(seg1.status);
                   const y2 = yOf(seg2.status);
                   connections.push(<line key={`v-${i}`} x1={x} y1={y1} x2={x} y2={y2} stroke="#dae2fd" strokeWidth={2} opacity={0.6} />);
                }
             }
             return connections;
          })()}

          {/* Remarks drop-lines */}
          {sheet.remarks.map((r, i) => {
            const cx   = xOf(r.hour);
            const cy   = yOf(r.status);
            const dropY = GRID_BOTTOM + BOTTOM_H + 8;
            const col   = STATUS_COLOR[r.status] || "#1e3a8a";
            return (
              <g key={i}>
                <line x1={cx} y1={cy} x2={cx} y2={dropY}
                      stroke={col} strokeWidth={1} strokeDasharray="3,2" opacity={0.7} />
                <line x1={cx - 4} y1={dropY} x2={cx + 4} y2={dropY}
                      stroke={col} strokeWidth={1.5} />
                <text x={cx + 4} y={GRID_BOTTOM + BOTTOM_H + 16}
                      fontSize={10} fill={col} fontWeight="600"
                      transform={`rotate(-52, ${cx + 4}, ${GRID_BOTTOM + BOTTOM_H + 16})`}>
                  {r.location?.split(" — ")[0] || ""}
                </text>
                <text x={cx + 4} y={GRID_BOTTOM + BOTTOM_H + 28}
                      fontSize={9} fill="#c3c6d7"
                      transform={`rotate(-52, ${cx + 4}, ${GRID_BOTTOM + BOTTOM_H + 28})`}>
                  {r.activity || ""}
                </text>
              </g>
            );
          })}

          {/* REMARKS label */}
          <text x={6} y={GRID_BOTTOM + BOTTOM_H + 14}
                fontSize={11} fill="#b4c5ff" fontWeight="700" fontStyle="italic">
            REMARKS
          </text>
        </svg>
      </div>

      {/* Totals footer */}
      <div className="grid grid-cols-4 bg-surface border-t border-outline-variant">
        {STATUSES.map(({ key, label, color }) => (
          <div key={key} className="py-3 px-4 border-r border-outline-variant text-center last:border-r-0">
            <div className="text-label-caps mb-1" style={{ color }}>{label.split(': ')[1] || label}</div>
            <div className="text-data-mono-lg font-data-mono-lg" style={{ color }}>
              {(sheet.totals[key] || 0).toFixed(2)}
              <span className="text-body-sm font-body-sm text-outline ml-1">h</span>
            </div>
          </div>
        ))}
      </div>

      {/* Audit + driving total bar */}
      <div className="flex flex-wrap justify-between items-center gap-2 px-5 py-3 bg-surface-container-low border-t border-outline-variant text-body-sm">
        <span className="text-on-surface-variant font-data-mono">
          24h Audit:{" "}
          <strong className={sheet.is_valid_24h ? "text-emerald-500" : "text-rose-500"}>
            {(sheet.total_hours ?? 0).toFixed(2)} / 24.00 {sheet.is_valid_24h ? "✓" : "✗"}
          </strong>
        </span>
        <span className="text-on-surface-variant font-data-mono">
          Driving + On-Duty:{" "}
          <span className="inline-block px-3 py-0.5 border-2 border-primary-container text-primary-container rounded-full font-data-mono-lg">
            {(sheet.driving_on_duty_total ?? 0).toFixed(2)} h
          </span>
        </span>
      </div>
    </div>
  );
}
