import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { ChatProvider } from '../context/ChatContext';
import ChatDrawer from '../components/chat/ChatDrawer';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const { t } = useLang();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);

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
