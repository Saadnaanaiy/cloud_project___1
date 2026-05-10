import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface Employee {
  id: number; firstName: string; lastName: string;
  position: string; avatarUrl: string;
  department?: { name: string };
  reportsTo?: number;
}

const avatarColors = ['#6c5ce7', '#10b981', '#e84393', '#3b82f6', '#f59e0b', '#ef4444'];

const OrgChartPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/employees');
        setEmployees(Array.isArray(data) ? data : []);
      } catch { toast.error('Failed to load employees'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const toggle = (id: number) => {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCollapsed(next);
  };

  const getReports = (managerId: number | undefined) =>
    employees.filter(e => e.reportsTo === managerId);

  const renderNode = (emp: Employee, depth: number = 0) => {
    const reports = getReports(emp.id);
    const isCollapsed = collapsed.has(emp.id);
    const color = avatarColors[emp.id % avatarColors.length];

    return (
      <div key={emp.id}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', marginLeft: depth * 28 }}>
          {reports.length > 0 ? (
            <button onClick={() => toggle(emp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-muted)' }}>
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : <span style={{ width: '18px' }} />}
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            {emp.firstName[0]}{emp.lastName[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{emp.firstName} {emp.lastName}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
              <span>{emp.position || 'No position'}</span>
              {emp.department && <span style={{ color: 'var(--brand)' }}>{emp.department.name}</span>}
            </div>
          </div>
        </div>
        {!isCollapsed && reports.map(r => renderNode(r, depth + 1))}
      </div>
    );
  };

  const topLevel = employees.filter(e => !e.reportsTo);

  if (loading) return <div className="page-container"><div style={{ padding: '80px', textAlign: 'center' }}><div className="spinner" /></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Organization Chart</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{employees.length} employees</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        {topLevel.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>No employees found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {topLevel.map(emp => renderNode(emp))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgChartPage;
