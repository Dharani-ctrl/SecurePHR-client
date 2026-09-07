import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardOverview from './pages/DashboardOverview';
import KGCAdmin from './pages/KGCAdmin';
import PatientPortal from './pages/PatientPortal';
import DoctorPortal from './pages/DoctorPortal';
import ResearcherPortal from './pages/ResearcherPortal';
import CollusionLab from './pages/CollusionLab';
import PerformanceDashboard from './pages/PerformanceDashboard';
import CloudVault from './pages/CloudVault';
import AuditModal from './components/AuditModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { setAuthHeaders } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState({
    userId: 'admin_kgc',
    name: 'Admin (KGC Authority)',
    email: 'admin@kgc.cloud',
    role: 'ADMIN',
    status: 'ACTIVE'
  });

  const [authView, setAuthView] = useState('LOGGED_IN'); // 'LOGIN', 'REGISTER', 'LOGGED_IN'
  const [activeTab, setActiveTab] = useState('kgc');
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Sync Headers with current Active User context for RBAC safely
  useEffect(() => {
    if (currentUser) {
      setAuthHeaders(currentUser.userId, currentUser.role);
    }
  }, [currentUser]);

  // Login Success Handler with Automatic Role-Based Dashboard Navigation
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setAuthHeaders(user.userId, user.role);
    setAuthView('LOGGED_IN');

    // Automatic Role-Based Redirection to Specific Dashboard
    switch (user?.role?.toUpperCase()) {
      case 'PATIENT':
        setActiveTab('patient');
        break;
      case 'DOCTOR':
        setActiveTab('doctor');
        break;
      case 'RESEARCHER':
        setActiveTab('researcher');
        break;
      case 'ADMIN':
      case 'ADMIN_KGC':
      default:
        setActiveTab('kgc');
        break;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthView('LOGIN');
  };

  if (authView === 'LOGIN') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthView('REGISTER')}
      />
    );
  }

  if (authView === 'REGISTER') {
    return (
      <RegisterPage
        onSwitchToLogin={() => setAuthView('LOGIN')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex selection:bg-emerald-500 selection:text-white">
      
      {/* Left Role-Filtered Sidebar Layout */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAudit={() => setIsAuditOpen(true)}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top App Bar */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h2 className="font-extrabold text-lg text-slate-900 capitalize">
              {activeTab === 'dashboard' && 'Healthcare Management Dashboard'}
              {activeTab === 'kgc' && 'Key Generation Center (KGC) Admin Authority'}
              {activeTab === 'patient' && 'Patient PHR Encryption & Upload Portal'}
              {activeTab === 'doctor' && 'Doctor Multi-Keyword Search Portal'}
              {activeTab === 'researcher' && 'Researcher Dataset Access Portal'}
              {activeTab === 'collusion' && 'Collusion Resistance Laboratory'}
              {activeTab === 'cloud' && 'Encrypted Cloud Storage Vault'}
              {activeTab === 'benchmarks' && 'Performance & Experimental Analytics'}
            </h2>
            <p className="text-sm text-slate-500 font-medium">HABKS-CR Cryptographic Platform (Role-Isolated Navigation)</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
            >
              Sign Out
            </button>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{currentUser?.role} Mode Active</span>
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && <DashboardOverview setActiveTab={setActiveTab} />}
          {activeTab === 'kgc' && <KGCAdmin onUserUpdated={() => {}} />}
          {activeTab === 'patient' && <PatientPortal activeUserId={currentUser?.userId} onPHRUploaded={() => {}} />}
          {activeTab === 'doctor' && <DoctorPortal activeUserId={currentUser?.userId} />}
          {activeTab === 'researcher' && <ResearcherPortal activeUserId={currentUser?.userId} />}
          {activeTab === 'collusion' && <CollusionLab />}
          {activeTab === 'cloud' && <CloudVault />}
          {activeTab === 'benchmarks' && <PerformanceDashboard />}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 font-medium mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              HABKS-CR Healthcare Cloud Platform — Role-Isolated Dashboards
            </div>
            <div className="font-mono text-[11px] text-emerald-700 font-bold">
              Identity-Bound KeyGen Active
            </div>
          </div>
        </footer>

      </div>

      {/* Audit Log Modal */}
      <AuditModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />

    </div>
  );
}
