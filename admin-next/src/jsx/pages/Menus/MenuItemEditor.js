import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const MenuItemEditor = () => {
    const { menuId, itemId } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!itemId;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [menu, setMenu] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [pages, setPages] = useState([]);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        title: '',
        label_fr: '',
        label_en: '',
        url: '',
        type: 'custom',
        page_id: '',
        category_id: '',
        parent_id: '',
        sort_order: 0,
        target: '_self'
    });

    useEffect(() => {
        fetchMenu();
        fetchMenuItems();
        fetchPages();
        fetchCategories();
        if (isEditing) {
            fetchItem();
        } else {
            setLoading(false);
        }
    }, [menuId, itemId]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchMenu = async () => {
        const res = await api.get(`/menus/${menuId}`, token);
        if (res.success) setMenu(res.data);
    };

    const fetchMenuItems = async () => {
        const res = await api.get(`/menus/${menuId}/items`, token);
        if (res.success) setMenuItems(res.data || []);
    };

    const fetchItem = async () => {
        const res = await api.get(`/menus/items/${itemId}`, token);
        if (res.success && res.data) {
            const item = res.data;
            setForm({
                title: item.title || item.label_fr || item.label || '',
                label_fr: item.label_fr || item.title || '',
                label_en: item.label_en || '',
                url: item.url || '',
                type: item.type || 'custom',
                page_id: item.page_id || '',
                category_id: item.category_id || '',
                parent_id: item.parent_id || '',
                sort_order: item.sort_order || 0,
                target: item.target || '_self'
            });
        }
        setLoading(false);
    };

    const fetchPages = async () => {
        const res = await api.get('/pages', token);
        if (res.success) setPages(res.data || []);
    };

    const fetchCategories = async () => {
        const res = await api.get('/categories', token);
        if (res.success) setCategories(res.data || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            setToast({ message: 'Le titre est requis', type: 'error' });
            return;
        }

        setSaving(true);

        // Prepare data with correct field names for backend
        const data = {
            menu_id: menuId,
            title: form.title,
            label: form.title,
            label_fr: form.label_fr || form.title,
            label_en: form.label_en || form.title,
            url: form.url,
            type: form.type,
            page_id: form.page_id || null,
            category_id: form.category_id || null,
            parent_id: form.parent_id || null,
            sort_order: form.sort_order,
            target: form.target || '_self'
        };

        const res = isEditing
            ? await api.put(`/menus/items/${itemId}`, data, token)
            : await api.post(`/menus/${menuId}/items`, data, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Élément modifié' : 'Élément ajouté', type: 'success' });
            setTimeout(() => navigate(`/menus/${menuId}`), 1000);
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
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

            <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1" style={{ fontWeight: '700' }}>
                            {isEditing ? 'Modifier l\'élément' : 'Nouvel élément'}
                        </h2>
                        <p className="text-muted mb-0">
                            Menu: {menu?.name || 'Chargement...'}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to={`/menus/${menuId}`} className="btn btn-outline-secondary">
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
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Informations de l'élément</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Type</label>
                                    <select
                                        className="form-select"
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    >
                                        <option value="custom">Lien personnalisé</option>
                                        <option value="page">Page</option>
                                        <option value="category">Catégorie</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Titre *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="Titre de l'élément"
                                        required
                                    />
                                </div>

                                {form.type === 'custom' && (
                                    <div className="mb-3">
                                        <label className="form-label">URL</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.url}
                                            onChange={(e) => setForm({ ...form, url: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                )}

                                {form.type === 'page' && (
                                    <div className="mb-3">
                                        <label className="form-label">Page</label>
                                        <select
                                            className="form-select"
                                            value={form.page_id}
                                            onChange={(e) => setForm({ ...form, page_id: e.target.value })}
                                        >
                                            <option value="">-- Sélectionner une page --</option>
                                            {pages.map(p => (
                                                <option key={p.id} value={p.id}>{p.title_fr || p.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {form.type === 'category' && (
                                    <div className="mb-3">
                                        <label className="form-label">Catégorie</label>
                                        <select
                                            className="form-select"
                                            value={form.category_id}
                                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                        >
                                            <option value="">-- Sélectionner une catégorie --</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name_fr || c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label">Élément parent</label>
                                    <select
                                        className="form-select"
                                        value={form.parent_id}
                                        onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                                    >
                                        <option value="">-- Aucun (niveau racine) --</option>
                                        {menuItems.filter(i => i.id !== parseInt(itemId)).map(i => (
                                            <option key={i.id} value={i.id}>{i.title}</option>
                                        ))}
                                    </select>
                                    <small className="text-muted">Sélectionnez un parent pour créer un sous-menu</small>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Ordre d'affichage</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.sort_order}
                                        onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                        min="0"
                                        style={{ maxWidth: '100px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        <div className="card">
                            <div className="card-header py-2">
                                <h6 className="mb-0">Aperçu</h6>
                            </div>
                            <div className="card-body">
                                <div className="bg-light rounded p-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <i className={`fas fa-${
                                            form.type === 'page' ? 'file' :
                                            form.type === 'category' ? 'folder' : 'link'
                                        } me-2 text-primary`}></i>
                                        <strong>{form.title || 'Titre de l\'élément'}</strong>
                                    </div>
                                    <small className="text-muted d-block">
                                        {form.type === 'custom' && (form.url || 'URL personnalisée')}
                                        {form.type === 'page' && 'Lien vers une page'}
                                        {form.type === 'category' && 'Lien vers une catégorie'}
                                    </small>
                                </div>
                                <hr />
                                <div className="small">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Type:</span>
                                        <span className={`badge ${
                                            form.type === 'page' ? 'bg-primary' :
                                            form.type === 'category' ? 'bg-info' : 'bg-secondary'
                                        }`}>
                                            {form.type === 'page' ? 'Page' : form.type === 'category' ? 'Catégorie' : 'Personnalisé'}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Position:</span>
                                        <span>{form.parent_id ? 'Sous-menu' : 'Niveau racine'}</span>
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

export default MenuItemEditor;
