import { Building2, Clock, FileDown, FileSpreadsheet, TrendingUp, UserCheck, Users, UserX } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/axios';
import { useLang } from '../context/LanguageContext';

const COLORS = ['#6c5ce7', '#00b894', '#f59e0b', '#ef4444', '#3b82f6', '#e84393'];

const DashboardPage: React.FC = () => {
  const { t } = useLang();
  const [stats, setStats] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const formatDateOnly = (dateValue?: string) => {
    if (!dateValue) return '';
    const rawDate = dateValue.includes('T') ? dateValue.split('T')[0] : dateValue;
    const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return rawDate;
    return `${match[3]}/${match[2]}`;
  };

  useEffect(() => {
    Promise.all([
      api.get('/employees/stats'),
      api.get(`/attendance/stats/monthly?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`),
      api.get(`/attendance/stats/yearly?year=${new Date().getFullYear()}`),
    ]).then(([statsRes, monthlyRes, yearlyRes]) => {
      setStats(statsRes.data);
      const attendanceData = Array.isArray(monthlyRes.data) ? monthlyRes.data : [];
      setMonthlyData(attendanceData.map((d: any) => {
        const present = Number(d.present) || 0;
        const absent = Number(d.absent) || 0;
        const late = Number(d.late) || 0;
        return {
          date: formatDateOnly(d.date),
          present,
          absent,
          late,
        };
      }));
      const yData = Array.isArray(yearlyRes.data) ? yearlyRes.data : [];
      setYearlyData(yData);
    }).catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const downloadReport = async (type: 'pdf' | 'excel') => {
    setExporting(type);
    try {
      const res = await api.get(`/reports/${type}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_employes_${new Date().toISOString().split('T')[0]}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type.toUpperCase()} report downloaded!`);
    } catch { toast.error('Export failed'); }
    finally { setExporting(null); }
  };

  const kpis = [
    { label: t('totalEmployees'), value: stats?.total ?? '—', icon: Users, color: 'var(--brand-hover)', sub: t('allRegistered') },
    { label: t('activeEmployees'), value: stats?.active ?? '—', icon: UserCheck, color: 'var(--teal)', sub: t('currentlyWorking') },
    { label: t('blocked'), value: stats?.blocked ?? '—', icon: UserX, color: 'var(--red)', sub: t('accessSuspended') },
    { label: t('onLeave'), value: stats?.onLeave ?? '—', icon: Clock, color: 'var(--amber)', sub: t('temporarilyAbsent') },
  ];

  const deptData = Array.isArray(stats?.byDepartment) ? stats.byDepartment.map((d: any) => ({ name: d.department || 'Unknown', value: parseInt(d.count) })) : [];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '16px' }}>
      <div className="spinner" />
      <span style={{ color: 'var(--text-muted)' }}>Loading dashboard...</span>
    </div>
  );

  return (
    <div className="animate-slide">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('welcomeBoard')} <span>{t('dashboard')}</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{t('dashDesc')}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-ghost" onClick={() => downloadReport('excel')} disabled={!!exporting}>
            <FileSpreadsheet size={16} color="var(--teal)" />
            {exporting === 'excel' ? t('generating') : t('exportExcel')}
          </button>
          <button className="btn btn-primary" onClick={() => downloadReport('pdf')} disabled={!!exporting}>
            <FileDown size={16} />
            {exporting === 'pdf' ? t('generating') : t('exportPdf')}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass-card kpi-card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <kpi.icon size={22} color={kpi.color} />
              </div>
              <TrendingUp size={14} color="var(--text-muted)" />
            </div>
            <div className="kpi-value" style={{ color: 'var(--text-primary)' }}>
              {kpi.value}
            </div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Attendance trend */}
        <div className="glass-card chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <TrendingUp size={18} color="var(--brand)" />
            <h3 className="chart-title" style={{ margin: 0 }}>{t('attTrends')}</h3>
          </div>
          {monthlyData.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <p>No data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(value) => `Date: ${value}`}
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)' }}
                  cursor={{ fill: 'var(--border)', opacity: 0.4 }}
                />
                <Legend wrapperStyle={{ color: 'var(--text-primary)', fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="present" stackId="a" fill="var(--brand)" name={t('present')} />
                <Bar dataKey="late" stackId="a" fill="var(--amber)" name={t('late')} />
                <Bar dataKey="absent" stackId="a" fill="var(--red)" name={t('absent')} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dept distribution */}
        <div className="glass-card chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Building2 size={18} color="var(--teal)" />
            <h3 className="chart-title" style={{ margin: 0 }}>{t('deptDist')}</h3>
          </div>
          {deptData.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}><p>No data</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={deptData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                  {deptData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text-primary)', fontSize: '11px' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monthly Attendance Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Monthly Presence - Vertical Bar with Labels */}
        <div className="glass-card chart-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <h3 className="chart-title" style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600 }}>{t('monthlyPresence')}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>{t('past6Months')}</p>
            </div>
          </div>
          {yearlyData.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}><p>{t('noData')}</p></div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={yearlyData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)' }}
                    cursor={{ fill: 'var(--border)', opacity: 0.3 }}
                  />
                  <Bar dataKey="present" fill="#3b82f6" radius={[6, 6, 0, 0]} name={t('present')}>
                    <LabelList dataKey="present" position="top" fill="var(--text-primary)" fontSize={12} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <TrendingUp size={16} color="#10b981" />
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{t('trendingUp')} 5.2% {t('thisMonth')}</span>
                <ArrowUpRight size={14} color="#10b981" />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{t('totalPresent')} {yearlyData.reduce((sum, d) => sum + (d.present || 0), 0)}</p>
            </>
          )}
        </div>

        {/* Monthly Attendance Overview - Horizontal Bar */}
        <div className="glass-card chart-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <h3 className="chart-title" style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600 }}>{t('monthlyAttOverview')}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>{t('past6Months')}</p>
            </div>
          </div>
          {yearlyData.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}><p>{t('noData')}</p></div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={yearlyData} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="month" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)' }}
                    cursor={{ fill: 'var(--border)', opacity: 0.3 }}
                  />
                  <Legend wrapperStyle={{ color: 'var(--text-primary)', fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="present" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} name={t('present')} />
                  <Bar dataKey="late" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} name={t('late')} />
                  <Bar dataKey="absent" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} name={t('absent')} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <TrendingUp size={16} color="#10b981" />
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{t('trendingUp')} 3.8% {t('thisMonth')}</span>
                <ArrowUpRight size={14} color="#10b981" />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Showing total attendance records for the last {yearlyData.length} months</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
