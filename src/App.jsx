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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4 shadow-lg">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-rose-950">Portal Render Error</h2>
          <p className="text-xs text-rose-700 font-mono bg-white p-3 rounded-xl border border-rose-200 overflow-x-auto text-left">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Reload Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  // Load persisted user session (defaults to null if not logged in)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('securephr_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Persist current view: 'LOGIN', 'REGISTER', or 'LOGGED_IN'
  const [authView, setAuthView] = useState(() => {
    try {
      const savedView = localStorage.getItem('securephr_auth_view');
      if (savedView) return savedView;
      const savedUser = localStorage.getItem('securephr_user');
      return savedUser ? 'LOGGED_IN' : 'LOGIN';
    } catch (e) {
      return 'LOGIN';
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const savedTab = localStorage.getItem('securephr_tab');
      if (savedTab) return savedTab;
      const savedUser = localStorage.getItem('securephr_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        switch (u?.role?.toUpperCase()) {
          case 'PATIENT': return 'patient';
          case 'DOCTOR': return 'doctor';
          case 'RESEARCHER': return 'researcher';
          case 'ADMIN':
          case 'ADMIN_KGC': return 'kgc';
        }
      }
      return 'kgc';
    } catch (e) {
      return 'kgc';
    }
  });

  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Sync authView to localStorage
  const handleSetAuthView = (view) => {
    setAuthView(view);
    try {
      localStorage.setItem('securephr_auth_view', view);
    } catch (e) {}
  };

  // Sync activeTab to localStorage
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    try {
      localStorage.setItem('securephr_tab', tabId);
    } catch (e) {}
  };

  // Sync Headers with current Active User context for RBAC safely
  useEffect(() => {
    if (currentUser) {
      setAuthHeaders(currentUser.userId, currentUser.role);
      try {
        localStorage.setItem('securephr_user', JSON.stringify(currentUser));
      } catch (e) {}
    }
  }, [currentUser]);

  // Login Success Handler with Automatic Role-Based Dashboard Navigation
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setAuthHeaders(user.userId, user.role);
    handleSetAuthView('LOGGED_IN');

    try {
      localStorage.setItem('securephr_user', JSON.stringify(user));
    } catch (e) {}

    // Automatic Role-Based Redirection to Specific Dashboard
    let targetTab = 'kgc';
    switch (user?.role?.toUpperCase()) {
      case 'PATIENT':
        targetTab = 'patient';
        break;
      case 'DOCTOR':
        targetTab = 'doctor';
        break;
      case 'RESEARCHER':
        targetTab = 'researcher';
        break;
      case 'ADMIN':
      case 'ADMIN_KGC':
      default:
        targetTab = 'kgc';
        break;
    }
    handleTabChange(targetTab);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('securephr_user');
      localStorage.removeItem('securephr_tab');
      localStorage.setItem('securephr_auth_view', 'LOGIN');
    } catch (e) {}
    setCurrentUser(null);
    setAuthView('LOGIN');
  };

  if (authView === 'LOGIN') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => handleSetAuthView('REGISTER')}
      />
    );
  }

  if (authView === 'REGISTER') {
    return (
      <RegisterPage
        onSwitchToLogin={() => handleSetAuthView('LOGIN')}
      />
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 flex flex-col lg:flex-row selection:bg-emerald-500 selection:text-white">
      
      {/* Left Role-Filtered Sidebar Layout */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAudit={() => setIsAuditOpen(true)}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        
        {/* Top App Bar */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 capitalize">
              {activeTab === 'dashboard' && 'Healthcare Management Dashboard'}
              {activeTab === 'kgc' && 'Key Generation Center (KGC) Admin Authority'}
              {activeTab === 'patient' && 'Patient PHR Encryption & Upload Portal'}
              {activeTab === 'doctor' && 'Doctor Multi-Keyword Search Portal'}
              {activeTab === 'researcher' && 'Researcher Dataset Access Portal'}
              {activeTab === 'collusion' && 'Collusion Resistance Laboratory'}
              {activeTab === 'cloud' && 'Encrypted Cloud Storage Vault'}
              {activeTab === 'benchmarks' && 'Performance & Experimental Analytics'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">HABKS-CR Cryptographic Platform (Role-Isolated Navigation)</p>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 self-end sm:self-auto">
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
        <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <ErrorBoundary>
            {activeTab === 'dashboard' && <DashboardOverview setActiveTab={handleTabChange} />}
            {activeTab === 'kgc' && <KGCAdmin onUserUpdated={() => {}} />}
            {activeTab === 'patient' && <PatientPortal activeUserId={currentUser?.userId} onPHRUploaded={() => {}} />}
            {activeTab === 'doctor' && <DoctorPortal activeUserId={currentUser?.userId} />}
            {activeTab === 'researcher' && <ResearcherPortal activeUserId={currentUser?.userId} />}
            {activeTab === 'collusion' && <CollusionLab />}
            {activeTab === 'cloud' && <CloudVault />}
            {activeTab === 'benchmarks' && <PerformanceDashboard />}
          </ErrorBoundary>
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
