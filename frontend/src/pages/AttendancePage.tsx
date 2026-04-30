import React, { useEffect, useState } from 'react';
import { CalendarCheck, Save, Check, X, Clock, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useLang } from '../context/LanguageContext';

interface Employee { id: number; firstName: string; lastName: string; position: string; department?: { name: string }; status: string; }

const avatarColors = ['#6c5ce7','#00b894','#e84393','#3b82f6','#f59e0b','#ef4444'];

const statusOptions = [
  { value: 'present', label: 'Present', color: 'var(--teal)' },
  { value: 'absent', label: 'Absent', color: 'var(--red)' },
  { value: 'late', label: 'Late', color: 'var(--amber)' },
  { value: 'on_leave', label: 'On Leave', color: 'var(--blue)' },
];

const AttendancePage: React.FC = () => {
  const { t } = useLang();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/employees', { params: { status: 'active' } }),
      api.get('/attendance', { params: { date } }),
    ]).then(([empRes, attRes]) => {
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      const existing: Record<number, string> = {};
      if (Array.isArray(attRes.data)) {
        attRes.data.forEach((a: any) => { existing[a.employeeId] = a.status; });
      }
      setRecords(existing);
    }).catch(() => toast.error('Failed to load attendance data'))
      .finally(() => setLoading(false));
  }, [date]);

  const setStatus = (empId: number, status: string) => {
    setRecords(prev => ({ ...prev, [empId]: status }));
  };

  const markAll = (status: string) => {
    const updated: Record<number, string> = {};
    employees.forEach(e => { updated[e.id] = status; });
    setRecords(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const recordsArr = employees.map(e => ({ employeeId: e.id, status: (records[e.id] || 'absent') as any }));
      await api.post('/attendance', { date, records: recordsArr });
      toast.success(`Attendance saved for ${recordsArr.length} employees!`);
    } catch { toast.error('Failed to save attendance'); }
    finally { setSaving(false); }
  };

  const stats = {
    present: employees.filter(e => records[e.id] === 'present').length,
    absent: employees.filter(e => !records[e.id] || records[e.id] === 'absent').length,
    late: employees.filter(e => records[e.id] === 'late').length,
    on_leave: employees.filter(e => records[e.id] === 'on_leave').length,
  };

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('attTracker')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{t('markDaily')}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} max={today} />
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || employees.length === 0}>
            <Save size={16} />
            {saving ? '...' : t('saveAtt')}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: t('present'), count: stats.present, color: 'var(--teal)', icon: Check },
          { label: t('absent'), count: stats.absent, color: 'var(--red)', icon: X },
          { label: t('late'), count: stats.late, color: 'var(--amber)', icon: Clock },
          { label: t('onLeave'), count: stats.on_leave, color: 'var(--blue)', icon: AlertCircle },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.count}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <div className="glass-card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CalendarCheck size={18} color="var(--purple)" />
          <span style={{ fontWeight: 600 }}>
            {date === today ? t('todayAtt') : `Attendance — ${new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => markAll('present')} disabled={employees.length === 0}>{t('brandAllPresent')}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => markAll('absent')} disabled={employees.length === 0}>{t('brandAllAbsent')}</button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table className="att-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', paddingLeft: '24px' }}>{t('employee')}</th>
                  <th style={{ textAlign: 'left' }}>{t('department')}</th>
                  <th style={{ textAlign: 'left' }}>{t('position')}</th>
                  <th style={{ width: '180px' }}>{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const status = records[emp.id] || 'absent';
                  return (
                    <tr key={emp.id}>
                      <td style={{ paddingLeft: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ background: avatarColors[emp.id % avatarColors.length] }}>
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{emp.firstName} {emp.lastName}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{emp.department?.name || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{emp.position || '—'}</td>
                      <td>
                        <select
                          value={status}
                          onChange={e => setStatus(emp.id, e.target.value)}
                          style={{
                            width: '100%',
                            background: 'var(--bg-main)', border: '1px solid var(--border)',
                            color: statusOptions.find(s => s.value === status)?.color || 'var(--text-primary)',
                            borderRadius: '6px', padding: '6px 10px', fontSize: '13px',
                            fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                            outline: 'none',
                          }}>
                          {statusOptions.map(s => (
                            <option key={s.value} value={s.value} style={{ color: 'var(--text-primary)' }}>{t(s.value as any) || s.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {employees.length === 0 && (
              <div className="empty-state"><CalendarCheck size={48} /><p>No active employees found</p></div>
            )}
          </div>
        )}

        {employees.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="btn btn-ghost" onClick={() => markAll('absent')}>{t('resetAll')}</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={16} />{saving ? '...' : t('saveAtt')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
