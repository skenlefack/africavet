import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const PostsList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [toast, setToast] = useState(null);

    const fetchPosts = async (status = null) => {
        let params = '?limit=1000';
        if (status && status !== 'all') {
            params += `&status=${status}`;
        }
        const res = await api.get(`/posts${params}`, token);
        if (res.success) setPosts(res.data || []);
        setLoading(false);
    };

    const fetchCategories = async () => {
        const res = await api.get('/categories', token);
        if (res.success) setCategories(res.data || []);
    };

    useEffect(() => {
        fetchPosts(statusFilter);
        fetchCategories();
    }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleDelete = async (id) => {
        if (window.confirm('Mettre cet article à la corbeille ?')) {
            const res = await api.delete(`/posts/${id}`, token);
            if (res.success) {
                setToast({ message: 'Article supprimé', type: 'success' });
                fetchPosts(statusFilter);
            }
        }
    };

    const handleRestore = async (id) => {
        const res = await api.post(`/posts/${id}/restore`, {}, token);
        if (res.success) {
            setToast({ message: 'Article restauré', type: 'success' });
            fetchPosts(statusFilter);
        }
    };

    const handleToggleStatus = async (post) => {
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        const res = await api.put(`/posts/${post.id}`, { status: newStatus }, token);
        if (res.success) {
            setToast({ message: newStatus === 'published' ? 'Article publié' : 'Article dépublié', type: 'success' });
            fetchPosts(statusFilter);
        }
    };

    // Filtrage
    const filteredPosts = posts.filter(post => {
        const title = (post.title_fr || post.title || '').toLowerCase();
        const search = searchQuery.toLowerCase();
        const matchesSearch = title.includes(search);
        const matchesCategory = categoryFilter === 'all' || post.category_id === parseInt(categoryFilter);
        return matchesSearch && matchesCategory;
    });

    // Pagination
    const totalItems = filteredPosts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, statusFilter, itemsPerPage]);

    // Compteurs
    const publishedCount = posts.filter(p => p.status === 'published').length;
    const draftCount = posts.filter(p => p.status === 'draft').length;
    const trashCount = posts.filter(p => p.status === 'trash').length;

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
            {/* Toast Notification */}
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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Articles</h2>
                    <p className="text-muted mb-0">{posts.length} articles au total</p>
                </div>
                <Link to="/posts/new" className="btn btn-primary" style={{
                    background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                    border: 'none'
                }}>
                    <i className="fas fa-plus me-2"></i> Nouvel article
                </Link>
            </div>

            {/* Filtres par statut */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="d-flex flex-wrap gap-2">
                        <button
                            className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setStatusFilter('all')}
                            style={statusFilter === 'all' ? { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' } : {}}
                        >
                            <i className="fas fa-layer-group me-1"></i> Tous ({posts.length})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'published' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setStatusFilter('published')}
                        >
                            <i className="fas fa-check-circle me-1"></i> Publiés ({publishedCount})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'draft' ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => setStatusFilter('draft')}
                        >
                            <i className="fas fa-edit me-1"></i> Brouillons ({draftCount})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'trash' ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => setStatusFilter('trash')}
                        >
                            <i className="fas fa-trash me-1"></i> Corbeille ({trashCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Barre de recherche et filtres */}
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
                                    placeholder="Rechercher un article..."
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
                        <div className="col-md-4">
                            <select
                                className="form-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="all">Toutes les catégories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name_fr || cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 text-end">
                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                {filteredPosts.length} résultat{filteredPosts.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des articles */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0" style={{ tableLayout: 'fixed' }}>
                            <thead className="bg-light">
                                <tr>
                                    <th style={{ width: '40%' }}>Titre</th>
                                    <th style={{ width: '15%' }}>Catégorie</th>
                                    <th style={{ width: '10%' }}>Statut</th>
                                    <th style={{ width: '15%' }}>Date</th>
                                    <th className="text-end" style={{ width: '20%' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPosts.length > 0 ? (
                                    paginatedPosts.map((post) => (
                                        <tr key={post.id} className="align-middle">
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {post.featured_image ? (
                                                        <img
                                                            src={post.featured_image}
                                                            alt=""
                                                            style={{
                                                                width: '56px',
                                                                height: '56px',
                                                                objectFit: 'cover',
                                                                borderRadius: '8px',
                                                                marginRight: '12px'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="d-flex align-items-center justify-content-center me-3"
                                                            style={{
                                                                width: '56px',
                                                                height: '56px',
                                                                borderRadius: '8px',
                                                                background: '#f0f0f0',
                                                                color: '#999'
                                                            }}
                                                        >
                                                            <i className="fas fa-image"></i>
                                                        </div>
                                                    )}
                                                    <div style={{ maxWidth: '280px', overflow: 'hidden' }}>
                                                        <h6
                                                            className="mb-1 fw-semibold"
                                                            style={{
                                                                fontSize: '0.95rem',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}
                                                            title={post.title_fr || post.title}
                                                        >
                                                            {post.title_fr || post.title}
                                                        </h6>
                                                        <code
                                                            className="text-muted"
                                                            style={{
                                                                fontSize: '0.75rem',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                display: 'block'
                                                            }}
                                                            title={post.slug}
                                                        >
                                                            {post.slug}
                                                        </code>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {post.categories && post.categories.length > 0 ? (
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {post.categories.map(cat => (
                                                            <span
                                                                key={cat.id}
                                                                className="badge"
                                                                style={{
                                                                    background: cat.color ? `${cat.color}15` : '#0d948815',
                                                                    color: cat.color || '#0d9488',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                {cat.name_fr || cat.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            background: '#6b728015',
                                                            color: '#6b7280',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        Sans catégorie
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    post.status === 'published' ? 'bg-success' :
                                                    post.status === 'draft' ? 'bg-warning text-dark' : 'bg-danger'
                                                }`}>
                                                    {post.status === 'published' ? 'Publié' :
                                                     post.status === 'draft' ? 'Brouillon' : 'Corbeille'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    <div className="text-dark">
                                                        {new Date(post.created_at).toLocaleDateString('fr-FR', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                    <small className="text-muted">
                                                        {new Date(post.created_at).toLocaleTimeString('fr-FR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </small>
                                                </div>
                                            </td>
                                            <td className="text-end">
                                                {post.status !== 'trash' ? (
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => navigate(`/posts/${post.id}`)}
                                                            title="Modifier"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className={`btn ${post.status === 'published' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                            onClick={() => handleToggleStatus(post)}
                                                            title={post.status === 'published' ? 'Dépublier' : 'Publier'}
                                                        >
                                                            <i className={`fas fa-${post.status === 'published' ? 'eye-slash' : 'eye'}`}></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(post.id)}
                                                            title="Supprimer"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-outline-success"
                                                            onClick={() => handleRestore(post.id)}
                                                            title="Restaurer"
                                                        >
                                                            <i className="fas fa-undo"></i> Restaurer
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-5">
                                            {searchQuery || categoryFilter !== 'all' ? (
                                                <>
                                                    <i className="fas fa-search fa-3x mb-3 opacity-50"></i>
                                                    <p className="mb-2">Aucun article trouvé</p>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setCategoryFilter('all');
                                                        }}
                                                    >
                                                        Réinitialiser les filtres
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-file-alt fa-3x mb-3 opacity-50"></i>
                                                    <p className="mb-2">Aucun article</p>
                                                    <Link to="/posts/new" className="btn btn-primary">
                                                        Créer un article
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
                        itemName="articles"
                        itemsPerPageOptions={[10, 25, 50, 100]}
                    />
                )}
            </div>
        </>
    );
};

export default PostsList;
