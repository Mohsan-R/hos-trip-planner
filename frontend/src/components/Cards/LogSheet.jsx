// Authentic paper ELD daily-log rendering (Schneider-style grid)

const STATUSES = [
  { key: "OFF_DUTY", label: "1: OFF DUTY" },
  { key: "SLEEPER",  label: "2: SLEEPER BERTH" },
  { key: "DRIVING",  label: "3: DRIVING" },
  { key: "ON_DUTY",  label: "4: ON DUTY (NOT DRIVING)" },
];

const STATUS_ROW = { OFF_DUTY: 0, SLEEPER: 1, DRIVING: 2, ON_DUTY: 3 };

const ROW_H = 42;
const LABEL_W = 155;
const GRID_W = 960;
const RIGHT_W = 74;
const TOP_H = 28;
const BOTTOM_H = 28;
const REMARKS_H = 200;

const GRID_TOP = TOP_H;
const GRID_H = ROW_H * STATUSES.length;
const GRID_BOTTOM = GRID_TOP + GRID_H;
const SVG_W = LABEL_W + GRID_W + RIGHT_W;
const SVG_H = TOP_H + GRID_H + BOTTOM_H + REMARKS_H;

const BLUE = "#4a63a8";
const BLUE_LT = "#aab8dd";
const INK = "#111827";

const xOf = (h) => LABEL_W + (h / 24) * GRID_W;
const yOf = (k) => GRID_TOP + STATUS_ROW[k] * ROW_H + ROW_H / 2;

function hourLabel(h) {
  if (h === 0 || h === 24) return "Midnight";
  if (h === 12) return "noon";
  return String(h > 12 ? h - 12 : h);
}

function formatHour(h) {
  if (h == null) return "";
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function buildPath(segments = []) {
  if (!segments.length) return "";
  const sorted = [...segments].sort((a, b) => a.start_hour - b.start_hour);
  let d = "";
  let prevY = null;
  for (const seg of sorted) {
    const x1 = xOf(seg.start_hour);
    const x2 = xOf(seg.start_hour + seg.duration);
    const y = yOf(seg.status);
    if (prevY === null) d += `M ${x1} ${y}`;
    else if (prevY !== y) d += ` L ${x1} ${prevY} L ${x1} ${y}`;
    else d += ` L ${x1} ${y}`;
    d += ` L ${x2} ${y}`;
    prevY = y;
  }
  return d;
}

/* __BODY__ */

export default function LogSheet({ logSheets = [] }) {
  if (!logSheets.length) return null;

  return (
    <div className="mt-6 space-y-8">
      <h2 className="text-lg font-bold text-gray-800 uppercase tracking-widest">
        Driver's Daily Log
      </h2>
      {logSheets.map((sheet) => (
        <ELDPage key={sheet.day} sheet={sheet} />
      ))}
    </div>
  );
}

function ELDPage({ sheet }) {
  const path = buildPath(sheet.segments);
  const remarksH = Math.max(REMARKS_H, sheet.remarks.length * 28 + 40);
  const totalH = TOP_H + GRID_H + BOTTOM_H + remarksH;

  return (
    <div style={{ background: "#fff", border: "2px solid #1e3a8a", borderRadius: 4, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
      {/* Page header */}
      <div style={{ background: "#1e3a8a", color: "#fff", padding: "6px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>DRIVER'S DAILY LOG — DAY {sheet.day}</span>
        <span style={{ fontSize: 12, fontFamily: "monospace" }}>Total Miles: {sheet.total_miles}</span>
      </div>

      {/* SVG log grid */}
      <div style={{ overflowX: "auto", background: "#f0f4ff" }}>
        <svg width={SVG_W} height={totalH} style={{ display: "block", fontFamily: "Arial, sans-serif" }}>

          {/* Top hour labels */}
          {Array.from({ length: 25 }, (_, h) => (
            <text key={h} x={xOf(h)} y={16} textAnchor="middle" fontSize={9} fill={BLUE} fontWeight={h % 6 === 0 ? "bold" : "normal"}>
              {hourLabel(h)}
            </text>
          ))}

          {/* Row backgrounds, labels, grid lines */}
          {STATUSES.map(({ key, label }, i) => {
            const ry = GRID_TOP + i * ROW_H;
            return (
              <g key={key}>
                {/* Row background */}
                <rect x={LABEL_W} y={ry} width={GRID_W} height={ROW_H}
                  fill={i % 2 === 0 ? "#eef2ff" : "#e0e7ff"} />
                {/* Row border */}
                <rect x={LABEL_W} y={ry} width={GRID_W} height={ROW_H}
                  fill="none" stroke={BLUE} strokeWidth={0.8} />
                {/* Row label */}
                <text x={6} y={ry + ROW_H / 2 + 4} fontSize={10} fill={BLUE} fontWeight="bold">{label}</text>

                {/* Hour vertical lines */}
                {Array.from({ length: 25 }, (_, h) => (
                  <line key={h}
                    x1={xOf(h)} y1={ry} x2={xOf(h)} y2={ry + ROW_H}
                    stroke={h % 6 === 0 ? BLUE : BLUE_LT}
                    strokeWidth={h % 6 === 0 ? 1 : 0.4}
                  />
                ))}
                {/* 15-min ticks at bottom of row */}
                {Array.from({ length: 96 }, (_, q) => {
                  const hq = q / 4;
                  if (Number.isInteger(hq)) return null;
                  const isMajor = q % 2 === 0; // 30-min
                  return (
                    <line key={q}
                      x1={xOf(hq)} y1={ry + ROW_H - (isMajor ? 8 : 5)}
                      x2={xOf(hq)} y2={ry + ROW_H}
                      stroke={BLUE_LT} strokeWidth={0.5}
                    />
                  );
                })}
                {/* Hours total on right */}
                <text x={LABEL_W + GRID_W + 8} y={ry + ROW_H / 2 + 4}
                  fontSize={11} fill={INK} fontWeight="bold">
                  {(sheet.totals[key] || 0).toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Bottom hour labels */}
          {Array.from({ length: 25 }, (_, h) => (
            <text key={h} x={xOf(h)} y={GRID_BOTTOM + 18} textAnchor="middle" fontSize={9} fill={BLUE} fontWeight={h % 6 === 0 ? "bold" : "normal"}>
              {hourLabel(h)}
            </text>
          ))}

          {/* "HOURS" column header */}
          <text x={LABEL_W + GRID_W + 8} y={GRID_TOP - 6} fontSize={9} fill={BLUE} fontWeight="bold">HRS</text>

          {/* The duty-status stepped line */}
          {path && (
            <path d={path} fill="none" stroke={INK} strokeWidth={3} strokeLinejoin="miter" />
          )}

          {/* Drop-lines + diagonal remarks */}
          {sheet.remarks.map((r, i) => {
            const cx = xOf(r.hour);
            const cy = yOf(r.status);
            const dropY = GRID_BOTTOM + BOTTOM_H + 10;
            const labelX = cx + 6;
            const labelY = dropY + i * 0 + 20; // stagger handled by angle
            const textY = GRID_BOTTOM + BOTTOM_H + 20 + i * 26;
            return (
              <g key={i}>
                {/* Bracket drop-line */}
                <line x1={cx} y1={cy} x2={cx} y2={dropY} stroke={BLUE} strokeWidth={1} strokeDasharray="3,2" />
                <line x1={cx - 5} y1={dropY} x2={cx + 5} y2={dropY} stroke={BLUE} strokeWidth={1.5} />
                {/* Diagonal remark text */}
                <text
                  x={cx + 4}
                  y={GRID_BOTTOM + BOTTOM_H + 16}
                  fontSize={9}
                  fill={BLUE}
                  fontWeight="bold"
                  transform={`rotate(-55, ${cx + 4}, ${GRID_BOTTOM + BOTTOM_H + 16})`}
                >
                  {r.location?.split(" — ")[0] || ""}
                </text>
                <text
                  x={cx + 4}
                  y={GRID_BOTTOM + BOTTOM_H + 28}
                  fontSize={8}
                  fill={INK}
                  transform={`rotate(-55, ${cx + 4}, ${GRID_BOTTOM + BOTTOM_H + 28})`}
                >
                  {r.activity || ""}
                </text>
              </g>
            );
          })}

          {/* REMARKS label */}
          <text x={6} y={GRID_BOTTOM + BOTTOM_H + 14} fontSize={13} fill={BLUE} fontWeight="bold" fontStyle="italic">
            REMARKS
          </text>

        </svg>
      </div>

      {/* Totals footer */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: `2px solid ${BLUE}`, background: "#fff" }}>
        {STATUSES.map(({ key, label }) => (
          <div key={key} style={{ padding: "6px 8px", borderRight: `1px solid ${BLUE_LT}`, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: BLUE, fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: INK, fontFamily: "monospace" }}>
              {(sheet.totals[key] || 0).toFixed(2)} hrs
            </div>
          </div>
        ))}
      </div>

      {/* Audit bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 14px", background: "#f8fafc", borderTop: `1px solid ${BLUE_LT}`, fontSize: 13 }}>
        <span style={{ color: "#374151" }}>
          Total Hours:{" "}
          <strong style={{ color: sheet.is_valid_24h ? "#15803d" : "#dc2626" }}>
            {(sheet.total_hours ?? 0).toFixed(2)} / 24.00 {sheet.is_valid_24h ? "✓" : "✗"}
          </strong>
        </span>
        <span style={{ color: "#374151" }}>
          Driving + On-Duty:{" "}
          <span style={{ display: "inline-block", padding: "1px 10px", border: "2px solid #111827", borderRadius: 20, fontFamily: "monospace", fontWeight: 700, fontSize: 14 }}>
            {(sheet.driving_on_duty_total ?? 0).toFixed(2)} hrs
          </span>
        </span>
      </div>
    </div>
  );
}
