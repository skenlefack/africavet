import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const LearningPathsList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    useEffect(() => {
        fetchPaths();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPaths = async () => {
        const res = await api.get('/elearning/paths', token);
        if (res.success) setPaths(res.data || []);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce parcours ?')) {
            const res = await api.delete(`/elearning/paths/${id}`, token);
            if (res.success) {
                setToast({ message: 'Parcours supprimé', type: 'success' });
                setPaths(prev => prev.filter(p => p.id !== id));
            }
        }
    };

    const filtered = paths.filter(p => {
        const title = (p.title_fr || p.title || '').toLowerCase();
        return title.includes(searchQuery.toLowerCase());
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, itemsPerPage]);

    const levels = { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé', expert: 'Expert' };

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

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Parcours d'apprentissage</h2>
                    <p className="text-muted mb-0">{paths.length} parcours</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/elearning" className="btn btn-outline-secondary">
                        <i className="fas fa-arrow-left me-2"></i> Retour
                    </Link>
                    <Link to="/elearning/paths/new" className="btn btn-primary"
                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                        <i className="fas fa-plus me-2"></i> Nouveau parcours
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="fas fa-search text-muted"></i>
                        </span>
                        <input type="text" className="form-control border-start-0" placeholder="Rechercher un parcours..."
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Titre</th>
                                    <th>Cours</th>
                                    <th>Niveau</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <strong>{p.title_fr || p.title}</strong>
                                            {p.title_en && <small className="text-muted d-block">{p.title_en}</small>}
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark">
                                                <i className="fas fa-book me-1"></i>{p.courses_count || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge bg-secondary">{levels[p.level] || p.level || '-'}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${p.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                                                {p.status === 'published' ? 'Publié' : 'Brouillon'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-primary" onClick={() => navigate(`/elearning/paths/${p.id}`)}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-outline-danger" onClick={() => handleDelete(p.id)}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginated.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            <i className="fas fa-road fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0">Aucun parcours trouvé</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {totalItems > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        itemName="parcours"
                    />
                )}
            </div>
        </>
    );
};

export default LearningPathsList;
