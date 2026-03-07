import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { elearningApi } from '../../services/api';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import './elearning.scss';

const CertificateVerifyPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchCode, setSearchCode] = useState(code || '');

  useEffect(() => {
    if (code) {
      verifyCertificate(code);
    }
  }, [code]);

  const verifyCertificate = async (verifyCode) => {
    if (!verifyCode || !verifyCode.trim()) return;

    setLoading(true);
    setError(null);
    setCertificate(null);

    const res = await elearningApi.verifyCertificate(verifyCode.trim());

    if (res.success && res.data) {
      setCertificate(res.data);
    } else {
      setError(res.message || 'Certificat introuvable ou invalide.');
    }

    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCode.trim()) {
      if (searchCode.trim() !== code) {
        navigate(`/certificat/verification/${searchCode.trim()}`);
      } else {
        verifyCertificate(searchCode.trim());
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="certificate-verify">
      <div className="container">
        <div className="verify-card">
          {/* Header */}
          {loading ? (
            <div className="verify-header">
              <div className="verify-icon">
                <FontAwesome name="spinner" className="fa-spin" />
              </div>
              <h2>Verification en cours...</h2>
            </div>
          ) : certificate ? (
            <div className="verify-header">
              <div className="verify-icon">
                <FontAwesome name="check-circle" />
              </div>
              <h2>Certificat valide</h2>
            </div>
          ) : error ? (
            <div className="verify-header invalid">
              <div className="verify-icon">
                <FontAwesome name="times-circle" />
              </div>
              <h2>Certificat invalide</h2>
            </div>
          ) : (
            <div className="verify-header">
              <div className="verify-icon">
                <FontAwesome name="certificate" />
              </div>
              <h2>Verification de certificat</h2>
            </div>
          )}

          {/* Body */}
          <div className="verify-body">
            {/* Loading */}
            {loading && (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" />
                <p className="mt-2" style={{ color: '#888' }}>
                  Verification du certificat...
                </p>
              </div>
            )}

            {/* Certificate Details */}
            {!loading && certificate && (
              <ul className="verify-info">
                <li>
                  <span className="label">Titulaire</span>
                  <span className="value">
                    {certificate.user_name || certificate.holder_name || 'Non renseigne'}
                  </span>
                </li>
                <li>
                  <span className="label">Formation</span>
                  <span className="value">
                    {certificate.course_title_fr || certificate.course_title || 'Formation'}
                  </span>
                </li>
                {certificate.score !== undefined && (
                  <li>
                    <span className="label">Score obtenu</span>
                    <span className="value" style={{ color: '#7ac142' }}>
                      {certificate.score}%
                    </span>
                  </li>
                )}
                <li>
                  <span className="label">Date d'obtention</span>
                  <span className="value">
                    {formatDate(certificate.issued_at || certificate.created_at)}
                  </span>
                </li>
                <li>
                  <span className="label">Code de verification</span>
                  <span className="value" style={{ fontFamily: 'monospace' }}>
                    {certificate.code || certificate.verification_code || code}
                  </span>
                </li>
                {certificate.instructor_name && (
                  <li>
                    <span className="label">Formateur</span>
                    <span className="value">{certificate.instructor_name}</span>
                  </li>
                )}
              </ul>
            )}

            {/* Error Message */}
            {!loading && error && (
              <div className="text-center py-3">
                <p style={{ color: '#dc3545', marginBottom: 16 }}>
                  <FontAwesome name="exclamation-triangle" /> {error}
                </p>
                <p style={{ color: '#888', fontSize: 14 }}>
                  Verifiez le code et reessayez, ou contactez-nous si le probleme persiste.
                </p>
              </div>
            )}

            {/* Search Form */}
            <div className="verify-search">
              <p style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>
                {certificate || error
                  ? 'Verifier un autre certificat :'
                  : 'Entrez le code du certificat pour le verifier :'}
              </p>
              <form onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Code du certificat..."
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                  />
                  <button type="submit" disabled={loading || !searchCode.trim()}>
                    <FontAwesome name="search" /> Verifier
                  </button>
                </div>
              </form>
            </div>

            {/* Back link */}
            <div className="text-center mt-4">
              <Link to="/formations" style={{ fontSize: 14, color: '#888' }}>
                <FontAwesome name="arrow-left" /> Retour aux formations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerifyPage;
