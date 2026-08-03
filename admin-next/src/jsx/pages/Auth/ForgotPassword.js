import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}>
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: 420, borderRadius: 16 }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: '#354e84' }}>AfricaVET</h2>
            <p className="text-muted">Réinitialiser votre mot de passe</p>
          </div>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Adresse email</label>
                <input type="email" className="form-control" placeholder="Votre adresse email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn w-100 text-white fw-bold" style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}>
                <i className="fas fa-paper-plane me-2"></i>Envoyer le lien
              </button>
            </form>
          ) : (
            <div className="text-center">
              <i className="fas fa-check-circle text-success mb-3" style={{ fontSize: 48 }}></i>
              <p>Si un compte est associé à <strong>{email}</strong>, vous recevrez un email avec les instructions.</p>
              <p className="text-muted small">Si vous ne recevez pas d'email, contactez l'administrateur.</p>
            </div>
          )}
          <p className="text-center mt-4 mb-0 small">
            <Link to="/login" className="text-decoration-none"><i className="fas fa-arrow-left me-1"></i>Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
