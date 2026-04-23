import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, MailOpen, Trash2, CheckCheck, RefreshCw,
  Search, Phone, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import apiService from '../../services/apiService';

// ── Tiny helpers ───────────────────────────────────────────────────────────────
const fmt = (iso) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const JKCard = ({ children, style = {} }) => (
  <div style={{
    background: 'rgba(30,61,110,0.4)',
    border: '1px solid rgba(14,165,233,0.15)',
    borderRadius: 16,
    ...style,
  }}>
    {children}
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminContactMessages() {
  const [messages,  setMessages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all'); // 'all' | 'unread' | 'read'
  const [expanded,  setExpanded]  = useState(null);  // id of expanded row
  const [deleting,  setDeleting]  = useState(null);  // id being deleted

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
      // keep previous state on error
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // When a row is expanded, auto-mark it as read
  const handleExpand = async (msg) => {
    const isExpanding = expanded !== msg.id;
    setExpanded(isExpanding ? msg.id : null);

    if (isExpanding && !msg.isRead) {
      try {
        await apiService.adminMarkContactRead(msg.id, true);
        setMessages(prev =>
          prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m)
        );
      } catch {}
    }
  };

  const handleMarkRead = async (e, msg) => {
    e.stopPropagation();
    try {
      const newVal = !msg.isRead;
      await apiService.adminMarkContactRead(msg.id, newVal);
      setMessages(prev =>
        prev.map(m => m.id === msg.id ? { ...m, isRead: newVal } : m)
      );
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

  // Client-side search filter
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

  const headStyle = { fontFamily: "'Space Grotesk', sans-serif", color: '#e2e8f0' };
  const subStyle  = { fontFamily: "'Space Grotesk', sans-serif", color: '#64748b', fontSize: 12 };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 style={{ ...headStyle, fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
            Contact Messages
          </h1>
          <p style={subStyle}>
            {messages.length} total &nbsp;·&nbsp;
            <span style={{ color: unreadCount > 0 ? '#f59e0b' : '#64748b' }}>
              {unreadCount} unread
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                color: '#10b981',
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: 'rgba(14,165,233,0.08)',
              border: '1px solid rgba(14,165,233,0.2)',
              color: '#38bdf8',
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Filters + Search ── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Filter tabs */}
        <div className="flex rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(14,165,233,0.04)' }}>
          {[
            { value: 'all',    label: 'All' },
            { value: 'unread', label: 'Unread' },
            { value: 'read',   label: 'Read' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              style={{
                padding: '6px 16px',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                background: filter === tab.value
                  ? 'linear-gradient(135deg,#0EA5E9,#6366F1)'
                  : 'transparent',
                color: filter === tab.value ? '#fff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: '#475569', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search name, email, message…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 36,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              background: 'rgba(14,165,233,0.04)',
              border: '1px solid rgba(14,165,233,0.15)',
              borderRadius: 12,
              color: '#e2e8f0',
              fontSize: 13,
              fontFamily: "'Space Grotesk', sans-serif",
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* ── Message List ── */}
      <JKCard>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(14,165,233,0.2)', borderTopColor: '#0EA5E9' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-10 h-10 mx-auto mb-3" style={{ color: '#1e3d6e' }} />
            <p style={{ ...subStyle, fontSize: 13 }}>
              {search ? 'No messages match your search.' : 'No messages yet.'}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((msg, idx) => {
              const isOpen = expanded === msg.id;

              return (
                <div key={msg.id}
                  style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(14,165,233,0.07)' : 'none' }}>

                  {/* ── Row header (always visible) ── */}
                  <div
                    className="flex items-start gap-3 px-5 py-4 cursor-pointer"
                    style={{ background: isOpen ? 'rgba(14,165,233,0.04)' : 'transparent', transition: 'background 0.15s' }}
                    onClick={() => handleExpand(msg)}
                  >
                    {/* Unread dot + icon */}
                    <div className="relative flex-shrink-0 mt-0.5">
                      {!msg.isRead && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                          style={{ background: '#f59e0b', border: '2px solid #0F2644' }} />
                      )}
                      {msg.isRead
                        ? <MailOpen className="w-5 h-5" style={{ color: '#475569' }} />
                        : <Mail     className="w-5 h-5" style={{ color: '#38bdf8' }} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: 14,
                          fontWeight: msg.isRead ? 400 : 600,
                          color: msg.isRead ? '#94a3b8' : '#e2e8f0',
                        }}>
                          {msg.name}
                        </span>
                        <span style={{ ...subStyle, fontSize: 11 }}>
                          &lt;{msg.email}&gt;
                        </span>
                        {msg.phone && (
                          <span className="flex items-center gap-1"
                            style={{ ...subStyle, fontSize: 11 }}>
                            <Phone className="w-3 h-3" />{msg.phone}
                          </span>
                        )}
                      </div>
                      {/* Message preview when collapsed */}
                      {!isOpen && (
                        <p style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: 12,
                          color: '#64748b',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}>
                          {msg.message}
                        </p>
                      )}
                    </div>

                    {/* Right side: date + actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="flex items-center gap-1" style={subStyle}>
                        <Clock className="w-3 h-3" />
                        {fmt(msg.createdAt)}
                      </span>

                      {/* Mark read/unread toggle */}
                      <button
                        onClick={e => handleMarkRead(e, msg)}
                        title={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{
                          background: 'rgba(14,165,233,0.06)',
                          border: '1px solid rgba(14,165,233,0.12)',
                          color: '#38bdf8',
                          cursor: 'pointer',
                        }}
                      >
                        {msg.isRead
                          ? <Mail     className="w-3.5 h-3.5" />
                          : <MailOpen className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={e => handleDelete(e, msg.id)}
                        disabled={deleting === msg.id}
                        title="Delete message"
                        className="p-1.5 rounded-lg transition-colors"
                        style={{
                          background: 'rgba(239,68,68,0.06)',
                          border: '1px solid rgba(239,68,68,0.12)',
                          color: '#f87171',
                          cursor: 'pointer',
                          opacity: deleting === msg.id ? 0.5 : 1,
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Expand chevron */}
                      {isOpen
                        ? <ChevronUp   className="w-4 h-4" style={{ color: '#38bdf8' }} />
                        : <ChevronDown className="w-4 h-4" style={{ color: '#475569' }} />}
                    </div>
                  </div>

                  {/* ── Expanded message body ── */}
                  {isOpen && (
                    <div className="px-14 pb-5"
                      style={{ borderTop: '1px solid rgba(14,165,233,0.07)' }}>
                      <div className="rounded-xl p-4 mt-3"
                        style={{ background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.08)' }}>
                        <p style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: 14,
                          color: '#cbd5e1',
                          lineHeight: 1.7,
                          whiteSpace: 'pre-wrap',
                          margin: 0,
                        }}>
                          {msg.message}
                        </p>
                      </div>

                      {/* Quick reply shortcut */}
                      <div className="mt-3 flex items-center gap-3">
                        <a
                          href={`mailto:${msg.email}?subject=Re: Your message to JK Motors`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                          style={{
                            background: 'linear-gradient(135deg,#0EA5E9,#6366F1)',
                            textDecoration: 'none',
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Reply via Email
                        </a>
                        <span style={subStyle}>Sent to: {msg.email}</span>
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
