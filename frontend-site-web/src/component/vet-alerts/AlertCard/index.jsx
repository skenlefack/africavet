import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from '../../uiStyle/FontAwesome';

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const PRIORITY_CONFIG = {
  critical: { label: 'Critique', color: '#d32f2f', bg: '#ffebee', icon: 'exclamation-circle' },
  high: { label: '\u00c9lev\u00e9e', color: '#e65100', bg: '#fff3e0', icon: 'exclamation-triangle' },
  medium: { label: 'Moyenne', color: '#f9a825', bg: '#fffde7', icon: 'info-circle' },
  low: { label: 'Faible', color: '#2e7d32', bg: '#e8f5e9', icon: 'check-circle' },
};

const TYPE_CONFIG = {
  maladie: { label: 'Maladie', icon: 'bug' },
  mortalite: { label: 'Mortalit\u00e9', icon: 'heartbeat' },
  intoxication: { label: 'Intoxication', icon: 'flask' },
  autre: { label: 'Autre', icon: 'bell' },
};

const STATUS_CONFIG = {
  active: { label: 'Active', color: '#d32f2f', bg: '#ffebee' },
  investigating: { label: 'En cours', color: '#e65100', bg: '#fff3e0' },
  resolved: { label: 'R\u00e9solue', color: '#2e7d32', bg: '#e8f5e9' },
  closed: { label: 'Cl\u00f4tur\u00e9e', color: '#607d8b', bg: '#eceff1' },
};

const AlertCard = ({ alert }) => {
  const {
    id,
    title,
    title_fr,
    type,
    priority,
    species,
    country,
    region,
    description,
    description_fr,
    status,
    created_at,
    photos,
    image,
  } = alert;

  const priorityCfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const typeCfg = TYPE_CONFIG[type] || TYPE_CONFIG.autre;
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.active;

  const displayTitle = title_fr || title || 'Alerte sans titre';
  const displayDesc = description_fr || description || '';

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

  const imageUrl = (() => {
    if (photos && photos.length > 0) {
      const photo = photos[0];
      if (typeof photo === 'string') {
        return photo.startsWith('http') ? photo : `${BACKEND_URL}${photo}`;
      }
      if (photo.url) {
        return photo.url.startsWith('http') ? photo.url : `${BACKEND_URL}${photo.url}`;
      }
    }
    if (image) {
      return image.startsWith('http') ? image : `${BACKEND_URL}${image}`;
    }
    return null;
  })();

  const location = [region, country].filter(Boolean).join(', ');

  return (
    <div
      className="card h-100 border-0 shadow-sm"
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        borderLeft: `4px solid ${priorityCfg.color}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}
    >
      {/* Image thumbnail if available */}
      {imageUrl && (
        <Link to={`/alertes-veterinaires/${id}`}>
          <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
            <img
              src={imageUrl}
              alt={displayTitle}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
              <span
                className="badge"
                style={{
                  backgroundColor: priorityCfg.color,
                  color: '#fff',
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                <FontAwesome name={priorityCfg.icon} /> {priorityCfg.label}
              </span>
            </div>
          </div>
        </Link>
      )}

      <div className="card-body d-flex flex-column" style={{ padding: '16px' }}>
        {/* Badges row */}
        <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
          {!imageUrl && (
            <span
              className="badge"
              style={{
                backgroundColor: priorityCfg.bg,
                color: priorityCfg.color,
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: '600',
              }}
            >
              <FontAwesome name={priorityCfg.icon} /> {priorityCfg.label}
            </span>
          )}
          <span
            className="badge"
            style={{
              backgroundColor: '#f5f5f5',
              color: '#555',
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: '6px',
            }}
          >
            <FontAwesome name={typeCfg.icon} /> {typeCfg.label}
          </span>
          <span
            className="badge"
            style={{
              backgroundColor: statusCfg.bg,
              color: statusCfg.color,
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: '6px',
            }}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Title */}
        <h5 style={{ fontSize: '15px', fontWeight: '700', lineHeight: '1.4', marginBottom: '8px' }}>
          <Link
            to={`/alertes-veterinaires/${id}`}
            style={{ color: '#1a1a2e', textDecoration: 'none' }}
            onMouseEnter={(e) => e.target.style.color = '#354e84'}
            onMouseLeave={(e) => e.target.style.color = '#1a1a2e'}
          >
            {truncate(displayTitle, 75)}
          </Link>
        </h5>

        {/* Species */}
        {species && (
          <p style={{ color: '#666', fontSize: '13px', marginBottom: '4px' }}>
            <FontAwesome name="paw" /> {species}
          </p>
        )}

        {/* Location */}
        {location && (
          <p style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>
            <FontAwesome name="map-marker" /> {location}
          </p>
        )}

        {/* Description */}
        <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.5', flex: 1 }}>
          {truncate(displayDesc, 100)}
        </p>

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center mt-auto pt-3" style={{ borderTop: '1px solid #f0f0f0' }}>
          <small style={{ color: '#999', fontSize: '12px' }}>
            <FontAwesome name="clock-o" /> {formatDate(created_at)}
          </small>
          <Link
            to={`/alertes-veterinaires/${id}`}
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
            D\u00e9tails <FontAwesome name="arrow-right" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
