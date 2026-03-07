import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const MenuEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [menuItems, setMenuItems] = useState([]);

    const [form, setForm] = useState({
        name: '',
        location: ''
    });

    useEffect(() => {
        if (isEditing) {
            fetchMenu();
            fetchMenuItems();
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchMenu = async () => {
        const res = await api.get(`/menus/${id}`, token);
        if (res.success && res.data) {
            setForm({
                name: res.data.name || '',
                location: res.data.location || ''
            });
        }
        setLoading(false);
    };

    const fetchMenuItems = async () => {
        const res = await api.get(`/menus/${id}/items`, token);
        if (res.success) setMenuItems(res.data || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            setToast({ message: 'Le nom est requis', type: 'error' });
            return;
        }

        setSaving(true);

        const res = isEditing
            ? await api.put(`/menus/${id}`, form, token)
            : await api.post('/menus', form, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Menu modifié' : 'Menu créé', type: 'success' });
            if (!isEditing && res.data?.id) {
                setTimeout(() => navigate(`/menus/${res.data.id}`), 1000);
            }
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Supprimer cet élément ?')) {
            const res = await api.delete(`/menus/items/${itemId}`, token);
            if (res.success) {
                setToast({ message: 'Élément supprimé', type: 'success' });
                fetchMenuItems();
            }
        }
    };

    const moveItem = async (item, direction) => {
        const currentIndex = menuItems.findIndex(i => i.id === item.id);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= menuItems.length) return;

        const newOrder = menuItems.map((i, idx) => {
            if (idx === currentIndex) return { id: i.id, sort_order: newIndex };
            if (idx === newIndex) return { id: i.id, sort_order: currentIndex };
            return { id: i.id, sort_order: idx };
        });

        const res = await api.put(`/menus/${id}/reorder`, { items: newOrder }, token);
        if (res.success) {
            fetchMenuItems();
        }
    };

    const buildTree = (items, parentId = null) => {
        return items
            .filter(item => item.parent_id === parentId)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(item => ({
                ...item,
                children: buildTree(items, item.id)
            }));
    };

    const renderMenuItem = (item, level = 0) => (
        <React.Fragment key={item.id}>
            <tr>
                <td style={{ paddingLeft: `${level * 25 + 15}px` }}>
                    {level > 0 && <span className="text-muted me-2">└</span>}
                    <i className="fas fa-grip-vertical text-muted me-2" style={{ cursor: 'grab' }}></i>
                    {item.title || item.label_fr || item.label}
                </td>
                <td>
                    <code className="small">{item.url || (item.type === 'page' ? '/page/' + item.page_id : '#')}</code>
                </td>
                <td>
                    <span className={`badge ${
                        item.type === 'page' ? 'bg-primary' :
                        item.type === 'category' ? 'bg-info' : 'bg-secondary'
                    }`}>
                        {item.type === 'page' ? 'Page' : item.type === 'category' ? 'Catégorie' : 'Personnalisé'}
                    </span>
                </td>
                <td className="text-end">
                    <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary" onClick={() => moveItem(item, 'up')} disabled={item.sort_order === 0}>
                            <i className="fas fa-arrow-up"></i>
                        </button>
                        <button className="btn btn-outline-secondary" onClick={() => moveItem(item, 'down')}>
                            <i className="fas fa-arrow-down"></i>
                        </button>
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/menus/${id}/items/${item.id}`)}
                        >
                            <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => handleDeleteItem(item.id)}>
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            {item.children?.map(child => renderMenuItem(child, level + 1))}
        </React.Fragment>
    );

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    const menuTree = buildTree(menuItems);

    return (
        <>
            {toast && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                     style={{ top: '20px', right: '20px', zIndex: 9999 }}>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1" style={{ fontWeight: '700' }}>
                            {isEditing ? 'Modifier le menu' : 'Nouveau menu'}
                        </h2>
                        <p className="text-muted mb-0">
                            {form.name || 'Créer un nouveau menu'}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/menus" className="btn btn-outline-secondary">
                            <i className="fas fa-arrow-left me-2"></i> Retour
                        </Link>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                            style={{
                                background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                border: 'none'
                            }}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save me-2"></i>
                                    {isEditing ? 'Enregistrer' : 'Créer'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        {/* Informations */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">Informations</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Nom du menu *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ex: Menu Principal"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Emplacement</label>
                                    <select
                                        className="form-select"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    >
                                        <option value="">-- Sélectionner --</option>
                                        <option value="header">Header (Menu principal)</option>
                                        <option value="footer">Footer</option>
                                        <option value="sidebar">Sidebar</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        {isEditing && (
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Éléments du menu ({menuItems.length})</h5>
                                    <Link
                                        to={`/menus/${id}/items/new`}
                                        className="btn btn-primary btn-sm"
                                        style={{
                                            background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                            border: 'none'
                                        }}
                                    >
                                        <i className="fas fa-plus me-2"></i> Ajouter un élément
                                    </Link>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Titre</th>
                                                    <th>URL</th>
                                                    <th>Type</th>
                                                    <th className="text-end">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {menuTree.length > 0 ? (
                                                    menuTree.map(item => renderMenuItem(item))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="text-center text-muted py-5">
                                                            <i className="fas fa-list fa-3x mb-3"></i>
                                                            <p>Aucun élément dans ce menu</p>
                                                            <Link
                                                                to={`/menus/${id}/items/new`}
                                                                className="btn btn-outline-primary"
                                                            >
                                                                Ajouter un élément
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        <div className="card">
                            <div className="card-header py-2">
                                <h6 className="mb-0">Aperçu</h6>
                            </div>
                            <div className="card-body">
                                <div className="bg-light rounded p-3 text-center">
                                    <i className="fas fa-bars fa-3x text-muted mb-2"></i>
                                    <p className="small text-muted mb-0">
                                        {form.location === 'header' && 'Affiché dans le header'}
                                        {form.location === 'footer' && 'Affiché dans le footer'}
                                        {form.location === 'sidebar' && 'Affiché dans la sidebar'}
                                        {!form.location && 'Emplacement non défini'}
                                    </p>
                                </div>
                                <hr />
                                <div className="small">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Éléments:</span>
                                        <span>{menuItems.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default MenuEditor;
