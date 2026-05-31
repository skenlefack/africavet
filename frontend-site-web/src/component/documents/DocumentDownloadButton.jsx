import React from 'react';
import FontAwesome from '../uiStyle/FontAwesome';
import { documentsApi } from '../../services/api';

const DocumentDownloadButton = ({ document, size = 'md', className = '' }) => {
  if (!document?.file_path) return null;

  const downloadUrl = documentsApi.getDownloadUrl(document.id);

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' Mo';
    if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' Ko';
    return bytes + ' o';
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  return (
    <a
      href={downloadUrl}
      className={`btn btn-success ${sizeClasses[size] || ''} ${className}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        background: 'linear-gradient(135deg, #7ac142 0%, #5a9e32 100%)',
        border: 'none',
        borderRadius: '8px',
      }}
    >
      <FontAwesome name="download" />{' '}
      Telecharger
      {document.file_size && (
        <small style={{ opacity: 0.8, marginLeft: '6px' }}>
          ({formatFileSize(document.file_size)})
        </small>
      )}
    </a>
  );
};

export default DocumentDownloadButton;
