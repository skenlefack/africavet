import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, saveTokenInLocalStorage } from '../../../services/AuthService';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    try {
      const response = await login(email, password);
      saveTokenInLocalStorage(response.data.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}>
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: 420, borderRadius: 16 }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: '#354e84' }}>AfricaVET</h2>
            <p className="text-muted">Connectez-vous au panneau d'administration</p>
          </div>
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fas fa-envelope"></i></span>
                <input type="email" className="form-control" placeholder="admin@africavet.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Mot de passe</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fas fa-lock"></i></span>
                <input type="password" className="form-control" placeholder="Votre mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                <label className="form-check-label small" htmlFor="remember">Se souvenir de moi</label>
              </div>
              <Link to="/forgot-password" className="small text-decoration-none">Mot de passe oublié ?</Link>
            </div>
            <button type="submit" className="btn w-100 text-white fw-bold" style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }} disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Connexion...</> : <><i className="fas fa-sign-in-alt me-2"></i>Se connecter</>}
            </button>
          </form>
          <p className="text-center mt-4 mb-0 small text-muted">
            Pas encore de compte ? <Link to="/register" className="fw-bold text-decoration-none" style={{ color: '#7ac142' }}>S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
