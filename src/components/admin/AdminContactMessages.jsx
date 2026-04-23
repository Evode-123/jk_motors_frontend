import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, MailOpen, Trash2, CheckCheck, RefreshCw,
  Search, Phone, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import apiService from '../../services/apiService';

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

const fmt = (iso) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const JKCard = ({ children, style = {} }) => (
  <div style={{
    background: G.surface,
    border: `1px solid ${G.border}`,
    borderRadius: 16,
    ...style,
  }}>
    {children}
  </div>
);

export default function AdminContactMessages() {
  const [messages,  setMessages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all');
  const [expanded,  setExpanded]  = useState(null);
  const [deleting,  setDeleting]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const isRead =
        filter === 'unread' ? false :
        filter === 'read'   ? true  :
        undefined;
      const data = await apiService.adminGetContacts({ isRead });
      setMessages(data || []);
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleExpand = async (msg) => {
    const isExpanding = expanded !== msg.id;
    setExpanded(isExpanding ? msg.id : null);
    if (isExpanding && !msg.isRead) {
      try {
        await apiService.adminMarkContactRead(msg.id, true);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
      } catch {}
    }
  };

  const handleMarkRead = async (e, msg) => {
    e.stopPropagation();
    try {
      const newVal = !msg.isRead;
      await apiService.adminMarkContactRead(msg.id, newVal);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: newVal } : m));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await apiService.adminMarkAllContactsRead();
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
    } catch {}
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await apiService.adminDeleteContact(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (expanded === id) setExpanded(null);
    } catch {}
    setDeleting(null);
  };

  const filtered = messages.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q) ||
      (m.phone || '').toLowerCase().includes(q)
    );
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes jk-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ ...SERIF, fontSize: 22, fontWeight: 700, color: G.textPrimary, marginBottom: 4 }}>
            Contact Messages
          </h1>
          <p style={{ ...FONT, fontSize: 13, color: G.textMuted }}>
            {messages.length} total &nbsp;·&nbsp;
            <span style={{ color: unreadCount > 0 ? G.gold : G.textMuted }}>
              {unreadCount} unread
            </span>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10,
                background: 'rgba(34,120,80,0.12)',
                border: '1px solid rgba(34,120,80,0.3)',
                color: '#6ee7b7', cursor: 'pointer',
                ...FONT, fontSize: 12, fontWeight: 600,
              }}
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          <button
            onClick={load}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              background: G.goldDimmer, border: `1px solid ${G.border}`,
              color: G.gold, cursor: 'pointer',
              ...FONT, fontSize: 12, fontWeight: 600,
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        {/* Filter pills */}
        <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: `1px solid ${G.border}`, background: G.goldDimmer }}>
          {[
            { value: 'all',    label: 'All' },
            { value: 'unread', label: 'Unread' },
            { value: 'read',   label: 'Read' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              style={{
                padding: '7px 18px', fontSize: 12, fontWeight: 600,
                ...FONT,
                background: filter === tab.value
                  ? 'linear-gradient(135deg,#8B6914,#C9A84C)'
                  : 'transparent',
                color: filter === tab.value ? '#1C1609' : G.textMuted,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: G.gold, pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search name, email, message…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 36, paddingRight: 12,
              paddingTop: 9, paddingBottom: 9,
              background: 'rgba(20,16,8,0.8)',
              border: `1px solid ${G.goldDim}`,
              borderRadius: 12, color: G.textPrimary, fontSize: 13,
              ...FONT, outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Message List */}
      <JKCard>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${G.goldDimmer}`, borderTopColor: G.gold, animation: 'jk-spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <Mail className="w-10 h-10 mx-auto mb-3" style={{ color: G.goldDim }} />
            <p style={{ ...FONT, fontSize: 13, color: G.textMuted }}>
              {search ? 'No messages match your search.' : 'No messages yet.'}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((msg, idx) => {
              const isOpen = expanded === msg.id;
              return (
                <div key={msg.id} style={{ borderBottom: idx < filtered.length - 1 ? `1px solid rgba(201,168,76,0.07)` : 'none' }}>

                  {/* Row header */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '14px 20px', cursor: 'pointer',
                      background: isOpen ? G.goldDimmer : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onClick={() => handleExpand(msg)}
                    onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(201,168,76,0.05)'; }}
                    onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Icon + unread dot */}
                    <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
                      {!msg.isRead && (
                        <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: G.gold, border: `2px solid #100D05` }} />
                      )}
                      {msg.isRead
                        ? <MailOpen className="w-5 h-5" style={{ color: G.textMuted }} />
                        : <Mail     className="w-5 h-5" style={{ color: G.gold }} />}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{
                          ...FONT, fontSize: 14,
                          fontWeight: msg.isRead ? 400 : 600,
                          color: msg.isRead ? G.textMuted : G.textPrimary,
                        }}>
                          {msg.name}
                        </span>
                        <span style={{ ...FONT, fontSize: 11, color: G.textMuted }}>
                          &lt;{msg.email}&gt;
                        </span>
                        {msg.phone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, ...FONT, fontSize: 11, color: G.textMuted }}>
                            <Phone className="w-3 h-3" />{msg.phone}
                          </span>
                        )}
                      </div>
                      {!isOpen && (
                        <p style={{
                          ...FONT, fontSize: 12, color: G.textMuted,
                          overflow: 'hidden', whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis', maxWidth: '100%',
                        }}>
                          {msg.message}
                        </p>
                      )}
                    </div>

                    {/* Right side actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, ...FONT, fontSize: 11, color: G.textMuted }}>
                        <Clock className="w-3 h-3" />{fmt(msg.createdAt)}
                      </span>

                      <button
                        onClick={e => handleMarkRead(e, msg)}
                        title={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                        style={{ padding: '6px', borderRadius: 8, background: G.goldDimmer, border: `1px solid ${G.border}`, color: G.gold, cursor: 'pointer' }}
                      >
                        {msg.isRead
                          ? <Mail     className="w-3.5 h-3.5" />
                          : <MailOpen className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={e => handleDelete(e, msg.id)}
                        disabled={deleting === msg.id}
                        title="Delete message"
                        style={{ padding: '6px', borderRadius: 8, background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.15)', color: '#f87171', cursor: 'pointer', opacity: deleting === msg.id ? 0.5 : 1 }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {isOpen
                        ? <ChevronUp   className="w-4 h-4" style={{ color: G.gold }} />
                        : <ChevronDown className="w-4 h-4" style={{ color: G.textMuted }} />}
                    </div>
                  </div>

                  {/* Expanded body */}
                  {isOpen && (
                    <div style={{ padding: '0 20px 20px 52px', borderTop: `1px solid rgba(201,168,76,0.07)` }}>
                      <div style={{
                        borderRadius: 12, padding: '14px 16px', marginTop: 12,
                        background: 'rgba(20,16,8,0.6)',
                        border: `1px solid ${G.goldDim}`,
                      }}>
                        <p style={{ ...FONT, fontSize: 14, color: G.textPrimary, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
                          {msg.message}
                        </p>
                      </div>

                      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <a
                          href={`mailto:${msg.email}?subject=Re: Your message to JK Motors`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 18px', borderRadius: 10,
                            background: 'linear-gradient(135deg,#8B6914,#C9A84C)',
                            color: '#1C1609', textDecoration: 'none',
                            ...FONT, fontSize: 13, fontWeight: 600,
                          }}
                        >
                          <Mail className="w-3.5 h-3.5" /> Reply via Email
                        </a>
                        <span style={{ ...FONT, fontSize: 12, color: G.textMuted }}>Sent to: {msg.email}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </JKCard>
    </div>
  );
}