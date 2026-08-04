import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import BreadCrumb from "../../../component/BreadCrumb";
import FontAwesome from "../../../component/uiStyle/FontAwesome";
import { contactApi } from "../../../services/api";
import "./contact.scss";

const Contact = () => {
  const { t } = useTranslation();

  const SUBJECTS = [
    t('contact.subjectGeneral'),
    t('contact.subjectPartnership'),
    t('contact.subjectSupport'),
    "E-learning",
    t('nav.directory'),
    t('opportunities.title'),
    "RecallVet",
    t('contact.subjectAdvertising'),
    t('contact.subjectReport'),
    t('contact.subjectOther'),
  ];
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
    if (!formData.name.trim()) newErrors.name = t('contact.nameRequired');
    if (!formData.email.trim()) {
      newErrors.email = t('contact.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.emailInvalid');
    }
    if (!formData.subject) newErrors.subject = t('contact.subjectRequired');
    if (!formData.message.trim()) {
      newErrors.message = t('contact.messageRequired');
    } else if (formData.message.trim().length < 20) {
      newErrors.message = t('contact.messageTooShort');
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
        setServerError(result.message || t('contact.error'));
      }
    } catch (err) {
      setServerError(t('contact.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BreadCrumb className="shadow5" title={t('nav.contact')} />

      <div className="contact-page">
        <div className="container">
          <div className="contact-wrapper">
            {/* Left: Info Panel */}
            <div className="contact-info-panel">
              <div className="info-header">
                <h1>{t('contact.title')}</h1>
                <p>{t('contact.subtitle')}</p>
              </div>

              <div className="info-cards">
                <div className="info-card">
                  <div className="info-card-icon">
                    <FontAwesome name="envelope" />
                  </div>
                  <div className="info-card-content">
                    <h3>{t('auth.email')}</h3>
                    <p>contact@africavet.com</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-icon">
                    <FontAwesome name="globe-africa" />
                  </div>
                  <div className="info-card-content">
                    <h3>{t('contact.website')}</h3>
                    <p>www.africavet.com</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-icon">
                    <FontAwesome name="clock" />
                  </div>
                  <div className="info-card-content">
                    <h3>{t('contact.availability')}</h3>
                    <p>{t('contact.availabilityHours')}</p>
                  </div>
                </div>
              </div>

              <div className="info-services">
                <h3>{t('footer.services')}</h3>
                <div className="services-grid">
                  <Link to="/formations" className="service-tag">
                    <FontAwesome name="graduation-cap" />
                    <span>E-learning</span>
                  </Link>
                  <Link to="/annuaire" className="service-tag">
                    <FontAwesome name="address-book" />
                    <span>{t('nav.directory')}</span>
                  </Link>
                  <Link to="/opportunites" className="service-tag">
                    <FontAwesome name="briefcase" />
                    <span>{t('opportunities.title')}</span>
                  </Link>
                  <Link to="/bibliotheque" className="service-tag">
                    <FontAwesome name="book" />
                    <span>{t('documents.library')}</span>
                  </Link>
                  <Link to="/alertes-veterinaires" className="service-tag">
                    <FontAwesome name="exclamation-triangle" />
                    <span>{t('alerts.title')}</span>
                  </Link>
                </div>
              </div>

              <div className="info-social">
                <h3>{t('footer.followUs')}</h3>
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
                  <h2>{t('contact.messageSent')}</h2>
                  <p>{t('contact.success')}</p>
                  <p className="success-hint">{t('contact.confirmationSent')}</p>
                  <button
                    className="btn-new-message"
                    onClick={() => setSuccess(false)}
                  >
                    <FontAwesome name="paper-plane" />
                    {t('contact.sendAnother')}
                  </button>
                </div>
              ) : (
                <div className="form-card">
                  <div className="form-header">
                    <h2>{t('contact.sendMessage')}</h2>
                    <p>{t('contact.formSubtitle')}</p>
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
                          {t('contact.name')} <span className="required">*</span>
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
                          {t('contact.email')} <span className="required">*</span>
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
                        <label htmlFor="phone">{t('contact.phone')}</label>
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
                          {t('contact.subject')} <span className="required">*</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          disabled={loading}
                        >
                          <option value="">-- {t('contact.chooseSubject')} --</option>
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
                        {t('contact.message')} <span className="required">*</span>
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
                          {t('contact.sending')}
                        </>
                      ) : (
                        <>
                          <FontAwesome name="paper-plane" />
                          {t('contact.sendMessage')}
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
