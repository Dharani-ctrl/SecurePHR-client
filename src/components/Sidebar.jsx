import React from 'react';
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
  LogOut 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onLogout, onOpenAudit }) {
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

  // Default fallback for ADMIN or ADMIN_KGC
  const menuItems = roleMenus[role] || roleMenus.ADMIN;

  const roleLabels = {
    PATIENT: 'Patient (Data Owner)',
    DOCTOR: 'Doctor (Data User)',
    RESEARCHER: 'Researcher (Data User)',
    ADMIN: 'Admin (KGC Authority)',
    ADMIN_KGC: 'Admin (KGC Authority)'
  };

  const initial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between min-h-screen sticky top-0 shrink-0 select-none">
      
      {/* Top Branding Header */}
      <div>
        <div className="p-5 flex items-center space-x-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-slate-900 tracking-tight leading-tight">
              SecurePHR <span className="text-emerald-600">Cloud</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Healthcare Cloud System</p>
          </div>
        </div>

        {/* Current Active Role Badge */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-sm">
          <span className="text-slate-500 font-medium">Role:</span>
          <span className="font-bold text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full text-xs">
            {roleLabels[role] || role}
          </span>
        </div>

        {/* Role-Filtered Navigation Menu */}
        <nav className="p-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Info & Sign Out */}
      <div className="p-3 border-t border-slate-100 space-y-3 bg-slate-50/50">
        
        {/* Audit Log (Admin Only) */}
        {(role === 'ADMIN' || role === 'ADMIN_KGC') && (
          <button
            onClick={onOpenAudit}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-2xs"
          >
            <span className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Crypto Audit Log</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>
        )}

        {/* Logged In User Profile Card */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
              {initial}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs text-slate-900 truncate">{currentUser?.name || 'User'}</div>
              <div className="text-[11px] text-slate-500 truncate">{currentUser?.email || ''}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg text-xs font-bold transition border border-slate-200 flex items-center justify-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

    </aside>
  );
}
