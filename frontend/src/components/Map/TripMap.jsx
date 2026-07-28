import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, ZoomControl, LayersControl } from 'react-leaflet';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [56, 56] });
  }, [bounds, map]);
  return null;
}

export default function TripMap({ trip }) {
  const [positions, setPositions] = useState([]);
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    if (!trip?.geometry) { setPositions([]); setBounds(null); return; }
    const decoded = polyline.decode(trip.geometry);
    setPositions(decoded);
    if (decoded.length > 0) {
      const lats = decoded.map(p => p[0]);
      const lngs = decoded.map(p => p[1]);
      setBounds([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]]);
    }
  }, [trip]);

  if (!trip) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d162d] technical-grid gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary/60 text-4xl">map</span>
        </div>
        <div className="text-center">
          <p className="text-on-surface font-medium text-sm">No route yet</p>
          <p className="text-on-surface-variant text-xs mt-1">Submit a trip to view the route map</p>
        </div>
        <div className="absolute top-6 left-6 glass-panel p-4 rounded-lg border border-outline-variant/40">
          <p className="text-label-caps text-on-surface-variant mb-2">ENGINE STATUS</p>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
            <p className="font-data-mono text-body-sm text-secondary">READY</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MapContainer center={[39.8283, -98.5795]} zoom={4} className="h-full w-full absolute inset-0"
      zoomControl={false}>
      
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Dark Mode">
          <TileLayer
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <ZoomControl position="bottomright" />

      {positions.length > 0 && (
        <>
          <Polyline positions={positions} color="#2563eb" weight={5} opacity={0.85} />
          <Marker position={positions[0]}>
            <Popup><strong>Start:</strong> {trip.current_location}</Popup>
          </Marker>
          <Marker position={positions[Math.floor(positions.length / 2)]}>
            <Popup><strong>Pickup:</strong> {trip.pickup_location}</Popup>
          </Marker>
          <Marker position={positions[positions.length - 1]}>
            <Popup><strong>Dropoff:</strong> {trip.dropoff_location}</Popup>
          </Marker>
        </>
      )}
      {bounds && <FitBounds bounds={bounds} />}
    </MapContainer>
  );
}
