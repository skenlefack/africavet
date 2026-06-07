import React, { useState } from "react";
import { Link } from "react-router-dom";
import BreadCrumb from "../../../component/BreadCrumb";
import FontAwesome from "../../../component/uiStyle/FontAwesome";
import { contactApi } from "../../../services/api";
import "./contact.scss";

const SUBJECTS = [
  "Question générale",
  "Partenariat",
  "Support technique",
  "E-learning / Formations",
  "Annuaire vétérinaire",
  "Opportunités professionnelles",
  "Publicité / Sponsoring",
  "Signaler un problème",
  "Autre",
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    if (!formData.email.trim()) {
      newErrors.email = "L'e-mail est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Adresse e-mail invalide";
    }
    if (!formData.subject) newErrors.subject = "Veuillez choisir un sujet";
    if (!formData.message.trim()) {
      newErrors.message = "Le message est requis";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Le message doit contenir au moins 20 caractères";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const result = await contactApi.submit(formData);
      if (result.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setServerError(result.message || "Une erreur est survenue.");
      }
    } catch (err) {
      setServerError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BreadCrumb className="shadow5" title="Contact" />

      <div className="contact-page">
        <div className="container">
          <div className="contact-wrapper">
            {/* Left: Info Panel */}
            <div className="contact-info-panel">
              <div className="info-header">
                <h1>Contactez-nous</h1>
                <p>
                  Vous avez une question, une suggestion ou souhaitez collaborer
                  avec AfricaVET ? Notre équipe est à votre écoute.
                </p>
              </div>

              <div className="info-cards">
                <div className="info-card">
                  <div className="info-card-icon">
                    <FontAwesome name="envelope" />
                  </div>
                  <div className="info-card-content">
                    <h3>E-mail</h3>
                    <p>contact@africavet.com</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-icon">
                    <FontAwesome name="globe-africa" />
                  </div>
                  <div className="info-card-content">
                    <h3>Site web</h3>
                    <p>www.africavet.com</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-icon">
                    <FontAwesome name="clock" />
                  </div>
                  <div className="info-card-content">
                    <h3>Disponibilité</h3>
                    <p>Lun - Ven : 8h00 - 18h00 (GMT+1)</p>
                  </div>
                </div>
              </div>

              <div className="info-services">
                <h3>Nos services</h3>
                <div className="services-grid">
                  <Link to="/formations" className="service-tag">
                    <FontAwesome name="graduation-cap" />
                    <span>E-learning</span>
                  </Link>
                  <Link to="/annuaire" className="service-tag">
                    <FontAwesome name="address-book" />
                    <span>Annuaire</span>
                  </Link>
                  <Link to="/opportunites" className="service-tag">
                    <FontAwesome name="briefcase" />
                    <span>Opportunités</span>
                  </Link>
                  <Link to="/bibliotheque" className="service-tag">
                    <FontAwesome name="book" />
                    <span>Bibliothèque</span>
                  </Link>
                  <Link to="/alertes-veterinaires" className="service-tag">
                    <FontAwesome name="exclamation-triangle" />
                    <span>Alertes</span>
                  </Link>
                </div>
              </div>

              <div className="info-social">
                <h3>Suivez-nous</h3>
                <div className="social-links">
                  <a href="https://facebook.com/africavet" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <FontAwesome name="facebook-f" />
                  </a>
                  <a href="https://twitter.com/africavet" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <FontAwesome name="twitter" />
                  </a>
                  <a href="https://linkedin.com/company/africavet" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <FontAwesome name="linkedin-in" />
                  </a>
                  <a href="https://youtube.com/@africavet" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <FontAwesome name="youtube" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Form Panel */}
            <div className="contact-form-container">
              {success ? (
                <div className="form-card success-card">
                  <div className="success-icon">
                    <FontAwesome name="check-circle" />
                  </div>
                  <h2>Message envoyé !</h2>
                  <p>
                    Merci de nous avoir contactés. Notre équipe vous répondra
                    dans les meilleurs délais.
                  </p>
                  <p className="success-hint">
                    Un e-mail de confirmation a été envoyé à votre adresse.
                  </p>
                  <button
                    className="btn-new-message"
                    onClick={() => setSuccess(false)}
                  >
                    <FontAwesome name="paper-plane" />
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <div className="form-card">
                  <div className="form-header">
                    <h2>Envoyez-nous un message</h2>
                    <p>
                      Remplissez le formulaire ci-dessous et nous vous répondrons
                      rapidement.
                    </p>
                  </div>

                  {serverError && (
                    <div className="alert-error">
                      <FontAwesome name="exclamation-circle" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="form-row">
                      <div className={`form-group ${errors.name ? "has-error" : ""}`}>
                        <label htmlFor="name">
                          Nom complet <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Votre nom et prénom"
                          disabled={loading}
                        />
                        {errors.name && <span className="field-error">{errors.name}</span>}
                      </div>

                      <div className={`form-group ${errors.email ? "has-error" : ""}`}>
                        <label htmlFor="email">
                          Adresse e-mail <span className="required">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="votre@email.com"
                          disabled={loading}
                        />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="phone">Téléphone</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+237 6XX XXX XXX"
                          disabled={loading}
                        />
                      </div>

                      <div className={`form-group ${errors.subject ? "has-error" : ""}`}>
                        <label htmlFor="subject">
                          Sujet <span className="required">*</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          disabled={loading}
                        >
                          <option value="">-- Choisir un sujet --</option>
                          {SUBJECTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {errors.subject && <span className="field-error">{errors.subject}</span>}
                      </div>
                    </div>

                    <div className={`form-group ${errors.message ? "has-error" : ""}`}>
                      <label htmlFor="message">
                        Message <span className="required">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="6"
                        placeholder="Décrivez votre demande en détail..."
                        disabled={loading}
                      />
                      <div className="textarea-footer">
                        {errors.message && <span className="field-error">{errors.message}</span>}
                        <span className="char-count">{formData.message.length} / 2000</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <FontAwesome name="paper-plane" />
                          Envoyer le message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
