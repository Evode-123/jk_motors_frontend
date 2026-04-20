import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Bell, Users, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES, ORDER_STATUS, STATUS_COLORS } from '../../utils/constants';
import apiService from '../../services/apiService';

// ── Shared JK-themed sub-components ──────────────────────────────────────────

const JKCard = ({ children, className = '', style = {}, onClick }) => (
  <div
    onClick={onClick}
    className={className}
    style={{
      background: 'rgba(30,61,110,0.4)',
      border: '1px solid rgba(14,165,233,0.15)',
      borderRadius: 16,
      ...style,
      ...(onClick ? { cursor: 'pointer' } : {}),
    }}
  >
    {children}
  </div>
);

const StatusPill = ({ status }) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
    }}>
      {status}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function DashboardContent() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const isAdmin   = user?.role === USER_ROLES.ADMIN;
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = isAdmin
          ? await apiService.adminGetOrders()
          : await apiService.getMyOrders();
        setOrders(data || []);
      } catch {} finally { setLoading(false); }
    })();
  }, [isAdmin]);

  const countByStatus = (s) => orders.filter(o => o.status === s).length;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'there';

  // ── Smart navigation: first-time users (no orders) go to /services ─────────
  // Users with existing orders can go directly to /order/new
  const handleNewOrder = () => {
    if (!loading && orders.length === 0) {
      navigate('/services');
    } else {
      navigate('/order/new');
    }
  };

  const headingStyle = { fontFamily: "'Orbitron', sans-serif", color: '#e2e8f0' };
  const subStyle = { fontFamily: "'Space Grotesk', sans-serif", color: '#64748b', fontSize: 13 };
  const labelStyle = { fontFamily: "'Space Grotesk', sans-serif", color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' };

  // ── ADMIN ────────────────────────────────────────────────────────────────

  if (isAdmin) {
    const stats = [
      { label: 'Total Orders',    value: orders.length,                         icon: <ShoppingCart className="w-5 h-5" />, color: '#0EA5E9', click: () => navigate('/admin/orders') },
      { label: 'Pending Review',  value: countByStatus(ORDER_STATUS.PENDING),   icon: <Clock className="w-5 h-5" />,        color: '#f59e0b', click: () => navigate('/admin/orders') },
      { label: 'Awaiting Client', value: countByStatus(ORDER_STATUS.APPROVED),  icon: <AlertCircle className="w-5 h-5" />,  color: '#6366F1', click: () => navigate('/admin/orders') },
      { label: 'Completed',       value: countByStatus(ORDER_STATUS.COMPLETED), icon: <CheckCircle className="w-5 h-5" />,  color: '#10b981', click: () => navigate('/admin/orders') },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 style={{ ...headingStyle, fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
            {getGreeting()}, {displayName} 👋
          </h1>
          <p style={subStyle}>Here's what's happening with JK Motors today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <JKCard key={i} onClick={s.click} style={{ padding: 20, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(14,165,233,0.35)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(14,165,233,0.15)'}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30` }}>
                  {s.icon}
                </div>
                <TrendingUp className="w-4 h-4" style={{ color: '#1e3d6e' }} />
              </div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, fontWeight: 900, color: '#e2e8f0' }}>
                {loading ? '—' : s.value}
              </div>
              <div style={labelStyle}>{s.label}</div>
            </JKCard>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Manage Orders',   icon: <ShoppingCart className="w-5 h-5" />, path: '/admin/orders',  color: '#0EA5E9' },
            { label: 'Service Catalog', icon: <Package      className="w-5 h-5" />, path: '/admin/catalog', color: '#6366F1' },
            { label: 'Manage Users',    icon: <Users        className="w-5 h-5" />, path: '/admin/users',   color: '#10b981' },
          ].map(a => (
            <JKCard key={a.path} onClick={() => navigate(a.path)}
              style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.2s' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg,${a.color},${a.color}99)`, boxShadow: `0 4px 14px ${a.color}30` }}>
                {a.icon}
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                {a.label}
              </span>
            </JKCard>
          ))}
        </div>

        {/* Recent orders */}
        <JKCard>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(14,165,233,0.1)' }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Recent Orders</h3>
            <button onClick={() => navigate('/admin/orders')}
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer' }}>
              View all →
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(14,165,233,0.2)', borderTopColor: '#0EA5E9' }} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#475569', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>No orders yet</div>
          ) : (
            <div>
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3"
                  style={{ borderBottom: '1px solid rgba(14,165,233,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                      {order.clientFirstName} {order.clientLastName}
                    </p>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#64748b' }}>
                      {order.service?.name ?? 'Service Request'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill status={order.status} />
                    <button onClick={() => navigate('/admin/orders')}
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer' }}>
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </JKCard>
      </div>
    );
  }

  // ── CLIENT ───────────────────────────────────────────────────────────────

  const pendingAction = orders.filter(o => o.status === ORDER_STATUS.APPROVED);

  // First-time user has no orders yet
  const isFirstTimeUser = !loading && orders.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ ...headingStyle, fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
          {getGreeting()}, {displayName} 👋
        </h1>
        <p style={subStyle}>Welcome to your JK Motors dashboard.</p>
      </div>

      {pendingAction.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#818cf8' }} />
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: '#c7d2fe' }}>
              You have {pendingAction.length} order{pendingAction.length > 1 ? 's' : ''} waiting for your response!
            </p>
          </div>
          <button onClick={() => navigate('/my-orders')}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', border: 'none', cursor: 'pointer' }}>
            Review Now
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length,                          color: '#0EA5E9', icon: <ShoppingCart className="w-5 h-5" /> },
          { label: 'Pending',      value: countByStatus(ORDER_STATUS.PENDING),    color: '#f59e0b', icon: <Clock className="w-5 h-5" /> },
          { label: 'Confirmed',    value: countByStatus(ORDER_STATUS.CONFIRMED),  color: '#10b981', icon: <CheckCircle className="w-5 h-5" /> },
          { label: 'Completed',    value: countByStatus(ORDER_STATUS.COMPLETED),  color: '#6366F1', icon: <CheckCircle className="w-5 h-5" /> },
        ].map((s, i) => (
          <JKCard key={i} style={{ padding: 20 }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30` }}>
              {s.icon}
            </div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, fontWeight: 900, color: '#e2e8f0' }}>
              {loading ? '—' : s.value}
            </div>
            <div style={labelStyle}>{s.label}</div>
          </JKCard>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Book a Service — goes to /services for first-timers, /order/new for returning users */}
        <button
          onClick={handleNewOrder}
          className="rounded-xl p-5 text-left text-white transition-transform hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg,#0F3460,#0EA5E9,#6366F1)',
            border: '1px solid rgba(14,165,233,0.3)',
            boxShadow: '0 8px 32px rgba(14,165,233,0.2)',
            cursor: 'pointer',
          }}
        >
          <ShoppingCart className="w-7 h-7 mb-3 opacity-90" style={{ color: '#bae6fd' }} />
          <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
            {isFirstTimeUser ? 'Browse Services' : 'Book a Service'}
          </p>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#bae6fd' }}>
            {isFirstTimeUser
              ? 'Explore our services and place your first order.'
              : 'We\'ll come to you — browse and order now.'}
          </p>
        </button>

        <JKCard onClick={() => navigate('/my-orders')}
          style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s' }}>
          <Package className="w-7 h-7 mb-3" style={{ color: '#0EA5E9' }} />
          <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>My Orders</p>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#64748b' }}>Track the status of your service requests.</p>
        </JKCard>
      </div>

      <JKCard>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(14,165,233,0.1)' }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Recent Orders</h3>
          <button onClick={() => navigate('/my-orders')}
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer' }}>
            View all →
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(14,165,233,0.2)', borderTopColor: '#0EA5E9' }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3" style={{ color: '#1e3d6e' }} />
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#475569', marginBottom: 12 }}>No orders yet</p>
            {/* First-time user: Browse Services instead of direct order form */}
            <button
              onClick={() => navigate('/services')}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', border: 'none', cursor: 'pointer' }}>
              Browse Services
            </button>
          </div>
        ) : (
          <div>
            {orders.slice(0, 4).map(order => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: '1px solid rgba(14,165,233,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                    {order.service?.name ?? 'Service Request'}
                  </p>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#64748b' }}>
                    {order.carMake} {order.carModel} · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {order.quotedPrice && (
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>
                      RWF {Number(order.quotedPrice).toLocaleString()}
                    </span>
                  )}
                  <StatusPill status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </JKCard>
    </div>
  );
}