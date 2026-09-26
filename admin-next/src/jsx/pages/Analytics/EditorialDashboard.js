import React, { useState, useEffect } from 'react';
import { api, getToken } from '../../../services/api';

const KPI_META = {
    countries_covered: { label: 'Pays UA couverts', icon: 'fa-globe-africa', direction: 'up' },
    countries_without_article: { label: 'Pays sans article', icon: 'fa-exclamation-triangle', direction: 'down' },
    first_author_share: { label: 'Part du 1er auteur', icon: 'fa-user', direction: 'down', pct: true },
    active_authors_90d: { label: 'Auteurs actifs (90j)', icon: 'fa-users', direction: 'up' },
    country_field_filled: { label: 'Champ pays renseigné', icon: 'fa-map-marker-alt', direction: 'up', pct: true },
    meta_title_filled: { label: 'Méta-titre renseigné', icon: 'fa-heading', direction: 'up', pct: true },
    meta_description_filled: { label: 'Méta-description', icon: 'fa-align-left', direction: 'up', pct: true },
    image_credit_filled: { label: 'Crédit image', icon: 'fa-camera', direction: 'up', pct: true },
    sources_filled: { label: 'Sources renseignées', icon: 'fa-link', direction: 'up', pct: true },
    review_traced: { label: 'Relecture tracée', icon: 'fa-check-double', direction: 'up', pct: true },
    articles_500_words: { label: 'Articles ≥ 500 mots', icon: 'fa-file-alt', direction: 'up', pct: true },
    titles_45_80_chars: { label: 'Titres 45-80 car.', icon: 'fa-text-width', direction: 'up', pct: true },
    total_articles: { label: 'Total articles', icon: 'fa-newspaper', direction: 'up' },
    total_views: { label: 'Vues cumulées', icon: 'fa-eye', direction: 'up' },
    avg_views_per_article: { label: 'Vues/article', icon: 'fa-chart-line', direction: 'up' },
    articles_this_month: { label: 'Articles ce mois', icon: 'fa-calendar-alt', direction: 'up' },
    articles_last_30_days: { label: 'Articles (30j)', icon: 'fa-calendar-check', direction: 'up' },
};

const formatValue = (kpi, meta) => {
    if (meta?.pct) return `${Math.round(kpi.value * 100)}%`;
    if (typeof kpi.value === 'number' && kpi.value >= 1000) return kpi.value.toLocaleString('fr-FR');
    return kpi.value;
};

const getGapColor = (kpi, meta) => {
    if (!kpi.target_j90) return '#6c757d';
    const ratio = meta?.direction === 'down'
        ? kpi.target_j90 === 0 ? (kpi.value === 0 ? 1 : 0) : kpi.target_j90 / Math.max(kpi.value, 0.001)
        : kpi.value / Math.max(kpi.target_j90, 0.001);
    if (ratio >= 0.9) return '#28a745';
    if (ratio >= 0.5) return '#ffc107';
    return '#dc3545';
};

const BarChart = ({ data, labelKey, valueKey, maxVal, color = '#354e84' }) => (
    <div>
        {data.map((item, i) => {
            const pct = maxVal > 0 ? (item[valueKey] / maxVal) * 100 : 0;
            return (
                <div key={i} className="d-flex align-items-center mb-2" style={{ fontSize: '0.85rem' }}>
                    <div style={{ width: 120, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item[labelKey]}
                    </div>
                    <div className="flex-grow-1 mx-2">
                        <div style={{ background: '#e9ecef', borderRadius: 4, height: 18, position: 'relative' }}>
                            <div style={{ width: `${Math.max(pct, 2)}%`, background: color, borderRadius: 4, height: '100%', transition: 'width 0.5s' }} />
                        </div>
                    </div>
                    <div style={{ width: 50, textAlign: 'right', fontWeight: 600 }}>{item[valueKey]}</div>
                </div>
            );
        })}
    </div>
);

const EditorialDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchKPIs(); }, []);

    const fetchKPIs = async () => {
        setLoading(true);
        const token = getToken();
        const res = await api.get('/editorial-analytics/kpi', token);
        if (res.success) setData(res.data);
        setLoading(false);
    };

    const handleExport = () => {
        const token = getToken();
        window.open(`${api.baseURL || ''}/editorial-analytics/export?token=${token}`, '_blank');
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
    if (!data) return <div className="text-center py-5 text-muted">Impossible de charger les KPIs</div>;

    const { kpis, top_countries, top_authors, monthly_production, regions_distribution } = data;

    const summaryCards = [
        { key: 'total_articles', icon: 'fa-newspaper', color: '#354e84', label: 'Articles publiés' },
        { key: 'countries_covered', icon: 'fa-globe-africa', color: '#7ac142', label: 'Pays couverts', suffix: ' / 55' },
        { key: 'active_authors_90d', icon: 'fa-users', color: '#FF9800', label: 'Auteurs actifs (90j)' },
        { key: 'articles_last_30_days', icon: 'fa-calendar-check', color: '#2196F3', label: 'Articles (30 jours)' },
    ];

    const maxCountry = top_countries.length > 0 ? top_countries[0].count : 1;
    const maxMonth = monthly_production.length > 0 ? Math.max(...monthly_production.map(m => m.articles)) : 1;
    const maxRegion = regions_distribution.length > 0 ? regions_distribution[0].count : 1;

    return (
        <div className="row">
            <div className="col-12 d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">
                    <i className="fas fa-chart-bar me-2" style={{ color: '#354e84' }}></i>
                    KPI Éditorial
                </h4>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={handleExport}>
                        <i className="fas fa-file-csv me-1"></i>Exporter CSV
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
                        <i className="fas fa-print me-1"></i>Imprimer
                    </button>
                    <small className="text-muted align-self-center ms-2">
                        Calculé le {new Date(data.computed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </small>
                </div>
            </div>

            {/* Summary Cards */}
            {summaryCards.map(card => {
                const kpi = kpis[card.key];
                return (
                    <div key={card.key} className="col-md-3 mb-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body d-flex align-items-center gap-3">
                                <div style={{ width: 50, height: 50, borderRadius: 12, background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className={`fas ${card.icon}`} style={{ fontSize: 22, color: card.color }}></i>
                                </div>
                                <div>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>
                                        {kpi?.value?.toLocaleString('fr-FR')}{card.suffix || ''}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>{card.label}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* KPI Table */}
            <div className="col-12 mb-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0">
                        <h5 className="mb-0"><i className="fas fa-list-check me-2 text-primary"></i>Tableau des KPI</h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead style={{ background: '#f8f9fa' }}>
                                    <tr>
                                        <th>KPI</th>
                                        <th className="text-center">Valeur actuelle</th>
                                        <th className="text-center">Cible J+90</th>
                                        <th className="text-center">Écart</th>
                                        <th className="text-center">Unité</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(kpis).map(([key, kpi]) => {
                                        const meta = KPI_META[key];
                                        if (!meta) return null;
                                        const gapColor = getGapColor(kpi, meta);
                                        const gap = kpi.target_j90 !== undefined ? kpi.value - kpi.target_j90 : null;
                                        return (
                                            <tr key={key}>
                                                <td>
                                                    <i className={`fas ${meta.icon} me-2`} style={{ color: '#999', width: 18 }}></i>
                                                    {meta.label}
                                                </td>
                                                <td className="text-center fw-bold">{formatValue(kpi, meta)}</td>
                                                <td className="text-center text-muted">
                                                    {kpi.target_j90 !== undefined ? (meta.pct ? `${Math.round(kpi.target_j90 * 100)}%` : kpi.target_j90) : '—'}
                                                </td>
                                                <td className="text-center">
                                                    {gap !== null ? (
                                                        <span className="badge" style={{ background: `${gapColor}20`, color: gapColor, fontWeight: 600 }}>
                                                            {meta.direction === 'down'
                                                                ? (gap <= 0 ? <><i className="fas fa-check"></i> OK</> : <><i className="fas fa-arrow-up"></i> +{meta.pct ? Math.round(gap * 100) + '%' : gap}</>)
                                                                : (gap >= 0 ? <><i className="fas fa-check"></i> OK</> : <><i className="fas fa-arrow-down"></i> {meta.pct ? Math.round(gap * 100) + '%' : gap}</>)
                                                            }
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="text-center text-muted" style={{ fontSize: '0.85rem' }}>{kpi.unit}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="col-md-6 mb-4">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white border-0">
                        <h5 className="mb-0"><i className="fas fa-flag me-2 text-primary"></i>Top 15 pays</h5>
                    </div>
                    <div className="card-body">
                        <BarChart data={top_countries} labelKey="country" valueKey="count" maxVal={maxCountry} color="#7ac142" />
                    </div>
                </div>
            </div>

            <div className="col-md-6 mb-4">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white border-0">
                        <h5 className="mb-0"><i className="fas fa-user-edit me-2 text-primary"></i>Auteurs</h5>
                    </div>
                    <div className="card-body">
                        {top_authors.map((author, i) => (
                            <div key={i} className="d-flex align-items-center mb-2">
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7ac142, #354e84)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                    {i + 1}
                                </div>
                                <div className="ms-2 flex-grow-1">
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{author.name}</div>
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ flex: 1, background: '#e9ecef', borderRadius: 4, height: 6 }}>
                                            <div style={{ width: `${Math.round(author.share * 100)}%`, background: '#354e84', borderRadius: 4, height: '100%' }} />
                                        </div>
                                        <small className="text-muted">{author.articles} ({Math.round(author.share * 100)}%)</small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly production */}
            <div className="col-md-8 mb-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0">
                        <h5 className="mb-0"><i className="fas fa-chart-bar me-2 text-primary"></i>Production mensuelle (12 mois)</h5>
                    </div>
                    <div className="card-body">
                        <div className="d-flex align-items-end gap-1" style={{ height: 200 }}>
                            {monthly_production.map((m, i) => {
                                const h = maxMonth > 0 ? (m.articles / maxMonth) * 180 : 0;
                                return (
                                    <div key={i} className="text-center flex-grow-1" title={`${m.month}: ${m.articles} articles, ${m.views} vues`}>
                                        <div style={{ height: Math.max(h, 4), background: 'linear-gradient(180deg, #7ac142, #354e84)', borderRadius: '4px 4px 0 0', transition: 'height 0.5s', cursor: 'pointer' }} />
                                        <div style={{ fontSize: '0.65rem', color: '#999', marginTop: 4 }}>{m.month.slice(5)}</div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>{m.articles}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Regions */}
            <div className="col-md-4 mb-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0">
                        <h5 className="mb-0"><i className="fas fa-map me-2 text-primary"></i>Régions</h5>
                    </div>
                    <div className="card-body">
                        <BarChart data={regions_distribution} labelKey="region" valueKey="count" maxVal={maxRegion} color="#354e84" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorialDashboard;
