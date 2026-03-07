import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import { newsletterApi } from '../../services/api';

const UNSUBSCRIBE_REASONS = [
  { value: '', label: 'Choisir une raison (optionnel)' },
  { value: 'too_frequent', label: 'Je recois trop d\'emails' },
  { value: 'not_relevant', label: 'Le contenu n\'est plus pertinent pour moi' },
  { value: 'never_subscribed', label: 'Je ne me suis jamais inscrit(e)' },
  { value: 'other', label: 'Autre raison' },
];

const NewsletterUnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('form'); // form, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage('Veuillez entrer votre adresse email.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await newsletterApi.unsubscribe(email.trim(), tokenFromUrl);

      if (response.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(response.message || 'Impossible de traiter votre demande de desinscription.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Erreur de connexion au serveur. Veuillez reessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (status === 'success') {
    return (
      <div
        className="container d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: '60vh', maxWidth: '550px', padding: '60px 20px', textAlign: 'center' }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: '#fff3e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
          }}
        >
          <FontAwesome name="heart" style={{ color: '#ff9800', fontSize: '42px' }} />
        </div>
        <h2 style={{ color: '#333', fontWeight: '800', marginBottom: '12px', fontSize: '28px' }}>
          Vous nous manquerez !
        </h2>
        <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.7', marginBottom: '12px' }}>
          Votre adresse email <strong>{email}</strong> a ete retiree de notre liste de diffusion.
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
          <p style={{ color: '#555', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
            <FontAwesome name="info-circle" style={{ color: '#354e84', marginRight: '8px' }} />
            Vous ne recevrez plus nos newsletters. Si vous changez d'avis,
            vous pouvez vous reinscrire a tout moment depuis notre site.
          </p>
        </div>

        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
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
        </div>
      </div>
    );
  }

  // Error state (after submit)
  if (status === 'error') {
    return (
      <div
        className="container d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: '60vh', maxWidth: '550px', padding: '60px 20px', textAlign: 'center' }}
      >
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
          <FontAwesome name="exclamation-triangle" style={{ color: '#e74c3c', fontSize: '42px' }} />
        </div>
        <h2 style={{ color: '#333', fontWeight: '800', marginBottom: '12px', fontSize: '28px' }}>
          Erreur
        </h2>
        <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.7', marginBottom: '30px' }}>
          {errorMessage}
        </p>
        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          <button
            onClick={() => { setStatus('form'); setErrorMessage(''); }}
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
            <FontAwesome name="refresh" style={{ marginRight: '8px' }} />
            Reessayer
          </button>
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
      </div>
    );
  }

  // Form state
  return (
    <div
      className="container d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: '60vh', maxWidth: '550px', padding: '60px 20px' }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(122,193,66,0.1) 0%, rgba(53,78,132,0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <FontAwesome name="envelope-open" style={{ color: '#354e84', fontSize: '32px' }} />
        </div>
        <h2 style={{ color: '#333', fontWeight: '800', marginBottom: '10px', fontSize: '26px' }}>
          Se desinscrire de la newsletter
        </h2>
        <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6' }}>
          Nous sommes desoles de vous voir partir.
          Veuillez confirmer votre adresse email pour vous desinscrire.
        </p>
      </div>

      {/* Form card */}
      <div
        className="card border-0 shadow-sm w-100"
        style={{ borderRadius: '12px' }}
      >
        <div className="card-body p-4">
          {errorMessage && (
            <div className="alert alert-danger" style={{ borderRadius: '8px', fontSize: '14px' }}>
              <FontAwesome name="exclamation-circle" style={{ marginRight: '8px' }} />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                <FontAwesome name="envelope" style={{ marginRight: '6px', color: '#7ac142' }} />
                Adresse email
              </label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
                placeholder="votre@email.com"
                required
                disabled={loading}
                style={{ borderRadius: '8px', padding: '12px 14px', fontSize: '15px' }}
              />
            </div>

            {/* Reason (optional) */}
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                <FontAwesome name="comment" style={{ marginRight: '6px', color: '#7ac142' }} />
                Raison de la desinscription
              </label>
              <select
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                style={{ borderRadius: '8px', padding: '10px 14px', fontSize: '14px' }}
              >
                {UNSUBSCRIBE_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Other reason text */}
            {reason === 'other' && (
              <div className="mb-3">
                <textarea
                  className="form-control"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Dites-nous pourquoi vous partez..."
                  rows="3"
                  disabled={loading}
                  style={{ borderRadius: '8px', padding: '10px 14px', fontSize: '14px', resize: 'vertical' }}
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn w-100"
              disabled={loading}
              style={{
                background: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontWeight: '700',
                fontSize: '15px',
                marginTop: '8px',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <FontAwesome name="times-circle" style={{ marginRight: '8px' }} />
                  Confirmer la desinscription
                </>
              )}
            </button>
          </form>

          {/* Changed mind */}
          <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #eee' }}>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>
              Vous avez change d'avis ?
            </p>
            <Link
              to="/"
              style={{ color: '#7ac142', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}
            >
              <FontAwesome name="arrow-left" style={{ marginRight: '6px' }} />
              Retour a l'accueil - rester inscrit(e)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterUnsubscribePage;
