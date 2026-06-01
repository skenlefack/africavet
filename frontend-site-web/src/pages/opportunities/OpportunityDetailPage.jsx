import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { opportunitiesApi, API_BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import OpportunityCard from '../../component/opportunities/OpportunityCard';

const TYPE_CONFIG = {
  job: { label: 'Emploi', color: '#2196F3', icon: 'briefcase' },
  tender: { label: "Appel d'offres", color: '#FF9800', icon: 'gavel' },
  market: { label: 'Marché', color: '#9C27B0', icon: 'handshake-o' },
  emploi: { label: 'Emploi', color: '#2196F3', icon: 'briefcase' },
  appel_offre: { label: "Appel d'offres", color: '#FF9800', icon: 'gavel' },
  marche: { label: 'Marché', color: '#9C27B0', icon: 'handshake-o' },
  bourse: { label: 'Bourse', color: '#4CAF50', icon: 'graduation-cap' },
};

const JOB_TYPE_LABELS = {
  full_time: 'Temps plein',
  part_time: 'Temps partiel',
  contract: 'Contrat',
  internship: 'Stage',
  volunteer: 'Bénévolat',
  freelance: 'Freelance',
};

const FILE_ICONS = {
  pdf: { icon: 'file-pdf-o', color: '#e53935' },
  word: { icon: 'file-word-o', color: '#1565c0' },
  excel: { icon: 'file-excel-o', color: '#2e7d32' },
  powerpoint: { icon: 'file-powerpoint-o', color: '#e65100' },
  image: { icon: 'file-image-o', color: '#7b1fa2' },
  video: { icon: 'file-video-o', color: '#00838f' },
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

      const oppType = res.data.opportunity_type || res.data.type;
      const relRes = await opportunitiesApi.getAll({ type: oppType, limit: 4 });
      if (relRes.success) {
        setRelatedOpportunities(
          (relRes.data || []).filter(o => o.id !== parseInt(id)).slice(0, 3)
        );
      }
    } else {
      setError(res.message || 'Opportunité introuvable');
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatSalary = (opp) => {
    if (!opp.salary_min && !opp.salary_max) return null;
    const fmt = (n) => Number(n).toLocaleString('fr-FR');
    const cur = opp.salary_currency || 'XAF';
    const period = { hour: '/h', day: '/jour', month: '/mois', year: '/an', project: '/projet' }[opp.salary_period] || '/mois';
    if (opp.salary_min && opp.salary_max) return `${fmt(opp.salary_min)} - ${fmt(opp.salary_max)} ${cur}${period}`;
    if (opp.salary_min) return `${fmt(opp.salary_min)}+ ${cur}${period}`;
    return `${fmt(opp.salary_max)} ${cur}${period}`;
  };

  const getCountdown = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return { expired: true, text: 'Date limite dépassée' };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 30) return { expired: false, text: `${Math.floor(days / 30)} mois et ${days % 30} jours restants`, days };
    if (days > 0) return { expired: false, text: `${days} jour${days > 1 ? 's' : ''} et ${hours}h restants`, days };
    return { expired: false, text: `${hours} heure${hours > 1 ? 's' : ''} restantes`, days: 0 };
  };

  const getFileUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http')) return path;
    const base = API_BASE_URL.replace('/api', '');
    return `${base}${path}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  };

  if (loading) return <LoadingSpinner fullPage text="Chargement de l'opportunité..." />;

  if (error || !opportunity) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '60px', color: '#ddd', marginBottom: '20px' }}><FontAwesome name="exclamation-triangle" /></div>
        <h2 style={{ color: '#666' }}>{error || 'Opportunité introuvable'}</h2>
        <p style={{ color: '#999' }}>Cette opportunité n'existe pas ou a été retirée.</p>
        <Link to="/opportunites" className="btn btn-primary mt-3"><FontAwesome name="arrow-left" /> Retour aux opportunités</Link>
      </div>
    );
  }

  const opp = opportunity;
  const type = opp.opportunity_type || opp.type;
  const config = TYPE_CONFIG[type] || { label: type || 'Autre', color: '#607D8B', icon: 'file-text-o' };
  const countdown = getCountdown(opp.deadline);
  const displayTitle = opp.title_fr || opp.title || 'Sans titre';
  const displayDescription = opp.description_fr || opp.description || '';
  const org = opp.organization_name || opp.organization || '';
  const salary = formatSalary(opp);

  // Parse attachments
  let attachments = [];
  try {
    if (opp.attachments) {
      attachments = typeof opp.attachments === 'string' ? JSON.parse(opp.attachments) : opp.attachments;
    }
  } catch { /* ignore */ }

  return (
    <div className="opportunity-detail-page">
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', padding: '40px 0 30px', color: '#fff' }}>
        <div className="container">
          <nav style={{ marginBottom: '20px', fontSize: '14px' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}><FontAwesome name="home" /> Accueil</Link>
            <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
            <Link to="/opportunites" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Opportunités</Link>
            <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
            <span>{displayTitle.length > 50 ? displayTitle.substring(0, 50) + '...' : displayTitle}</span>
          </nav>

          <div className="d-flex flex-wrap gap-2 mb-3">
            <span className="badge" style={{ backgroundColor: config.color, color: '#fff', fontSize: '13px', padding: '6px 14px', borderRadius: '20px' }}>
              <FontAwesome name={config.icon} /> {config.label}
            </span>
            {opp.is_urgent && (
              <span className="badge" style={{ backgroundColor: '#f44336', color: '#fff', fontSize: '13px', padding: '6px 14px', borderRadius: '20px' }}>
                <FontAwesome name="bolt" /> Urgent
              </span>
            )}
            {opp.is_featured && (
              <span className="badge" style={{ backgroundColor: '#FF9800', color: '#fff', fontSize: '13px', padding: '6px 14px', borderRadius: '20px' }}>
                <FontAwesome name="star" /> En vedette
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '15px', lineHeight: '1.3' }}>{displayTitle}</h1>

          <div className="d-flex flex-wrap gap-4" style={{ fontSize: '14px', opacity: 0.9 }}>
            {org && <span><FontAwesome name="building-o" /> {org}</span>}
            {opp.country && <span><FontAwesome name="map-marker" /> {[opp.city, opp.country].filter(Boolean).join(', ')}</span>}
            {opp.created_at && <span><FontAwesome name="calendar" /> Publiée le {formatDate(opp.created_at)}</span>}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '30px 0 50px' }}>
        <div className="container">
          <div className="row">
            {/* Left Content */}
            <div className="col-lg-8">
              {/* Quick Info Bar */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body d-flex flex-wrap gap-4" style={{ padding: '16px 24px' }}>
                  {opp.job_type && JOB_TYPE_LABELS[opp.job_type] && (
                    <div className="d-flex align-items-center gap-2">
                      <FontAwesome name="file-text-o" style={{ color: config.color }} />
                      <div><small style={{ color: '#999', display: 'block', fontSize: '11px' }}>Contrat</small><strong style={{ fontSize: '13px' }}>{JOB_TYPE_LABELS[opp.job_type]}</strong></div>
                    </div>
                  )}
                  {opp.experience_required && (
                    <div className="d-flex align-items-center gap-2">
                      <FontAwesome name="bar-chart" style={{ color: config.color }} />
                      <div><small style={{ color: '#999', display: 'block', fontSize: '11px' }}>Expérience</small><strong style={{ fontSize: '13px' }}>{opp.experience_required}</strong></div>
                    </div>
                  )}
                  {opp.education_required && (
                    <div className="d-flex align-items-center gap-2">
                      <FontAwesome name="graduation-cap" style={{ color: config.color }} />
                      <div><small style={{ color: '#999', display: 'block', fontSize: '11px' }}>Formation</small><strong style={{ fontSize: '13px' }}>{opp.education_required}</strong></div>
                    </div>
                  )}
                  {salary && (
                    <div className="d-flex align-items-center gap-2">
                      <FontAwesome name="money" style={{ color: '#2e7d32' }} />
                      <div><small style={{ color: '#999', display: 'block', fontSize: '11px' }}>Rémunération</small><strong style={{ fontSize: '13px', color: '#2e7d32' }}>{salary}</strong></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body" style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                    <FontAwesome name="file-text-o" /> Description du poste
                  </h3>
                  <div className="article-body" style={{ lineHeight: '1.8', color: '#444', fontSize: '15px' }}
                    dangerouslySetInnerHTML={{ __html: displayDescription }} />
                </div>
              </div>

              {/* Fichiers joints / Attachments */}
              {attachments.length > 0 && (
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                  <div className="card-body" style={{ padding: '25px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                      <FontAwesome name="paperclip" /> Documents joints ({attachments.length})
                    </h3>
                    <div className="d-flex flex-column gap-2">
                      {attachments.map((file, idx) => {
                        const fileConf = FILE_ICONS[file.type] || { icon: 'file-o', color: '#666' };
                        return (
                          <a key={idx} href={getFileUrl(file.url)} target="_blank" rel="noopener noreferrer"
                            className="d-flex align-items-center gap-3 p-3 rounded text-decoration-none"
                            style={{ border: '1px solid #e0e0e0', transition: 'all 0.2s', background: '#fafafa' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f7ff'; e.currentTarget.style.borderColor = '#90caf9'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
                          >
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `${fileConf.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <FontAwesome name={fileConf.icon} style={{ fontSize: '20px', color: fileConf.color }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {file.name || `Document ${idx + 1}`}
                              </div>
                              {file.size && <div style={{ fontSize: '12px', color: '#999' }}>{formatFileSize(file.size)}</div>}
                            </div>
                            <div style={{ color: '#1976d2', fontSize: '14px', flexShrink: 0 }}>
                              <FontAwesome name="download" /> Télécharger
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact */}
              {(opp.contact_name || opp.contact_email || opp.contact_phone || opp.website_url) && (
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                  <div className="card-body" style={{ padding: '25px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                      <FontAwesome name="address-card-o" /> Contact
                    </h3>
                    <div className="row g-3">
                      {opp.contact_name && (
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesome name="user" style={{ color: '#999', width: '20px' }} />
                            <div><small style={{ color: '#999' }}>Nom</small><div style={{ fontWeight: '500' }}>{opp.contact_name}</div></div>
                          </div>
                        </div>
                      )}
                      {opp.contact_email && (
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesome name="envelope" style={{ color: '#999', width: '20px' }} />
                            <div><small style={{ color: '#999' }}>Email</small><div><a href={`mailto:${opp.contact_email}`} style={{ color: '#1976d2' }}>{opp.contact_email}</a></div></div>
                          </div>
                        </div>
                      )}
                      {opp.contact_phone && (
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesome name="phone" style={{ color: '#999', width: '20px' }} />
                            <div><small style={{ color: '#999' }}>Téléphone</small><div>{opp.contact_phone}</div></div>
                          </div>
                        </div>
                      )}
                      {opp.website_url && (
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesome name="globe" style={{ color: '#999', width: '20px' }} />
                            <div><small style={{ color: '#999' }}>Site web</small><div><a href={opp.website_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>{opp.website_url.replace(/^https?:\/\//, '')}</a></div></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="d-flex align-items-center gap-3 mb-4" style={{ paddingTop: '10px' }}>
                <span style={{ color: '#666', fontWeight: '600', fontSize: '14px' }}><FontAwesome name="share-alt" /> Partager:</span>
                {[
                  { name: 'facebook', bg: '#3b5998', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
                  { name: 'twitter', bg: '#1da1f2', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(displayTitle)}` },
                  { name: 'linkedin', bg: '#0077b5', url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(displayTitle)}` },
                  { name: 'whatsapp', bg: '#25D366', url: `https://wa.me/?text=${encodeURIComponent(displayTitle + ' ' + window.location.href)}` },
                ].map(social => (
                  <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm"
                    style={{ background: social.bg, color: '#fff', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome name={social.name} />
                  </a>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              {/* Deadline Card */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ background: countdown?.expired ? '#f44336' : 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', padding: '20px', color: '#fff', textAlign: 'center' }}>
                  <FontAwesome name="clock-o" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }} />
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Date limite</div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>{opp.deadline ? formatDate(opp.deadline) : 'Non spécifiée'}</div>
                  {countdown && (
                    <div style={{ fontSize: '13px', marginTop: '6px', opacity: 0.9 }}>
                      <FontAwesome name={countdown.expired ? 'times-circle' : 'hourglass-half'} /> {countdown.text}
                    </div>
                  )}
                </div>
                <div className="card-body text-center" style={{ padding: '20px' }}>
                  {countdown?.expired ? (
                    <div>
                      <p style={{ color: '#999', fontSize: '14px', marginBottom: '10px' }}>Cette opportunité n'est plus disponible.</p>
                      <Link to="/opportunites" className="btn btn-outline-primary btn-sm">Voir d'autres opportunités</Link>
                    </div>
                  ) : isAuthenticated ? (
                    <Link to={`/opportunites/${id}/postuler`} className="btn btn-lg w-100"
                      style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', padding: '12px' }}>
                      <FontAwesome name="paper-plane" /> Postuler maintenant
                    </Link>
                  ) : (
                    <div>
                      <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>Connectez-vous pour postuler.</p>
                      <Link to="/connexion" state={{ from: { pathname: `/opportunites/${id}/postuler` } }}
                        className="btn btn-primary w-100" style={{ borderRadius: '8px', fontWeight: '600' }}>
                        <FontAwesome name="sign-in" /> Se connecter
                      </Link>
                      <Link to="/inscription" className="btn btn-outline-secondary btn-sm w-100 mt-2" style={{ borderRadius: '8px' }}>Créer un compte</Link>
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
                  <ul className="list-unstyled" style={{ fontSize: '14px', marginBottom: 0 }}>
                    {[
                      { icon: config.icon, color: config.color, label: 'Type', value: config.label },
                      org && { icon: 'building-o', label: 'Organisation', value: org },
                      opp.country && { icon: 'map-marker', label: 'Localisation', value: [opp.city, opp.region, opp.country].filter(Boolean).join(', ') },
                      opp.is_remote && { icon: 'wifi', label: 'Télétravail', value: 'Possible' },
                      opp.job_type && JOB_TYPE_LABELS[opp.job_type] && { icon: 'file-text-o', label: 'Contrat', value: JOB_TYPE_LABELS[opp.job_type] },
                      opp.experience_required && { icon: 'bar-chart', label: 'Expérience', value: opp.experience_required },
                      opp.education_required && { icon: 'graduation-cap', label: 'Formation', value: opp.education_required },
                      salary && { icon: 'money', label: 'Rémunération', value: salary, valueColor: '#2e7d32' },
                      opp.created_at && { icon: 'calendar-plus-o', label: 'Publication', value: formatDate(opp.created_at) },
                    ].filter(Boolean).map((item, idx) => (
                      <li key={idx} className="d-flex align-items-start mb-3">
                        <span style={{ width: '28px', color: item.color || '#999', flexShrink: 0 }}><FontAwesome name={item.icon} /></span>
                        <div>
                          <strong style={{ color: '#333', fontSize: '13px' }}>{item.label}</strong><br />
                          <span style={{ color: item.valueColor || '#666', fontSize: '13px' }}>{item.value}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Related Opportunities */}
              {relatedOpportunities.length > 0 && (
                <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                      <FontAwesome name="th-list" /> Opportunités similaires
                    </h4>
                    <div className="d-flex flex-column gap-3">
                      {relatedOpportunities.map(rel => {
                        const relType = rel.opportunity_type || rel.type;
                        const relConf = TYPE_CONFIG[relType] || { color: '#607D8B', icon: 'file-text-o' };
                        return (
                          <Link key={rel.id} to={`/opportunites/${rel.id}`}
                            className="d-flex gap-3 p-2 rounded text-decoration-none"
                            style={{ border: '1px solid #f0f0f0', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ width: '6px', borderRadius: '3px', background: relConf.color, flexShrink: 0 }} />
                            <div className="flex-grow-1">
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', lineHeight: '1.4', marginBottom: '4px' }}>
                                {(rel.title_fr || rel.title || '').substring(0, 60)}{(rel.title_fr || '').length > 60 ? '...' : ''}
                              </div>
                              <div className="d-flex gap-2" style={{ fontSize: '11px', color: '#999' }}>
                                {(rel.organization_name || rel.organization) && <span><FontAwesome name="building-o" /> {rel.organization_name || rel.organization}</span>}
                                {rel.country && <span><FontAwesome name="map-marker" /> {rel.country}</span>}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <Link to="/opportunites" className="btn btn-outline-primary btn-sm w-100 mt-3" style={{ borderRadius: '8px' }}>
                      Voir toutes les opportunités
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
