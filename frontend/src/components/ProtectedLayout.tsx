import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { ChatProvider } from '../context/ChatContext';
import ChatDrawer from '../components/chat/ChatDrawer';
import { Info, X, Megaphone } from 'lucide-react';
import api from '../api/axios';

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  author?: { firstName: string; lastName: string };
  createdAt: string;
}

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const { t } = useLang();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [latestAnnouncement, setLatestAnnouncement] = React.useState<Announcement | null>(null);
  const [showAlert, setShowAlert] = React.useState(true);

  React.useEffect(() => {
    api.get('/announcements')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setLatestAnnouncement(res.data[0]);
        }
      })
      .catch(() => {});
  }, []);

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

          {/* Announcements Banner — macOS/iOS style */}
          {showAlert && latestAnnouncement && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '16px 20px',
              margin: '0 20px 20px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: latestAnnouncement.priority === 'high' ? '#ff3b30' : '#007aff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {latestAnnouncement.priority === 'high' ? <Megaphone size={20} color="white" /> : <Info size={20} color="white" />}
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#1d1d1f', fontSize: '14px' }}>{latestAnnouncement.title}</strong>
                <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: '#6e6e73', lineHeight: 1.4 }}>
                  {latestAnnouncement.content}
                </p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                style={{
                  background: '#f5f5f7',
                  border: 'none',
                  color: '#86868b',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#e8e8ed')}
                onMouseOut={e => (e.currentTarget.style.background = '#f5f5f7')}
              >
                <X size={16} />
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
