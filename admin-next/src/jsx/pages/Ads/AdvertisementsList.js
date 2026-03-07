import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const AdvertisementsList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [ads, setAds] = useState([]);
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [placementFilter, setPlacementFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchAds();
        fetchPlacements();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchAds = async () => {
        const res = await api.get('/ads?limit=1000', token);
        if (res.success) setAds(res.data || []);
        setLoading(false);
    };

    const fetchPlacements = async () => {
        const res = await api.get('/ads/placements', token);
        if (res.success) setPlacements(res.data || []);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette publicite ?')) {
            const res = await api.delete(`/ads/${id}`, token);
            if (res.success) {
                setToast({ message: 'Publicite supprimee', type: 'success' });
                fetchAds();
            }
        }
    };

    const handleDuplicate = async (id) => {
        const res = await api.post(`/ads/${id}/duplicate`, {}, token);
        if (res.success) {
            setToast({ message: 'Publicite dupliquee', type: 'success' });
            fetchAds();
        }
    };

    const handleToggleStatus = async (ad) => {
        const newStatus = ad.status === 'active' ? 'paused' : 'active';
        const res = await api.put(`/ads/${ad.id}`, { status: newStatus }, token);
        if (res.success) {
            setToast({ message: newStatus === 'active' ? 'Publicite activee' : 'Publicite mise en pause', type: 'success' });
            fetchAds();
        }
    };

    // Filtrage
    const filteredAds = ads.filter(ad => {
        const name = (ad.name || '').toLowerCase();
        const advertiser = (ad.advertiser_name || '').toLowerCase();
        const search = searchQuery.toLowerCase();
        const matchesSearch = name.includes(search) || advertiser.includes(search);
        const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
        const matchesPlacement = placementFilter === 'all' || ad.placement_id === parseInt(placementFilter);
        return matchesSearch && matchesStatus && matchesPlacement;
    });

    // Pagination
    const totalItems = filteredAds.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAds = filteredAds.slice(startIndex, startIndex + itemsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, placementFilter, itemsPerPage]);

    // Compteurs
    const activeCount = ads.filter(a => a.status === 'active').length;
    const draftCount = ads.filter(a => a.status === 'draft').length;
    const pausedCount = ads.filter(a => a.status === 'paused').length;
    const expiredCount = ads.filter(a => a.status === 'expired').length;

    const getStatusBadge = (status) => {
        const badges = {
            active: { class: 'bg-success', label: 'Active' },
            draft: { class: 'bg-secondary', label: 'Brouillon' },
            paused: { class: 'bg-warning text-dark', label: 'En pause' },
            scheduled: { class: 'bg-info', label: 'Planifiee' },
            expired: { class: 'bg-danger', label: 'Expiree' }
        };
        return badges[status] || { class: 'bg-secondary', label: status };
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
            {/* Toast Notification */}
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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Publicites</h2>
                    <p className="text-muted mb-0">{ads.length} publicites au total</p>
                </div>
                <Link to="/ads/new" className="btn btn-primary" style={{
                    background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                    border: 'none'
                }}>
                    <i className="fas fa-plus me-2"></i> Nouvelle publicite
                </Link>
            </div>

            {/* Filtres par statut */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="d-flex flex-wrap gap-2">
                        <button
                            className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setStatusFilter('all')}
                            style={statusFilter === 'all' ? { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' } : {}}
                        >
                            <i className="fas fa-layer-group me-1"></i> Toutes ({ads.length})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setStatusFilter('active')}
                        >
                            <i className="fas fa-check-circle me-1"></i> Actives ({activeCount})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'draft' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                            onClick={() => setStatusFilter('draft')}
                        >
                            <i className="fas fa-edit me-1"></i> Brouillons ({draftCount})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'paused' ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => setStatusFilter('paused')}
                        >
                            <i className="fas fa-pause-circle me-1"></i> En pause ({pausedCount})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'expired' ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => setStatusFilter('expired')}
                        >
                            <i className="fas fa-times-circle me-1"></i> Expirees ({expiredCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Rechercher une publicite..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        className="btn btn-outline-secondary border-start-0"
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-select"
                                value={placementFilter}
                                onChange={(e) => setPlacementFilter(e.target.value)}
                            >
                                <option value="all">Tous les emplacements</option>
                                {placements.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name_fr || p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 text-end">
                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                {filteredAds.length} resultat{filteredAds.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des publicites */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0" style={{ tableLayout: 'fixed' }}>
                            <thead className="bg-light">
                                <tr>
                                    <th style={{ width: '30%' }}>Publicite</th>
                                    <th style={{ width: '15%' }}>Emplacement</th>
                                    <th style={{ width: '10%' }}>Type</th>
                                    <th style={{ width: '10%' }}>Statut</th>
                                    <th style={{ width: '15%' }}>Performance</th>
                                    <th className="text-end" style={{ width: '20%' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAds.length > 0 ? (
                                    paginatedAds.map((ad) => (
                                        <tr key={ad.id} className="align-middle">
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {ad.image_url ? (
                                                        <img
                                                            src={ad.image_url}
                                                            alt=""
                                                            style={{
                                                                width: '60px',
                                                                height: '40px',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                                marginRight: '12px',
                                                                border: '1px solid #eee'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="d-flex align-items-center justify-content-center me-3"
                                                            style={{
                                                                width: '60px',
                                                                height: '40px',
                                                                borderRadius: '4px',
                                                                background: '#f0f0f0',
                                                                color: '#999'
                                                            }}
                                                        >
                                                            <i className={`fas fa-${ad.type === 'adsense' ? 'google' : ad.type === 'html' ? 'code' : 'image'}`}></i>
                                                        </div>
                                                    )}
                                                    <div style={{ overflow: 'hidden' }}>
                                                        <h6 className="mb-0 fw-semibold" style={{
                                                            fontSize: '0.9rem',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {ad.name}
                                                        </h6>
                                                        {ad.advertiser_name && (
                                                            <small className="text-muted">
                                                                {ad.advertiser_name}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge" style={{
                                                    background: '#e3f2fd',
                                                    color: '#1976d2',
                                                    fontWeight: '500'
                                                }}>
                                                    {ad.placement_name || 'Non defini'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-muted text-capitalize">
                                                    {ad.type === 'adsense' ? 'AdSense' : ad.type}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(ad.status).class}`}>
                                                    {getStatusBadge(ad.status).label}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">Impressions:</span>
                                                        <span className="fw-semibold">{ad.total_impressions || 0}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">Clics:</span>
                                                        <span className="fw-semibold">{ad.total_clicks || 0}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-end">
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => navigate(`/ads/${ad.id}`)}
                                                        title="Modifier"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className={`btn ${ad.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                        onClick={() => handleToggleStatus(ad)}
                                                        title={ad.status === 'active' ? 'Mettre en pause' : 'Activer'}
                                                        disabled={ad.status === 'draft' || ad.status === 'expired'}
                                                    >
                                                        <i className={`fas fa-${ad.status === 'active' ? 'pause' : 'play'}`}></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-info"
                                                        onClick={() => handleDuplicate(ad.id)}
                                                        title="Dupliquer"
                                                    >
                                                        <i className="fas fa-copy"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleDelete(ad.id)}
                                                        title="Supprimer"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-5">
                                            {searchQuery || statusFilter !== 'all' || placementFilter !== 'all' ? (
                                                <>
                                                    <i className="fas fa-search fa-3x mb-3 opacity-50"></i>
                                                    <p className="mb-2">Aucune publicite trouvee</p>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setStatusFilter('all');
                                                            setPlacementFilter('all');
                                                        }}
                                                    >
                                                        Reinitialiser les filtres
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-ad fa-3x mb-3 opacity-50"></i>
                                                    <p className="mb-2">Aucune publicite</p>
                                                    <Link to="/ads/new" className="btn btn-primary">
                                                        Creer une publicite
                                                    </Link>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalItems > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        itemName="publicites"
                        itemsPerPageOptions={[10, 25, 50, 100]}
                    />
                )}
            </div>
        </>
    );
};

export default AdvertisementsList;
