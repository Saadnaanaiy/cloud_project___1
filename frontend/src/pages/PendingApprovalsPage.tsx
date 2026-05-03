import { Clock, Mail, RefreshCw, Search, Shield, UserCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface PendingUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const PendingApprovalsPage: React.FC = () => {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/pending');
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await api.post(`/auth/approve/${id}`);
      toast.success('User approved successfully!');
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve user');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Pending Approvals</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage new user registration requests</p>
        </div>
        <button onClick={fetchPendingUsers} className="btn btn-ghost" style={{ gap: '8px' }}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading pending requests...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <UserCheck size={32} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Pending Approvals</h3>
            <p style={{ color: 'var(--text-muted)' }}>{searchTerm ? 'No users match your search' : 'All caught up! No new users waiting for approval.'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Requested Role</th>
                  <th>Signed Up</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar" style={{ background: 'var(--brand)', color: 'var(--brand-text)' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: 'var(--bg-main)', fontSize: '12px', fontWeight: 500, textTransform: 'capitalize', border: '1px solid var(--border)' }}>
                        <Shield size={12} /> {user.role}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="btn btn-primary"
                        disabled={processingId === user.id}
                        style={{ padding: '6px 16px', fontSize: '13px' }}
                      >
                        {processingId === user.id ? 'Approving...' : 'Approve Access'}
                      </button>
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

export default PendingApprovalsPage;
