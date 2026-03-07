import React, { useRef } from 'react';
import FontAwesome from '../../uiStyle/FontAwesome';

const FileUpload = ({ onFileSelect, accept = '.pdf,.doc,.docx', maxSize = 10, label = 'Choisir un fichier', currentFile = null, onRemove }) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      alert(`Le fichier ne doit pas dépasser ${maxSize} MB`);
      return;
    }

    onFileSelect(file);
    e.target.value = '';
  };

  return (
    <div>
      {currentFile ? (
        <div className="d-flex align-items-center gap-2 p-2 border rounded" style={{ background: '#f8f9fa' }}>
          <FontAwesome name="file-o" />
          <span className="flex-grow-1" style={{ fontSize: '14px' }}>
            {typeof currentFile === 'string' ? currentFile : currentFile.name}
          </span>
          {onRemove && (
            <button onClick={onRemove} className="btn btn-sm btn-outline-danger" type="button">
              <FontAwesome name="trash" />
            </button>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => inputRef.current?.click()}
          >
            <FontAwesome name="upload" /> {label}
          </button>
          <small className="d-block text-muted mt-1">Max {maxSize} MB</small>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
