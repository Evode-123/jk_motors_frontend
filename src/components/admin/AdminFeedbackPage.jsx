import React, { useState, useEffect, useCallback } from 'react';
import {
  Star, MessageSquare, Send, Trash2, Eye, TrendingUp,
  CheckCircle, Clock, ChevronDown, ChevronUp, Filter, RefreshCw
} from 'lucide-react';
import apiService from '../../services/apiService';

function StarRow({ rating, size = 14 }) {
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} style={{
          width:size, height:size,
          fill:  rating >= n ? '#fbbf24' : 'rgba(148,163,184,0.2)',
          color: rating >= n ? '#fbbf24' : 'rgba(148,163,184,0.2)',
        }} />
      ))}
    </div>
  );
}

function UserAvatar({ user, size = 36 }) {
  const [err, setErr] = useState(false);
  const initials = user
    ? `${(user.firstName||'?')[0]}${(user.lastName||'?')[0]}`.toUpperCase()
    : '?';
  if (user?.avatarUrl && !err) {
    return <img src={user.avatarUrl} onError={() => setErr(true)} alt={initials}
      style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', border:'1.5px solid rgba(14,165,233,0.3)', flexShrink:0 }} />;
  }
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'linear-gradient(135deg,#0EA5E9,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:size*0.35, color:'#fff', flexShrink:0 }}>
      {initials}
    </div>
  );
}

const STATUS_CFG = {
  PENDING:   { bg:'rgba(251,191,36,0.1)',  color:'#fbbf24', label:'Pending' },
  RESPONDED: { bg:'rgba(52,211,153,0.1)',  color:'#34d399', label:'Responded' },
};

export default function AdminFeedbackPage() {
  const [feedbacks,    setFeedbacks]    = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId,   setExpandedId]   = useState(null);
  const [responseText, setResponseText] = useState({});
  const [responding,   setResponding]   = useState({});
  const [deleting,     setDeleting]     = useState({});
  const [error,        setError]        = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, statsData] = await Promise.all([
        apiService.adminGetFeedbacks(statusFilter ? { status: statusFilter } : {}),
        apiService.adminGetFeedbackStats(),
      ]);
      setFeedbacks(data || []);
      setStats(statsData);
    } catch {}
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Mark as read when expanding
  const handleExpand = async (fb) => {
    const newId = expandedId === fb.id ? null : fb.id;
    setExpandedId(newId);
    if (newId && !fb.isRead) {
      try {
        await apiService.adminMarkFeedbackRead(fb.id);
        setFeedbacks(prev => prev.map(f => f.id === fb.id ? { ...f, isRead: true } : f));
      } catch {}
    }
  };

  const handleRespond = async (id) => {
    const text = responseText[id]?.trim();
    if (!text) return setError(prev => ({ ...prev, [id]: 'Please write a response.' }));
    setError(prev => ({ ...prev, [id]: '' }));
    setResponding(prev => ({ ...prev, [id]: true }));
    try {
      const updated = await apiService.adminRespondToFeedback(id, text);
      setFeedbacks(prev => prev.map(f => f.id === id ? updated : f));
      setResponseText(prev => ({ ...prev, [id]: '' }));
    } catch (e) {
      setError(prev => ({ ...prev, [id]: e.message }));
    } finally {
      setResponding(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback permanently?')) return;
    setDeleting(prev => ({ ...prev, [id]: true }));
    try {
      await apiService.adminDeleteFeedback(id);
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    } catch {}
    finally { setDeleting(prev => ({ ...prev, [id]: false })); }
  };

  const heading = { fontFamily:"'Orbitron',sans-serif", color:'#e2e8f0' };
  const body    = { fontFamily:"'Space Grotesk',sans-serif" };

  const StatsCard = ({ label, value, icon, color }) => (
    <div style={{ background:'rgba(30,61,110,0.4)', border:'1px solid rgba(14,165,233,0.15)', borderRadius:16, padding:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', color }}>
          {icon}
        </div>
      </div>
      <div style={{ ...heading, fontSize:26, fontWeight:900 }}>{value ?? '—'}</div>
      <div style={{ ...body, fontSize:11, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:2 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        .resp-textarea { resize:none; background:rgba(14,165,233,0.04); border:1px solid rgba(14,165,233,0.2); color:#e2e8f0; border-radius:10px; width:100%; padding:10px 12px; font-family:'Space Grotesk',sans-serif; font-size:13px; outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
        .resp-textarea:focus { border-color:rgba(14,165,233,0.5); box-shadow:0 0 0 3px rgba(14,165,233,0.08); }
        .resp-textarea::placeholder { color:rgba(148,163,184,0.5); }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ ...body, fontSize:11, color:'#38bdf8', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:6 }}>
            Admin Panel
          </div>
          <h1 style={{ ...heading, fontSize:22, fontWeight:900, margin:0 }}>
            FEEDBACK MANAGEMENT
          </h1>
        </div>
        <button onClick={load} style={{ background:'rgba(14,165,233,0.08)', border:'1px solid rgba(14,165,233,0.2)', borderRadius:10, padding:'8px 16px', color:'#94a3b8', cursor:'pointer', display:'flex', alignItems:'center', gap:8, ...body, fontSize:13 }}>
          <RefreshCw style={{ width:14, height:14 }} /> Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:28 }}>
          <StatsCard label="Total Feedback"    value={stats.total}         icon={<MessageSquare style={{width:18,height:18}} />} color="#0EA5E9" />
          <StatsCard label="Unread"            value={stats.unread}        icon={<Eye           style={{width:18,height:18}} />} color="#f59e0b" />
          <StatsCard label="Awaiting Response" value={stats.pending}       icon={<Clock         style={{width:18,height:18}} />} color="#6366F1" />
          <StatsCard label="Avg. Rating"
            value={
              <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                {stats.averageRating}
                <Star style={{ width:20, height:20, fill:'#fbbf24', color:'#fbbf24' }} />
              </span>
            }
            icon={<TrendingUp style={{width:18,height:18}} />} color="#10b981"
          />
        </div>
      )}

      {/* Filter */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {['', 'PENDING', 'RESPONDED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{
              border:`1px solid ${statusFilter===s ? 'rgba(14,165,233,0.5)' : 'rgba(14,165,233,0.15)'}`,
              background: statusFilter===s ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.04)',
              color: statusFilter===s ? '#38bdf8' : '#94a3b8',
              borderRadius:10, padding:'6px 14px', cursor:'pointer',
              ...body, fontSize:13, fontWeight: statusFilter===s ? 600 : 400,
              display:'flex', alignItems:'center', gap:6,
            }}>
            <Filter style={{ width:12, height:12 }} />
            {s === '' ? 'All' : s === 'PENDING' ? 'Pending' : 'Responded'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', border:'2px solid rgba(14,165,233,0.2)', borderTopColor:'#0EA5E9', animation:'spin 0.7s linear infinite' }} />
        </div>
      ) : feedbacks.length === 0 ? (
        <div style={{ background:'rgba(30,61,110,0.3)', border:'1px solid rgba(14,165,233,0.12)', borderRadius:20, padding:'60px 20px', textAlign:'center' }}>
          <MessageSquare style={{ width:48, height:48, color:'rgba(14,165,233,0.2)', margin:'0 auto 16px' }} />
          <p style={{ ...body, fontSize:14, color:'#475569' }}>No feedback found{statusFilter ? ` with status "${statusFilter}"` : ''}.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {feedbacks.map(fb => {
            const isExpanded = expandedId === fb.id;
            const sCfg = STATUS_CFG[fb.status] || STATUS_CFG.PENDING;
            return (
              <div key={fb.id} style={{
                background: fb.isRead ? 'rgba(30,61,110,0.35)' : 'rgba(30,61,110,0.55)',
                border: `1px solid ${fb.isRead ? 'rgba(14,165,233,0.13)' : 'rgba(14,165,233,0.28)'}`,
                borderRadius:16, overflow:'hidden',
              }}>
                {/* Row */}
                <div style={{ padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:14, cursor:'pointer' }}
                  onClick={() => handleExpand(fb)}>

                  <UserAvatar user={fb.user} size={38} />

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                      <span style={{ ...body, fontSize:13, fontWeight:700, color:'#e2e8f0' }}>
                        {fb.user ? `${fb.user.firstName || ''} ${fb.user.lastName || ''}`.trim() || fb.user.email : 'Unknown'}
                      </span>
                      <StarRow rating={fb.rating} />
                      <span style={{ background:sCfg.bg, color:sCfg.color, border:`1px solid ${sCfg.color}30`, borderRadius:20, padding:'2px 10px', ...body, fontSize:11, fontWeight:600 }}>
                        {sCfg.label}
                      </span>
                      {!fb.isRead && (
                        <span style={{ background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.25)', borderRadius:20, padding:'2px 8px', ...body, fontSize:10, fontWeight:700 }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <p style={{ ...body, fontSize:13, color:'#94a3b8', margin:'0 0 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace: isExpanded ? 'normal' : 'nowrap' }}>
                      {fb.message}
                    </p>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                      {fb.user?.email && <span style={{ ...body, fontSize:11, color:'#475569' }}>{fb.user.email}</span>}
                      {fb.order && <span style={{ ...body, fontSize:11, color:'#475569' }}>· {fb.order.service?.name ?? 'Service'} · {fb.order.carMake} {fb.order.carModel}</span>}
                      <span style={{ ...body, fontSize:11, color:'#475569', marginLeft:'auto' }}>{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(fb.id); }}
                      disabled={deleting[fb.id]}
                      style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'6px 8px', cursor:'pointer', color:'#f87171' }}>
                      {deleting[fb.id]
                        ? <div style={{ width:14,height:14,borderRadius:'50%',border:'2px solid rgba(248,113,113,0.3)',borderTopColor:'#f87171',animation:'spin 0.7s linear infinite' }} />
                        : <Trash2 style={{ width:14, height:14 }} />}
                    </button>
                    {isExpanded ? <ChevronUp style={{width:16,height:16,color:'#64748b'}} /> : <ChevronDown style={{width:16,height:16,color:'#64748b'}} />}
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div style={{ borderTop:'1px solid rgba(14,165,233,0.1)', padding:'16px 18px', background:'rgba(14,165,233,0.02)' }}>

                    {/* Full message */}
                    <div style={{ marginBottom:16, padding:'12px 14px', background:'rgba(14,165,233,0.04)', border:'1px solid rgba(14,165,233,0.1)', borderRadius:12 }}>
                      <div style={{ ...body, fontSize:11, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Full Message</div>
                      <p style={{ ...body, fontSize:13, color:'#cbd5e1', margin:0, lineHeight:1.7 }}>{fb.message}</p>
                    </div>

                    {/* Existing response */}
                    {fb.adminResponse && (
                      <div style={{ marginBottom:16, padding:'12px 14px', background:'rgba(52,211,153,0.05)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:12 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                          <CheckCircle style={{ width:13, height:13, color:'#34d399' }} />
                          <span style={{ ...body, fontSize:11, color:'#34d399', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                            Your Response · {fb.respondedAt ? new Date(fb.respondedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p style={{ ...body, fontSize:13, color:'#94a3b8', margin:0, lineHeight:1.7 }}>{fb.adminResponse}</p>
                      </div>
                    )}

                    {/* Response box */}
                    <div>
                      <div style={{ ...body, fontSize:12, color:'#94a3b8', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                        {fb.adminResponse ? 'Update Response' : 'Write a Response'}
                      </div>
                      <textarea
                        className="resp-textarea"
                        rows={3}
                        placeholder="Write a response to this feedback... (visible to the customer)"
                        value={responseText[fb.id] || ''}
                        onChange={e => setResponseText(prev => ({ ...prev, [fb.id]: e.target.value }))}
                      />
                      {error[fb.id] && (
                        <p style={{ ...body, fontSize:12, color:'#f87171', margin:'6px 0 0' }}>{error[fb.id]}</p>
                      )}
                      <button
                        onClick={() => handleRespond(fb.id)}
                        disabled={responding[fb.id]}
                        style={{
                          marginTop:10, background:'linear-gradient(135deg,#0EA5E9,#6366F1)', color:'#fff',
                          border:'none', borderRadius:10, padding:'10px 20px', cursor:responding[fb.id] ? 'wait' : 'pointer',
                          display:'flex', alignItems:'center', gap:8,
                          ...body, fontWeight:600, fontSize:13, opacity:responding[fb.id] ? 0.75 : 1,
                        }}>
                        {responding[fb.id]
                          ? <><div style={{ width:14,height:14,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'spin 0.7s linear infinite' }} /> Sending…</>
                          : <><Send style={{width:14,height:14}} /> Send Response</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}