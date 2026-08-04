import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

function Error() {
  const { t } = useTranslation();
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f4fd 50%, #f5f3ff 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-10 text-center py-5">
            {/* Big 404 */}
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <h1 style={{
                fontSize: 'clamp(100px, 18vw, 180px)',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                margin: 0,
                letterSpacing: '-4px'
              }}>
                404
              </h1>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 'clamp(40px, 8vw, 70px)',
                opacity: 0.12,
                pointerEvents: 'none'
              }}>
                <i className="fas fa-paw"></i>
              </div>
            </div>

            {/* Message */}
            <h2 style={{ color: '#354e84', fontWeight: 700, fontSize: '1.6rem', marginBottom: '0.75rem' }}>
              {t('errors.notFound')}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
              {t('errors.notFoundDesc')}
            </p>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
              <Link
                to="/"
                className="btn btn-lg px-4"
                style={{
                  background: 'linear-gradient(135deg, #7ac142 0%, #5da832 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(122, 193, 66, 0.3)'
                }}
              >
                <i className="fas fa-home me-2"></i>
                {t('errors.backHome')}
              </Link>
              <Link
                to="/contact"
                className="btn btn-lg btn-outline-secondary px-4"
                style={{ borderRadius: '10px', fontWeight: 600 }}
              >
                <i className="fas fa-envelope me-2"></i>
                {t('nav.contact')}
              </Link>
            </div>

            {/* Quick links */}
            <div style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1.5rem 2rem',
              marginTop: '1rem',
              border: '1px solid rgba(122, 193, 66, 0.15)'
            }}>
              <p style={{ color: '#374151', fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>
                <i className="fas fa-compass me-2" style={{ color: '#7ac142' }}></i>
                {t('footer.quickLinks')}
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link to="/categorie/news" style={{ color: '#354e84', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
                  <i className="fas fa-newspaper me-1"></i> {t('nav.news')}
                </Link>
                <Link to="/opportunites" style={{ color: '#354e84', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
                  <i className="fas fa-briefcase me-1"></i> {t('opportunities.title')}
                </Link>
                <Link to="/formations" style={{ color: '#354e84', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
                  <i className="fas fa-graduation-cap me-1"></i> {t('elearning.courses')}
                </Link>
                <Link to="/annuaire" style={{ color: '#354e84', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
                  <i className="fas fa-address-book me-1"></i> {t('nav.directory')}
                </Link>
                <Link to="/about" style={{ color: '#354e84', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
                  <i className="fas fa-info-circle me-1"></i> {t('nav.about')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Error;
