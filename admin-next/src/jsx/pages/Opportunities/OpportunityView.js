import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, getToken, API_BASE_URL } from '../../../services/api';

const TYPE_CONFIG = {
    job: { label: 'Emploi', icon: 'fa-briefcase', color: '#1565c0', bg: '#e3f2fd' },
    tender: { label: 'Appel d\'offres', icon: 'fa-file-contract', color: '#6a1b9a', bg: '#f3e5f5' },
    market: { label: 'Marché', icon: 'fa-store', color: '#2e7d32', bg: '#e8f5e9' },
};

const STATUS_CONFIG = {
    draft: { label: 'Brouillon', color: '#9e9e9e', bg: '#f5f5f5', icon: 'fa-edit' },
    pending: { label: 'En attente', color: '#ff9800', bg: '#fff3e0', icon: 'fa-clock' },
    published: { label: 'Publiée', color: '#4caf50', bg: '#e8f5e9', icon: 'fa-check-circle' },
    closed: { label: 'Clôturée', color: '#757575', bg: '#f5f5f5', icon: 'fa-lock' },
    cancelled: { label: 'Annulée', color: '#f44336', bg: '#ffebee', icon: 'fa-times-circle' },
};

const APP_STATUS_CONFIG = {
    submitted: { label: 'Soumise', color: '#2196f3', bg: '#e3f2fd' },
    under_review: { label: 'En cours', color: '#ff9800', bg: '#fff3e0' },
    shortlisted: { label: 'Présélectionné', color: '#9c27b0', bg: '#f3e5f5' },
    interview: { label: 'Entretien', color: '#00bcd4', bg: '#e0f7fa' },
    accepted: { label: 'Accepté', color: '#4caf50', bg: '#e8f5e9' },
    rejected: { label: 'Rejeté', color: '#f44336', bg: '#ffebee' },
    withdrawn: { label: 'Retiré', color: '#9e9e9e', bg: '#f5f5f5' },
};

const JOB_TYPE_LABELS = {
    full_time: 'Temps plein',
    part_time: 'Temps partiel',
    contract: 'Contrat',
    internship: 'Stage',
    volunteer: 'Bénévolat',
    freelance: 'Freelance',
};

const OpportunityView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();

    const [opp, setOpp] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchData = async () => {
        setLoading(true);
        const [oppRes, appRes] = await Promise.all([
            api.get(`/opportunities/${id}`, token),
            api.get(`/opportunities/${id}/applications`, token),
        ]);
        if (oppRes.success) setOpp(oppRes.data);
        if (appRes.success) setApplications(Array.isArray(appRes.data) ? appRes.data : []);
        setLoading(false);
    };

    const handleApprove = async () => {
        setActionLoading(true);
        const res = await api.put(`/opportunities/${id}/approve`, {}, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Opportunité publiée' });
            fetchData();
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
        setActionLoading(false);
    };

    const handleReject = async () => {
        setActionLoading(true);
        const res = await api.put(`/opportunities/${id}/reject`, { reason: rejectReason }, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Opportunité rejetée' });
            setShowRejectModal(false);
            setRejectReason('');
            fetchData();
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
        setActionLoading(false);
    };

    const handleDelete = async () => {
        setActionLoading(true);
        const res = await api.delete(`/opportunities/${id}`, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Opportunité supprimée' });
            setTimeout(() => navigate('/opportunities/list'), 1000);
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
        setActionLoading(false);
    };

    const exportCsv = () => {
        if (applications.length === 0) return;
        const headers = ['Nom', 'Email', 'Téléphone', 'Expérience (ans)', 'Poste actuel', 'Organisation', 'Statut', 'Date'];
        const rows = applications.map(a => [
            a.applicant_name, a.applicant_email, a.applicant_phone || '',
            a.experience_years || '', a.current_position || '', a.current_organization || '',
            APP_STATUS_CONFIG[a.status]?.label || a.status, formatDate(a.created_at),
        ]);
        const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `candidatures-${id}.csv`;
        link.click();
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL.replace('/api', '')}${path}`;
    };

    const parseJson = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try { return JSON.parse(val); } catch { return []; }
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

    if (!opp) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h4>Opportunité introuvable</h4>
                    <Link to="/opportunities/list" className="btn btn-primary mt-3">
                        <i className="fas fa-arrow-left me-2"></i>Retour
                    </Link>
                </div>
            </div>
        );
    }

    const typeCfg = TYPE_CONFIG[opp.opportunity_type] || TYPE_CONFIG.job;
    const statusCfg = STATUS_CONFIG[opp.status] || STATUS_CONFIG.pending;
    const skills = parseJson(opp.skills_required);
    const benefits = parseJson(opp.benefits);
    const categories = opp.categories || [];

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
                            <li className="breadcrumb-item"><Link to="/opportunities">Opportunités</Link></li>
                            <li className="breadcrumb-item"><Link to="/opportunities/list">Liste</Link></li>
                            <li className="breadcrumb-item active">{opp.title_fr || opp.title_en}</li>
                        </ol>
                    </nav>
                    <h2 className="mb-1" style={{ fontWeight: 700 }}>
                        <i className={`fas ${typeCfg.icon} me-2`} style={{ color: typeCfg.color }}></i>
                        {opp.title_fr || opp.title_en}
                    </h2>
                    <div className="d-flex align-items-center gap-2 mt-2">
                        <span className="badge" style={{ background: typeCfg.bg, color: typeCfg.color }}>
                            <i className={`fas ${typeCfg.icon} me-1`}></i>{typeCfg.label}
                        </span>
                        <span className="badge" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                            <i className={`fas ${statusCfg.icon} me-1`}></i>{statusCfg.label}
                        </span>
                        {opp.is_featured === 1 && <span className="badge bg-warning text-dark"><i className="fas fa-star me-1"></i>Vedette</span>}
                        {opp.is_urgent === 1 && <span className="badge bg-danger"><i className="fas fa-bolt me-1"></i>Urgent</span>}
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <Link to={`/opportunities/edit/${id}`} className="btn btn-outline-primary btn-sm">
                        <i className="fas fa-edit me-1"></i> Éditer
                    </Link>
                    <Link to="/opportunities/list" className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-arrow-left me-1"></i> Retour
                    </Link>
                </div>
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
                            {opp.description_fr && (
                                <div className="mb-3">
                                    <small className="badge bg-light text-dark mb-2">FR</small>
                                    <div dangerouslySetInnerHTML={{ __html: opp.description_fr }} />
                                </div>
                            )}
                            {opp.description_en && (
                                <div>
                                    <small className="badge bg-light text-dark mb-2">EN</small>
                                    <div dangerouslySetInnerHTML={{ __html: opp.description_en }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Job Details */}
                    {opp.opportunity_type === 'job' && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <h5 className="mb-0"><i className="fas fa-briefcase text-primary me-2"></i>Détails du poste</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    {opp.job_type && (
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Type de contrat</small>
                                            <strong>{JOB_TYPE_LABELS[opp.job_type] || opp.job_type}</strong>
                                        </div>
                                    )}
                                    {opp.experience_required && (
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Expérience requise</small>
                                            <strong>{opp.experience_required}</strong>
                                        </div>
                                    )}
                                    {opp.education_required && (
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Formation</small>
                                            <strong>{opp.education_required}</strong>
                                        </div>
                                    )}
                                    {(opp.salary_min || opp.salary_max) && (
                                        <div className="col-md-6">
                                            <small className="text-muted d-block">Salaire</small>
                                            <strong>
                                                {opp.salary_min && opp.salary_max
                                                    ? `${Number(opp.salary_min).toLocaleString()} - ${Number(opp.salary_max).toLocaleString()} ${opp.salary_currency || 'XAF'}`
                                                    : opp.salary_min ? `À partir de ${Number(opp.salary_min).toLocaleString()} ${opp.salary_currency || 'XAF'}`
                                                    : `Jusqu'à ${Number(opp.salary_max).toLocaleString()} ${opp.salary_currency || 'XAF'}`
                                                }
                                                {opp.salary_period && ` / ${opp.salary_period}`}
                                            </strong>
                                        </div>
                                    )}
                                    {opp.is_remote === 1 && (
                                        <div className="col-md-6">
                                            <span className="badge bg-info text-white"><i className="fas fa-laptop-house me-1"></i>Télétravail possible</span>
                                        </div>
                                    )}
                                </div>
                                {skills.length > 0 && (
                                    <div className="mt-3">
                                        <small className="text-muted d-block mb-1">Compétences requises</small>
                                        <div className="d-flex flex-wrap gap-1">
                                            {skills.map((s, i) => <span key={i} className="badge bg-light text-dark">{s}</span>)}
                                        </div>
                                    </div>
                                )}
                                {benefits.length > 0 && (
                                    <div className="mt-3">
                                        <small className="text-muted d-block mb-1">Avantages</small>
                                        <div className="d-flex flex-wrap gap-1">
                                            {benefits.map((b, i) => <span key={i} className="badge" style={{ background: '#e8f5e9', color: '#2e7d32' }}>{b}</span>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tender Details */}
                    {opp.opportunity_type === 'tender' && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <h5 className="mb-0"><i className="fas fa-file-contract text-primary me-2"></i>Détails de l'appel d'offres</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    {opp.tender_reference && (
                                        <div className="col-md-6"><small className="text-muted d-block">Référence</small><strong>{opp.tender_reference}</strong></div>
                                    )}
                                    {opp.tender_type && (
                                        <div className="col-md-6"><small className="text-muted d-block">Type</small><strong>{opp.tender_type}</strong></div>
                                    )}
                                    {(opp.budget_min || opp.budget_max) && (
                                        <div className="col-md-6">
                                            <small className="text-muted d-block">Budget estimé</small>
                                            <strong>
                                                {opp.budget_min && opp.budget_max
                                                    ? `${Number(opp.budget_min).toLocaleString()} - ${Number(opp.budget_max).toLocaleString()} ${opp.budget_currency || 'XAF'}`
                                                    : `${Number(opp.budget_min || opp.budget_max).toLocaleString()} ${opp.budget_currency || 'XAF'}`}
                                            </strong>
                                        </div>
                                    )}
                                    {opp.submission_method && (
                                        <div className="col-12"><small className="text-muted d-block">Méthode de soumission</small><p className="mb-0">{opp.submission_method}</p></div>
                                    )}
                                    {opp.eligibility_criteria && (
                                        <div className="col-12"><small className="text-muted d-block">Critères d'éligibilité</small><p className="mb-0">{opp.eligibility_criteria}</p></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Applications */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="fas fa-users text-primary me-2"></i>
                                Candidatures ({applications.length})
                            </h5>
                            {applications.length > 0 && (
                                <button className="btn btn-sm btn-outline-primary" onClick={exportCsv}>
                                    <i className="fas fa-download me-1"></i> Export CSV
                                </button>
                            )}
                        </div>
                        <div className="card-body p-0">
                            {applications.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <i className="fas fa-inbox fa-2x mb-2"></i>
                                    <p className="mb-0">Aucune candidature</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr style={{ background: '#f8f9fa' }}>
                                                <th>Candidat</th>
                                                <th>Contact</th>
                                                <th>Expérience</th>
                                                <th>Statut</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.map(app => {
                                                const appStatus = APP_STATUS_CONFIG[app.status] || APP_STATUS_CONFIG.submitted;
                                                return (
                                                    <tr key={app.id}>
                                                        <td>
                                                            <strong>{app.applicant_name}</strong>
                                                            {app.current_position && <><br /><small className="text-muted">{app.current_position}</small></>}
                                                            {app.current_organization && <><br /><small className="text-muted">{app.current_organization}</small></>}
                                                        </td>
                                                        <td>
                                                            <small>{app.applicant_email}</small>
                                                            {app.applicant_phone && <><br /><small className="text-muted">{app.applicant_phone}</small></>}
                                                        </td>
                                                        <td>{app.experience_years ? `${app.experience_years} ans` : '—'}</td>
                                                        <td>
                                                            <span className="badge" style={{ background: appStatus.bg, color: appStatus.color }}>
                                                                {appStatus.label}
                                                            </span>
                                                        </td>
                                                        <td><small>{formatDate(app.created_at)}</small></td>
                                                        <td>
                                                            {app.cv_file && (
                                                                <a href={getFileUrl(app.cv_file)} target="_blank" rel="noopener noreferrer"
                                                                    className="btn btn-sm btn-outline-primary me-1" title="Voir CV">
                                                                    <i className="fas fa-file-pdf"></i>
                                                                </a>
                                                            )}
                                                            {app.cover_letter && (
                                                                <button className="btn btn-sm btn-outline-secondary" title="Lettre"
                                                                    onClick={() => {
                                                                        setToast({ type: 'success', message: 'Lettre de motivation : ' + app.cover_letter.substring(0, 200) + '...' });
                                                                    }}>
                                                                    <i className="fas fa-envelope-open-text"></i>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Actions */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0"><i className="fas fa-cogs text-primary me-2"></i>Actions</h6>
                        </div>
                        <div className="card-body d-grid gap-2">
                            {opp.status === 'pending' && (
                                <>
                                    <button className="btn btn-success" onClick={handleApprove} disabled={actionLoading}>
                                        <i className="fas fa-check-circle me-2"></i>Publier
                                    </button>
                                    <button className="btn btn-warning" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
                                        <i className="fas fa-times-circle me-2"></i>Rejeter
                                    </button>
                                </>
                            )}
                            <Link to={`/opportunities/edit/${id}`} className="btn btn-outline-primary">
                                <i className="fas fa-edit me-2"></i>Modifier
                            </Link>
                            <button className="btn btn-outline-danger" onClick={() => setShowDeleteModal(true)} disabled={actionLoading}>
                                <i className="fas fa-trash me-2"></i>Supprimer
                            </button>
                        </div>
                    </div>

                    {/* Organization */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0"><i className="fas fa-building text-primary me-2"></i>Organisation</h6>
                        </div>
                        <div className="card-body">
                            <p className="mb-1"><strong>{opp.organization_name || opp.org_name || '—'}</strong></p>
                            {opp.contact_name && <p className="mb-1 small"><i className="fas fa-user me-1 text-muted"></i>{opp.contact_name}</p>}
                            {(opp.contact_email || opp.org_email) && <p className="mb-1 small"><i className="fas fa-envelope me-1 text-muted"></i>{opp.contact_email || opp.org_email}</p>}
                            {opp.contact_phone && <p className="mb-1 small"><i className="fas fa-phone me-1 text-muted"></i>{opp.contact_phone}</p>}
                            {(opp.website_url || opp.org_website) && (
                                <p className="mb-0 small">
                                    <i className="fas fa-globe me-1 text-muted"></i>
                                    <a href={opp.website_url || opp.org_website} target="_blank" rel="noopener noreferrer">
                                        {opp.website_url || opp.org_website}
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0"><i className="fas fa-map-marker-alt text-primary me-2"></i>Localisation</h6>
                        </div>
                        <div className="card-body">
                            <p className="mb-1">{[opp.city, opp.region, opp.country].filter(Boolean).join(', ') || '—'}</p>
                            {opp.address && <p className="mb-1 small text-muted">{opp.address}</p>}
                            {opp.is_remote === 1 && (
                                <span className="badge bg-info text-white"><i className="fas fa-laptop-house me-1"></i>Télétravail</span>
                            )}
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0"><i className="fas fa-info-circle text-primary me-2"></i>Métadonnées</h6>
                        </div>
                        <div className="card-body">
                            {opp.deadline && (
                                <div className="mb-2 d-flex justify-content-between">
                                    <small className="text-muted">Date limite</small>
                                    <small className={new Date(opp.deadline) < new Date() ? 'text-danger fw-bold' : ''}>
                                        {formatDate(opp.deadline)}
                                    </small>
                                </div>
                            )}
                            <div className="mb-2 d-flex justify-content-between">
                                <small className="text-muted">Vues</small>
                                <small>{opp.views_count || 0}</small>
                            </div>
                            <div className="mb-2 d-flex justify-content-between">
                                <small className="text-muted">Candidatures</small>
                                <small>{opp.applications_count || 0}</small>
                            </div>
                            <div className="mb-2 d-flex justify-content-between">
                                <small className="text-muted">Créée le</small>
                                <small>{formatDate(opp.created_at)}</small>
                            </div>
                            {opp.approved_at && (
                                <div className="mb-2 d-flex justify-content-between">
                                    <small className="text-muted">Publiée le</small>
                                    <small>{formatDate(opp.approved_at)}</small>
                                </div>
                            )}
                            {categories.length > 0 && (
                                <div className="mt-2">
                                    <small className="text-muted d-block mb-1">Catégories</small>
                                    <div className="d-flex flex-wrap gap-1">
                                        {categories.map(c => (
                                            <span key={c.id} className="badge bg-light text-dark">
                                                {c.icon && <i className={`fas fa-${c.icon} me-1`}></i>}
                                                {c.name_fr || c.name_en}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="fas fa-times-circle text-warning me-2"></i>Rejeter l'opportunité</h5>
                                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Raison du rejet</label>
                                <textarea className="form-control" rows={3} value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)} placeholder="Raison..." />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Annuler</button>
                                <button className="btn btn-warning" onClick={handleReject} disabled={actionLoading}>
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
                                <h5 className="modal-title"><i className="fas fa-trash text-danger me-2"></i>Supprimer</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Supprimer cette opportunité et toutes les candidatures associées ?</p>
                                <p className="text-danger mb-0"><strong>Action irréversible.</strong></p>
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

export default OpportunityView;
