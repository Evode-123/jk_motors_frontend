import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/apiService';

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [connected,     setConnected]     = useState(false);
  const esRef = useRef(null);

  // Load existing notifications on mount
  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data  = await apiService.getNotifications();
      const count = await apiService.getUnreadCount();
      setNotifications(data);
      setUnreadCount(count);
    } catch {}
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    loadNotifications();
  }, [userId, loadNotifications]);

  // SSE connection
  useEffect(() => {
    if (!userId) return;

    const token = apiService.getAccessToken();
    if (!token) return;

    // Pass token as query param so EventSource can authenticate
    const url = `${apiService.getNotificationStreamUrl()}?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'CONNECTED') return;

        // Add new notification to the top of the list
        if (data.notificationId) {
          const newNotif = {
            id:        data.notificationId,
            orderId:   data.orderId,
            message:   data.message,
            eventType: data.type,
            isRead:    false,
            createdAt: new Date().toISOString(),
          };
          setNotifications(prev => [newNotif, ...prev].slice(0, 50));
          setUnreadCount(prev => prev + 1);
        }
      } catch {}
    };

    es.onerror = () => {
      setConnected(false);
      // EventSource auto-reconnects, no manual retry needed
    };

    return () => {
      es.close();
      esRef.current = null;
      setConnected(false);
    };
  }, [userId]);

  const markRead = useCallback(async (ids) => {
    try {
      await apiService.markNotificationsRead(ids);
      if (ids) {
        setNotifications(prev =>
          prev.map(n => ids.includes(n.id) ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - ids.length));
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch {}
  }, []);

  return { notifications, unreadCount, connected, markRead, reload: loadNotifications };
}
