import { Calendar, Clock, Plus, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface Leave {
  id: number; type: string; status: string;
  startDate: string; endDate: string; reason: string;
  approverComment: string; createdAt: string;
}

const typeColors: Record<string, string> = {
  annual: '#6c5ce7', sick: '#e84393', personal: '#f59e0b',
};

const statusBadge: Record<string, { bg: string; fg: string }> = {
  pending: { bg: 'rgba(245,158,11,0.12)', fg: '#f59e0b' },
  approved: { bg: 'rgba(16,185,129,0.12)', fg: '#10b981' },
  rejected: { bg: 'rgba(239,68,68,0.12)', fg: '#ef4444' },
};

const MyLeavesPage: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'annual', startDate: '', endDate: '', reason: '', employeeId: 0 });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const { data } = await api.get('/leaves');
      setLeaves(Array.isArray(data) ? data : []);
      setForm(f => ({ ...f, employeeId: user.id }));
    } catch { toast.error('Failed to load leaves'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post('/leaves', form);
      toast.success('Leave request submitted!');
      setShowForm(false);
      load();
    } catch { toast.error('Failed to submit leave'); }
    finally { setSaving(false); }
  };

  const filtered = leaves.filter(l =>
    l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Leaves</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{leaves.length} total requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Leave Request
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-control" placeholder="Search by type or status..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '36px' }} />
          </div>
        </div>

        {loading && <div style={{ padding: '60px', textAlign: 'center' }}><div className="spinner" /></div>}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>{searchTerm ? 'No matching leaves' : 'No leave requests yet'}</p>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: `${typeColors[l.type]}18`, color: typeColors[l.type], fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                        <Clock size={12} /> {l.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason || '—'}</td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: statusBadge[l.status]?.bg, color: statusBadge[l.status]?.fg, textTransform: 'capitalize' }}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.approverComment || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <button className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }} style={{ border: 'none', cursor: 'default' }}>
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">New Leave Request</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Leave Type *</label>
                <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="annual">Annual</option>
                  <option value="sick">Sick</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input className="form-control" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input className="form-control" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea className="form-control" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="Optional reason..." />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit} disabled={saving || !form.startDate || !form.endDate}>
                  {saving ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

export default MyLeavesPage;
