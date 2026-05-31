import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import { annuaireApi } from '../../services/api';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const OrganizationDetailPage = () => {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrg = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await annuaireApi.getById(id);
        if (response.success) {
          setOrg(response.data);
        } else {
          setError(response.message || 'Organisation introuvable.');
        }
      } catch (err) {
        setError('Erreur de connexion au serveur.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage text="Chargement du profil..." />;

  if (error) {
    return (
      <div className="container text-center" style={{ padding: '80px 20px' }}>
        <FontAwesome name="exclamation-triangle" style={{ fontSize: '60px', color: '#e74c3c', display: 'block', marginBottom: '20px' }} />
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Erreur</h3>
        <p style={{ color: '#666', marginBottom: '24px' }}>{error}</p>
        <Link to="/annuaire" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none', borderRadius: '8px', padding: '10px 28px' }}>
          <FontAwesome name="arrow-left" style={{ marginRight: '8px' }} />
          Retour a l'annuaire
        </Link>
      </div>
    );
  }

  if (!org) return null;

  const logoUrl = (org.logo || org.photo) ? `${API_BASE_URL}${org.logo || org.photo}` : null;
  const services = org.services || [];

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef', padding: '12px 0' }}>
        <div className="container">
          <nav style={{ fontSize: '13px', color: '#666' }}>
            <Link to="/" style={{ color: '#7ac142', textDecoration: 'none' }}>Accueil</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link to="/annuaire" style={{ color: '#7ac142', textDecoration: 'none' }}>Annuaire</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#333' }}>{org.name}</span>
          </nav>
        </div>
      </div>

      {/* Organization header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #354e84 0%, #7ac142 100%)',
          padding: '40px 0 60px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: '10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-center" style={{ gap: '24px' }}>
            {/* Logo */}
            <div
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '16px',
                background: logoUrl ? '#fff' : 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '4px solid rgba(255,255,255,0.3)',
                flexShrink: 0,
              }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={org.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
              ) : (
                <FontAwesome name="building" style={{ color: '#fff', fontSize: '42px' }} />
              )}
            </div>

            {/* Info */}
            <div className="text-center text-md-left">
              <h1 style={{ color: '#fff', fontWeight: '800', fontSize: '28px', marginBottom: '6px' }}>
                {org.name}
              </h1>
              {org.organization_type && (
                <span
                  className="badge mb-2"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    padding: '6px 16px',
                    borderRadius: '25px',
                    display: 'inline-block',
                  }}
                >
                  <FontAwesome name="tag" style={{ marginRight: '6px' }} />
                  {org.organization_type}
                </span>
              )}
              <div className="d-flex flex-wrap justify-content-center justify-content-md-start mt-2" style={{ gap: '16px' }}>
                {org.country && (
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                    <FontAwesome name="map-marker" style={{ marginRight: '6px' }} />
                    {[org.city, org.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {org.founded_year && (
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                    <FontAwesome name="calendar" style={{ marginRight: '6px' }} />
                    Fondee en {org.founded_year}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ marginTop: '-30px', paddingBottom: '60px' }}>
        <div className="row">
          {/* Main content */}
          <div className="col-lg-8">
            {/* Description */}
            {org.description && (
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                  <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '16px' }}>
                    <FontAwesome name="info-circle" style={{ marginRight: '10px' }} />
                    A propos
                  </h5>
                  <p style={{ color: '#555', lineHeight: '1.8', fontSize: '15px', whiteSpace: 'pre-line' }}>
                    {org.description}
                  </p>
                </div>
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                  <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '20px' }}>
                    <FontAwesome name="cogs" style={{ marginRight: '10px' }} />
                    Services proposes
                  </h5>
                  <div className="row">
                    {services.map((service, idx) => (
                      <div key={idx} className="col-md-6 mb-3">
                        <div
                          className="d-flex align-items-start"
                          style={{
                            padding: '14px',
                            background: '#f8f9fa',
                            borderRadius: '10px',
                            gap: '12px',
                          }}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <FontAwesome name="check" style={{ color: '#fff', fontSize: '12px' }} />
                          </div>
                          <span style={{ color: '#444', fontSize: '14px', fontWeight: '500', paddingTop: '4px' }}>
                            {typeof service === 'string' ? service : service.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Additional info / Mission */}
            {org.mission && (
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                  <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '16px' }}>
                    <FontAwesome name="bullseye" style={{ marginRight: '10px' }} />
                    Notre mission
                  </h5>
                  <p style={{ color: '#555', lineHeight: '1.8', fontSize: '15px', whiteSpace: 'pre-line' }}>
                    {org.mission}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Contact info */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
              <div className="card-body p-4">
                <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '20px' }}>
                  <FontAwesome name="phone" style={{ marginRight: '10px' }} />
                  Contact
                </h5>

                {org.email && (
                  <div className="d-flex align-items-center mb-3">
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#e8f5e9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginRight: '12px',
                      }}
                    >
                      <FontAwesome name="envelope" style={{ color: '#7ac142', fontSize: '14px' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <small style={{ color: '#999', display: 'block', fontSize: '11px' }}>Email</small>
                      <a
                        href={`mailto:${org.email}`}
                        style={{ color: '#333', fontSize: '14px', textDecoration: 'none', wordBreak: 'break-all' }}
                      >
                        {org.email}
                      </a>
                    </div>
                  </div>
                )}

                {org.phone && (
                  <div className="d-flex align-items-center mb-3">
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#e3f2fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginRight: '12px',
                      }}
                    >
                      <FontAwesome name="phone" style={{ color: '#354e84', fontSize: '14px' }} />
                    </div>
                    <div>
                      <small style={{ color: '#999', display: 'block', fontSize: '11px' }}>Telephone</small>
                      <a href={`tel:${org.phone}`} style={{ color: '#333', fontSize: '14px', textDecoration: 'none' }}>
                        {org.phone}
                      </a>
                    </div>
                  </div>
                )}

                {org.website && (
                  <div className="d-flex align-items-center mb-3">
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#fff3e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginRight: '12px',
                      }}
                    >
                      <FontAwesome name="globe" style={{ color: '#e65100', fontSize: '14px' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <small style={{ color: '#999', display: 'block', fontSize: '11px' }}>Site web</small>
                      <a
                        href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#354e84', fontSize: '14px', textDecoration: 'none', wordBreak: 'break-all', fontWeight: '600' }}
                      >
                        <FontAwesome name="external-link" style={{ marginRight: '4px', fontSize: '12px' }} />
                        {org.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}

                {!org.email && !org.phone && !org.website && (
                  <p style={{ color: '#999', fontSize: '14px', textAlign: 'center' }}>
                    <FontAwesome name="lock" style={{ marginRight: '6px' }} />
                    Aucune information de contact disponible
                  </p>
                )}
              </div>
            </div>

            {/* Location / Address */}
            {(org.country || org.city || org.address) && (
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                  <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '16px' }}>
                    <FontAwesome name="map-marker" style={{ marginRight: '10px' }} />
                    Adresse
                  </h5>
                  <div
                    style={{
                      background: '#f8f9fa',
                      borderRadius: '10px',
                      padding: '20px',
                    }}
                  >
                    <FontAwesome name="map" style={{ fontSize: '32px', color: '#ccc', display: 'block', textAlign: 'center', marginBottom: '12px' }} />
                    {org.address && (
                      <p style={{ fontWeight: '500', color: '#555', fontSize: '14px', textAlign: 'center', marginBottom: '8px' }}>
                        {org.address}
                      </p>
                    )}
                    <p style={{ fontWeight: '600', color: '#333', fontSize: '15px', textAlign: 'center', margin: 0 }}>
                      {org.city && <>{org.city}, </>}
                      {org.country}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Website CTA */}
            {org.website && (
              <a
                href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn w-100 mb-3"
                style={{
                  background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '700',
                  fontSize: '14px',
                }}
              >
                <FontAwesome name="external-link" style={{ marginRight: '8px' }} />
                Visiter le site web
              </a>
            )}

            {/* Back button */}
            <Link
              to="/annuaire?tab=organisations"
              className="btn w-100"
              style={{
                background: '#f8f9fa',
                color: '#555',
                borderRadius: '10px',
                padding: '12px',
                fontWeight: '600',
                fontSize: '14px',
                border: '1px solid #e0e0e0',
              }}
            >
              <FontAwesome name="arrow-left" style={{ marginRight: '8px' }} />
              Retour a l'annuaire
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizationDetailPage;
