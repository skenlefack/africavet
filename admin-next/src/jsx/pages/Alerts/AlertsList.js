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
    pending: { label: 'En attente', color: '#ff9800', bg: '#fff3e0', icon: 'fa-clock' },
    approved: { label: 'Approuvée', color: '#4caf50', bg: '#e8f5e9', icon: 'fa-check-circle' },
    rejected: { label: 'Rejetée', color: '#f44336', bg: '#ffebee', icon: 'fa-times-circle' },
    investigating: { label: 'Investigation', color: '#2196f3', bg: '#e3f2fd', icon: 'fa-search' },
    resolved: { label: 'Résolue', color: '#9e9e9e', bg: '#f5f5f5', icon: 'fa-check-double' },
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
    const [statusDropdown, setStatusDropdown] = useState(null);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || '',
        type: searchParams.get('type') || '',
        priority: searchParams.get('priority') || '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }
    }, [toast]);

    useEffect(() => { fetchAlerts(); }, [currentPage, itemsPerPage, filters]); // eslint-disable-line

    // Close dropdown on outside click
    useEffect(() => {
        const handler = () => setStatusDropdown(null);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', currentPage);
        params.set('limit', itemsPerPage);
        params.set('status', filters.status || 'all');
        if (filters.search) params.set('search', filters.search);
        if (filters.type) params.set('type', filters.type);
        if (filters.priority) params.set('priority', filters.priority);

        const res = await api.get(`/vet-alerts?${params.toString()}`, token);
        if (res.success) {
            setAlerts(res.data || []);
            setTotal(res.pagination?.total || 0);
        }
        setLoading(false);
    };

    const changeStatus = async (id, newStatus) => {
        let res;
        if (newStatus === 'approved') {
            res = await api.put(`/vet-alerts/${id}/validate`, { validation_notes: 'Approuvée depuis la liste' }, token);
        } else if (newStatus === 'rejected') {
            setRejectTarget(id);
            setShowRejectModal(true);
            setStatusDropdown(null);
            return;
        } else if (newStatus === 'resolved') {
            res = await api.put(`/vet-alerts/${id}/resolve`, { resolution_notes: 'Résolue' }, token);
        } else {
            res = await api.put(`/vet-alerts/${id}`, { status: newStatus }, token);
        }
        setStatusDropdown(null);
        if (res && res.success) {
            setToast({ type: 'success', message: `Statut changé : ${STATUS_CONFIG[newStatus]?.label || newStatus}` });
            fetchAlerts();
        } else if (res) {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
    };

    const handleReject = async () => {
        if (!rejectTarget) return;
        const res = await api.put(`/vet-alerts/${rejectTarget}/reject`, { rejection_reason: rejectReason }, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Alerte rejetée' });
            setShowRejectModal(false); setRejectReason(''); setRejectTarget(null);
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
            setShowDeleteModal(false); setDeleteTarget(null);
            fetchAlerts();
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
    };

    const applyFilter = (key, value) => {
        const next = { ...filters, [key]: value };
        setFilters(next); setCurrentPage(1);
        const sp = new URLSearchParams();
        Object.entries(next).forEach(([k, v]) => { if (v) sp.set(k, v); });
        setSearchParams(sp);
    };

    const clearFilters = () => {
        setFilters({ search: '', status: '', type: '', priority: '' });
        setCurrentPage(1); setSearchParams({});
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
                    <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`} />
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)} />
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: 700 }}>
                        <i className="fas fa-bell me-2" style={{ color: '#d32f2f' }} />
                        Toutes les alertes
                        <span className="badge bg-secondary ms-2" style={{ fontSize: '0.4em', verticalAlign: 'middle' }}>{total}</span>
                    </h2>
                    <p className="text-muted mb-0 small">Seules les alertes <strong>Approuvées</strong> sont visibles sur le site public</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/alerts/new" className="btn text-white" style={{ background: 'linear-gradient(135deg, #d32f2f, #e65100)', border: 'none' }}>
                        <i className="fas fa-plus me-1" /> Nouvelle alerte
                    </Link>
                    <Link to="/alerts" className="btn btn-outline-secondary">
                        <i className="fas fa-chart-bar me-1" /> Dashboard
                    </Link>
                </div>
            </div>

            {/* Status Quick Tabs */}
            <div className="d-flex gap-2 mb-3 flex-wrap">
                <button className={`btn btn-sm ${!filters.status ? 'btn-dark' : 'btn-outline-secondary'}`}
                    onClick={() => applyFilter('status', '')}>
                    Toutes
                </button>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button key={key} className={`btn btn-sm ${filters.status === key ? '' : 'btn-outline-secondary'}`}
                        style={filters.status === key ? { background: cfg.color, color: '#fff', border: 'none' } : {}}
                        onClick={() => applyFilter('status', key)}>
                        <i className={`fas ${cfg.icon} me-1`} />{cfg.label}
                    </button>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body py-3">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-8">
                            <div className="input-group">
                                <span className="input-group-text bg-white"><i className="fas fa-search text-muted" /></span>
                                <input type="text" className="form-control" placeholder="Rechercher une alerte..."
                                    value={filters.search} onChange={e => applyFilter('search', e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-4 d-flex gap-2">
                            <button className="btn btn-outline-secondary flex-grow-1" onClick={() => setShowFilters(!showFilters)}>
                                <i className="fas fa-filter me-1" /> Filtres
                                {activeFilterCount > 0 && <span className="badge bg-primary ms-1">{activeFilterCount}</span>}
                            </button>
                            {activeFilterCount > 0 && (
                                <button className="btn btn-outline-danger" onClick={clearFilters}><i className="fas fa-times" /></button>
                            )}
                        </div>
                    </div>
                    {showFilters && (
                        <div className="row g-2 mt-2 pt-2 border-top">
                            <div className="col-md-6">
                                <label className="form-label small text-muted">Type</label>
                                <select className="form-select form-select-sm" value={filters.type} onChange={e => applyFilter('type', e.target.value)}>
                                    <option value="">Tous</option>
                                    {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small text-muted">Priorité</label>
                                <select className="form-select form-select-sm" value={filters.priority} onChange={e => applyFilter('priority', e.target.value)}>
                                    <option value="">Toutes</option>
                                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Alerts Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-bell-slash fa-3x mb-3" /><p>Aucune alerte trouvée</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}>
                                        <th style={{ color: '#fff' }}>Titre</th>
                                        <th style={{ color: '#fff' }}>Type</th>
                                        <th style={{ color: '#fff' }}>Priorité</th>
                                        <th style={{ color: '#fff' }}>Pays</th>
                                        <th style={{ color: '#fff', width: 160 }}>Statut</th>
                                        <th style={{ color: '#fff' }}>Date</th>
                                        <th style={{ color: '#fff', width: 140 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alerts.map(alert => {
                                        const type = TYPE_CONFIG[alert.alert_type] || TYPE_CONFIG.other;
                                        const prio = PRIORITY_CONFIG[alert.priority] || PRIORITY_CONFIG.medium;
                                        const st = STATUS_CONFIG[alert.status] || STATUS_CONFIG.pending;
                                        return (
                                            <tr key={alert.id}>
                                                <td>
                                                    <Link to={`/alerts/view/${alert.id}`} className="fw-bold text-dark text-decoration-none">
                                                        {(alert.title_fr || alert.title_en || '').substring(0, 60)}
                                                        {(alert.title_fr || '').length > 60 ? '...' : ''}
                                                    </Link>
                                                    {alert.code && <><br /><small className="text-muted">{alert.code}</small></>}
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ background: type.color + '15', color: type.color, fontSize: '11px' }}>
                                                        <i className={`fas ${type.icon} me-1`} />{type.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ background: prio.bg, color: prio.color, fontSize: '11px' }}>
                                                        <i className={`fas ${prio.icon} me-1`} />{prio.label}
                                                    </span>
                                                </td>
                                                <td><small>{alert.country || '—'}</small></td>
                                                <td>
                                                    {/* Status dropdown */}
                                                    <div className="position-relative">
                                                        <button className="btn btn-sm d-flex align-items-center gap-1"
                                                            style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}30`, fontSize: '12px', fontWeight: 600 }}
                                                            onClick={(e) => { e.stopPropagation(); setStatusDropdown(statusDropdown === alert.id ? null : alert.id); }}>
                                                            <i className={`fas ${st.icon}`} />
                                                            {st.label}
                                                            <i className="fas fa-caret-down ms-1" style={{ fontSize: '10px' }} />
                                                        </button>
                                                        {statusDropdown === alert.id && (
                                                            <div className="position-absolute bg-white border rounded shadow-lg py-1"
                                                                style={{ top: '100%', left: 0, zIndex: 1050, minWidth: 170, marginTop: 4 }}
                                                                onClick={e => e.stopPropagation()}>
                                                                <div className="px-3 py-1 text-muted small border-bottom mb-1">Changer le statut</div>
                                                                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                                                    key !== alert.status && (
                                                                        <button key={key} className="dropdown-item d-flex align-items-center gap-2 py-2"
                                                                            onClick={() => changeStatus(alert.id, key)}>
                                                                            <i className={`fas ${cfg.icon}`} style={{ color: cfg.color, width: 16 }} />
                                                                            <span>{cfg.label}</span>
                                                                            {key === 'approved' && <span className="badge bg-success ms-auto" style={{ fontSize: '9px' }}>Public</span>}
                                                                        </button>
                                                                    )
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td><small>{formatDate(alert.created_at)}</small></td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Link to={`/alerts/view/${alert.id}`} className="btn btn-sm btn-outline-primary" title="Voir">
                                                            <i className="fas fa-eye" />
                                                        </Link>
                                                        <Link to={`/alerts/edit/${alert.id}`} className="btn btn-sm btn-outline-secondary" title="Modifier">
                                                            <i className="fas fa-pen" />
                                                        </Link>
                                                        <button className="btn btn-sm btn-outline-danger" title="Supprimer"
                                                            onClick={() => { setDeleteTarget(alert.id); setShowDeleteModal(true); }}>
                                                            <i className="fas fa-trash" />
                                                        </button>
                                                    </div>
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
                        <Pagination currentPage={currentPage} totalPages={Math.ceil(total / itemsPerPage)}
                            totalItems={total} itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
                            itemName="alertes" />
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="fas fa-times-circle text-warning me-2" />Rejeter l'alerte</h5>
                                <button type="button" className="btn-close" onClick={() => { setShowRejectModal(false); setRejectTarget(null); }} />
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Raison du rejet</label>
                                <textarea className="form-control" rows={3} value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)} placeholder="Expliquez la raison du rejet..." />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => { setShowRejectModal(false); setRejectTarget(null); }}>Annuler</button>
                                <button className="btn btn-warning" onClick={handleReject} disabled={!rejectReason.trim()}>
                                    <i className="fas fa-times me-1" /> Rejeter
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
                                <h5 className="modal-title"><i className="fas fa-trash text-danger me-2" />Supprimer l'alerte</h5>
                                <button type="button" className="btn-close" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} />
                            </div>
                            <div className="modal-body">
                                <p>Êtes-vous sûr de vouloir supprimer cette alerte ? Cette action est irréversible.</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>Annuler</button>
                                <button className="btn btn-danger" onClick={handleDelete}>
                                    <i className="fas fa-trash me-1" /> Supprimer
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
