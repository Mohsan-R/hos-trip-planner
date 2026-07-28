import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Icon from '../components/ui/Icon';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      login(data.access);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md premium-card p-10 animate-fade-in-up relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 mb-6 mx-auto border border-blue-500/20">
          <Icon name="lock" fill className="text-blue-400 text-3xl" />
        </div>
        <h2 className="text-3xl font-bold text-center text-white mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-body-sm text-center text-slate-400 mb-8">Sign in to FMCSA Compliance Systems</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Username</label>
            <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all glow-hover">
              <Icon name="person" className="text-lg mr-3 text-slate-500" />
              <input required value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-transparent border-none p-0 focus:ring-0 w-full text-white placeholder:text-slate-600 outline-none" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all glow-hover">
              <Icon name="key" className="text-lg mr-3 text-slate-500" />
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
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
            className="w-full gradient-btn text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-6 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? <Icon name="autorenew" className="animate-spin text-xl" /> : null}
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-400 mt-8">
          Don't have an account? <a href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors hover:underline font-semibold">Sign up</a>
        </p>
      </div>
    </div>
  );
}
