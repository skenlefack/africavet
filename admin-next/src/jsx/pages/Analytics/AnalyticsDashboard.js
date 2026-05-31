import React, { useState, useEffect, useCallback } from 'react';
import { api, getToken } from '../../../services/api';
import WorldMap from 'react-svg-worldmap';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Country code to flag emoji
const countryFlag = (code) => {
    if (!code || code.length !== 2) return '';
    const offset = 127397;
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + offset));
};

// Colors palette
const colors = {
    primary: '#7ac142',
    secondary: '#354e84',
    warning: '#ffc107',
    info: '#17a2b8',
    success: '#28a745',
    danger: '#dc3545',
    orange: '#fd7e14',
    purple: '#6f42c1',
    teal: '#20c997',
    pink: '#e83e8c',
};

const chartColors = [
    colors.primary, colors.secondary, colors.info, colors.warning,
    colors.success, colors.danger, colors.orange, colors.purple,
    colors.teal, colors.pink
];

const AnalyticsDashboard = () => {
    const token = getToken();
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');
    const [granularity, setGranularity] = useState('day');

    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState([]);
    const [countries, setCountries] = useState({ countries: [], continents: [], total: 0 });
    const [browsers, setBrowsers] = useState({ browsers: [], devices: [], os: [] });
    const [pages, setPages] = useState([]);
    const [hourly, setHourly] = useState([]);
    const [comparison, setComparison] = useState({ current: [], previous: [] });

    // Country table pagination
    const [countryPage, setCountryPage] = useState(1);
    const [countrySort, setCountrySort] = useState({ field: 'visits', dir: 'desc' });
    const countriesPerPage = 10;

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const [ovRes, trRes, coRes, brRes, pgRes, hrRes, cmRes] = await Promise.all([
            api.get(`/analytics/overview?period=${period}`, token),
            api.get(`/analytics/trends?period=${period}&granularity=${granularity}`, token),
            api.get(`/analytics/countries?period=${period}&limit=50`, token),
            api.get(`/analytics/browsers?period=${period}`, token),
            api.get(`/analytics/pages?period=${period}&limit=15`, token),
            api.get(`/analytics/hourly?period=${period}`, token),
            api.get(`/analytics/comparison?period=${period}`, token),
        ]);

        if (ovRes.success) setOverview(ovRes.data);
        if (trRes.success) setTrends(trRes.data);
        if (coRes.success) setCountries(coRes.data);
        if (brRes.success) setBrowsers(brRes.data);
        if (pgRes.success) setPages(pgRes.data);
        if (hrRes.success) setHourly(hrRes.data);
        if (cmRes.success) setComparison(cmRes.data);
        setLoading(false);
    }, [period, granularity, token]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Format number
    const fmtNum = (n) => {
        if (n == null) return '0';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toLocaleString('fr-FR');
    };

    // Export CSV
    const exportCSV = async (type) => {
        const res = await api.get(`/analytics/export?period=${period}&type=${type}`, token);
        if (!res.success || !res.data?.length) return;
        const headers = Object.keys(res.data[0]);
        const csv = [
            headers.join(','),
            ...res.data.map(row => headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${type}_${period}j_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Chart defaults
    const baseChartOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 15 } } },
        scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
    };

    // =============== CHART DATA ===============

    // Trend line chart
    const trendData = trends.length ? {
        labels: trends.map(d => {
            if (granularity === 'day') {
                const date = new Date(d.date_label);
                return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            }
            return d.date_label;
        }),
        datasets: [
            {
                label: 'Visites',
                data: trends.map(d => d.visits),
                borderColor: colors.primary,
                backgroundColor: `${colors.primary}20`,
                fill: true, tension: 0.4, pointRadius: 2
            },
            {
                label: 'Visiteurs uniques',
                data: trends.map(d => d.unique_visitors),
                borderColor: colors.secondary,
                backgroundColor: `${colors.secondary}20`,
                fill: true, tension: 0.4, pointRadius: 2
            }
        ]
    } : null;

    // Browser doughnut
    const browserData = browsers.browsers?.length ? {
        labels: browsers.browsers.map(b => b.browser),
        datasets: [{ data: browsers.browsers.map(b => b.visits), backgroundColor: chartColors }]
    } : null;

    // Device doughnut
    const deviceLabels = { desktop: 'Desktop', mobile: 'Mobile', tablet: 'Tablette' };
    const deviceData = browsers.devices?.length ? {
        labels: browsers.devices.map(d => deviceLabels[d.device_type] || d.device_type),
        datasets: [{ data: browsers.devices.map(d => d.visits), backgroundColor: [colors.primary, colors.secondary, colors.warning] }]
    } : null;

    // OS doughnut
    const osData = browsers.os?.length ? {
        labels: browsers.os.map(o => o.os),
        datasets: [{ data: browsers.os.map(o => o.visits), backgroundColor: chartColors }]
    } : null;

    // Top 10 countries bar
    const top10Countries = countries.countries?.slice(0, 10) || [];
    const countryBarData = top10Countries.length ? {
        labels: top10Countries.map(c => `${countryFlag(c.country_code)} ${c.country_name || c.country_code}`),
        datasets: [{
            label: 'Visites',
            data: top10Countries.map(c => c.visits),
            backgroundColor: chartColors
        }]
    } : null;

    // Continent bar
    const continentData = countries.continents?.length ? {
        labels: countries.continents.map(c => c.continent),
        datasets: [{
            label: 'Visites',
            data: countries.continents.map(c => c.visits),
            backgroundColor: [colors.primary, colors.secondary, colors.info, colors.warning, colors.orange, colors.purple]
        }]
    } : null;

    // Pages horizontal bar
    const pagesData = pages.length ? {
        labels: pages.map(p => (p.page_title || p.page_url).substring(0, 50)),
        datasets: [{
            label: 'Visites',
            data: pages.map(p => p.visits),
            backgroundColor: `${colors.primary}cc`,
            borderColor: colors.primary,
            borderWidth: 1
        }]
    } : null;

    // Comparison overlay
    const compData = (comparison.current?.length || comparison.previous?.length) ? {
        labels: Array.from({ length: Math.max(comparison.current?.length || 0, comparison.previous?.length || 0) }, (_, i) => `J${i + 1}`),
        datasets: [
            {
                label: 'Periode actuelle',
                data: (comparison.current || []).map(d => d.visits),
                borderColor: colors.primary,
                backgroundColor: `${colors.primary}15`,
                fill: true, tension: 0.4, pointRadius: 1
            },
            {
                label: 'Periode precedente',
                data: (comparison.previous || []).map(d => d.visits),
                borderColor: colors.secondary,
                backgroundColor: `${colors.secondary}15`,
                fill: true, tension: 0.4, borderDash: [5, 5], pointRadius: 1
            }
        ]
    } : null;

    // Hourly bar
    const hourlyData = hourly.length ? {
        labels: hourly.map(h => `${h.hour}h`),
        datasets: [{
            label: 'Visites',
            data: hourly.map(h => h.visits),
            backgroundColor: hourly.map((_, i) => {
                // Gradient effect by hour
                const intensity = 0.4 + (hourly[i]?.visits / (Math.max(...hourly.map(h => h.visits)) || 1)) * 0.6;
                return `rgba(122, 193, 66, ${intensity})`;
            }),
            borderColor: colors.primary,
            borderWidth: 1
        }]
    } : null;

    // WorldMap data
    const worldMapData = (countries.countries || []).map(c => ({
        country: (c.country_code || '').toLowerCase(),
        value: c.visits
    })).filter(c => c.country);

    // Country table sort
    const sortedCountries = [...(countries.countries || [])].sort((a, b) => {
        const dir = countrySort.dir === 'asc' ? 1 : -1;
        if (countrySort.field === 'country_name') return (a.country_name || '').localeCompare(b.country_name || '') * dir;
        return ((a[countrySort.field] || 0) - (b[countrySort.field] || 0)) * dir;
    });
    const totalCountryPages = Math.ceil(sortedCountries.length / countriesPerPage);
    const pagedCountries = sortedCountries.slice((countryPage - 1) * countriesPerPage, countryPage * countriesPerPage);

    const toggleSort = (field) => {
        setCountrySort(prev => ({
            field,
            dir: prev.field === field && prev.dir === 'desc' ? 'asc' : 'desc'
        }));
        setCountryPage(1);
    };

    const doughnutOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 10, font: { size: 11 } } },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const pct = total ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                        return `${ctx.label}: ${fmtNum(ctx.raw)} (${pct}%)`;
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">Chargement des statistiques...</p>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>
                        <i className="fas fa-chart-line me-2" style={{ color: colors.primary }}></i>
                        Analytiques de Visites
                    </h2>
                    <p className="text-muted mb-0">Statistiques de trafic et audience du site</p>
                </div>
                <div className="d-flex gap-2 mt-2 mt-md-0">
                    <select
                        className="form-select"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="7">7 derniers jours</option>
                        <option value="30">30 derniers jours</option>
                        <option value="90">90 derniers jours</option>
                        <option value="365">12 derniers mois</option>
                    </select>
                    <div className="dropdown">
                        <button
                            className="btn btn-outline-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                        >
                            <i className="fas fa-download me-1"></i> Exporter
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item" onClick={() => exportCSV('countries')}>
                                <i className="fas fa-globe me-2"></i>Pays (CSV)
                            </button></li>
                            <li><button className="dropdown-item" onClick={() => exportCSV('pages')}>
                                <i className="fas fa-file me-2"></i>Pages (CSV)
                            </button></li>
                            <li><button className="dropdown-item" onClick={() => exportCSV('daily')}>
                                <i className="fas fa-calendar me-2"></i>Quotidien (CSV)
                            </button></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Row 1: KPI Cards */}
            <div className="row mb-4">
                {[
                    { label: 'Visites Totales', value: overview?.total_visits, change: overview?.changes?.visits, icon: 'fas fa-eye', color: colors.primary },
                    { label: 'Visiteurs Uniques', value: overview?.unique_visitors, change: overview?.changes?.visitors, icon: 'fas fa-users', color: colors.secondary },
                    { label: 'Pages Vues', value: overview?.page_views, change: overview?.changes?.page_views, icon: 'fas fa-file-alt', color: colors.info },
                    { label: 'Taux de Rebond', value: overview?.bounce_rate, change: overview?.changes?.bounce_rate, icon: 'fas fa-sign-out-alt', color: colors.warning, suffix: '%', invertChange: true },
                ].map((kpi, i) => (
                    <div className="col-xl-3 col-sm-6 mb-3" key={i}>
                        <div className="card h-100" style={{ borderLeft: `4px solid ${kpi.color}` }}>
                            <div className="card-body py-3">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>{kpi.label}</p>
                                        <h3 className="mb-0" style={{ fontWeight: '700' }}>
                                            {kpi.suffix ? `${kpi.value ?? 0}${kpi.suffix}` : fmtNum(kpi.value)}
                                        </h3>
                                    </div>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: '50%',
                                        background: `${kpi.color}15`, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <i className={kpi.icon} style={{ fontSize: '1.2rem', color: kpi.color }}></i>
                                    </div>
                                </div>
                                {kpi.change != null && (
                                    <div className="mt-2">
                                        <span className={`badge ${(kpi.invertChange ? kpi.change <= 0 : kpi.change >= 0) ? 'bg-success' : 'bg-danger'}`}
                                            style={{ fontSize: '0.75rem' }}>
                                            <i className={`fas fa-arrow-${kpi.change >= 0 ? 'up' : 'down'} me-1`}></i>
                                            {Math.abs(kpi.change)}%
                                        </span>
                                        <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>vs periode prec.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Row 2: Trend Line Chart */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0"><i className="fas fa-chart-area me-2" style={{ color: colors.primary }}></i>Tendance des visites</h5>
                    <div className="btn-group btn-group-sm">
                        {[
                            { val: 'day', label: 'Jour' },
                            { val: 'week', label: 'Semaine' },
                            { val: 'month', label: 'Mois' }
                        ].map(g => (
                            <button
                                key={g.val}
                                className={`btn ${granularity === g.val ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setGranularity(g.val)}
                                style={granularity === g.val ? { background: colors.primary, borderColor: colors.primary } : {}}
                            >{g.label}</button>
                        ))}
                    </div>
                </div>
                <div className="card-body">
                    <div style={{ height: 350 }}>
                        {trendData ? <Line data={trendData} options={baseChartOpts} /> : <p className="text-muted text-center mt-5">Aucune donnee</p>}
                    </div>
                </div>
            </div>

            {/* Row 3: World Map + Top Countries */}
            <div className="row mb-4">
                <div className="col-xl-7 mb-4 mb-xl-0">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="mb-0"><i className="fas fa-globe-africa me-2" style={{ color: colors.primary }}></i>Carte du monde</h5>
                        </div>
                        <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: 350 }}>
                            {worldMapData.length > 0 ? (
                                <WorldMap
                                    color={colors.primary}
                                    valueSuffix="visites"
                                    size="responsive"
                                    data={worldMapData}
                                    styleFunction={({ countryValue, minValue, maxValue, color }) => ({
                                        fill: countryValue
                                            ? color
                                            : '#f0f0f0',
                                        fillOpacity: countryValue
                                            ? 0.2 + 0.8 * ((countryValue - minValue) / ((maxValue - minValue) || 1))
                                            : 0.3,
                                        stroke: '#ddd',
                                        strokeWidth: 0.5,
                                        cursor: countryValue ? 'pointer' : 'default',
                                    })}
                                    tooltipTextFunction={(countryName, isoCode, value) =>
                                        `${countryFlag(isoCode)} ${countryName}: ${fmtNum(value)} visites`
                                    }
                                />
                            ) : (
                                <p className="text-muted">Aucune donnee geographique</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-xl-5">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="mb-0"><i className="fas fa-trophy me-2" style={{ color: colors.warning }}></i>Top Pays</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-sm table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th className="ps-3">#</th>
                                            <th>Pays</th>
                                            <th className="text-end">Visites</th>
                                            <th className="text-end pe-3">%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(countries.countries || []).slice(0, 10).map((c, i) => (
                                            <tr key={c.country_code}>
                                                <td className="ps-3 text-muted">{i + 1}</td>
                                                <td>
                                                    <span className="me-2" style={{ fontSize: '1.1rem' }}>{countryFlag(c.country_code)}</span>
                                                    {c.country_name || c.country_code}
                                                </td>
                                                <td className="text-end fw-bold">{fmtNum(c.visits)}</td>
                                                <td className="text-end pe-3">
                                                    <span className="badge" style={{ background: `${colors.primary}20`, color: colors.primary }}>
                                                        {c.percentage}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!countries.countries || countries.countries.length === 0) && (
                                            <tr><td colSpan="4" className="text-center text-muted py-3">Aucune donnee</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 4: Browser / Device / OS Doughnuts */}
            <div className="row mb-4">
                {[
                    { title: 'Navigateurs', icon: 'fas fa-globe', data: browserData },
                    { title: 'Appareils', icon: 'fas fa-mobile-alt', data: deviceData },
                    { title: 'Systemes d\'exploitation', icon: 'fas fa-desktop', data: osData },
                ].map((chart, i) => (
                    <div className="col-xl-4 col-md-6 mb-4 mb-xl-0" key={i}>
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="mb-0"><i className={`${chart.icon} me-2`} style={{ color: colors.secondary }}></i>{chart.title}</h5>
                            </div>
                            <div className="card-body">
                                <div style={{ height: 280 }}>
                                    {chart.data ? <Doughnut data={chart.data} options={doughnutOpts} /> : <p className="text-muted text-center mt-5">Aucune donnee</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Row 5: Top Countries Bar + Continent Bar */}
            <div className="row mb-4">
                <div className="col-xl-7 mb-4 mb-xl-0">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="mb-0"><i className="fas fa-chart-bar me-2" style={{ color: colors.primary }}></i>Top 10 Pays</h5>
                        </div>
                        <div className="card-body">
                            <div style={{ height: 350 }}>
                                {countryBarData ? <Bar data={countryBarData} options={{
                                    ...baseChartOpts,
                                    plugins: { ...baseChartOpts.plugins, legend: { display: false } },
                                    indexAxis: 'x'
                                }} /> : <p className="text-muted text-center mt-5">Aucune donnee</p>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-5">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="mb-0"><i className="fas fa-globe-americas me-2" style={{ color: colors.secondary }}></i>Par Continent</h5>
                        </div>
                        <div className="card-body">
                            <div style={{ height: 350 }}>
                                {continentData ? <Bar data={continentData} options={{
                                    ...baseChartOpts,
                                    plugins: { ...baseChartOpts.plugins, legend: { display: false } }
                                }} /> : <p className="text-muted text-center mt-5">Aucune donnee</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 6: Top Pages Horizontal Bar */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0"><i className="fas fa-file-alt me-2" style={{ color: colors.info }}></i>Pages les plus visitees</h5>
                </div>
                <div className="card-body">
                    <div style={{ height: Math.max(300, pages.length * 35) }}>
                        {pagesData ? <Bar data={pagesData} options={{
                            ...baseChartOpts,
                            indexAxis: 'y',
                            plugins: { ...baseChartOpts.plugins, legend: { display: false } },
                            scales: {
                                x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                                y: { grid: { display: false }, ticks: { font: { size: 11 } } }
                            }
                        }} /> : <p className="text-muted text-center mt-5">Aucune donnee</p>}
                    </div>
                </div>
            </div>

            {/* Row 7: Comparison + Hourly */}
            <div className="row mb-4">
                <div className="col-xl-7 mb-4 mb-xl-0">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="mb-0"><i className="fas fa-exchange-alt me-2" style={{ color: colors.secondary }}></i>Comparaison periodes</h5>
                        </div>
                        <div className="card-body">
                            <div style={{ height: 300 }}>
                                {compData ? <Line data={compData} options={baseChartOpts} /> : <p className="text-muted text-center mt-5">Aucune donnee</p>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-5">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="mb-0"><i className="fas fa-clock me-2" style={{ color: colors.orange }}></i>Distribution horaire</h5>
                        </div>
                        <div className="card-body">
                            <div style={{ height: 300 }}>
                                {hourlyData ? <Bar data={hourlyData} options={{
                                    ...baseChartOpts,
                                    plugins: { ...baseChartOpts.plugins, legend: { display: false } }
                                }} /> : <p className="text-muted text-center mt-5">Aucune donnee</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 8: Country Detail Table */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0"><i className="fas fa-list me-2" style={{ color: colors.secondary }}></i>Detail par pays</h5>
                    <span className="badge bg-secondary">{sortedCountries.length} pays</span>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th className="ps-3" style={{ cursor: 'pointer' }} onClick={() => toggleSort('country_name')}>
                                        Pays {countrySort.field === 'country_name' && <i className={`fas fa-sort-${countrySort.dir === 'asc' ? 'up' : 'down'} ms-1`}></i>}
                                    </th>
                                    <th className="text-center" style={{ cursor: 'pointer' }} onClick={() => toggleSort('continent')}>
                                        Continent {countrySort.field === 'continent' && <i className={`fas fa-sort-${countrySort.dir === 'asc' ? 'up' : 'down'} ms-1`}></i>}
                                    </th>
                                    <th className="text-end" style={{ cursor: 'pointer' }} onClick={() => toggleSort('visits')}>
                                        Visites {countrySort.field === 'visits' && <i className={`fas fa-sort-${countrySort.dir === 'asc' ? 'up' : 'down'} ms-1`}></i>}
                                    </th>
                                    <th className="text-end" style={{ cursor: 'pointer' }} onClick={() => toggleSort('unique_visitors')}>
                                        Visiteurs {countrySort.field === 'unique_visitors' && <i className={`fas fa-sort-${countrySort.dir === 'asc' ? 'up' : 'down'} ms-1`}></i>}
                                    </th>
                                    <th className="text-end" style={{ cursor: 'pointer' }} onClick={() => toggleSort('percentage')}>
                                        % {countrySort.field === 'percentage' && <i className={`fas fa-sort-${countrySort.dir === 'asc' ? 'up' : 'down'} ms-1`}></i>}
                                    </th>
                                    <th className="text-end pe-3" style={{ cursor: 'pointer' }} onClick={() => toggleSort('bounce_rate')}>
                                        Rebond {countrySort.field === 'bounce_rate' && <i className={`fas fa-sort-${countrySort.dir === 'asc' ? 'up' : 'down'} ms-1`}></i>}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedCountries.map((c) => (
                                    <tr key={c.country_code}>
                                        <td className="ps-3">
                                            <span className="me-2" style={{ fontSize: '1.2rem' }}>{countryFlag(c.country_code)}</span>
                                            <strong>{c.country_name || c.country_code}</strong>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge" style={{ background: `${colors.secondary}15`, color: colors.secondary }}>
                                                {c.continent}
                                            </span>
                                        </td>
                                        <td className="text-end fw-bold">{fmtNum(c.visits)}</td>
                                        <td className="text-end">{fmtNum(c.unique_visitors)}</td>
                                        <td className="text-end">
                                            <div className="d-flex align-items-center justify-content-end">
                                                <div className="progress me-2" style={{ width: 60, height: 6 }}>
                                                    <div className="progress-bar" style={{ width: `${c.percentage}%`, background: colors.primary }}></div>
                                                </div>
                                                <span style={{ minWidth: 40 }}>{c.percentage}%</span>
                                            </div>
                                        </td>
                                        <td className="text-end pe-3">{c.bounce_rate}%</td>
                                    </tr>
                                ))}
                                {pagedCountries.length === 0 && (
                                    <tr><td colSpan="6" className="text-center text-muted py-4">Aucune donnee de pays disponible</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalCountryPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                {(countryPage - 1) * countriesPerPage + 1}-{Math.min(countryPage * countriesPerPage, sortedCountries.length)} sur {sortedCountries.length}
                            </span>
                            <nav>
                                <ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${countryPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCountryPage(p => Math.max(1, p - 1))}>
                                            <i className="fas fa-chevron-left"></i>
                                        </button>
                                    </li>
                                    {Array.from({ length: totalCountryPages }, (_, i) => i + 1)
                                        .filter(p => Math.abs(p - countryPage) <= 2 || p === 1 || p === totalCountryPages)
                                        .map((p, idx, arr) => (
                                            <React.Fragment key={p}>
                                                {idx > 0 && arr[idx - 1] !== p - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                                                <li className={`page-item ${countryPage === p ? 'active' : ''}`}>
                                                    <button className="page-link" onClick={() => setCountryPage(p)}
                                                        style={countryPage === p ? { background: colors.primary, borderColor: colors.primary } : {}}>
                                                        {p}
                                                    </button>
                                                </li>
                                            </React.Fragment>
                                        ))}
                                    <li className={`page-item ${countryPage === totalCountryPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCountryPage(p => Math.min(totalCountryPages, p + 1))}>
                                            <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AnalyticsDashboard;
