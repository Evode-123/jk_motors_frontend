import React, { useState, useEffect } from 'react';
import { Eye, Check, X, RefreshCw, Filter, Loader, ChevronDown } from 'lucide-react';
import apiService from '../../services/apiService';
import { ORDER_STATUS, STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';

// ── Shared JK theme primitives ────────────────────────────────────────────────

const T = {
  heading:  { fontFamily: "'Orbitron', sans-serif", color: '#e2e8f0' },
  body:     { fontFamily: "'Space Grotesk', sans-serif", color: '#e2e8f0' },
  muted:    { fontFamily: "'Space Grotesk', sans-serif", color: '#64748b' },
  label:    { fontFamily: "'Space Grotesk', sans-serif", color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' },
  sky:      { fontFamily: "'Space Grotesk', sans-serif", color: '#38bdf8' },
};

const JKCard = ({ children, style = {} }) => (
  <div style={{ background: 'rgba(30,61,110,0.4)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 16, overflow: 'hidden', ...style }}>
    {children}
  </div>
);

const JKInput = ({ style = {}, ...props }) => (
  <input {...props} style={{
    background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)',
    color: '#e2e8f0', borderRadius: 12, padding: '10px 16px', fontSize: 14, width: '100%',
    fontFamily: "'Space Grotesk', sans-serif", outline: 'none', ...style,
  }} />
);

const JKTextarea = ({ style = {}, ...props }) => (
  <textarea {...props} style={{
    background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)',
    color: '#e2e8f0', borderRadius: 12, padding: '10px 16px', fontSize: 14, width: '100%',
    fontFamily: "'Space Grotesk', sans-serif", outline: 'none', resize: 'none', ...style,
  }} />
);

const JKLabel = ({ children }) => (
  <label style={{ ...T.label, display: 'block', marginBottom: 6 }}>{children}</label>
);

const GradBtn = ({ children, onClick, disabled, style = {}, className = '' }) => (
  <button onClick={onClick} disabled={disabled} className={className}
    style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Space Grotesk', sans-serif", ...style }}>
    {children}
  </button>
);

const OutlineBtn = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontFamily: "'Space Grotesk', sans-serif" }}>
    {children}
  </button>
);

const StatusPill = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>{status}</span>;
};

// ── Modal Shell ───────────────────────────────────────────────────────────────

const ModalShell = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
    <div style={{ background: 'linear-gradient(160deg,#0F2644,#1E3D6E)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(14,165,233,0.15)' }}>
        <h3 style={{ ...T.heading, fontSize: 16, fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#94a3b8' }}><X className="w-4 h-4" /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>{children}</div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

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

  const thStyle = { ...T.label, padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid rgba(14,165,233,0.1)' };
  const tdStyle = { ...T.body, padding: '12px 16px', fontSize: 13, borderBottom: '1px solid rgba(14,165,233,0.06)' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ ...T.heading, fontSize: 22, fontWeight: 900 }}>Order Management</h1>
          <p style={{ ...T.muted, fontSize: 13, marginTop: 4 }}>Review, approve and manage all service orders</p>
        </div>
        <button onClick={load} style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#94a3b8' }}>
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {success && (
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
          <span style={{ ...T.body, fontSize: 13 }}>{success}</span>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6ee7b7' }}><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', ...T.body, fontSize: 13 }}>{error}</div>}

      {/* Filters */}
      <JKCard style={{ padding: 16 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4" style={{ color: '#64748b' }} />
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: filter === s ? 'linear-gradient(135deg,#0EA5E9,#6366F1)' : 'rgba(14,165,233,0.06)',
                color: filter === s ? '#fff' : '#94a3b8',
                border: filter === s ? 'none' : '1px solid rgba(14,165,233,0.15)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
              {s === 'ALL' ? 'All Orders' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <p style={{ ...T.muted, fontSize: 12, marginTop: 10 }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </JKCard>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(14,165,233,0.2)', borderTopColor: '#0EA5E9' }} />
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
                  <tr><td colSpan="7" style={{ ...T.muted, textAlign: 'center', padding: '48px 0', fontSize: 13 }}>No orders found</td></tr>
                ) : orders.map(order => (
                  <tr key={order.id}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>#{order.id.substring(0,8).toUpperCase()}</span>
                    </td>
                    <td style={tdStyle}>
                      <p style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{order.clientFirstName} {order.clientLastName}</p>
                      <p style={{ fontSize: 11, color: '#64748b' }}>{order.clientEmail}</p>
                    </td>
                    <td style={tdStyle}>
                      <p style={{ color: '#e2e8f0' }}>{order.service?.name ?? '—'}</p>
                      {order.product && <p style={{ fontSize: 11, color: '#64748b' }}>→ {order.product.name}</p>}
                    </td>
                    <td style={tdStyle}><StatusPill status={order.status} /></td>
                    <td style={tdStyle}>
                      {order.quotedPrice
                        ? <span style={{ color: '#38bdf8', fontWeight: 700 }}>RWF {Number(order.quotedPrice).toLocaleString()}</span>
                        : <span style={{ color: '#475569', fontSize: 11 }}>Not set</span>
                      }
                    </td>
                    <td style={{ ...tdStyle, color: '#64748b', fontSize: 11 }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setDetailModal(order)} title="View Details"
                          style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#38bdf8' }}>
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.status === ORDER_STATUS.PENDING && (
                          <button onClick={() => { setApproveModal(order); setActionError(''); }} title="Approve"
                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#6ee7b7' }}>
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {[ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.status) && (
                          <button onClick={() => { setStatusModal(order); setActionError(''); setNewStatus(''); }} title="Update Status"
                            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#fcd34d' }}>
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

      {/* Detail Modal */}
      {detailModal && <OrderDetailModal order={detailModal} onClose={() => setDetailModal(null)} />}

      {/* Approve Modal */}
      {approveModal && (
        <ModalShell title="Approve Order & Set Price" onClose={() => { setApproveModal(null); setActionError(''); }}>
          <p style={{ ...T.muted, fontSize: 13, marginBottom: 20 }}>
            Order <strong style={{ color: '#e2e8f0' }}>#{approveModal.id.substring(0,8).toUpperCase()}</strong> for {approveModal.clientFirstName} {approveModal.clientLastName}
          </p>
          <div className="space-y-4">
            <div><JKLabel>Quoted Price (RWF) *</JKLabel><JKInput type="number" value={quotedPrice} onChange={e => setQuotedPrice(e.target.value)} placeholder="e.g. 25000" /></div>
            <div><JKLabel>Message to Client (optional)</JKLabel><JKTextarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} placeholder="e.g. We'll arrive between 9–11am." /></div>
          </div>
          {actionError && <p style={{ color: '#f87171', fontSize: 12, marginTop: 10 }}>{actionError}</p>}
          <div className="flex gap-3 mt-5">
            <OutlineBtn onClick={() => { setApproveModal(null); setActionError(''); }} disabled={actionLoading}>Cancel</OutlineBtn>
            <GradBtn onClick={handleApprove} disabled={actionLoading} style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              {actionLoading && <Loader className="w-4 h-4 animate-spin" />}
              Approve & Notify Client
            </GradBtn>
          </div>
        </ModalShell>
      )}

      {/* Status Modal */}
      {statusModal && (
        <ModalShell title="Update Order Status" onClose={() => { setStatusModal(null); setActionError(''); }}>
          <div className="space-y-4">
            <div>
              <JKLabel>New Status</JKLabel>
              <div className="flex gap-3">
                {[ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].map(s => (
                  <button key={s} onClick={() => setNewStatus(s)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      background: newStatus === s ? (s === 'COMPLETED' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : 'rgba(14,165,233,0.05)',
                      color: newStatus === s ? (s === 'COMPLETED' ? '#6ee7b7' : '#f87171') : '#94a3b8',
                      border: `1px solid ${newStatus === s ? (s === 'COMPLETED' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)') : 'rgba(14,165,233,0.15)'}`,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div><JKLabel>Notes (optional)</JKLabel><JKInput value={statusNotes} onChange={e => setStatusNotes(e.target.value)} placeholder="Any notes for the client..." /></div>
          </div>
          {actionError && <p style={{ color: '#f87171', fontSize: 12, marginTop: 10 }}>{actionError}</p>}
          <div className="flex gap-3 mt-5">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: 'linear-gradient(160deg,#0F2644,#1E3D6E)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(14,165,233,0.15)' }}>
          <div>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Order #{order.id.substring(0,8).toUpperCase()}</h3>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text, display: 'inline-block', marginTop: 4 }}>{order.status}</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#94a3b8' }}><X className="w-4 h-4" /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {rows.map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(14,165,233,0.06)', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>{label}</span>
              <span style={{ color: '#e2e8f0', textAlign: 'right', maxWidth: 260 }}>{val}</span>
            </div>
          ))}
          {order.adminNotes && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 10 }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#38bdf8', fontWeight: 600, marginBottom: 4 }}>Admin Notes</p>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#bae6fd' }}>{order.adminNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}