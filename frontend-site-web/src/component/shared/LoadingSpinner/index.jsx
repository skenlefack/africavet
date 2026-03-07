import React from 'react';

const LoadingSpinner = ({ text = 'Chargement...', fullPage = false }) => {
  const style = fullPage ? { minHeight: '60vh' } : { padding: '40px 0' };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={style}>
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      <p style={{ color: '#666' }}>{text}</p>
    </div>
  );
};

export default LoadingSpinner;
