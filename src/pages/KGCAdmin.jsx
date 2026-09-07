import React, { useState, useEffect } from 'react';
import { Key, Shield, Plus, UserPlus, CheckCircle, RefreshCw, Cpu, Layers, Fingerprint, UserCheck, UserX, AlertOctagon, Activity, Trash2 } from 'lucide-react';
import { getSystemParameters, addAttribute, registerUserKeyGen, getUsers, approveUser, revokeUser, deleteUser, clearDatabase, getAuditLogs } from '../services/api';

export default function KGCAdmin({ onUserUpdated }) {
  const [params, setParams] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAttribute, setNewAttribute] = useState('');

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

  const pendingUsers = users.filter(u => u.status === 'PENDING_APPROVAL' || u.status === 'PENDING');
  const approvedUsers = users.filter(u => u.status === 'APPROVED' || u.status === 'ACTIVE');
  const suspiciousLogs = auditLogs.filter(l => l.action === 'DECRYPTION_FAILED' || l.action === 'USER_REVOKED' || l.action === 'COLLUSION_SIMULATED');

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-sky-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              <span>Admin / Key Generation Center (KGC) Control Authority</span>
            </div>
            <h1 className="text-2xl font-bold text-white">System Security Administration & User Verification</h1>
            <p className="text-sm text-slate-200 max-w-3xl mt-1">
              As the trusted security authority, KGC verifies doctors & researchers, assigns attributes, generates identity-bound cryptographic credentials (<code className="text-sky-300 bg-slate-950/60 px-1.5 py-0.5 rounded font-mono">r_ID = H(ID)</code>), revokes unauthorized users, and monitors audit logs.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearDatabase}
              className="flex items-center space-x-1.5 px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold backdrop-blur border border-rose-400/30 transition shadow-xs"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Reset Database</span>
            </button>
            <button
              onClick={fetchKGCData}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur border border-white/20 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh KGC</span>
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-xs font-medium border ${notification.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
          {notification.msg}
        </div>
      )}

      {/* System Metrics Overview Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
          <span className="text-slate-500 font-medium block mb-1">Total System Users</span>
          <span className="font-extrabold text-slate-900 text-lg">{users.length} Registered</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
          <span className="text-slate-500 font-medium block mb-1">Pending Approvals</span>
          <span className={`font-extrabold text-lg ${pendingUsers.length > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
            {pendingUsers.length} Pending
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
          <span className="text-slate-500 font-medium block mb-1">Attribute Universe</span>
          <span className="font-extrabold text-sky-700 text-lg">{attributes.length} Attributes</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
          <span className="text-slate-500 font-medium block mb-1">Suspicious Events</span>
          <span className="font-extrabold text-rose-600 text-lg">{suspiciousLogs.length} Logged</span>
        </div>
      </div>

      {/* Pending User Approvals Queue Section */}
      {pendingUsers.length > 0 && (
        <div className="bg-amber-50/80 p-5 rounded-xl border border-amber-200 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-amber-900 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Pending Doctor / Researcher Verification Queue ({pendingUsers.length})</span>
          </h3>

          <div className="divide-y divide-amber-200/60 text-xs">
            {pendingUsers.map(u => (
              <div key={u.userId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{u.name} (<span className="font-mono text-amber-800">{u.userId}</span>)</div>
                  <div className="text-slate-600">
                    Role: <span className="font-semibold text-slate-800">{u.role}</span> | Org: <span className="font-semibold text-slate-800">{u.organization}</span> | Email: {u.email}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApprove(u.userId)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition flex items-center space-x-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Approve & Issue SK_ID</span>
                  </button>
                  <button
                    onClick={() => handleRevoke(u.userId)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-sm transition flex items-center space-x-1"
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

        {/* Left Column: Public Parameters & Attribute Universe */}
        <div className="space-y-6 lg:col-span-1">

          {/* Public Parameters Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4 pb-2 border-b border-slate-100">
              <Cpu className="w-4 h-4 text-sky-600" />
              <span>Public Parameters (PK)</span>
            </h3>
            {params ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Generator g:</span>
                  <span className="font-mono text-sky-700 font-semibold">{params.generator}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Pairing Group GT:</span>
                  <span className="font-mono text-sky-700 font-semibold">{params.pairGenerator}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Master e(g,g)^α Public:</span>
                  <span className="font-mono text-slate-700">{params.alphaPublic.substring(0, 12)}...</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Master g^β Public:</span>
                  <span className="font-mono text-slate-700">{params.betaPublic.substring(0, 12)}...</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Attribute Universe Size:</span>
                  <span className="font-bold text-emerald-600">{params.universeSize} Attributes</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Loading parameters...</div>
            )}
          </div>

          {/* Attribute Universe Management Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Global Attribute Universe (U)</span>
            </h3>

            <form onSubmit={handleAddAttribute} className="flex gap-2">
              <input
                type="text"
                value={newAttribute}
                onChange={(e) => setNewAttribute(e.target.value)}
                placeholder="e.g. Dept:Pediatrics"
                className="flex-1 light-input px-3 py-2 rounded-lg text-xs"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
              {attributes.map((attr) => (
                <span
                  key={attr}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                >
                  {attr}
                </span>
              ))}
            </div>
          </div>

          {/* Suspicious Activity Log Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Suspicious Activity Monitor</span>
            </h3>

            <div className="space-y-2 text-xs max-h-52 overflow-y-auto">
              {suspiciousLogs.length === 0 ? (
                <div className="text-slate-400 text-center py-4">No suspicious activity detected.</div>
              ) : (
                suspiciousLogs.map(log => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 font-mono">
                    <div className="font-bold">{log.action}</div>
                    <div className="text-[11px] text-rose-700">{log.details}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Columns: Register User & Issued Key Directory */}
        <div className="space-y-6 lg:col-span-2">

          {/* User Registration Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <span>Register User & Assign Attributes</span>
            </h3>

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
                    className="w-full light-input px-3 py-2 rounded-lg text-xs font-mono"
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
                    className="w-full light-input px-3 py-2 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full light-input px-3 py-2 rounded-lg text-xs bg-white"
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
                    className="w-full light-input px-3 py-2 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Hospital</label>
                  <input
                    type="text"
                    value={regOrg}
                    onChange={(e) => setRegOrg(e.target.value)}
                    placeholder="e.g. KMCH Hospital"
                    className="w-full light-input px-3 py-2 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Assign Cryptographic Attributes for Key</label>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  {attributes.map((attr) => {
                    const isSelected = selectedAttributes.includes(attr);
                    return (
                      <button
                        type="button"
                        key={attr}
                        onClick={() => toggleAttr(attr)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition ${isSelected
                            ? 'bg-sky-600 text-white border border-sky-600 font-semibold shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        {attr}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center space-x-2"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Submit Registration</span>
                </button>
              </div>
            </form>
          </div>

          {/* Directory of Registered Users & Account Controls */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-sky-600" />
                <span>User Directory & Cryptographic Account Controls ({users.length})</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">Revocation & Key Management Active</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3">User & Identity</th>
                    <th className="py-2.5 px-3">Role & Org</th>
                    <th className="py-2.5 px-3">Attributes</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] font-mono text-sky-600 font-medium">{u.userId}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200 block w-max">
                          {u.role}
                        </span>
                        <span className="text-[11px] text-slate-500">{u.organization || 'Health Org'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.attributes.map((att) => (
                            <span key={att} className="px-1.5 py-0.5 text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 rounded font-medium">
                              {att}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {u.status === 'APPROVED' ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full">
                            APPROVED
                          </span>
                        ) : u.status === 'PENDING_APPROVAL' ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 rounded-full">
                            PENDING
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 rounded-full">
                            REVOKED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {u.status === 'PENDING_APPROVAL' || u.status === 'PENDING' ? (
                            <button
                              onClick={() => handleApprove(u.userId)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded shadow-xs"
                            >
                              Approve
                            </button>
                          ) : u.status === 'APPROVED' || u.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleRevoke(u.userId)}
                              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-bold rounded border border-rose-300"
                            >
                              Revoke
                            </button>
                          ) : (
                            <span className="text-rose-500 text-[10px] font-bold">Revoked</span>
                          )}

                          {u.userId !== 'admin_kgc' && (
                            <button
                              onClick={() => handleDeleteUser(u.userId)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-[10px] font-bold rounded border border-rose-200 transition flex items-center space-x-1 ml-1"
                              title="Delete Account Permanently"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
