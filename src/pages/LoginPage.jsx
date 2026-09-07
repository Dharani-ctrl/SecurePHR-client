import React, { useState } from 'react';
import { Lock, Mail, Key, ShieldCheck, ArrowRight, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { loginUser, setAuthHeaders } from '../services/api';

export default function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('admin@kgc.cloud');
  const [password, setPassword] = useState('admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      const res = await loginUser({ email, password });
      if (res.data.success) {
        const user = res.data.user;
        setAuthHeaders(user.userId, user.role);
        onLoginSuccess(user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login Failed: Invalid credentials or account status.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('123456');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          SecurePHR <span className="text-emerald-600">Cloud</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Healthcare Cloud Research Platform (RBAC + Cryptographic HABKS-CR)
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-2xl space-y-6">

          <div className="border-b border-slate-100 pb-4 text-center">
            <h3 className="font-bold text-base text-slate-900">Unified Account Sign In</h3>
            <p className="text-xs text-slate-500 mt-1">Role-Based Dashboard Navigation (Patient, Doctor, Researcher, Admin)</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address / User ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. doctor@hospital.org"
                  required
                  className="w-full light-input pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full light-input pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>



          <div className="text-center pt-2 text-xs text-slate-500">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-emerald-600 font-bold hover:underline"
            >
              Register here
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
