import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import FontAwesome from "../component/uiStyle/FontAwesome";
import { useAuth } from "../context/AuthContext";
import "./connexion.scss";

const ConnexionPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/tableau-de-bord";

  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsVerification(false);

    try {
      const response = await login(formData.email, formData.password);
      if (response.success) {
        navigate(from, { replace: true });
      } else {
        if (response.requiresVerification) setNeedsVerification(true);
        setError(response.message);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connexion-page">
      <div className="container">
        <div className="connexion-wrapper">
          <div className="connexion-branding">
            <div className="branding-content">
              <div className="logo-area">
                <div className="logo-icon"><FontAwesome name="paw" /></div>
                <h1>AfricaVet</h1>
              </div>
              <h2>Bienvenue !</h2>
              <p>Connectez-vous pour accéder à votre espace personnel et profiter de tous les avantages de la communauté AfricaVet.</p>
              <div className="branding-features">
                <div className="feature"><FontAwesome name="newspaper-o" /><span>Actualités personnalisées</span></div>
                <div className="feature"><FontAwesome name="bookmark" /><span>Articles sauvegardés</span></div>
                <div className="feature"><FontAwesome name="bell" /><span>Alertes et notifications</span></div>
                <div className="feature"><FontAwesome name="comments" /><span>Discussions et échanges</span></div>
              </div>
            </div>
            <div className="branding-footer">
              <p>Pas encore membre ?</p>
              <Link to="/inscription" className="btn-signup">Créer un compte gratuitement <FontAwesome name="arrow-right" /></Link>
            </div>
          </div>

          <div className="connexion-form-container">
            <div className="form-card">
              <div className="form-header">
                <h2>Connexion</h2>
                <p>Entrez vos identifiants pour continuer</p>
              </div>

              {error && (
                <div className={`alert ${needsVerification ? 'alert-warning' : 'alert-danger'}`} style={{ margin: '0 0 20px', borderRadius: '8px' }}>
                  {error}
                  {needsVerification && (
                    <div style={{ marginTop: '8px' }}>
                      <Link to="/renvoyer-verification" state={{ email: formData.email }}>Renvoyer l'email de vérification</Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="connexion-form">
                <div className="form-group">
                  <label htmlFor="email"><FontAwesome name="envelope" /> Adresse email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" required disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="password"><FontAwesome name="lock" /> Mot de passe</label>
                  <div className="password-input">
                    <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Votre mot de passe" required disabled={loading} />
                    <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}><FontAwesome name={showPassword ? "eye-slash" : "eye"} /></button>
                  </div>
                </div>
                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} />
                    <span className="checkmark"></span> Se souvenir de moi
                  </label>
                  <Link to="/mot-de-passe-oublie" className="forgot-link">Mot de passe oublié ?</Link>
                </div>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Connexion...</> : <><FontAwesome name="sign-in" /> Se connecter</>}
                </button>
              </form>

              <div className="form-footer-mobile">
                <p>Pas encore membre ? <Link to="/inscription">Créer un compte</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnexionPage;
