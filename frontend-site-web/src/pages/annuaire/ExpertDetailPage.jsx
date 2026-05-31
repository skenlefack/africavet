import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import { annuaireApi } from '../../services/api';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const ExpertDetailPage = () => {
  const { id } = useParams();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpert = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await annuaireApi.getById(id);
        if (response.success) {
          setExpert(response.data);
        } else {
          setError(response.message || 'Expert introuvable.');
        }
      } catch (err) {
        setError('Erreur de connexion au serveur.');
      } finally {
        setLoading(false);
      }
    };
    fetchExpert();
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

  if (!expert) return null;

  const imageUrl = expert.photo ? `${API_BASE_URL}${expert.photo}` : null;
  const skills = expert.skills || [];
  const experience = expert.experience || [];
  const education = expert.education || [];

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
            <span style={{ color: '#333' }}>{expert.name}</span>
          </nav>
        </div>
      </div>

      {/* Profile header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
          padding: '40px 0 60px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '5%',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-center" style={{ gap: '24px' }}>
            {/* Avatar */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: imageUrl ? 'transparent' : 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '4px solid rgba(255,255,255,0.3)',
                flexShrink: 0,
              }}
            >
              {imageUrl ? (
                <img src={imageUrl} alt={expert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FontAwesome name="user" style={{ color: '#fff', fontSize: '48px' }} />
              )}
            </div>

            {/* Info */}
            <div className="text-center text-md-left">
              <h1 style={{ color: '#fff', fontWeight: '800', fontSize: '28px', marginBottom: '6px' }}>
                {expert.name}
              </h1>
              {expert.specialization && (
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginBottom: '10px' }}>
                  <FontAwesome name="stethoscope" style={{ marginRight: '8px' }} />
                  {expert.specialization}
                </p>
              )}
              <div className="d-flex flex-wrap justify-content-center justify-content-md-start" style={{ gap: '12px' }}>
                {expert.country && (
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                    <FontAwesome name="map-marker" style={{ marginRight: '6px' }} />
                    {[expert.city, expert.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {expert.years_experience && (
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                    <FontAwesome name="briefcase" style={{ marginRight: '6px' }} />
                    {expert.years_experience} ans d'experience
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
            {/* About */}
            {expert.bio && (
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                  <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '16px' }}>
                    <FontAwesome name="user" style={{ marginRight: '10px' }} />
                    A propos
                  </h5>
                  <p style={{ color: '#555', lineHeight: '1.8', fontSize: '15px', whiteSpace: 'pre-line' }}>
                    {expert.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Specialties & Skills */}
            {skills.length > 0 && (
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                  <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '16px' }}>
                    <FontAwesome name="star" style={{ marginRight: '10px' }} />
                    Competences et specialites
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="badge"
                        style={{
                          background: 'linear-gradient(135deg, rgba(122,193,66,0.1) 0%, rgba(53,78,132,0.1) 100%)',
                          color: '#354e84',
                          fontSize: '13px',
                          fontWeight: '600',
                          padding: '8px 16px',
                          borderRadius: '25px',
                          border: '1px solid rgba(53,78,132,0.15)',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                  <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '20px' }}>
                    <FontAwesome name="briefcase" style={{ marginRight: '10px' }} />
                    Experience professionnelle
                  </h5>
                  <div style={{ position: 'relative', paddingLeft: '24px' }}>
                    {/* Timeline line */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '6px',
                        top: '8px',
                        bottom: '8px',
                        width: '2px',
                        background: 'linear-gradient(to bottom, #7ac142, #354e84)',
                      }}
                    />
                    {experience.map((exp, idx) => (
                      <div key={idx} className="mb-4" style={{ position: 'relative' }}>
                        {/* Timeline dot */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '-22px',
                            top: '6px',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: '#fff',
                            border: '3px solid #7ac142',
                          }}
                        />
                        <h6 style={{ fontWeight: '700', color: '#333', marginBottom: '4px', fontSize: '15px' }}>
                          {exp.title || exp.position}
                        </h6>
                        {exp.company && (
                          <p style={{ color: '#7ac142', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                            {exp.company}
                          </p>
                        )}
                        {(exp.start_date || exp.period) && (
                          <p style={{ color: '#999', fontSize: '13px', marginBottom: '6px' }}>
                            <FontAwesome name="calendar" style={{ marginRight: '6px' }} />
                            {exp.period || `${exp.start_date} - ${exp.end_date || 'Present'}`}
                          </p>
                        )}
                        {exp.description && (
                          <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                  <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '20px' }}>
                    <FontAwesome name="graduation-cap" style={{ marginRight: '10px' }} />
                    Formation
                  </h5>
                  {education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="d-flex mb-3"
                      style={{
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        gap: '16px',
                      }}
                    >
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesome name="graduation-cap" style={{ color: '#fff', fontSize: '18px' }} />
                      </div>
                      <div>
                        <h6 style={{ fontWeight: '700', color: '#333', marginBottom: '4px', fontSize: '14px' }}>
                          {edu.degree || edu.diploma}
                        </h6>
                        {edu.institution && (
                          <p style={{ color: '#7ac142', fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>
                            {edu.institution}
                          </p>
                        )}
                        {(edu.year || edu.period) && (
                          <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>
                            <FontAwesome name="calendar" style={{ marginRight: '4px' }} />
                            {edu.year || edu.period}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
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

                {expert.email && expert.show_email !== false && (
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
                        href={`mailto:${expert.email}`}
                        style={{ color: '#333', fontSize: '14px', textDecoration: 'none', wordBreak: 'break-all' }}
                      >
                        {expert.email}
                      </a>
                    </div>
                  </div>
                )}

                {expert.phone && expert.show_phone !== false && (
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
                      <a href={`tel:${expert.phone}`} style={{ color: '#333', fontSize: '14px', textDecoration: 'none' }}>
                        {expert.phone}
                      </a>
                    </div>
                  </div>
                )}

                {expert.website && (
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
                        href={expert.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#333', fontSize: '14px', textDecoration: 'none', wordBreak: 'break-all' }}
                      >
                        {expert.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}

                {!expert.email && !expert.phone && !expert.website && (
                  <p style={{ color: '#999', fontSize: '14px', textAlign: 'center' }}>
                    <FontAwesome name="lock" style={{ marginRight: '6px' }} />
                    Informations de contact privees
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            {(expert.country || expert.city) && (
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                  <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '16px' }}>
                    <FontAwesome name="map-marker" style={{ marginRight: '10px' }} />
                    Localisation
                  </h5>
                  <div
                    style={{
                      background: '#f8f9fa',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <FontAwesome name="map" style={{ fontSize: '32px', color: '#ccc', display: 'block', marginBottom: '12px' }} />
                    <p style={{ fontWeight: '600', color: '#333', fontSize: '15px', margin: 0 }}>
                      {expert.city && <>{expert.city}<br /></>}
                      {expert.country}
                    </p>
                    {expert.address && (
                      <p style={{ color: '#888', fontSize: '13px', marginTop: '8px', marginBottom: 0 }}>
                        {expert.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Back button */}
            <Link
              to="/annuaire?tab=experts"
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

export default ExpertDetailPage;
