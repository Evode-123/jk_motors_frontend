// ═══════════════════════════════════════════════════════════
// MyOrders.jsx  — JK Motors dark theme  (with FeedbackModal)
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, CheckCircle, XCircle, Loader, RefreshCw, AlertCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import { STATUS_LABELS, STATUS_COLORS, ORDER_STATUS } from '../../utils/constants';
import FeedbackModal from '../feedback/FeedbackModal';   // ← NEW IMPORT

const T = {
  heading: { fontFamily: "'Orbitron', sans-serif",      color: '#e2e8f0' },
  body:    { fontFamily: "'Space Grotesk', sans-serif", color: '#e2e8f0' },
  muted:   { fontFamily: "'Space Grotesk', sans-serif", color: '#64748b' },
};

const JKCard = ({ children, style = {} }) => (
  <div style={{
    background: 'rgba(30,61,110,0.4)',
    border: '1px solid rgba(14,165,233,0.15)',
    borderRadius: 16,
    overflow: 'hidden',
    ...style,
  }}>
    {children}
  </div>
);

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [responding,    setResponding]    = useState(null);
  const [rejectModal,   setRejectModal]   = useState(null);
  const [rejectReason,  setRejectReason]  = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError,   setActionError]   = useState('');

  // ── NEW: feedback modal state ──────────────────────────────
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  // ──────────────────────────────────────────────────────────

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiService.getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Updated: show feedback modal after client confirms ─────
  const handleRespond = async (orderId, action, reason) => {
    setActionLoading(true); setActionError('');
    try {
      await apiService.respondToOrder(orderId, action, reason);
      await load();
      setResponding(null);
      setRejectModal(null);
      setRejectReason('');

      // After a "confirm" response, show the feedback modal
      if (action === 'confirm') {
        const confirmedOrder = orders.find(o => o.id === orderId);
        if (confirmedOrder) setFeedbackOrder(confirmedOrder);
      }
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };
  // ──────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(14,165,233,0.2)', borderTopColor: '#0EA5E9' }} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ ...T.heading, fontSize: 22, fontWeight: 900 }}>My Orders</h1>
          <p style={{ ...T.muted, fontSize: 13, marginTop: 4 }}>Track your service requests</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load}
            style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#94a3b8' }}>
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={() => navigate('/order/new')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', border: 'none', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + New Order
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', ...T.body, fontSize: 13 }}>
          {error}
        </div>
      )}

      {orders.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#1e3d6e' }} />
          <h3 style={{ ...T.heading, fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No orders yet</h3>
          <p style={{ ...T.muted, fontSize: 13 }}>Place your first service request!</p>
          <button onClick={() => navigate('/order/new')}
            style={{ marginTop: 24, padding: '10px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', border: 'none', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Browse Services
          </button>
        </div>
      )}

      {/* ── Order list ──────────────────────────────────────── */}
      <div className="space-y-4">
        {orders.map(order => {
          const colors    = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
          const isApproved   = order.status === ORDER_STATUS.APPROVED;
          const isCompleted  = order.status === ORDER_STATUS.COMPLETED;   // ← NEW

          return (
            <JKCard key={order.id}>
              {/* Status bar */}
              <div style={{
                padding: '8px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: `${colors.bg}18`,
                borderBottom: `1px solid ${colors.border}30`,
              }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600, color: colors.text }}>
                  {STATUS_LABELS[order.status]}
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>
                  #{order.id.substring(0, 8).toUpperCase()}
                </span>
              </div>

              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ ...T.body, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                      {order.service?.name ?? 'Service Request'}
                    </h3>
                    {order.product && (
                      <p style={{ ...T.muted, fontSize: 13, marginBottom: 8 }}>→ {order.product.name}</p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#64748b' }}>
                      <span>🚗 {order.carMake} {order.carModel} ({order.carYear})</span>
                      <span>📍 {order.city}</span>
                      <span>📅 {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {order.quotedPrice && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ ...T.muted, fontSize: 11, marginBottom: 2 }}>Quoted Price</p>
                      <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 900, color: '#38bdf8' }}>
                        RWF {Number(order.quotedPrice).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {order.adminNotes && (
                  <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#bae6fd' }}>
                    💬 <strong>From our team:</strong> {order.adminNotes}
                  </div>
                )}

                {/* ── Approved: customer response needed ───────── */}
                {isApproved && (
                  <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: '#c7d2fe', marginBottom: 4 }}>
                      ⏰ Your response is needed
                    </p>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#a5b4fc', marginBottom: 12 }}>
                      We've set a price of <strong style={{ color: '#c7d2fe' }}>RWF {Number(order.quotedPrice).toLocaleString()}</strong>. Are you happy to proceed?
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => handleRespond(order.id, 'confirm')} disabled={actionLoading}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: actionLoading ? 0.5 : 1 }}>
                        {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Yes, Confirm
                      </button>
                      <button onClick={() => setRejectModal(order)} disabled={actionLoading}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: actionLoading ? 0.5 : 1 }}>
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                    {actionError && <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{actionError}</p>}
                  </div>
                )}

                {/* ── NEW: Completed — "Leave Review" button ─────── */}
                {isCompleted && (
                  <div style={{ marginTop: 16 }}>
                    <button
                      onClick={() => setFeedbackOrder(order)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 16px',
                        borderRadius: 10,
                        background: 'rgba(251,191,36,0.1)',
                        border: '1px solid rgba(251,191,36,0.3)',
                        color: '#fbbf24',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ⭐ Leave Review
                    </button>
                  </div>
                )}
                {/* ─────────────────────────────────────────────── */}

                {order.clientRejectReason && (
                  <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#f87171' }}>
                    Your rejection reason: {order.clientRejectReason}
                  </div>
                )}
              </div>
            </JKCard>
          );
        })}
      </div>

      {/* ── Reject Modal ────────────────────────────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'linear-gradient(160deg,#0F2644,#1E3D6E)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 20, width: '100%', maxWidth: 480, padding: 24 }}>
            <h3 style={{ ...T.heading, fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Reject Order?</h3>
            <p style={{ ...T.muted, fontSize: 13, marginBottom: 16 }}>
              Rejecting <strong style={{ color: '#e2e8f0' }}>#{rejectModal.id.substring(0, 8).toUpperCase()}</strong>. Would you like to share why?
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Optional: price too high, found another provider..."
              style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)', color: '#e2e8f0', borderRadius: 12, padding: '10px 16px', fontSize: 14, width: '100%', fontFamily: "'Space Grotesk', sans-serif", outline: 'none', resize: 'none' }}
            />
            {actionError && <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{actionError}</p>}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); setActionError(''); }}
                disabled={actionLoading}
                style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(14,165,233,0.2)', color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: actionLoading ? 0.5 : 1 }}>
                Cancel
              </button>
              <button
                onClick={() => handleRespond(rejectModal.id, 'reject', rejectReason)}
                disabled={actionLoading}
                style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: actionLoading ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {actionLoading && <Loader className="w-4 h-4 animate-spin" />}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: Feedback Modal ─────────────────────────────── */}
      {feedbackOrder && (
        <FeedbackModal
          orderId={feedbackOrder.id}
          orderInfo={{
            serviceName: feedbackOrder.service?.name,
            carMake:     feedbackOrder.carMake,
            carModel:    feedbackOrder.carModel,
          }}
          onClose={() => setFeedbackOrder(null)}
        />
      )}
      {/* ─────────────────────────────────────────────────────── */}
    </div>
  );
}