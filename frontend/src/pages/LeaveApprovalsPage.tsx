import { CheckCircle, Clock, Search, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface Leave {
  id: number; type: string; status: string;
  startDate: string; endDate: string; reason: string;
  employee: { id: number; firstName: string; lastName: string; email: string };
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

const LeaveApprovalsPage: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [comment, setComment] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  const load = async () => {
    try {
      const { data } = await api.get('/leaves');
      setLeaves(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load leaves'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: number, status: string) => {
    setActionId(id);
    try {
      await api.patch(`/leaves/${id}/status`, { status, comment });
      toast.success(`Leave ${status}!`);
      setComment('');
      load();
    } catch { toast.error('Action failed'); }
    finally { setActionId(null); }
  };

  const filtered = leaves.filter(l =>
    l.employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Approvals</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{leaves.filter(l => l.status === 'pending').length} pending requests</p>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-control" placeholder="Search..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '36px' }} />
          </div>
        </div>

        {loading && <div style={{ padding: '60px', textAlign: 'center' }}><div className="spinner" /></div>}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>All caught up!</p>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Comment / Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>
                        {l.employee?.firstName} {l.employee?.lastName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{l.employee?.email}</div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: `${typeColors[l.type]}18`, color: typeColors[l.type], fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                        <Clock size={12} /> {l.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason || '—'}</td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: statusBadge[l.status]?.bg, color: statusBadge[l.status]?.fg, textTransform: 'capitalize' }}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      {l.status === 'pending' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
                          <input className="form-control" placeholder="Comment..." value={comment}
                            onChange={e => setComment(e.target.value)} style={{ fontSize: '12px', padding: '6px 10px' }} />
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-success" style={{ fontSize: '11px', padding: '4px 12px', gap: '4px' }}
                              onClick={() => handleAction(l.id, 'approved')} disabled={actionId === l.id}>
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button className="btn btn-danger" style={{ fontSize: '11px', padding: '4px 12px', gap: '4px' }}
                              onClick={() => handleAction(l.id, 'rejected')} disabled={actionId === l.id}>
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l.approverComment || '—'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApprovalsPage;
