import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from '../uiStyle/FontAwesome';
import DocumentTypeIcon from './DocumentTypeIcon';
import { getImageUrl } from '../../services/api';

const DocumentCard = ({ document, layout = 'grid' }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' Mo';
    if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' Ko';
    return bytes + ' o';
  };

  const truncate = (str, max) => {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + '...' : str;
  };

  const title = document.title_fr || document.title_en || 'Document';
  const description = document.description_fr || document.description_en || '';
  const thumbnailUrl = document.thumbnail ? getImageUrl(document.thumbnail) : null;

  if (layout === 'list') {
    return (
      <div className="doc-card-list" style={{
        display: 'flex',
        gap: '16px',
        padding: '16px',
        background: '#fff',
        borderRadius: '10px',
        border: '1px solid #eee',
        transition: 'all 0.2s ease',
        alignItems: 'flex-start',
      }}>
        {/* Icon / Thumbnail */}
        <div style={{
          minWidth: '60px',
          width: '60px',
          height: '60px',
          borderRadius: '10px',
          background: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <DocumentTypeIcon type={document.file_type} size="lg" />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            to={`/bibliotheque/document/${document.id}`}
            style={{ textDecoration: 'none', color: '#333' }}
          >
            <h6 style={{ fontWeight: '600', marginBottom: '4px', fontSize: '15px' }}>
              {truncate(title, 80)}
            </h6>
          </Link>
          {description && (
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px', lineHeight: '1.4' }}>
              {truncate(description, 120)}
            </p>
          )}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: '#999' }}>
            <span><DocumentTypeIcon type={document.file_type} size="sm" showLabel /></span>
            {document.file_size > 0 && <span>{formatFileSize(document.file_size)}</span>}
            {document.download_count > 0 && (
              <span><FontAwesome name="download" /> {document.download_count}</span>
            )}
            <span><FontAwesome name="calendar-o" /> {formatDate(document.created_at)}</span>
            {document.country && <span><FontAwesome name="globe" /> {document.country}</span>}
          </div>
        </div>
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className="doc-card-grid" style={{
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #eee',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Thumbnail / Type banner */}
      <div style={{
        height: thumbnailUrl ? '140px' : '80px',
        background: thumbnailUrl ? 'transparent' : `linear-gradient(135deg, ${document.category_color || '#354e84'}20, ${document.category_color || '#7ac142'}10)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <DocumentTypeIcon type={document.file_type} size="xl" />
        )}
        {/* Category badge */}
        {document.category_name_fr && (
          <span style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: document.category_color || '#354e84',
            color: '#fff',
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: '500',
          }}>
            {document.category_name_fr}
          </span>
        )}
        {/* File type badge */}
        <span style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '4px',
          fontWeight: '600',
          textTransform: 'uppercase',
        }}>
          {document.file_type || 'FILE'}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Link
          to={`/bibliotheque/document/${document.id}`}
          style={{ textDecoration: 'none', color: '#333' }}
        >
          <h6 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px', lineHeight: '1.4' }}>
            {truncate(title, 60)}
          </h6>
        </Link>
        {description && (
          <p style={{ fontSize: '13px', color: '#777', marginBottom: '12px', lineHeight: '1.4', flex: 1 }}>
            {truncate(description, 80)}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#999', marginTop: 'auto' }}>
          <span><FontAwesome name="calendar-o" /> {formatDate(document.created_at)}</span>
          <span><FontAwesome name="download" /> {document.download_count || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
