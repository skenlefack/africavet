import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import FontAwesome from '../../uiStyle/FontAwesome';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';

  return (
    <div className="user-menu-wrapper" ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          color: 'white',
          fontWeight: '600',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        ) : initials}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '42px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          minWidth: '220px',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
            <div style={{ fontWeight: '600', color: '#333' }}>{user.first_name} {user.last_name}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{user.email}</div>
          </div>
          <div style={{ padding: '8px 0' }}>
            <Link to="/tableau-de-bord" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: '#333', textDecoration: 'none' }}>
              <FontAwesome name="tachometer" /> Tableau de bord
            </Link>
            <Link to="/mon-apprentissage" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: '#333', textDecoration: 'none' }}>
              <FontAwesome name="graduation-cap" /> Mon apprentissage
            </Link>
            <Link to="/profil" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: '#333', textDecoration: 'none' }}>
              <FontAwesome name="user" /> Mon profil
            </Link>
            <Link to="/notifications" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: '#333', textDecoration: 'none' }}>
              <FontAwesome name="bell" /> Notifications
            </Link>
          </div>
          <div style={{ borderTop: '1px solid #eee', padding: '8px 0' }}>
            <button
              onClick={() => { logout(); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            >
              <FontAwesome name="sign-out" /> Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
