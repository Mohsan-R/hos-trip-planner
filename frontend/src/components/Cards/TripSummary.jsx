import React from 'react';

export default function TripSummary({ trip }) {
  if (!trip) return null;

  const distanceMiles = (trip.distance * 0.000621371).toFixed(1);
  const hours = Math.floor(trip.duration / 3600);
  const minutes = Math.floor((trip.duration % 3600) / 60);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-green-700">Trip Summary</h2>
      
      <div className="space-y-4 text-gray-700">
        <div className="flex justify-between pb-2 border-b">
          <span className="font-medium text-gray-500">Total Distance</span>
          <span className="font-bold">{distanceMiles} mi</span>
        </div>
        
        <div className="flex justify-between pb-2 border-b">
          <span className="font-medium text-gray-500">Estimated Driving Time</span>
          <span className="font-bold">{hours}h {minutes}m</span>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-gray-600 mb-2">Legs</h3>
          {trip.legs && trip.legs.map((leg, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded-md mb-2 text-sm border">
              <div className="flex justify-between">
                <span className="font-medium">{leg.from} → {leg.to}</span>
              </div>
              <div className="text-gray-500 mt-1">
                {(leg.distance * 0.000621371).toFixed(1)} mi | {Math.floor(leg.duration / 3600)}h {Math.floor((leg.duration % 3600) / 60)}m
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
