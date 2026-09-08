import React, { useState, useEffect } from 'react';
import { Key, Shield, Plus, UserPlus, CheckCircle, RefreshCw, Cpu, Layers, Fingerprint, UserCheck, UserX, AlertOctagon, Activity, Trash2, Copy, Search, Sparkles, Filter, Check, Lock, ChevronRight } from 'lucide-react';
import { getSystemParameters, addAttribute, registerUserKeyGen, getUsers, approveUser, revokeUser, deleteUser, clearDatabase, getAuditLogs } from '../services/api';

export default function KGCAdmin({ onUserUpdated }) {
  const [params, setParams] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAttribute, setNewAttribute] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // Register Form State
  const [regUserId, setRegUserId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [regRole, setRegRole] = useState('DOCTOR');
  const [selectedAttributes, setSelectedAttributes] = useState([]);

  const [notification, setNotification] = useState(null);

  const fetchKGCData = async () => {
    try {
      setLoading(true);
      const [resParams, resUsers, resLogs] = await Promise.all([
        getSystemParameters(),
        getUsers(),
        getAuditLogs()
      ]);
      if (resParams.data.success) {
        setParams(resParams.data.publicParameters);
        setAttributes(resParams.data.attributes);
      }
      if (resUsers.data.success) {
        setUsers(resUsers.data.users);
      }
      if (resLogs.data.success) {
        setAuditLogs(resLogs.data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKGCData();
  }, []);

  const handleCopy = (text, keyLabel) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyLabel);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddAttribute = async (e) => {
    e.preventDefault();
    if (!newAttribute.trim()) return;
    try {
      const res = await addAttribute(newAttribute.trim());
      if (res.data.success) {
        setAttributes(res.data.attributes);
        setNewAttribute('');
        showNotify(`Attribute '${newAttribute}' added to HABKS-CR universe.`);
      }
    } catch (err) {
      showNotify(err.response?.data?.message || 'Error adding attribute', 'error');
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    if (!regUserId || !regName) return;
    try {
      const res = await registerUserKeyGen({
        userId: regUserId,
        name: regName,
        email: regEmail,
        organization: regOrg,
        role: regRole,
        userAttributes: selectedAttributes
      });
      if (res.data.success) {
        showNotify(`User '${regName}' registered with status '${res.data.user.status}'.`);
        setRegUserId('');
        setRegName('');
        setRegEmail('');
        setRegOrg('');
        setSelectedAttributes([]);
        fetchKGCData();
        if (onUserUpdated) onUserUpdated();
      }
    } catch (err) {
      showNotify(err.response?.data?.message || 'Error registering user', 'error');
    }
  };

  const handleApprove = async (userId) => {
    try {
      const u = users.find(usr => usr.userId === userId);
      const defaultAttrs = u.attributes.length > 0 ? u.attributes : ['Role:Doctor', 'Dept:Cardiology', 'Status:Approved'];
      const res = await approveUser({ userId, assignedAttributes: defaultAttrs });
      if (res.data.success) {
        showNotify(`Approved user ${u.name} and issued identity-bound key SK_ID!`);
        fetchKGCData();
        if (onUserUpdated) onUserUpdated();
      }
    } catch (err) {
      showNotify(err.response?.data?.message || 'Error approving user', 'error');
    }
  };

  const handleRevoke = async (userId) => {
    try {
      const res = await revokeUser({ userId });
      if (res.data.success) {
        showNotify(`User ${userId} has been revoked!`, 'error');
        fetchKGCData();
        if (onUserUpdated) onUserUpdated();
      }
    } catch (err) {
      showNotify(err.response?.data?.message || 'Error revoking user', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account '${userId}' from MongoDB Atlas?`)) return;
    try {
      const res = await deleteUser({ userId });
      if (res.data.success) {
        showNotify(`User account '${userId}' permanently deleted.`, 'error');
        fetchKGCData();
        if (onUserUpdated) onUserUpdated();
      }
    } catch (err) {
      showNotify(err.response?.data?.message || 'Error deleting user', 'error');
    }
  };

  const toggleAttr = (attr) => {
    if (selectedAttributes.includes(attr)) {
      setSelectedAttributes(selectedAttributes.filter(a => a !== attr));
    } else {
      setSelectedAttributes([...selectedAttributes, attr]);
    }
  };

  const showNotify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear all dynamic users and PHR data from MongoDB Atlas?')) return;
    try {
      const res = await clearDatabase();
      if (res.data.success) {
        showNotify('Database cleared cleanly. System reset to dynamic state.', 'error');
        fetchKGCData();
        if (onUserUpdated) onUserUpdated();
      }
    } catch (err) {
      showNotify(err.response?.data?.message || 'Error clearing database', 'error');
    }
  };

  const selectAllCategoryAttrs = (prefix) => {
    const categoryAttrs = attributes.filter(a => a.startsWith(prefix));
    const allSelected = categoryAttrs.every(a => selectedAttributes.includes(a));
    if (allSelected) {
      setSelectedAttributes(selectedAttributes.filter(a => !a.startsWith(prefix)));
    } else {
      const newAttrs = Array.from(new Set([...selectedAttributes, ...categoryAttrs]));
      setSelectedAttributes(newAttrs);
    }
  };

  const pendingUsers = users.filter(u => u.status === 'PENDING_APPROVAL' || u.status === 'PENDING');
  const approvedUsers = users.filter(u => u.status === 'APPROVED' || u.status === 'ACTIVE');
  const suspiciousLogs = auditLogs.filter(l => l.action === 'DECRYPTION_FAILED' || l.action === 'USER_REVOKED' || l.action === 'COLLUSION_SIMULATED');

  const filteredUsers = users.filter(u => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.userId.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.organization && u.organization.toLowerCase().includes(q)) ||
      (u.attributes && u.attributes.some(a => a.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-7 rounded-2xl text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5 backdrop-blur">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin / Key Generation Center (KGC) Control Authority</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                HABKS-CR Engine v2.4
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              System Security Administration & User Verification
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              As the trusted security authority, KGC verifies doctors & researchers, assigns attributes, generates identity-bound cryptographic credentials (<code className="text-emerald-300 bg-slate-950/80 px-1.5 py-0.5 rounded font-mono text-[11px] border border-slate-800">r_ID = H(ID)</code>), revokes unauthorized users, and monitors system audit logs.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={handleClearDatabase}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold backdrop-blur border border-rose-500/40 transition shadow-lg hover:shadow-rose-600/20 active:scale-95"
            >
              <UserX className="w-4 h-4" />
              <span>Reset Database</span>
            </button>
            <button
              onClick={fetchKGCData}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur border border-white/20 transition hover:border-white/30 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh KGC</span>
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-xs font-semibold border shadow-md flex items-center justify-between transition-all animate-fadeIn ${
          notification.type === 'error' 
            ? 'bg-rose-900/10 border-rose-500/30 text-rose-700' 
            : 'bg-emerald-900/10 border-emerald-500/30 text-emerald-800'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'error' ? <AlertOctagon className="w-4 h-4 text-rose-600" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
            <span>{notification.msg}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
        </div>
      )}

      {/* System Metrics Overview Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300/80 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Total System Users</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-slate-900 text-2xl flex items-baseline justify-between">
            <span>{users.length}</span>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">Registered</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300/80 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Pending Approvals</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-2xl flex items-baseline justify-between">
            <span className={pendingUsers.length > 0 ? 'text-amber-600' : 'text-slate-900'}>{pendingUsers.length}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pendingUsers.length > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-500'}`}>
              Pending
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300/80 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Attribute Universe</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-sky-700 text-2xl flex items-baseline justify-between">
            <span>{attributes.length}</span>
            <span className="text-xs text-sky-800 font-medium bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">Attributes</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-rose-300/80 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Suspicious Events</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-rose-600 text-2xl flex items-baseline justify-between">
            <span>{suspiciousLogs.length}</span>
            <span className="text-xs text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">Logged</span>
          </div>
        </div>

      </div>

      {/* Pending User Approvals Queue Section */}
      {pendingUsers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 sm:p-6 rounded-2xl border border-amber-200/90 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-amber-900 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>Pending User Verification Queue ({pendingUsers.length})</span>
            </h3>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
              Action Required
            </span>
          </div>

          <div className="divide-y divide-amber-200/70 text-xs">
            {pendingUsers.map((u, idx) => (
              <div key={u.userId || u.id || `pend_${idx}`} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <span>{u.name}</span>
                    <span className="font-mono text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300 text-[11px]">
                      {u.userId}
                    </span>
                  </div>
                  <div className="text-slate-600 text-xs flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Role: <strong className="text-slate-800">{u.role}</strong></span>
                    <span>Org: <strong className="text-slate-800">{u.organization || 'General'}</strong></span>
                    <span>Email: <span className="text-slate-700 font-mono">{u.email}</span></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleApprove(u.userId)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-1.5 active:scale-95"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Approve & Issue SK_ID</span>
                  </button>
                  <button
                    onClick={() => handleRevoke(u.userId)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-1.5 active:scale-95"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Public Parameters & Attribute Universe & Activity */}
        <div className="space-y-6 lg:col-span-1">

          {/* Public Parameters Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>Public Parameters (PK)</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                Pairing G1 × G2
              </span>
            </div>

            {params ? (
              <div className="space-y-3 text-xs">
                
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span className="font-semibold">Generator g:</span>
                    <button 
                      onClick={() => handleCopy(params.generator, 'gen')}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1 text-[10px]"
                    >
                      {copiedKey === 'gen' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'gen' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-emerald-700 font-bold bg-white px-2.5 py-1.5 rounded border border-slate-200 text-xs overflow-x-auto">
                    {params.generator}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span className="font-semibold">Pairing Group GT:</span>
                    <button 
                      onClick={() => handleCopy(params.pairGenerator, 'pair')}
                      className="text-sky-700 hover:text-sky-800 font-semibold flex items-center space-x-1 text-[10px]"
                    >
                      {copiedKey === 'pair' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'pair' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-sky-700 font-bold bg-white px-2.5 py-1.5 rounded border border-slate-200 text-xs overflow-x-auto">
                    {params.pairGenerator}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span className="font-semibold">Master e(g,g)^α Public:</span>
                    <button 
                      onClick={() => handleCopy(params.alphaPublic, 'alpha')}
                      className="text-slate-700 hover:text-slate-900 font-semibold flex items-center space-x-1 text-[10px]"
                    >
                      {copiedKey === 'alpha' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'alpha' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-slate-700 bg-white px-2.5 py-1.5 rounded border border-slate-200 text-[11px] truncate">
                    {params.alphaPublic}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span className="font-semibold">Master g^β Public:</span>
                    <button 
                      onClick={() => handleCopy(params.betaPublic, 'beta')}
                      className="text-slate-700 hover:text-slate-900 font-semibold flex items-center space-x-1 text-[10px]"
                    >
                      {copiedKey === 'beta' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'beta' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-slate-700 bg-white px-2.5 py-1.5 rounded border border-slate-200 text-[11px] truncate">
                    {params.betaPublic}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 font-medium">
                  <span>Attribute Universe Size:</span>
                  <span className="font-extrabold text-emerald-700 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 text-xs">
                    {attributes.length} Attributes
                  </span>
                </div>

              </div>
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">Loading parameters...</div>
            )}
          </div>

          {/* Attribute Universe Management Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Global Attribute Universe (U)</span>
              </h3>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {attributes.length}
              </span>
            </div>

            <form onSubmit={handleAddAttribute} className="flex gap-2">
              <input
                type="text"
                value={newAttribute}
                onChange={(e) => setNewAttribute(e.target.value)}
                placeholder="e.g. Dept:Pediatrics"
                className="flex-1 light-input px-3.5 py-2.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1 shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto pr-1">
              {attributes.map((attr, idx) => (
                <span
                  key={`univ_attr_${attr}_${idx}`}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-teal-50 text-teal-800 border border-teal-200/80 font-semibold hover:bg-teal-100 hover:border-teal-400 transition-colors shadow-2xs"
                >
                  {attr}
                </span>
              ))}
            </div>
          </div>

          {/* Suspicious Activity Log Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>Suspicious Activity Monitor</span>
              </h3>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {suspiciousLogs.length} Alerts
              </span>
            </div>

            <div className="space-y-2 text-xs max-h-56 overflow-y-auto">
              {suspiciousLogs.length === 0 ? (
                <div className="text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">
                  No suspicious activity detected. System is secure.
                </div>
              ) : (
                suspiciousLogs.map((log, idx) => (
                  <div key={log.id || log.logId || `log_${idx}`} className="p-3 rounded-xl bg-rose-50/90 border border-rose-200/90 text-rose-900 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="font-mono text-rose-800">{log.action}</span>
                      <span className="text-[10px] font-sans text-rose-500">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}</span>
                    </div>
                    <div className="text-[11px] text-rose-700 leading-normal">{log.details}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Columns: Register User & Issued Key Directory */}
        <div className="space-y-6 lg:col-span-2">

          {/* User Registration Form */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Register User & Assign Attributes</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">HABKS Key Generation</span>
            </div>

            <form onSubmit={handleRegisterUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">User ID (Unique Identity)</label>
                  <input
                    type="text"
                    value={regUserId}
                    onChange={(e) => setRegUserId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    placeholder="e.g. dr_arun"
                    required
                    className="w-full light-input px-3.5 py-2.5 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Arun Kumar"
                    required
                    className="w-full light-input px-3.5 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full light-input px-3.5 py-2.5 rounded-xl text-xs bg-white text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="RESEARCHER">RESEARCHER</option>
                    <option value="NURSE">NURSE</option>
                    <option value="PATIENT">PATIENT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. arun.kumar@kmch.org"
                    className="w-full light-input px-3.5 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Hospital</label>
                  <input
                    type="text"
                    value={regOrg}
                    onChange={(e) => setRegOrg(e.target.value)}
                    placeholder="e.g. KMCH Hospital"
                    className="w-full light-input px-3.5 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">Assign Cryptographic Attributes for Key</label>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => selectAllCategoryAttrs('Role:')}
                      className="text-sky-600 hover:text-sky-700 font-semibold"
                    >
                      Toggle Roles
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => selectAllCategoryAttrs('Dept:')}
                      className="text-sky-600 hover:text-sky-700 font-semibold"
                    >
                      Toggle Depts
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedAttributes([])}
                      className="text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 rounded-xl bg-slate-50/80 border border-slate-200">
                  {attributes.map((attr, idx) => {
                    const isSelected = selectedAttributes.includes(attr);
                    return (
                      <button
                        type="button"
                        key={`reg_attr_${attr}_${idx}`}
                        onClick={() => toggleAttr(attr)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center space-x-1.5 ${isSelected
                            ? 'bg-emerald-600 text-white border border-emerald-600 font-bold shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'
                          }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{attr}</span>
                      </button>
                    );
                  })}
                </div>
                
                {selectedAttributes.length > 0 && (
                  <div className="mt-2 text-[11px] text-slate-600 flex items-center space-x-1">
                    <span className="font-semibold">Selected Attributes ({selectedAttributes.length}):</span>
                    <span className="font-mono text-emerald-700 font-bold">{selectedAttributes.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center space-x-2 active:scale-95"
                >
                  <Fingerprint className="w-4.5 h-4.5" />
                  <span>Submit Registration & Generate Key</span>
                </button>
              </div>
            </form>
          </div>

          {/* Directory of Registered Users & Account Controls */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Shield className="w-4.5 h-4.5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  User Directory & Cryptographic Account Controls ({filteredUsers.length})
                </h3>
              </div>

              {/* Quick Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Filter users, roles, IDs..."
                  className="w-full light-input pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 bg-slate-50/80">
                    <th className="py-3 px-3">User & Identity</th>
                    <th className="py-3 px-3">Role & Org</th>
                    <th className="py-3 px-3">Attributes</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                        No user accounts match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, idx) => (
                      <tr key={u.userId || u.id || u._id || `usr_row_${idx}`} className="hover:bg-slate-50/80 transition group">
                        
                        <td className="py-3.5 px-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-extrabold text-xs border border-slate-200 shrink-0">
                              {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{u.name}</div>
                              <div className="text-[11px] font-mono text-sky-600 font-bold">{u.userId}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200 block w-max mb-0.5">
                            {u.role}
                          </span>
                          <span className="text-[11px] text-slate-500">{u.organization || 'Health Org'}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {u.attributes && u.attributes.length > 0 ? (
                              u.attributes.map((att, idx) => (
                                <span key={`${u.userId}_${att}_${idx}`} className="px-2 py-0.5 text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 rounded-md font-semibold">
                                  {att}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">None</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          {u.status === 'APPROVED' || u.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>APPROVED</span>
                            </span>
                          ) : u.status === 'PENDING_APPROVAL' || u.status === 'PENDING' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              <span>PENDING</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <span>REVOKED</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {u.status === 'PENDING_APPROVAL' || u.status === 'PENDING' ? (
                              <button
                                onClick={() => handleApprove(u.userId)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition active:scale-95"
                              >
                                Approve
                              </button>
                            ) : u.status === 'APPROVED' || u.status === 'ACTIVE' ? (
                              <button
                                onClick={() => handleRevoke(u.userId)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 transition active:scale-95"
                              >
                                Revoke
                              </button>
                            ) : (
                              <span className="text-rose-500 text-[10px] font-bold px-2 py-1 bg-rose-50 rounded">Revoked</span>
                            )}

                            {u.userId !== 'admin_kgc' && (
                              <button
                                onClick={() => handleDeleteUser(u.userId)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 text-[11px] font-bold rounded-lg border border-slate-200 transition flex items-center space-x-1 ml-1 active:scale-95"
                                title="Delete Account Permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
