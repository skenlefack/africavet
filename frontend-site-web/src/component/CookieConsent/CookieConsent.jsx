import React, { useState, useEffect } from 'react';
import { initGA } from '../../utils/analytics';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setTimeout(() => setVisible(true), 1500);
    } else if (consent === 'accepted') {
      initGA();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
    initGA();
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999,
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.4s ease-out',
    }}>
      <div style={{
        background: '#fff', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        borderTop: '3px solid #7ac142', padding: '20px 0',
      }}>
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div style={{ flex: 1, minWidth: 250 }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#444' }}>
              <strong>🍪 Cookies</strong> — Ce site utilise des cookies pour améliorer votre expérience et mesurer l'audience.
              <a href="/politique-confidentialite" style={{ color: '#354e84', marginLeft: 4 }}>En savoir plus</a>
            </p>
          </div>
          <div className="d-flex gap-2">
            <button onClick={handleReject} className="btn btn-outline-secondary btn-sm" style={{ borderRadius: 8, padding: '8px 20px' }}>
              Refuser
            </button>
            <button onClick={handleAccept} className="btn btn-sm text-white" style={{
              background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
              borderRadius: 8, padding: '8px 24px', fontWeight: 600, border: 'none'
            }}>
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
