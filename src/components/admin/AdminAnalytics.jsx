import React, { useState, useEffect, useCallback } from 'react';
import { Users, Globe, Monitor, TrendingUp, Clock, RefreshCw, ChevronLeft, ChevronRight, Smartphone, LayoutDashboard } from 'lucide-react';
import apiService from '../../services/apiService';

const G = {
  gold:        '#C9A84C',
  goldLight:   '#E8C96A',
  goldDim:     'rgba(201,168,76,0.18)',
  goldDimmer:  'rgba(201,168,76,0.09)',
  textPrimary: '#F5E4B8',
  textMuted:   'rgba(168,136,72,0.75)',
  border:      'rgba(201,168,76,0.16)',
  surface:     'rgba(28,22,9,0.6)',
};

const CARD = { background: G.surface, border: `1px solid ${G.border}`, borderRadius: 16, padding: 20 };
const FONT  = { fontFamily: "'DM Sans', sans-serif" };
const SERIF = { fontFamily: "'Playfair Display', serif" };
const LABEL = { ...FONT, fontSize: 11, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 };

const COLORS = ['#C9A84C','#E8C96A','#A07830','#8B6914','#6B5010','#F5E4B8','#3D2E09','#6ee7b7'];

function StatCard({ label, value, icon, color, isText = false }) {
  return (
    <div style={CARD}>
      <div style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, color, border: `1px solid ${color}30`, marginBottom: 12 }}>
        {icon}
      </div>
      <div style={{ ...SERIF, fontSize: isText ? 17 : 28, fontWeight: 700, color: G.textPrimary, textTransform: isText ? 'capitalize' : 'none', wordBreak: 'break-word' }}>
        {isText ? value : typeof value === 'number' ? value.toLocaleString() : '—'}
      </div>
      <div style={LABEL}>{label}</div>
    </div>
  );
}

function HorizBar({ label, value, max, color = G.gold, suffix = '' }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 4;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ ...FONT, fontSize: 13, color: G.textPrimary, maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ ...FONT, fontSize: 12, color }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix && <span style={{ color: G.textMuted, marginLeft: 4 }}>{suffix}</span>}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: G.goldDimmer }}>
        <div style={{ height: 6, borderRadius: 3, background: color, width: `${pct}%`, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function DailyChart({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ ...FONT, fontSize: 13, color: G.textMuted, textAlign: 'center', padding: '20px 0' }}>No data for this period</p>;
  }
  const maxVal = Math.max(...data.map(d => parseInt(d.count)), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80, paddingTop: 8 }}>
      {data.map((d, i) => {
        const h = Math.max(4, (parseInt(d.count) / maxVal) * 80);
        return (
          <div key={i} title={`${d.date}: ${d.count} visit${d.count !== '1' ? 's' : ''}`}
            style={{ flex: 1, minWidth: 2, height: h, background: G.gold, borderRadius: '2px 2px 0 0', opacity: 0.75, transition: 'height 0.4s ease', cursor: 'default' }} />
        );
      })}
    </div>
  );
}

function DevicePie({ data }) {
  const total = data.reduce((s, d) => s + parseInt(d.count), 0);
  if (total === 0) return <p style={{ ...FONT, fontSize: 13, color: G.textMuted }}>No data</p>;
  const sorted = [...data].sort((a, b) => parseInt(b.count) - parseInt(a.count));
  return (
    <div>
      <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 14, gap: 2 }}>
        {sorted.map((d, i) => (
          <div key={i} style={{ flex: parseInt(d.count), background: COLORS[i % COLORS.length], minWidth: 2 }} />
        ))}
      </div>
      {sorted.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
          <span style={{ ...FONT, fontSize: 13, color: G.textPrimary, flex: 1, textTransform: 'capitalize' }}>{d.device || d.browser || 'unknown'}</span>
          <span style={{ ...FONT, fontSize: 12, color: COLORS[i % COLORS.length] }}>{parseInt(d.count).toLocaleString()}</span>
          <span style={{ ...FONT, fontSize: 11, color: G.textMuted }}>({Math.round(parseInt(d.count) / total * 100)}%)</span>
        </div>
      ))}
    </div>
  );
}

function RecentTable({ visits }) {
  if (!visits || visits.length === 0) {
    return <p style={{ ...FONT, fontSize: 13, color: G.textMuted, padding: '16px 20px' }}>No visits yet.</p>;
  }
  const flagEmoji = (cc) => {
    if (!cc || cc === 'LO') return '🌐';
    const codePoints = [...cc.toUpperCase()].map(c => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };
  const deviceIcon = (device) => {
    if (device === 'mobile') return '📱';
    if (device === 'tablet') return '📟';
    return '🖥️';
  };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${G.border}` }}>
            {['Page','Location','Device','Browser','Time'].map(h => (
              <th key={h} style={{ ...FONT, fontSize: 11, color: G.textMuted, fontWeight: 600, textAlign: 'left', padding: '8px 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visits.map(v => (
            <tr key={v.id}
              onMouseEnter={e => e.currentTarget.style.background = G.goldDimmer}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              style={{ borderBottom: `1px solid rgba(201,168,76,0.06)`, transition: 'background 0.15s' }}>
              <td style={{ ...FONT, fontSize: 13, color: G.gold, padding: '10px 12px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.pagePath}</td>
              <td style={{ ...FONT, fontSize: 13, color: G.textPrimary, padding: '10px 12px', whiteSpace: 'nowrap' }}>{flagEmoji(v.countryCode)} {v.city ? `${v.city}, ` : ''}{v.country || '—'}</td>
              <td style={{ ...FONT, fontSize: 13, color: G.textMuted, padding: '10px 12px', whiteSpace: 'nowrap' }}>{deviceIcon(v.device)} {v.device || '—'}</td>
              <td style={{ ...FONT, fontSize: 13, color: G.textMuted, padding: '10px 12px' }}>{v.browser || '—'}</td>
              <td style={{ ...FONT, fontSize: 12, color: G.textMuted, padding: '10px 12px', whiteSpace: 'nowrap' }}>{new Date(v.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${G.goldDimmer}`, borderTopColor: G.gold, animation: 'jk-spin 0.8s linear infinite' }} />
    </div>
  );
}

export default function AdminAnalytics() {
  const [summary,  setSummary]  = useState(null);
  const [rawPage,  setRawPage]  = useState(null);
  const [days,     setDays]     = useState(30);
  const [loading,  setLoading]  = useState(true);
  const [rawLoad,  setRawLoad]  = useState(false);
  const [page,     setPage]     = useState(1);
  const [tab,      setTab]      = useState('overview');
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getAnalyticsSummary(days);
      setSummary(data);
      setLastRefresh(new Date());
    } catch (e) { console.error('Analytics load failed:', e); }
    finally { setLoading(false); }
  }, [days]);

  const loadRaw = useCallback(async (p = 1) => {
    setRawLoad(true);
    try {
      const data = await apiService.getAnalyticsVisits(p, 50);
      setRawPage(data); setPage(p);
    } catch (e) { console.error('Raw visits load failed:', e); }
    finally { setRawLoad(false); }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { if (tab === 'raw') loadRaw(1); }, [tab, loadRaw]);

  const statCards = summary ? [
    { label: 'Total visits (all time)', value: summary.totalAll,           icon: <TrendingUp className="w-5 h-5" />, color: G.gold },
    { label: `Visits (last ${days}d)`,  value: summary.totalWindow,        icon: <Clock      className="w-5 h-5" />, color: G.goldLight },
    { label: 'Unique visitors',         value: summary.uniqueVisitors,     icon: <Users      className="w-5 h-5" />, color: '#A07830' },
    { label: 'Countries reached',       value: summary.topCountries.length, icon: <Globe     className="w-5 h-5" />, color: '#8B6914' },
  ] : [];

  const topDevice = summary?.deviceBreakdown?.slice().sort((a, b) => parseInt(b.count) - parseInt(a.count))[0];

  return (
    <div style={{ ...FONT, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes jk-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ ...SERIF, fontSize: 22, fontWeight: 700, color: G.textPrimary, margin: 0 }}>Analytics</h1>
          <p style={{ ...FONT, fontSize: 13, color: G.textMuted, marginTop: 4 }}>
            Visitor locations, devices, pages
            {lastRefresh && <span style={{ marginLeft: 8, color: G.textMuted }}>· Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[7,30,90,365].map(d => (
              <button key={d} onClick={() => setDays(d)} style={{
                ...FONT, fontSize: 12, padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                border: days === d ? `1px solid ${G.gold}` : `1px solid ${G.border}`,
                background: days === d ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: days === d ? G.gold : G.textMuted,
              }}>{d}d</button>
            ))}
          </div>
          <button onClick={loadSummary} disabled={loading} style={{
            ...FONT, fontSize: 12, padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            border: `1px solid ${G.border}`, background: 'transparent', color: G.textMuted,
            display: 'flex', alignItems: 'center', gap: 4, opacity: loading ? 0.5 : 1,
          }}>
            <RefreshCw style={{ width: 13, height: 13 }} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${G.border}` }}>
        {[
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard style={{ width: 14, height: 14 }} /> },
          { id: 'raw',      label: 'All Visits', icon: <Clock style={{ width: 14, height: 14 }} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            ...FONT, fontSize: 13, padding: '8px 16px', borderRadius: '8px 8px 0 0', cursor: 'pointer',
            border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: 6,
            color: tab === t.id ? G.gold : G.textMuted,
            borderBottom: tab === t.id ? `2px solid ${G.gold}` : '2px solid transparent',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <>
          {loading ? <Spinner /> : !summary ? (
            <p style={{ color: G.textMuted, ...FONT }}>Failed to load analytics data.</p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }}>
                {statCards.map((s, i) => <StatCard key={i} {...s} />)}
                {topDevice && (
                  <StatCard label="Most common device" value={topDevice.device || 'unknown'} icon={<Smartphone className="w-5 h-5" />} color="#8B6914" isText />
                )}
              </div>

              <div style={CARD}>
                <h3 style={{ ...FONT, fontSize: 14, fontWeight: 600, color: G.textPrimary, margin: '0 0 4px' }}>Daily visits — last {days} days</h3>
                <p style={{ ...FONT, fontSize: 11, color: G.textMuted, margin: '0 0 12px' }}>Hover a bar to see the exact count</p>
                <DailyChart data={summary.dailyVisits} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={CARD}>
                  <h3 style={{ ...FONT, fontSize: 14, fontWeight: 600, color: G.textPrimary, margin: '0 0 16px' }}>📄 Top pages</h3>
                  {summary.topPages.length === 0
                    ? <p style={{ ...FONT, fontSize: 13, color: G.textMuted }}>No data yet</p>
                    : (() => { const max = parseInt(summary.topPages[0].count); return summary.topPages.map((p, i) => <HorizBar key={i} label={p.path || '/'} value={parseInt(p.count)} max={max} color={COLORS[i % COLORS.length]} />); })()
                  }
                </div>
                <div style={CARD}>
                  <h3 style={{ ...FONT, fontSize: 14, fontWeight: 600, color: G.textPrimary, margin: '0 0 16px' }}>🌍 Top countries</h3>
                  {summary.topCountries.length === 0
                    ? <p style={{ ...FONT, fontSize: 13, color: G.textMuted }}>No data yet</p>
                    : (() => { const max = parseInt(summary.topCountries[0].count); return summary.topCountries.map((c, i) => {
                        let flag = '🌐';
                        if (c.countryCode && c.countryCode !== 'LO') { try { const cp = [...c.countryCode.toUpperCase()].map(ch => 127397 + ch.charCodeAt(0)); flag = String.fromCodePoint(...cp); } catch {} }
                        return <HorizBar key={i} label={`${flag} ${c.country || 'Unknown'}`} value={parseInt(c.count)} max={max} color={COLORS[i % COLORS.length]} />;
                      }); })()
                  }
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={CARD}>
                  <h3 style={{ ...FONT, fontSize: 14, fontWeight: 600, color: G.textPrimary, margin: '0 0 16px' }}>💻 Devices</h3>
                  <DevicePie data={summary.deviceBreakdown} />
                </div>
                <div style={CARD}>
                  <h3 style={{ ...FONT, fontSize: 14, fontWeight: 600, color: G.textPrimary, margin: '0 0 16px' }}>🌐 Browsers</h3>
                  <DevicePie data={summary.browserBreakdown} />
                </div>
              </div>

              <div style={CARD}>
                <h3 style={{ ...FONT, fontSize: 14, fontWeight: 600, color: G.textPrimary, margin: '0 0 2px' }}>🕐 Recent visits</h3>
                <p style={{ ...FONT, fontSize: 11, color: G.textMuted, margin: '0 0 14px' }}>Latest 20 visits across all pages</p>
                <RecentTable visits={summary.recentVisits} />
              </div>
            </>
          )}
        </>
      )}

      {/* RAW VISITS TAB */}
      {tab === 'raw' && (
        <div style={CARD}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ ...FONT, fontSize: 14, fontWeight: 600, color: G.textPrimary, margin: 0 }}>All visits</h3>
              {rawPage && <p style={{ ...FONT, fontSize: 12, color: G.textMuted, marginTop: 2 }}>{rawPage.total.toLocaleString()} total — page {rawPage.page} of {rawPage.pages}</p>}
            </div>
            {rawPage && rawPage.pages > 1 && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={() => loadRaw(page - 1)} disabled={page <= 1 || rawLoad}
                  style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${G.border}`, background: 'transparent', color: G.textMuted, cursor: 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>
                  <ChevronLeft style={{ width: 14, height: 14 }} />
                </button>
                <span style={{ ...FONT, fontSize: 12, color: G.textMuted }}>{page} / {rawPage.pages}</span>
                <button onClick={() => loadRaw(page + 1)} disabled={page >= rawPage.pages || rawLoad}
                  style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${G.border}`, background: 'transparent', color: G.textMuted, cursor: 'pointer', opacity: page >= rawPage.pages ? 0.4 : 1 }}>
                  <ChevronRight style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}
          </div>
          {rawLoad ? <Spinner /> : rawPage ? <RecentTable visits={rawPage.visits} /> : <p style={{ ...FONT, color: G.textMuted, fontSize: 13 }}>Click the "All Visits" tab to load raw data.</p>}
        </div>
      )}
    </div>
  );
}