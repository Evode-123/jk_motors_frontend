import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut, Bell, Menu, User,
  ShoppingCart, Package, Users, LayoutDashboard, X, Wrench, BarChart2, MessageSquare
} from 'lucide-react';
import { useAuth }          from '../../context/AuthContext';
import { USER_ROLES }       from '../../utils/constants';
import { useNotifications } from '../../services/useNotifications';
import apiService           from '../../services/apiService';

const PATH_PARENT_MAP = {
  '/order/new': '/services',
};

/* ── UserAvatar ─────────────────────────────────────────────────────────────── */
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
        style={{ ...commonStyle, objectFit: 'cover', border: '1.5px solid rgba(14,165,233,0.35)' }}
      />
    );
  }
  return (
    <div style={{ ...commonStyle, background: 'linear-gradient(135deg,#0EA5E9,#6366F1)',
      fontFamily: "'Space Grotesk', sans-serif", fontSize, fontWeight: 700, color: '#fff' }}>
      {getInitials()}
    </div>
  );
}

/* ── SidebarAvatar ─────────────────────────────────────────────────────────── */
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
        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
          border: '1.5px solid rgba(14,165,233,0.35)' }}
      />
    );
  }
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%',
      background: 'linear-gradient(135deg,#0EA5E9,#6366F1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {getInitials()}
    </div>
  );
}

/* ── DashboardLayout ────────────────────────────────────────────────────────── */
const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const { unreadCount } = useNotifications(user?.id);

  // ── FIX: declare BEFORE adminMenu so it's available when the array is built ──
  const [adminFeedbackUnread, setAdminFeedbackUnread] = useState(0);

  useEffect(() => {
    if (user?.role === USER_ROLES.ADMIN) {
      apiService.adminGetFeedbackUnreadCount()
        .then(n => setAdminFeedbackUnread(n))
        .catch(() => {});
    }
  }, [user]);
  // ────────────────────────────────────────────────────────────────────────────

  const adminMenu = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard',       path: '/dashboard' },
    { icon: <ShoppingCart    className="w-5 h-5" />, label: 'Orders',          path: '/admin/orders' },
    { icon: <Wrench          className="w-5 h-5" />, label: 'Services',        path: '/services' },
    { icon: <Package         className="w-5 h-5" />, label: 'Service Catalog', path: '/admin/catalog' },
    { icon: <MessageSquare   className="w-5 h-5" />, label: 'Feedback',        path: '/admin/feedback', badge: adminFeedbackUnread },
    { icon: <Users           className="w-5 h-5" />, label: 'Users',           path: '/admin/users' },
    { icon: <BarChart2       className="w-5 h-5" />, label: 'Analytics',       path: '/admin/analytics' },
    { icon: <Bell            className="w-5 h-5" />, label: 'Notifications',   path: '/notifications', badge: unreadCount },
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

  const handleLogout = async () => {
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
        <div className="flex items-center justify-between px-4 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(14,165,233,0.15)', minHeight: 65 }}>
          {showLabels && (
            <button onClick={() => navigate('/')} className="flex items-center gap-2.5 text-left">
              <img src="/jk_logo.jpeg" alt="JK" className="w-8 h-8 rounded-lg object-cover"
                style={{ border: '1px solid rgba(14,165,233,0.3)', boxShadow: '0 0 12px rgba(14,165,233,0.2)' }} />
              <div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 900,
                  color: '#f97316', letterSpacing: '0.15em', lineHeight: 1 }}>JK MOTORS</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: '#38bdf8',
                  letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>
                  {user?.role?.toLowerCase()}
                </div>
              </div>
            </button>
          )}
          {mobile ? (
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg"
              style={{ background: 'rgba(14,165,233,0.08)', color: '#94a3b8' }}>
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg transition-colors"
              style={{ color: '#94a3b8' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {currentMenuItems.map((item) => {
            const active   = isActive(item.path);
            const hasBadge = item.badge > 0;

            return (
              <button key={item.path}
                onClick={() => { navigate(item.path); if (mobile) setMobileOpen(false); }}
                title={!showLabels ? item.label : undefined}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left relative"
                style={{
                  background: active ? 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(99,102,241,0.15))' : 'transparent',
                  border: active ? '1px solid rgba(14,165,233,0.3)' : '1px solid transparent',
                  color: active ? '#38bdf8' : '#94a3b8',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(14,165,233,0.06)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span className="flex-shrink-0 relative">
                  {item.icon}
                  {hasBadge && !showLabels && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                      style={{ background: '#ef4444', fontSize: 9, fontWeight: 700 }}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </span>
                {showLabels && (
                  <>
                    <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{item.label}</span>
                    {hasBadge && (
                      <span className="ml-auto text-white rounded-full px-1.5 py-0.5"
                        style={{ background: '#ef4444', fontSize: 10, fontWeight: 700 }}>
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
        <div className="px-3 pb-4 pt-3 space-y-1 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(14,165,233,0.15)' }}>
          <button onClick={handleLogout}
            title={!showLabels ? 'Logout' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            style={{ color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {showLabels && <span style={{ fontSize: 14 }}>Logout</span>}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');
        .jk-scrollbar::-webkit-scrollbar { width: 4px; }
        .jk-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .jk-scrollbar::-webkit-scrollbar-thumb { background: rgba(14,165,233,0.3); border-radius: 2px; }
        .jk-input { background: rgba(14,165,233,0.04) !important; border: 1px solid rgba(14,165,233,0.2) !important; color: #e2e8f0 !important; border-radius: 12px !important; }
        .jk-input:focus { border-color: rgba(14,165,233,0.5) !important; outline: none !important; box-shadow: 0 0 0 3px rgba(14,165,233,0.08) !important; }
        .jk-input::placeholder { color: rgba(148,163,184,0.5) !important; }
        .jk-select { background: rgba(14,165,233,0.04) !important; border: 1px solid rgba(14,165,233,0.2) !important; color: #e2e8f0 !important; border-radius: 12px !important; appearance: none; }
        .jk-select option { background: #1E3A58 !important; color: #e2e8f0 !important; }
        .jk-table-row:hover { background: rgba(14,165,233,0.04) !important; }
        .jk-btn-primary { background: linear-gradient(135deg,#0EA5E9,#6366F1) !important; color: #fff !important; border: none !important; }
        .jk-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .jk-btn-danger { background: rgba(239,68,68,0.1) !important; color: #f87171 !important; border: 1px solid rgba(239,68,68,0.2) !important; }
        .jk-btn-danger:hover { background: rgba(239,68,68,0.2) !important; }
        .jk-card { background: rgba(30,61,110,0.5) !important; border: 1px solid rgba(14,165,233,0.15) !important; border-radius: 16px !important; }
        .jk-modal { background: linear-gradient(160deg,#0F2644,#1E3D6E) !important; border: 1px solid rgba(14,165,233,0.2) !important; border-radius: 20px !important; }
      `}</style>

      <div className="flex h-screen" style={{ background: '#0F2644', fontFamily: "'Space Grotesk', sans-serif" }}>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setMobileOpen(false)} />
        )}

        {/* Mobile sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col md:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ background: 'linear-gradient(180deg,#0B1E33,#0F2644)', borderRight: '1px solid rgba(14,165,233,0.15)' }}>
          <SidebarContent mobile />
        </div>

        {/* Desktop sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-[68px]'} hidden md:flex flex-col flex-shrink-0 transition-all duration-300`}
          style={{ background: 'linear-gradient(180deg,#0B1E33,#0F2644)', borderRight: '1px solid rgba(14,165,233,0.15)' }}>
          <SidebarContent />
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top bar */}
          <header style={{
            background: 'rgba(11,30,51,0.8)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(14,165,233,0.12)',
            padding: '0 24px', height: 65,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded-lg" style={{ color: '#94a3b8' }}
                onClick={() => setMobileOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                  {activeLabel}
                </div>
                <div style={{ fontSize: 11, color: '#38bdf8', letterSpacing: '0.05em' }}>JK Motors</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user?.role === USER_ROLES.CLIENT && (
                <button onClick={() => navigate('/order/new')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', boxShadow: '0 2px 10px rgba(14,165,233,0.25)' }}>
                  <ShoppingCart className="w-3.5 h-3.5" /> New Order
                </button>
              )}

              <button onClick={() => navigate('/notifications')}
                className="relative p-2 rounded-lg transition-colors"
                style={{ color: '#94a3b8', background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.1)' }}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                    style={{ background: '#ef4444', fontSize: 9, fontWeight: 700 }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 pl-3 cursor-pointer"
                style={{ borderLeft: '1px solid rgba(14,165,233,0.15)' }}
                onClick={() => navigate('/profile')} title="Go to Profile">
                <UserAvatar user={user} size={32} fontSize={12} />
                <div className="text-right hidden sm:block">
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{getDisplayName()}</p>
                  <p style={{ fontSize: 10, color: '#38bdf8', textTransform: 'capitalize' }}>{user?.role?.toLowerCase()}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto jk-scrollbar" style={{ background: '#0F2644' }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
              backgroundImage: 'linear-gradient(rgba(14,165,233,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.025) 1px,transparent 1px)',
              backgroundSize: '50px 50px' }} />
            <div style={{ position: 'relative', zIndex: 1, padding: 24, minHeight: '100%' }}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;