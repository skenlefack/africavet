import React, { useState } from "react";
import ProtoTypes from "prop-types";
import FontAwesome from "../uiStyle/FontAwesome";
import { newsletterApi } from "../../services/api";
import "./newsletter.scss";

const NewsLetter = ({ className, input_white, titleClass }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | 'exists'
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Veuillez entrer une adresse email valide.");
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await newsletterApi.subscribe(email);
      if (res.success) {
        setStatus("success");
        setMessage(res.message || "Inscription réussie ! Vérifiez votre boîte mail.");
        setEmail("");
      } else {
        if (res.message && res.message.toLowerCase().includes("déjà")) {
          setStatus("exists");
          setMessage("Vous êtes déjà inscrit(e) à notre newsletter.");
        } else {
          setStatus("error");
          setMessage(res.message || "Une erreur est survenue.");
        }
      }
    } catch (err) {
      setStatus("error");
      setMessage("Erreur de connexion. Réessayez plus tard.");
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
        <h3 className={`newsletter-title ${titleClass || ""}`}>Newsletter AfricaVET</h3>
        <p className="newsletter-desc">
          Recevez les dernières actualités vétérinaires et opportunités directement dans votre boîte mail.
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
                placeholder="votre@email.com"
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
                  <span>S'inscrire</span>
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
              <FontAwesome name="lock" /> Vos données restent confidentielles
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
