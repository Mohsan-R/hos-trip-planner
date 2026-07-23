import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    axios.get('http://localhost:8000/api/health/')
      .then(response => {
        setBackendStatus(response.data.message);
      })
      .catch(error => {
        setBackendStatus('Failed to connect to backend.');
        console.error(error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">FMCSA Trip Planner</h1>
        <p className="text-gray-700 text-lg mb-2">Backend Connection Status:</p>
        <div className={`p-4 rounded-md font-medium ${backendStatus.includes('Failed') ? 'bg-red-100 text-red-700' : backendStatus === 'Checking...' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
          {backendStatus}
        </div>
      </div>
    </div>
  );
}

export default App;
