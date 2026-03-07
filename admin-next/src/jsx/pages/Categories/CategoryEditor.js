import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const CategoryEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        name_fr: '',
        name_en: '',
        slug: '',
        description_fr: '',
        description_en: '',
        parent_id: '',
        icon: '',
        color: '#1091FF'
    });

    // Couleurs prédéfinies pour les catégories
    const presetColors = [
        { value: '#1091FF', label: 'Bleu' },
        { value: '#00AB6C', label: 'Vert AfricaVet' },
        { value: '#8B4513', label: 'Marron' },
        { value: '#1E90FF', label: 'Bleu vif' },
        { value: '#228B22', label: 'Vert forêt' },
        { value: '#9B59B6', label: 'Violet' },
        { value: '#E74C3C', label: 'Rouge' },
        { value: '#C0392B', label: 'Rouge foncé' },
        { value: '#2ECC71', label: 'Vert émeraude' },
        { value: '#3498DB', label: 'Bleu ciel' },
        { value: '#8B5CF6', label: 'Violet clair' },
        { value: '#E67E22', label: 'Orange' },
        { value: '#E91E63', label: 'Rose' },
        { value: '#FF5722', label: 'Orange vif' },
        { value: '#FF9800', label: 'Ambre' },
        { value: '#F44336', label: 'Rouge vif' },
        { value: '#00BCD4', label: 'Cyan' },
        { value: '#607D8B', label: 'Gris bleu' },
        { value: '#9C27B0', label: 'Pourpre' },
        { value: '#4CAF50', label: 'Vert' },
    ];

    // Liste des icônes disponibles
    const availableIcons = [
        { value: 'fa-newspaper', label: 'Actualités' },
        { value: 'fa-cow', label: 'Élevage' },
        { value: 'fa-fish', label: 'Pêches' },
        { value: 'fa-paw', label: 'Faune' },
        { value: 'fa-globe', label: 'One Health' },
        { value: 'fa-heartbeat', label: 'Santé' },
        { value: 'fa-virus', label: 'Maladies' },
        { value: 'fa-capsules', label: 'Médicaments' },
        { value: 'fa-syringe', label: 'Vaccination' },
        { value: 'fa-biohazard', label: 'Danger bio' },
        { value: 'fa-shield-virus', label: 'Protection' },
        { value: 'fa-lungs-virus', label: 'Respiratoire' },
        { value: 'fa-briefcase', label: 'Emploi' },
        { value: 'fa-book', label: 'Publications' },
        { value: 'fa-video', label: 'Vidéos' },
        { value: 'fa-user-md', label: 'Vétérinaires' },
        { value: 'fa-calendar-alt', label: 'Événements' },
        { value: 'fa-chart-line', label: 'Analyses' },
        { value: 'fa-microphone', label: 'Interviews' },
        { value: 'fa-file-alt', label: 'Documents' },
        { value: 'fa-graduation-cap', label: 'Formation' },
        { value: 'fa-flask', label: 'Laboratoire' },
        { value: 'fa-microscope', label: 'Recherche' },
        { value: 'fa-leaf', label: 'Environnement' },
        { value: 'fa-tractor', label: 'Agriculture' },
    ];

    useEffect(() => {
        fetchCategories();
        if (isEditing) {
            fetchCategory();
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCategory = async () => {
        const res = await api.get(`/categories/${id}`, token);
        if (res.success && res.data) {
            const cat = res.data;
            setForm({
                name_fr: cat.name_fr || cat.name || '',
                name_en: cat.name_en || '',
                slug: cat.slug || '',
                description_fr: cat.description_fr || cat.description || '',
                description_en: cat.description_en || '',
                parent_id: cat.parent_id || '',
                icon: cat.icon || '',
                color: cat.color || '#1091FF'
            });
        }
        setLoading(false);
    };

    const fetchCategories = async () => {
        const res = await api.get('/categories', token);
        if (res.success) setCategories(res.data || []);
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'name_fr' && !isEditing) {
                updated.slug = generateSlug(value);
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name_fr.trim()) {
            setToast({ message: 'Le nom est requis', type: 'error' });
            return;
        }

        setSaving(true);

        const res = isEditing
            ? await api.put(`/categories/${id}`, form, token)
            : await api.post('/categories', form, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Catégorie modifiée' : 'Catégorie créée', type: 'success' });
            setTimeout(() => navigate('/categories'), 1000);
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
                            {isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                        </h2>
                        <p className="text-muted mb-0">
                            {form.name_fr || 'Créer une nouvelle catégorie'}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/categories" className="btn btn-outline-secondary">
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

                <div className="row" style={{ alignItems: 'stretch' }}>
                    {/* Main Content */}
                    <div className="col-lg-8 d-flex">
                        <div className="card flex-grow-1">
                            <div className="card-header">
                                <h5 className="mb-0">Informations</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Nom (Français) *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name_fr"
                                                value={form.name_fr}
                                                onChange={handleChange}
                                                placeholder="Nom de la catégorie"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Nom (English)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name_en"
                                                value={form.name_en}
                                                onChange={handleChange}
                                                placeholder="Category name"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Slug</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="slug"
                                        value={form.slug}
                                        onChange={handleChange}
                                        placeholder="categorie-slug"
                                    />
                                    <small className="text-muted">Identifiant URL unique</small>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Description (Français)</label>
                                            <textarea
                                                className="form-control"
                                                name="description_fr"
                                                value={form.description_fr}
                                                onChange={handleChange}
                                                rows={4}
                                                placeholder="Description de la catégorie..."
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Description (English)</label>
                                            <textarea
                                                className="form-control"
                                                name="description_en"
                                                value={form.description_en}
                                                onChange={handleChange}
                                                rows={4}
                                                placeholder="Category description..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4 d-flex flex-column">
                        {/* Icône */}
                        <div className="card mb-3 flex-grow-1">
                            <div className="card-header py-2">
                                <h6 className="mb-0">Icône</h6>
                            </div>
                            <div className="card-body">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '12px',
                                            background: form.icon ? (form.color || '#1091FF') : '#e9ecef',
                                            color: form.icon ? 'white' : '#6c757d',
                                            fontSize: '1.5rem'
                                        }}
                                    >
                                        <i className={`fas ${form.icon || 'fa-folder'}`}></i>
                                    </div>
                                    <div className="flex-grow-1">
                                        <select
                                            className="form-select"
                                            name="icon"
                                            value={form.icon}
                                            onChange={handleChange}
                                        >
                                            <option value="">-- Choisir une icône --</option>
                                            {availableIcons.map(icon => (
                                                <option key={icon.value} value={icon.value}>
                                                    {icon.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap gap-2">
                                    {availableIcons.map(icon => (
                                        <button
                                            key={icon.value}
                                            type="button"
                                            className={`btn btn-sm ${form.icon === icon.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setForm(prev => ({ ...prev, icon: icon.value }))}
                                            title={icon.label}
                                            style={{ width: '36px', height: '36px', padding: 0 }}
                                        >
                                            <i className={`fas ${icon.value}`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Couleur */}
                        <div className="card mb-3">
                            <div className="card-header py-2">
                                <h6 className="mb-0">Couleur du badge</h6>
                            </div>
                            <div className="card-body">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '12px',
                                            background: form.color || '#1091FF',
                                            color: 'white',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            textAlign: 'center',
                                            padding: '4px'
                                        }}
                                    >
                                        Badge
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="input-group">
                                            <input
                                                type="color"
                                                className="form-control form-control-color"
                                                name="color"
                                                value={form.color}
                                                onChange={handleChange}
                                                title="Choisir une couleur"
                                                style={{ width: '50px', padding: '3px' }}
                                            />
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="color"
                                                value={form.color}
                                                onChange={handleChange}
                                                placeholder="#1091FF"
                                                style={{ fontFamily: 'monospace' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap gap-2">
                                    {presetColors.map(color => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            className="btn btn-sm"
                                            onClick={() => setForm(prev => ({ ...prev, color: color.value }))}
                                            title={color.label}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                padding: 0,
                                                backgroundColor: color.value,
                                                border: form.color === color.value ? '3px solid #333' : '2px solid #dee2e6',
                                                borderRadius: '6px'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Hiérarchie */}
                        <div className="card">
                            <div className="card-header py-2">
                                <h6 className="mb-0">Hiérarchie</h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Catégorie parente</label>
                                    <select
                                        className="form-select"
                                        name="parent_id"
                                        value={form.parent_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- Aucune (racine) --</option>
                                        {categories
                                            .filter(c => c.id !== parseInt(id))
                                            .map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name_fr || cat.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <small className="text-muted">
                                        Sélectionnez une catégorie parente pour créer une sous-catégorie
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default CategoryEditor;
