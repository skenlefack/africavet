import React from "react";
import ProtoTypes from "prop-types";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";

import africavetLogo from "../../assets/img/africavet-logo.png";
import "./footer.scss";

const FooterArea = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer-modern ${className ? className : ""}`}>
      {/* Footer Main */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Section */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <img src={africavetLogo} alt="AfricaVET" style={{ height: '50px', background: '#fff', padding: '6px 12px', borderRadius: '10px' }} />
              </Link>
              <p className="footer-tagline">
                Le portail de référence de la médecine vétérinaire en Afrique
              </p>
              <div className="footer-social">
                <a href="https://www.facebook.com/africavetwebportail/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FontAwesome name="facebook-f" />
                </a>
                <a href="https://x.com/africavet" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                  <FontAwesome name="twitter" />
                </a>
                <a href="https://whatsapp.com/channel/0029Vb7GhhAKrWR4oDYbAS3U" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <FontAwesome name="whatsapp" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div className="footer-links">
              <h4>Nos Services</h4>
              <ul>
                <li><Link to="/categorie/news"><FontAwesome name="newspaper-o" /> S'informer</Link></li>
                <li><Link to="/categorie/one-health"><FontAwesome name="globe" /> One Health</Link></li>
                <li><Link to="/categorie/formations"><FontAwesome name="graduation-cap" /> Se Former</Link></li>
                <li><Link to="/categorie/opportunites"><FontAwesome name="briefcase" /> Opportunités</Link></li>
                <li><Link to="/annuaire"><FontAwesome name="address-book" /> Annuaire Vétérinaire</Link></li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="footer-links">
              <h4>Navigation</h4>
              <ul>
                <li><Link to="/"><FontAwesome name="home" /> Accueil</Link></li>
                <li><Link to="/about"><FontAwesome name="info-circle" /> À propos</Link></li>
                <li><Link to="/contact"><FontAwesome name="envelope" /> Contact</Link></li>
                <li><Link to="/publicite"><FontAwesome name="bullhorn" /> Publicité</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-contact">
              <h4>Contact</h4>
              <div className="contact-item">
                <FontAwesome name="envelope" />
                <span>contact@africavet.com</span>
              </div>
              <div className="contact-item">
                <FontAwesome name="globe" />
                <span>www.africavet.com</span>
              </div>
              <Link to="/inscription" className="footer-cta">
                <FontAwesome name="user-plus" />
                Rejoindre la communauté
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>© {currentYear} AfricaVET. Tous droits réservés.</p>
            <div className="footer-legal">
              <Link to="/mentions-legales">Mentions légales</Link>
              <span>•</span>
              <Link to="/confidentialite">Confidentialité</Link>
              <span>•</span>
              <Link to="/conditions">CGU</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterArea;

FooterArea.propTypes = {
  className: ProtoTypes.string,
};
