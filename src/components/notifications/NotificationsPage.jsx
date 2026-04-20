import React, { useState } from 'react';
import { Bell, BellOff, CheckCheck, Loader, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../services/useNotifications';
import { useNavigate } from 'react-router-dom';
 
const EVENT_ICONS = {
  NEW_ORDER: '📋', ORDER_APPROVED: '✅', CLIENT_CONFIRMED: '🎉',
  CLIENT_REJECTED: '❌', ORDER_COMPLETED: '🏁', ORDER_CANCELLED: '🚫', CONNECTED: '🔗',
};
 
const T = {
  heading: { fontFamily: "'Orbitron', sans-serif", color: '#e2e8f0' },
  body:    { fontFamily: "'Space Grotesk', sans-serif", color: '#e2e8f0' },
  muted:   { fontFamily: "'Space Grotesk', sans-serif", color: '#64748b' },
};
 
export function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, connected, markRead, reload } = useNotifications(user?.id);
  const [marking, setMarking] = useState(false);
 
  const handleMarkAllRead = async () => { setMarking(true); await markRead(); setMarking(false); };
  const handleMarkOne = async (id) => { await markRead([id]); };
 
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };
 
  const handleNotificationClick = (notif) => {
    if (!notif.isRead) handleMarkOne(notif.id);
    if (notif.orderId) navigate(user?.role === 'ADMIN' ? '/admin/orders' : '/my-orders');
  };
 
  return (
    <div className="space-y-6" style={{ maxWidth: 640 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ ...T.heading, fontSize: 22, fontWeight: 900 }}>Notifications</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            {connected
              ? <><Wifi className="w-3.5 h-3.5" style={{ color: '#6ee7b7' }} /><span style={{ ...T.muted, fontSize: 11, color: '#6ee7b7' }}>Live updates active</span></>
              : <><WifiOff className="w-3.5 h-3.5" style={{ color: '#64748b' }} /><span style={{ ...T.muted, fontSize: 11 }}>Connecting...</span></>
            }
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} disabled={marking}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: marking ? 0.5 : 1 }}>
            {marking ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            Mark all read
          </button>
        )}
      </div>
 
      <div style={{ background: 'rgba(30,61,110,0.4)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 16, overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <BellOff className="w-10 h-10 mx-auto mb-3" style={{ color: '#1e3d6e' }} />
            <p style={{ ...T.muted, fontSize: 13 }}>No notifications yet</p>
            <p style={{ ...T.muted, fontSize: 11, marginTop: 4 }}>We'll notify you when there's activity on your orders.</p>
          </div>
        ) : (
          <div>
            {notifications.map((notif) => (
              <div key={notif.id} onClick={() => handleNotificationClick(notif)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(14,165,233,0.06)', cursor: 'pointer', background: notif.isRead ? 'transparent' : 'rgba(14,165,233,0.04)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(14,165,233,0.04)'}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, background: notif.isRead ? 'rgba(14,165,233,0.05)' : 'rgba(14,165,233,0.12)' }}>
                  {EVENT_ICONS[notif.eventType] || '🔔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, lineHeight: 1.5, color: notif.isRead ? '#94a3b8' : '#e2e8f0', fontWeight: notif.isRead ? 400 : 500 }}>{notif.message}</p>
                  <p style={{ ...T.muted, fontSize: 11, marginTop: 2 }}>{timeAgo(notif.createdAt)}</p>
                </div>
                {!notif.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0EA5E9', flexShrink: 0, marginTop: 6 }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
 
export default NotificationsPage;
