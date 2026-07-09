import { useState } from 'react';
import { BrainCircuit, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000';

export default function LoginPage({ onGoToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // POST /auth/login with our credentials
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Login failed. Please check your credentials.');
        return;
      }

      // data = { access_token, user_id, username }
      // Calling login() saves the token to state + localStorage
      login(data);
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 w-full">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-8 w-full flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30 mb-5">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 w-full text-center">Welcome back</h2>
          <p className="text-neutral-400 w-full text-center">Sign in to continue your practice journey</p>
        </div>

        {/* Card */}
        <div className="w-full bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl flex flex-col">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 chars"
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-12 py-3 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-white rounded-xl overflow-hidden bg-white/5 border border-white/10 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-500">
            Don't have an account?{' '}
            <button onClick={onGoToRegister} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Create one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
