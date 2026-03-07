import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AdsDashboard = () => {
    const token = getToken();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [period, setPeriod] = useState('30');

    useEffect(() => {
        fetchStats();
    }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchStats = async () => {
        setLoading(true);
        const res = await api.get(`/ads/stats/overview?period=${period}`, token);
        if (res.success) {
            setStats(res.data);
        }
        setLoading(false);
    };

    // Format numbers
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // Chart data for trends
    const trendChartData = stats?.daily ? {
        labels: stats.daily.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }),
        datasets: [
            {
                label: 'Impressions',
                data: stats.daily.map(d => d.impressions),
                borderColor: '#7ac142',
                backgroundColor: 'rgba(122, 193, 66, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Clics',
                data: stats.daily.map(d => d.clicks),
                borderColor: '#354e84',
                backgroundColor: 'rgba(53, 78, 132, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    } : null;

    // Chart data for placements
    const placementChartData = stats?.by_placement ? {
        labels: stats.by_placement.map(p => p.name),
        datasets: [
            {
                label: 'Impressions',
                data: stats.by_placement.map(p => p.impressions),
                backgroundColor: 'rgba(122, 193, 66, 0.8)'
            },
            {
                label: 'Clics',
                data: stats.by_placement.map(p => p.clicks),
                backgroundColor: 'rgba(53, 78, 132, 0.8)'
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

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Tableau de bord Publicites</h2>
                    <p className="text-muted mb-0">Vue d'ensemble des performances publicitaires</p>
                </div>
                <div className="d-flex gap-2">
                    <select
                        className="form-select"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="7">7 derniers jours</option>
                        <option value="30">30 derniers jours</option>
                        <option value="90">90 derniers jours</option>
                    </select>
                    <Link
                        to="/ads/new"
                        className="btn btn-primary"
                        style={{
                            background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                            border: 'none'
                        }}
                    >
                        <i className="fas fa-plus me-2"></i> Nouvelle publicite
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-xl-3 col-sm-6 mb-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Impressions</p>
                                    <h3 className="mb-0 fw-bold">
                                        {formatNumber(stats?.summary?.impressions || 0)}
                                    </h3>
                                </div>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'rgba(122, 193, 66, 0.1)'
                                    }}
                                >
                                    <i className="fas fa-eye text-success"></i>
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
                                    <p className="text-muted mb-1 small">Clics</p>
                                    <h3 className="mb-0 fw-bold">
                                        {formatNumber(stats?.summary?.clicks || 0)}
                                    </h3>
                                </div>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'rgba(53, 78, 132, 0.1)'
                                    }}
                                >
                                    <i className="fas fa-mouse-pointer text-primary"></i>
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
                                        {stats?.summary?.ctr || 0}%
                                    </h3>
                                </div>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'rgba(255, 193, 7, 0.1)'
                                    }}
                                >
                                    <i className="fas fa-percentage text-warning"></i>
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
                                    <p className="text-muted mb-1 small">Publicites actives</p>
                                    <h3 className="mb-0 fw-bold">
                                        {stats?.summary?.active_ads || 0}
                                    </h3>
                                </div>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'rgba(13, 202, 240, 0.1)'
                                    }}
                                >
                                    <i className="fas fa-ad text-info"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="row mb-4">
                <div className="col-xl-8 mb-3">
                    <div className="card h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Tendance sur la periode</h5>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                {trendChartData && (
                                    <Line data={trendChartData} options={chartOptions} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 mb-3">
                    <div className="card h-100">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Top Publicites</h5>
                            <Link to="/ads" className="btn btn-sm btn-outline-primary">
                                Voir tout
                            </Link>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Nom</th>
                                            <th className="text-end">Clics</th>
                                            <th className="text-end">CTR</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats?.top_ads?.length > 0 ? (
                                            stats.top_ads.map((ad, index) => (
                                                <tr key={ad.id}>
                                                    <td>
                                                        <Link
                                                            to={`/ads/${ad.id}`}
                                                            className="text-decoration-none"
                                                        >
                                                            {ad.name}
                                                        </Link>
                                                    </td>
                                                    <td className="text-end">{ad.clicks}</td>
                                                    <td className="text-end">
                                                        <span className={`badge ${ad.ctr >= 2 ? 'bg-success' : ad.ctr >= 1 ? 'bg-warning' : 'bg-secondary'}`}>
                                                            {ad.ctr}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="text-center text-muted py-4">
                                                    Aucune donnee disponible
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance by Placement */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Performance par emplacement</h5>
                            <Link to="/ads/placements" className="btn btn-sm btn-outline-primary">
                                Gerer les emplacements
                            </Link>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '250px' }}>
                                {placementChartData && (
                                    <Bar data={placementChartData} options={chartOptions} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Actions rapides</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <Link
                                        to="/ads/new"
                                        className="btn btn-outline-success w-100 py-3"
                                    >
                                        <i className="fas fa-plus-circle fa-2x mb-2 d-block"></i>
                                        Creer une publicite
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link
                                        to="/ads"
                                        className="btn btn-outline-primary w-100 py-3"
                                    >
                                        <i className="fas fa-list fa-2x mb-2 d-block"></i>
                                        Voir toutes les pubs
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link
                                        to="/ads/placements"
                                        className="btn btn-outline-info w-100 py-3"
                                    >
                                        <i className="fas fa-th-large fa-2x mb-2 d-block"></i>
                                        Emplacements
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link
                                        to="/ads/statistics"
                                        className="btn btn-outline-warning w-100 py-3"
                                    >
                                        <i className="fas fa-chart-bar fa-2x mb-2 d-block"></i>
                                        Statistiques
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdsDashboard;
