import React, { useState } from 'react';
import { Bell, BellOff, CheckCheck, Loader, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../services/useNotifications';
import { useNavigate } from 'react-router-dom';

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

const EVENT_ICONS = {
  NEW_ORDER:        '📋',
  ORDER_APPROVED:   '✅',
  CLIENT_CONFIRMED: '🎉',
  CLIENT_REJECTED:  '❌',
  ORDER_COMPLETED:  '🏁',
  ORDER_CANCELLED:  '🚫',
  CONNECTED:        '🔗',
};

export function NotificationsPage() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const { notifications, unreadCount, connected, markRead, reload } = useNotifications(user?.id);
  const [marking, setMarking] = useState(false);

  const handleMarkAllRead = async () => {
    setMarking(true);
    await markRead();
    setMarking(false);
  };

  const handleMarkOne = async (id) => { await markRead([id]); };

  const timeAgo = (dateStr) => {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return 'Just now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) handleMarkOne(notif.id);
    if (notif.orderId)
      navigate(user?.role === 'ADMIN' ? '/admin/orders' : '/my-orders');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      <style>{`@keyframes jk-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ ...SERIF, fontSize: 22, fontWeight: 700, color: G.textPrimary }}>Notifications</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            {connected ? (
              <>
                <Wifi className="w-3.5 h-3.5" style={{ color: '#6ee7b7' }} />
                <span style={{ ...FONT, fontSize: 11, color: '#6ee7b7' }}>Live updates active</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" style={{ color: G.textMuted }} />
                <span style={{ ...FONT, fontSize: 11, color: G.textMuted }}>Connecting...</span>
              </>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={marking}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 10,
              background: G.goldDimmer, border: `1px solid ${G.border}`,
              color: G.gold, ...FONT, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', opacity: marking ? 0.5 : 1,
            }}
          >
            {marking
              ? <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${G.goldDim}`, borderTopColor: G.gold, animation: 'jk-spin 0.7s linear infinite' }} />
              : <CheckCheck className="w-4 h-4" />
            }
            Mark all read
          </button>
        )}
      </div>

      {/* Stats bar */}
      {notifications.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          padding: '12px 20px', borderRadius: 12,
          background: G.goldDimmer, border: `1px solid ${G.border}`,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...SERIF, fontSize: 22, fontWeight: 700, color: G.textPrimary }}>{notifications.length}</div>
            <div style={{ ...FONT, fontSize: 10, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</div>
          </div>
          <div style={{ width: 1, height: 32, background: G.border }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...SERIF, fontSize: 22, fontWeight: 700, color: G.gold }}>{unreadCount}</div>
            <div style={{ ...FONT, fontSize: 10, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Unread</div>
          </div>
          <div style={{ width: 1, height: 32, background: G.border }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...SERIF, fontSize: 22, fontWeight: 700, color: '#6ee7b7' }}>{notifications.length - unreadCount}</div>
            <div style={{ ...FONT, fontSize: 10, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Read</div>
          </div>
        </div>
      )}

      {/* Notification list */}
      <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 16, overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <BellOff className="w-10 h-10 mx-auto mb-3" style={{ color: G.goldDim }} />
            <p style={{ ...FONT, fontSize: 14, color: G.textMuted, marginBottom: 4 }}>No notifications yet</p>
            <p style={{ ...FONT, fontSize: 12, color: G.textMuted }}>We'll notify you when there's activity on your orders.</p>
          </div>
        ) : (
          <div>
            {notifications.map((notif, idx) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '16px 20px',
                  borderBottom: idx < notifications.length - 1 ? `1px solid rgba(201,168,76,0.07)` : 'none',
                  cursor: 'pointer',
                  background: notif.isRead ? 'transparent' : 'rgba(201,168,76,0.04)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(201,168,76,0.04)'}
              >
                {/* Icon circle */}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                  background: notif.isRead ? G.goldDimmer : 'rgba(201,168,76,0.14)',
                  border: notif.isRead ? `1px solid ${G.border}` : `1px solid ${G.goldDim}`,
                }}>
                  {EVENT_ICONS[notif.eventType] || '🔔'}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    ...FONT, fontSize: 13, lineHeight: 1.5,
                    color: notif.isRead ? G.textMuted : G.textPrimary,
                    fontWeight: notif.isRead ? 400 : 500,
                    marginBottom: 4,
                  }}>
                    {notif.message}
                  </p>
                  <p style={{ ...FONT, fontSize: 11, color: G.textMuted }}>{timeAgo(notif.createdAt)}</p>
                </div>

                {/* Unread dot */}
                {!notif.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: G.gold, flexShrink: 0, marginTop: 6, boxShadow: '0 0 8px rgba(201,168,76,0.5)' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;