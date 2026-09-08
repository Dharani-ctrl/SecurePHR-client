import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  UserCheck, 
  Clock, 
  ChevronRight, 
  Lock, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  Plus, 
  Database,
  Layers,
  ArrowRight,
  Key
} from 'lucide-react';
import { getUsers, getCloudPHRList } from '../services/api';

export default function DashboardOverview({ setActiveTab }) {
  const [users, setUsers] = useState([]);
  const [phrs, setPhrs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    async function loadData() {
      try {
        const [resUsers, resPhrs] = await Promise.all([getUsers(), getCloudPHRList()]);
        if (resUsers.data.success) setUsers(resUsers.data.users);
        if (resPhrs.data.success) setPhrs(resPhrs.data.records);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const doctorsCount = users.filter(u => u.role === 'DOCTOR').length;
  const patientsCount = users.filter(u => u.role === 'PATIENT').length;
  const researchersCount = users.filter(u => u.role === 'RESEARCHER').length;
  const pendingCount = users.filter(u => u.status === 'PENDING_APPROVAL').length;

  const filteredUsers = users.filter(u => {
    if (activeFilter === 'Pending' && u.status !== 'PENDING_APPROVAL') return false;
    if (activeFilter === 'Approved' && u.status !== 'APPROVED') return false;

    if (roleFilter === 'Doctor' && u.role !== 'DOCTOR') return false;
    if (roleFilter === 'Researcher' && u.role !== 'RESEARCHER') return false;
    if (roleFilter === 'Patient' && u.role !== 'PATIENT') return false;

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Metrics Cards Row (Matching NatureCure HMS Reference UI) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xl text-slate-900">{doctorsCount}</div>
          <div className="text-[11px] font-medium text-slate-500">Doctors</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-1">
            <Users className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xl text-slate-900">{patientsCount}</div>
          <div className="text-[11px] font-medium text-slate-500">Patients</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xl text-slate-900">{researchersCount}</div>
          <div className="text-[11px] font-medium text-slate-500">Researchers</div>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xl text-blue-900">{pendingCount}</div>
          <div className="text-[11px] font-semibold text-blue-700">Pending Approval</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xl text-slate-900">{phrs.length}</div>
          <div className="text-[11px] font-medium text-slate-500">Encrypted PHRs</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
            <Database className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xl text-slate-900">100%</div>
          <div className="text-[11px] font-medium text-slate-500">Collusion Safe</div>
        </div>

      </div>

      {/* HABKS-CR System Architecture & Interactive Workflow Diagram (Fig. 2 from Research Paper) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Fig. 2: System Architecture & Data Flow</span>
            </div>
            <h2 className="font-extrabold text-lg text-slate-900">Cryptographic System Architecture Workflow</h2>
            <p className="text-xs text-slate-500">
              End-to-end mathematical data processing pipeline: Data Owner Upload → Cloud Vault Search → Data User Decryption & KGC Key Distribution
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center space-x-1.5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Collusion-Resistant (HABKS-CR)</span>
          </span>
        </div>

        {/* 4 Entities Flow Grid (Matching Fig. 2 Architecture Diagram) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          
          {/* Box 1: Data Owner (Patient) */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3 relative group hover:border-emerald-400 transition">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Data Owner (Patient)
              </span>
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="text-xs space-y-2">
              <div className="font-bold text-slate-900">Data Process & Upload:</div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>PHR Data Payload</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>Access Control Policy (T)</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>Multi-Keywords (W)</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>AES-256 Symmetric Key</span>
                </div>
              </div>

              <div className="pt-1">
                <div className="text-[11px] font-semibold text-slate-600 mb-1">Generated Output Packages:</div>
                <div className="space-y-1">
                  <span className="block px-2 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-mono text-[10px]">
                    1. PHR Data Ciphertext (CT_phr)
                  </span>
                  <span className="block px-2 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-mono text-[10px]">
                    2. Encrypted Key Ciphertext (C0, C1)
                  </span>
                  <span className="block px-2 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-mono text-[10px]">
                    3. Search Index (I_W)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('patient')}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
            >
              <span>Go to Upload Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Box 2: Cloud Server (Honest-but-Curious) */}
          <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200 space-y-3 relative group hover:border-sky-400 transition">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                Cloud Server (Storage & Search)
              </span>
              <Database className="w-4 h-4 text-sky-600" />
            </div>

            <div className="text-xs space-y-2">
              <div className="font-bold text-slate-900">Encrypted Cloud Vault Processing:</div>
              <div className="bg-white p-2.5 rounded-lg border border-sky-100 space-y-2 text-[11px]">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Stored Encrypted PHRs:</span>
                  <span className="font-extrabold text-sky-700">{phrs.length} Records</span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Trapdoor Match Engine:</span>
                  <span className="font-mono text-emerald-600 font-bold">Active (T_W · I_W)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Privacy Guarantee:</span>
                  <span className="font-bold text-slate-700">Zero Plaintext Leakage</span>
                </div>
              </div>

              <div className="p-2 bg-sky-100/50 rounded-lg text-[11px] text-sky-900">
                <span className="font-bold">Search Workflow:</span> Receives Trapdoor (T_W) from Data User → Computes pairing match without discovering plaintext keywords → Returns matching encrypted PHR result.
              </div>
            </div>

            <button
              onClick={() => setActiveTab('cloud')}
              className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
            >
              <span>View Cloud Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Box 3: Data User (Doctor / Researcher) */}
          <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 space-y-3 relative group hover:border-purple-400 transition">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                Data User (Doctor / Researcher)
              </span>
              <Stethoscope className="w-4 h-4 text-purple-600" />
            </div>

            <div className="text-xs space-y-2">
              <div className="font-bold text-slate-900">Trapdoor Search & Decryption:</div>
              <div className="bg-white p-2.5 rounded-lg border border-purple-100 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <span className="text-purple-600 font-bold">1.</span>
                  <span>Input Search Keywords (W')</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <span className="text-purple-600 font-bold">2.</span>
                  <span>Apply Identity Key (SK_ID)</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <span className="text-purple-600 font-bold">3.</span>
                  <span>Generate Trapdoor (T_W)</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <span className="text-purple-600 font-bold">4.</span>
                  <span>Policy Tree Decryption</span>
                </div>
              </div>

              <div className="p-2 bg-purple-100/50 rounded-lg text-[11px] text-purple-900">
                <span className="font-bold">Access Verification:</span> Evaluates policy threshold (k-of-n) against assigned identity attributes S_ID.
              </div>
            </div>

            <button
              onClick={() => setActiveTab('doctor')}
              className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
            >
              <span>Go to Search Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Bottom KGC Key Distribution Bar (Matching Fig. 2 Center KGC Entity) */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 p-4 rounded-xl border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-amber-950 text-sm flex items-center space-x-2">
                <span>Key Generation Center (KGC Authority)</span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-200 text-amber-900 font-bold rounded">
                  Identity-Bound Key Distribution (r_ID = H(ID))
                </span>
              </div>
              <div className="text-slate-600 text-xs mt-0.5">
                Issues Master Parameters (PK, MSK) and generates collusion-resistant private keys (SK_ID) for Data Owners & Data Users.
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('kgc')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center space-x-1.5 shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>KGC Admin Panel</span>
          </button>
        </div>

      </div>

      {/* Quick Action Navigation Grid (Matching NatureCure HMS Reference UI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div 
          onClick={() => setActiveTab('patient')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-2xs transition flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition">Upload Encrypted PHR</div>
              <div className="text-xs text-slate-500">Specify categories, keywords, and access tree policies</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
        </div>

        <div 
          onClick={() => setActiveTab('doctor')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-2xs transition flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition">Multi-Keyword Search</div>
              <div className="text-xs text-slate-500">Generate encrypted trapdoors and query cloud PHRs</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
        </div>

        <div 
          onClick={() => setActiveTab('collusion')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-2xs transition flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition">Collusion Attack Sandbox</div>
              <div className="text-xs text-slate-500">Test key component fusion resistance with identity factors</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
        </div>

        <div 
          onClick={() => setActiveTab('kgc')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-2xs transition flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition">User Management & Approvals</div>
              <div className="text-xs text-slate-500">Approve pending doctors, manage attributes, issue SK_ID</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
        </div>

      </div>

      {/* User Directory Section (Matching NatureCure HMS Reference UI) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-lg text-slate-900">User Management</h2>
            <p className="text-xs text-slate-500">Manage all users, approve signups, assign attributes & identity keys</p>
          </div>

          <button
            onClick={() => setActiveTab('kgc')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Staff / User</span>
          </button>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap gap-2 items-center pt-1">
          <div className="flex bg-slate-200/60 p-1 rounded-full text-xs font-bold">
            {['All', 'Pending', 'Approved'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3.5 py-1 rounded-full transition ${
                  activeFilter === f ? 'bg-emerald-500 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f} {f === 'Pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-200/60 p-1 rounded-full text-xs font-bold">
            {['All', 'Doctor', 'Researcher', 'Patient'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3.5 py-1 rounded-full transition ${
                  roleFilter === r ? 'bg-sky-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* User Card Rows (Matching NatureCure HMS Reference UI) */}
        <div className="space-y-3">
          {filteredUsers.map(u => (
            <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition">
              
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      {u.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {u.email} • {u.organization || 'Health Org'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-auto">
                {u.status === 'APPROVED' ? (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Active
                  </span>
                ) : u.status === 'PENDING_APPROVAL' ? (
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    Pending
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                    Revoked
                  </span>
                )}

                <button
                  onClick={() => setActiveTab('kgc')}
                  className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 border border-slate-200 hover:bg-slate-100 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
