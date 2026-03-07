import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const SlidersList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');

    useEffect(() => {
        fetchSliders();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSliders = async () => {
        const res = await api.get('/sliders', token);
        if (res.success) setSliders(res.data || []);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce slider et tous ses slides ?')) {
            const res = await api.delete(`/sliders/${id}`, token);
            if (res.success) {
                setToast({ message: 'Slider supprimé', type: 'success' });
                fetchSliders();
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    // Filtrage
    const filteredSliders = sliders.filter(slider => {
        const name = (slider.name || '').toLowerCase();
        const search = searchQuery.toLowerCase();
        const matchesSearch = name.includes(search);
        const matchesLocation = locationFilter === 'all' || slider.location === locationFilter;
        return matchesSearch && matchesLocation;
    });

    // Get unique locations
    const locations = [...new Set(sliders.map(s => s.location).filter(Boolean))];

    const getLocationLabel = (location) => {
        const labels = {
            'homepage': 'Page d\'accueil',
            'header': 'Header',
            'sidebar': 'Sidebar',
            'footer': 'Footer'
        };
        return labels[location] || location || 'Non défini';
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
            {toast && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                     style={{ top: '20px', right: '20px', zIndex: 9999 }}>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Sliders</h2>
                    <p className="text-muted mb-0">{sliders.length} sliders</p>
                </div>
                <Link
                    to="/sliders/new"
                    className="btn btn-primary"
                    style={{
                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                        border: 'none'
                    }}
                >
                    <i className="fas fa-plus me-2"></i> Nouveau slider
                </Link>
            </div>

            {/* Filtres */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Rechercher un slider..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        className="btn btn-outline-secondary border-start-0"
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                            >
                                <option value="all">Tous les emplacements</option>
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{getLocationLabel(loc)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4 text-end">
                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                {filteredSliders.length} slider{filteredSliders.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des sliders */}
            <div className="row">
                {filteredSliders.length > 0 ? (
                    filteredSliders.map(slider => (
                        <div key={slider.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-header d-flex justify-content-between align-items-center bg-white">
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="rounded d-flex align-items-center justify-content-center me-2"
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                                color: 'white'
                                            }}
                                        >
                                            <i className="fas fa-images"></i>
                                        </div>
                                        <h5 className="mb-0">{slider.name}</h5>
                                    </div>
                                    <span className="badge rounded-pill" style={{
                                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)'
                                    }}>
                                        {slider.slides_count || 0} slides
                                    </span>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <small className="text-muted d-block mb-1">Emplacement</small>
                                        <span className="badge bg-secondary">
                                            {getLocationLabel(slider.location)}
                                        </span>
                                    </div>
                                    <div className="d-flex gap-4 text-muted" style={{ fontSize: '0.85rem' }}>
                                        <span>
                                            <i className={`fas fa-${slider.autoplay ? 'play-circle text-success' : 'pause-circle'} me-1`}></i>
                                            {slider.autoplay ? 'Auto' : 'Manuel'}
                                        </span>
                                        <span>
                                            <i className="fas fa-clock me-1"></i>
                                            {(slider.interval || 5000) / 1000}s
                                        </span>
                                        {slider.show_navigation && (
                                            <span>
                                                <i className="fas fa-arrows-alt-h me-1"></i>
                                                Nav
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="card-footer bg-transparent">
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-outline-primary flex-fill"
                                            onClick={() => navigate(`/sliders/${slider.id}`)}
                                        >
                                            <i className="fas fa-edit me-1"></i> Modifier
                                        </button>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() => handleDelete(slider.id)}
                                            title="Supprimer"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                {searchQuery || locationFilter !== 'all' ? (
                                    <>
                                        <i className="fas fa-search fa-3x text-muted mb-3 opacity-50"></i>
                                        <p className="text-muted mb-2">Aucun slider trouvé</p>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setLocationFilter('all');
                                            }}
                                        >
                                            Réinitialiser les filtres
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-images fa-3x text-muted mb-3 opacity-50"></i>
                                        <p className="text-muted mb-2">Aucun slider créé</p>
                                        <Link to="/sliders/new" className="btn btn-primary">
                                            Créer un slider
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default SlidersList;
