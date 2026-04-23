import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Users, LayoutDashboard, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES, ORDER_STATUS, STATUS_COLORS } from '../../utils/constants';
import apiService from '../../services/apiService';

const G = {
  gold:        '#C9A84C',
  goldLight:   '#E8C96A',
  goldDim:     'rgba(201,168,76,0.18)',
  goldDimmer:  'rgba(201,168,76,0.10)',
  bg:          '#0A0804',
  surface:     '#100D05',
  surface2:    '#181308',
  textPrimary: '#F5E4B8',
  textMuted:   'rgba(168,136,72,0.75)',
  border:      'rgba(201,168,76,0.16)',
};

const CARD = {
  background:   'rgba(28,22,9,0.6)',
  border:       '1px solid rgba(201,168,76,0.16)',
  borderRadius: 16,
  padding:      20,
};

const FONT  = { fontFamily: "'DM Sans', sans-serif" };
const SERIF = { fontFamily: "'Playfair Display', serif" };
const LABEL = { ...FONT, fontSize: 11, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 };

const JKCard = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{ ...CARD, ...style, ...(onClick ? { cursor: 'pointer' } : {}) }}>
    {children}
  </div>
);

const StatusPill = ({ status }) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {status}
    </span>
  );
};

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

  const handleNewOrder = () => {
    if (!loading && orders.length === 0) navigate('/services');
    else navigate('/order/new');
  };

  const Spinner = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${G.goldDim}`, borderTopColor: G.gold, animation: 'jk-spin 0.8s linear infinite' }} />
    </div>
  );

  if (isAdmin) {
    const stats = [
      { label: 'Total Orders',    value: orders.length,                         icon: <ShoppingCart className="w-5 h-5" />, color: G.gold },
      { label: 'Pending Review',  value: countByStatus(ORDER_STATUS.PENDING),   icon: <Clock className="w-5 h-5" />,        color: '#E8C96A' },
      { label: 'Awaiting Client', value: countByStatus(ORDER_STATUS.APPROVED),  icon: <AlertCircle className="w-5 h-5" />,  color: '#C9A84C' },
      { label: 'Completed',       value: countByStatus(ORDER_STATUS.COMPLETED), icon: <CheckCircle className="w-5 h-5" />,  color: '#6ee7b7' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <style>{`@keyframes jk-spin { to { transform: rotate(360deg); } }`}</style>
        <div>
          <h1 style={{ ...SERIF, fontSize: 24, fontWeight: 700, color: G.textPrimary, marginBottom: 4 }}>
            {getGreeting()}, {displayName} 👋
          </h1>
          <p style={{ ...FONT, fontSize: 13, color: G.textMuted }}>Here's what's happening with JK Motors today.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }}>
          {stats.map((s, i) => (
            <JKCard key={i} onClick={() => navigate('/admin/orders')}
              style={{ transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = G.goldDim}
              onMouseLeave={e => e.currentTarget.style.borderColor = G.border}>
              <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30`, marginBottom: 12 }}>
                {s.icon}
              </div>
              <div style={{ ...SERIF, fontSize: 28, fontWeight: 700, color: G.textPrimary }}>{loading ? '—' : s.value}</div>
              <div style={LABEL}>{s.label}</div>
            </JKCard>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
          {[
            { label: 'Manage Orders',   icon: <ShoppingCart className="w-5 h-5" />, path: '/admin/orders',  color: G.gold },
            { label: 'Service Catalog', icon: <Package      className="w-5 h-5" />, path: '/admin/catalog', color: '#E8C96A' },
            { label: 'Manage Users',    icon: <Users        className="w-5 h-5" />, path: '/admin/users',   color: '#A07830' },
          ].map(a => (
            <JKCard key={a.path} onClick={() => navigate(a.path)} style={{ display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = G.goldDim}
              onMouseLeave={e => e.currentTarget.style.borderColor = G.border}>
              <div style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C1609', flexShrink: 0, background: `linear-gradient(135deg,${a.color}cc,${a.color})` }}>
                {a.icon}
              </div>
              <span style={{ ...FONT, fontSize: 14, fontWeight: 500, color: G.textPrimary }}>{a.label}</span>
            </JKCard>
          ))}
        </div>

        {/* Recent orders */}
        <JKCard style={{ padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${G.border}` }}>
            <h3 style={{ ...FONT, fontSize: 14, fontWeight: 600, color: G.textPrimary }}>Recent Orders</h3>
            <button onClick={() => navigate('/admin/orders')}
              style={{ ...FONT, fontSize: 12, color: G.gold, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
          </div>
          {loading ? <Spinner /> : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', ...FONT, color: G.textMuted, fontSize: 13 }}>No orders yet</div>
          ) : (
            <div>
              {orders.slice(0, 5).map(order => (
                <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid rgba(201,168,76,0.07)`, transition: 'background 0.15s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = G.goldDimmer}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div>
                    <p style={{ ...FONT, fontSize: 13, fontWeight: 500, color: G.textPrimary }}>{order.clientFirstName} {order.clientLastName}</p>
                    <p style={{ ...FONT, fontSize: 11, color: G.textMuted }}>{order.service?.name ?? 'Service Request'}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <StatusPill status={order.status} />
                    <button onClick={() => navigate('/admin/orders')} style={{ ...FONT, fontSize: 12, color: G.gold, background: 'none', border: 'none', cursor: 'pointer' }}>View</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </JKCard>
      </div>
    );
  }

  // CLIENT
  const pendingAction = orders.filter(o => o.status === ORDER_STATUS.APPROVED);
  const isFirstTimeUser = !loading && orders.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes jk-spin { to { transform: rotate(360deg); } }`}</style>

      <div>
        <h1 style={{ ...SERIF, fontSize: 24, fontWeight: 700, color: G.textPrimary, marginBottom: 4 }}>
          {getGreeting()}, {displayName} 👋
        </h1>
        <p style={{ ...FONT, fontSize: 13, color: G.textMuted }}>Welcome to your JK Motors dashboard.</p>
      </div>

      {pendingAction.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderRadius: 12, background: 'rgba(201,168,76,0.08)', border: `1px solid rgba(201,168,76,0.3)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: G.gold }} />
            <p style={{ ...FONT, fontSize: 13, fontWeight: 500, color: G.textPrimary }}>
              You have {pendingAction.length} order{pendingAction.length > 1 ? 's' : ''} waiting for your response!
            </p>
          </div>
          <button onClick={() => navigate('/my-orders')}
            style={{ padding: '6px 16px', borderRadius: 8, background: 'linear-gradient(135deg,#8B6914,#C9A84C)', border: 'none', color: '#1C1609', ...FONT, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Review Now
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 14 }}>
        {[
          { label: 'Total Orders', value: orders.length,                          color: G.gold,      icon: <ShoppingCart className="w-5 h-5" /> },
          { label: 'Pending',      value: countByStatus(ORDER_STATUS.PENDING),    color: '#E8C96A',   icon: <Clock className="w-5 h-5" /> },
          { label: 'Confirmed',    value: countByStatus(ORDER_STATUS.CONFIRMED),  color: '#6ee7b7',   icon: <CheckCircle className="w-5 h-5" /> },
          { label: 'Completed',    value: countByStatus(ORDER_STATUS.COMPLETED),  color: '#A07830',   icon: <CheckCircle className="w-5 h-5" /> },
        ].map((s, i) => (
          <JKCard key={i}>
            <div style={{ width: 38, height: 38, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30`, marginBottom: 12 }}>
              {s.icon}
            </div>
            <div style={{ ...SERIF, fontSize: 26, fontWeight: 700, color: G.textPrimary }}>{loading ? '—' : s.value}</div>
            <div style={LABEL}>{s.label}</div>
          </JKCard>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <button onClick={handleNewOrder} style={{
          borderRadius: 16, padding: 20, textAlign: 'left', color: '#1C1609',
          background: 'linear-gradient(135deg,#6B5010,#C9A84C,#8B6914)',
          border: `1px solid rgba(201,168,76,0.4)`,
          boxShadow: '0 8px 32px rgba(201,168,76,0.15)', cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <ShoppingCart className="w-7 h-7 mb-3" style={{ color: '#1C1609', opacity: 0.85 }} />
          <p style={{ ...SERIF, fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#1C1609' }}>
            {isFirstTimeUser ? 'Browse Services' : 'Book a Service'}
          </p>
          <p style={{ ...FONT, fontSize: 12, color: 'rgba(28,22,9,0.75)' }}>
            {isFirstTimeUser ? 'Explore our services and place your first order.' : "We'll come to you — browse and order now."}
          </p>
        </button>

        <JKCard onClick={() => navigate('/my-orders')} style={{ transition: 'border-color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = G.goldDim}
          onMouseLeave={e => e.currentTarget.style.borderColor = G.border}>
          <Package className="w-7 h-7 mb-3" style={{ color: G.gold }} />
          <p style={{ ...SERIF, fontSize: 15, fontWeight: 700, color: G.textPrimary, marginBottom: 4 }}>My Orders</p>
          <p style={{ ...FONT, fontSize: 12, color: G.textMuted }}>Track the status of your service requests.</p>
        </JKCard>
      </div>

      <JKCard style={{ padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${G.border}` }}>
          <h3 style={{ ...FONT, fontSize: 14, fontWeight: 600, color: G.textPrimary }}>Recent Orders</h3>
          <button onClick={() => navigate('/my-orders')} style={{ ...FONT, fontSize: 12, color: G.gold, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${G.goldDim}`, borderTopColor: G.gold, animation: 'jk-spin 0.8s linear infinite' }} />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <ShoppingCart className="w-10 h-10 mx-auto mb-3" style={{ color: G.goldDim }} />
            <p style={{ ...FONT, fontSize: 13, color: G.textMuted, marginBottom: 12 }}>No orders yet</p>
            <button onClick={() => navigate('/services')}
              style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#8B6914,#C9A84C)', border: 'none', color: '#1C1609', ...FONT, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Browse Services
            </button>
          </div>
        ) : (
          <div>
            {orders.slice(0, 4).map(order => (
              <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid rgba(201,168,76,0.07)`, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = G.goldDimmer}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <p style={{ ...FONT, fontSize: 13, fontWeight: 500, color: G.textPrimary }}>{order.service?.name ?? 'Service Request'}</p>
                  <p style={{ ...FONT, fontSize: 11, color: G.textMuted }}>{order.carMake} {order.carModel} · {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {order.quotedPrice && (
                    <span style={{ ...SERIF, fontSize: 14, fontWeight: 700, color: G.gold }}>RWF {Number(order.quotedPrice).toLocaleString()}</span>
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