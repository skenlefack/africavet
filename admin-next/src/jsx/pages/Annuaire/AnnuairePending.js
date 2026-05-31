import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const AnnuairePending = () => {
    const token = getToken();

    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState({ total: 0, byType: {} });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [typeFilter, setTypeFilter] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [toast, setToast] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectTarget, setRejectTarget] = useState(null); // { id, type, name } or 'batch'
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchPending();
        fetchPendingCount();
    }, [typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchPending = async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: 1, limit: 200 });
        if (typeFilter) params.set('type', typeFilter);
        const res = await api.get(`/mapping/admin/pending?${params}`, token);
        if (res.success) {
            setEntries(res.data || []);
        }
        setLoading(false);
    };

    const fetchPendingCount = async () => {
        const res = await api.get('/mapping/admin/pending/count', token);
        if (res.success) {
            setPendingCount({ total: res.data?.total || 0, byType: res.data?.byType || {} });
        }
    };

    const handleApprove = useCallback(async (entryId, entryType) => {
        setActionLoading(true);
        const typeMap = { expert: 'expert', organization: 'organization', material: 'material', document: 'document' };
        const res = await api.put(`/mapping/admin/approve/${typeMap[entryType] || entryType}/${entryId}`, {}, token);
        if (res.success) {
            setToast({ message: 'Entrée approuvée', type: 'success' });
            fetchPending();
            fetchPendingCount();
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setActionLoading(false);
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRejectConfirm = async () => {
        if (!rejectReason.trim()) return;
        setActionLoading(true);

        if (rejectTarget === 'batch') {
            // Batch reject
            let success = 0;
            for (const entry of entries.filter(e => selectedIds.includes(`${e.resource_type}-${e.id}`))) {
                const res = await api.put(`/mapping/admin/reject/${entry.resource_type}/${entry.id}`, { reason: rejectReason }, token);
                if (res.success) success++;
            }
            setToast({ message: `${success} entrée(s) rejetée(s)`, type: 'success' });
            setSelectedIds([]);
        } else if (rejectTarget) {
            const res = await api.put(`/mapping/admin/reject/${rejectTarget.type}/${rejectTarget.id}`, { reason: rejectReason }, token);
            if (res.success) {
                setToast({ message: 'Entrée rejetée', type: 'success' });
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }

        setShowRejectModal(false);
        setRejectReason('');
        setRejectTarget(null);
        fetchPending();
        fetchPendingCount();
        setActionLoading(false);
    };

    const handleBatchApprove = async () => {
        if (!selectedIds.length) return;
        setActionLoading(true);
        let success = 0;
        for (const entry of entries.filter(e => selectedIds.includes(`${e.resource_type}-${e.id}`))) {
            const res = await api.put(`/mapping/admin/approve/${entry.resource_type}/${entry.id}`, {}, token);
            if (res.success) success++;
        }
        setToast({ message: `${success} entrée(s) approuvée(s)`, type: 'success' });
        setSelectedIds([]);
        fetchPending();
        fetchPendingCount();
        setActionLoading(false);
    };

    const toggleSelect = (key) => {
        setSelectedIds(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const toggleSelectAll = () => {
        const pageEntries = paginatedEntries.map(e => `${e.resource_type}-${e.id}`);
        if (pageEntries.every(k => selectedIds.includes(k))) {
            setSelectedIds(prev => prev.filter(k => !pageEntries.includes(k)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...pageEntries])]);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const typeConfig = {
        expert: { label: 'Expert', icon: 'fa-user-md', color: '#27ae60' },
        organization: { label: 'Organisation', icon: 'fa-building', color: '#354e84' },
        material: { label: 'Matériel', icon: 'fa-tools', color: '#e67e22' },
        document: { label: 'Document', icon: 'fa-file-alt', color: '#9b59b6' },
    };

    // Pagination
    const totalItems = entries.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEntries = entries.slice(startIndex, startIndex + itemsPerPage);

    return (
        <>
            {/* Toast */}
            {toast && (
                <div
                    className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                    style={{ top: 20, right: 20, zIndex: 9999, minWidth: 300 }}
                >
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
                            <li className="breadcrumb-item"><Link to="/annuaire">Annuaire</Link></li>
                            <li className="breadcrumb-item active">En attente</li>
                        </ol>
                    </nav>
                    <h2 className="mb-0" style={{ fontWeight: 700 }}>
                        <i className="fas fa-clock text-warning me-2"></i>
                        Soumissions en attente
                        {pendingCount.total > 0 && (
                            <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '14px' }}>
                                {pendingCount.total}
                            </span>
                        )}
                    </h2>
                </div>
                <Link to="/annuaire" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1"></i> Retour
                </Link>
            </div>

            {/* Type count pills */}
            <div className="d-flex flex-wrap gap-2 mb-4">
                <button
                    className={`btn btn-sm ${!typeFilter ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => { setTypeFilter(''); setCurrentPage(1); }}
                >
                    Tous ({pendingCount.total})
                </button>
                {Object.entries(pendingCount.byType).map(([type, count]) => {
                    const cfg = typeConfig[type] || { label: type, icon: 'fa-circle', color: '#666' };
                    return (
                        <button
                            key={type}
                            className={`btn btn-sm ${typeFilter === type ? '' : 'btn-outline-secondary'}`}
                            style={typeFilter === type ? { background: cfg.color, borderColor: cfg.color, color: '#fff' } : {}}
                            onClick={() => { setTypeFilter(typeFilter === type ? '' : type); setCurrentPage(1); }}
                        >
                            <i className={`fas ${cfg.icon} me-1`}></i>
                            {cfg.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Batch actions */}
            {selectedIds.length > 0 && (
                <div className="alert alert-info d-flex align-items-center justify-content-between py-2 mb-3">
                    <span>
                        <i className="fas fa-check-square me-1"></i>
                        {selectedIds.length} élément(s) sélectionné(s)
                    </span>
                    <div className="d-flex gap-2">
                        <button className="btn btn-success btn-sm" onClick={handleBatchApprove} disabled={actionLoading}>
                            <i className="fas fa-check me-1"></i> Approuver la sélection
                        </button>
                        <button
                            className="btn btn-warning btn-sm"
                            onClick={() => { setRejectTarget('batch'); setShowRejectModal(true); }}
                            disabled={actionLoading}
                        >
                            <i className="fas fa-times me-1"></i> Rejeter la sélection
                        </button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedIds([])}>
                            Désélectionner
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            ) : entries.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <i className="fas fa-check-circle fa-3x text-success mb-3 opacity-50"></i>
                        <h5>Aucune soumission en attente</h5>
                        <p className="text-muted">Toutes les soumissions ont été traitées.</p>
                    </div>
                </div>
            ) : (
                <div className="card border-0 shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th style={{ width: 40 }}>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={paginatedEntries.length > 0 && paginatedEntries.every(e => selectedIds.includes(`${e.resource_type}-${e.id}`))}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th style={{ width: '30%' }}>Nom</th>
                                    <th style={{ width: '12%' }}>Type</th>
                                    <th style={{ width: '15%' }}>Pays</th>
                                    <th style={{ width: '13%' }}>Soumis par</th>
                                    <th style={{ width: '12%' }}>Date</th>
                                    <th style={{ width: '18%' }} className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedEntries.map((entry) => {
                                    const key = `${entry.resource_type}-${entry.id}`;
                                    const cfg = typeConfig[entry.resource_type] || typeConfig.organization;
                                    return (
                                        <tr key={key}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={selectedIds.includes(key)}
                                                    onChange={() => toggleSelect(key)}
                                                />
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="me-2 d-flex align-items-center justify-content-center flex-shrink-0"
                                                        style={{
                                                            width: 36, height: 36, borderRadius: 8,
                                                            background: `${cfg.color}15`, color: cfg.color
                                                        }}
                                                    >
                                                        <i className={`fas ${cfg.icon}`}></i>
                                                    </div>
                                                    <div>
                                                        <Link
                                                            to={`/annuaire/view/${entry.id}`}
                                                            className="fw-semibold text-dark text-decoration-none"
                                                        >
                                                            {entry.display_name || entry.name || `${entry.first_name || ''} ${entry.last_name || ''}`.trim() || `#${entry.id}`}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge" style={{ background: `${cfg.color}15`, color: cfg.color, fontSize: '11px' }}>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="small">{entry.country || '-'}</td>
                                            <td className="small text-muted">{entry.submitter_username || entry.submitter_email || '-'}</td>
                                            <td className="small text-muted">{formatDate(entry.submitted_at)}</td>
                                            <td className="text-end">
                                                <div className="btn-group btn-group-sm">
                                                    <Link
                                                        to={`/annuaire/view/${entry.id}`}
                                                        className="btn btn-outline-primary"
                                                        title="Voir"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                    <button
                                                        className="btn btn-outline-success"
                                                        title="Approuver"
                                                        onClick={() => handleApprove(entry.id, entry.resource_type)}
                                                        disabled={actionLoading}
                                                    >
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-warning"
                                                        title="Rejeter"
                                                        onClick={() => {
                                                            setRejectTarget({
                                                                id: entry.id,
                                                                type: entry.resource_type,
                                                                name: entry.display_name || entry.name
                                                            });
                                                            setShowRejectModal(true);
                                                        }}
                                                        disabled={actionLoading}
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalItems > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                            itemName="soumissions"
                        />
                    )}
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-times-circle text-warning me-2"></i>
                                    {rejectTarget === 'batch'
                                        ? `Rejeter ${selectedIds.length} entrée(s)`
                                        : `Rejeter : ${rejectTarget?.name || ''}`
                                    }
                                </h5>
                                <button type="button" className="btn-close" onClick={() => { setShowRejectModal(false); setRejectReason(''); }}></button>
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Motif du rejet *</label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Expliquez la raison du rejet..."
                                    autoFocus
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => { setShowRejectModal(false); setRejectReason(''); }}>
                                    Annuler
                                </button>
                                <button
                                    className="btn btn-warning"
                                    onClick={handleRejectConfirm}
                                    disabled={!rejectReason.trim() || actionLoading}
                                >
                                    {actionLoading ? (
                                        <><span className="spinner-border spinner-border-sm me-1"></span> Envoi...</>
                                    ) : (
                                        <><i className="fas fa-times me-1"></i> Rejeter</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AnnuairePending;
