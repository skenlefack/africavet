import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from '../../uiStyle/FontAwesome';

const API_BASE_URL = 'http://localhost:5000';

const DirectoryCard = ({ item }) => {
  const isExpert = item.type === 'expert';
  const detailUrl = isExpert
    ? `/annuaire/expert/${item.id}`
    : `/annuaire/organisation/${item.id}`;

  const defaultAvatar = isExpert
    ? null
    : null;

  const imageUrl = item.photo || item.logo
    ? `${API_BASE_URL}${item.photo || item.logo}`
    : null;

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div
        className="card h-100 border-0 shadow-sm"
        style={{ borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: '4px', background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }} />

        <div className="card-body d-flex flex-column p-4">
          {/* Header with avatar/logo */}
          <div className="d-flex align-items-center mb-3">
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: isExpert ? '50%' : '12px',
                background: imageUrl ? 'transparent' : 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <FontAwesome
                  name={isExpert ? 'user' : 'building'}
                  style={{ color: '#fff', fontSize: '24px' }}
                />
              )}
            </div>
            <div className="ms-3 flex-grow-1" style={{ minWidth: 0 }}>
              <h5
                className="mb-1"
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#222',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.name}
              </h5>
              <span
                className="badge"
                style={{
                  background: isExpert ? '#e8f5e9' : '#e3f2fd',
                  color: isExpert ? '#2e7d32' : '#1565c0',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '4px 10px',
                  borderRadius: '20px',
                }}
              >
                <FontAwesome name={isExpert ? 'user-md' : 'building-o'} />{' '}
                {isExpert ? 'Expert' : item.organization_type || 'Organisation'}
              </span>
            </div>
          </div>

          {/* Specialization / Description */}
          {(item.specialization || item.description) && (
            <p
              className="text-muted mb-3"
              style={{
                fontSize: '13px',
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.specialization || item.description}
            </p>
          )}

          {/* Skills tags (for experts) */}
          {isExpert && item.skills && item.skills.length > 0 && (
            <div className="mb-3 d-flex flex-wrap gap-1">
              {item.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="badge"
                  style={{
                    background: '#f5f5f5',
                    color: '#555',
                    fontSize: '11px',
                    fontWeight: '500',
                    padding: '3px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {skill}
                </span>
              ))}
              {item.skills.length > 3 && (
                <span style={{ fontSize: '11px', color: '#999' }}>
                  +{item.skills.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Services (for organizations) */}
          {!isExpert && item.services && item.services.length > 0 && (
            <div className="mb-3 d-flex flex-wrap gap-1">
              {item.services.slice(0, 3).map((service, idx) => (
                <span
                  key={idx}
                  className="badge"
                  style={{
                    background: '#f5f5f5',
                    color: '#555',
                    fontSize: '11px',
                    fontWeight: '500',
                    padding: '3px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {service}
                </span>
              ))}
              {item.services.length > 3 && (
                <span style={{ fontSize: '11px', color: '#999' }}>
                  +{item.services.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Location */}
          <div className="mt-auto">
            {(item.country || item.city) && (
              <p className="mb-2" style={{ fontSize: '13px', color: '#888' }}>
                <FontAwesome name="map-marker" style={{ marginRight: '6px', color: '#7ac142' }} />
                {[item.city, item.country].filter(Boolean).join(', ')}
              </p>
            )}

            {/* CTA */}
            <Link
              to={detailUrl}
              className="btn btn-sm w-100"
              style={{
                background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Voir le profil <FontAwesome name="arrow-right" style={{ marginLeft: '4px' }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectoryCard;
