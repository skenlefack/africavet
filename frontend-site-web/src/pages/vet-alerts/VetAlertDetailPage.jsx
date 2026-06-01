import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { vetAlertsApi, API_BASE_URL } from '../../services/api';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';

const PRIORITY_CONFIG = {
  critical: { label: 'Critique', color: '#d32f2f', bg: '#ffebee', icon: 'exclamation-circle' },
  high: { label: 'Élevée', color: '#e65100', bg: '#fff3e0', icon: 'exclamation-triangle' },
  medium: { label: 'Moyenne', color: '#f9a825', bg: '#fffde7', icon: 'info-circle' },
  low: { label: 'Faible', color: '#2e7d32', bg: '#e8f5e9', icon: 'check-circle' },
};

const TYPE_CONFIG = {
  maladie: { label: 'Maladie', icon: 'bug' },
  mortalite: { label: 'Mortalité', icon: 'heartbeat' },
  intoxication: { label: 'Intoxication', icon: 'flask' },
  autre: { label: 'Autre', icon: 'bell' },
};

const STATUS_CONFIG = {
  active: { label: 'Active', color: '#d32f2f', bg: '#ffebee' },
  investigating: { label: 'En cours d\'investigation', color: '#e65100', bg: '#fff3e0' },
  resolved: { label: 'Résolue', color: '#2e7d32', bg: '#e8f5e9' },
  closed: { label: 'Clôturée', color: '#607d8b', bg: '#eceff1' },
};

const VetAlertDetailPage = () => {
  const { id } = useParams();

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    loadAlert();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const loadAlert = async () => {
    setLoading(true);
    setError(null);

    const res = await vetAlertsApi.getById(id);
    if (res.success && res.data) {
      setAlert(res.data);
    } else {
      setError(res.message || 'Alerte introuvable');
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (typeof path === 'object' && path.url) path = path.url;
    if (typeof path !== 'string') return null;
    if (path.startsWith('http')) return path;
    const base = API_BASE_URL.replace('/api', '');
    return `${base}${path}`;
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Chargement de l'alerte..." />;
  }

  if (error || !alert) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '60px', color: '#ddd', marginBottom: '20px' }}>
          <FontAwesome name="exclamation-triangle" />
        </div>
        <h2 style={{ color: '#666' }}>{error || 'Alerte introuvable'}</h2>
        <p style={{ color: '#999' }}>Cette alerte n'existe pas ou a été retirée.</p>
        <Link to="/alertes-veterinaires" className="btn btn-primary mt-3">
          <FontAwesome name="arrow-left" /> Retour aux alertes
        </Link>
      </div>
    );
  }

  const priorityCfg = PRIORITY_CONFIG[alert.priority] || PRIORITY_CONFIG.medium;
  const typeCfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.autre;
  const statusCfg = STATUS_CONFIG[alert.status] || STATUS_CONFIG.active;

  const displayTitle = alert.title_fr || alert.title || 'Alerte sans titre';
  const displayDescription = alert.description_fr || alert.description || '';
  const displaySymptoms = alert.symptoms_fr || alert.symptoms || '';

  // Build photos array
  const photos = [];
  if (alert.photos && Array.isArray(alert.photos)) {
    alert.photos.forEach(p => {
      const url = getImageUrl(p);
      if (url) photos.push(url);
    });
  }
  if (alert.image) {
    const url = getImageUrl(alert.image);
    if (url && !photos.includes(url)) photos.push(url);
  }

  const location = [alert.city, alert.region, alert.country].filter(Boolean).join(', ');

  return (
    <div className="vet-alert-detail-page">
      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(135deg, ${priorityCfg.color} 0%, #880e4f 100%)`,
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
            <Link to="/alertes-veterinaires" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
              Alertes Vétérinaires
            </Link>
            <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
            <span>{displayTitle.length > 50 ? displayTitle.substring(0, 50) + '...' : displayTitle}</span>
          </nav>

          {/* Badges */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(255,255,255,0.25)',
                color: '#fff',
                fontSize: '13px',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <FontAwesome name={priorityCfg.icon} /> Priorité : {priorityCfg.label}
            </span>
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '13px',
                padding: '6px 14px',
                borderRadius: '20px',
              }}
            >
              <FontAwesome name={typeCfg.icon} /> {typeCfg.label}
            </span>
            <span
              className="badge"
              style={{
                backgroundColor: statusCfg.bg,
                color: statusCfg.color,
                fontSize: '13px',
                padding: '6px 14px',
                borderRadius: '20px',
              }}
            >
              {statusCfg.label}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '15px', lineHeight: '1.3' }}>
            {displayTitle}
          </h1>

          {/* Meta Info */}
          <div className="d-flex flex-wrap gap-4" style={{ fontSize: '14px', opacity: 0.9 }}>
            {alert.species && (
              <span><FontAwesome name="paw" /> {alert.species}</span>
            )}
            {location && (
              <span><FontAwesome name="map-marker" /> {location}</span>
            )}
            {alert.created_at && (
              <span><FontAwesome name="calendar" /> {formatDateShort(alert.created_at)}</span>
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
              {/* Photo Gallery */}
              {photos.length > 0 && (
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                      <FontAwesome name="camera" /> Photos
                    </h3>

                    {/* Main photo */}
                    <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
                      <img
                        src={selectedPhoto || photos[0]}
                        alt={displayTitle}
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => window.open(selectedPhoto || photos[0], '_blank')}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>

                    {/* Thumbnails */}
                    {photos.length > 1 && (
                      <div className="d-flex gap-2 flex-wrap">
                        {photos.map((photo, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedPhoto(photo)}
                            style={{
                              width: '80px',
                              height: '60px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: (selectedPhoto || photos[0]) === photo ? `3px solid ${priorityCfg.color}` : '2px solid #e0e0e0',
                              opacity: (selectedPhoto || photos[0]) === photo ? 1 : 0.7,
                              transition: 'opacity 0.2s, border 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => {
                              if ((selectedPhoto || photos[0]) !== photo) e.currentTarget.style.opacity = '0.7';
                            }}
                          >
                            <img
                              src={photo}
                              alt={`Photo ${idx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body" style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                    <FontAwesome name="file-text-o" /> Description
                  </h3>
                  <div
                    style={{ lineHeight: '1.8', color: '#444', fontSize: '15px' }}
                    dangerouslySetInnerHTML={{ __html: displayDescription }}
                  />
                </div>
              </div>

              {/* Symptoms */}
              {displaySymptoms && (
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                  <div className="card-body" style={{ padding: '25px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                      <FontAwesome name="stethoscope" /> Symptômes observés
                    </h3>
                    <div
                      style={{ lineHeight: '1.8', color: '#444', fontSize: '15px' }}
                      dangerouslySetInnerHTML={{ __html: displaySymptoms }}
                    />
                  </div>
                </div>
              )}

              {/* Additional details if available */}
              {(alert.affected_count || alert.mortality_count || alert.diagnosis) && (
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                  <div className="card-body" style={{ padding: '25px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                      <FontAwesome name="bar-chart" /> Données complémentaires
                    </h3>
                    <div className="row g-3">
                      {alert.affected_count && (
                        <div className="col-md-4">
                          <div className="p-3 border rounded text-center" style={{ borderRadius: '8px' }}>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#d32f2f' }}>{alert.affected_count}</div>
                            <div style={{ fontSize: '13px', color: '#666' }}>Animaux affectés</div>
                          </div>
                        </div>
                      )}
                      {alert.mortality_count && (
                        <div className="col-md-4">
                          <div className="p-3 border rounded text-center" style={{ borderRadius: '8px' }}>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#b71c1c' }}>{alert.mortality_count}</div>
                            <div style={{ fontSize: '13px', color: '#666' }}>Décès</div>
                          </div>
                        </div>
                      )}
                      {alert.diagnosis && (
                        <div className="col-md-4">
                          <div className="p-3 border rounded text-center" style={{ borderRadius: '8px' }}>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#354e84' }}>{alert.diagnosis}</div>
                            <div style={{ fontSize: '13px', color: '#666' }}>Diagnostic</div>
                          </div>
                        </div>
                      )}
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
              {/* Priority & Status Card */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div
                  style={{
                    background: priorityCfg.color,
                    padding: '20px',
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >
                  <FontAwesome name={priorityCfg.icon} style={{ fontSize: '28px', marginBottom: '8px', display: 'block' }} />
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>Priorité {priorityCfg.label}</div>
                  <div
                    className="badge mt-2"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      color: '#fff',
                      fontSize: '13px',
                      padding: '5px 12px',
                      borderRadius: '20px',
                    }}
                  >
                    Statut : {statusCfg.label}
                  </div>
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
                      <span style={{ width: '28px', color: '#666' }}><FontAwesome name={typeCfg.icon} /></span>
                      <div>
                        <strong style={{ color: '#333' }}>Type</strong><br />
                        <span style={{ color: '#666' }}>{typeCfg.label}</span>
                      </div>
                    </li>
                    {alert.species && (
                      <li className="d-flex align-items-start mb-3">
                        <span style={{ width: '28px', color: '#666' }}><FontAwesome name="paw" /></span>
                        <div>
                          <strong style={{ color: '#333' }}>Espèce(s)</strong><br />
                          <span style={{ color: '#666' }}>{alert.species}</span>
                        </div>
                      </li>
                    )}
                    {alert.country && (
                      <li className="d-flex align-items-start mb-3">
                        <span style={{ width: '28px', color: '#666' }}><FontAwesome name="globe" /></span>
                        <div>
                          <strong style={{ color: '#333' }}>Pays</strong><br />
                          <span style={{ color: '#666' }}>{alert.country}</span>
                        </div>
                      </li>
                    )}
                    {alert.region && (
                      <li className="d-flex align-items-start mb-3">
                        <span style={{ width: '28px', color: '#666' }}><FontAwesome name="map-o" /></span>
                        <div>
                          <strong style={{ color: '#333' }}>Région</strong><br />
                          <span style={{ color: '#666' }}>{alert.region}</span>
                        </div>
                      </li>
                    )}
                    {alert.city && (
                      <li className="d-flex align-items-start mb-3">
                        <span style={{ width: '28px', color: '#666' }}><FontAwesome name="map-pin" /></span>
                        <div>
                          <strong style={{ color: '#333' }}>Ville</strong><br />
                          <span style={{ color: '#666' }}>{alert.city}</span>
                        </div>
                      </li>
                    )}
                    {alert.created_at && (
                      <li className="d-flex align-items-start mb-3">
                        <span style={{ width: '28px', color: '#666' }}><FontAwesome name="calendar" /></span>
                        <div>
                          <strong style={{ color: '#333' }}>Date de signalement</strong><br />
                          <span style={{ color: '#666' }}>{formatDate(alert.created_at)}</span>
                        </div>
                      </li>
                    )}
                    {alert.updated_at && alert.updated_at !== alert.created_at && (
                      <li className="d-flex align-items-start mb-3">
                        <span style={{ width: '28px', color: '#666' }}><FontAwesome name="refresh" /></span>
                        <div>
                          <strong style={{ color: '#333' }}>Dernière mise à jour</strong><br />
                          <span style={{ color: '#666' }}>{formatDate(alert.updated_at)}</span>
                        </div>
                      </li>
                    )}
                    {alert.contact_name && (
                      <li className="d-flex align-items-start mb-3">
                        <span style={{ width: '28px', color: '#666' }}><FontAwesome name="user" /></span>
                        <div>
                          <strong style={{ color: '#333' }}>Signalé par</strong><br />
                          <span style={{ color: '#666' }}>{alert.contact_name}</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Action Card */}
              <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <div className="card-body" style={{ padding: '20px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#354e84' }}>
                    <FontAwesome name="bell" /> Vous avez observé un cas similaire ?
                  </h4>
                  <p style={{ color: '#666', fontSize: '13px', marginBottom: '15px' }}>
                    Aidez à suivre cette alerte en soumettant vos propres observations.
                  </p>
                  <Link
                    to="/soumettre-alerte"
                    className="btn w-100"
                    style={{
                      background: 'linear-gradient(135deg, #d32f2f 0%, #880e4f 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      padding: '10px',
                    }}
                  >
                    <FontAwesome name="plus-circle" /> Soumettre une alerte
                  </Link>
                  <Link
                    to="/alertes-veterinaires"
                    className="btn btn-outline-secondary btn-sm w-100 mt-2"
                    style={{ borderRadius: '8px' }}
                  >
                    <FontAwesome name="arrow-left" /> Toutes les alertes
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VetAlertDetailPage;
