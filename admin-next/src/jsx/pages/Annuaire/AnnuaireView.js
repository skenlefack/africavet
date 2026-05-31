import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, getToken, API_BASE_URL } from '../../../services/api';

const COUNTRY_FLAGS = {
    'DZ': '🇩🇿', 'AO': '🇦🇴', 'BJ': '🇧🇯', 'BW': '🇧🇼', 'BF': '🇧🇫', 'BI': '🇧🇮',
    'CV': '🇨🇻', 'CM': '🇨🇲', 'CF': '🇨🇫', 'TD': '🇹🇩', 'KM': '🇰🇲', 'CG': '🇨🇬',
    'CD': '🇨🇩', 'CI': '🇨🇮', 'DJ': '🇩🇯', 'EG': '🇪🇬', 'GQ': '🇬🇶', 'ER': '🇪🇷',
    'SZ': '🇸🇿', 'ET': '🇪🇹', 'GA': '🇬🇦', 'GM': '🇬🇲', 'GH': '🇬🇭', 'GN': '🇬🇳',
    'GW': '🇬🇼', 'KE': '🇰🇪', 'LS': '🇱🇸', 'LR': '🇱🇷', 'LY': '🇱🇾', 'MG': '🇲🇬',
    'MW': '🇲🇼', 'ML': '🇲🇱', 'MR': '🇲🇷', 'MU': '🇲🇺', 'MA': '🇲🇦', 'MZ': '🇲🇿',
    'NA': '🇳🇦', 'NE': '🇳🇪', 'NG': '🇳🇬', 'RW': '🇷🇼', 'ST': '🇸🇹', 'SN': '🇸🇳',
    'SC': '🇸🇨', 'SL': '🇸🇱', 'SO': '🇸🇴', 'ZA': '🇿🇦', 'SS': '🇸🇸', 'SD': '🇸🇩',
    'TZ': '🇹🇿', 'TG': '🇹🇬', 'TN': '🇹🇳', 'UG': '🇺🇬', 'ZM': '🇿🇲', 'ZW': '🇿🇼',
};

const STATUS_CONFIG = {
    approved: { label: 'Approuvé', color: '#27ae60', icon: 'fa-check-circle', bg: '#27ae6015' },
    pending: { label: 'En attente', color: '#f39c12', icon: 'fa-clock', bg: '#f39c1215' },
    rejected: { label: 'Rejeté', color: '#e74c3c', icon: 'fa-times-circle', bg: '#e74c3c15' },
    draft: { label: 'Brouillon', color: '#95a5a6', icon: 'fa-file-alt', bg: '#95a5a615' },
};

const AnnuaireView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();

    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchEntry();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchEntry = async () => {
        setLoading(true);
        const res = await api.get(`/mapping/admin/${id}?type=organization`, token);
        if (res.success) {
            setEntry(res.data);
        } else {
            // Try as expert
            const res2 = await api.get(`/mapping/admin/${id}?type=expert`, token);
            if (res2.success) {
                setEntry(res2.data);
            } else {
                setToast({ message: 'Entrée introuvable', type: 'error' });
            }
        }
        setLoading(false);
    };

    const handleApprove = async () => {
        setActionLoading(true);
        const entryType = entry.resource_type || (entry.first_name !== undefined ? 'expert' : 'organization');
        const res = await api.put(`/mapping/admin/${id}`, {
            type: entryType,
            submission_status: 'approved',
            is_active: true
        }, token);
        if (res.success) {
            setToast({ message: 'Entrée approuvée avec succès', type: 'success' });
            fetchEntry();
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setActionLoading(false);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        setActionLoading(true);
        const entryType = entry.resource_type || (entry.first_name !== undefined ? 'expert' : 'organization');
        const res = await api.put(`/mapping/admin/${id}`, {
            type: entryType,
            submission_status: 'rejected',
            rejection_reason: rejectReason,
            is_active: false
        }, token);
        if (res.success) {
            setToast({ message: 'Entrée rejetée', type: 'success' });
            setShowRejectModal(false);
            setRejectReason('');
            fetchEntry();
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setActionLoading(false);
    };

    const handleDelete = async () => {
        setActionLoading(true);
        const entryType = entry.resource_type || (entry.first_name !== undefined ? 'expert' : 'organization');
        const table = entryType === 'expert' ? 'experts' : 'organizations';
        const res = await api.delete(`/mapping/${table}/${id}`, token);
        if (res.success) {
            setToast({ message: 'Entrée supprimée', type: 'success' });
            setTimeout(() => navigate('/annuaire/list'), 1000);
        } else {
            setToast({ message: res.message || 'Erreur lors de la suppression', type: 'error' });
        }
        setActionLoading(false);
        setShowDeleteConfirm(false);
    };

    const getEntryType = () => {
        if (!entry) return 'unknown';
        if (entry.resource_type) return entry.resource_type;
        return entry.first_name !== undefined ? 'expert' : 'organization';
    };

    const getDisplayName = () => {
        if (!entry) return '';
        if (entry.name) return entry.name;
        return [entry.first_name, entry.last_name].filter(Boolean).join(' ');
    };

    const parseJson = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch { return []; }
        }
        return [];
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
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

    if (!entry) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h4>Entrée introuvable</h4>
                    <p className="text-muted">L'entrée demandée n'existe pas ou a été supprimée.</p>
                    <Link to="/annuaire/list" className="btn btn-primary">
                        <i className="fas fa-arrow-left me-2"></i>Retour à la liste
                    </Link>
                </div>
            </div>
        );
    }

    const entryType = getEntryType();
    const isExpert = entryType === 'expert';
    const status = STATUS_CONFIG[entry.submission_status] || STATUS_CONFIG.draft;
    const services = parseJson(entry.services);
    const species = parseJson(entry.species_treated);
    const languages = parseJson(entry.languages_spoken);
    const specialties = parseJson(entry.specialties);
    const skills = parseJson(entry.skills);
    const countryFlag = COUNTRY_FLAGS[entry.country_code] || '';

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
            <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
                <div>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-2">
                            <li className="breadcrumb-item"><Link to="/annuaire">Annuaire</Link></li>
                            <li className="breadcrumb-item"><Link to="/annuaire/list">Liste</Link></li>
                            <li className="breadcrumb-item active">{getDisplayName()}</li>
                        </ol>
                    </nav>
                    <div className="d-flex align-items-center gap-3">
                        <h2 className="mb-0" style={{ fontWeight: 700 }}>{getDisplayName()}</h2>
                        <span className="badge d-inline-flex align-items-center gap-1" style={{ background: status.color, fontSize: '12px', padding: '6px 12px' }}>
                            <i className={`fas ${status.icon}`}></i> {status.label}
                        </span>
                        {isExpert && <span className="badge bg-info">Expert</span>}
                        {!isExpert && <span className="badge bg-primary">Organisation</span>}
                    </div>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    {entry.submission_status === 'pending' && (
                        <>
                            <button
                                className="btn btn-success btn-sm"
                                onClick={handleApprove}
                                disabled={actionLoading}
                            >
                                <i className="fas fa-check me-1"></i> Approuver
                            </button>
                            <button
                                className="btn btn-warning btn-sm"
                                onClick={() => setShowRejectModal(true)}
                                disabled={actionLoading}
                            >
                                <i className="fas fa-times me-1"></i> Rejeter
                            </button>
                        </>
                    )}
                    <Link to={`/annuaire/edit/${id}?type=${entryType}`} className="btn btn-outline-primary btn-sm">
                        <i className="fas fa-edit me-1"></i> Modifier
                    </Link>
                    <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={actionLoading}
                    >
                        <i className="fas fa-trash me-1"></i> Supprimer
                    </button>
                    <Link to="/annuaire/list" className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-arrow-left me-1"></i> Retour
                    </Link>
                </div>
            </div>

            <div className="row">
                {/* Main content */}
                <div className="col-lg-8">
                    {/* Coordonnées */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h5 className="mb-0"><i className="fas fa-id-card text-primary me-2"></i>Coordonnées</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="text-muted small">Nom</label>
                                    <p className="fw-semibold mb-2">{getDisplayName()}</p>
                                </div>
                                {!isExpert && entry.acronym && (
                                    <div className="col-md-6">
                                        <label className="text-muted small">Sigle</label>
                                        <p className="fw-semibold mb-2">{entry.acronym}</p>
                                    </div>
                                )}
                                <div className="col-md-6">
                                    <label className="text-muted small">Type</label>
                                    <p className="fw-semibold mb-2">
                                        {isExpert ? (entry.category || entry.title || 'Expert') : (entry.type || entry.organization_type || 'Organisation')}
                                    </p>
                                </div>
                                {entry.country && (
                                    <div className="col-md-6">
                                        <label className="text-muted small">Pays</label>
                                        <p className="fw-semibold mb-2">
                                            {countryFlag && <span className="me-1">{countryFlag}</span>}
                                            {entry.country}
                                            {entry.country_code && <span className="text-muted ms-1">({entry.country_code})</span>}
                                        </p>
                                    </div>
                                )}
                                {entry.city && (
                                    <div className="col-md-6">
                                        <label className="text-muted small">Ville</label>
                                        <p className="fw-semibold mb-2">{entry.city}</p>
                                    </div>
                                )}
                                {entry.address && (
                                    <div className="col-md-6">
                                        <label className="text-muted small">Adresse</label>
                                        <p className="fw-semibold mb-2">{entry.address}</p>
                                    </div>
                                )}
                                {entry.region && (
                                    <div className="col-md-6">
                                        <label className="text-muted small">Région</label>
                                        <p className="fw-semibold mb-2">{entry.region}</p>
                                    </div>
                                )}
                            </div>

                            {/* Contact info */}
                            <hr />
                            <div className="row g-3">
                                {(entry.contact_phone || entry.phone) && (
                                    <div className="col-md-4">
                                        <div className="d-flex align-items-center p-2 rounded" style={{ background: '#f8f9fa' }}>
                                            <i className="fas fa-phone text-primary me-2"></i>
                                            <div>
                                                <small className="text-muted d-block">Téléphone</small>
                                                <span className="small fw-semibold">{entry.contact_phone || entry.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {entry.whatsapp && (
                                    <div className="col-md-4">
                                        <div className="d-flex align-items-center p-2 rounded" style={{ background: '#25D36610' }}>
                                            <i className="fab fa-whatsapp me-2" style={{ color: '#25D366' }}></i>
                                            <div>
                                                <small className="text-muted d-block">WhatsApp</small>
                                                <span className="small fw-semibold">{entry.whatsapp}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {(entry.contact_email || entry.email) && (
                                    <div className="col-md-4">
                                        <div className="d-flex align-items-center p-2 rounded" style={{ background: '#f8f9fa' }}>
                                            <i className="fas fa-envelope text-muted me-2"></i>
                                            <div>
                                                <small className="text-muted d-block">Email</small>
                                                <a href={`mailto:${entry.contact_email || entry.email}`} className="small fw-semibold text-decoration-none">
                                                    {entry.contact_email || entry.email}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {entry.website && (
                                    <div className="col-md-4">
                                        <div className="d-flex align-items-center p-2 rounded" style={{ background: '#f8f9fa' }}>
                                            <i className="fas fa-globe text-info me-2"></i>
                                            <div>
                                                <small className="text-muted d-block">Site web</small>
                                                <a href={entry.website.startsWith('http') ? entry.website : `https://${entry.website}`}
                                                   target="_blank" rel="noopener noreferrer"
                                                   className="small fw-semibold text-decoration-none">
                                                    {entry.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Activités / Spécialités */}
                    {(services.length > 0 || species.length > 0 || specialties.length > 0 || skills.length > 0 || entry.specialization) && (
                        <div className="card mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0"><i className="fas fa-cogs text-success me-2"></i>Activités & Spécialités</h5>
                            </div>
                            <div className="card-body">
                                {entry.specialization && (
                                    <div className="mb-3">
                                        <label className="text-muted small d-block mb-1">Spécialisation</label>
                                        <span className="badge bg-primary" style={{ fontSize: '13px', padding: '6px 12px' }}>
                                            {entry.specialization}
                                        </span>
                                    </div>
                                )}
                                {services.length > 0 && (
                                    <div className="mb-3">
                                        <label className="text-muted small d-block mb-2">
                                            <i className="fas fa-cogs me-1"></i> Services
                                        </label>
                                        <div className="d-flex flex-wrap gap-1">
                                            {services.map((s, i) => (
                                                <span key={i} className="badge" style={{ background: '#354e8415', color: '#354e84', fontSize: '12px' }}>
                                                    {typeof s === 'string' ? s : s.name || s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {species.length > 0 && (
                                    <div className="mb-3">
                                        <label className="text-muted small d-block mb-2">
                                            <i className="fas fa-paw me-1"></i> Espèces traitées
                                        </label>
                                        <div className="d-flex flex-wrap gap-1">
                                            {species.map((s, i) => (
                                                <span key={i} className="badge" style={{ background: '#7ac14215', color: '#2d8a0e', fontSize: '12px' }}>
                                                    {typeof s === 'string' ? s : s.name || s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {specialties.length > 0 && (
                                    <div className="mb-3">
                                        <label className="text-muted small d-block mb-2">
                                            <i className="fas fa-star me-1"></i> Spécialités
                                        </label>
                                        <div className="d-flex flex-wrap gap-1">
                                            {specialties.map((s, i) => (
                                                <span key={i} className="badge bg-info" style={{ fontSize: '12px' }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {skills.length > 0 && (
                                    <div className="mb-3">
                                        <label className="text-muted small d-block mb-2">
                                            <i className="fas fa-tools me-1"></i> Compétences
                                        </label>
                                        <div className="d-flex flex-wrap gap-1">
                                            {skills.map((s, i) => (
                                                <span key={i} className="badge bg-secondary" style={{ fontSize: '12px' }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {languages.length > 0 && (
                                    <div>
                                        <label className="text-muted small d-block mb-2">
                                            <i className="fas fa-language me-1"></i> Langues
                                        </label>
                                        <div className="d-flex flex-wrap gap-1">
                                            {languages.map((l, i) => (
                                                <span key={i} className="badge bg-light text-dark" style={{ fontSize: '12px' }}>{l}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {(entry.description || entry.biography || entry.mission) && (
                        <div className="card mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0"><i className="fas fa-align-left text-info me-2"></i>Description</h5>
                            </div>
                            <div className="card-body">
                                {(entry.description || entry.biography) && (
                                    <div className="mb-3">
                                        <label className="text-muted small d-block mb-1">
                                            {isExpert ? 'Biographie' : 'Description'}
                                        </label>
                                        <div
                                            style={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}
                                            dangerouslySetInnerHTML={{ __html: entry.description || entry.biography }}
                                        />
                                    </div>
                                )}
                                {entry.description_en && (
                                    <div className="mb-3">
                                        <label className="text-muted small d-block mb-1">
                                            <span className="badge bg-light text-dark me-1">EN</span>
                                            Description (English)
                                        </label>
                                        <div
                                            style={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}
                                            dangerouslySetInnerHTML={{ __html: entry.description_en }}
                                        />
                                    </div>
                                )}
                                {entry.mission && (
                                    <div>
                                        <label className="text-muted small d-block mb-1">Mission</label>
                                        <p style={{ lineHeight: 1.7 }}>{entry.mission}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Photos / Gallery */}
                    {(entry.photo || entry.logo || entry.cv_path) && (
                        <div className="card mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0"><i className="fas fa-images text-warning me-2"></i>Médias</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    {(entry.photo || entry.logo) && (
                                        <div className="col-md-4">
                                            <label className="text-muted small d-block mb-1">
                                                {isExpert ? 'Photo' : 'Logo'}
                                            </label>
                                            <img
                                                src={`${API_BASE_URL.replace('/api', '')}${entry.photo || entry.logo}`}
                                                alt={getDisplayName()}
                                                className="img-fluid rounded"
                                                style={{ maxHeight: 200, objectFit: 'cover' }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}
                                    {entry.cv_path && (
                                        <div className="col-md-4">
                                            <label className="text-muted small d-block mb-1">CV</label>
                                            <a
                                                href={`${API_BASE_URL.replace('/api', '')}${entry.cv_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                <i className="fas fa-file-pdf me-1"></i> Télécharger le CV
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Map / GPS */}
                    {(entry.latitude && entry.longitude) && (
                        <div className="card mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0"><i className="fas fa-map-marker-alt text-danger me-2"></i>Localisation</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <span className="badge bg-light text-dark">
                                        <i className="fas fa-crosshairs me-1"></i>
                                        {entry.latitude}, {entry.longitude}
                                    </span>
                                    <a
                                        href={`https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary"
                                    >
                                        <i className="fas fa-external-link-alt me-1"></i> Voir sur Google Maps
                                    </a>
                                </div>
                                <div
                                    style={{
                                        background: '#f0f0f0',
                                        borderRadius: 8,
                                        height: 200,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <div className="text-center text-muted">
                                        <i className="fas fa-map fa-3x mb-2 opacity-50"></i>
                                        <p className="mb-0 small">Carte disponible via Google Maps</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Status & Meta */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h5 className="mb-0"><i className="fas fa-info-circle text-primary me-2"></i>Informations</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="text-muted small d-block">Statut</label>
                                <span className="badge d-inline-flex align-items-center gap-1"
                                      style={{ background: status.bg, color: status.color, fontSize: '13px', padding: '8px 14px', border: `1px solid ${status.color}30` }}>
                                    <i className={`fas ${status.icon}`}></i> {status.label}
                                </span>
                            </div>
                            <div className="mb-3">
                                <label className="text-muted small d-block">Type d'entrée</label>
                                <span className="fw-semibold">
                                    <i className={`fas ${isExpert ? 'fa-user-md' : 'fa-building'} me-1`}></i>
                                    {isExpert ? 'Expert / Professionnel' : 'Organisation'}
                                </span>
                            </div>
                            <div className="mb-3">
                                <label className="text-muted small d-block">ID</label>
                                <code>{entry.id}</code>
                            </div>
                            <div className="mb-3">
                                <label className="text-muted small d-block">Date d'inscription</label>
                                <span className="small">{formatDate(entry.submitted_at || entry.created_at)}</span>
                            </div>
                            {entry.validated_at && (
                                <div className="mb-3">
                                    <label className="text-muted small d-block">Date de validation</label>
                                    <span className="small">{formatDate(entry.validated_at)}</span>
                                </div>
                            )}
                            {entry.updated_at && (
                                <div className="mb-3">
                                    <label className="text-muted small d-block">Dernière modification</label>
                                    <span className="small">{formatDate(entry.updated_at)}</span>
                                </div>
                            )}
                            {entry.submitter_username && (
                                <div className="mb-3">
                                    <label className="text-muted small d-block">Soumis par</label>
                                    <span className="small">
                                        <i className="fas fa-user me-1"></i>
                                        {entry.submitter_username}
                                        {entry.submitter_email && <span className="text-muted ms-1">({entry.submitter_email})</span>}
                                    </span>
                                </div>
                            )}
                            {entry.validator_username && (
                                <div className="mb-3">
                                    <label className="text-muted small d-block">Validé par</label>
                                    <span className="small">
                                        <i className="fas fa-user-shield me-1"></i>
                                        {entry.validator_username}
                                    </span>
                                </div>
                            )}
                            {entry.rejection_reason && (
                                <div className="mb-0">
                                    <label className="text-muted small d-block">Motif de rejet</label>
                                    <div className="alert alert-danger py-2 mb-0" style={{ fontSize: '13px' }}>
                                        {entry.rejection_reason}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Options / Flags */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h5 className="mb-0"><i className="fas fa-sliders-h text-secondary me-2"></i>Options</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex flex-column gap-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="small">Actif</span>
                                    <span className={`badge ${entry.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                        {entry.is_active ? 'Oui' : 'Non'}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="small">Afficher email</span>
                                    <span className={`badge ${entry.show_email !== 0 ? 'bg-success' : 'bg-secondary'}`}>
                                        {entry.show_email !== 0 ? 'Oui' : 'Non'}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="small">Afficher téléphone</span>
                                    <span className={`badge ${entry.show_phone !== 0 ? 'bg-success' : 'bg-secondary'}`}>
                                        {entry.show_phone !== 0 ? 'Oui' : 'Non'}
                                    </span>
                                </div>
                                {entry.available_24_7 !== undefined && (
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="small">Disponible 24/7</span>
                                        <span className={`badge ${entry.available_24_7 ? 'bg-success' : 'bg-secondary'}`}>
                                            {entry.available_24_7 ? 'Oui' : 'Non'}
                                        </span>
                                    </div>
                                )}
                                {entry.license_number && (
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="small">N° Licence</span>
                                        <span className="badge bg-light text-dark">{entry.license_number}</span>
                                    </div>
                                )}
                                {isExpert && entry.years_experience && (
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="small">Années d'expérience</span>
                                        <span className="badge bg-light text-dark">{entry.years_experience} ans</span>
                                    </div>
                                )}
                                {!isExpert && entry.founded_year && (
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="small">Année de fondation</span>
                                        <span className="badge bg-light text-dark">{entry.founded_year}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Expertises (for experts) */}
                    {entry.expertises && entry.expertises.length > 0 && (
                        <div className="card mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0"><i className="fas fa-graduation-cap text-warning me-2"></i>Domaines d'expertise</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex flex-wrap gap-1">
                                    {entry.expertises.map((exp, i) => (
                                        <span key={i} className="badge" style={{ background: '#f39c1215', color: '#f39c12', fontSize: '12px', border: '1px solid #f39c1230' }}>
                                            {exp.name_fr || exp.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="card">
                        <div className="card-header bg-white">
                            <h5 className="mb-0"><i className="fas fa-bolt text-warning me-2"></i>Actions</h5>
                        </div>
                        <div className="card-body d-grid gap-2">
                            <Link to={`/annuaire/edit/${id}?type=${entryType}`} className="btn btn-outline-primary btn-sm">
                                <i className="fas fa-edit me-1"></i> Modifier cette fiche
                            </Link>
                            {entry.submission_status === 'pending' && (
                                <>
                                    <button className="btn btn-success btn-sm" onClick={handleApprove} disabled={actionLoading}>
                                        <i className="fas fa-check me-1"></i> Approuver
                                    </button>
                                    <button className="btn btn-warning btn-sm" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
                                        <i className="fas fa-times me-1"></i> Rejeter
                                    </button>
                                </>
                            )}
                            {entry.submission_status === 'approved' && (
                                <button
                                    className="btn btn-outline-warning btn-sm"
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-ban me-1"></i> Désactiver
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-times-circle text-warning me-2"></i>
                                    Rejeter cette entrée
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Motif du rejet *</label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Expliquez la raison du rejet..."
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Annuler</button>
                                <button
                                    className="btn btn-warning"
                                    onClick={handleReject}
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

            {/* Delete Confirm Modal */}
            {showDeleteConfirm && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    Confirmer la suppression
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowDeleteConfirm(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Êtes-vous sûr de vouloir supprimer <strong>{getDisplayName()}</strong> ?</p>
                                <p className="text-danger small mb-0">Cette action est irréversible.</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Annuler</button>
                                <button className="btn btn-danger" onClick={handleDelete} disabled={actionLoading}>
                                    {actionLoading ? (
                                        <><span className="spinner-border spinner-border-sm me-1"></span> Suppression...</>
                                    ) : (
                                        <><i className="fas fa-trash me-1"></i> Supprimer</>
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

export default AnnuaireView;
