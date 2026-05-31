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
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const DocumentsDashboard = () => {
    const token = getToken();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchStats = async () => {
        const res = await api.get('/documents/admin/stats', token);
        if (res.success) {
            setStats(res.data);
        }
        setLoading(false);
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // Download trend chart (30 days)
    const downloadChartData = stats?.recentDownloads ? {
        labels: stats.recentDownloads.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }),
        datasets: [{
            label: 'Telechargements',
            data: stats.recentDownloads.map(d => d.count),
            borderColor: '#7ac142',
            backgroundColor: 'rgba(122, 193, 66, 0.1)',
            fill: true,
            tension: 0.4
        }]
    } : null;

    // Category distribution (doughnut)
    const categoryChartData = stats?.byCategory ? {
        labels: stats.byCategory.map(c => c.name_fr),
        datasets: [{
            data: stats.byCategory.map(c => c.document_count),
            backgroundColor: stats.byCategory.map(c => c.color || '#354e84'),
            borderWidth: 2,
            borderColor: '#fff'
        }]
    } : null;

    // Top downloads (horizontal bar)
    const topDownloadsChartData = stats?.topDownloaded ? {
        labels: stats.topDownloaded.map(d => d.title_fr?.substring(0, 30) + (d.title_fr?.length > 30 ? '...' : '')),
        datasets: [{
            label: 'Telechargements',
            data: stats.topDownloaded.map(d => d.download_count),
            backgroundColor: 'rgba(53, 78, 132, 0.8)',
            borderRadius: 4
        }]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
    };

    const horizontalBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true } }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } }
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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Gestionnaire de Documents</h2>
                    <p className="text-muted mb-0">Bibliotheque documentaire AfricaVet</p>
                </div>
                <Link
                    to="/documents/new"
                    className="btn btn-primary"
                    style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}
                >
                    <i className="fas fa-plus me-2"></i> Ajouter un document
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-xl-3 col-sm-6 mb-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Total documents</p>
                                    <h3 className="mb-0 fw-bold">{formatNumber(stats?.total || 0)}</h3>
                                </div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center"
                                     style={{ width: '48px', height: '48px', background: 'rgba(122, 193, 66, 0.1)' }}>
                                    <i className="fas fa-file-alt text-success"></i>
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
                                    <p className="text-muted mb-1 small">Documents publies</p>
                                    <h3 className="mb-0 fw-bold">{formatNumber(stats?.published || 0)}</h3>
                                </div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center"
                                     style={{ width: '48px', height: '48px', background: 'rgba(53, 78, 132, 0.1)' }}>
                                    <i className="fas fa-check-circle text-primary"></i>
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
                                    <p className="text-muted mb-1 small">Telechargements</p>
                                    <h3 className="mb-0 fw-bold">{formatNumber(stats?.totalDownloads || 0)}</h3>
                                </div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center"
                                     style={{ width: '48px', height: '48px', background: 'rgba(255, 193, 7, 0.1)' }}>
                                    <i className="fas fa-download text-warning"></i>
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
                                    <p className="text-muted mb-1 small">Categories</p>
                                    <h3 className="mb-0 fw-bold">{stats?.totalCategories || 0}</h3>
                                </div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center"
                                     style={{ width: '48px', height: '48px', background: 'rgba(13, 202, 240, 0.1)' }}>
                                    <i className="fas fa-folder-open text-info"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="row mb-4">
                <div className="col-xl-8 mb-3">
                    <div className="card h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Telechargements (30 derniers jours)</h5>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                {downloadChartData ? (
                                    <Line data={downloadChartData} options={chartOptions} />
                                ) : (
                                    <div className="text-center text-muted py-5">Aucune donnee</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-4 mb-3">
                    <div className="card h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Repartition par categorie</h5>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                {categoryChartData ? (
                                    <Doughnut data={categoryChartData} options={doughnutOptions} />
                                ) : (
                                    <div className="text-center text-muted py-5">Aucune donnee</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Downloads Bar Chart */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Top 10 documents les plus telecharges</h5>
                            <Link to="/documents/list" className="btn btn-sm btn-outline-primary">
                                Voir tout
                            </Link>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                {topDownloadsChartData && topDownloadsChartData.labels.length > 0 ? (
                                    <Bar data={topDownloadsChartData} options={horizontalBarOptions} />
                                ) : (
                                    <div className="text-center text-muted py-5">Aucune donnee</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Status + Recent Docs */}
            <div className="row mb-4">
                {/* Status breakdown */}
                <div className="col-xl-4 mb-3">
                    <div className="card h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Statuts</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded" style={{ background: '#e8f5e9' }}>
                                <span><i className="fas fa-check-circle text-success me-2"></i> Publies</span>
                                <span className="badge bg-success">{stats?.published || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded" style={{ background: '#fff3e0' }}>
                                <span><i className="fas fa-edit text-warning me-2"></i> Brouillons</span>
                                <span className="badge bg-warning text-dark">{stats?.draft || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: '#f5f5f5' }}>
                                <span><i className="fas fa-archive text-secondary me-2"></i> Archives</span>
                                <span className="badge bg-secondary">{stats?.archived || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top downloaded table */}
                <div className="col-xl-8 mb-3">
                    <div className="card h-100">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Documents populaires</h5>
                            <Link to="/documents/list" className="btn btn-sm btn-outline-primary">Voir tout</Link>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Document</th>
                                            <th>Type</th>
                                            <th className="text-end">Telechargements</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats?.topDownloaded?.length > 0 ? (
                                            stats.topDownloaded.slice(0, 5).map(doc => (
                                                <tr key={doc.id}>
                                                    <td>
                                                        <Link to={`/documents/view/${doc.id}`} className="text-decoration-none">
                                                            {doc.title_fr}
                                                        </Link>
                                                        {doc.category_name_fr && (
                                                            <small className="d-block text-muted">{doc.category_name_fr}</small>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-light text-dark">
                                                            <i className={`fas fa-${getFileIcon(doc.file_type)} me-1`}></i>
                                                            {(doc.file_type || '').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="text-end fw-semibold">{formatNumber(doc.download_count)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="text-center text-muted py-4">
                                                    Aucun document
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

            {/* Quick Actions */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Actions rapides</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <Link to="/documents/new" className="btn btn-outline-success w-100 py-3">
                                        <i className="fas fa-plus-circle fa-2x mb-2 d-block"></i>
                                        Ajouter un document
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link to="/documents/list" className="btn btn-outline-primary w-100 py-3">
                                        <i className="fas fa-list fa-2x mb-2 d-block"></i>
                                        Tous les documents
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link to="/documents/categories" className="btn btn-outline-info w-100 py-3">
                                        <i className="fas fa-folder-open fa-2x mb-2 d-block"></i>
                                        Categories
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link to="/documents/categories/new" className="btn btn-outline-warning w-100 py-3">
                                        <i className="fas fa-folder-plus fa-2x mb-2 d-block"></i>
                                        Nouvelle categorie
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

// Helper to get file icon
const getFileIcon = (type) => {
    const icons = {
        pdf: 'file-pdf',
        doc: 'file-word', docx: 'file-word',
        xls: 'file-excel', xlsx: 'file-excel',
        ppt: 'file-powerpoint', pptx: 'file-powerpoint',
        zip: 'file-archive', rar: 'file-archive',
        jpg: 'file-image', jpeg: 'file-image', png: 'file-image', gif: 'file-image', webp: 'file-image'
    };
    return icons[type?.toLowerCase()] || 'file';
};

export default DocumentsDashboard;
