import React, { useState, useEffect } from 'react';
import { Star, Plus, MessageSquare, CheckCircle, Clock, Lock, Globe } from 'lucide-react';
import apiService from '../../services/apiService';
import FeedbackModal from './FeedbackModal';

const STAR_COLORS = { fill: '#fbbf24', empty: 'rgba(148,163,184,0.25)' };

function StarRow({ rating, size = 16 }) {
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} style={{
          width:size, height:size,
          fill:  rating >= n ? STAR_COLORS.fill : STAR_COLORS.empty,
          color: rating >= n ? STAR_COLORS.fill : STAR_COLORS.empty,
        }} />
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    PENDING:   { bg:'rgba(251,191,36,0.1)',  color:'#fbbf24', label:'Awaiting Response' },
    RESPONDED: { bg:'rgba(52,211,153,0.1)',  color:'#34d399', label:'Responded' },
  };
  const c = cfg[status] || cfg.PENDING;
  return (
    <span style={{
      background:c.bg, color:c.color, border:`1px solid ${c.color}30`,
      borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600,
      fontFamily:"'Space Grotesk',sans-serif",
    }}>
      {c.label}
    </span>
  );
}

export default function FeedbackPage() {
  const [feedbacks,     setFeedbacks]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showModal,     setShowModal]     = useState(false);
  const [expandedId,    setExpandedId]    = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiService.getMyFeedbacks();
      setFeedbacks(data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleModalClose = () => {
    setShowModal(false);
    load(); // refresh after submit
  };

  const heading = { fontFamily:"'Orbitron',sans-serif", color:'#e2e8f0' };
  const body    = { fontFamily:"'Space Grotesk',sans-serif" };

  return (
    <div style={{ maxWidth:800, margin:'0 auto' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ ...body, fontSize:11, color:'#38bdf8', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:6 }}>
            My Feedback
          </div>
          <h1 style={{ ...heading, fontSize:22, fontWeight:900, margin:0 }}>
            FEEDBACK & REVIEWS
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background:'linear-gradient(135deg,#0EA5E9,#6366F1)', color:'#fff', border:'none',
            borderRadius:12, padding:'10px 20px', cursor:'pointer',
            display:'flex', alignItems:'center', gap:8,
            fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:14,
            boxShadow:'0 4px 14px rgba(14,165,233,0.25)',
          }}
        >
          <Plus style={{ width:16, height:16 }} /> New Feedback
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', border:'2px solid rgba(14,165,233,0.2)', borderTopColor:'#0EA5E9', animation:'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : feedbacks.length === 0 ? (
        <div style={{
          background:'rgba(30,61,110,0.3)', border:'1px solid rgba(14,165,233,0.12)',
          borderRadius:20, padding:'60px 20px', textAlign:'center',
        }}>
          <MessageSquare style={{ width:48, height:48, color:'rgba(14,165,233,0.25)', margin:'0 auto 16px' }} />
          <p style={{ ...heading, fontSize:16, fontWeight:700, marginBottom:8, color:'#64748b' }}>No feedback yet</p>
          <p style={{ ...body, fontSize:13, color:'#475569', marginBottom:20 }}>
            Share your experience with JK Motors — your feedback helps us improve!
          </p>
          <button onClick={() => setShowModal(true)} style={{
            background:'linear-gradient(135deg,#0EA5E9,#6366F1)', color:'#fff', border:'none',
            borderRadius:12, padding:'10px 24px', cursor:'pointer',
            fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:13,
          }}>
            Leave Feedback
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {feedbacks.map(fb => (
            <div key={fb.id} style={{
              background:'rgba(30,61,110,0.4)', border:'1px solid rgba(14,165,233,0.15)',
              borderRadius:16, overflow:'hidden',
              transition:'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(14,165,233,0.15)'}
            >
              {/* Card header */}
              <div
                style={{ padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}
                onClick={() => setExpandedId(expandedId === fb.id ? null : fb.id)}
              >
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, flexWrap:'wrap' }}>
                    <StarRow rating={fb.rating} />
                    <StatusBadge status={fb.status} />
                    {fb.isPublic
                      ? <span style={{ display:'flex', alignItems:'center', gap:4, ...body, fontSize:11, color:'#64748b' }}><Globe style={{width:12,height:12}} /> Public</span>
                      : <span style={{ display:'flex', alignItems:'center', gap:4, ...body, fontSize:11, color:'#64748b' }}><Lock style={{width:12,height:12}} /> Private</span>
                    }
                  </div>
                  <p style={{ ...body, fontSize:13, color:'#cbd5e1', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace: expandedId === fb.id ? 'normal' : 'nowrap' }}>
                    {fb.message}
                  </p>
                  {fb.order && (
                    <p style={{ ...body, fontSize:11, color:'#475569', marginTop:6 }}>
                      Order: {fb.order.service?.name ?? 'Service'} · {fb.order.carMake} {fb.order.carModel}
                    </p>
                  )}
                </div>
                <div style={{ ...body, fontSize:11, color:'#475569', flexShrink:0, textAlign:'right' }}>
                  {new Date(fb.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Expanded: admin response */}
              {expandedId === fb.id && fb.adminResponse && (
                <div style={{
                  margin:'0 16px 16px',
                  background:'rgba(14,165,233,0.06)', border:'1px solid rgba(14,165,233,0.15)',
                  borderRadius:12, padding:'14px 16px',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <CheckCircle style={{ width:14, height:14, color:'#34d399' }} />
                    <span style={{ ...body, fontSize:11, color:'#34d399', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                      Response from JK Motors
                    </span>
                    {fb.respondedAt && (
                      <span style={{ ...body, fontSize:11, color:'#475569', marginLeft:'auto' }}>
                        {new Date(fb.respondedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p style={{ ...body, fontSize:13, color:'#94a3b8', margin:0, lineHeight:1.6 }}>
                    {fb.adminResponse}
                  </p>
                </div>
              )}

              {expandedId === fb.id && !fb.adminResponse && (
                <div style={{ margin:'0 16px 16px', padding:'12px 16px', background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.15)', borderRadius:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Clock style={{ width:14, height:14, color:'#fbbf24' }} />
                    <span style={{ ...body, fontSize:12, color:'#fbbf24' }}>
                      Our team will respond to your feedback shortly.
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <FeedbackModal onClose={handleModalClose} />
      )}
    </div>
  );
}
