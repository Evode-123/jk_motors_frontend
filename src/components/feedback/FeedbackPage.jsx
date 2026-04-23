import React, { useState, useEffect } from 'react';
import { Star, Plus, MessageSquare, CheckCircle, Clock, Lock, Globe } from 'lucide-react';
import apiService from '../../services/apiService';
import FeedbackModal from './FeedbackModal';

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

const FONT  = { fontFamily: "'DM Sans', sans-serif" };
const SERIF = { fontFamily: "'Playfair Display', serif" };

function StarRow({ rating, size = 16 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} style={{
          width: size, height: size,
          fill:  rating >= n ? G.gold : 'rgba(168,136,72,0.2)',
          color: rating >= n ? G.gold : 'rgba(168,136,72,0.2)',
        }} />
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    PENDING:   { bg: 'rgba(201,168,76,0.1)',   color: G.gold,      label: 'Awaiting Response' },
    RESPONDED: { bg: 'rgba(52,211,153,0.1)',   color: '#34d399',   label: 'Responded' },
  };
  const c = cfg[status] || cfg.PENDING;
  return (
    <span style={{
      background: c.bg, color: c.color,
      border: `1px solid ${c.color}30`,
      borderRadius: 20, padding: '2px 10px',
      fontSize: 11, fontWeight: 600, ...FONT,
    }}>
      {c.label}
    </span>
  );
}

export default function FeedbackPage() {
  const [feedbacks,  setFeedbacks]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const data = await apiService.getMyFeedbacks(); setFeedbacks(data || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleModalClose = () => { setShowModal(false); load(); };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`@keyframes jk-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ ...FONT, fontSize: 11, color: G.gold, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
            My Feedback
          </div>
          <h1 style={{ ...SERIF, fontSize: 22, fontWeight: 700, color: G.textPrimary, margin: 0 }}>
            Feedback & Reviews
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg,#8B6914,#C9A84C)',
            border: 'none', color: '#1C1609',
            ...FONT, fontWeight: 600, fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(201,168,76,0.2)',
          }}
        >
          <Plus style={{ width: 16, height: 16 }} /> New Feedback
        </button>
      </div>

      {/* Stats summary if feedbacks exist */}
      {!loading && feedbacks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
          {[
            { label: 'Total Reviews',  value: feedbacks.length,                                        color: G.gold },
            { label: 'Avg. Rating',    value: (feedbacks.reduce((s,f)=>s+f.rating,0)/feedbacks.length).toFixed(1) + ' ★', color: G.goldLight },
            { label: 'Responded',      value: feedbacks.filter(f=>f.status==='RESPONDED').length,      color: '#6ee7b7' },
            { label: 'Pending Reply',  value: feedbacks.filter(f=>f.status==='PENDING').length,        color: G.textMuted },
          ].map((s,i) => (
            <div key={i} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ ...SERIF, fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ ...FONT, fontSize: 11, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${G.goldDimmer}`, borderTopColor: G.gold, animation: 'jk-spin 0.7s linear infinite' }} />
        </div>
      ) : feedbacks.length === 0 ? (
        <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 20, padding: '60px 20px', textAlign: 'center' }}>
          <MessageSquare style={{ width: 48, height: 48, color: G.goldDim, margin: '0 auto 16px' }} />
          <p style={{ ...SERIF, fontSize: 16, fontWeight: 700, marginBottom: 8, color: G.textMuted }}>No feedback yet</p>
          <p style={{ ...FONT, fontSize: 13, color: G.textMuted, marginBottom: 20 }}>
            Share your experience with JK Motors — your feedback helps us improve!
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: 'linear-gradient(135deg,#8B6914,#C9A84C)', color: '#1C1609', border: 'none', borderRadius: 12, padding: '10px 24px', cursor: 'pointer', ...FONT, fontWeight: 600, fontSize: 13 }}
          >
            Leave Feedback
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {feedbacks.map(fb => (
            <div
              key={fb.id}
              style={{
                background: G.surface,
                border: `1px solid ${G.border}`,
                borderRadius: 16, overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = G.goldDim}
              onMouseLeave={e => e.currentTarget.style.borderColor = G.border}
            >
              {/* Card header */}
              <div
                style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}
                onClick={() => setExpandedId(expandedId === fb.id ? null : fb.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <StarRow rating={fb.rating} />
                    <StatusBadge status={fb.status} />
                    {fb.isPublic
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, ...FONT, fontSize: 11, color: G.textMuted }}><Globe style={{width:12,height:12}} /> Public</span>
                      : <span style={{ display: 'flex', alignItems: 'center', gap: 4, ...FONT, fontSize: 11, color: G.textMuted }}><Lock style={{width:12,height:12}} /> Private</span>
                    }
                  </div>
                  <p style={{
                    ...FONT, fontSize: 13, color: G.textPrimary, margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: expandedId === fb.id ? 'normal' : 'nowrap',
                  }}>
                    {fb.message}
                  </p>
                  {fb.order && (
                    <p style={{ ...FONT, fontSize: 11, color: G.textMuted, marginTop: 6 }}>
                      Order: {fb.order.service?.name ?? 'Service'} · {fb.order.carMake} {fb.order.carModel}
                    </p>
                  )}
                </div>
                <div style={{ ...FONT, fontSize: 11, color: G.textMuted, flexShrink: 0, textAlign: 'right' }}>
                  {new Date(fb.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Expanded: admin response */}
              {expandedId === fb.id && fb.adminResponse && (
                <div style={{
                  margin: '0 16px 16px',
                  background: 'rgba(201,168,76,0.05)',
                  border: `1px solid ${G.goldDim}`,
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircle style={{ width: 14, height: 14, color: '#34d399' }} />
                    <span style={{ ...FONT, fontSize: 11, color: '#34d399', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Response from JK Motors
                    </span>
                    {fb.respondedAt && (
                      <span style={{ ...FONT, fontSize: 11, color: G.textMuted, marginLeft: 'auto' }}>
                        {new Date(fb.respondedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p style={{ ...FONT, fontSize: 13, color: G.textMuted, margin: 0, lineHeight: 1.6 }}>
                    {fb.adminResponse}
                  </p>
                </div>
              )}

              {expandedId === fb.id && !fb.adminResponse && (
                <div style={{ margin: '0 16px 16px', padding: '12px 16px', background: 'rgba(201,168,76,0.05)', border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock style={{ width: 14, height: 14, color: G.gold }} />
                    <span style={{ ...FONT, fontSize: 12, color: G.gold }}>
                      Our team will respond to your feedback shortly.
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && <FeedbackModal onClose={handleModalClose} />}
    </div>
  );
}