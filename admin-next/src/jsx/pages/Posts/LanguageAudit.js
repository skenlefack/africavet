import React, { useState, useEffect } from 'react';
import { api, getToken } from '../../../services/api';

const LanguageAudit = () => {
    const [data, setData] = useState({ total_posts: 0, total_issues: 0, articles: [] });
    const [loading, setLoading] = useState(true);
    const [fixed, setFixed] = useState(new Set());
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchAudit(); }, []);

    const fetchAudit = async () => {
        setLoading(true);
        const token = getToken();
        const res = await api.get('/language-audit', token);
        if (res.success) setData(res);
        setLoading(false);
    };

    const handleFix = async (id, newLang) => {
        const token = getToken();
        const res = await api.put('/language-audit/bulk-fix', { fixes: [{ id, new_language: newLang }] }, token);
        if (res.success) {
            setFixed(prev => new Set([...prev, id]));
            setToast({ type: 'success', message: `Article #${id} corrigé` });
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
        setTimeout(() => setToast(null), 3000);
    };

    const handleBulkFix = async () => {
        const unfixed = data.articles.filter(a => !fixed.has(a.id) && a.confidence >= 60);
        if (unfixed.length === 0) return;
        if (!window.confirm(`Corriger automatiquement ${unfixed.length} articles (confiance ≥ 60%) ?`)) return;

        const token = getToken();
        const fixes = unfixed.map(a => ({ id: a.id, new_language: a.detected_language }));
        const res = await api.put('/language-audit/bulk-fix', { fixes }, token);
        if (res.success) {
            const newFixed = new Set(fixed);
            unfixed.forEach(a => newFixed.add(a.id));
            setFixed(newFixed);
            setToast({ type: 'success', message: `${res.updated} articles corrigés` });
        }
        setTimeout(() => setToast(null), 3000);
    };

    const handleExportCSV = () => {
        const csv = 'ID,Titre,Langue actuelle,Langue détectée,Confiance\n' +
            data.articles.map(a =>
                `${a.id},"${(a.title_fr || '').replace(/"/g, '""')}",${a.current_language},${a.detected_language},${a.confidence}%`
            ).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-langues-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const remaining = data.articles.filter(a => !fixed.has(a.id));

    return (
        <div className="row">
            {toast && (
                <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
                    <div className={`alert alert-${toast.type} alert-dismissible shadow`}>
                        {toast.message}
                        <button type="button" className="btn-close" onClick={() => setToast(null)} />
                    </div>
                </div>
            )}

            <div className="col-12 mb-4">
                <h4><i className="fas fa-language me-2" style={{ color: '#354e84' }}></i>Audit des langues FR/EN</h4>
            </div>

            {/* Summary cards */}
            <div className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm text-center">
                    <div className="card-body">
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#354e84' }}>{data.total_posts}</div>
                        <small className="text-muted">Articles total</small>
                    </div>
                </div>
            </div>
            <div className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm text-center">
                    <div className="card-body">
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#dc3545' }}>{data.total_issues}</div>
                        <small className="text-muted">Incohérences détectées</small>
                    </div>
                </div>
            </div>
            <div className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm text-center">
                    <div className="card-body">
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#28a745' }}>{fixed.size}</div>
                        <small className="text-muted">Corrigés</small>
                    </div>
                </div>
            </div>
            <div className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm text-center">
                    <div className="card-body">
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#ffc107' }}>{remaining.length}</div>
                        <small className="text-muted">Restants</small>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="col-12">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Articles avec incohérence de langue</h5>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-success" onClick={handleBulkFix} disabled={remaining.length === 0}>
                                <i className="fas fa-magic me-1"></i>Tout corriger (≥60%)
                            </button>
                            <button className="btn btn-sm btn-outline-primary" onClick={handleExportCSV}>
                                <i className="fas fa-file-csv me-1"></i>Exporter CSV
                            </button>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                        ) : remaining.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="fas fa-check-circle fa-3x mb-3 text-success"></i>
                                <p>Aucune incohérence restante !</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{ background: '#f8f9fa' }}>
                                        <tr>
                                            <th>ID</th>
                                            <th>Titre</th>
                                            <th className="text-center">Langue actuelle</th>
                                            <th className="text-center">Langue détectée</th>
                                            <th className="text-center">Confiance</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {remaining.map(article => (
                                            <tr key={article.id}>
                                                <td className="text-muted">#{article.id}</td>
                                                <td style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {article.title_fr}
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge ${article.current_language === 'fr' ? 'bg-primary' : 'bg-success'}`}>
                                                        {article.current_language.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge ${article.detected_language === 'fr' ? 'bg-primary' : 'bg-success'}`}>
                                                        {article.detected_language.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge ${article.confidence >= 80 ? 'bg-danger' : article.confidence >= 60 ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                        {article.confidence}%
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <button className="btn btn-sm btn-outline-success me-1"
                                                        onClick={() => handleFix(article.id, article.detected_language)}
                                                        title="Appliquer la correction">
                                                        <i className="fas fa-check"></i> Corriger
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => setFixed(prev => new Set([...prev, article.id]))}
                                                        title="Ignorer">
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LanguageAudit;
