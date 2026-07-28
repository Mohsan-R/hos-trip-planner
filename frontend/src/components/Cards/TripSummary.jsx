import React from 'react';
import Icon from '../ui/Icon';

function Metric({ label, value, color }) {
  return (
    <div className="text-center p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 flex flex-col justify-center">
      <p className="text-label-caps text-on-surface-variant mb-1">{label}</p>
      <p className={`font-data-mono-lg text-data-mono-lg ${color}`}>{value}</p>
    </div>
  );
}

const LEG_STYLES = [
  { border: 'border-emerald-500', icon: 'location_on', color: 'text-emerald-500', fill: true },
  { border: 'border-amber-500', icon: 'local_cafe', color: 'text-amber-500', fill: true },
  { border: 'border-primary', icon: 'local_shipping', color: 'text-primary', fill: true },
];

export default function TripSummary({ trip }) {
  if (!trip || !trip.summary) return null;

  const distanceMiles = (trip.summary.distance * 0.000621371).toFixed(0);
  const hours = Math.floor(trip.summary.driving_hours / 3600);
  const minutes = Math.floor((trip.summary.driving_hours % 3600) / 60);
  const totalTripTime = trip.summary.total_trip_time.toFixed(1);

  return (
    <div className="bg-surface-container rounded-2xl border border-outline-variant p-6 shadow-sm">
      <h2 className="text-headline-md mb-6 flex items-center gap-2">
        <Icon name="timeline" className="text-on-surface-variant" /> Trip Summary
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Metric label="DISTANCE" value={`${distanceMiles} mi`} color="text-on-surface" />
        <Metric label="DRIVE TIME" value={`${hours}h ${minutes}m`} color="text-emerald-500" />
        <Metric label="TOTAL HOS" value={`${totalTripTime}h`} color="text-amber-500" />
      </div>

      <div className="space-y-3">
        <p className="text-label-caps text-on-surface-variant mb-3">LEG BREAKDOWN</p>
        {trip.legs && trip.legs.map((leg, idx) => {
          const s = LEG_STYLES[idx % LEG_STYLES.length];
          const isLast = idx === trip.legs.length - 1;
          const miles = (leg.distance * 0.000621371).toFixed(0);
          const h = Math.floor(leg.duration / 3600);
          const m = Math.floor((leg.duration % 3600) / 60);
          return (
            <div key={idx} className={`flex items-start gap-4 py-2 hover:bg-surface-container-highest/20 transition-colors border-l-2 pl-3 ${s.border}`}>
              <div className="flex flex-col items-center">
                <Icon name={s.icon} fill={s.fill} className={s.color} />
                {!isLast && <div className="w-px h-12 bg-outline-variant/40 my-1" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <p className="font-bold text-on-surface truncate text-body-sm">Leg {idx + 1}: {leg.from.split(',')[0]}</p>
                  <span className="font-data-mono text-data-mono text-on-surface-variant shrink-0">{miles} mi</span>
                </div>
                <p className="text-on-surface-variant text-body-sm truncate mt-1">
                  {leg.from} → {leg.to}
                </p>
                <p className="text-outline text-xs font-data-mono mt-1">{h}h {m}m</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
