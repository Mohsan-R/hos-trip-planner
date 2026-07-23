import React, { useState } from 'react';
import { tripApi } from '../services/tripApi';
import TripMap from '../components/Map/TripMap';
import TripSummary from '../components/Cards/TripSummary';

export default function Planner() {
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_hours: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tripResult, setTripResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = {
        ...formData,
        current_cycle_hours: parseFloat(formData.current_cycle_hours)
      };
      const result = await tripApi.createTrip(data);
      setTripResult(result);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to calculate route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Phase 2 Route Planner</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form Column */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Location</label>
                <input required type="text" name="current_location" value={formData.current_location} onChange={handleChange} placeholder="e.g. Dallas, TX" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                <input required type="text" name="pickup_location" value={formData.pickup_location} onChange={handleChange} placeholder="e.g. Houston, TX" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dropoff Location</label>
                <input required type="text" name="dropoff_location" value={formData.dropoff_location} onChange={handleChange} placeholder="e.g. Chicago, IL" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Cycle Hours Used</label>
                <input required type="number" step="0.1" name="current_cycle_hours" value={formData.current_cycle_hours} onChange={handleChange} placeholder="e.g. 22" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500" />
              </div>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
              <button disabled={loading} type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-300">
                {loading ? 'Calculating...' : 'Plan Trip'}
              </button>
            </form>
          </div>
          
          {tripResult && <TripSummary trip={tripResult} />}
        </div>
        
        {/* Map Column */}
        <div className="w-full lg:w-2/3 min-h-[500px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
          <TripMap trip={tripResult} />
        </div>
      </div>
    </div>
  );
}
