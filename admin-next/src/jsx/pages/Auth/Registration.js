import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../../../services/AuthService';

const Registration = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', first_name: '', last_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.username, form.first_name, form.last_name);
      setSuccess('Inscription réussie ! Vérifiez votre email pour activer votre compte.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}>
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: 480, borderRadius: 16 }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: '#354e84' }}>AfricaVET</h2>
            <p className="text-muted">Créer un compte administrateur</p>
          </div>
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          {success && <div className="alert alert-success py-2 small">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-6">
                <label className="form-label fw-semibold small">Prénom</label>
                <input type="text" className="form-control" name="first_name" value={form.first_name} onChange={handleChange} required />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold small">Nom</label>
                <input type="text" className="form-control" name="last_name" value={form.last_name} onChange={handleChange} required />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Nom d'utilisateur</label>
              <input type="text" className="form-control" name="username" value={form.username} onChange={handleChange} minLength={3} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Email</label>
              <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="row mb-3">
              <div className="col-6">
                <label className="form-label fw-semibold small">Mot de passe</label>
                <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} minLength={8} required />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold small">Confirmer</label>
                <input type="password" className="form-control" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="btn w-100 text-white fw-bold" style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }} disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Inscription...</> : <><i className="fas fa-user-plus me-2"></i>S'inscrire</>}
            </button>
          </form>
          <p className="text-center mt-4 mb-0 small text-muted">
            Déjà un compte ? <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#7ac142' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
