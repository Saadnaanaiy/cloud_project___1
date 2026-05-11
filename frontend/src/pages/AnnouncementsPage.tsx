import { Bell, Megaphone, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Announcement {
  id: number; title: string; content: string; priority: string;
  author: { name: string }; publishedAt: string; createdAt: string;
}

const priorityConfig: Record<string, { bg: string; fg: string }> = {
  low: { bg: 'rgba(59,130,246,0.12)', fg: '#3b82f6' },
  medium: { bg: 'rgba(245,158,11,0.12)', fg: '#f59e0b' },
  high: { bg: 'rgba(239,68,68,0.12)', fg: '#ef4444' },
};

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ title: '', content: '', priority: 'low', publishedAt: '' });
  const [saving, setSaving] = useState(false);

  const canManage = user?.role === 'admin';

  const load = async () => {
    try {
      const { data } = await api.get('/announcements');
      setItems(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load announcements'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (form.title) body.title = form.title;
      if (form.content) body.content = form.content;
      if (form.priority) body.priority = form.priority;
      if (form.publishedAt) body.publishedAt = form.publishedAt;
      await api.post('/announcements', body);
      toast.success('Announcement published!');
      setShowForm(false);
      setForm({ title: '', content: '', priority: 'low', publishedAt: '' });
      load();
    } catch { toast.error('Failed to publish'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await api.delete(`/announcements/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = items.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{items.length} total announcements</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Announcement
          </button>
        )}
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-control" placeholder="Search announcements..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '36px' }} />
          </div>
        </div>

        {loading && <div style={{ padding: '60px', textAlign: 'center' }}><div className="spinner" /></div>}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Megaphone size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>{searchTerm ? 'No matching announcements' : 'No announcements yet'}</p>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map(a => (
              <div key={a.id} style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Bell size={16} style={{ color: priorityConfig[a.priority]?.fg }} />
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>{a.title}</span>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 600, background: priorityConfig[a.priority]?.bg, color: priorityConfig[a.priority]?.fg, textTransform: 'capitalize' }}>
                      {a.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{a.content}</p>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
                    <span>By {a.author?.name || 'Unknown'}</span>
                    <span>{new Date(a.publishedAt || a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {canManage && (
                  <button className="btn btn-ghost btn-icon" style={{ color: 'var(--red)', flexShrink: 0 }} onClick={() => handleDelete(a.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <button className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }} style={{ border: 'none', cursor: 'default' }}>
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">New Announcement</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" />
              </div>
              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea className="form-control" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5} placeholder="Write your announcement..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Publish Date</label>
                  <input className="form-control" type="datetime-local" value={form.publishedAt} onChange={e => setForm({ ...form, publishedAt: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave} disabled={saving || !form.title || !form.content}>
                  {saving ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

export default AnnouncementsPage;
