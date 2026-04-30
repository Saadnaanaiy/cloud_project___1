import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { ChatProvider } from '../context/ChatContext';
import ChatDrawer from '../components/chat/ChatDrawer';
import { AlertCircle, X } from 'lucide-react';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const { t } = useLang();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(true);

  const pageTitles: Record<string, string> = {
    '/': t('dashboard'),
    '/employees': t('employees'),
    '/attendance': t('attendance'),
    '/reports': t('reports'),
    '/departments': t('departments'),
    '/profile': 'My Profile',
  };

  const title = pageTitles[location.pathname] || 'Employee Manager';

  if (isInitializing) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
      <div className="spinner" />
      <span style={{ color: 'var(--text-muted)' }}>Loading...</span>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <ChatProvider>
      <div className="page-layout">
        <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="main-content">
          <Topbar title={title} setMobileMenuOpen={setMobileMenuOpen} setChatOpen={setChatOpen} />
          
          {/* System Maintenance Alert */}
          {showAlert && (
            <div style={{
              background: 'linear-gradient(135deg, #ff9500 0%, #ff7b00 100%)',
              color: 'white',
              padding: '16px 24px',
              marginBottom: '20px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'var(--shadow-md)',
              margin: '0 20px 20px 20px',
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <strong>System Maintenance Tomorrow</strong>
                <p style={{ fontSize: '13px', margin: '4px 0 0 0', opacity: 0.95 }}>
                  We will be performing system diagnostics tomorrow. If you experience any issues, our team will work on fixing them immediately.
                </p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                <X size={18} />
              </button>
            </div>
          )}
          
          <div className="page-inner animate-fade">
            <Outlet />
          </div>
        </div>
      </div>
      <ChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </ChatProvider>
  );
};

export default ProtectedLayout;
