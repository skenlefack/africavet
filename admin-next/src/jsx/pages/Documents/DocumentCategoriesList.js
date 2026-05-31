import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const DocumentCategoriesList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCategories = async () => {
        const res = await api.get('/documents/admin/categories', token);
        if (res.success) setCategories(res.data || []);
        setLoading(false);
    };

    const handleToggleActive = async (id) => {
        const res = await api.put(`/documents/admin/categories/${id}/toggle`, {}, token);
        if (res.success) {
            setToast({ message: res.message, type: 'success' });
            fetchCategories();
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette categorie ?')) {
            const res = await api.delete(`/documents/admin/categories/${id}`, token);
            if (res.success) {
                setToast({ message: 'Categorie supprimee', type: 'success' });
                fetchCategories();
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    const handleMoveUp = async (cat, siblings) => {
        const idx = siblings.findIndex(c => c.id === cat.id);
        if (idx <= 0) return;
        const orders = siblings.map((c, i) => ({ id: c.id, sort_order: i }));
        // Swap
        const temp = orders[idx].sort_order;
        orders[idx].sort_order = orders[idx - 1].sort_order;
        orders[idx - 1].sort_order = temp;

        await api.put('/documents/admin/categories/reorder', { orders }, token);
        fetchCategories();
    };

    const handleMoveDown = async (cat, siblings) => {
        const idx = siblings.findIndex(c => c.id === cat.id);
        if (idx >= siblings.length - 1) return;
        const orders = siblings.map((c, i) => ({ id: c.id, sort_order: i }));
        const temp = orders[idx].sort_order;
        orders[idx].sort_order = orders[idx + 1].sort_order;
        orders[idx + 1].sort_order = temp;

        await api.put('/documents/admin/categories/reorder', { orders }, token);
        fetchCategories();
    };

    // Build tree
    const roots = categories.filter(c => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order);
    const getChildren = (parentId) => categories.filter(c => c.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order);

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
            {/* Toast */}
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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Categories de documents</h2>
                    <p className="text-muted mb-0">{categories.length} categories au total</p>
                </div>
                <Link to="/documents/categories/new" className="btn btn-primary" style={{
                    background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none'
                }}>
                    <i className="fas fa-plus me-2"></i> Nouvelle categorie racine
                </Link>
            </div>

            {/* Category tree */}
            <div className="card">
                <div className="card-body p-0">
                    {roots.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th style={{ width: '40%' }}>Categorie</th>
                                        <th>Slug</th>
                                        <th className="text-center">Documents</th>
                                        <th className="text-center">Statut</th>
                                        <th className="text-center">Ordre</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roots.map((root, rootIdx) => {
                                        const children = getChildren(root.id);
                                        return (
                                            <React.Fragment key={root.id}>
                                                {/* Parent row */}
                                                <tr className="align-middle" style={{ background: '#fafafa' }}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div
                                                                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                                style={{
                                                                    width: '36px', height: '36px',
                                                                    background: root.color || '#354e84',
                                                                    color: '#fff', fontSize: '0.85rem'
                                                                }}
                                                            >
                                                                <i className={`fas ${root.icon || 'fa-folder'}`}></i>
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0 fw-bold" style={{ fontSize: '0.95rem' }}>
                                                                    {root.name_fr}
                                                                </h6>
                                                                <small className="text-muted">{root.name_en}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-muted" style={{ fontSize: '0.85rem' }}>{root.slug}</td>
                                                    <td className="text-center">
                                                        <span className="badge bg-primary">{root.document_count || 0}</span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span
                                                            className={`badge ${root.is_active ? 'bg-success' : 'bg-secondary'}`}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleToggleActive(root.id)}
                                                        >
                                                            {root.is_active ? 'Actif' : 'Inactif'}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="btn-group btn-group-sm">
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => handleMoveUp(root, roots)}
                                                                disabled={rootIdx === 0}
                                                                title="Monter"
                                                            >
                                                                <i className="fas fa-arrow-up"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => handleMoveDown(root, roots)}
                                                                disabled={rootIdx === roots.length - 1}
                                                                title="Descendre"
                                                            >
                                                                <i className="fas fa-arrow-down"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="text-end">
                                                        <div className="btn-group btn-group-sm">
                                                            <button
                                                                className="btn btn-outline-primary"
                                                                onClick={() => navigate(`/documents/categories/edit/${root.id}`)}
                                                                title="Modifier"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-success"
                                                                onClick={() => navigate(`/documents/categories/new?parent=${root.id}`)}
                                                                title="Ajouter sous-categorie"
                                                            >
                                                                <i className="fas fa-plus"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(root.id)}
                                                                title="Supprimer"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Children rows */}
                                                {children.map((child, childIdx) => (
                                                    <tr key={child.id} className="align-middle">
                                                        <td>
                                                            <div className="d-flex align-items-center" style={{ paddingLeft: '40px' }}>
                                                                <i className="fas fa-level-up-alt fa-rotate-90 text-muted me-2" style={{ fontSize: '0.7rem' }}></i>
                                                                <div
                                                                    className="rounded d-flex align-items-center justify-content-center me-2"
                                                                    style={{
                                                                        width: '28px', height: '28px',
                                                                        background: (child.color || root.color || '#354e84') + '20',
                                                                        color: child.color || root.color || '#354e84',
                                                                        fontSize: '0.75rem'
                                                                    }}
                                                                >
                                                                    <i className={`fas ${child.icon || 'fa-folder'}`}></i>
                                                                </div>
                                                                <div>
                                                                    <span style={{ fontSize: '0.9rem' }}>{child.name_fr}</span>
                                                                    <small className="d-block text-muted" style={{ fontSize: '0.75rem' }}>{child.name_en}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-muted" style={{ fontSize: '0.8rem' }}>{child.slug}</td>
                                                        <td className="text-center">
                                                            <span className="badge bg-light text-dark">{child.document_count || 0}</span>
                                                        </td>
                                                        <td className="text-center">
                                                            <span
                                                                className={`badge ${child.is_active ? 'bg-success' : 'bg-secondary'}`}
                                                                style={{ cursor: 'pointer', fontSize: '0.7rem' }}
                                                                onClick={() => handleToggleActive(child.id)}
                                                            >
                                                                {child.is_active ? 'Actif' : 'Inactif'}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="btn-group btn-group-sm">
                                                                <button
                                                                    className="btn btn-outline-secondary btn-sm"
                                                                    onClick={() => handleMoveUp(child, children)}
                                                                    disabled={childIdx === 0}
                                                                    style={{ padding: '1px 6px', fontSize: '0.7rem' }}
                                                                >
                                                                    <i className="fas fa-arrow-up"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-outline-secondary btn-sm"
                                                                    onClick={() => handleMoveDown(child, children)}
                                                                    disabled={childIdx === children.length - 1}
                                                                    style={{ padding: '1px 6px', fontSize: '0.7rem' }}
                                                                >
                                                                    <i className="fas fa-arrow-down"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="text-end">
                                                            <div className="btn-group btn-group-sm">
                                                                <button
                                                                    className="btn btn-outline-primary"
                                                                    onClick={() => navigate(`/documents/categories/edit/${child.id}`)}
                                                                    title="Modifier"
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-outline-danger"
                                                                    onClick={() => handleDelete(child.id)}
                                                                    title="Supprimer"
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <i className="fas fa-folder-open fa-3x mb-3 opacity-50"></i>
                            <p className="text-muted mb-2">Aucune categorie</p>
                            <Link to="/documents/categories/new" className="btn btn-primary">
                                Creer la premiere categorie
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DocumentCategoriesList;
