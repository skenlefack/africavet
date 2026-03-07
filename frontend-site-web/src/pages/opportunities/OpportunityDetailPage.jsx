import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { opportunitiesApi, API_BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import OpportunityCard from '../../component/opportunities/OpportunityCard';

const TYPE_CONFIG = {
  emploi: { label: 'Emploi', color: '#2196F3', icon: 'briefcase' },
  appel_offre: { label: "Appel d'offres", color: '#FF9800', icon: 'gavel' },
  marche: { label: 'March\u00e9', color: '#9C27B0', icon: 'handshake-o' },
  bourse: { label: 'Bourse', color: '#4CAF50', icon: 'graduation-cap' },
};

const OpportunityDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [relatedOpportunities, setRelatedOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOpportunity();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const loadOpportunity = async () => {
    setLoading(true);
    setError(null);

    const res = await opportunitiesApi.getById(id);
    if (res.success && res.data) {
      setOpportunity(res.data);

      // Load related opportunities of same type
      const relRes = await opportunitiesApi.getAll({ type: res.data.type, limit: 4 });
      if (relRes.success) {
        setRelatedOpportunities(
          (relRes.data || []).filter(o => o.id !== parseInt(id)).slice(0, 3)
        );
      }
    } else {
      setError(res.message || 'Opportunit\u00e9 introuvable');
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getCountdown = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;

    if (diff <= 0) return { expired: true, text: 'Date limite d\u00e9pass\u00e9e' };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 30) {
      const months = Math.floor(days / 30);
      return { expired: false, text: `${months} mois et ${days % 30} jours restants`, days };
    }
    if (days > 0) {
      return { expired: false, text: `${days} jour${days > 1 ? 's' : ''} et ${hours}h restants`, days };
    }
    return { expired: false, text: `${hours} heure${hours > 1 ? 's' : ''} restantes`, days: 0 };
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = API_BASE_URL.replace('/api', '');
    return `${base}${path}`;
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Chargement de l'opportunit\u00e9..." />;
  }

  if (error || !opportunity) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '60px', color: '#ddd', marginBottom: '20px' }}>
          <FontAwesome name="exclamation-triangle" />
        </div>
        <h2 style={{ color: '#666' }}>{error || 'Opportunit\u00e9 introuvable'}</h2>
        <p style={{ color: '#999' }}>Cette opportunit\u00e9 n'existe pas ou a \u00e9t\u00e9 retir\u00e9e.</p>
        <Link to="/opportunites" className="btn btn-primary mt-3">
          <FontAwesome name="arrow-left" /> Retour aux opportunit\u00e9s
        </Link>
      </div>
    );
  }

  const config = TYPE_CONFIG[opportunity.type] || { label: opportunity.type || 'Autre', color: '#607D8B', icon: 'file-text-o' };
  const countdown = getCountdown(opportunity.deadline);
  const displayTitle = opportunity.title_fr || opportunity.title || 'Sans titre';
  const displayDescription = opportunity.description_fr || opportunity.description || '';
  const displayRequirements = opportunity.requirements_fr || opportunity.requirements || '';

  return (
    <div className="opportunity-detail-page">
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
          padding: '40px 0 30px',
          color: '#fff',
        }}
      >
        <div className="container">
          {/* Breadcrumb */}
          <nav style={{ marginBottom: '20px', fontSize: '14px' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
              <FontAwesome name="home" /> Accueil
            </Link>
            <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
            <Link to="/opportunites" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
              Opportunit\u00e9s
            </Link>
            <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
            <span>{displayTitle.length > 50 ? displayTitle.substring(0, 50) + '...' : displayTitle}</span>
          </nav>

          {/* Type Badge */}
          <span
            className="badge mb-3"
            style={{
              backgroundColor: config.color,
              color: '#fff',
              fontSize: '13px',
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'inline-block',
            }}
          >
            <FontAwesome name={config.icon} /> {config.label}
          </span>

          {/* Title */}
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '15px', lineHeight: '1.3' }}>
            {displayTitle}
          </h1>

          {/* Meta Info */}
          <div className="d-flex flex-wrap gap-4" style={{ fontSize: '14px', opacity: 0.9 }}>
            {opportunity.organization && (
              <span><FontAwesome name="building-o" /> {opportunity.organization}</span>
            )}
            {opportunity.country && (
              <span><FontAwesome name="map-marker" /> {opportunity.country}</span>
            )}
            {opportunity.created_at && (
              <span><FontAwesome name="calendar" /> Publi\u00e9e le {formatDate(opportunity.created_at)}</span>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '30px 0 50px' }}>
        <div className="container">
          <div className="row">
            {/* Left Content */}
            <div className="col-lg-8">
              {/* Featured Image */}
              {opportunity.image && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '25px' }}>
                  <img
                    src={getImageUrl(opportunity.image)}
                    alt={displayTitle}
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Description */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body" style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                    <FontAwesome name="file-text-o" /> Description
                  </h3>
                  <div
                    className="article-body"
                    style={{ lineHeight: '1.8', color: '#444', fontSize: '15px' }}
                    dangerouslySetInnerHTML={{ __html: displayDescription }}
                  />
                </div>
              </div>

              {/* Requirements */}
              {displayRequirements && (
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                  <div className="card-body" style={{ padding: '25px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                      <FontAwesome name="check-square-o" /> Conditions requises
                    </h3>
                    <div
                      style={{ lineHeight: '1.8', color: '#444', fontSize: '15px' }}
                      dangerouslySetInnerHTML={{ __html: displayRequirements }}
                    />
                  </div>
                </div>
              )}

              {/* Documents */}
              {opportunity.documents && opportunity.documents.length > 0 && (
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                  <div className="card-body" style={{ padding: '25px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                      <FontAwesome name="paperclip" /> Documents joints
                    </h3>
                    <div className="d-flex flex-column gap-2">
                      {opportunity.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={getImageUrl(doc.url || doc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="d-flex align-items-center gap-2 p-2 border rounded text-decoration-none"
                          style={{ color: '#354e84' }}
                        >
                          <FontAwesome name="file-pdf-o" />
                          <span>{doc.name || doc.filename || `Document ${idx + 1}`}</span>
                          <FontAwesome name="download" style={{ marginLeft: 'auto' }} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="d-flex align-items-center gap-3 mb-4" style={{ paddingTop: '10px' }}>
                <span style={{ color: '#666', fontWeight: '600', fontSize: '14px' }}>
                  <FontAwesome name="share-alt" /> Partager:
                </span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{ background: '#3b5998', color: '#fff', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FontAwesome name="facebook" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(displayTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{ background: '#1da1f2', color: '#fff', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FontAwesome name="twitter" />
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(displayTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{ background: '#0077b5', color: '#fff', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FontAwesome name="linkedin" />
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(displayTitle + ' ' + window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{ background: '#25D366', color: '#fff', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FontAwesome name="whatsapp" />
                </a>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              {/* Deadline Card */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div
                  style={{
                    background: countdown?.expired ? '#f44336' : 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                    padding: '20px',
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >
                  <FontAwesome name="clock-o" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }} />
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Date limite</div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>
                    {opportunity.deadline ? formatDate(opportunity.deadline) : 'Non sp\u00e9cifi\u00e9e'}
                  </div>
                  {countdown && (
                    <div style={{ fontSize: '13px', marginTop: '6px', opacity: 0.9 }}>
                      {countdown.expired ? (
                        <span><FontAwesome name="times-circle" /> {countdown.text}</span>
                      ) : (
                        <span><FontAwesome name="hourglass-half" /> {countdown.text}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="card-body text-center" style={{ padding: '20px' }}>
                  {countdown?.expired ? (
                    <div>
                      <p style={{ color: '#999', fontSize: '14px', marginBottom: '10px' }}>
                        Cette opportunit\u00e9 n'est plus disponible.
                      </p>
                      <Link to="/opportunites" className="btn btn-outline-primary btn-sm">
                        Voir d'autres opportunit\u00e9s
                      </Link>
                    </div>
                  ) : isAuthenticated ? (
                    <Link
                      to={`/opportunites/${id}/postuler`}
                      className="btn btn-lg w-100"
                      style={{
                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        padding: '12px',
                      }}
                    >
                      <FontAwesome name="paper-plane" /> Postuler
                    </Link>
                  ) : (
                    <div>
                      <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                        Connectez-vous pour postuler \u00e0 cette opportunit\u00e9.
                      </p>
                      <Link
                        to="/connexion"
                        state={{ from: { pathname: `/opportunites/${id}/postuler` } }}
                        className="btn btn-primary w-100"
                        style={{ borderRadius: '8px', fontWeight: '600' }}
                      >
                        <FontAwesome name="sign-in" /> Se connecter
                      </Link>
                      <Link
                        to="/inscription"
                        className="btn btn-outline-secondary btn-sm w-100 mt-2"
                        style={{ borderRadius: '8px' }}
                      >
                        Cr\u00e9er un compte
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Card */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                    <FontAwesome name="info-circle" /> Informations
                  </h4>
                  <ul className="list-unstyled" style={{ fontSize: '14px' }}>
                    <li className="d-flex align-items-start mb-3">
                      <span style={{ width: '28px', color: config.color }}><FontAwesome name={config.icon} /></span>
                      <div>
                        <strong style={{ color: '#333' }}>Type</strong><br />
                        <span style={{ color: '#666' }}>{config.label}</span>
                      </div>
                    </li>
                    {opportunity.organization && (
                      <li className="d-flex align-items-start mb-3">
                        <span style={{ width: '28px', color: '#666' }}><FontAwesome name="building-o" /></span>
                        <div>
                          <strong style={{ color: '#333' }}>Organisation</strong><br />
                          <span style={{ color: '#666' }}>{opportunity.organization}</span>
                        </div>
                      </li>
                    )}
                    {opportunity.country && (
                      <li className="d-flex align-items-start mb-3">
                        <span style={{ width: '28px', color: '#666' }}><FontAwesome name="map-marker" /></span>
                        <div>
                          <strong style={{ color: '#333' }}>Pays</strong><br />
                          <span style={{ color: '#666' }}>{opportunity.country}</span>
                        </div>
                      </li>
                    )}
                    {opportunity.city && (
                      <li className="d-flex align-items-start mb-3">
                        <span style={{ width: '28px', color: '#666' }}><FontAwesome name="map-pin" /></span>
                        <div>
                          <strong style={{ color: '#333' }}>Ville</strong><br />
                          <span style={{ color: '#666' }}>{opportunity.city}</span>
                        </div>
                      </li>
                    )}
                    {opportunity.salary && (
                      <li className="d-flex align-items-start mb-3">
                        <span style={{ width: '28px', color: '#666' }}><FontAwesome name="money" /></span>
                        <div>
                          <strong style={{ color: '#333' }}>R\u00e9mun\u00e9ration</strong><br />
                          <span style={{ color: '#666' }}>{opportunity.salary}</span>
                        </div>
                      </li>
                    )}
                    {opportunity.contract_type && (
                      <li className="d-flex align-items-start mb-3">
                        <span style={{ width: '28px', color: '#666' }}><FontAwesome name="file-text-o" /></span>
                        <div>
                          <strong style={{ color: '#333' }}>Type de contrat</strong><br />
                          <span style={{ color: '#666' }}>{opportunity.contract_type}</span>
                        </div>
                      </li>
                    )}
                    {opportunity.created_at && (
                      <li className="d-flex align-items-start">
                        <span style={{ width: '28px', color: '#666' }}><FontAwesome name="calendar-plus-o" /></span>
                        <div>
                          <strong style={{ color: '#333' }}>Date de publication</strong><br />
                          <span style={{ color: '#666' }}>{formatDate(opportunity.created_at)}</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Related Opportunities */}
              {relatedOpportunities.length > 0 && (
                <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                      <FontAwesome name="th-list" /> Opportunit\u00e9s similaires
                    </h4>
                    <div className="d-flex flex-column gap-3">
                      {relatedOpportunities.map(rel => (
                        <Link
                          key={rel.id}
                          to={`/opportunites/${rel.id}`}
                          className="d-flex gap-3 p-2 rounded text-decoration-none"
                          style={{ border: '1px solid #f0f0f0', transition: 'background 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div className="flex-grow-1">
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', lineHeight: '1.4', marginBottom: '4px' }}>
                              {(rel.title_fr || rel.title || '').substring(0, 60)}{(rel.title_fr || rel.title || '').length > 60 ? '...' : ''}
                            </div>
                            <div className="d-flex gap-2" style={{ fontSize: '11px', color: '#999' }}>
                              {rel.organization && <span><FontAwesome name="building-o" /> {rel.organization}</span>}
                              {rel.country && <span><FontAwesome name="map-marker" /> {rel.country}</span>}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      to="/opportunites"
                      className="btn btn-outline-primary btn-sm w-100 mt-3"
                      style={{ borderRadius: '8px' }}
                    >
                      Voir toutes les opportunit\u00e9s
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OpportunityDetailPage;
