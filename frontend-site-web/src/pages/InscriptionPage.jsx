import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FontAwesome from "../component/uiStyle/FontAwesome";
import { useAuth } from "../context/AuthContext";
import "./inscription.scss";

const features = [
  { icon: "envelope", title: "Newsletter personnalisée", description: "Recevez les actualités qui vous intéressent directement dans votre boîte mail" },
  { icon: "bell", title: "Alertes emploi en temps réel", description: "Soyez notifié dès qu'une opportunité correspond à votre profil" },
  { icon: "video-camera", title: "Accès aux webinaires", description: "Participez à nos formations en ligne et conférences exclusives" },
  { icon: "address-book", title: "Annuaire Vétérinaire Panafricain", description: "Trouvez des vétérinaires et experts de la santé animale à travers l'Afrique" }
];

const InscriptionPage = () => {
  const { register, isAuthenticated } = useAuth();
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
      return setError("Les mots de passe ne correspondent pas");
    }
    if (formData.password.length < 6) {
      return setError("Le mot de passe doit contenir au moins 6 caractères");
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
        setError(response.message || "Erreur lors de l'inscription");
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
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
            <h2>Inscription réussie !</h2>
            <p style={{ color: '#666', fontSize: '16px', margin: '20px 0' }}>
              Un email de vérification a été envoyé à <strong>{formData.email}</strong>.
              Veuillez vérifier votre boîte de réception et cliquer sur le lien pour activer votre compte.
            </p>
            <Link to="/connexion" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none', padding: '12px 30px' }}>
              Aller à la connexion
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
              <h1>Rejoignez <span>AfricaVET</span></h1>
              <p>La plateforme de référence pour les professionnels de la santé animale en Afrique</p>
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
              <div className="stat"><span className="stat-number">5000+</span><span className="stat-label">Membres</span></div>
              <div className="stat"><span className="stat-number">50+</span><span className="stat-label">Pays</span></div>
              <div className="stat"><span className="stat-number">1000+</span><span className="stat-label">Articles</span></div>
            </div>
          </div>

          <div className="inscription-form-container">
            <div className="form-card">
              <div className="form-header">
                <h2>Créer un compte</h2>
                <p>Remplissez le formulaire pour rejoindre la communauté</p>
              </div>
              {error && <div className="alert alert-danger" style={{ borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
              <form onSubmit={handleSubmit} className="inscription-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="prenom">Prénom</label>
                    <input type="text" id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Votre prénom" required disabled={loading} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="nom">Nom</label>
                    <input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange} placeholder="Votre nom" required disabled={loading} />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" required disabled={loading} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="profession">Profession</label>
                    <select id="profession" name="profession" value={formData.profession} onChange={handleChange} required disabled={loading}>
                      <option value="">Sélectionnez</option>
                      <option value="veterinaire">Vétérinaire</option>
                      <option value="technicien">Technicien vétérinaire</option>
                      <option value="eleveur">Éleveur</option>
                      <option value="chercheur">Chercheur</option>
                      <option value="etudiant">Étudiant</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="pays">Pays</label>
                    <select id="pays" name="pays" value={formData.pays} onChange={handleChange} required disabled={loading}>
                      <option value="">Sélectionnez</option>
                      <option value="Sénégal">Sénégal</option>
                      <option value="Mali">Mali</option>
                      <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                      <option value="Burkina Faso">Burkina Faso</option>
                      <option value="Niger">Niger</option>
                      <option value="Cameroun">Cameroun</option>
                      <option value="Maroc">Maroc</option>
                      <option value="Tunisie">Tunisie</option>
                      <option value="Algérie">Algérie</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="password">Mot de passe</label>
                  <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 caractères" required disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirmez votre mot de passe" required disabled={loading} />
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} required />
                    <span className="checkmark"></span>
                    J'accepte les <Link to="/conditions">conditions d'utilisation</Link> et la <Link to="/confidentialite">politique de confidentialité</Link>
                  </label>
                </div>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Inscription...</> : <><FontAwesome name="user-plus" /> Créer mon compte</>}
                </button>
              </form>
              <div className="form-footer">
                <p>Déjà membre ? <Link to="/connexion">Se connecter</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscriptionPage;
