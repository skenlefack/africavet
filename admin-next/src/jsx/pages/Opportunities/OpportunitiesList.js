import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const TYPE_CONFIG = {
    job: { label: 'Emploi', icon: 'fa-briefcase', color: '#1565c0', bg: '#e3f2fd' },
    tender: { label: 'Appel d\'offres', icon: 'fa-file-contract', color: '#6a1b9a', bg: '#f3e5f5' },
    market: { label: 'Marché', icon: 'fa-store', color: '#2e7d32', bg: '#e8f5e9' },
};

const STATUS_CONFIG = {
    draft: { label: 'Brouillon', color: '#9e9e9e', bg: '#f5f5f5' },
    pending: { label: 'En attente', color: '#ff9800', bg: '#fff3e0' },
    published: { label: 'Publiée', color: '#4caf50', bg: '#e8f5e9' },
    closed: { label: 'Clôturée', color: '#757575', bg: '#f5f5f5' },
    cancelled: { label: 'Annulée', color: '#f44336', bg: '#ffebee' },
};

const OpportunitiesList = () => {
    const token = getToken();
    const [searchParams, setSearchParams] = useSearchParams();
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [toast, setToast] = useState(null);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || '',
        type: searchParams.get('type') || '',
        country: searchParams.get('country') || '',
    });
    const [showFilters, setShowFilters] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => {
        fetchOpportunities();
    }, [currentPage, itemsPerPage, filters]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchOpportunities = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', currentPage);
        params.set('limit', itemsPerPage);
        if (filters.search) params.set('search', filters.search);
        if (filters.status) params.set('status', filters.status);
        if (filters.type) params.set('type', filters.type);
        if (filters.country) params.set('country', filters.country);

        const res = await api.get(`/opportunities?${params.toString()}`, token);
        if (res.success) {
            setOpportunities(res.data || []);
            setTotal(res.pagination?.total || 0);
        }
        setLoading(false);
    };

    const handleApprove = async (id) => {
        const res = await api.put(`/opportunities/${id}/approve`, {}, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Opportunité publiée' });
            fetchOpportunities();
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const res = await api.delete(`/opportunities/${deleteTarget}`, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Opportunité supprimée' });
            setShowDeleteModal(false);
            setDeleteTarget(null);
            fetchOpportunities();
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
        setFilters({ search: '', status: '', type: '', country: '' });
        setCurrentPage(1);
        setSearchParams({});
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const isExpired = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
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
                            <li className="breadcrumb-item"><Link to="/opportunities">Opportunités</Link></li>
                            <li className="breadcrumb-item active">Liste</li>
                        </ol>
                    </nav>
                    <h2 className="mb-0" style={{ fontWeight: 700 }}>
                        <i className="fas fa-list text-primary me-2"></i>
                        Toutes les opportunités
                        <small className="text-muted ms-2" style={{ fontSize: '0.5em' }}>({total})</small>
                    </h2>
                </div>
                <div>
                    <Link to="/opportunities/new" className="btn btn-primary btn-sm me-2">
                        <i className="fas fa-plus me-1"></i> Nouvelle
                    </Link>
                    <Link to="/opportunities" className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-arrow-left me-1"></i> Dashboard
                    </Link>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white"><i className="fas fa-search text-muted"></i></span>
                                <input type="text" className="form-control" placeholder="Rechercher..."
                                    value={filters.search} onChange={e => applyFilter('search', e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" value={filters.type} onChange={e => applyFilter('type', e.target.value)}>
                                <option value="">Tous les types</option>
                                {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
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
                    ) : opportunities.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-briefcase fa-3x mb-3"></i>
                            <p>Aucune opportunité trouvée</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}>
                                        <th style={{ color: 'white' }}>Titre</th>
                                        <th style={{ color: 'white' }}>Type</th>
                                        <th style={{ color: 'white' }}>Organisation</th>
                                        <th style={{ color: 'white' }}>Pays</th>
                                        <th style={{ color: 'white' }}>Date limite</th>
                                        <th style={{ color: 'white' }}>Candidatures</th>
                                        <th style={{ color: 'white' }}>Statut</th>
                                        <th style={{ color: 'white', width: 160 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {opportunities.map(opp => {
                                        const typeCfg = TYPE_CONFIG[opp.opportunity_type] || TYPE_CONFIG.job;
                                        const statusCfg = STATUS_CONFIG[opp.status] || STATUS_CONFIG.pending;
                                        const expired = isExpired(opp.deadline);
                                        return (
                                            <tr key={opp.id}>
                                                <td>
                                                    <Link to={`/opportunities/view/${opp.id}`} className="fw-bold text-dark text-decoration-none">
                                                        {opp.title_fr || opp.title_en}
                                                    </Link>
                                                    <div className="d-flex gap-1 mt-1">
                                                        {opp.is_featured === 1 && <span className="badge bg-warning text-dark" style={{ fontSize: 10 }}><i className="fas fa-star me-1"></i>Vedette</span>}
                                                        {opp.is_urgent === 1 && <span className="badge bg-danger" style={{ fontSize: 10 }}><i className="fas fa-bolt me-1"></i>Urgent</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ background: typeCfg.bg, color: typeCfg.color }}>
                                                        <i className={`fas ${typeCfg.icon} me-1`}></i>{typeCfg.label}
                                                    </span>
                                                </td>
                                                <td><small>{opp.organization_name || opp.org_name || '—'}</small></td>
                                                <td><small>{opp.country || '—'}</small></td>
                                                <td>
                                                    <small className={expired ? 'text-danger' : ''}>
                                                        {opp.deadline ? formatDate(opp.deadline) : '—'}
                                                        {expired && <i className="fas fa-exclamation-triangle ms-1"></i>}
                                                    </small>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark">
                                                        <i className="fas fa-users me-1"></i>{opp.applications_count || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                                                        {statusCfg.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link to={`/opportunities/view/${opp.id}`} className="btn btn-sm btn-outline-primary me-1" title="Voir">
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                    <Link to={`/opportunities/edit/${opp.id}`} className="btn btn-sm btn-outline-secondary me-1" title="Éditer">
                                                        <i className="fas fa-edit"></i>
                                                    </Link>
                                                    {opp.status === 'pending' && (
                                                        <button className="btn btn-sm btn-outline-success me-1" title="Approuver"
                                                            onClick={() => handleApprove(opp.id)}>
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                    )}
                                                    <button className="btn btn-sm btn-outline-danger" title="Supprimer"
                                                        onClick={() => { setDeleteTarget(opp.id); setShowDeleteModal(true); }}>
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
                            itemName="opportunités"
                        />
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="fas fa-trash text-danger me-2"></i>Supprimer</h5>
                                <button type="button" className="btn-close" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}></button>
                            </div>
                            <div className="modal-body">
                                <p>Êtes-vous sûr de vouloir supprimer cette opportunité et toutes les candidatures associées ?</p>
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

export default OpportunitiesList;
