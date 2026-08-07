import React, { useState } from "react";
import ProtoTypes from "prop-types";
import { useTranslation } from 'react-i18next';
import FontAwesome from "../uiStyle/FontAwesome";
import { newsletterApi } from "../../services/api";
import "./newsletter.scss";

const NewsLetter = ({ className, input_white, titleClass }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | 'exists'
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage(t('home.invalidEmail'));
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await newsletterApi.subscribe(email);
      if (res.success) {
        setStatus("success");
        setMessage(res.message || t('home.subscribeSuccess'));
        setEmail("");
      } else {
        if (res.message && res.message.toLowerCase().includes("déjà")) {
          setStatus("exists");
          setMessage(t('home.alreadySubscribed'));
        } else {
          setStatus("error");
          setMessage(res.message || t('auth.genericError'));
        }
      }
    } catch (err) {
      setStatus("error");
      setMessage(t('contact.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`newsletter-widget mb30 ${className || ""}`}>
      <div className="newsletter-inner">
        <div className="newsletter-icon">
          <FontAwesome name="envelope-open" />
          <div className="newsletter-pulse" />
        </div>
        <h3 className={`newsletter-title ${titleClass || ""}`}>{t('home.newsletter')} AfricaVET</h3>
        <p className="newsletter-desc">
          {t('home.newsletterDesc')}
        </p>

        {status === "success" ? (
          <div className="newsletter-success">
            <div className="success-icon">
              <FontAwesome name="check-circle" />
            </div>
            <p>{message}</p>
          </div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <div className="newsletter-input-group">
              <FontAwesome name="envelope" className="input-icon" />
              <input
                className={`newsletter-input ${input_white ? "white_bg" : ""}`}
                type="email"
                placeholder={t('home.enterEmail')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status) setStatus(null);
                }}
                disabled={loading}
                required
              />
            </div>
            <button type="submit" className="newsletter-btn" disabled={loading}>
              {loading ? (
                <FontAwesome name="spinner fa-spin" />
              ) : (
                <>
                  <FontAwesome name="paper-plane" />
                  <span>{t('home.subscribe')}</span>
                </>
              )}
            </button>

            {status === "error" && (
              <div className="newsletter-feedback error">
                <FontAwesome name="exclamation-circle" /> {message}
              </div>
            )}
            {status === "exists" && (
              <div className="newsletter-feedback info">
                <FontAwesome name="info-circle" /> {message}
              </div>
            )}

            <p className="newsletter-privacy">
              <FontAwesome name="lock" /> {t('home.dataPrivacy')}
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewsLetter;

NewsLetter.propTypes = {
  className: ProtoTypes.string,
  titleClass: ProtoTypes.string,
  input_white: ProtoTypes.bool,
};
