import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const TYPE_CONFIG = {
    job: { label: 'Emploi', icon: 'fa-briefcase', color: '#1565c0', bg: '#e3f2fd' },
    tender: { label: 'Appel d\'offres', icon: 'fa-file-contract', color: '#6a1b9a', bg: '#f3e5f5' },
    market: { label: 'Marché', icon: 'fa-store', color: '#2e7d32', bg: '#e8f5e9' },
};

const OpportunitiesDashboard = () => {
    const token = getToken();
    const [stats, setStats] = useState(null);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchData = async () => {
        setLoading(true);
        const [statsRes, pendingRes] = await Promise.all([
            api.get('/opportunities/stats', token),
            api.get('/opportunities/admin/pending', token),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (pendingRes.success) setPending(Array.isArray(pendingRes.data) ? pendingRes.data.slice(0, 10) : []);
        setLoading(false);
    };

    const handleApprove = async (id) => {
        const res = await api.put(`/opportunities/${id}/approve`, {}, token);
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
    const byType = stats?.by_type || [];

    return (
        <>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: 700 }}>
                        <i className="fas fa-briefcase text-primary me-2"></i>
                        Opportunités
                    </h2>
                    <p className="text-muted mb-0">Emplois, appels d'offres et marchés</p>
                </div>
                <div>
                    <Link to="/opportunities/new" className="btn btn-primary btn-sm me-2">
                        <i className="fas fa-plus me-1"></i> Nouvelle
                    </Link>
                    <Link to="/opportunities/list" className="btn btn-outline-primary btn-sm">
                        <i className="fas fa-list me-1"></i> Liste
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
                                <i className="fas fa-briefcase text-white fa-lg"></i>
                            </div>
                            <h3 className="mb-1" style={{ fontWeight: 700 }}>{totals.total || 0}</h3>
                            <small className="text-muted">Total</small>
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
                            <h3 className="mb-1" style={{ fontWeight: 700, color: '#4caf50' }}>{totals.active || 0}</h3>
                            <small className="text-muted">Actives</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                style={{ width: 56, height: 56, background: '#e3f2fd' }}>
                                <i className="fas fa-users" style={{ color: '#1565c0', fontSize: 24 }}></i>
                            </div>
                            <h3 className="mb-1" style={{ fontWeight: 700, color: '#1565c0' }}>{totals.total_applications || 0}</h3>
                            <small className="text-muted">Candidatures</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                style={{ width: 56, height: 56, background: '#fff3e0' }}>
                                <i className="fas fa-star" style={{ color: '#ff9800', fontSize: 24 }}></i>
                            </div>
                            <h3 className="mb-1" style={{ fontWeight: 700, color: '#ff9800' }}>{totals.featured || 0}</h3>
                            <small className="text-muted">En vedette</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* By Type */}
            <div className="row mb-4">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                    const typeStats = byType.find(t => t.opportunity_type === key) || { total: 0, active: 0 };
                    return (
                        <div key={key} className="col-md-4 mb-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body d-flex align-items-center">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                        style={{ width: 48, height: 48, background: cfg.bg, flexShrink: 0 }}>
                                        <i className={`fas ${cfg.icon}`} style={{ color: cfg.color, fontSize: 20 }}></i>
                                    </div>
                                    <div>
                                        <h5 className="mb-0" style={{ fontWeight: 700 }}>{typeStats.total || 0}</h5>
                                        <small className="text-muted">{cfg.label}</small>
                                        <small className="d-block" style={{ color: cfg.color }}>{typeStats.active || 0} actives</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pending */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="fas fa-clock text-warning me-2"></i>
                        En attente de validation
                        {pending.length > 0 && <span className="badge bg-warning text-dark ms-2">{pending.length}</span>}
                    </h5>
                    <Link to="/opportunities/list?status=pending" className="btn btn-sm btn-outline-warning">Voir toutes</Link>
                </div>
                <div className="card-body p-0">
                    {pending.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <i className="fas fa-check-circle fa-2x mb-2 text-success"></i>
                            <p className="mb-0">Aucune opportunité en attente</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr style={{ background: '#f8f9fa' }}>
                                        <th>Titre</th>
                                        <th>Type</th>
                                        <th>Organisation</th>
                                        <th>Pays</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pending.map(opp => {
                                        const typeCfg = TYPE_CONFIG[opp.opportunity_type] || TYPE_CONFIG.job;
                                        return (
                                            <tr key={opp.id}>
                                                <td>
                                                    <Link to={`/opportunities/view/${opp.id}`} className="fw-bold text-dark text-decoration-none">
                                                        {opp.title_fr || opp.title_en}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ background: typeCfg.bg, color: typeCfg.color }}>
                                                        <i className={`fas ${typeCfg.icon} me-1`}></i>{typeCfg.label}
                                                    </span>
                                                </td>
                                                <td><small>{opp.organization_name || '—'}</small></td>
                                                <td><small>{opp.country || '—'}</small></td>
                                                <td><small>{formatDate(opp.created_at)}</small></td>
                                                <td>
                                                    <Link to={`/opportunities/view/${opp.id}`} className="btn btn-sm btn-outline-primary me-1" title="Voir">
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                    <button className="btn btn-sm btn-outline-success" title="Approuver"
                                                        onClick={() => handleApprove(opp.id)}>
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
        </>
    );
};

export default OpportunitiesDashboard;
