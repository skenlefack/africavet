import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const PagesList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchPages = async () => {
        const res = await api.get('/pages', token);
        if (res.success) setPages(res.data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchPages();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette page ?')) {
            const res = await api.delete(`/pages/${id}`, token);
            if (res.success) {
                setToast({ message: 'Page supprimée', type: 'success' });
                fetchPages();
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    const handleDuplicate = async (id) => {
        const res = await api.post(`/pages/${id}/duplicate`, {}, token);
        if (res.success) {
            setToast({ message: 'Page dupliquée', type: 'success' });
            fetchPages();
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
    };

    const handleToggleStatus = async (page) => {
        const newStatus = page.status === 'published' ? 'draft' : 'published';
        const res = await api.put(`/pages/${page.id}`, { status: newStatus }, token);
        if (res.success) {
            setToast({ message: newStatus === 'published' ? 'Page publiée' : 'Page dépubliée', type: 'success' });
            fetchPages();
        }
    };

    // Filtrage
    const filteredPages = pages.filter(page => {
        const title = (page.title_fr || page.title || '').toLowerCase();
        const slug = (page.slug || '').toLowerCase();
        const search = searchQuery.toLowerCase();
        const matchesSearch = title.includes(search) || slug.includes(search);
        const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalItems = filteredPages.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPages = filteredPages.slice(startIndex, startIndex + itemsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, itemsPerPage]);

    // Compteurs
    const publishedCount = pages.filter(p => p.status === 'published').length;
    const draftCount = pages.filter(p => p.status === 'draft').length;

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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Pages</h2>
                    <p className="text-muted mb-0">{pages.length} pages ({publishedCount} publiées)</p>
                </div>
                <Link to="/pages/new" className="btn btn-primary" style={{
                    background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                    border: 'none'
                }}>
                    <i className="fas fa-plus me-2"></i> Nouvelle page
                </Link>
            </div>

            {/* Filtres par statut */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="d-flex flex-wrap gap-2 mb-3">
                        <button
                            className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setStatusFilter('all')}
                            style={statusFilter === 'all' ? { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' } : {}}
                        >
                            <i className="fas fa-layer-group me-1"></i> Toutes ({pages.length})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'published' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setStatusFilter('published')}
                        >
                            <i className="fas fa-check-circle me-1"></i> Publiées ({publishedCount})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'draft' ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => setStatusFilter('draft')}
                        >
                            <i className="fas fa-edit me-1"></i> Brouillons ({draftCount})
                        </button>
                    </div>
                    <div className="row g-3 align-items-center">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Rechercher par titre ou slug..."
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
                        <div className="col-md-6 text-end">
                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                {filteredPages.length} résultat{filteredPages.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th style={{ minWidth: '250px' }}>Titre</th>
                                    <th>Slug</th>
                                    <th>Statut</th>
                                    <th>Modifié</th>
                                    <th className="text-end" style={{ width: '180px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPages.length > 0 ? (
                                    paginatedPages.map((page) => (
                                        <tr key={page.id} className="align-middle">
                                            <td>
                                                <div>
                                                    <h6 className="mb-0 fw-semibold">{page.title_fr || page.title}</h6>
                                                    {page.title_en && page.title_en !== page.title_fr && (
                                                        <small className="text-muted">{page.title_en}</small>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <code className="bg-light px-2 py-1 rounded" style={{ fontSize: '0.8rem' }}>
                                                    /{page.slug}
                                                </code>
                                            </td>
                                            <td>
                                                <span className={`badge ${page.status === 'published' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                    {page.status === 'published' ? 'Publiée' : 'Brouillon'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    <div className="text-dark">
                                                        {new Date(page.updated_at || page.created_at).toLocaleDateString('fr-FR', {
                                                            day: 'numeric',
                                                            month: 'short'
                                                        })}
                                                    </div>
                                                    <small className="text-muted">
                                                        {new Date(page.updated_at || page.created_at).toLocaleTimeString('fr-FR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </small>
                                                </div>
                                            </td>
                                            <td className="text-end">
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-info"
                                                        onClick={() => navigate(`/pagebuilder/${page.id}`)}
                                                        title="Page Builder"
                                                    >
                                                        <i className="fas fa-magic"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => navigate(`/pages/${page.id}`)}
                                                        title="Modifier"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => handleDuplicate(page.id)}
                                                        title="Dupliquer"
                                                    >
                                                        <i className="fas fa-copy"></i>
                                                    </button>
                                                    <button
                                                        className={`btn ${page.status === 'published' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                        onClick={() => handleToggleStatus(page)}
                                                        title={page.status === 'published' ? 'Dépublier' : 'Publier'}
                                                    >
                                                        <i className={`fas fa-${page.status === 'published' ? 'eye-slash' : 'eye'}`}></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleDelete(page.id)}
                                                        title="Supprimer"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-5">
                                            {searchQuery || statusFilter !== 'all' ? (
                                                <>
                                                    <i className="fas fa-search fa-3x mb-3 opacity-50"></i>
                                                    <p className="mb-2">Aucune page trouvée</p>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setStatusFilter('all');
                                                        }}
                                                    >
                                                        Réinitialiser les filtres
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-file fa-3x mb-3 opacity-50"></i>
                                                    <p className="mb-2">Aucune page</p>
                                                    <Link to="/pages/new" className="btn btn-primary">
                                                        Créer une page
                                                    </Link>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalItems > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        itemName="pages"
                        itemsPerPageOptions={[10, 25, 50]}
                    />
                )}
            </div>
        </>
    );
};

export default PagesList;
