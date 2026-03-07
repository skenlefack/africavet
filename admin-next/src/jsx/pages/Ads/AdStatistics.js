import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
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

const AdStatistics = () => {
    const token = getToken();
    const [searchParams] = useSearchParams();
    const selectedAdId = searchParams.get('ad_id');

    const [loading, setLoading] = useState(true);
    const [ads, setAds] = useState([]);
    const [selectedAd, setSelectedAd] = useState(selectedAdId || '');
    const [period, setPeriod] = useState('30');
    const [stats, setStats] = useState(null);
    const [adStats, setAdStats] = useState(null);

    useEffect(() => {
        fetchAds();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (selectedAd) {
            fetchAdStats();
        } else {
            fetchOverviewStats();
        }
    }, [selectedAd, period]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchAds = async () => {
        const res = await api.get('/ads?limit=1000', token);
        if (res.success) setAds(res.data || []);
    };

    const fetchOverviewStats = async () => {
        setLoading(true);
        const res = await api.get(`/ads/stats/overview?period=${period}`, token);
        if (res.success) {
            setStats(res.data);
            setAdStats(null);
        }
        setLoading(false);
    };

    const fetchAdStats = async () => {
        setLoading(true);
        const res = await api.get(`/ads/stats/${selectedAd}?period=${period}`, token);
        if (res.success) {
            setAdStats(res.data);
            setStats(null);
        }
        setLoading(false);
    };

    // Chart colors
    const colors = {
        primary: '#7ac142',
        secondary: '#354e84',
        warning: '#ffc107',
        info: '#17a2b8',
        success: '#28a745',
        danger: '#dc3545'
    };

    // Daily trend chart
    const trendChartData = (stats?.daily || adStats?.daily) ? {
        labels: (stats?.daily || adStats?.daily).map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }),
        datasets: [
            {
                label: 'Impressions',
                data: (stats?.daily || adStats?.daily).map(d => d.impressions),
                borderColor: colors.primary,
                backgroundColor: `${colors.primary}20`,
                fill: true,
                tension: 0.4
            },
            {
                label: 'Clics',
                data: (stats?.daily || adStats?.daily).map(d => d.clicks),
                borderColor: colors.secondary,
                backgroundColor: `${colors.secondary}20`,
                fill: true,
                tension: 0.4
            }
        ]
    } : null;

    // Device breakdown chart
    const deviceChartData = adStats?.by_device ? {
        labels: adStats.by_device.map(d => {
            const labels = {
                desktop: 'Desktop',
                mobile: 'Mobile',
                tablet: 'Tablette',
                unknown: 'Autre'
            };
            return labels[d.device_type] || d.device_type;
        }),
        datasets: [{
            data: adStats.by_device.map(d => d.count),
            backgroundColor: [colors.primary, colors.secondary, colors.warning, colors.info]
        }]
    } : null;

    // Hourly distribution chart
    const hourlyChartData = adStats?.by_hour ? {
        labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
        datasets: [
            {
                label: 'Impressions',
                data: Array.from({ length: 24 }, (_, hour) => {
                    const entry = adStats.by_hour.find(h => h.hour === hour && h.event_type === 'impression');
                    return entry?.count || 0;
                }),
                backgroundColor: colors.primary
            },
            {
                label: 'Clics',
                data: Array.from({ length: 24 }, (_, hour) => {
                    const entry = adStats.by_hour.find(h => h.hour === hour && h.event_type === 'click');
                    return entry?.count || 0;
                }),
                backgroundColor: colors.secondary
            }
        ]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right'
            }
        }
    };

    // Format number
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // Calculate CTR
    const calculateCTR = (impressions, clicks) => {
        if (!impressions) return 0;
        return ((clicks / impressions) * 100).toFixed(2);
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

    const currentStats = adStats?.summary || stats?.summary || {};

    return (
        <>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Statistiques publicitaires</h2>
                    <p className="text-muted mb-0">
                        {adStats ? `Analyse de: ${adStats.ad_name}` : 'Vue globale de toutes les publicites'}
                    </p>
                </div>
                <Link to="/ads/dashboard" className="btn btn-outline-primary">
                    <i className="fas fa-arrow-left me-2"></i> Tableau de bord
                </Link>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-5">
                            <select
                                className="form-select"
                                value={selectedAd}
                                onChange={(e) => setSelectedAd(e.target.value)}
                            >
                                <option value="">Toutes les publicites</option>
                                {ads.map(ad => (
                                    <option key={ad.id} value={ad.id}>
                                        {ad.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                            >
                                <option value="7">7 derniers jours</option>
                                <option value="30">30 derniers jours</option>
                                <option value="90">90 derniers jours</option>
                            </select>
                        </div>
                        <div className="col-md-4 text-end">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setSelectedAd('');
                                    setPeriod('30');
                                }}
                            >
                                <i className="fas fa-undo me-2"></i> Reinitialiser
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-xl-3 col-sm-6 mb-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Impressions totales</p>
                                    <h3 className="mb-0 fw-bold">
                                        {formatNumber(currentStats.total_impressions || currentStats.impressions || 0)}
                                    </h3>
                                </div>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '48px', height: '48px', background: `${colors.primary}20` }}
                                >
                                    <i className="fas fa-eye" style={{ color: colors.primary }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-sm-6 mb-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Clics totaux</p>
                                    <h3 className="mb-0 fw-bold">
                                        {formatNumber(currentStats.total_clicks || currentStats.clicks || 0)}
                                    </h3>
                                </div>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '48px', height: '48px', background: `${colors.secondary}20` }}
                                >
                                    <i className="fas fa-mouse-pointer" style={{ color: colors.secondary }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-sm-6 mb-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Taux de clics (CTR)</p>
                                    <h3 className="mb-0 fw-bold">
                                        {currentStats.ctr || calculateCTR(
                                            currentStats.total_impressions || currentStats.impressions,
                                            currentStats.total_clicks || currentStats.clicks
                                        )}%
                                    </h3>
                                </div>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '48px', height: '48px', background: `${colors.warning}20` }}
                                >
                                    <i className="fas fa-percentage" style={{ color: colors.warning }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-sm-6 mb-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Visiteurs uniques</p>
                                    <h3 className="mb-0 fw-bold">
                                        {formatNumber(currentStats.total_unique_impressions || currentStats.unique_impressions || 0)}
                                    </h3>
                                </div>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '48px', height: '48px', background: `${colors.info}20` }}
                                >
                                    <i className="fas fa-users" style={{ color: colors.info }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="card mb-4">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Tendance sur {period} jours</h5>
                </div>
                <div className="card-body">
                    <div style={{ height: '350px' }}>
                        {trendChartData ? (
                            <Line data={trendChartData} options={chartOptions} />
                        ) : (
                            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                Aucune donnee disponible
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Secondary Charts Row */}
            <div className="row">
                {/* Device Breakdown (Ad specific only) */}
                {adStats && deviceChartData && (
                    <div className="col-md-6 mb-4">
                        <div className="card h-100">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">Repartition par appareil</h5>
                            </div>
                            <div className="card-body">
                                <div style={{ height: '250px' }}>
                                    <Doughnut data={deviceChartData} options={doughnutOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hourly Distribution (Ad specific only) */}
                {adStats && hourlyChartData && (
                    <div className="col-md-6 mb-4">
                        <div className="card h-100">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">Distribution horaire</h5>
                            </div>
                            <div className="card-body">
                                <div style={{ height: '250px' }}>
                                    <Bar data={hourlyChartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Ads (Overview only) */}
                {stats?.top_ads && (
                    <div className="col-md-6 mb-4">
                        <div className="card h-100">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">Top publicites</h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Publicite</th>
                                                <th className="text-end">Impressions</th>
                                                <th className="text-end">Clics</th>
                                                <th className="text-end">CTR</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.top_ads.map((ad, index) => (
                                                <tr key={ad.id}>
                                                    <td>
                                                        <Link
                                                            to={`/ads/statistics?ad_id=${ad.id}`}
                                                            onClick={() => setSelectedAd(ad.id.toString())}
                                                            className="text-decoration-none"
                                                        >
                                                            {ad.name}
                                                        </Link>
                                                    </td>
                                                    <td className="text-end">{formatNumber(ad.impressions)}</td>
                                                    <td className="text-end">{formatNumber(ad.clicks)}</td>
                                                    <td className="text-end">
                                                        <span className={`badge ${parseFloat(ad.ctr) >= 2 ? 'bg-success' : parseFloat(ad.ctr) >= 1 ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                            {ad.ctr}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Performance by Placement (Overview only) */}
                {stats?.by_placement && (
                    <div className="col-md-6 mb-4">
                        <div className="card h-100">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">Performance par emplacement</h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Emplacement</th>
                                                <th className="text-end">Impressions</th>
                                                <th className="text-end">Clics</th>
                                                <th className="text-end">CTR</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.by_placement.map((p, index) => (
                                                <tr key={p.slug}>
                                                    <td>{p.name}</td>
                                                    <td className="text-end">{formatNumber(p.impressions)}</td>
                                                    <td className="text-end">{formatNumber(p.clicks)}</td>
                                                    <td className="text-end">
                                                        <span className="badge bg-light text-dark">
                                                            {calculateCTR(p.impressions, p.clicks)}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Export Section */}
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="mb-1">Exporter les donnees</h6>
                            <p className="text-muted small mb-0">
                                Telechargez les statistiques pour analyse externe
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-primary" disabled>
                                <i className="fas fa-file-csv me-2"></i> CSV
                            </button>
                            <button className="btn btn-outline-primary" disabled>
                                <i className="fas fa-file-excel me-2"></i> Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdStatistics;
