import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

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

const AlertsDashboard = () => {
    const token = getToken();
    const [stats, setStats] = useState(null);
    const [pendingAlerts, setPendingAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchData = async () => {
        setLoading(true);
        const [statsRes, pendingRes] = await Promise.all([
            api.get('/vet-alerts/stats/summary', token),
            api.get('/vet-alerts/admin/pending', token),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (pendingRes.success) setPendingAlerts(Array.isArray(pendingRes.data) ? pendingRes.data.slice(0, 10) : []);
        setLoading(false);
    };

    const handleApprove = async (id) => {
        const res = await api.put(`/vet-alerts/${id}/validate`, { validation_notes: 'Approuvée depuis le tableau de bord' }, token);
        if (res.success) fetchData();
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
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

    const totals = stats?.totals || {};
    const byType = stats?.byType || {};
    const byRegion = stats?.byRegion || [];
    const recent = stats?.recent || [];

    return (
        <>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: 700 }}>
                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                        Alertes Vétérinaires
                    </h2>
                    <p className="text-muted mb-0">Surveillance sanitaire et modération des alertes</p>
                </div>
                <div>
                    <Link to="/alerts/list" className="btn btn-outline-primary btn-sm me-2">
                        <i className="fas fa-list me-1"></i> Toutes les alertes
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}>
                                <i className="fas fa-bell text-white fa-lg"></i>
                            </div>
                            <h3 className="mb-1" style={{ fontWeight: 700 }}>{totals.total || 0}</h3>
                            <small className="text-muted">Total alertes</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                style={{ width: 56, height: 56, background: '#fff3e0' }}>
                                <i className="fas fa-clock" style={{ color: '#ff9800', fontSize: 24 }}></i>
                            </div>
                            <h3 className="mb-1" style={{ fontWeight: 700, color: '#ff9800' }}>{totals.pending || 0}</h3>
                            <small className="text-muted">En attente</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                style={{ width: 56, height: 56, background: '#ffebee' }}>
                                <i className="fas fa-exclamation-circle" style={{ color: '#d32f2f', fontSize: 24 }}></i>
                            </div>
                            <h3 className="mb-1" style={{ fontWeight: 700, color: '#d32f2f' }}>{totals.critical || 0}</h3>
                            <small className="text-muted">Critiques</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                style={{ width: 56, height: 56, background: '#e8f5e9' }}>
                                <i className="fas fa-check-circle" style={{ color: '#4caf50', fontSize: 24 }}></i>
                            </div>
                            <h3 className="mb-1" style={{ fontWeight: 700, color: '#4caf50' }}>{totals.approved || 0}</h3>
                            <small className="text-muted">Approuvées</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Priority & Impact Row */}
            <div className="row mb-4">
                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><i className="fas fa-signal text-primary me-2"></i>Par priorité</h5>
                        </div>
                        <div className="card-body">
                            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                                <div key={key} className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <span className="badge me-2" style={{ background: cfg.bg, color: cfg.color, minWidth: 30 }}>
                                            <i className={`fas ${cfg.icon}`}></i>
                                        </span>
                                        <span>{cfg.label}</span>
                                    </div>
                                    <span className="badge rounded-pill" style={{ background: cfg.bg, color: cfg.color, fontSize: 14 }}>
                                        {key === 'critical' ? totals.critical || 0 : key === 'high' ? totals.high || 0 : '—'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h5 className="mb-0"><i className="fas fa-tag text-primary me-2"></i>Par type</h5>
                        </div>
                        <div className="card-body">
                            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                                <div key={key} className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <i className={`fas ${cfg.icon} me-2`} style={{ color: cfg.color, width: 20 }}></i>
                                        <span>{cfg.label}</span>
                                    </div>
                                    <span className="badge bg-light text-dark">{byType[key] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h5 className="mb-0"><i className="fas fa-skull-crossbones text-danger me-2"></i>Impact</h5>
                        </div>
                        <div className="card-body">
                            <div className="text-center mb-4">
                                <h2 className="mb-0" style={{ fontWeight: 700, color: '#e65100' }}>{totals.total_affected || 0}</h2>
                                <small className="text-muted">Animaux affectés</small>
                            </div>
                            <div className="text-center mb-3">
                                <h2 className="mb-0" style={{ fontWeight: 700, color: '#d32f2f' }}>{totals.total_deaths || 0}</h2>
                                <small className="text-muted">Décès signalés</small>
                            </div>
                            {byRegion.length > 0 && (
                                <div className="mt-3 pt-3 border-top">
                                    <small className="text-muted d-block mb-2">Top régions :</small>
                                    {byRegion.slice(0, 3).map((r, i) => (
                                        <div key={i} className="d-flex justify-content-between mb-1">
                                            <small>{r.region || r.country}</small>
                                            <small className="fw-bold">{r.count}</small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Alerts */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="fas fa-clock text-warning me-2"></i>
                        Alertes en attente de modération
                        {pendingAlerts.length > 0 && (
                            <span className="badge bg-warning text-dark ms-2">{pendingAlerts.length}</span>
                        )}
                    </h5>
                    <Link to="/alerts/list?status=pending" className="btn btn-sm btn-outline-warning">
                        Voir toutes
                    </Link>
                </div>
                <div className="card-body p-0">
                    {pendingAlerts.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <i className="fas fa-check-circle fa-2x mb-2 text-success"></i>
                            <p className="mb-0">Aucune alerte en attente</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr style={{ background: '#f8f9fa' }}>
                                        <th>Titre</th>
                                        <th>Type</th>
                                        <th>Priorité</th>
                                        <th>Localisation</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingAlerts.map(alert => {
                                        const type = TYPE_CONFIG[alert.alert_type] || TYPE_CONFIG.other;
                                        const prio = PRIORITY_CONFIG[alert.priority] || PRIORITY_CONFIG.medium;
                                        return (
                                            <tr key={alert.id}>
                                                <td>
                                                    <Link to={`/alerts/view/${alert.id}`} className="fw-bold text-dark text-decoration-none">
                                                        {alert.title_fr || alert.title_en}
                                                    </Link>
                                                    {alert.code && <br />}
                                                    {alert.code && <small className="text-muted">{alert.code}</small>}
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
                                                <td><small>{[alert.city, alert.region, alert.country].filter(Boolean).join(', ')}</small></td>
                                                <td><small>{formatDate(alert.created_at)}</small></td>
                                                <td>
                                                    <Link to={`/alerts/view/${alert.id}`} className="btn btn-sm btn-outline-primary me-1" title="Voir">
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                    <button className="btn btn-sm btn-outline-success" title="Approuver" onClick={() => handleApprove(alert.id)}>
                                                        <i className="fas fa-check"></i>
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
            </div>

            {/* Recent Alerts */}
            {recent.length > 0 && (
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0"><i className="fas fa-history text-primary me-2"></i>Alertes récentes</h5>
                        <Link to="/alerts/list" className="btn btn-sm btn-outline-primary">Voir toutes</Link>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr style={{ background: '#f8f9fa' }}>
                                        <th>Code</th>
                                        <th>Titre</th>
                                        <th>Type</th>
                                        <th>Priorité</th>
                                        <th>Statut</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.slice(0, 8).map(alert => {
                                        const type = TYPE_CONFIG[alert.alert_type] || TYPE_CONFIG.other;
                                        const prio = PRIORITY_CONFIG[alert.priority] || PRIORITY_CONFIG.medium;
                                        const status = STATUS_CONFIG[alert.status] || STATUS_CONFIG.pending;
                                        return (
                                            <tr key={alert.id}>
                                                <td><small className="text-muted">{alert.code}</small></td>
                                                <td>
                                                    <Link to={`/alerts/view/${alert.id}`} className="text-dark text-decoration-none">
                                                        {alert.title_fr || alert.title_en}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ background: type.color + '15', color: type.color }}>
                                                        <i className={`fas ${type.icon} me-1`}></i>{type.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ background: prio.bg, color: prio.color }}>
                                                        {prio.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ background: status.bg, color: status.color }}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td><small>{formatDate(alert.created_at)}</small></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AlertsDashboard;
