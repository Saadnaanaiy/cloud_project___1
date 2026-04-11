import React, { useState } from 'react';
import { FileDown, FileSpreadsheet, FileText, BarChart3 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useLang } from '../context/LanguageContext';

const ReportsPage: React.FC = () => {
  const { t } = useLang();
  const [exporting, setExporting] = useState<string | null>(null);

  const download = async (type: 'pdf' | 'excel') => {
    setExporting(type);
    try {
      const res = await api.get(`/reports/${type}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_employes_${new Date().toISOString().split('T')[0]}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type.toUpperCase()} downloaded successfully!`);
    } catch { toast.error('Export failed. Please try again.'); }
    finally { setExporting(null); }
  };

  const reports = [
    {
      id: 'pdf',
      title: t('empFullReport'),
      desc: t('empFullReportDesc'),
      icon: FileText,
      iconBg: 'var(--purple)',
      btnClass: 'btn-primary',
      format: 'PDF',
      meta: `2–4 ${t('pages')}`,
      includes: [
        'Employee directory table',
        'KPI statistics boxes',
        'Salary information',
        'Status breakdown',
        'Department analysis',
      ],
    },
    {
      id: 'excel',
      title: t('empExcel'),
      desc: t('empExcelDesc'),
      icon: FileSpreadsheet,
      iconBg: 'var(--teal)',
      btnClass: 'btn-success',
      format: 'XLSX',
      meta: `3 ${t('worksheets')}`,
      includes: [
        'Employees sheet',
        'Attendance records sheet',
        'Statistics sheet',
        'Color-coded rows',
        'Styled headers',
      ],
    },
  ];

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('reportsTitle')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{t('reportsDesc')}</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '12px',
          background: 'var(--purple)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <BarChart3 size={22} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>{t('autoReport')}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t('autoReportDesc')}</div>
        </div>
      </div>

      {/* Report cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        {reports.map(r => (
          <div key={r.id} className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: r.iconBg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}>
                <r.icon size={24} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '17px', marginBottom: '6px' }}>{r.title}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: '99px', fontSize: '11px',
                    fontWeight: 600, background: r.iconBg, color: '#fff',
                  }}>{r.format}</span>
                  <span style={{
                    padding: '2px 10px', borderRadius: '99px', fontSize: '11px',
                    color: 'var(--text-muted)', background: 'var(--bg-main)', border: '1px solid var(--border)',
                  }}>{r.meta}</span>
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>{r.desc}</p>

            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px',
              }}>{t('includes')}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {r.includes.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.iconBg, display: 'inline-block', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`btn ${r.btnClass}`}
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              onClick={() => download(r.id as 'pdf' | 'excel')}
              disabled={!!exporting}
            >
              {exporting === r.id ? (
                <><div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }} /> {t('generating')}</>
              ) : (
                <><FileDown size={16} /> {t('download')} {r.format}</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
