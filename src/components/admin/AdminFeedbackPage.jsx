// ═══════════════════════════════════════════════════
// AdminFeedbackPage.jsx — Gold/Dark Royal Crest Theme
// ═══════════════════════════════════════════════════
import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Send, Trash2, Eye, TrendingUp, CheckCircle, Clock, ChevronDown, ChevronUp, Filter, RefreshCw } from 'lucide-react';
import apiService from '../../services/apiService';

const G = {
  gold:'#C9A84C', goldLight:'#E8C96A', goldDim:'rgba(201,168,76,0.18)',
  goldDimmer:'rgba(201,168,76,0.09)', textPrimary:'#F5E4B8',
  textMuted:'rgba(168,136,72,0.75)', border:'rgba(201,168,76,0.16)',
  surface:'rgba(28,22,9,0.6)',
};
const FONT  = { fontFamily:"'DM Sans', sans-serif" };
const SERIF = { fontFamily:"'Playfair Display', serif" };

function StarRow({ rating, size = 14 }) {
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} style={{ width:size, height:size, fill:rating>=n?'#C9A84C':'rgba(168,136,72,0.2)', color:rating>=n?'#C9A84C':'rgba(168,136,72,0.2)' }} />
      ))}
    </div>
  );
}

function UserAvatar({ user, size=36 }) {
  const [err,setErr] = useState(false);
  const initials = user ? `${(user.firstName||'?')[0]}${(user.lastName||'?')[0]}`.toUpperCase() : '?';
  if (user?.avatarUrl && !err)
    return <img src={user.avatarUrl} onError={()=>setErr(true)} alt={initials} style={{ width:size,height:size,borderRadius:'50%',objectFit:'cover',border:`1.5px solid ${G.goldDim}`,flexShrink:0 }} />;
  return <div style={{ width:size,height:size,borderRadius:'50%',background:'linear-gradient(135deg,#8B6914,#C9A84C)',display:'flex',alignItems:'center',justifyContent:'center',...FONT,fontWeight:700,fontSize:size*0.35,color:'#1C1609',flexShrink:0 }}>{initials}</div>;
}

const STATUS_CFG = {
  PENDING:   { bg:'rgba(201,168,76,0.1)', color:'#C9A84C', label:'Pending' },
  RESPONDED: { bg:'rgba(52,211,153,0.1)', color:'#34d399', label:'Responded' },
};

export default function AdminFeedbackPage() {
  const [feedbacks,setFeedbacks]=useState([]);
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(true);
  const [statusFilter,setStatusFilter]=useState('');
  const [expandedId,setExpandedId]=useState(null);
  const [responseText,setResponseText]=useState({});
  const [responding,setResponding]=useState({});
  const [deleting,setDeleting]=useState({});
  const [error,setError]=useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, statsData] = await Promise.all([
        apiService.adminGetFeedbacks(statusFilter ? { status: statusFilter } : {}),
        apiService.adminGetFeedbackStats(),
      ]);
      setFeedbacks(data||[]); setStats(statsData);
    } catch {} finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleExpand = async (fb) => {
    const newId = expandedId === fb.id ? null : fb.id;
    setExpandedId(newId);
    if (newId && !fb.isRead) {
      try { await apiService.adminMarkFeedbackRead(fb.id); setFeedbacks(prev => prev.map(f => f.id===fb.id?{...f,isRead:true}:f)); } catch {}
    }
  };

  const handleRespond = async (id) => {
    const text = responseText[id]?.trim();
    if (!text) return setError(prev=>({...prev,[id]:'Please write a response.'}));
    setError(prev=>({...prev,[id]:''})); setResponding(prev=>({...prev,[id]:true}));
    try {
      const updated = await apiService.adminRespondToFeedback(id, text);
      setFeedbacks(prev=>prev.map(f=>f.id===id?updated:f));
      setResponseText(prev=>({...prev,[id]:''}));
    } catch(e) { setError(prev=>({...prev,[id]:e.message})); }
    finally { setResponding(prev=>({...prev,[id]:false})); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback permanently?')) return;
    setDeleting(prev=>({...prev,[id]:true}));
    try { await apiService.adminDeleteFeedback(id); setFeedbacks(prev=>prev.filter(f=>f.id!==id)); }
    catch {} finally { setDeleting(prev=>({...prev,[id]:false})); }
  };

  const StatsCard = ({ label, value, icon, color }) => (
    <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:20 }}>
      <div style={{ width:38,height:38,borderRadius:10,background:`${color}18`,border:`1px solid ${color}30`,display:'flex',alignItems:'center',justifyContent:'center',color,marginBottom:12 }}>{icon}</div>
      <div style={{ ...SERIF, fontSize:26, fontWeight:700, color:G.textPrimary }}>{value??'—'}</div>
      <div style={{ ...FONT, fontSize:11, color:G.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', marginTop:2 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      <style>{`
        .resp-textarea { resize:none; background:rgba(20,16,8,0.8); border:1px solid rgba(201,168,76,0.22); color:#F5E4B8; border-radius:10px; width:100%; padding:10px 12px; font-family:'DM Sans',sans-serif; font-size:13px; outline:none; transition:border-color 0.2s; }
        .resp-textarea:focus { border-color:rgba(201,168,76,0.5); box-shadow:0 0 0 3px rgba(201,168,76,0.08); }
        .resp-textarea::placeholder { color:rgba(168,136,72,0.45); }
        @keyframes jk-spin { to { transform:rotate(360deg); } }
      `}</style>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ ...FONT, fontSize:11, color:G.gold, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:6 }}>Admin Panel</div>
          <h1 style={{ ...SERIF, fontSize:22, fontWeight:700, color:G.textPrimary, margin:0 }}>FEEDBACK MANAGEMENT</h1>
        </div>
        <button onClick={load} style={{ background:G.goldDimmer, border:`1px solid ${G.border}`, borderRadius:10, padding:'8px 16px', color:G.textMuted, cursor:'pointer', display:'flex', alignItems:'center', gap:8, ...FONT, fontSize:13 }}>
          <RefreshCw style={{ width:14, height:14 }} /> Refresh
        </button>
      </div>

      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:28 }}>
          <StatsCard label="Total Feedback"    value={stats.total}   icon={<MessageSquare style={{width:18,height:18}} />} color={G.gold} />
          <StatsCard label="Unread"            value={stats.unread}  icon={<Eye           style={{width:18,height:18}} />} color={G.goldLight} />
          <StatsCard label="Awaiting Response" value={stats.pending} icon={<Clock         style={{width:18,height:18}} />} color="#A07830" />
          <StatsCard label="Avg. Rating"
            value={<span style={{ display:'flex', alignItems:'center', gap:6 }}>{stats.averageRating}<Star style={{ width:20, height:20, fill:G.gold, color:G.gold }} /></span>}
            icon={<TrendingUp style={{width:18,height:18}} />} color="#8B6914" />
        </div>
      )}

      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {['','PENDING','RESPONDED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{
              border:`1px solid ${statusFilter===s ? G.gold : G.border}`,
              background: statusFilter===s ? 'rgba(201,168,76,0.15)' : G.goldDimmer,
              color: statusFilter===s ? G.gold : G.textMuted,
              borderRadius:10, padding:'6px 14px', cursor:'pointer',
              ...FONT, fontSize:13, fontWeight: statusFilter===s ? 600 : 400,
              display:'flex', alignItems:'center', gap:6,
            }}>
            <Filter style={{ width:12, height:12 }} />
            {s==='' ? 'All' : s==='PENDING' ? 'Pending' : 'Responded'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
          <div style={{ width:28,height:28,borderRadius:'50%',border:`2px solid ${G.goldDimmer}`,borderTopColor:G.gold,animation:'jk-spin 0.7s linear infinite' }} />
        </div>
      ) : feedbacks.length === 0 ? (
        <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:20, padding:'60px 20px', textAlign:'center' }}>
          <MessageSquare style={{ width:48,height:48,color:G.goldDim,margin:'0 auto 16px' }} />
          <p style={{ ...FONT, fontSize:14, color:G.textMuted }}>No feedback found{statusFilter?` with status "${statusFilter}"`:''}.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {feedbacks.map(fb => {
            const isExpanded = expandedId === fb.id;
            const sCfg = STATUS_CFG[fb.status] || STATUS_CFG.PENDING;
            return (
              <div key={fb.id} style={{ background:fb.isRead?G.surface:'rgba(36,28,12,0.7)', border:`1px solid ${fb.isRead?G.border:G.goldDim}`, borderRadius:16, overflow:'hidden' }}>
                <div style={{ padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:14, cursor:'pointer' }} onClick={() => handleExpand(fb)}>
                  <UserAvatar user={fb.user} size={38} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                      <span style={{ ...FONT, fontSize:13, fontWeight:700, color:G.textPrimary }}>
                        {fb.user ? `${fb.user.firstName||''} ${fb.user.lastName||''}`.trim()||fb.user.email : 'Unknown'}
                      </span>
                      <StarRow rating={fb.rating} />
                      <span style={{ background:sCfg.bg, color:sCfg.color, border:`1px solid ${sCfg.color}30`, borderRadius:20, padding:'2px 10px', ...FONT, fontSize:11, fontWeight:600 }}>{sCfg.label}</span>
                      {!fb.isRead && <span style={{ background:'rgba(180,60,40,0.15)', color:'#f87171', border:'1px solid rgba(180,60,40,0.25)', borderRadius:20, padding:'2px 8px', ...FONT, fontSize:10, fontWeight:700 }}>NEW</span>}
                    </div>
                    <p style={{ ...FONT, fontSize:13, color:G.textMuted, margin:'0 0 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:isExpanded?'normal':'nowrap' }}>{fb.message}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                      {fb.user?.email && <span style={{ ...FONT, fontSize:11, color:G.textMuted }}>{fb.user.email}</span>}
                      {fb.order && <span style={{ ...FONT, fontSize:11, color:G.textMuted }}>· {fb.order.service?.name??'Service'} · {fb.order.carMake} {fb.order.carModel}</span>}
                      <span style={{ ...FONT, fontSize:11, color:G.textMuted, marginLeft:'auto' }}>{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                    <button onClick={e=>{e.stopPropagation();handleDelete(fb.id);}} disabled={deleting[fb.id]}
                      style={{ background:'rgba(180,60,40,0.08)', border:'1px solid rgba(180,60,40,0.2)', borderRadius:8, padding:'6px 8px', cursor:'pointer', color:'#f87171' }}>
                      {deleting[fb.id] ? <div style={{ width:14,height:14,borderRadius:'50%',border:'2px solid rgba(248,113,113,0.3)',borderTopColor:'#f87171',animation:'jk-spin 0.7s linear infinite' }} /> : <Trash2 style={{ width:14, height:14 }} />}
                    </button>
                    {isExpanded ? <ChevronUp style={{width:16,height:16,color:G.textMuted}} /> : <ChevronDown style={{width:16,height:16,color:G.textMuted}} />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop:`1px solid ${G.border}`, padding:'16px 18px', background:G.goldDimmer }}>
                    <div style={{ marginBottom:16, padding:'12px 14px', background:'rgba(20,16,8,0.6)', border:`1px solid ${G.border}`, borderRadius:12 }}>
                      <div style={{ ...FONT, fontSize:11, color:G.textMuted, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Full Message</div>
                      <p style={{ ...FONT, fontSize:13, color:G.textPrimary, margin:0, lineHeight:1.7 }}>{fb.message}</p>
                    </div>
                    {fb.adminResponse && (
                      <div style={{ marginBottom:16, padding:'12px 14px', background:'rgba(52,211,153,0.05)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:12 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                          <CheckCircle style={{ width:13, height:13, color:'#34d399' }} />
                          <span style={{ ...FONT, fontSize:11, color:'#34d399', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>Your Response · {fb.respondedAt?new Date(fb.respondedAt).toLocaleDateString():''}</span>
                        </div>
                        <p style={{ ...FONT, fontSize:13, color:G.textMuted, margin:0, lineHeight:1.7 }}>{fb.adminResponse}</p>
                      </div>
                    )}
                    <div>
                      <div style={{ ...FONT, fontSize:12, color:G.textMuted, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>{fb.adminResponse?'Update Response':'Write a Response'}</div>
                      <textarea className="resp-textarea" rows={3} placeholder="Write a response to this feedback... (visible to the customer)" value={responseText[fb.id]||''} onChange={e=>setResponseText(prev=>({...prev,[fb.id]:e.target.value}))} />
                      {error[fb.id] && <p style={{ ...FONT, fontSize:12, color:'#f87171', margin:'6px 0 0' }}>{error[fb.id]}</p>}
                      <button onClick={() => handleRespond(fb.id)} disabled={responding[fb.id]}
                        style={{ marginTop:10, background:'linear-gradient(135deg,#8B6914,#C9A84C)', color:'#1C1609', border:'none', borderRadius:10, padding:'10px 20px', cursor:responding[fb.id]?'wait':'pointer', display:'flex', alignItems:'center', gap:8, ...FONT, fontWeight:600, fontSize:13, opacity:responding[fb.id]?0.75:1 }}>
                        {responding[fb.id] ? <><div style={{ width:14,height:14,borderRadius:'50%',border:'2px solid rgba(28,22,9,0.3)',borderTopColor:'#1C1609',animation:'jk-spin 0.7s linear infinite' }} /> Sending…</> : <><Send style={{width:14,height:14}} /> Send Response</>}
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