import React from 'react';

const FILE_TYPE_CONFIG = {
  pdf: { icon: 'file-pdf-o', color: '#e74c3c', label: 'PDF' },
  doc: { icon: 'file-word-o', color: '#2b579a', label: 'DOC' },
  docx: { icon: 'file-word-o', color: '#2b579a', label: 'DOCX' },
  xls: { icon: 'file-excel-o', color: '#217346', label: 'XLS' },
  xlsx: { icon: 'file-excel-o', color: '#217346', label: 'XLSX' },
  ppt: { icon: 'file-powerpoint-o', color: '#d24726', label: 'PPT' },
  pptx: { icon: 'file-powerpoint-o', color: '#d24726', label: 'PPTX' },
  zip: { icon: 'file-archive-o', color: '#f39c12', label: 'ZIP' },
  rar: { icon: 'file-archive-o', color: '#f39c12', label: 'RAR' },
  jpg: { icon: 'file-image-o', color: '#8e44ad', label: 'JPG' },
  jpeg: { icon: 'file-image-o', color: '#8e44ad', label: 'JPEG' },
  png: { icon: 'file-image-o', color: '#8e44ad', label: 'PNG' },
  gif: { icon: 'file-image-o', color: '#8e44ad', label: 'GIF' },
  webp: { icon: 'file-image-o', color: '#8e44ad', label: 'WEBP' },
};

const DocumentTypeIcon = ({ type, size = 'md', showLabel = false }) => {
  const config = FILE_TYPE_CONFIG[type?.toLowerCase()] || { icon: 'file-o', color: '#95a5a6', label: type?.toUpperCase() || 'FILE' };

  const sizes = {
    sm: { icon: '16px', badge: '10px' },
    md: { icon: '24px', badge: '12px' },
    lg: { icon: '40px', badge: '14px' },
    xl: { icon: '60px', badge: '16px' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <span className="d-inline-flex align-items-center" style={{ gap: '6px' }}>
      <i
        className={`fa fa-${config.icon}`}
        style={{ fontSize: s.icon, color: config.color }}
      />
      {showLabel && (
        <span
          style={{
            fontSize: s.badge,
            fontWeight: '600',
            color: config.color,
            textTransform: 'uppercase',
          }}
        >
          {config.label}
        </span>
      )}
    </span>
  );
};

export default DocumentTypeIcon;
