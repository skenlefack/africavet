import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const AnnuaireDashboard = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [recentVerified, setRecentVerified] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchRecentVerified();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchStats = async () => {
        const res = await api.get('/mapping/stats', token);
        if (res.success) setStats(res.data);
        setLoading(false);
    };

    const fetchRecentVerified = async () => {
        const res = await api.get('/mapping/organizations?status=verified&limit=6', token);
        if (res.success) setRecentVerified(res.data || []);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (searchLocation) params.set('location', searchLocation);
        navigate(`/annuaire/search?${params.toString()}`);
    };

    // 5 catégories principales
    const categories = [
        {
            key: 'clinique-soins',
            title: 'Clinique & Soins',
            description: 'Vétérinaires, cliniques, hôpitaux, urgences, paraprofessionnels',
            icon: 'fa-stethoscope',
            color: '#27AE60',
            gradient: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)',
            path: '/annuaire/list?category=clinique-soins'
        },
        {
            key: 'diagnostic-labos',
            title: 'Diagnostic & Laboratoires',
            description: 'Labos publics/privés, pathologie, imagerie, assurance qualité',
            icon: 'fa-flask',
            color: '#9B59B6',
            gradient: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
            path: '/annuaire/list?category=diagnostic-labos'
        },
        {
            key: 'pharmacie-fournisseurs',
            title: 'Pharmacie & Fournisseurs',
            description: 'Pharmacies, distributeurs, vaccins, équipements, chaîne du froid',
            icon: 'fa-pills',
            color: '#3498DB',
            gradient: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
            path: '/annuaire/list?category=pharmacie-fournisseurs'
        },
        {
            key: 'filieres-services',
            title: 'Filières & Services',
            description: 'Services par filière, nutrition, reproduction, biosécurité, inspection',
            icon: 'fa-cow',
            color: '#E67E22',
            gradient: 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)',
            path: '/annuaire/list?category=filieres-services'
        },
        {
            key: 'formation-institutions',
            title: 'Formation & Institutions',
            description: 'Écoles, facultés, services publics, ordres, associations, ONG',
            icon: 'fa-graduation-cap',
            color: '#354e84',
            gradient: 'linear-gradient(135deg, #354e84 0%, #2c3e50 100%)',
            path: '/annuaire/list?category=formation-institutions'
        }
    ];

    // Badges de statut
    const StatusBadge = ({ status }) => {
        const config = {
            declared: { label: 'Déclaré', color: '#95a5a6', icon: 'fa-file-alt' },
            verified: { label: 'Vérifié', color: '#27ae60', icon: 'fa-check-circle' },
            accredited: { label: 'Accrédité', color: '#f39c12', icon: 'fa-award' }
        };
        const cfg = config[status] || config.declared;
        return (
            <span className="badge d-inline-flex align-items-center gap-1" style={{ background: cfg.color }}>
                <i className={`fas ${cfg.icon}`} style={{ fontSize: '10px' }}></i>
                {cfg.label}
            </span>
        );
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
            {/* Hero Header avec recherche */}
            <div className="card mb-4" style={{
                background: 'linear-gradient(135deg, #7ac142 0%, #0d9488 50%, #354e84 100%)',
                border: 'none',
                borderRadius: '16px'
            }}>
                <div className="card-body py-5">
                    <div className="text-center text-white mb-4">
                        <h1 className="mb-2" style={{ fontWeight: '800', fontSize: '2rem' }}>
                            Annuaire Vétérinaire Panafricain
                        </h1>
                        <p className="mb-0" style={{ opacity: 0.9, fontSize: '1.1rem' }}>
                            La référence des services vétérinaires en Afrique
                        </p>
                    </div>

                    {/* Barre de recherche */}
                    <form onSubmit={handleSearch}>
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="card shadow" style={{ borderRadius: '12px' }}>
                                    <div className="card-body p-3">
                                        <div className="row g-2">
                                            <div className="col-md-5">
                                                <div className="input-group">
                                                    <span className="input-group-text bg-transparent border-0">
                                                        <i className="fas fa-search text-muted"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control border-0"
                                                        placeholder="Quoi ? (clinique, labo, vétérinaire...)"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-5">
                                                <div className="input-group">
                                                    <span className="input-group-text bg-transparent border-0">
                                                        <i className="fas fa-map-marker-alt text-muted"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control border-0"
                                                        placeholder="Où ? (ville, pays...)"
                                                        value={searchLocation}
                                                        onChange={(e) => setSearchLocation(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary w-100"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                                        border: 'none',
                                                        borderRadius: '8px'
                                                    }}
                                                >
                                                    <i className="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Stats rapides */}
            <div className="row mb-4">
                <div className="col-6 col-md-3">
                    <div className="card text-center h-100">
                        <div className="card-body py-3">
                            <h3 className="mb-0" style={{ color: '#7ac142', fontWeight: '800' }}>
                                {stats?.totalOrganizations || 0}
                            </h3>
                            <small className="text-muted">Établissements</small>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card text-center h-100">
                        <div className="card-body py-3">
                            <h3 className="mb-0" style={{ color: '#27ae60', fontWeight: '800' }}>
                                {stats?.verifiedCount || 0}
                            </h3>
                            <small className="text-muted">Vérifiés</small>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card text-center h-100">
                        <div className="card-body py-3">
                            <h3 className="mb-0" style={{ color: '#354e84', fontWeight: '800' }}>
                                {stats?.totalCountries || 0}
                            </h3>
                            <small className="text-muted">Pays</small>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card text-center h-100">
                        <div className="card-body py-3">
                            <h3 className="mb-0" style={{ color: '#E67E22', fontWeight: '800' }}>
                                {stats?.pendingSubmissions || 0}
                            </h3>
                            <small className="text-muted">En attente</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5 Catégories principales */}
            <h4 className="mb-3" style={{ fontWeight: '700' }}>
                <i className="fas fa-th-large me-2 text-primary"></i>
                Parcourir par catégorie
            </h4>
            <div className="row mb-4">
                {categories.map((cat) => (
                    <div key={cat.key} className="col-md-6 col-lg-4 mb-3">
                        <Link to={cat.path} style={{ textDecoration: 'none' }}>
                            <div
                                className="card h-100 border-0 shadow-sm"
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    overflow: 'hidden'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-start">
                                        <div
                                            className="me-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                            style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '12px',
                                                background: cat.gradient,
                                                color: 'white',
                                                fontSize: '24px'
                                            }}
                                        >
                                            <i className={`fas ${cat.icon}`}></i>
                                        </div>
                                        <div>
                                            <h5 className="mb-1" style={{ fontWeight: '700', color: '#2c3e50' }}>
                                                {cat.title}
                                            </h5>
                                            <p className="text-muted small mb-0" style={{ lineHeight: '1.4' }}>
                                                {cat.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="card-footer bg-transparent border-0 py-2 px-4"
                                    style={{ borderTop: `3px solid ${cat.color}` }}
                                >
                                    <small style={{ color: cat.color, fontWeight: '600' }}>
                                        Explorer <i className="fas fa-arrow-right ms-1"></i>
                                    </small>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Sections éditorialisées */}
            <div className="row mb-4">
                {/* Récemment vérifiés */}
                <div className="col-lg-8 mb-4">
                    <div className="card h-100">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="fas fa-check-circle text-success me-2"></i>
                                Récemment vérifiés
                            </h5>
                            <Link to="/annuaire/list?status=verified" className="btn btn-sm btn-outline-success">
                                Voir tout
                            </Link>
                        </div>
                        <div className="card-body p-0">
                            {recentVerified.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {recentVerified.slice(0, 5).map((org) => (
                                        <Link
                                            key={org.id}
                                            to={`/annuaire/view/${org.id}`}
                                            className="list-group-item list-group-item-action d-flex align-items-center py-3"
                                        >
                                            <div
                                                className="me-3 d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '44px',
                                                    height: '44px',
                                                    borderRadius: '10px',
                                                    background: '#27ae6015',
                                                    color: '#27ae60',
                                                    fontSize: '18px'
                                                }}
                                            >
                                                <i className="fas fa-building"></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="mb-0">{org.name}</h6>
                                                <small className="text-muted">
                                                    <i className="fas fa-map-marker-alt me-1"></i>
                                                    {org.city}, {org.country}
                                                </small>
                                            </div>
                                            <StatusBadge status={org.verification_status || 'verified'} />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted py-4">
                                    Aucun établissement vérifié récemment
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions rapides */}
                <div className="col-lg-4 mb-4">
                    <div className="card h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">
                                <i className="fas fa-bolt text-warning me-2"></i>
                                Actions rapides
                            </h5>
                        </div>
                        <div className="card-body">
                            <Link
                                to="/annuaire/new"
                                className="d-flex align-items-center p-3 mb-2 rounded"
                                style={{ background: '#7ac14210', textDecoration: 'none' }}
                            >
                                <div
                                    className="me-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: '#7ac142',
                                        color: 'white'
                                    }}
                                >
                                    <i className="fas fa-plus"></i>
                                </div>
                                <div>
                                    <h6 className="mb-0 text-dark">Ajouter un établissement</h6>
                                    <small className="text-muted">Créer une nouvelle fiche</small>
                                </div>
                            </Link>

                            <Link
                                to="/annuaire/pending"
                                className="d-flex align-items-center p-3 mb-2 rounded"
                                style={{ background: '#f39c1210', textDecoration: 'none' }}
                            >
                                <div
                                    className="me-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: '#f39c12',
                                        color: 'white'
                                    }}
                                >
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div>
                                    <h6 className="mb-0 text-dark">
                                        Soumissions en attente
                                        {stats?.pendingSubmissions > 0 && (
                                            <span className="badge bg-warning ms-2">{stats.pendingSubmissions}</span>
                                        )}
                                    </h6>
                                    <small className="text-muted">Valider les nouvelles fiches</small>
                                </div>
                            </Link>

                            <Link
                                to="/annuaire/list?emergency=true"
                                className="d-flex align-items-center p-3 mb-2 rounded"
                                style={{ background: '#e74c3c10', textDecoration: 'none' }}
                            >
                                <div
                                    className="me-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: '#e74c3c',
                                        color: 'white'
                                    }}
                                >
                                    <i className="fas fa-ambulance"></i>
                                </div>
                                <div>
                                    <h6 className="mb-0 text-dark">Urgences & Garde</h6>
                                    <small className="text-muted">Services disponibles 24/7</small>
                                </div>
                            </Link>

                            <Link
                                to="/annuaire/import"
                                className="d-flex align-items-center p-3 rounded"
                                style={{ background: '#354e8410', textDecoration: 'none' }}
                            >
                                <div
                                    className="me-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: '#354e84',
                                        color: 'white'
                                    }}
                                >
                                    <i className="fas fa-file-import"></i>
                                </div>
                                <div>
                                    <h6 className="mb-0 text-dark">Importer des données</h6>
                                    <small className="text-muted">CSV / Excel</small>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top par pays */}
            <div className="card">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="fas fa-globe-africa text-primary me-2"></i>
                        Couverture par pays
                    </h5>
                    <Link to="/annuaire/list" className="btn btn-sm btn-outline-primary">
                        Voir la carte
                    </Link>
                </div>
                <div className="card-body">
                    <div className="row">
                        {(stats?.byCountry || []).slice(0, 8).map((item, idx) => (
                            <div key={idx} className="col-6 col-md-3 mb-3">
                                <Link
                                    to={`/annuaire/list?country=${encodeURIComponent(item.country)}`}
                                    className="d-flex align-items-center p-2 rounded"
                                    style={{ textDecoration: 'none', background: '#f8f9fa' }}
                                >
                                    <span className="me-2" style={{ fontSize: '24px' }}>🇨🇮</span>
                                    <div>
                                        <h6 className="mb-0 text-dark">{item.country}</h6>
                                        <small className="text-muted">{item.count} établissements</small>
                                    </div>
                                </Link>
                            </div>
                        ))}
                        {(!stats?.byCountry || stats.byCountry.length === 0) && (
                            <div className="col-12 text-center text-muted py-3">
                                Aucune donnée disponible
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AnnuaireDashboard;
