import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Key, 
  Lock, 
  Stethoscope, 
  Microscope, 
  AlertTriangle, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Activity, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onLogout, onOpenAudit }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = currentUser?.role?.toUpperCase() || 'ADMIN';

  // Role-Isolated Navigation Menus
  const roleMenus = {
    PATIENT: [
      { id: 'patient', label: 'My PHRs & Upload', icon: Lock },
      { id: 'cloud', label: 'Cloud Vault', icon: Database },
    ],
    DOCTOR: [
      { id: 'doctor', label: 'Multi-Keyword Search', icon: Stethoscope },
      { id: 'cloud', label: 'Cloud Vault', icon: Database },
    ],
    RESEARCHER: [
      { id: 'researcher', label: 'Research Datasets', icon: Microscope },
      { id: 'cloud', label: 'Cloud Vault', icon: Database },
    ],
    ADMIN: [
      { id: 'dashboard', label: 'Admin Overview', icon: LayoutDashboard },
      { id: 'kgc', label: 'KGC Admin Authority', icon: Key },
      { id: 'collusion', label: 'Collusion Lab', icon: AlertTriangle },
      { id: 'cloud', label: 'Cloud Vault', icon: Database },
      { id: 'benchmarks', label: 'Benchmarks', icon: Cpu },
    ],
  };

  const menuItems = roleMenus[role] || roleMenus.ADMIN;

  const roleLabels = {
    PATIENT: 'Patient (Data Owner)',
    DOCTOR: 'Doctor (Data User)',
    RESEARCHER: 'Researcher (Data User)',
    ADMIN: 'Admin (KGC Authority)',
    ADMIN_KGC: 'Admin (KGC Authority)'
  };

  const initial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A';

  const handleSelectTab = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <div className="lg:hidden w-full bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-slate-900 tracking-tight leading-tight">
              SecurePHR <span className="text-emerald-600">Cloud</span>
            </h1>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container: NatureCure HMS Reference Design (3rd Image) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-72 lg:w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 select-none transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Scrollable Top Section */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Top Branding Section (Matching NatureCure HMS Circular Logo & Typography) */}
          <div className="p-6 text-center border-b border-slate-100 relative">
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 font-extrabold mx-auto mb-2.5 shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h1 className="font-black text-lg text-slate-900 tracking-tight leading-tight">
              SecurePHR <span className="text-emerald-600">Cloud</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-semibold tracking-wide mt-0.5">
              Healthcare Cloud System
            </p>
          </div>

          {/* Current Role Badge */}
          <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">Role:</span>
            <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full text-[11px]">
              {roleLabels[role] || role}
            </span>
          </div>

          {/* Role-Filtered Navigation Menu List */}
          <nav className="p-3.5 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white stroke-[2.5]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Theme Mode Switcher + Audit Log + Profile + Red Logout (Exact 3rd Image match) */}
        <div className="p-4 border-t border-slate-100 space-y-4 bg-slate-50/40">

          {/* Audit Log Button (Admin Only) */}
          {(role === 'ADMIN' || role === 'ADMIN_KGC') && (
            <button
              onClick={() => { onOpenAudit(); setMobileOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
            >
              <span className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Crypto Audit Log</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          )}



          {/* User Profile Info & Red Logout Action (Matching NatureCure 3rd Image format) */}
          <div className="pt-2 border-t border-slate-200/60 space-y-2.5">
            <div className="flex items-center space-x-3 px-1">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                {initial}
              </div>
              <div className="overflow-hidden">
                <div className="font-extrabold text-xs text-slate-900 truncate">
                  {currentUser?.name || 'Admin'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate">
                  {currentUser?.role || 'Admin'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-extrabold transition border border-transparent hover:border-rose-200 active:scale-95"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Logout</span>
            </button>
          </div>

        </div>

      </aside>
    </>
  );
}
