import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const SlideEditor = () => {
    const { id: sliderId, slideId } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!slideId;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [slider, setSlider] = useState(null);

    const [form, setForm] = useState({
        title: '',
        subtitle: '',
        image: '',
        button_text: '',
        button_url: '',
        order: 0
    });

    useEffect(() => {
        fetchSlider();
        if (isEditing) {
            fetchSlide();
        } else {
            setLoading(false);
        }
    }, [sliderId, slideId]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSlider = async () => {
        const res = await api.get(`/sliders/${sliderId}`, token);
        if (res.success) setSlider(res.data);
    };

    const fetchSlide = async () => {
        const res = await api.get(`/sliders/slides/${slideId}`, token);
        if (res.success && res.data) {
            const slide = res.data;
            setForm({
                title: slide.title || '',
                subtitle: slide.subtitle || '',
                image: slide.image || '',
                button_text: slide.button_text || '',
                button_url: slide.button_url || '',
                order: slide.order || 0
            });
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const data = { ...form, slider_id: sliderId };

        const res = isEditing
            ? await api.put(`/sliders/slides/${slideId}`, data, token)
            : await api.post(`/sliders/${sliderId}/slides`, data, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Slide modifié' : 'Slide créé', type: 'success' });
            setTimeout(() => navigate(`/sliders/${sliderId}`), 1000);
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
                            {isEditing ? 'Modifier le slide' : 'Nouveau slide'}
                        </h2>
                        <p className="text-muted mb-0">
                            Slider: {slider?.name || 'Chargement...'}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to={`/sliders/${sliderId}`} className="btn btn-outline-secondary">
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
                                <h5 className="mb-0">Contenu du slide</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Titre</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="Titre du slide"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Sous-titre / Description</label>
                                    <textarea
                                        className="form-control"
                                        value={form.subtitle}
                                        onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                        rows={3}
                                        placeholder="Description ou sous-titre"
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Texte du bouton</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={form.button_text}
                                                onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                                                placeholder="Ex: En savoir plus"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">URL du bouton</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={form.button_url}
                                                onChange={(e) => setForm({ ...form, button_url: e.target.value })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Ordre d'affichage</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.order}
                                        onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                                        min="0"
                                        style={{ maxWidth: '100px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Image */}
                    <div className="col-lg-4">
                        <div className="card">
                            <div className="card-header py-2">
                                <h6 className="mb-0">Image du slide</h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">URL de l'image</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.image}
                                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                {form.image ? (
                                    <img
                                        src={form.image}
                                        alt="Preview"
                                        className="img-fluid rounded"
                                        style={{ maxHeight: '200px', objectFit: 'cover', width: '100%' }}
                                    />
                                ) : (
                                    <div
                                        className="bg-light rounded d-flex align-items-center justify-content-center"
                                        style={{ height: '150px' }}
                                    >
                                        <div className="text-center text-muted">
                                            <i className="fas fa-image fa-3x mb-2"></i>
                                            <p className="small mb-0">Aperçu de l'image</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default SlideEditor;
