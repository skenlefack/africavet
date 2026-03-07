import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const PlacementEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        name_fr: '',
        slug: '',
        location: '',
        width: 300,
        height: 250,
        max_ads: 1,
        is_active: true
    });

    useEffect(() => {
        if (isEdit) {
            fetchPlacement();
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPlacement = async () => {
        const res = await api.get(`/ads/placements/${id}`, token);
        if (res.success) {
            setFormData({
                name: res.data.name || '',
                name_fr: res.data.name_fr || '',
                slug: res.data.slug || '',
                location: res.data.location || '',
                width: res.data.width || 300,
                height: res.data.height || 250,
                max_ads: res.data.max_ads || 1,
                is_active: res.data.is_active
            });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
        }));
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name: name,
            slug: prev.slug || generateSlug(name)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.slug) {
            setToast({ message: 'Nom et slug requis', type: 'error' });
            return;
        }

        setSaving(true);

        const res = isEdit
            ? await api.put(`/ads/placements/${id}`, formData, token)
            : await api.post('/ads/placements', formData, token);

        if (res.success) {
            setToast({ message: isEdit ? 'Emplacement mis a jour' : 'Emplacement cree', type: 'success' });
            setTimeout(() => navigate('/ads/placements'), 1000);
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }

        setSaving(false);
    };

    // Preset sizes
    const presets = [
        { name: 'Medium Rectangle', width: 300, height: 250 },
        { name: 'Large Rectangle', width: 336, height: 280 },
        { name: 'Leaderboard', width: 728, height: 90 },
        { name: 'Mobile Banner', width: 320, height: 50 },
        { name: 'Wide Skyscraper', width: 160, height: 600 },
        { name: 'Half Page', width: 300, height: 600 },
        { name: 'Billboard', width: 970, height: 250 },
        { name: 'Header Banner', width: 670, height: 85 }
    ];

    const applyPreset = (preset) => {
        setFormData(prev => ({
            ...prev,
            width: preset.width,
            height: preset.height
        }));
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
                        {isEdit ? 'Modifier l\'emplacement' : 'Nouvel emplacement'}
                    </h2>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link to="/ads/placements">Emplacements</Link>
                            </li>
                            <li className="breadcrumb-item active">
                                {isEdit ? formData.name : 'Nouveau'}
                            </li>
                        </ol>
                    </nav>
                </div>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/ads/placements')}
                    >
                        <i className="fas fa-times me-2"></i> Annuler
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmit}
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
                                {isEdit ? 'Mettre a jour' : 'Creer'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Nom (EN) *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleNameChange}
                                            placeholder="Header Banner"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Nom (FR)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name_fr"
                                            value={formData.name_fr}
                                            onChange={handleChange}
                                            placeholder="Banniere Header"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Slug *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            placeholder="header-banner"
                                            required
                                        />
                                        <small className="text-muted">Identifiant unique utilise dans le code</small>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Statut</label>
                                        <div className="form-check form-switch mt-2">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                name="is_active"
                                                checked={formData.is_active}
                                                onChange={handleChange}
                                                id="isActive"
                                            />
                                            <label className="form-check-label" htmlFor="isActive">
                                                {formData.is_active ? 'Actif' : 'Inactif'}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Description / Position</label>
                                        <textarea
                                            className="form-control"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            rows="2"
                                            placeholder="Ex: Zone logo / en-tete du site"
                                        />
                                    </div>

                                    <div className="col-12">
                                        <hr className="my-2" />
                                        <label className="form-label">Dimensions</label>
                                    </div>

                                    <div className="col-12">
                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            {presets.map(preset => (
                                                <button
                                                    key={preset.name}
                                                    type="button"
                                                    className={`btn btn-sm ${formData.width === preset.width && formData.height === preset.height ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    onClick={() => applyPreset(preset)}
                                                >
                                                    {preset.name} ({preset.width}x{preset.height})
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">Largeur (px)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="width"
                                            value={formData.width}
                                            onChange={handleChange}
                                            min="1"
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Hauteur (px)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="height"
                                            value={formData.height}
                                            onChange={handleChange}
                                            min="1"
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Max. publicites</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="max_ads"
                                            value={formData.max_ads}
                                            onChange={handleChange}
                                            min="1"
                                            max="10"
                                        />
                                        <small className="text-muted">Rotation si &gt; 1</small>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Preview Sidebar */}
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header bg-white">
                            <h6 className="mb-0">Apercu des dimensions</h6>
                        </div>
                        <div className="card-body">
                            <div
                                className="border rounded p-2 bg-light d-flex align-items-center justify-content-center"
                                style={{
                                    width: '100%',
                                    minHeight: '150px',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    className="bg-primary d-flex align-items-center justify-content-center text-white"
                                    style={{
                                        width: `${Math.min(100, (formData.width / 728) * 100)}%`,
                                        height: `${Math.min(150, formData.height * (150 / 600))}px`,
                                        minWidth: '50px',
                                        minHeight: '30px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {formData.width}x{formData.height}
                                </div>
                            </div>
                            <p className="text-muted text-center small mt-2">
                                Representation proportionnelle
                            </p>
                        </div>
                    </div>

                    {isEdit && (
                        <div className="card mt-4">
                            <div className="card-header bg-white">
                                <h6 className="mb-0">Integration</h6>
                            </div>
                            <div className="card-body">
                                <p className="small text-muted mb-2">Utilisez ce slug dans le composant AdBanner:</p>
                                <pre className="bg-light p-2 rounded small mb-0">
                                    <code>{`<AdBanner placement="${formData.slug}" />`}</code>
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PlacementEditor;
