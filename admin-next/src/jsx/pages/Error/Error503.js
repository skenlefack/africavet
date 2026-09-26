import React from 'react';
import { Link } from 'react-router-dom';

const Error503 = () => (
  <div className="vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}>
    <div className="text-center text-white">
      <h1 className="display-1 fw-bold mb-0">503</h1>
      <h4 className="mb-3">Service indisponible</h4>
      <p className="mb-4 opacity-75">Le service est temporairement indisponible. Veuillez réessayer dans quelques minutes.</p>
      <Link to="/dashboard" className="btn btn-light fw-bold px-4"><i className="fas fa-home me-2"></i>Retour au tableau de bord</Link>
    </div>
  </div>
);
export default Error503;
