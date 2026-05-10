import { CalendarDays, PieChart, TrendingDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface Balance {
  annual: { used: number; total: number };
  sick: { used: number; total: number };
  personal: { used: number; total: number };
}

const leaveMeta: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  annual: { icon: <CalendarDays size={22} />, color: '#6c5ce7', label: 'Annual Leave' },
  sick: { icon: <TrendingDown size={22} />, color: '#e84393', label: 'Sick Leave' },
  personal: { icon: <PieChart size={22} />, color: '#f59e0b', label: 'Personal Leave' },
};

const LeaveBalancePage: React.FC = () => {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const { data } = await api.get(`/leaves/balance/${user.id}`);
        setBalance(data);
      } catch { toast.error('Failed to load balance'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="page-container"><div style={{ padding: '80px', textAlign: 'center' }}><div className="spinner" /></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Balance</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Your remaining leave entitlements</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {balance && Object.entries(balance).map(([key, val]) => {
          const meta = leaveMeta[key];
          const pct = val.total > 0 ? Math.round((val.used / val.total) * 100) : 0;
          return (
            <div key={key} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color }}>
                  {meta.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{meta.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{val.total - val.used} days remaining</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '16px' }}>
                <span style={{ fontSize: '32px', fontWeight: 700 }}>{val.total - val.used}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/ {val.total} days</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'var(--bg-main)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '4px', background: meta.color, width: `${pct}%`, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>{val.used} used</span>
                <span>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaveBalancePage;
