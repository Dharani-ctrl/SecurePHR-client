import React from 'react';
import { ShieldCheck, Lock, Search, Key, Activity, Database, Cpu, AlertTriangle, UserCheck, Stethoscope, Microscope } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, activeUser, setActiveUser, onOpenAudit }) {
  const tabs = [
    { id: 'kgc', label: 'Admin / KGC Authority', icon: Key, roleRequired: 'ADMIN' },
    { id: 'patient', label: 'Patient Portal', icon: Lock, roleRequired: 'PATIENT' },
    { id: 'doctor', label: 'Doctor Portal', icon: Stethoscope, roleRequired: 'DOCTOR' },
    { id: 'researcher', label: 'Researcher Portal', icon: Microscope, roleRequired: 'RESEARCHER' },
    { id: 'collusion', label: 'Collusion Lab', icon: AlertTriangle, roleRequired: 'ALL' },
    { id: 'cloud', label: 'Cloud Vault', icon: Database, roleRequired: 'ALL' },
    { id: 'benchmarks', label: 'Benchmarks', icon: Cpu, roleRequired: 'ALL' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('kgc')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center shadow-md shadow-sky-600/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  HABKS-CR <span className="text-sky-600">Cloud PHR</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 rounded-full">
                  HABAC + Crypto Search
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Collusion-Resistant Healthcare Cloud Research Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Active Role Selector & Audit Action */}
          <div className="flex items-center space-x-3">
            
            {/* Quick Role Switcher */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 pl-1.5 text-[10px] font-bold uppercase hidden sm:inline">Role:</span>
              <select
                value={activeUser}
                onChange={(e) => {
                  const u = e.target.value;
                  setActiveUser(u);
                  if (u === 'admin_kgc') setActiveTab('kgc');
                  else if (u === 'patient_john') setActiveTab('patient');
                  else if (u === 'dr_bob') setActiveTab('doctor');
                  else if (u === 'researcher_david') setActiveTab('researcher');
                }}
                className="bg-white text-slate-900 font-bold px-2 py-1 rounded-lg text-xs border border-slate-200 focus:outline-none"
              >
                <option value="admin_kgc">👑 Admin / KGC Authority</option>
                <option value="patient_john">👤 Patient (John Doe)</option>
                <option value="dr_bob">🩺 Doctor (Dr. Bob Martinez)</option>
                <option value="researcher_david">🔬 Researcher (Dr. David Kim)</option>
              </select>
            </div>

            <button
              onClick={onOpenAudit}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Audit Log</span>
            </button>

          </div>

        </div>

        {/* Mobile Subnav */}
        <div className="flex xl:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-200 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center whitespace-nowrap space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
