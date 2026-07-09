import { useState } from 'react';
import { BrainCircuit, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000';

// Password rules: min 8 chars, at least 1 lowercase, 1 uppercase, 1 digit, 1 symbol
const PASSWORD_RULES = [
  { id: 'lowercase', label: 'One lowercase letter (a-z)',  test: (p) => /[a-z]/.test(p) },
  { id: 'uppercase', label: 'One uppercase letter (A-Z)',  test: (p) => /[A-Z]/.test(p) },
  { id: 'digit',     label: 'One number (0-9)',            test: (p) => /[0-9]/.test(p) },
  { id: 'symbol',    label: 'One symbol (!@#$...)',        test: (p) => /[^a-zA-Z0-9]/.test(p) },
  { id: 'minlen',    label: 'At least 8 characters',       test: (p) => p.length >= 8 },
];

export default function RegisterPage({ onGoToLogin }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const allRulesPassed = PASSWORD_RULES.every(r => r.test(form.password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!allRulesPassed) {
      setError('Please meet all password requirements.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.detail || 'Registration failed.'); return; }
      login(data);
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 w-full text-center">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-8 w-full flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30 mb-5">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 w-full">Create your account</h2>
          <p className="text-neutral-400 w-full">Start your journey to social confidence</p>
        </div>

        {/* Card */}
        <div className="w-full bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl flex flex-col items-stretch text-left">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input type="text" name="username" value={form.username} onChange={handleChange}
                  placeholder="yourname" required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={form.password} onChange={handleChange}
                  placeholder="At least 8 chars" required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-12 py-3 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Live Password Requirements */}
              {form.password.length > 0 && (
                <div className="mt-3 bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 space-y-2">
                  {PASSWORD_RULES.map(rule => {
                    const passed = rule.test(form.password);
                    return (
                      <div key={rule.id} className={`flex items-center gap-2 text-sm transition-colors ${passed ? 'text-emerald-400' : 'text-neutral-500'}`}>
                        {passed
                          ? <Check className="w-3.5 h-3.5 shrink-0" />
                          : <X className="w-3.5 h-3.5 shrink-0" />}
                        {rule.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !allRulesPassed}
              className="group relative w-full inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-white rounded-xl overflow-hidden bg-white/5 border border-white/10 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <button onClick={onGoToLogin} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
