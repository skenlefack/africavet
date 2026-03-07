import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const SliderEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [slides, setSlides] = useState([]);

    const [form, setForm] = useState({
        name: '',
        location: '',
        autoplay: true,
        interval: 5000
    });

    useEffect(() => {
        if (isEditing) {
            fetchSlider();
            fetchSlides();
        } else {
            setLoading(false);
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSlider = async () => {
        const res = await api.get(`/sliders/${id}`, token);
        if (res.success && res.data) {
            const slider = res.data;
            setForm({
                name: slider.name || '',
                location: slider.location || '',
                autoplay: slider.autoplay !== false,
                interval: slider.interval || 5000
            });
        }
        setLoading(false);
    };

    const fetchSlides = async () => {
        const res = await api.get(`/sliders/${id}/slides`, token);
        if (res.success) setSlides(res.data || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            setToast({ message: 'Le nom est requis', type: 'error' });
            return;
        }

        setSaving(true);

        const res = isEditing
            ? await api.put(`/sliders/${id}`, form, token)
            : await api.post('/sliders', form, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Slider modifié' : 'Slider créé', type: 'success' });
            if (!isEditing && res.data?.id) {
                setTimeout(() => navigate(`/sliders/${res.data.id}`), 1000);
            }
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
    };

    const handleDeleteSlide = async (slideId) => {
        if (window.confirm('Supprimer ce slide ?')) {
            const res = await api.delete(`/sliders/slides/${slideId}`, token);
            if (res.success) {
                setToast({ message: 'Slide supprimé', type: 'success' });
                fetchSlides();
            }
        }
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
                            {isEditing ? 'Modifier le slider' : 'Nouveau slider'}
                        </h2>
                        <p className="text-muted mb-0">
                            {form.name || 'Créer un nouveau slider'}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/sliders" className="btn btn-outline-secondary">
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
                                    <label className="form-label">Nom du slider *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ex: Slider Accueil"
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
                                        <option value="homepage">Page d'accueil</option>
                                        <option value="header">Header</option>
                                        <option value="sidebar">Sidebar</option>
                                        <option value="footer">Footer</option>
                                    </select>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-check mb-3">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="autoplay"
                                                checked={form.autoplay}
                                                onChange={(e) => setForm({ ...form, autoplay: e.target.checked })}
                                            />
                                            <label className="form-check-label" htmlFor="autoplay">
                                                Lecture automatique
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Intervalle (ms)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={form.interval}
                                                onChange={(e) => setForm({ ...form, interval: parseInt(e.target.value) || 5000 })}
                                                min="1000"
                                                step="500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Slides */}
                        {isEditing && (
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Slides ({slides.length})</h5>
                                    <Link
                                        to={`/sliders/${id}/slides/new`}
                                        className="btn btn-primary btn-sm"
                                        style={{
                                            background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                            border: 'none'
                                        }}
                                    >
                                        <i className="fas fa-plus me-2"></i> Ajouter un slide
                                    </Link>
                                </div>
                                <div className="card-body">
                                    {slides.length > 0 ? (
                                        <div className="row g-3">
                                            {slides.map((slide, index) => (
                                                <div key={slide.id} className="col-md-4">
                                                    <div className="card h-100 border">
                                                        {slide.image ? (
                                                            <img
                                                                src={slide.image}
                                                                alt={slide.title}
                                                                className="card-img-top"
                                                                style={{ height: '120px', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '120px' }}>
                                                                <i className="fas fa-image fa-2x text-muted"></i>
                                                            </div>
                                                        )}
                                                        <div className="card-body py-2">
                                                            <span className="badge bg-secondary mb-1">#{index + 1}</span>
                                                            <h6 className="card-title small mb-0">{slide.title || 'Sans titre'}</h6>
                                                        </div>
                                                        <div className="card-footer bg-transparent py-2">
                                                            <div className="btn-group btn-group-sm w-100">
                                                                <Link
                                                                    to={`/sliders/${id}/slides/${slide.id}`}
                                                                    className="btn btn-outline-primary"
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger"
                                                                    onClick={() => handleDeleteSlide(slide.id)}
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted py-4">
                                            <i className="fas fa-images fa-3x mb-3"></i>
                                            <p>Aucun slide dans ce slider</p>
                                            <Link
                                                to={`/sliders/${id}/slides/new`}
                                                className="btn btn-outline-primary"
                                            >
                                                Ajouter un slide
                                            </Link>
                                        </div>
                                    )}
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
                                    <i className="fas fa-desktop fa-3x text-muted mb-2"></i>
                                    <p className="small text-muted mb-0">
                                        {form.location === 'homepage' && 'Affiché sur la page d\'accueil'}
                                        {form.location === 'header' && 'Affiché dans le header'}
                                        {form.location === 'sidebar' && 'Affiché dans la sidebar'}
                                        {form.location === 'footer' && 'Affiché dans le footer'}
                                        {!form.location && 'Emplacement non défini'}
                                    </p>
                                </div>
                                <hr />
                                <div className="small">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Lecture auto:</span>
                                        <span className={form.autoplay ? 'text-success' : 'text-danger'}>
                                            {form.autoplay ? 'Oui' : 'Non'}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Intervalle:</span>
                                        <span>{form.interval / 1000}s</span>
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

export default SliderEditor;
