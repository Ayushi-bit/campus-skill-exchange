import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, markNotificationRead } from '../services/api';

const ICONS = {
  application_received: '📩',
  application_accepted: '✅',
  application_rejected: '❌',
  new_application:      '📬',
  new_rating:           '⭐',
  project_completed:    '🏁',
  member_joined:        '👥',
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

export default function NotificationBell() {
  const [open, setOpen]       = useState(false);
  const [notifs, setNotifs]   = useState([]);
  const [unread, setUnread]   = useState(0);
  const ref = useRef(null);

  const load = async () => {
    try {
      const res = await getNotifications();
      setNotifs(res.data.notifications || []);
      setUnread(res.data.unread_count || 0);
    } catch (_) {}
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markOne = async (id, el) => {
    try {
      await markNotificationRead({ id });
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (_) {}
  };

  const markAll = async () => {
    try {
      await markNotificationRead({});
      setNotifs(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnread(0);
    } catch (_) {}
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) load(); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 20, position: 'relative', padding: '6px 8px',
          borderRadius: 8,
          color: open ? 'var(--orange)' : 'var(--muted)',
          transition: 'color 0.2s',
        }}
        title="Notifications"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            background: 'var(--danger)', color: '#fff',
            borderRadius: '50%', fontSize: 9, fontWeight: 700,
            width: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed',
          right: 'auto',
          left: 16,
          top: 'auto',
          bottom: 80,
          width: 320, background: 'var(--white)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)', zIndex: 999, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
          }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--brown)', fontFamily: "'Playfair Display', serif" }}>
              Notifications
            </span>
            <button onClick={markAll} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: 'var(--orange)', fontWeight: 600,
            }}>
              Mark all read
            </button>
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                🔕 No notifications yet
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => markOne(n.id)}
                  style={{
                    padding: '11px 14px',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    borderBottom: '1px solid var(--surface)',
                    cursor: 'pointer',
                    background: n.is_read == 0 ? 'rgba(200,115,58,0.05)' : 'transparent',
                    borderLeft: n.is_read == 0 ? '3px solid var(--orange)' : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>
                    {ICONS[n.type] || '🔔'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, fontFamily: "'DM Mono', monospace" }}>
                      {timeAgo(n.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
