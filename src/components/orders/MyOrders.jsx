// ══════════════════════════════════════════════════
// MyOrders.jsx — Gold/Dark Royal Crest Theme
// ══════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, CheckCircle, XCircle, Loader, RefreshCw, AlertCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import { STATUS_LABELS, STATUS_COLORS, ORDER_STATUS } from '../../utils/constants';
import FeedbackModal from '../feedback/FeedbackModal';

const G = { gold:'#C9A84C', goldLight:'#E8C96A', goldDim:'rgba(201,168,76,0.18)', goldDimmer:'rgba(201,168,76,0.09)', textPrimary:'#F5E4B8', textMuted:'rgba(168,136,72,0.75)', border:'rgba(201,168,76,0.16)', surface:'rgba(28,22,9,0.6)' };
const FONT  = { fontFamily:"'DM Sans', sans-serif" };
const SERIF = { fontFamily:"'Playfair Display', serif" };

const JKCard = ({ children, style = {} }) => (
  <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, overflow:'hidden', ...style }}>{children}</div>
);

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [rejectModal,setRejectModal]=useState(null);
  const [rejectReason,setRejectReason]=useState('');
  const [actionLoading,setActionLoading]=useState(false);
  const [actionError,setActionError]=useState('');
  const [feedbackOrder,setFeedbackOrder]=useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try { const data = await apiService.getMyOrders(); setOrders(data); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRespond = async (orderId, action, reason) => {
    setActionLoading(true); setActionError('');
    try {
      await apiService.respondToOrder(orderId, action, reason);
      await load();
      setRejectModal(null); setRejectReason('');
      if (action === 'confirm') {
        const confirmedOrder = orders.find(o => o.id === orderId);
        if (confirmedOrder) setFeedbackOrder(confirmedOrder);
      }
    } catch (err) { setActionError(err.message); }
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:80 }}>
      <div style={{ width:32,height:32,borderRadius:'50%',border:`2px solid ${G.goldDim}`,borderTopColor:G.gold,animation:'jk-spin 0.8s linear infinite' }} />
      <style>{`@keyframes jk-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <style>{`@keyframes jk-spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ ...SERIF, fontSize:22, fontWeight:700, color:G.textPrimary }}>My Orders</h1>
          <p style={{ ...FONT, fontSize:13, color:G.textMuted, marginTop:4 }}>Track your service requests</p>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={load} style={{ background:G.goldDimmer, border:`1px solid ${G.border}`, borderRadius:10, padding:8, cursor:'pointer', color:G.textMuted }}>
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={() => navigate('/order/new')}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12, background:'linear-gradient(135deg,#8B6914,#C9A84C)', border:'none', color:'#1C1609', ...FONT, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            + New Order
          </button>
        </div>
      </div>

      {error && <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(180,60,40,0.1)', border:'1px solid rgba(180,60,40,0.25)', color:'#f87171', ...FONT, fontSize:13 }}>{error}</div>}

      {orders.length === 0 && !error && (
        <div style={{ textAlign:'center', padding:'80px 24px' }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color:G.goldDim }} />
          <h3 style={{ ...SERIF, fontSize:16, fontWeight:700, color:G.textPrimary, marginBottom:6 }}>No orders yet</h3>
          <p style={{ ...FONT, fontSize:13, color:G.textMuted }}>Place your first service request!</p>
          <button onClick={() => navigate('/order/new')} style={{ marginTop:24, padding:'10px 28px', borderRadius:12, background:'linear-gradient(135deg,#8B6914,#C9A84C)', border:'none', color:'#1C1609', ...FONT, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            Browse Services
          </button>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {orders.map(order => {
          const colors = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
          const isApproved  = order.status === ORDER_STATUS.APPROVED;
          const isCompleted = order.status === ORDER_STATUS.COMPLETED;

          return (
            <JKCard key={order.id}>
              <div style={{ padding:'8px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', background:`${colors.bg}`, borderBottom:`1px solid ${colors.border}40` }}>
                <span style={{ ...FONT, fontSize:11, fontWeight:600, color:colors.text }}>{STATUS_LABELS[order.status]}</span>
                <span style={{ fontFamily:'monospace', fontSize:11, color:G.textMuted }}>#{order.id.substring(0,8).toUpperCase()}</span>
              </div>
              <div style={{ padding:20 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
                  <div style={{ flex:1 }}>
                    <h3 style={{ ...FONT, fontSize:15, fontWeight:600, color:G.textPrimary, marginBottom:4 }}>{order.service?.name??'Service Request'}</h3>
                    {order.product && <p style={{ ...FONT, fontSize:13, color:G.textMuted, marginBottom:8 }}>→ {order.product.name}</p>}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:12, ...FONT, fontSize:12, color:G.textMuted }}>
                      <span>🚗 {order.carMake} {order.carModel} ({order.carYear})</span>
                      <span>📍 {order.city}</span>
                      <span>📅 {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {order.quotedPrice && (
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ ...FONT, fontSize:11, color:G.textMuted, marginBottom:2 }}>Quoted Price</p>
                      <p style={{ ...SERIF, fontSize:20, fontWeight:700, color:G.gold }}>RWF {Number(order.quotedPrice).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {order.adminNotes && (
                  <div style={{ marginTop:12, padding:'10px 14px', borderRadius:10, background:G.goldDimmer, border:`1px solid ${G.goldDim}`, ...FONT, fontSize:13, color:G.textPrimary }}>
                    💬 <strong>From our team:</strong> {order.adminNotes}
                  </div>
                )}

                {isApproved && (
                  <div style={{ marginTop:16, padding:16, borderRadius:12, background:'rgba(201,168,76,0.07)', border:`1px solid rgba(201,168,76,0.25)` }}>
                    <p style={{ ...FONT, fontSize:13, fontWeight:600, color:G.textPrimary, marginBottom:4 }}>⏰ Your response is needed</p>
                    <p style={{ ...FONT, fontSize:13, color:G.textMuted, marginBottom:12 }}>
                      We've set a price of <strong style={{ color:G.gold }}>RWF {Number(order.quotedPrice).toLocaleString()}</strong>. Are you happy to proceed?
                    </p>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => handleRespond(order.id,'confirm')} disabled={actionLoading}
                        style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, background:'rgba(34,120,80,0.15)', border:'1px solid rgba(34,120,80,0.3)', color:'#6ee7b7', ...FONT, fontSize:13, fontWeight:600, cursor:'pointer', opacity:actionLoading?0.5:1 }}>
                        {actionLoading?<Loader className="w-4 h-4 animate-spin"/>:<CheckCircle className="w-4 h-4"/>} Yes, Confirm
                      </button>
                      <button onClick={() => setRejectModal(order)} disabled={actionLoading}
                        style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, background:'rgba(180,60,40,0.1)', border:'1px solid rgba(180,60,40,0.25)', color:'#f87171', ...FONT, fontSize:13, fontWeight:600, cursor:'pointer', opacity:actionLoading?0.5:1 }}>
                        <XCircle className="w-4 h-4"/> Reject
                      </button>
                    </div>
                    {actionError && <p style={{ color:'#f87171', fontSize:12, marginTop:8 }}>{actionError}</p>}
                  </div>
                )}

                {isCompleted && (
                  <div style={{ marginTop:16 }}>
                    <button onClick={() => setFeedbackOrder(order)}
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, background:'rgba(201,168,76,0.1)', border:`1px solid rgba(201,168,76,0.3)`, color:G.gold, ...FONT, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                      ⭐ Leave Review
                    </button>
                  </div>
                )}

                {order.clientRejectReason && (
                  <div style={{ marginTop:12, padding:'10px 14px', borderRadius:10, background:'rgba(180,60,40,0.06)', border:'1px solid rgba(180,60,40,0.15)', ...FONT, fontSize:13, color:'#f87171' }}>
                    Your rejection reason: {order.clientRejectReason}
                  </div>
                )}
              </div>
            </JKCard>
          );
        })}
      </div>

      {rejectModal && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(6px)' }}>
          <div style={{ background:'linear-gradient(160deg,#100D05,#1C1609)', border:`1px solid ${G.goldDim}`, borderRadius:20, width:'100%', maxWidth:480, padding:24 }}>
            <h3 style={{ ...SERIF, fontSize:16, fontWeight:700, color:G.textPrimary, marginBottom:6 }}>Reject Order?</h3>
            <p style={{ ...FONT, fontSize:13, color:G.textMuted, marginBottom:16 }}>Rejecting <strong style={{ color:G.textPrimary }}>#{rejectModal.id.substring(0,8).toUpperCase()}</strong>. Would you like to share why?</p>
            <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} rows={3} placeholder="Optional: price too high, found another provider..."
              style={{ background:'rgba(20,16,8,0.8)', border:`1px solid ${G.goldDim}`, color:G.textPrimary, borderRadius:12, padding:'10px 16px', fontSize:14, width:'100%', ...FONT, outline:'none', resize:'none' }} />
            {actionError && <p style={{ color:'#f87171', fontSize:12, marginTop:8 }}>{actionError}</p>}
            <div style={{ display:'flex', gap:12, marginTop:16 }}>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); setActionError(''); }} disabled={actionLoading}
                style={{ flex:1, padding:'10px', borderRadius:12, background:'transparent', border:`1px solid ${G.goldDim}`, color:G.textMuted, ...FONT, fontSize:13, fontWeight:600, cursor:'pointer', opacity:actionLoading?0.5:1 }}>
                Cancel
              </button>
              <button onClick={() => handleRespond(rejectModal.id,'reject',rejectReason)} disabled={actionLoading}
                style={{ flex:1, padding:'10px', borderRadius:12, background:'rgba(180,60,40,0.2)', border:'1px solid rgba(180,60,40,0.3)', color:'#f87171', ...FONT, fontSize:13, fontWeight:600, cursor:'pointer', opacity:actionLoading?0.5:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {actionLoading && <Loader className="w-4 h-4 animate-spin"/>} Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {feedbackOrder && (
        <FeedbackModal orderId={feedbackOrder.id} orderInfo={{ serviceName:feedbackOrder.service?.name, carMake:feedbackOrder.carMake, carModel:feedbackOrder.carModel }} onClose={() => setFeedbackOrder(null)} />
      )}
    </div>
  );
}