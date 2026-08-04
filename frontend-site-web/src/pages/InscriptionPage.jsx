import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import FontAwesome from "../component/uiStyle/FontAwesome";
import CountrySelect from "../component/CountrySelect";
import ProfessionSelect from "../component/ProfessionSelect";
import { useAuth } from "../context/AuthContext";
import "./inscription.scss";

const InscriptionPage = () => {
  const { register, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const features = [
    { icon: "envelope", title: t('auth.featureNewsletter'), description: t('auth.featureNewsletterDesc') },
    { icon: "bell", title: t('auth.featureJobAlerts'), description: t('auth.featureJobAlertsDesc') },
    { icon: "video-camera", title: t('auth.featureWebinars'), description: t('auth.featureWebinarsDesc') },
    { icon: "address-book", title: t('auth.featureDirectory'), description: t('auth.featureDirectoryDesc') }
  ];
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "", prenom: "", email: "", password: "", confirmPassword: "",
    profession: "", pays: "", acceptTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (isAuthenticated) {
    navigate("/tableau-de-bord", { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      return setError(t('auth.passwordMismatch'));
    }
    if (formData.password.length < 6) {
      return setError(t('auth.passwordTooShort'));
    }

    setLoading(true);
    try {
      const response = await register({
        username: formData.email.split('@')[0] + Math.floor(Math.random() * 1000),
        email: formData.email,
        password: formData.password,
        first_name: formData.prenom,
        last_name: formData.nom,
        lang: 'fr'
      });

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || t('auth.registerError'));
      }
    } catch {
      setError(t('auth.genericError'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="inscription-page">
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '60px', color: '#7ac142', marginBottom: '20px' }}><FontAwesome name="check-circle" /></div>
            <h2>{t('auth.registrationSuccess')}</h2>
            <p style={{ color: '#666', fontSize: '16px', margin: '20px 0' }}>
              {t('auth.verificationEmailSent', { email: formData.email })}
            </p>
            <Link to="/connexion" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none', padding: '12px 30px' }}>
              {t('auth.goToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inscription-page">
      <div className="container">
        <div className="inscription-wrapper">
          <div className="inscription-features">
            <div className="features-header">
              <h1>{t('auth.joinTitle')} <span>AfricaVET</span></h1>
              <p>{t('auth.joinSubtitle')}</p>
            </div>
            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon"><FontAwesome name={feature.icon} /></div>
                  <div className="feature-content"><h3>{feature.title}</h3><p>{feature.description}</p></div>
                </div>
              ))}
            </div>
            <div className="features-stats">
              <div className="stat"><span className="stat-number">5000+</span><span className="stat-label">{t('auth.members')}</span></div>
              <div className="stat"><span className="stat-number">50+</span><span className="stat-label">{t('auth.countries')}</span></div>
              <div className="stat"><span className="stat-number">1000+</span><span className="stat-label">{t('nav.articles')}</span></div>
            </div>
          </div>

          <div className="inscription-form-container">
            <div className="form-card">
              <div className="form-header">
                <h2>{t('auth.createAccount')}</h2>
                <p>{t('auth.fillForm')}</p>
              </div>
              {error && <div className="alert alert-danger" style={{ borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
              <form onSubmit={handleSubmit} className="inscription-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="prenom">{t('auth.firstName')}</label>
                    <input type="text" id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Votre prénom" required disabled={loading} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="nom">{t('auth.lastName')}</label>
                    <input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange} placeholder="Votre nom" required disabled={loading} />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">{t('auth.email')}</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" required disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="profession">{t('auth.profession')}</label>
                  <ProfessionSelect
                    value={formData.profession}
                    onChange={handleChange}
                    name="profession"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pays">{t('annuaire.country')}</label>
                  <CountrySelect
                    value={formData.pays}
                    onChange={handleChange}
                    name="pays"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">{t('auth.password')}</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 caractères" required disabled={loading} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirmez votre mot de passe" required disabled={loading} />
                  </div>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} required />
                    <span className="checkmark"></span>
                    {t('auth.acceptTermsPrefix')} <Link to="/conditions">{t('footer.terms')}</Link> {t('auth.acceptTermsAnd')} <Link to="/confidentialite">{t('footer.privacy')}</Link>
                  </label>
                </div>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>{t('auth.registering')}</> : <><FontAwesome name="user-plus" /> {t('auth.createAccount')}</>}
                </button>
              </form>
              <div className="form-footer">
                <p>{t('auth.hasAccount')} <Link to="/connexion">{t('auth.loginButton')}</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscriptionPage;
