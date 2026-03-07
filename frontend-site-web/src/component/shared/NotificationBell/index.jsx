import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../../context/NotificationContext';
import FontAwesome from '../../uiStyle/FontAwesome';

const NotificationBell = () => {
  const { unreadCount, notifications, fetchNotifications, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (!open) fetchNotifications();
    setOpen(!open);
  };

  return (
    <div ref={dropRef} style={{ position: 'relative', display: 'inline-block', marginRight: '12px' }}>
      <button onClick={handleOpen} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px' }}>
        <FontAwesome name="bell-o" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#e74c3c', color: 'white', borderRadius: '50%',
            minWidth: '18px', height: '18px', fontSize: '11px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '600'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '36px',
          background: 'white', borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          width: '340px', maxHeight: '400px', overflowY: 'auto',
          zIndex: 1000
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Notifications</span>
            {unreadCount > 0 && <span style={{ fontSize: '12px', color: '#7ac142' }}>{unreadCount} non lues</span>}
          </div>
          <div>
            {notifications.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                Aucune notification
              </div>
            ) : (
              notifications.slice(0, 8).map(notif => (
                <div
                  key={notif.id}
                  onClick={() => { if (!notif.is_read) markAsRead(notif.id); }}
                  style={{
                    padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    background: notif.is_read ? 'white' : '#f8f9ff'
                  }}
                >
                  <div style={{ fontWeight: notif.is_read ? '400' : '600', fontSize: '14px', color: '#333' }}>
                    {notif.title_fr}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ padding: '10px', borderTop: '1px solid #eee', textAlign: 'center' }}>
            <Link to="/notifications" onClick={() => setOpen(false)} style={{ color: '#354e84', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
