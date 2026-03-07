import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import FontAwesome from '../component/uiStyle/FontAwesome';

const EmailVerificationPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const response = await authApi.verifyEmail(token);
      if (response.success) {
        setStatus('success');
        setMessage(response.message);
      } else {
        setStatus('error');
        setMessage(response.message);
      }
    };
    verify();
  }, [token]);

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center', padding: '40px' }}>
      {status === 'loading' && (
        <>
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Vérification en cours...</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div style={{ fontSize: '60px', color: '#7ac142', marginBottom: '20px' }}><FontAwesome name="check-circle" /></div>
          <h2>Email vérifié !</h2>
          <p style={{ color: '#666', margin: '20px 0' }}>{message}</p>
          <Link to="/connexion" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none', padding: '12px 30px' }}>
            Se connecter
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ fontSize: '60px', color: '#e74c3c', marginBottom: '20px' }}><FontAwesome name="times-circle" /></div>
          <h2>Erreur de vérification</h2>
          <p style={{ color: '#666', margin: '20px 0' }}>{message}</p>
          <Link to="/connexion" className="btn btn-outline-primary">Retour à la connexion</Link>
        </>
      )}
    </div>
  );
};

export default EmailVerificationPage;
