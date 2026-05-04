import {
    Building2,
    CalendarCheck,
    ChevronRight,
    FileText,
    LayoutDashboard,
    LogOut,
    Menu,
    UserCheck,
    Users,
    X,
    Home,
    Shield
} from 'lucide-react';
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

const roleColors: Record<string, string> = { admin: '#6c5ce7', hr: '#00b894', manager: '#f59e0b' };

const Sidebar: React.FC<{ mobileMenuOpen: boolean, setMobileMenuOpen: (o: boolean) => void }> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const { t, dir } = useLang();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/', icon: Home, label: t('home') || 'Home' },
    { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/employees', icon: Users, label: t('employees') },
    { to: '/attendance', icon: CalendarCheck, label: t('attendance') },
    { to: '/reports', icon: FileText, label: t('reports') },
    { to: '/departments', icon: Building2, label: t('departments') },
  ];

  if (user?.role === 'admin') {
    navItems = [
      ...navItems,
      { to: '/pending-approvals', icon: UserCheck, label: 'Pending Approvals' },
      { to: '/security-logs', icon: Shield, label: t('securityLogs') }
    ];
  }

  const handleLogout = () => { logout(); navigate('/login'); };

  // Close menu on navigation for mobile
  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {mobileMenuOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMobileMenuOpen(false); }}
          aria-label="Close sidebar"
          style={{ display: window.innerWidth > 768 ? 'none' : 'block', border: 'none', padding: 0 }}
        />
      )}
      <aside className={`sidebar-container ${collapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      {/* Header */}
      <div style={{ padding: collapsed ? '20px 0' : '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '12px', minHeight: '70px' }}>
        {!collapsed && (
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
            <Users size={20} color="var(--brand-text)" />
          </div>
        )}
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, whiteSpace: 'nowrap' }}>EMP Manager</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>v1.0.0</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{ [dir === 'rtl' ? 'marginRight' : 'marginLeft']: collapsed ? '0' : 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}>
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={handleNavClick} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '11px 12px', borderRadius: '8px', marginBottom: '4px',
            textDecoration: 'none', transition: 'all 0.2s',
            color: isActive ? 'var(--brand-text)' : 'var(--text-muted)',
            background: isActive ? 'var(--brand)' : 'transparent',
            fontSize: '14px', fontWeight: 500,
            justifyContent: collapsed ? 'center' : 'flex-start',
          })}>
            {({ isActive }) => (<>
              <Icon size={18} color={isActive ? 'var(--brand-text)' : undefined} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ whiteSpace: 'nowrap', flex: 1 }}>{label}</span>}
              {!collapsed && isActive && <ChevronRight size={14} color="var(--brand-text)" style={{ transform: dir === 'rtl' ? 'rotate(180deg)' : 'none' }} />}
            </>)}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 8px', borderTop: '1px solid var(--border)' }}>
        {!collapsed && user && (
          <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--border)' }}>
            <div className="avatar" style={{ background: roleColors[user.role] || 'var(--brand)', fontSize: '13px', color: 'var(--brand-text)' }}>
              {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', gap: '10px', padding: '10px 12px' }}>
          <LogOut size={16} style={{ transform: dir === 'rtl' ? 'rotate(180deg)' : 'none' }} />
          {!collapsed && t('logout')}
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
