import React, { useEffect, useState } from 'react';
import { Shield, Clock, Monitor, Globe, RefreshCcw, User } from 'lucide-react';
import api from '../api/axios';
import { useLang } from '../context/LanguageContext';
import { format } from 'date-fns';
import { motion } from 'motion/react';

interface AuditLog {
  id: number;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const SecurityLogsPage: React.FC = () => {
  const { t } = useLang();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/audit/logs?limit=50');
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch security logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.toLowerCase().includes('mobile')) return <Monitor size={14} className="text-blue" />;
    return <Monitor size={14} className="text-purple" />;
  };

  return (
    <div className="page-inner animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('securityLogs')}</h1>
          <p className="text-text-secondary mt-1">Track all system authentication events and access attempts.</p>
        </div>
        <button 
          onClick={fetchLogs} 
          disabled={loading}
          className="btn btn-ghost flex items-center gap-2"
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass-card overflow-hidden">
          <div className="table-wrap">
            <table className="att-table">
              <thead>
                <tr>
                  <th><div className="flex items-center gap-2"><User size={14} /> User</div></th>
                  <th><div className="flex items-center gap-2"><Shield size={14} /> Action</div></th>
                  <th><div className="flex items-center gap-2"><Globe size={14} /> IP Address</div></th>
                  <th><div className="flex items-center gap-2"><Monitor size={14} /> Device / Agent</div></th>
                  <th><div className="flex items-center gap-2"><Clock size={14} /> Timestamp</div></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="py-8"><div className="h-4 bg-surface-hover rounded w-full"></div></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state">No security logs found.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-xs font-bold text-brand">
                            {log.user?.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{log.user?.name || 'Deleted User'}</div>
                            <div className="text-xs text-text-muted">{log.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${log.action === 'LOGIN' ? 'badge-active' : 'badge-terminated'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <code className="text-xs font-mono bg-surface-hover px-2 py-1 rounded border border-border">
                          {log.ipAddress}
                        </code>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 max-w-xs">
                          {getDeviceIcon(log.userAgent)}
                          <span className="text-xs text-text-secondary truncate" title={log.userAgent}>
                            {log.userAgent}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-text-muted">
                          {format(new Date(log.timestamp), 'HH:mm:ss')}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogsPage;
