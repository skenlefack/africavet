import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const CategoriesList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('flat'); // 'flat' or 'tree'
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchCategories = async () => {
        const res = await api.get('/categories', token);
        if (res.success) setCategories(res.data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette catégorie ?')) {
            const res = await api.delete(`/categories/${id}`, token);
            if (res.success) {
                setToast({ message: 'Catégorie supprimée', type: 'success' });
                fetchCategories();
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    // Filter categories
    const filteredCategories = categories.filter(cat => {
        const name = (cat.name_fr || cat.name || '').toLowerCase();
        const slug = (cat.slug || '').toLowerCase();
        const search = searchQuery.toLowerCase();
        return name.includes(search) || slug.includes(search);
    });

    // Pagination
    const totalItems = filteredCategories.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, itemsPerPage]);

    // Build tree structure
    const buildTree = (items, parentId = null) => {
        return items
            .filter(item => item.parent_id === parentId)
            .map(item => ({
                ...item,
                children: buildTree(items, item.id)
            }));
    };

    const renderCategoryRow = (category, level = 0) => {
        return (
            <React.Fragment key={category.id}>
                <tr className="align-middle">
                    <td>
                        <div className="d-flex align-items-center" style={{ paddingLeft: viewMode === 'tree' ? `${level * 24}px` : 0 }}>
                            {viewMode === 'tree' && level > 0 && (
                                <span className="text-muted me-2" style={{ fontSize: '0.75rem' }}>└</span>
                            )}
                            {category.icon && (
                                <span
                                    className="d-flex align-items-center justify-content-center me-3"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: category.color || '#7ac142',
                                        color: 'white',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <i className={`fas ${category.icon}`}></i>
                                </span>
                            )}
                            <div>
                                <span className="fw-semibold">{category.name_fr || category.name}</span>
                                {category.name_en && category.name_en !== category.name_fr && (
                                    <small className="text-muted d-block">{category.name_en}</small>
                                )}
                            </div>
                        </div>
                    </td>
                    <td>
                        <code className="bg-light px-2 py-1 rounded" style={{ fontSize: '0.8rem' }}>
                            {category.slug}
                        </code>
                    </td>
                    <td className="text-center">
                        <span className="badge rounded-pill" style={{
                            background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                            minWidth: '32px'
                        }}>
                            {category.post_count || 0}
                        </span>
                    </td>
                    <td>
                        <span className={`badge ${category.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                            {category.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                    </td>
                    <td className="text-end">
                        <div className="btn-group btn-group-sm">
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => navigate(`/categories/${category.id}`)}
                                title="Modifier"
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                            <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(category.id)}
                                title="Supprimer"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                {viewMode === 'tree' && category.children && category.children.map(child => renderCategoryRow(child, level + 1))}
            </React.Fragment>
        );
    };

    const categoryTree = buildTree(categories);
    const displayCategories = viewMode === 'tree' ? categoryTree : paginatedCategories;

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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Catégories</h2>
                    <p className="text-muted mb-0">{categories.length} catégories au total</p>
                </div>
                <Link
                    to="/categories/new"
                    className="btn btn-primary"
                    style={{
                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                        border: 'none'
                    }}
                >
                    <i className="fas fa-plus me-2"></i> Nouvelle catégorie
                </Link>
            </div>

            {/* Search and filters */}
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
                                    placeholder="Rechercher une catégorie..."
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
                        <div className="col-md-7 d-flex justify-content-end gap-2">
                            <div className="btn-group">
                                <button
                                    className={`btn btn-sm ${viewMode === 'flat' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setViewMode('flat')}
                                    title="Vue liste"
                                >
                                    <i className="fas fa-list"></i>
                                </button>
                                <button
                                    className={`btn btn-sm ${viewMode === 'tree' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setViewMode('tree')}
                                    title="Vue arborescence"
                                >
                                    <i className="fas fa-sitemap"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th style={{ minWidth: '250px' }}>Nom</th>
                                    <th>Slug</th>
                                    <th className="text-center">Articles</th>
                                    <th>Statut</th>
                                    <th className="text-end" style={{ width: '120px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayCategories.length > 0 ? (
                                    displayCategories.map(cat => renderCategoryRow(cat))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-5">
                                            {searchQuery ? (
                                                <>
                                                    <i className="fas fa-search fa-3x mb-3 opacity-50"></i>
                                                    <p className="mb-2">Aucune catégorie trouvée pour "{searchQuery}"</p>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => setSearchQuery('')}
                                                    >
                                                        Effacer la recherche
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-folder-open fa-3x mb-3 opacity-50"></i>
                                                    <p className="mb-2">Aucune catégorie</p>
                                                    <Link to="/categories/new" className="btn btn-primary">
                                                        Créer une catégorie
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

                {/* Pagination - only show in flat mode */}
                {viewMode === 'flat' && totalItems > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        itemName="catégories"
                        itemsPerPageOptions={[10, 25, 50]}
                    />
                )}

                {/* Info for tree mode */}
                {viewMode === 'tree' && categories.length > 0 && (
                    <div className="card-footer bg-light text-muted text-center py-2" style={{ fontSize: '0.875rem' }}>
                        <i className="fas fa-info-circle me-2"></i>
                        Affichage de {categories.length} catégories en mode arborescence
                    </div>
                )}
            </div>
        </>
    );
};

export default CategoriesList;
