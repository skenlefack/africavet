import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '../uiStyle/FontAwesome';

const ACCESS_LIMIT = 10;
const LOCAL_STORAGE_KEY = 'opp_detail_views';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AccessContext = createContext(null);

export const useOpportunityAccess = () => {
  const context = useContext(AccessContext);
  if (!context) throw new Error('useOpportunityAccess must be used within OpportunityAccessProvider');
  return context;
};

/**
 * Provider that tracks opportunity page views and gates access after the limit
 */
export const OpportunityAccessProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [detailViews, setDetailViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [isAuthenticated]);

  const checkAccess = async () => {
    if (isAuthenticated) {
      setDetailViews(0);
      setIsLoading(false);
      return;
    }

    const localViews = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY) || '0', 10);
    setDetailViews(localViews);

    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/opportunities/check-access`, { headers });
      const data = await res.json();

      if (data.success) {
        const serverViews = data.data.detail_views;
        const effectiveViews = Math.max(localViews, serverViews);
        setDetailViews(effectiveViews);
        localStorage.setItem(LOCAL_STORAGE_KEY, String(effectiveViews));
      }
    } catch {
      // Use localStorage count as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const trackAccess = useCallback(async (pageType, opportunityId) => {
    if (isAuthenticated) return;

    if (pageType === 'detail') {
      const current = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY) || '0', 10);
      const newCount = current + 1;
      localStorage.setItem(LOCAL_STORAGE_KEY, String(newCount));
      setDetailViews(newCount);
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/opportunities/track-access`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ page_type: pageType, opportunity_id: opportunityId || null }),
      });
      const data = await res.json();

      if (data.success && pageType === 'detail') {
        const serverViews = data.data.detail_views;
        const localViews = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY) || '0', 10);
        const effectiveViews = Math.max(localViews, serverViews);
        setDetailViews(effectiveViews);
        localStorage.setItem(LOCAL_STORAGE_KEY, String(effectiveViews));
      }
    } catch {
      // Tracking failed silently
    }
  }, [isAuthenticated, token]);

  const isBlocked = !isAuthenticated && detailViews >= ACCESS_LIMIT;
  const remaining = isAuthenticated ? 999 : Math.max(0, ACCESS_LIMIT - detailViews);

  return (
    <AccessContext.Provider value={{ detailViews, remaining, isBlocked, isAuthenticated, isLoading, trackAccess }}>
      {children}
    </AccessContext.Provider>
  );
};

/**
 * Gate component for the detail page - blocks content when limit reached
 */
export const OpportunityDetailGate = ({ children, opportunityId }) => {
  const { isBlocked, remaining, isAuthenticated, isLoading, trackAccess } = useOpportunityAccess();
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (!tracked && !isLoading) {
      trackAccess('detail', opportunityId);
      setTracked(true);
    }
  }, [tracked, isLoading, opportunityId, trackAccess]);

  if (isLoading) return null;

  if (isBlocked) return <AccessWall />;

  return (
    <>
      {!isAuthenticated && remaining <= 3 && remaining > 0 && (
        <AccessWarningBanner remaining={remaining} />
      )}
      {children}
    </>
  );
};

/**
 * Full-page wall when free views are exhausted
 */
const AccessWall = () => (
  <div style={{
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    background: 'linear-gradient(to bottom, #f0f4f8, #fff)'
  }}>
    <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
      {/* Lock icon */}
      <div style={{
        width: '80px', height: '80px', margin: '0 auto 24px',
        borderRadius: '50%', background: 'linear-gradient(135deg, #e8f0fe, #e0e7ff)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <FontAwesome name="lock" style={{ fontSize: '36px', color: '#354e84' }} />
      </div>

      <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#333', marginBottom: '12px' }}>
        Accès limité atteint
      </h1>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
        Vous avez consulté vos 10 opportunités gratuites. Créez un compte gratuit pour un accès illimité.
      </p>

      {/* Benefits */}
      <div style={{
        background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e8e8e8', padding: '24px', marginBottom: '24px', textAlign: 'left'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
          Avantages du compte gratuit
        </h3>
        {[
          'Accès illimité à toutes les opportunités',
          'Postuler directement aux offres',
          'Recevoir des alertes personnalisées',
          'Sauvegarder vos recherches'
        ].map((benefit, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%', background: '#e8f5e9',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <FontAwesome name="check" style={{ fontSize: '12px', color: '#4caf50' }} />
            </div>
            <span style={{ color: '#555', fontSize: '14px' }}>{benefit}</span>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <Link to="/inscription" className="btn btn-lg w-100 mb-2"
        style={{
          background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
          color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600',
          padding: '14px', fontSize: '16px'
        }}>
        <FontAwesome name="user-plus" /> Créer un compte gratuit
      </Link>

      <p style={{ color: '#999', margin: '12px 0', fontSize: '14px' }}>Déjà un compte ?</p>

      <Link to="/connexion" state={{ from: { pathname: '/opportunites' } }}
        className="btn btn-outline-primary w-100"
        style={{ borderRadius: '10px', fontWeight: '600', padding: '12px' }}>
        <FontAwesome name="sign-in" /> Se connecter
      </Link>

      <div style={{ marginTop: '16px' }}>
        <Link to="/opportunites" style={{ color: '#999', fontSize: '14px', textDecoration: 'underline' }}>
          Retour aux opportunités
        </Link>
      </div>
    </div>
  </div>
);

/**
 * Warning banner near the limit
 */
const AccessWarningBanner = ({ remaining }) => (
  <div style={{
    background: '#fff3e0', borderBottom: '1px solid #ffe0b2',
    padding: '10px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '10px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e65100' }}>
      <FontAwesome name="exclamation-triangle" />
      <span style={{ fontSize: '14px', fontWeight: '500' }}>
        Il vous reste {remaining} consultation{remaining > 1 ? 's' : ''} gratuite{remaining > 1 ? 's' : ''}.
        Créez un compte pour un accès illimité.
      </span>
    </div>
    <Link to="/inscription" className="btn btn-sm"
      style={{ background: '#e65100', color: '#fff', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>
      Créer un compte
    </Link>
  </div>
);

export default OpportunityAccessProvider;
