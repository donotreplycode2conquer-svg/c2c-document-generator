import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/common/Logo';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute w-[500px] h-[500px] bg-navy-900/40 rounded-full blur-3xl -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-gold-600/10 rounded-full blur-3xl -bottom-32 -right-32 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Card */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-2xl bg-navy-900 border border-navy-800 shadow-xl mb-3">
            <Logo size="lg" variant="light" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide mt-2">
            Administrator Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Code2Conquer Document Generator & Certificate Registry
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-navy-900">Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your administrative credentials to continue.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
            </button>
          </form>

          {/* Dev Hint Box */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Default credentials for local admin: <br />
            Username: <strong className="text-slate-600 font-mono">admin</strong> • Password: <strong className="text-slate-600 font-mono">admin123</strong>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          Code2Conquer Pvt. Ltd. • Internal Administrator Use Only
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
