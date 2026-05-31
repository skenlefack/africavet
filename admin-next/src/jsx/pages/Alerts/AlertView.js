import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, getToken, API_BASE_URL } from '../../../services/api';

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

const HISTORY_ACTIONS = {
    created: { label: 'Créée', icon: 'fa-plus-circle', color: '#2196f3' },
    validated: { label: 'Approuvée', icon: 'fa-check-circle', color: '#4caf50' },
    rejected: { label: 'Rejetée', icon: 'fa-times-circle', color: '#f44336' },
    resolved: { label: 'Résolue', icon: 'fa-check-double', color: '#9e9e9e' },
    updated: { label: 'Modifiée', icon: 'fa-edit', color: '#ff9800' },
};

const AlertView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();

    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Modals
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolveNotes, setResolveNotes] = useState('');
    const [actionsTaken, setActionsTaken] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [approveNotes, setApproveNotes] = useState('');
    const [showApproveModal, setShowApproveModal] = useState(false);

    useEffect(() => {
        fetchAlert();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchAlert = async () => {
        setLoading(true);
        const res = await api.get(`/vet-alerts/${id}`, token);
        if (res.success) {
            setAlert(res.data);
        } else {
            setToast({ type: 'error', message: 'Alerte introuvable' });
        }
        setLoading(false);
    };

    const handleApprove = async () => {
        setActionLoading(true);
        const res = await api.put(`/vet-alerts/${id}/validate`, { validation_notes: approveNotes || 'Approuvée' }, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Alerte approuvée' });
            setShowApproveModal(false);
            setApproveNotes('');
            fetchAlert();
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
        setActionLoading(false);
    };

    const handleReject = async () => {
        setActionLoading(true);
        const res = await api.put(`/vet-alerts/${id}/reject`, { rejection_reason: rejectReason }, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Alerte rejetée' });
            setShowRejectModal(false);
            setRejectReason('');
            fetchAlert();
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
        setActionLoading(false);
    };

    const handleResolve = async () => {
        setActionLoading(true);
        const res = await api.put(`/vet-alerts/${id}/resolve`, { resolution_notes: resolveNotes, actions_taken: actionsTaken }, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Alerte marquée comme résolue' });
            setShowResolveModal(false);
            setResolveNotes('');
            setActionsTaken('');
            fetchAlert();
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
        setActionLoading(false);
    };

    const handleDelete = async () => {
        setActionLoading(true);
        const res = await api.delete(`/vet-alerts/${id}`, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Alerte supprimée' });
            setTimeout(() => navigate('/alerts/list'), 1000);
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
        setActionLoading(false);
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const base = API_BASE_URL.replace('/api', '');
        return `${base}${path}`;
    };

    const parseSpecies = (s) => {
        if (!s) return [];
        if (Array.isArray(s)) return s;
        try { return JSON.parse(s); } catch { return [s]; }
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

    if (!alert) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h4>Alerte introuvable</h4>
                    <Link to="/alerts/list" className="btn btn-primary mt-3">
                        <i className="fas fa-arrow-left me-2"></i>Retour à la liste
                    </Link>
                </div>
            </div>
        );
    }

    const type = TYPE_CONFIG[alert.alert_type] || TYPE_CONFIG.other;
    const prio = PRIORITY_CONFIG[alert.priority] || PRIORITY_CONFIG.medium;
    const status = STATUS_CONFIG[alert.status] || STATUS_CONFIG.pending;
    const photos = alert.photos || [];
    const history = alert.history || [];
    const species = parseSpecies(alert.species);

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
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-1">
                            <li className="breadcrumb-item"><Link to="/alerts">Alertes</Link></li>
                            <li className="breadcrumb-item"><Link to="/alerts/list">Liste</Link></li>
                            <li className="breadcrumb-item active">{alert.code || `#${alert.id}`}</li>
                        </ol>
                    </nav>
                    <h2 className="mb-1" style={{ fontWeight: 700 }}>
                        <i className={`fas ${type.icon} me-2`} style={{ color: type.color }}></i>
                        {alert.title_fr || alert.title_en}
                    </h2>
                    <div className="d-flex align-items-center gap-2 mt-2">
                        {alert.code && <span className="badge bg-light text-dark">{alert.code}</span>}
                        <span className="badge" style={{ background: type.color + '15', color: type.color }}>
                            <i className={`fas ${type.icon} me-1`}></i>{type.label}
                        </span>
                        <span className="badge" style={{ background: prio.bg, color: prio.color }}>
                            <i className={`fas ${prio.icon} me-1`}></i>{prio.label}
                        </span>
                        <span className="badge" style={{ background: status.bg, color: status.color }}>
                            <i className={`fas ${status.icon} me-1`}></i>{status.label}
                        </span>
                    </div>
                </div>
                <Link to="/alerts/list" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1"></i> Retour
                </Link>
            </div>

            <div className="row">
                {/* Main Content */}
                <div className="col-lg-8">
                    {/* Description */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0">
                            <h5 className="mb-0"><i className="fas fa-align-left text-primary me-2"></i>Description</h5>
                        </div>
                        <div className="card-body">
                            {alert.description_fr && (
                                <div className="mb-3">
                                    <small className="badge bg-light text-dark mb-2">FR</small>
                                    <div dangerouslySetInnerHTML={{ __html: alert.description_fr }} />
                                </div>
                            )}
                            {alert.description_en && (
                                <div>
                                    <small className="badge bg-light text-dark mb-2">EN</small>
                                    <div dangerouslySetInnerHTML={{ __html: alert.description_en }} />
                                </div>
                            )}
                            {!alert.description_fr && !alert.description_en && (
                                <p className="text-muted mb-0">Aucune description</p>
                            )}
                        </div>
                    </div>

                    {/* Health Information */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0">
                            <h5 className="mb-0"><i className="fas fa-heartbeat text-danger me-2"></i>Informations sanitaires</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                {alert.disease_name && (
                                    <div className="col-md-6">
                                        <small className="text-muted d-block">Maladie</small>
                                        <strong>{alert.disease_name}</strong>
                                    </div>
                                )}
                                {species.length > 0 && (
                                    <div className="col-md-6">
                                        <small className="text-muted d-block">Espèces affectées</small>
                                        <div className="d-flex flex-wrap gap-1 mt-1">
                                            {species.map((s, i) => (
                                                <span key={i} className="badge bg-light text-dark">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {alert.symptoms && (
                                    <div className="col-12">
                                        <small className="text-muted d-block">Symptômes</small>
                                        <p className="mb-0">{alert.symptoms}</p>
                                    </div>
                                )}
                                <div className="col-md-4">
                                    <div className="p-3 rounded text-center" style={{ background: '#fff3e0' }}>
                                        <h4 className="mb-0" style={{ color: '#e65100', fontWeight: 700 }}>{alert.affected_count || 0}</h4>
                                        <small className="text-muted">Animaux affectés</small>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 rounded text-center" style={{ background: '#ffebee' }}>
                                        <h4 className="mb-0" style={{ color: '#d32f2f', fontWeight: 700 }}>{alert.dead_count || 0}</h4>
                                        <small className="text-muted">Décès</small>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 rounded text-center" style={{ background: '#e3f2fd' }}>
                                        <h4 className="mb-0" style={{ color: '#1565c0', fontWeight: 700 }}>{alert.views_count || 0}</h4>
                                        <small className="text-muted">Vues</small>
                                    </div>
                                </div>
                                {alert.suspected_cause && (
                                    <div className="col-12">
                                        <small className="text-muted d-block">Cause suspectée</small>
                                        <p className="mb-0">{alert.suspected_cause}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0">
                            <h5 className="mb-0"><i className="fas fa-map-marker-alt text-success me-2"></i>Localisation</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                {alert.country && (
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Pays</small>
                                        <strong>{alert.country}</strong>
                                    </div>
                                )}
                                {alert.region && (
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Région</small>
                                        <strong>{alert.region}</strong>
                                    </div>
                                )}
                                {alert.city && (
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Ville</small>
                                        <strong>{alert.city}</strong>
                                    </div>
                                )}
                                {alert.location_details && (
                                    <div className="col-12">
                                        <small className="text-muted d-block">Détails</small>
                                        <p className="mb-0">{alert.location_details}</p>
                                    </div>
                                )}
                                {alert.latitude && alert.longitude && (
                                    <div className="col-12">
                                        <small className="text-muted d-block mb-1">Coordonnées GPS</small>
                                        <span className="badge bg-light text-dark">
                                            <i className="fas fa-map-pin me-1"></i>
                                            {alert.latitude}, {alert.longitude}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Photos */}
                    {photos.length > 0 && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <h5 className="mb-0"><i className="fas fa-images text-primary me-2"></i>Photos ({photos.length})</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    {photos.map(photo => (
                                        <div key={photo.id} className="col-md-4">
                                            <div className="position-relative" style={{ borderRadius: 8, overflow: 'hidden' }}>
                                                <img
                                                    src={getImageUrl(photo.file_path)}
                                                    alt={photo.caption || photo.file_name}
                                                    className="w-100"
                                                    style={{ height: 200, objectFit: 'cover' }}
                                                />
                                                {photo.is_primary === 1 && (
                                                    <span className="badge bg-primary position-absolute" style={{ top: 8, left: 8 }}>
                                                        Principale
                                                    </span>
                                                )}
                                                {photo.caption && (
                                                    <small className="d-block mt-1 text-muted">{photo.caption}</small>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History */}
                    {history.length > 0 && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <h5 className="mb-0"><i className="fas fa-history text-primary me-2"></i>Historique</h5>
                            </div>
                            <div className="card-body">
                                <div className="timeline">
                                    {history.map((entry, i) => {
                                        const actionCfg = HISTORY_ACTIONS[entry.action] || { label: entry.action, icon: 'fa-circle', color: '#757575' };
                                        return (
                                            <div key={entry.id || i} className="d-flex mb-3">
                                                <div className="me-3 text-center" style={{ width: 40 }}>
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                                        style={{ width: 32, height: 32, background: actionCfg.color + '15' }}>
                                                        <i className={`fas ${actionCfg.icon}`} style={{ color: actionCfg.color, fontSize: 14 }}></i>
                                                    </div>
                                                    {i < history.length - 1 && (
                                                        <div style={{ width: 2, height: 20, background: '#e0e0e0', margin: '4px auto' }}></div>
                                                    )}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between">
                                                        <strong style={{ color: actionCfg.color }}>{actionCfg.label}</strong>
                                                        <small className="text-muted">{formatDate(entry.created_at)}</small>
                                                    </div>
                                                    {entry.performed_by_username && (
                                                        <small className="text-muted">par {entry.performed_by_username}</small>
                                                    )}
                                                    {entry.notes && <p className="mb-0 mt-1 small">{entry.notes}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Actions */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0"><i className="fas fa-cogs text-primary me-2"></i>Actions</h6>
                        </div>
                        <div className="card-body d-grid gap-2">
                            {alert.status === 'pending' && (
                                <>
                                    <button className="btn btn-success" onClick={() => setShowApproveModal(true)} disabled={actionLoading}>
                                        <i className="fas fa-check-circle me-2"></i>Approuver
                                    </button>
                                    <button className="btn btn-warning" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
                                        <i className="fas fa-times-circle me-2"></i>Rejeter
                                    </button>
                                </>
                            )}
                            {(alert.status === 'approved' || alert.status === 'investigating') && (
                                <button className="btn btn-info text-white" onClick={() => setShowResolveModal(true)} disabled={actionLoading}>
                                    <i className="fas fa-check-double me-2"></i>Marquer résolue
                                </button>
                            )}
                            <button className="btn btn-outline-danger" onClick={() => setShowDeleteModal(true)} disabled={actionLoading}>
                                <i className="fas fa-trash me-2"></i>Supprimer
                            </button>
                        </div>
                    </div>

                    {/* Reporter Info */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0"><i className="fas fa-user text-primary me-2"></i>Soumetteur</h6>
                        </div>
                        <div className="card-body">
                            {alert.is_anonymous ? (
                                <p className="text-muted mb-0"><i className="fas fa-user-secret me-2"></i>Soumission anonyme</p>
                            ) : (
                                <div>
                                    {alert.reporter_name && <p className="mb-1"><strong>{alert.reporter_name}</strong></p>}
                                    {alert.reporter_organization && (
                                        <p className="mb-1 small"><i className="fas fa-building me-1 text-muted"></i>{alert.reporter_organization}</p>
                                    )}
                                    {alert.reporter_email && (
                                        <p className="mb-1 small"><i className="fas fa-envelope me-1 text-muted"></i>{alert.reporter_email}</p>
                                    )}
                                    {alert.reporter_phone && (
                                        <p className="mb-1 small"><i className="fas fa-phone me-1 text-muted"></i>{alert.reporter_phone}</p>
                                    )}
                                    {alert.reporter_username && (
                                        <p className="mb-0 small"><i className="fas fa-at me-1 text-muted"></i>{alert.reporter_username}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0"><i className="fas fa-info-circle text-primary me-2"></i>Métadonnées</h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-2 d-flex justify-content-between">
                                <small className="text-muted">Créée le</small>
                                <small>{formatDate(alert.created_at)}</small>
                            </div>
                            <div className="mb-2 d-flex justify-content-between">
                                <small className="text-muted">Modifiée le</small>
                                <small>{formatDate(alert.updated_at)}</small>
                            </div>
                            {alert.validated_at && (
                                <div className="mb-2 d-flex justify-content-between">
                                    <small className="text-muted">Approuvée le</small>
                                    <small>{formatDate(alert.validated_at)}</small>
                                </div>
                            )}
                            {alert.validator_username && (
                                <div className="mb-2 d-flex justify-content-between">
                                    <small className="text-muted">Approuvée par</small>
                                    <small>{alert.validator_username}</small>
                                </div>
                            )}
                            {alert.validation_notes && (
                                <div className="mt-2 p-2 rounded" style={{ background: '#e8f5e9' }}>
                                    <small className="text-muted d-block">Notes de validation</small>
                                    <small>{alert.validation_notes}</small>
                                </div>
                            )}
                            {alert.rejection_reason && (
                                <div className="mt-2 p-2 rounded" style={{ background: '#ffebee' }}>
                                    <small className="text-muted d-block">Raison du rejet</small>
                                    <small>{alert.rejection_reason}</small>
                                </div>
                            )}
                            {alert.resolved_at && (
                                <>
                                    <div className="mb-2 d-flex justify-content-between mt-2">
                                        <small className="text-muted">Résolue le</small>
                                        <small>{formatDate(alert.resolved_at)}</small>
                                    </div>
                                    {alert.resolution_notes && (
                                        <div className="p-2 rounded" style={{ background: '#f5f5f5' }}>
                                            <small className="text-muted d-block">Notes de résolution</small>
                                            <small>{alert.resolution_notes}</small>
                                        </div>
                                    )}
                                    {alert.actions_taken && (
                                        <div className="p-2 rounded mt-1" style={{ background: '#f5f5f5' }}>
                                            <small className="text-muted d-block">Actions prises</small>
                                            <small>{alert.actions_taken}</small>
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="mt-2 d-flex justify-content-between">
                                <small className="text-muted">Public</small>
                                <small>{alert.is_public ? 'Oui' : 'Non'}</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="fas fa-check-circle text-success me-2"></i>Approuver l'alerte</h5>
                                <button type="button" className="btn-close" onClick={() => setShowApproveModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Notes (optionnel)</label>
                                <textarea className="form-control" rows={3} value={approveNotes}
                                    onChange={e => setApproveNotes(e.target.value)} placeholder="Notes de validation..." />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowApproveModal(false)}>Annuler</button>
                                <button className="btn btn-success" onClick={handleApprove} disabled={actionLoading}>
                                    <i className="fas fa-check me-1"></i> Approuver
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="fas fa-times-circle text-warning me-2"></i>Rejeter l'alerte</h5>
                                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Raison du rejet *</label>
                                <textarea className="form-control" rows={3} value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)} placeholder="Expliquez la raison du rejet..." />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Annuler</button>
                                <button className="btn btn-warning" onClick={handleReject} disabled={actionLoading || !rejectReason.trim()}>
                                    <i className="fas fa-times me-1"></i> Rejeter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resolve Modal */}
            {showResolveModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="fas fa-check-double text-info me-2"></i>Marquer comme résolue</h5>
                                <button type="button" className="btn-close" onClick={() => setShowResolveModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Notes de résolution</label>
                                    <textarea className="form-control" rows={3} value={resolveNotes}
                                        onChange={e => setResolveNotes(e.target.value)} placeholder="Résumé de la résolution..." />
                                </div>
                                <div>
                                    <label className="form-label">Actions prises</label>
                                    <textarea className="form-control" rows={3} value={actionsTaken}
                                        onChange={e => setActionsTaken(e.target.value)} placeholder="Décrivez les actions prises..." />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowResolveModal(false)}>Annuler</button>
                                <button className="btn btn-info text-white" onClick={handleResolve} disabled={actionLoading}>
                                    <i className="fas fa-check-double me-1"></i> Résoudre
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
                                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Êtes-vous sûr de vouloir supprimer cette alerte et toutes ses données associées (photos, historique) ?</p>
                                <p className="text-danger mb-0"><strong>Cette action est irréversible.</strong></p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Annuler</button>
                                <button className="btn btn-danger" onClick={handleDelete} disabled={actionLoading}>
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

export default AlertView;
