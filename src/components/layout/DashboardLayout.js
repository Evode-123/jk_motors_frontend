import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut, Bell, Menu, User,
  ShoppingCart, Package, Users, LayoutDashboard, X, Wrench, BarChart2, MessageSquare, Mail
} from 'lucide-react';
import { useAuth }          from '../../context/AuthContext';
import { USER_ROLES }       from '../../utils/constants';
import { useNotifications } from '../../services/useNotifications';
import apiService           from '../../services/apiService';
import { useSessionManager } from '../../hooks/useSessionManager';
import SessionModal          from '../common/SessionModal';

const WARNING_SECONDS = 5 * 60; // must match useSessionManager WARNING_BEFORE_MS / 1000

const G = {
  gold:       '#C9A84C',
  goldLight:  '#E8C96A',
  goldDim:    'rgba(201,168,76,0.18)',
  goldDimmer: 'rgba(201,168,76,0.10)',
  goldText:   '#C9A84C',
  bg:         '#0A0804',
  surface:    '#100D05',
  surface2:   '#181308',
  surface3:   '#201A0A',
  textPrimary:'#F5E4B8',
  textMuted:  'rgba(168,136,72,0.75)',
  border:     'rgba(201,168,76,0.16)',
};

const PATH_PARENT_MAP = { '/order/new': '/services' };

function UserAvatar({ user, size = 32, fontSize = 12 }) {
  const [imgError, setImgError] = useState(false);

  const getInitials = () => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const commonStyle = {
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  if (user?.avatarUrl && !imgError) {
    return (
      <img src={user.avatarUrl} alt={getInitials()} onError={() => setImgError(true)}
        style={{ ...commonStyle, objectFit: 'cover', border: `1.5px solid ${G.goldDim}` }}
      />
    );
  }
  return (
    <div style={{
      ...commonStyle,
      background: 'linear-gradient(135deg,#8B6914,#C9A84C)',
      fontFamily: "'DM Sans', sans-serif", fontSize, fontWeight: 700, color: '#1C1609',
    }}>
      {getInitials()}
    </div>
  );
}

function SidebarAvatar({ user }) {
  const [imgError, setImgError] = useState(false);
  const getInitials = () => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };
  if (user?.avatarUrl && !imgError) {
    return (
      <img src={user.avatarUrl} alt={getInitials()} onError={() => setImgError(true)}
        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1.5px solid ${G.goldDim}` }} />
    );
  }
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: 'linear-gradient(135deg,#8B6914,#C9A84C)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#1C1609', flexShrink: 0,
    }}>
      {getInitials()}
    </div>
  );
}

const DashboardLayout = ({ children }) => {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [extending,   setExtending]   = useState(false);

  const { unreadCount } = useNotifications(user?.id);
  const [adminFeedbackUnread, setAdminFeedbackUnread] = useState(0);
  const [adminContactUnread,  setAdminContactUnread]  = useState(0);

  // ── Session management ─────────────────────────────────────────────────────
  // onExpire is called when the inactivity countdown hits 0 (not needed here
  // because the modal already shows "expired" state automatically)
  const handleExtend = useCallback(async () => {
    setExtending(true);
    try {
      await apiService.refreshSession();
    } catch {
      // refresh failed — treat as expired, log out
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setExtending(false);
    }
  }, [logout, navigate]);

  const handleLogout = useCallback(async () => {
    sessionModal.dismiss();
    await logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]); // eslint-disable-line

  const sessionModal = useSessionManager({
    isAuthenticated: !!user,
    onExtend:        handleExtend,
    onExpire:        () => {}, // modal handles it visually
  });

  // ── Notifications ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (user?.role === USER_ROLES.ADMIN) {
      apiService.adminGetFeedbackUnreadCount().then(n => setAdminFeedbackUnread(n)).catch(() => {});
    }
  }, [user]);

  React.useEffect(() => {
    if (user?.role === USER_ROLES.ADMIN) {
      apiService.adminGetContactUnreadCount().then(n => setAdminContactUnread(n)).catch(() => {});
    }
  }, [user]);

  const adminMenu = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard',        path: '/dashboard' },
    { icon: <ShoppingCart    className="w-5 h-5" />, label: 'Orders',           path: '/admin/orders' },
    { icon: <Wrench          className="w-5 h-5" />, label: 'Services',         path: '/services' },
    { icon: <Package         className="w-5 h-5" />, label: 'Service Catalog',  path: '/admin/catalog' },
    { icon: <MessageSquare   className="w-5 h-5" />, label: 'Feedback',         path: '/admin/feedback',  badge: adminFeedbackUnread },
    { icon: <Mail            className="w-5 h-5" />, label: 'Contact Messages', path: '/admin/contacts',  badge: adminContactUnread },
    { icon: <Users           className="w-5 h-5" />, label: 'Users',            path: '/admin/users' },
    { icon: <BarChart2       className="w-5 h-5" />, label: 'Analytics',        path: '/admin/analytics' },
    { icon: <Bell            className="w-5 h-5" />, label: 'Notifications',    path: '/notifications',   badge: unreadCount },
  ];

  const clientMenu = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard',     path: '/dashboard' },
    { icon: <ShoppingCart    className="w-5 h-5" />, label: 'My Orders',     path: '/my-orders' },
    { icon: <Package         className="w-5 h-5" />, label: 'Services',      path: '/services' },
    { icon: <MessageSquare   className="w-5 h-5" />, label: 'Feedback',      path: '/feedback' },
    { icon: <Bell            className="w-5 h-5" />, label: 'Notifications', path: '/notifications', badge: unreadCount },
    { icon: <User            className="w-5 h-5" />, label: 'Profile',       path: '/profile' },
  ];

  const currentMenuItems = user?.role === USER_ROLES.ADMIN ? adminMenu : clientMenu;

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName.charAt(0).toUpperCase()}.${user.lastName}`;
    return user?.email || 'User';
  };

  const handleLogoutClick = async () => {
    await logout();
    navigate('/');
  };

  const currentPath  = location.pathname;
  const resolvedPath = PATH_PARENT_MAP[currentPath] ?? currentPath;

  const isActive = (path) =>
    resolvedPath === path ||
    (path !== '/dashboard' && resolvedPath.startsWith(path));

  const LABEL_OVERRIDES = { '/order/new': 'Book a Service' };
  const activeLabel =
    LABEL_OVERRIDES[currentPath] ??
    currentMenuItems.find(m => isActive(m.path))?.label ??
    'Dashboard';

  const SidebarContent = ({ mobile = false }) => {
    const showLabels = mobile || sidebarOpen;

    return (
      <>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px', borderBottom: `1px solid ${G.border}`, minHeight: 65,
        }}>
          {showLabels && (
            <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
              <img src="/jk_logo.jpeg" alt="JK"
                style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: `1px solid ${G.goldDim}` }} />
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: G.gold, letterSpacing: '0.12em', lineHeight: 1 }}>
                  JK MOTORS
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: G.textMuted, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>
                  {user?.role?.toLowerCase()}
                </div>
              </div>
            </button>
          )}
          {mobile ? (
            <button onClick={() => setMobileOpen(false)}
              style={{ padding: 8, borderRadius: 8, background: G.goldDimmer, border: `1px solid ${G.border}`, color: G.textMuted, cursor: 'pointer' }}>
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', color: G.textMuted, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = G.goldDimmer}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentMenuItems.map((item) => {
            const active   = isActive(item.path);
            const hasBadge = item.badge > 0;

            return (
              <button key={item.path}
                onClick={() => { navigate(item.path); if (mobile) setMobileOpen(false); }}
                title={!showLabels ? item.label : undefined}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: active ? G.goldDimmer : 'transparent',
                  borderLeft: active ? `2px solid ${G.gold}` : '2px solid transparent',
                  color: active ? G.gold : G.textMuted,
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.15s',
                  position: 'relative',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(201,168,76,0.05)'; e.currentTarget.style.color = G.textPrimary; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = G.textMuted; }}}
              >
                <span style={{ flexShrink: 0, position: 'relative' }}>
                  {item.icon}
                  {hasBadge && !showLabels && (
                    <span style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: G.gold, color: '#1C1609', fontSize: 8, fontWeight: 700 }}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </span>
                {showLabels && (
                  <>
                    <span style={{ fontSize: 14, fontWeight: active ? 500 : 400 }}>{item.label}</span>
                    {hasBadge && (
                      <span style={{ marginLeft: 'auto', background: G.gold, color: '#1C1609', borderRadius: 20, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px', borderTop: `1px solid ${G.border}` }}>
          <button onClick={handleLogoutClick}
            title={!showLabels ? 'Logout' : undefined}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'transparent', color: G.textMuted,
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(180,60,40,0.1)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = G.textMuted; }}>
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {showLabels && <span style={{ fontSize: 14 }}>Logout</span>}
          </button>
        </div>
      </>
    );
  };

  const sidebarBg     = `linear-gradient(180deg, ${G.surface} 0%, ${G.surface2} 100%)`;
  const sidebarBorder = `1px solid ${G.border}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=Orbitron:wght@700;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .jk-scrollbar::-webkit-scrollbar { width: 4px; }
        .jk-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .jk-scrollbar::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.25); border-radius: 2px; }
        .jk-input { background: rgba(20,16,8,0.8) !important; border: 1px solid rgba(201,168,76,0.22) !important; color: #E8D5A0 !important; border-radius: 12px !important; }
        .jk-input:focus { border-color: rgba(201,168,76,0.5) !important; outline: none !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.08) !important; }
        .jk-input::placeholder { color: rgba(168,136,72,0.45) !important; }
        .jk-select { background: rgba(20,16,8,0.8) !important; border: 1px solid rgba(201,168,76,0.22) !important; color: #E8D5A0 !important; border-radius: 12px !important; appearance: none; }
        .jk-select option { background: #1C1609 !important; color: #E8D5A0 !important; }
        .jk-table-row:hover { background: rgba(201,168,76,0.04) !important; }
        .jk-btn-primary { background: linear-gradient(135deg,#8B6914,#C9A84C) !important; color: #1C1609 !important; border: none !important; }
        .jk-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .jk-btn-danger { background: rgba(180,60,40,0.1) !important; color: #f87171 !important; border: 1px solid rgba(180,60,40,0.25) !important; }
        .jk-btn-danger:hover { background: rgba(180,60,40,0.2) !important; }
        .jk-card { background: rgba(28,22,9,0.6) !important; border: 1px solid rgba(201,168,76,0.16) !important; border-radius: 16px !important; }
        .jk-modal { background: linear-gradient(160deg,#100D05,#1C1609) !important; border: 1px solid rgba(201,168,76,0.22) !important; border-radius: 20px !important; }
        @keyframes jk-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="flex h-screen" style={{ background: G.bg, fontFamily: "'DM Sans', sans-serif" }}>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={() => setMobileOpen(false)} />
        )}

        {/* Mobile sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col md:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ background: sidebarBg, borderRight: sidebarBorder }}>
          <SidebarContent mobile />
        </div>

        {/* Desktop sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-[68px]'} hidden md:flex flex-col flex-shrink-0 transition-all duration-300`}
          style={{ background: sidebarBg, borderRight: sidebarBorder }}>
          <SidebarContent />
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top bar */}
          <header style={{
            background: `rgba(10,8,4,0.85)`,
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${G.border}`,
            padding: '0 24px', height: 65,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="md:hidden" style={{ padding: 8, borderRadius: 8, background: 'none', border: 'none', color: G.textMuted, cursor: 'pointer' }}
                onClick={() => setMobileOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: G.textPrimary }}>
                  {activeLabel}
                </div>
                <div style={{ fontSize: 11, color: G.gold, letterSpacing: '0.05em' }}>JK Motors</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user?.role === USER_ROLES.CLIENT && (
                <button onClick={() => navigate('/order/new')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: 'linear-gradient(135deg,#8B6914,#C9A84C)',
                    border: 'none', color: '#1C1609',
                    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(201,168,76,0.2)',
                  }}>
                  <ShoppingCart className="w-3.5 h-3.5" /> New Order
                </button>
              )}

              <button onClick={() => navigate('/notifications')}
                style={{
                  position: 'relative', padding: 8, borderRadius: 8, cursor: 'pointer',
                  background: G.goldDimmer, border: `1px solid ${G.border}`, color: G.textMuted,
                }}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2, width: 14, height: 14,
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: G.gold, color: '#1C1609', fontSize: 8, fontWeight: 700,
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, cursor: 'pointer',
                borderLeft: `1px solid ${G.border}`,
              }}
                onClick={() => navigate('/profile')} title="Go to Profile">
                <UserAvatar user={user} size={32} fontSize={12} />
                <div className="text-right hidden sm:block">
                  <p style={{ fontSize: 12, fontWeight: 500, color: G.textPrimary }}>{getDisplayName()}</p>
                  <p style={{ fontSize: 10, color: G.gold, textTransform: 'capitalize' }}>{user?.role?.toLowerCase()}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto jk-scrollbar" style={{ background: G.bg }}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
              backgroundImage: 'linear-gradient(rgba(201,168,76,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.02) 1px,transparent 1px)',
              backgroundSize: '50px 50px',
            }} />
            <div style={{ position: 'relative', zIndex: 1, padding: 24, minHeight: '100%' }}>
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* ── Session timeout modal — rendered outside the layout flow so it's always on top ── */}
      <SessionModal
        phase={sessionModal.phase}
        countdown={sessionModal.countdown}
        maxCountdown={WARNING_SECONDS}
        onExtend={sessionModal.extend}
        onLogout={async () => {
          sessionModal.dismiss();
          await logout();
          navigate('/login', { replace: true });
        }}
        extending={extending}
      />
    </>
  );
};

export default DashboardLayout;