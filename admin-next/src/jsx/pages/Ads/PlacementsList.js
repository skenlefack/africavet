import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const PlacementsList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchPlacements();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPlacements = async () => {
        const res = await api.get('/ads/placements', token);
        if (res.success) setPlacements(res.data || []);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cet emplacement ?')) {
            const res = await api.delete(`/ads/placements/${id}`, token);
            if (res.success) {
                setToast({ message: 'Emplacement supprime', type: 'success' });
                fetchPlacements();
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    const handleToggleStatus = async (placement) => {
        const res = await api.put(`/ads/placements/${placement.id}`, {
            is_active: !placement.is_active
        }, token);
        if (res.success) {
            setToast({ message: placement.is_active ? 'Emplacement desactive' : 'Emplacement active', type: 'success' });
            fetchPlacements();
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Toast */}
            {toast && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                     style={{ top: '20px', right: '20px', zIndex: 9999 }}>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Emplacements publicitaires</h2>
                    <p className="text-muted mb-0">Gerez les zones d'affichage des publicites</p>
                </div>
                <Link to="/ads/placements/new" className="btn btn-primary" style={{
                    background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                    border: 'none'
                }}>
                    <i className="fas fa-plus me-2"></i> Nouvel emplacement
                </Link>
            </div>

            {/* Liste */}
            <div className="row">
                {placements.map(placement => (
                    <div key={placement.id} className="col-md-6 col-lg-4 mb-4">
                        <div className={`card h-100 ${!placement.is_active ? 'border-secondary' : ''}`}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h5 className="card-title mb-1">
                                            {placement.name_fr || placement.name}
                                        </h5>
                                        <code className="text-muted small">{placement.slug}</code>
                                    </div>
                                    <span className={`badge ${placement.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                        {placement.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>

                                <p className="text-muted small mb-3">
                                    {placement.location || 'Aucune description'}
                                </p>

                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    <span className="badge bg-light text-dark">
                                        <i className="fas fa-expand-arrows-alt me-1"></i>
                                        {placement.width}x{placement.height}px
                                    </span>
                                    <span className="badge bg-light text-dark">
                                        <i className="fas fa-layer-group me-1"></i>
                                        Max: {placement.max_ads} pub(s)
                                    </span>
                                </div>

                                {/* Visual representation */}
                                <div
                                    className="border rounded mb-3 d-flex align-items-center justify-content-center bg-light"
                                    style={{
                                        width: '100%',
                                        height: '60px',
                                        position: 'relative'
                                    }}
                                >
                                    <div
                                        className="bg-primary opacity-25"
                                        style={{
                                            width: `${Math.min(100, (placement.width / 728) * 100)}%`,
                                            height: `${Math.min(100, (placement.height / 90) * 100)}%`,
                                            maxWidth: '100%',
                                            maxHeight: '100%'
                                        }}
                                    ></div>
                                    <small className="position-absolute text-muted">
                                        {placement.width}x{placement.height}
                                    </small>
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-primary flex-fill"
                                        onClick={() => navigate(`/ads/placements/${placement.id}`)}
                                    >
                                        <i className="fas fa-edit me-1"></i> Modifier
                                    </button>
                                    <button
                                        className={`btn btn-sm ${placement.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                        onClick={() => handleToggleStatus(placement)}
                                        title={placement.is_active ? 'Desactiver' : 'Activer'}
                                    >
                                        <i className={`fas fa-${placement.is_active ? 'pause' : 'play'}`}></i>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(placement.id)}
                                        title="Supprimer"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {placements.length === 0 && (
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <i className="fas fa-th-large fa-3x text-muted mb-3"></i>
                                <h5>Aucun emplacement</h5>
                                <p className="text-muted">Commencez par creer un emplacement publicitaire</p>
                                <Link to="/ads/placements/new" className="btn btn-primary">
                                    <i className="fas fa-plus me-2"></i> Creer un emplacement
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="card mt-4">
                <div className="card-header bg-white">
                    <h6 className="mb-0">
                        <i className="fas fa-info-circle me-2 text-info"></i>
                        Guide des emplacements
                    </h6>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4">
                            <h6>Bannieres horizontales</h6>
                            <ul className="small text-muted">
                                <li>Header: 670x85px</li>
                                <li>Leaderboard: 728x90px</li>
                                <li>Mobile header: 320x50px</li>
                            </ul>
                        </div>
                        <div className="col-md-4">
                            <h6>Rectangles</h6>
                            <ul className="small text-muted">
                                <li>Medium Rectangle: 300x250px</li>
                                <li>Large Rectangle: 336x280px</li>
                                <li>Square: 250x250px</li>
                            </ul>
                        </div>
                        <div className="col-md-4">
                            <h6>Skyscrapers</h6>
                            <ul className="small text-muted">
                                <li>Wide: 160x600px</li>
                                <li>Standard: 120x600px</li>
                                <li>Half page: 300x600px</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlacementsList;
