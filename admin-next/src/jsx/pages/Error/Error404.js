import React from 'react';
import { Link } from 'react-router-dom';

const Error404 = () => (
  <div className="vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}>
    <div className="text-center text-white">
      <h1 className="display-1 fw-bold mb-0">404</h1>
      <h4 className="mb-3">Page introuvable</h4>
      <p className="mb-4 opacity-75">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link to="/dashboard" className="btn btn-light fw-bold px-4"><i className="fas fa-home me-2"></i>Retour au tableau de bord</Link>
    </div>
  </div>
);
export default Error404;
