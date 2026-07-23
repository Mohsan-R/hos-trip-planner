import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons not loading in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


function ChangeView({ bounds }) {
  const map = useMap();
  if (bounds) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
  return null;
}

export default function TripMap({ trip }) {
  const [positions, setPositions] = useState([]);
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    if (trip && trip.geometry) {
      // Decode the polyline string returned by ORS
      const decoded = polyline.decode(trip.geometry);
      setPositions(decoded);

      if (decoded.length > 0) {
        const lats = decoded.map(p => p[0]);
        const lngs = decoded.map(p => p[1]);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        setBounds([[minLat, minLng], [maxLat, maxLng]]);
      }
    }
  }, [trip]);

  if (!trip) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
        Submit a trip to view the route map
      </div>
    );
  }

  return (
    <MapContainer center={[39.8283, -98.5795]} zoom={4} className="h-full w-full absolute inset-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {positions.length > 0 && (
        <Polyline positions={positions} color="blue" weight={5} />
      )}

      {positions.length > 0 && (
        <>
          <Marker position={positions[0]}>
            <Popup>Current Location: {trip.current_location}</Popup>
          </Marker>
          <Marker position={positions[Math.floor(positions.length / 2)]}>
            <Popup>Pickup Location: {trip.pickup_location}</Popup>
          </Marker>
          <Marker position={positions[positions.length - 1]}>
            <Popup>Dropoff Location: {trip.dropoff_location}</Popup>
          </Marker>
        </>
      )}

      {bounds && <ChangeView bounds={bounds} />}
    </MapContainer>
  );
}
