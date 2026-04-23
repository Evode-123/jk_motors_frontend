import React, { useState, useEffect } from 'react';
import { Eye, Check, X, RefreshCw, Filter, Loader, ChevronDown } from 'lucide-react';
import apiService from '../../services/apiService';
import { ORDER_STATUS, STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';

const G = {
  gold:        '#C9A84C',
  goldLight:   '#E8C96A',
  goldDim:     'rgba(201,168,76,0.18)',
  goldDimmer:  'rgba(201,168,76,0.08)',
  textPrimary: '#F5E4B8',
  textMuted:   'rgba(168,136,72,0.75)',
  border:      'rgba(201,168,76,0.16)',
  surface:     'rgba(28,22,9,0.6)',
};

const FONT  = { fontFamily: "'DM Sans', sans-serif" };
const SERIF = { fontFamily: "'Playfair Display', serif" };

const JKCard = ({ children, style = {} }) => (
  <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 16, overflow: 'hidden', ...style }}>
    {children}
  </div>
);

const JKInput = ({ style = {}, ...props }) => (
  <input {...props} style={{
    background: 'rgba(20,16,8,0.8)', border: `1px solid ${G.goldDim}`,
    color: G.textPrimary, borderRadius: 12, padding: '10px 16px', fontSize: 14, width: '100%',
    fontFamily: "'DM Sans', sans-serif", outline: 'none', ...style,
  }} />
);

const JKTextarea = ({ style = {}, ...props }) => (
  <textarea {...props} style={{
    background: 'rgba(20,16,8,0.8)', border: `1px solid ${G.goldDim}`,
    color: G.textPrimary, borderRadius: 12, padding: '10px 16px', fontSize: 14, width: '100%',
    fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'none', ...style,
  }} />
);

const JKLabel = ({ children }) => (
  <label style={{ ...FONT, color: G.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{children}</label>
);

const GradBtn = ({ children, onClick, disabled, style = {} }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ background: 'linear-gradient(135deg,#8B6914,#C9A84C)', color: '#1C1609', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'DM Sans', sans-serif", ...style }}>
    {children}
  </button>
);

const OutlineBtn = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ background: 'transparent', color: G.textMuted, border: `1px solid ${G.goldDim}`, borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontFamily: "'DM Sans', sans-serif" }}>
    {children}
  </button>
);

const StatusPill = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontFamily: "'DM Sans', sans-serif" }}>{status}</span>;
};

const ModalShell = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
    <div style={{ background: 'linear-gradient(160deg,#100D05,#1C1609)', border: `1px solid ${G.goldDim}`, borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${G.border}` }}>
        <h3 style={{ ...SERIF, fontSize: 16, fontWeight: 700, color: G.textPrimary }}>{title}</h3>
        <button onClick={onClose} style={{ background: G.goldDimmer, border: `1px solid ${G.border}`, borderRadius: 8, padding: 6, cursor: 'pointer', color: G.textMuted }}><X className="w-4 h-4" /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>{children}</div>
    </div>
  </div>
);

export default function AdminOrderManagement() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [filter,  setFilter]  = useState('ALL');

  const [detailModal,  setDetailModal]  = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [statusModal,  setStatusModal]  = useState(null);

  const [quotedPrice,   setQuotedPrice]   = useState('');
  const [adminNotes,    setAdminNotes]    = useState('');
  const [newStatus,     setNewStatus]     = useState('');
  const [statusNotes,   setStatusNotes]   = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError,   setActionError]   = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiService.adminGetOrders(filter !== 'ALL' ? { status: filter } : {});
      setOrders(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleApprove = async () => {
    if (!quotedPrice || isNaN(Number(quotedPrice)) || Number(quotedPrice) <= 0) { setActionError('Please enter a valid price.'); return; }
    setActionLoading(true); setActionError('');
    try {
      await apiService.adminApproveOrder(approveModal.id, Number(quotedPrice), adminNotes);
      setSuccess('Order approved! Email sent to client.');
      setApproveModal(null); setQuotedPrice(''); setAdminNotes('');
      await load(); setTimeout(() => setSuccess(''), 5000);
    } catch (err) { setActionError(err.message); }
    finally { setActionLoading(false); }
  };

  const handleStatusUpdate = async () => {
    setActionLoading(true); setActionError('');
    try {
      await apiService.adminUpdateOrderStatus(statusModal.id, newStatus, statusNotes);
      setSuccess(`Order marked as ${newStatus}.`);
      setStatusModal(null); setNewStatus(''); setStatusNotes('');
      await load(); setTimeout(() => setSuccess(''), 5000);
    } catch (err) { setActionError(err.message); }
    finally { setActionLoading(false); }
  };

  const STATUS_FILTERS = ['ALL', ...Object.values(ORDER_STATUS)];

  const thStyle = { ...FONT, fontSize: 11, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 16px', textAlign: 'left', borderBottom: `1px solid ${G.border}` };
  const tdStyle = { ...FONT, padding: '12px 16px', fontSize: 13, color: G.textPrimary, borderBottom: `1px solid rgba(201,168,76,0.07)` };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes jk-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ ...SERIF, fontSize: 22, fontWeight: 700, color: G.textPrimary }}>Order Management</h1>
          <p style={{ ...FONT, fontSize: 13, color: G.textMuted, marginTop: 4 }}>Review, approve and manage all service orders</p>
        </div>
        <button onClick={load} style={{ background: G.goldDimmer, border: `1px solid ${G.border}`, borderRadius: 10, padding: 8, cursor: 'pointer', color: G.textMuted }}>
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {success && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'rgba(34,120,80,0.12)', border: '1px solid rgba(34,120,80,0.3)', color: '#6ee7b7' }}>
          <span style={{ ...FONT, fontSize: 13 }}>{success}</span>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6ee7b7' }}><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(180,60,40,0.1)', border: '1px solid rgba(180,60,40,0.25)', color: '#f87171', ...FONT, fontSize: 13 }}>{error}</div>}

      {/* Filters */}
      <JKCard style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Filter className="w-4 h-4" style={{ color: G.textMuted }} />
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: filter === s ? 'linear-gradient(135deg,#8B6914,#C9A84C)' : G.goldDimmer,
                color: filter === s ? '#1C1609' : G.textMuted,
                border: filter === s ? 'none' : `1px solid ${G.border}`,
                fontFamily: "'DM Sans', sans-serif",
              }}>
              {s === 'ALL' ? 'All Orders' : STATUS_LABELS[s] || s}
            </button>
          ))}
        </div>
        <p style={{ ...FONT, fontSize: 12, color: G.textMuted, marginTop: 10 }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </JKCard>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${G.goldDim}`, borderTopColor: G.gold, animation: 'jk-spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <JKCard>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Order', 'Client', 'Service', 'Status', 'Price', 'Date', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="7" style={{ ...FONT, textAlign: 'center', padding: '48px 0', fontSize: 13, color: G.textMuted }}>No orders found</td></tr>
                ) : orders.map(order => (
                  <tr key={order.id}
                    onMouseEnter={e => e.currentTarget.style.background = G.goldDimmer}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: 12, color: G.textMuted }}>#{order.id.substring(0,8).toUpperCase()}</span></td>
                    <td style={tdStyle}>
                      <p style={{ fontWeight: 600, color: G.textPrimary, marginBottom: 2 }}>{order.clientFirstName} {order.clientLastName}</p>
                      <p style={{ fontSize: 11, color: G.textMuted }}>{order.clientEmail}</p>
                    </td>
                    <td style={tdStyle}>
                      <p style={{ color: G.textPrimary }}>{order.service?.name ?? '—'}</p>
                      {order.product && <p style={{ fontSize: 11, color: G.textMuted }}>→ {order.product.name}</p>}
                    </td>
                    <td style={tdStyle}><StatusPill status={order.status} /></td>
                    <td style={tdStyle}>
                      {order.quotedPrice
                        ? <span style={{ color: G.gold, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>RWF {Number(order.quotedPrice).toLocaleString()}</span>
                        : <span style={{ color: G.textMuted, fontSize: 11 }}>Not set</span>}
                    </td>
                    <td style={{ ...tdStyle, color: G.textMuted, fontSize: 11 }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => setDetailModal(order)} title="View Details"
                          style={{ background: G.goldDimmer, border: `1px solid ${G.border}`, borderRadius: 8, padding: 6, cursor: 'pointer', color: G.gold }}>
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.status === ORDER_STATUS.PENDING && (
                          <button onClick={() => { setApproveModal(order); setActionError(''); }} title="Approve"
                            style={{ background: 'rgba(34,120,80,0.1)', border: '1px solid rgba(34,120,80,0.25)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#6ee7b7' }}>
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {[ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.status) && (
                          <button onClick={() => { setStatusModal(order); setActionError(''); setNewStatus(''); }} title="Update Status"
                            style={{ background: 'rgba(201,168,76,0.1)', border: `1px solid ${G.goldDim}`, borderRadius: 8, padding: 6, cursor: 'pointer', color: G.gold }}>
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </JKCard>
      )}

      {detailModal && <OrderDetailModal order={detailModal} onClose={() => setDetailModal(null)} />}

      {approveModal && (
        <ModalShell title="Approve Order & Set Price" onClose={() => { setApproveModal(null); setActionError(''); }}>
          <p style={{ ...FONT, fontSize: 13, color: G.textMuted, marginBottom: 20 }}>
            Order <strong style={{ color: G.textPrimary }}>#{approveModal.id.substring(0,8).toUpperCase()}</strong> for {approveModal.clientFirstName} {approveModal.clientLastName}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><JKLabel>Quoted Price (RWF) *</JKLabel><JKInput type="number" value={quotedPrice} onChange={e => setQuotedPrice(e.target.value)} placeholder="e.g. 25000" /></div>
            <div><JKLabel>Message to Client (optional)</JKLabel><JKTextarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} placeholder="e.g. We'll arrive between 9–11am." /></div>
          </div>
          {actionError && <p style={{ color: '#f87171', fontSize: 12, marginTop: 10 }}>{actionError}</p>}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <OutlineBtn onClick={() => { setApproveModal(null); setActionError(''); }} disabled={actionLoading}>Cancel</OutlineBtn>
            <GradBtn onClick={handleApprove} disabled={actionLoading} style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#227850,#34d399)' }}>
              {actionLoading && <Loader className="w-4 h-4 animate-spin" />}
              Approve & Notify Client
            </GradBtn>
          </div>
        </ModalShell>
      )}

      {statusModal && (
        <ModalShell title="Update Order Status" onClose={() => { setStatusModal(null); setActionError(''); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <JKLabel>New Status</JKLabel>
              <div style={{ display: 'flex', gap: 12 }}>
                {[ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].map(s => (
                  <button key={s} onClick={() => setNewStatus(s)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: newStatus === s ? (s === 'COMPLETED' ? 'rgba(34,120,80,0.2)' : 'rgba(180,60,40,0.2)') : G.goldDimmer,
                      color: newStatus === s ? (s === 'COMPLETED' ? '#6ee7b7' : '#f87171') : G.textMuted,
                      border: `1px solid ${newStatus === s ? (s === 'COMPLETED' ? 'rgba(34,120,80,0.4)' : 'rgba(180,60,40,0.4)') : G.border}`,
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div><JKLabel>Notes (optional)</JKLabel><JKInput value={statusNotes} onChange={e => setStatusNotes(e.target.value)} placeholder="Any notes for the client..." /></div>
          </div>
          {actionError && <p style={{ color: '#f87171', fontSize: 12, marginTop: 10 }}>{actionError}</p>}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <OutlineBtn onClick={() => { setStatusModal(null); setActionError(''); }} disabled={actionLoading}>Cancel</OutlineBtn>
            <GradBtn onClick={handleStatusUpdate} disabled={actionLoading || !newStatus} style={{ flex: 1, justifyContent: 'center' }}>
              {actionLoading && <Loader className="w-4 h-4 animate-spin" />}
              Update Status
            </GradBtn>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  const G = { gold: '#C9A84C', textPrimary: '#F5E4B8', textMuted: 'rgba(168,136,72,0.75)', border: 'rgba(201,168,76,0.16)', goldDim: 'rgba(201,168,76,0.18)', goldDimmer: 'rgba(201,168,76,0.08)' };
  const c = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
  const rows = [
    ['Service',   order.service?.name ?? '—'],
    ['Product',   order.product?.name ?? '—'],
    ['Client',    `${order.clientFirstName} ${order.clientLastName}`],
    ['Email',     order.clientEmail],
    ['Phone',     order.clientPhone ?? '—'],
    ['Car',       `${order.carMake} ${order.carModel} (${order.carYear})`],
    ['Plate',     order.carPlate ?? '—'],
    ['Fuel',      order.fuelType ?? '—'],
    ['Address',   order.addressLine],
    ['City',      `${order.city}${order.district ? ', ' + order.district : ''}`],
    ['Date',      order.preferredDate ? new Date(order.preferredDate).toDateString() : 'Flexible'],
    ['Price',     order.quotedPrice ? `RWF ${Number(order.quotedPrice).toLocaleString()}` : 'Not set'],
    ['Created',   new Date(order.createdAt).toLocaleString()],
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: 'linear-gradient(160deg,#100D05,#1C1609)', border: `1px solid ${G.goldDim}`, borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${G.border}` }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: G.textPrimary }}>Order #{order.id.substring(0,8).toUpperCase()}</h3>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text, display: 'inline-block', marginTop: 4 }}>{order.status}</span>
          </div>
          <button onClick={onClose} style={{ background: G.goldDimmer, border: `1px solid ${G.border}`, borderRadius: 8, padding: 6, cursor: 'pointer', color: G.textMuted }}><X className="w-4 h-4" /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {rows.map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid rgba(201,168,76,0.07)`, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
              <span style={{ color: G.textMuted, fontWeight: 500 }}>{label}</span>
              <span style={{ color: G.textPrimary, textAlign: 'right', maxWidth: 260 }}>{val}</span>
            </div>
          ))}
          {order.adminNotes && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: G.goldDimmer, border: `1px solid ${G.goldDim}`, borderRadius: 10 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: G.gold, fontWeight: 600, marginBottom: 4 }}>Admin Notes</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: G.textPrimary }}>{order.adminNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}