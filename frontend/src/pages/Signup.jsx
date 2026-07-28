import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password,
          first_name: firstName,
          last_name: lastName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md premium-card p-10 animate-fade-in-up relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-emerald-400" />
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 mb-6 mx-auto border border-purple-500/20">
          <Icon name="person_add" fill className="text-purple-400 text-3xl" />
        </div>
        <h2 className="text-3xl font-bold text-center text-white mb-2 tracking-tight">Create Account</h2>
        <p className="text-body-sm text-center text-slate-400 mb-8">Join FMCSA Compliance Systems</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">First Name</label>
              <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all glow-hover">
                <input required value={firstName} onChange={e => setFirstName(e.target.value)}
                  placeholder="First"
                  className="bg-transparent border-none p-0 focus:ring-0 w-full text-white placeholder:text-slate-600 outline-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Last Name</label>
              <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all glow-hover">
                <input required value={lastName} onChange={e => setLastName(e.target.value)}
                  placeholder="Last"
                  className="bg-transparent border-none p-0 focus:ring-0 w-full text-white placeholder:text-slate-600 outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Username</label>
            <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all glow-hover">
              <Icon name="person" className="text-lg mr-3 text-slate-500" />
              <input required value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="bg-transparent border-none p-0 focus:ring-0 w-full text-white placeholder:text-slate-600 outline-none" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all glow-hover">
              <Icon name="key" className="text-lg mr-3 text-slate-500" />
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Create password"
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
            className="w-full gradient-btn text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #10b981 100%)' }}>
            {loading ? <Icon name="autorenew" className="animate-spin text-xl" /> : null}
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-400 mt-8">
          Already have an account? <a href="/login" className="text-purple-400 hover:text-purple-300 transition-colors hover:underline font-semibold">Sign in</a>
        </p>
      </div>
    </div>
  );
}
