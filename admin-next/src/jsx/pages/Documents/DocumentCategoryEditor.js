import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

// Font Awesome icons selection for categories
const FA_ICONS = [
    'fa-folder', 'fa-folder-open', 'fa-file-alt', 'fa-book', 'fa-book-open',
    'fa-gavel', 'fa-heartbeat', 'fa-pills', 'fa-syringe', 'fa-utensils',
    'fa-cow', 'fa-paw', 'fa-graduation-cap', 'fa-building', 'fa-globe',
    'fa-globe-africa', 'fa-toolbox', 'fa-chart-bar', 'fa-eye', 'fa-virus',
    'fa-ambulance', 'fa-list', 'fa-shield-alt', 'fa-microscope', 'fa-flask',
    'fa-clipboard-check', 'fa-hand-sparkles', 'fa-certificate', 'fa-seedling',
    'fa-dna', 'fa-heart', 'fa-leaf', 'fa-exchange-alt', 'fa-balance-scale',
    'fa-chalkboard', 'fa-newspaper', 'fa-book-reader', 'fa-search',
    'fa-file-medical', 'fa-star', 'fa-map', 'fa-globe-americas', 'fa-tree',
    'fa-users', 'fa-file-invoice', 'fa-tasks', 'fa-stethoscope', 'fa-bullhorn',
    'fa-landmark', 'fa-handshake', 'fa-file-pdf', 'fa-file-word', 'fa-file-excel'
];

const DocumentCategoryEditor = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const parentFromUrl = searchParams.get('parent');

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [toast, setToast] = useState(null);
    const [showIconPicker, setShowIconPicker] = useState(false);

    const [formData, setFormData] = useState({
        name_fr: '',
        name_en: '',
        description_fr: '',
        description_en: '',
        parent_id: parentFromUrl || '',
        icon: 'fa-folder',
        color: '#1B5E20',
        sort_order: 0,
        is_active: true
    });

    useEffect(() => {
        fetchCategories();
        if (isEdit) fetchCategory();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCategory = async () => {
        const res = await api.get(`/documents/admin/categories`, token);
        if (res.success) {
            const cat = (res.data || []).find(c => c.id === parseInt(id));
            if (cat) {
                setFormData({
                    name_fr: cat.name_fr || '',
                    name_en: cat.name_en || '',
                    description_fr: cat.description_fr || '',
                    description_en: cat.description_en || '',
                    parent_id: cat.parent_id || '',
                    icon: cat.icon || 'fa-folder',
                    color: cat.color || '#1B5E20',
                    sort_order: cat.sort_order || 0,
                    is_active: cat.is_active === 1
                });
            }
        }
        setLoading(false);
    };

    const fetchCategories = async () => {
        const res = await api.get('/documents/admin/categories', token);
        if (res.success) setCategories(res.data || []);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name_fr || !formData.name_en) {
            setToast({ message: 'Les noms FR et EN sont requis', type: 'error' });
            return;
        }

        setSaving(true);

        const payload = {
            ...formData,
            parent_id: formData.parent_id || null,
            sort_order: parseInt(formData.sort_order) || 0
        };

        const res = isEdit
            ? await api.put(`/documents/admin/categories/${id}`, payload, token)
            : await api.post('/documents/admin/categories', payload, token);

        if (res.success) {
            setToast({ message: isEdit ? 'Categorie mise a jour' : 'Categorie creee', type: 'success' });
            setTimeout(() => navigate('/documents/categories'), 1000);
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }

        setSaving(false);
    };

    // Filter out current category and its children from parent options
    const availableParents = categories.filter(c => {
        if (!c.parent_id && c.id !== parseInt(id)) return true;
        return false;
    });

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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>
                        {isEdit ? 'Modifier la categorie' : 'Nouvelle categorie'}
                    </h2>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link to="/documents/categories">Categories</Link></li>
                            <li className="breadcrumb-item active">
                                {isEdit ? formData.name_fr || 'Modifier' : 'Nouvelle'}
                            </li>
                        </ol>
                    </nav>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/documents/categories')}>
                        <i className="fas fa-times me-2"></i> Annuler
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={saving}
                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}
                    >
                        {saving ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span> Enregistrement...</>
                        ) : (
                            <><i className="fas fa-save me-2"></i> {isEdit ? 'Mettre a jour' : 'Creer'}</>
                        )}
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    {/* Names */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-tag me-2"></i> Noms</h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Nom (Francais) *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name_fr"
                                        value={formData.name_fr}
                                        onChange={handleChange}
                                        placeholder="Nom en francais"
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Nom (Anglais) *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name_en"
                                        value={formData.name_en}
                                        onChange={handleChange}
                                        placeholder="Name in English"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-align-left me-2"></i> Descriptions</h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Description (Francais)</label>
                                    <textarea
                                        className="form-control"
                                        name="description_fr"
                                        value={formData.description_fr}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Description optionnelle..."
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Description (Anglais)</label>
                                    <textarea
                                        className="form-control"
                                        name="description_en"
                                        value={formData.description_en}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Optional description..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Parent category */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-sitemap me-2"></i> Categorie parente</h6>
                        </div>
                        <div className="card-body">
                            <select
                                className="form-select"
                                name="parent_id"
                                value={formData.parent_id}
                                onChange={handleChange}
                            >
                                <option value="">Aucune (categorie racine)</option>
                                {availableParents.map(c => (
                                    <option key={c.id} value={c.id}>{c.name_fr}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Icon picker */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-icons me-2"></i> Icone</h6>
                        </div>
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '48px', height: '48px',
                                        background: formData.color,
                                        color: '#fff', fontSize: '1.2rem'
                                    }}
                                >
                                    <i className={`fas ${formData.icon}`}></i>
                                </div>
                                <div>
                                    <code>{formData.icon}</code>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary d-block mt-1"
                                        onClick={() => setShowIconPicker(!showIconPicker)}
                                    >
                                        {showIconPicker ? 'Fermer' : 'Choisir'}
                                    </button>
                                </div>
                            </div>
                            {showIconPicker && (
                                <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <div className="row g-1">
                                        {FA_ICONS.map(icon => (
                                            <div key={icon} className="col-2 text-center">
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm w-100 ${formData.icon === icon ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    onClick={() => { setFormData(prev => ({ ...prev, icon })); setShowIconPicker(false); }}
                                                    title={icon}
                                                    style={{ padding: '6px 2px' }}
                                                >
                                                    <i className={`fas ${icon}`}></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Color */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-palette me-2"></i> Couleur</h6>
                        </div>
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-3">
                                <input
                                    type="color"
                                    className="form-control form-control-color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    style={{ width: '50px', height: '40px' }}
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    placeholder="#1B5E20"
                                    style={{ maxWidth: '120px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sort order & Active */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-cog me-2"></i> Options</h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Ordre de tri</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="sort_order"
                                    value={formData.sort_order}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                            <div className="form-check form-switch">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    id="is_active"
                                />
                                <label className="form-check-label" htmlFor="is_active">
                                    Categorie active
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="card">
                        <div className="card-header bg-white">
                            <h6 className="mb-0">Apercu</h6>
                        </div>
                        <div className="card-body text-center">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                                style={{
                                    width: '64px', height: '64px',
                                    background: formData.color,
                                    color: '#fff', fontSize: '1.5rem'
                                }}
                            >
                                <i className={`fas ${formData.icon}`}></i>
                            </div>
                            <h6 className="mb-0">{formData.name_fr || 'Nom de la categorie'}</h6>
                            <small className="text-muted">{formData.name_en || 'Category name'}</small>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DocumentCategoryEditor;
