import React, { useState, useEffect } from 'react';
import { api, getToken } from '../../../services/api';

const SettingsPage = () => {
    const token = getToken();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('general');

    const [settings, setSettings] = useState({
        // General
        site_name: '',
        site_description: '',
        site_url: '',
        admin_email: '',
        // SEO
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        // Social
        facebook_url: '',
        twitter_url: '',
        linkedin_url: '',
        youtube_url: '',
        instagram_url: '',
        // Contact
        contact_email: '',
        contact_phone: '',
        contact_address: '',
        // Other
        google_analytics_id: '',
        maintenance_mode: false
    });

    useEffect(() => {
        fetchSettings();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSettings = async () => {
        const res = await api.get('/settings', token);
        if (res.success && res.data) {
            setSettings(prev => ({ ...prev, ...res.data }));
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const res = await api.put('/settings', settings, token);
        if (res.success) {
            setToast({ message: 'Paramètres enregistrés', type: 'success' });
        } else {
            setToast({ message: res.message || 'Erreur lors de la sauvegarde', type: 'error' });
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

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Paramètres</h2>
                    <p className="text-muted mb-0">Configuration générale du site</p>
                </div>
            </div>

            <div className="row">
                {/* Sidebar */}
                <div className="col-md-3">
                    <div className="card">
                        <div className="list-group list-group-flush">
                            <button
                                className={`list-group-item list-group-item-action ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                <i className="fas fa-cog me-2"></i> Général
                            </button>
                            <button
                                className={`list-group-item list-group-item-action ${activeTab === 'seo' ? 'active' : ''}`}
                                onClick={() => setActiveTab('seo')}
                            >
                                <i className="fas fa-search me-2"></i> SEO
                            </button>
                            <button
                                className={`list-group-item list-group-item-action ${activeTab === 'social' ? 'active' : ''}`}
                                onClick={() => setActiveTab('social')}
                            >
                                <i className="fas fa-share-alt me-2"></i> Réseaux sociaux
                            </button>
                            <button
                                className={`list-group-item list-group-item-action ${activeTab === 'contact' ? 'active' : ''}`}
                                onClick={() => setActiveTab('contact')}
                            >
                                <i className="fas fa-envelope me-2"></i> Contact
                            </button>
                            <button
                                className={`list-group-item list-group-item-action ${activeTab === 'advanced' ? 'active' : ''}`}
                                onClick={() => setActiveTab('advanced')}
                            >
                                <i className="fas fa-tools me-2"></i> Avancé
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="col-md-9">
                    <form onSubmit={handleSubmit}>
                        {/* General */}
                        {activeTab === 'general' && (
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">Paramètres généraux</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Nom du site</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="site_name"
                                            value={settings.site_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description du site</label>
                                        <textarea
                                            className="form-control"
                                            name="site_description"
                                            value={settings.site_description}
                                            onChange={handleChange}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">URL du site</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            name="site_url"
                                            value={settings.site_url}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email administrateur</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="admin_email"
                                            value={settings.admin_email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SEO */}
                        {activeTab === 'seo' && (
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">SEO & Référencement</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Meta Title par défaut</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="meta_title"
                                            value={settings.meta_title}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Meta Description par défaut</label>
                                        <textarea
                                            className="form-control"
                                            name="meta_description"
                                            value={settings.meta_description}
                                            onChange={handleChange}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Meta Keywords</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="meta_keywords"
                                            value={settings.meta_keywords}
                                            onChange={handleChange}
                                            placeholder="mot1, mot2, mot3"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Social */}
                        {activeTab === 'social' && (
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">Réseaux sociaux</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label"><i className="fab fa-facebook me-2"></i>Facebook</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            name="facebook_url"
                                            value={settings.facebook_url}
                                            onChange={handleChange}
                                            placeholder="https://facebook.com/..."
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label"><i className="fab fa-twitter me-2"></i>Twitter</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            name="twitter_url"
                                            value={settings.twitter_url}
                                            onChange={handleChange}
                                            placeholder="https://twitter.com/..."
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label"><i className="fab fa-linkedin me-2"></i>LinkedIn</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            name="linkedin_url"
                                            value={settings.linkedin_url}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/..."
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label"><i className="fab fa-youtube me-2"></i>YouTube</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            name="youtube_url"
                                            value={settings.youtube_url}
                                            onChange={handleChange}
                                            placeholder="https://youtube.com/..."
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label"><i className="fab fa-instagram me-2"></i>Instagram</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            name="instagram_url"
                                            value={settings.instagram_url}
                                            onChange={handleChange}
                                            placeholder="https://instagram.com/..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contact */}
                        {activeTab === 'contact' && (
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">Informations de contact</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Email de contact</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="contact_email"
                                            value={settings.contact_email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Téléphone</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="contact_phone"
                                            value={settings.contact_phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Adresse</label>
                                        <textarea
                                            className="form-control"
                                            name="contact_address"
                                            value={settings.contact_address}
                                            onChange={handleChange}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Advanced */}
                        {activeTab === 'advanced' && (
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">Paramètres avancés</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Google Analytics ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="google_analytics_id"
                                            value={settings.google_analytics_id}
                                            onChange={handleChange}
                                            placeholder="UA-XXXXXXXX-X ou G-XXXXXXXXXX"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <div className="form-check form-switch">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                name="maintenance_mode"
                                                id="maintenance_mode"
                                                checked={settings.maintenance_mode}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="maintenance_mode">
                                                Mode maintenance
                                            </label>
                                        </div>
                                        <small className="text-muted">
                                            Activer le mode maintenance rendra le site inaccessible aux visiteurs
                                        </small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-4">
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
                                        Enregistrer les paramètres
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SettingsPage;
