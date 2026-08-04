import React from "react";
import ProtoTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import FontAwesome from "../uiStyle/FontAwesome";

import africavetLogo from "../../assets/img/africavet-logo.png";
import "./footer.scss";

const FooterArea = ({ className }) => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className={`footer-modern ${className ? className : ""}`}>
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <img src={africavetLogo} alt="AfricaVET" style={{ height: '50px', background: '#fff', padding: '6px 12px', borderRadius: '10px' }} />
              </Link>
              <p className="footer-tagline">
                {t('footer.description')}
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

            <div className="footer-links">
              <h4>{t('footer.services')}</h4>
              <ul>
                <li><Link to="/categorie/news"><FontAwesome name="newspaper-o" /> {t('footer.inform')}</Link></li>
                <li><Link to="/categorie/one-health"><FontAwesome name="globe" /> One Health</Link></li>
                <li><Link to="/formations"><FontAwesome name="graduation-cap" /> {t('footer.learn')}</Link></li>
                <li><Link to="/opportunites"><FontAwesome name="briefcase" /> {t('opportunities.title')}</Link></li>
                <li><Link to="/annuaire"><FontAwesome name="address-book" /> {t('annuaire.title')}</Link></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>{t('footer.quickLinks')}</h4>
              <ul>
                <li><Link to="/"><FontAwesome name="home" /> {t('nav.home')}</Link></li>
                <li><Link to="/about"><FontAwesome name="info-circle" /> {t('nav.about')}</Link></li>
                <li><Link to="/contact"><FontAwesome name="envelope" /> {t('nav.contact')}</Link></li>
                <li><Link to="/publicite"><FontAwesome name="bullhorn" /> {t('footer.advertising')}</Link></li>
              </ul>
            </div>

            <div className="footer-contact">
              <h4>{t('nav.contact')}</h4>
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
                {t('footer.joinCommunity')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} AfricaVET. {t('footer.copyright')}</p>
            <div className="footer-legal">
              <Link to="/mentions-legales">{t('footer.legal')}</Link>
              <span>&bull;</span>
              <Link to="/confidentialite">{t('footer.privacy')}</Link>
              <span>&bull;</span>
              <Link to="/conditions">{t('footer.terms')}</Link>
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
