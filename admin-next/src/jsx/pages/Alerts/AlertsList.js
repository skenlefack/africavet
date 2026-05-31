import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const PRIORITY_CONFIG = {
    critical: { label: 'Critique', color: '#d32f2f', bg: '#ffebee', icon: 'fa-exclamation-circle' },
    high: { label: 'Élevée', color: '#e65100', bg: '#fff3e0', icon: 'fa-exclamation-triangle' },
    medium: { label: 'Moyenne', color: '#f9a825', bg: '#fffde7', icon: 'fa-info-circle' },
    low: { label: 'Faible', color: '#2e7d32', bg: '#e8f5e9', icon: 'fa-check-circle' },
};

const STATUS_CONFIG = {
    pending: { label: 'En attente', color: '#ff9800', bg: '#fff3e0' },
    approved: { label: 'Approuvée', color: '#4caf50', bg: '#e8f5e9' },
    rejected: { label: 'Rejetée', color: '#f44336', bg: '#ffebee' },
    investigating: { label: 'Investigation', color: '#2196f3', bg: '#e3f2fd' },
    resolved: { label: 'Résolue', color: '#9e9e9e', bg: '#f5f5f5' },
};

const TYPE_CONFIG = {
    disease_outbreak: { label: 'Épidémie', icon: 'fa-virus', color: '#d32f2f' },
    emergency: { label: 'Urgence', icon: 'fa-ambulance', color: '#e65100' },
    vaccination_campaign: { label: 'Vaccination', icon: 'fa-syringe', color: '#1565c0' },
    food_safety: { label: 'Sécurité alimentaire', icon: 'fa-utensils', color: '#2e7d32' },
    wildlife: { label: 'Faune sauvage', icon: 'fa-paw', color: '#6a1b9a' },
    other: { label: 'Autre', icon: 'fa-bell', color: '#757575' },
};

const AlertsList = () => {
    const token = getToken();
    const [searchParams, setSearchParams] = useSearchParams();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [toast, setToast] = useState(null);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || '',
        type: searchParams.get('type') || '',
        priority: searchParams.get('priority') || '',
        country: searchParams.get('country') || '',
    });
    const [showFilters, setShowFilters] = useState(false);

    // Modals
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => {
        fetchAlerts();
    }, [currentPage, itemsPerPage, filters]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchAlerts = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', currentPage);
        params.set('limit', itemsPerPage);
        if (filters.search) params.set('search', filters.search);
        if (filters.status) params.set('status', filters.status);
        if (filters.type) params.set('type', filters.type);
        if (filters.priority) params.set('priority', filters.priority);
        if (filters.country) params.set('country', filters.country);

        const res = await api.get(`/vet-alerts?${params.toString()}`, token);
        if (res.success) {
            setAlerts(res.data || []);
            setTotal(res.pagination?.total || 0);
        }
        setLoading(false);
    };

    const handleApprove = async (id) => {
        const res = await api.put(`/vet-alerts/${id}/validate`, { validation_notes: 'Approuvée' }, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Alerte approuvée' });
            fetchAlerts();
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
    };

    const handleReject = async () => {
        if (!rejectTarget) return;
        const res = await api.put(`/vet-alerts/${rejectTarget}/reject`, { rejection_reason: rejectReason }, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Alerte rejetée' });
            setShowRejectModal(false);
            setRejectReason('');
            setRejectTarget(null);
            fetchAlerts();
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const res = await api.delete(`/vet-alerts/${deleteTarget}`, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Alerte supprimée' });
            setShowDeleteModal(false);
            setDeleteTarget(null);
            fetchAlerts();
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
    };

    const applyFilter = (key, value) => {
        const next = { ...filters, [key]: value };
        setFilters(next);
        setCurrentPage(1);
        const sp = new URLSearchParams();
        Object.entries(next).forEach(([k, v]) => { if (v) sp.set(k, v); });
        setSearchParams(sp);
    };

    const clearFilters = () => {
        setFilters({ search: '', status: '', type: '', priority: '', country: '' });
        setCurrentPage(1);
        setSearchParams({});
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <>
            {toast && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                    style={{ top: 20, right: 20, zIndex: 9999, minWidth: 300 }}>
                    <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-1">
                            <li className="breadcrumb-item"><Link to="/alerts">Alertes</Link></li>
                            <li className="breadcrumb-item active">Liste</li>
                        </ol>
                    </nav>
                    <h2 className="mb-0" style={{ fontWeight: 700 }}>
                        <i className="fas fa-list text-primary me-2"></i>
                        Toutes les alertes
                        <small className="text-muted ms-2" style={{ fontSize: '0.5em' }}>({total})</small>
                    </h2>
                </div>
                <Link to="/alerts" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1"></i> Dashboard
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white"><i className="fas fa-search text-muted"></i></span>
                                <input type="text" className="form-control" placeholder="Rechercher une alerte..."
                                    value={filters.search}
                                    onChange={e => applyFilter('search', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={filters.status} onChange={e => applyFilter('status', e.target.value)}>
                                <option value="">Tous les statuts</option>
                                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 d-flex gap-2">
                            <button className="btn btn-outline-secondary flex-grow-1" onClick={() => setShowFilters(!showFilters)}>
                                <i className="fas fa-filter me-1"></i> Filtres
                                {activeFilterCount > 0 && <span className="badge bg-primary ms-1">{activeFilterCount}</span>}
                            </button>
                            {activeFilterCount > 0 && (
                                <button className="btn btn-outline-danger" onClick={clearFilters} title="Effacer">
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="row g-2 mt-2 pt-2 border-top">
                            <div className="col-md-4">
                                <label className="form-label small text-muted">Type</label>
                                <select className="form-select form-select-sm" value={filters.type} onChange={e => applyFilter('type', e.target.value)}>
                                    <option value="">Tous les types</option>
                                    {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted">Priorité</label>
                                <select className="form-select form-select-sm" value={filters.priority} onChange={e => applyFilter('priority', e.target.value)}>
                                    <option value="">Toutes les priorités</option>
                                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted">Pays</label>
                                <input type="text" className="form-control form-control-sm" placeholder="Pays..."
                                    value={filters.country} onChange={e => applyFilter('country', e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-bell-slash fa-3x mb-3"></i>
                            <p>Aucune alerte trouvée</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}>
                                        <th style={{ color: 'white' }}>Titre</th>
                                        <th style={{ color: 'white' }}>Type</th>
                                        <th style={{ color: 'white' }}>Priorité</th>
                                        <th style={{ color: 'white' }}>Pays</th>
                                        <th style={{ color: 'white' }}>Statut</th>
                                        <th style={{ color: 'white' }}>Date</th>
                                        <th style={{ color: 'white', width: 180 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alerts.map(alert => {
                                        const type = TYPE_CONFIG[alert.alert_type] || TYPE_CONFIG.other;
                                        const prio = PRIORITY_CONFIG[alert.priority] || PRIORITY_CONFIG.medium;
                                        const status = STATUS_CONFIG[alert.status] || STATUS_CONFIG.pending;
                                        return (
                                            <tr key={alert.id}>
                                                <td>
                                                    <Link to={`/alerts/view/${alert.id}`} className="fw-bold text-dark text-decoration-none">
                                                        {alert.title_fr || alert.title_en}
                                                    </Link>
                                                    {alert.code && <><br /><small className="text-muted">{alert.code}</small></>}
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ background: type.color + '15', color: type.color }}>
                                                        <i className={`fas ${type.icon} me-1`}></i>{type.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ background: prio.bg, color: prio.color }}>
                                                        <i className={`fas ${prio.icon} me-1`}></i>{prio.label}
                                                    </span>
                                                </td>
                                                <td><small>{alert.country || '—'}</small></td>
                                                <td>
                                                    <span className="badge" style={{ background: status.bg, color: status.color }}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td><small>{formatDate(alert.created_at)}</small></td>
                                                <td>
                                                    <Link to={`/alerts/view/${alert.id}`} className="btn btn-sm btn-outline-primary me-1" title="Voir">
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                    {alert.status === 'pending' && (
                                                        <>
                                                            <button className="btn btn-sm btn-outline-success me-1" title="Approuver"
                                                                onClick={() => handleApprove(alert.id)}>
                                                                <i className="fas fa-check"></i>
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-warning me-1" title="Rejeter"
                                                                onClick={() => { setRejectTarget(alert.id); setShowRejectModal(true); }}>
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                    <button className="btn btn-sm btn-outline-danger" title="Supprimer"
                                                        onClick={() => { setDeleteTarget(alert.id); setShowDeleteModal(true); }}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {total > itemsPerPage && (
                    <div className="card-footer bg-white">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(total / itemsPerPage)}
                            totalItems={total}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
                            itemName="alertes"
                        />
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="fas fa-times-circle text-warning me-2"></i>Rejeter l'alerte</h5>
                                <button type="button" className="btn-close" onClick={() => { setShowRejectModal(false); setRejectTarget(null); }}></button>
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Raison du rejet</label>
                                <textarea className="form-control" rows={3} value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)} placeholder="Expliquez la raison du rejet..." />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => { setShowRejectModal(false); setRejectTarget(null); }}>Annuler</button>
                                <button className="btn btn-warning" onClick={handleReject} disabled={!rejectReason.trim()}>
                                    <i className="fas fa-times me-1"></i> Rejeter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="fas fa-trash text-danger me-2"></i>Supprimer l'alerte</h5>
                                <button type="button" className="btn-close" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}></button>
                            </div>
                            <div className="modal-body">
                                <p>Êtes-vous sûr de vouloir supprimer cette alerte ? Cette action est irréversible.</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>Annuler</button>
                                <button className="btn btn-danger" onClick={handleDelete}>
                                    <i className="fas fa-trash me-1"></i> Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AlertsList;
