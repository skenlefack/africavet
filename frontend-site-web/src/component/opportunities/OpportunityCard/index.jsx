import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from '../../uiStyle/FontAwesome';

const TYPE_CONFIG = {
  emploi: { label: 'Emploi', color: '#2196F3', icon: 'briefcase' },
  appel_offre: { label: "Appel d'offres", color: '#FF9800', icon: 'gavel' },
  marche: { label: 'March\u00e9', color: '#9C27B0', icon: 'handshake-o' },
  bourse: { label: 'Bourse', color: '#4CAF50', icon: 'graduation-cap' },
};

const OpportunityCard = ({ opportunity }) => {
  const {
    id,
    title,
    title_fr,
    type,
    organization,
    country,
    deadline,
    description,
    description_fr,
    short_description,
    short_description_fr,
  } = opportunity;

  const config = TYPE_CONFIG[type] || { label: type || 'Autre', color: '#607D8B', icon: 'file-text-o' };
  const displayTitle = title_fr || title || 'Sans titre';
  const displayDesc = short_description_fr || short_description || description_fr || description || '';

  const truncate = (text, max) => {
    if (!text) return '';
    const stripped = text.replace(/<[^>]+>/g, '');
    return stripped.length > max ? stripped.substring(0, max).trim() + '...' : stripped;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = deadline && new Date(deadline) < new Date();

  const daysLeft = () => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return null;
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Demain';
    return `${diff} jours`;
  };

  const remaining = daysLeft();

  return (
    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}
    >
      <div className="card-body d-flex flex-column" style={{ padding: '20px' }}>
        {/* Type badge + deadline */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <span
            className="badge"
            style={{
              backgroundColor: config.color,
              color: '#fff',
              fontSize: '12px',
              padding: '5px 10px',
              borderRadius: '6px',
              fontWeight: '600',
            }}
          >
            <FontAwesome name={config.icon} /> {config.label}
          </span>
          {isExpired ? (
            <span className="badge" style={{ backgroundColor: '#f44336', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}>
              Expir\u00e9e
            </span>
          ) : remaining ? (
            <span className="badge" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}>
              <FontAwesome name="clock-o" /> {remaining}
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h5 style={{ fontSize: '16px', fontWeight: '700', lineHeight: '1.4', marginBottom: '10px', minHeight: '44px' }}>
          <Link to={`/opportunites/${id}`} style={{ color: '#1a1a2e', textDecoration: 'none' }}
            onMouseEnter={(e) => e.target.style.color = '#354e84'}
            onMouseLeave={(e) => e.target.style.color = '#1a1a2e'}
          >
            {truncate(displayTitle, 80)}
          </Link>
        </h5>

        {/* Organization */}
        {organization && (
          <p style={{ color: '#666', fontSize: '13px', marginBottom: '6px' }}>
            <FontAwesome name="building-o" /> {organization}
          </p>
        )}

        {/* Country */}
        {country && (
          <p style={{ color: '#666', fontSize: '13px', marginBottom: '10px' }}>
            <FontAwesome name="map-marker" /> {country}
          </p>
        )}

        {/* Description */}
        <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.5', flex: 1 }}>
          {truncate(displayDesc, 120)}
        </p>

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center mt-auto pt-3" style={{ borderTop: '1px solid #f0f0f0' }}>
          {deadline && (
            <small style={{ color: '#999', fontSize: '12px' }}>
              <FontAwesome name="calendar" /> Date limite: {formatDate(deadline)}
            </small>
          )}
          <Link
            to={`/opportunites/${id}`}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              padding: '5px 12px',
            }}
          >
            Voir <FontAwesome name="arrow-right" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
