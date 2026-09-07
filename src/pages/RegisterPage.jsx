import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, Building, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerUser } from '../services/api';

export default function RegisterPage({ onSwitchToLogin }) {
  const [role, setRole] = useState('PATIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await registerUser({
        name,
        email,
        password,
        role,
        organization,
        department
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration Failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create Account
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Register as Patient, Doctor, or Researcher
        </p>
      </div>

      {/* Register Form Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-2xl space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-3">
              <div className="flex items-center space-x-2 font-bold text-emerald-700 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
              <button
                onClick={onSwitchToLogin}
                className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700 transition"
              >
                Proceed to Login
              </button>
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Select Role Toggle Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">I am registering as a:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('PATIENT')}
                    className={`role-select-card ${role === 'PATIENT' ? 'active' : ''}`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('DOCTOR')}
                    className={`role-select-card ${role === 'DOCTOR' ? 'active' : ''}`}
                  >
                    Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('RESEARCHER')}
                    className={`role-select-card ${role === 'RESEARCHER' ? 'active' : ''}`}
                  >
                    Researcher
                  </button>
                </div>
                {role !== 'PATIENT' && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                    Note: Doctor & Researcher registrations require Admin KGC verification before PHR search access is active.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Arun Kumar"
                    required
                    className="w-full light-input pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. arun@hospital.org"
                    required
                    className="w-full light-input pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set your account password"
                    required
                    className="w-full light-input pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {role !== 'PATIENT' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Hospital</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g. Hospital A / Stanford University"
                        className="w-full light-input pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium"
                      />
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Research Domain</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Cardiology"
                      className="w-full light-input px-3 py-2.5 rounded-xl text-xs font-medium"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Submitting Registration...' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

          <div className="text-center pt-2 text-xs text-slate-500">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-emerald-600 font-bold hover:underline"
            >
              Sign In here
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
