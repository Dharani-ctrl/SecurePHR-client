import React, { useState, useRef } from 'react';
import { Lock, Mail, Key, ShieldCheck, ArrowRight, CheckCircle2, UserCheck, AlertCircle, Smartphone, RefreshCw, QrCode, ArrowLeft, Shield } from 'lucide-react';
import { loginUser, verifyTotpApi, setAuthHeaders } from '../services/api';

export default function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  // Step state: 'CREDENTIALS' | 'VERIFYING' | 'TOTP' | 'ROLE_ROUTING'
  const [authStep, setAuthStep] = useState('CREDENTIALS');

  // Input states
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin');
  
  // Account Verification Temp State
  const [accountData, setAccountData] = useState(null);
  
  // 6-digit TOTP array state
  const [totpDigits, setTotpDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQrSecret, setShowQrSecret] = useState(false);

  // Step 1: Handle Initial Account Sign-In
  const handleCredentialsSubmit = async (e) => {
    e?.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      setAuthStep('VERIFYING');

      // Short artificial delay for smooth UX transition showing "Verify Account"
      await new Promise((res) => setTimeout(res, 600));

      const res = await loginUser({ email, password });
      if (res.data.success) {
        setAccountData(res.data);
        
        // Populate demo TOTP if available
        if (res.data.user?.currentTotpCode) {
          const digits = String(res.data.user.currentTotpCode).split('');
          if (digits.length === 6) {
            setTotpDigits(digits);
          }
        }

        setAuthStep('TOTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login Failed: Invalid credentials or account status.');
      setAuthStep('CREDENTIALS');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...totpDigits];
    newDigits[index] = value.slice(-1);
    setTotpDigits(newDigits);

    // Auto-advance to next box if filled
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Handle Key Down for Backspace auto-retreat
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !totpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Handle Paste 6 digits
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setTotpDigits(digits);
      inputRefs[5].current?.focus();
    }
  };

  const handleTotpSubmit = async (e) => {
    e?.preventDefault();
    const fullCode = totpDigits.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of your Google Authenticator code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await verifyTotpApi({
        userId: accountData?.user?.userId || email,
        totpCode: fullCode
      });

      if (res.data.success) {
        const user = res.data.user;
        setAuthStep('ROLE_ROUTING');
        setAuthHeaders(user.userId, user.role);

        // Allow user to see "Verify User Role -> Redirecting..." animation
        setTimeout(() => {
          onLoginSuccess(user);
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid 6-Digit TOTP Code. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const fillLiveTotp = () => {
    if (accountData?.user?.currentTotpCode) {
      const digits = String(accountData.user.currentTotpCode).split('');
      setTotpDigits(digits);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500 selection:text-white">

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          SecurePHR <span className="text-emerald-600">Cloud</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Healthcare Cloud Platform — Recommended Authentication & 2FA Workflow
        </p>
      </div>

   
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-7 px-6 sm:px-8 shadow-sm border border-slate-200/90 rounded-2xl space-y-6">

          {/* Authentication Process Flowchart Stepper Header */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Recommended Authentication Pipeline
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
              
              {/* Step 1 Node */}
              <div className={`p-2 rounded-lg border transition ${
                authStep === 'CREDENTIALS' 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs ring-1 ring-emerald-400' 
                  : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <div className="truncate">1. Credentials</div>
                <div className="text-[9px] font-normal text-slate-400 mt-0.5">ID + Password</div>
              </div>

              {/* Step 2 Node */}
              <div className={`p-2 rounded-lg border transition ${
                authStep === 'VERIFYING' 
                  ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs ring-1 ring-amber-400 animate-pulse' 
                  : authStep === 'TOTP' || authStep === 'ROLE_ROUTING'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-400'
              }`}>
                <div className="truncate">2. Verify Account</div>
                <div className="text-[9px] font-normal text-slate-400 mt-0.5">Check Status</div>
              </div>

              {/* Step 3 Node */}
              <div className={`p-2 rounded-lg border transition ${
                authStep === 'TOTP' 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs ring-1 ring-emerald-400' 
                  : authStep === 'ROLE_ROUTING'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-400'
              }`}>
                <div className="truncate">3. Authenticator</div>
                <div className="text-[9px] font-normal text-slate-400 mt-0.5">6-Digit TOTP</div>
              </div>

              {/* Step 4 Node */}
              <div className={`p-2 rounded-lg border transition ${
                authStep === 'ROLE_ROUTING' 
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-2xs ring-1 ring-indigo-400 animate-bounce' 
                  : 'bg-white border-slate-200 text-slate-400'
              }`}>
                <div className="truncate">4. Verify Role</div>
                <div className="text-[9px] font-normal text-slate-400 mt-0.5">Dashboard Route</div>
              </div>

            </div>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STAGE 1 & 2: LOGIN ID & PASSWORD FORM */}
          {(authStep === 'CREDENTIALS' || authStep === 'VERIFYING') && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Step 1: Account Credentials Verification</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter your registered Email or Login ID and Password.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Login ID / Email Address</label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. doctor@hospital.org"
                    required
                    disabled={authStep === 'VERIFYING'}
                    className="w-full light-input pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={authStep === 'VERIFYING'}
                    className="w-full light-input pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || authStep === 'VERIFYING'}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {authStep === 'VERIFYING' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Account & Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STAGE 3: GOOGLE AUTHENTICATOR 6-DIGIT TOTP */}
          {authStep === 'TOTP' && (
            <form onSubmit={handleTotpSubmit} className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Step 2: Google Authenticator 2FA</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Account Verified (<span className="font-bold text-slate-700">{accountData?.user?.email}</span>). Enter 6-digit TOTP code.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAuthStep('CREDENTIALS');
                    setError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>

              {/* 6 Discrete Digit Inputs */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 text-center">
                  6-Digit Verification Code
                </label>
                <div className="flex justify-center items-center space-x-2" onPaste={handlePaste}>
                  {totpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={inputRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-mono font-extrabold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition shadow-2xs"
                    />
                  ))}
                </div>
              </div>

              {/* Live Demo Helper Box */}
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3.5 space-y-2.5 text-xs text-emerald-950">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center space-x-1.5 text-emerald-900">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Google Authenticator TOTP Secret</span>
                  </span>

                  <button
                    type="button"
                    onClick={fillLiveTotp}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition shadow-2xs flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Fill Code</span>
                  </button>
                </div>

                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-emerald-200 font-mono">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-sans">Base32 Secret:</span>
                    <span className="font-bold text-slate-900">{accountData?.user?.totpSecret}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-sans">Live 6-Digit TOTP:</span>
                    <span className="font-extrabold text-emerald-600 text-sm tracking-wider">{accountData?.user?.currentTotpCode}</span>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-700 font-medium">
                  Scan URI in Google Authenticator or use the 6-digit live code generated above.
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || totpDigits.join('').length !== 6}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying 6-Digit TOTP...</span>
                  </>
                ) : (
                  <>
                    <span>Verify 2FA & Authenticate</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STAGE 4: ROLE VERIFICATION & AUTOMATIC DASHBOARD REDIRECTION */}
          {authStep === 'ROLE_ROUTING' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Google Authenticator Verified!
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Role Verified: <span className="font-bold text-emerald-600 uppercase">{accountData?.user?.role || 'PATIENT'}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 inline-flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span>Navigating to {accountData?.user?.role} Dashboard...</span>
              </div>
            </div>
          )}

          {/* Register Redirect Footer */}
          <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
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
