import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import { newsletterApi } from '../../services/api';

const NewsletterConfirmPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmSubscription = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Lien de confirmation invalide. Aucun jeton fourni.');
        return;
      }

      try {
        const response = await newsletterApi.confirmSubscription(token);
        if (response.success) {
          setStatus('success');
          setMessage(response.message || 'Votre inscription a la newsletter a ete confirmee avec succes.');
        } else {
          setStatus('error');
          setMessage(response.message || 'Le lien de confirmation est invalide ou a expire.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Erreur de connexion au serveur. Veuillez reessayer plus tard.');
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <div
      className="container d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: '60vh', maxWidth: '550px', padding: '60px 20px', textAlign: 'center' }}
    >
      {/* Loading state */}
      {status === 'loading' && (
        <>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
            }}
          >
            <div className="spinner-border text-primary" role="status" style={{ width: '30px', height: '30px' }}>
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
          <h2 style={{ color: '#333', fontWeight: '700', marginBottom: '10px' }}>
            Confirmation en cours...
          </h2>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Veuillez patienter pendant que nous verifions votre inscription.
          </p>
        </>
      )}

      {/* Success state */}
      {status === 'success' && (
        <>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: '#e8f5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '28px',
              animation: 'fadeIn 0.5s ease',
            }}
          >
            <FontAwesome name="check-circle" style={{ color: '#7ac142', fontSize: '50px' }} />
          </div>
          <h2 style={{ color: '#333', fontWeight: '800', marginBottom: '12px', fontSize: '28px' }}>
            Inscription confirmee !
          </h2>
          <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.7', marginBottom: '12px' }}>
            {message}
          </p>
          <div
            style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px',
              width: '100%',
            }}
          >
            <FontAwesome name="envelope-open" style={{ color: '#7ac142', fontSize: '24px', display: 'block', marginBottom: '10px' }} />
            <p style={{ color: '#555', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
              Vous recevrez desormais nos newsletters avec les dernieres actualites
              veterinaires, des articles exclusifs et bien plus encore.
            </p>
          </div>
          <Link
            to="/"
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '25px',
              padding: '12px 36px',
              fontWeight: '700',
              fontSize: '15px',
            }}
          >
            <FontAwesome name="home" style={{ marginRight: '8px' }} />
            Retour a l'accueil
          </Link>
        </>
      )}

      {/* Error state */}
      {status === 'error' && (
        <>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: '#fce4ec',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '28px',
            }}
          >
            <FontAwesome name="times-circle" style={{ color: '#e74c3c', fontSize: '50px' }} />
          </div>
          <h2 style={{ color: '#333', fontWeight: '800', marginBottom: '12px', fontSize: '28px' }}>
            Erreur de confirmation
          </h2>
          <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.7', marginBottom: '30px' }}>
            {message}
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <Link
              to="/"
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '25px',
                padding: '12px 28px',
                fontWeight: '700',
                fontSize: '14px',
              }}
            >
              <FontAwesome name="home" style={{ marginRight: '8px' }} />
              Retour a l'accueil
            </Link>
            <Link
              to="/contact"
              className="btn btn-outline-secondary"
              style={{
                borderRadius: '25px',
                padding: '12px 28px',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              <FontAwesome name="envelope" style={{ marginRight: '8px' }} />
              Nous contacter
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default NewsletterConfirmPage;
