import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const ProvidersSettings = () => {
    const token = getToken();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [toast, setToast] = useState(null);
    const [editingProvider, setEditingProvider] = useState(null);

    useEffect(() => {
        fetchProviders();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchProviders = async () => {
        const res = await api.get('/ads/providers', token);
        if (res.success) {
            // Parse config for each provider
            const parsedProviders = (res.data || []).map(p => ({
                ...p,
                config: typeof p.config === 'string' ? JSON.parse(p.config || '{}') : (p.config || {})
            }));
            setProviders(parsedProviders);
        }
        setLoading(false);
    };

    const handleToggleStatus = async (provider) => {
        setSaving(provider.id);
        const res = await api.put(`/ads/providers/${provider.id}`, {
            is_active: !provider.is_active
        }, token);

        if (res.success) {
            setToast({ message: provider.is_active ? 'Fournisseur desactive' : 'Fournisseur active', type: 'success' });
            fetchProviders();
        } else {
            setToast({ message: 'Erreur', type: 'error' });
        }
        setSaving(null);
    };

    const handleSaveConfig = async (provider, config) => {
        setSaving(provider.id);
        const res = await api.put(`/ads/providers/${provider.id}`, {
            config: config
        }, token);

        if (res.success) {
            setToast({ message: 'Configuration sauvegardee', type: 'success' });
            setEditingProvider(null);
            fetchProviders();
        } else {
            setToast({ message: 'Erreur', type: 'error' });
        }
        setSaving(null);
    };

    const getProviderIcon = (type) => {
        switch (type) {
            case 'adsense': return 'fab fa-google';
            case 'ad_manager': return 'fab fa-google-play';
            case 'network': return 'fas fa-globe';
            default: return 'fas fa-image';
        }
    };

    const getProviderColor = (type) => {
        switch (type) {
            case 'adsense': return '#4285f4';
            case 'ad_manager': return '#34a853';
            case 'network': return '#9c27b0';
            default: return '#7ac142';
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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Fournisseurs publicitaires</h2>
                    <p className="text-muted mb-0">Configurez les sources de publicites</p>
                </div>
                <Link to="/ads/dashboard" className="btn btn-outline-primary">
                    <i className="fas fa-arrow-left me-2"></i> Retour au tableau de bord
                </Link>
            </div>

            {/* Providers Grid */}
            <div className="row">
                {providers.map(provider => (
                    <div key={provider.id} className="col-lg-6 mb-4">
                        <div className={`card h-100 ${!provider.is_active ? 'border-secondary' : ''}`}>
                            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            background: `${getProviderColor(provider.type)}15`
                                        }}
                                    >
                                        <i
                                            className={getProviderIcon(provider.type)}
                                            style={{ color: getProviderColor(provider.type) }}
                                        ></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0">{provider.name}</h6>
                                        <small className="text-muted text-capitalize">{provider.type.replace('_', ' ')}</small>
                                    </div>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={provider.is_active}
                                        onChange={() => handleToggleStatus(provider)}
                                        disabled={saving === provider.id}
                                    />
                                </div>
                            </div>
                            <div className="card-body">
                                <p className="text-muted small mb-3">
                                    {provider.description || 'Aucune description'}
                                </p>

                                {/* Config Section */}
                                {provider.type === 'adsense' && (
                                    <div className="bg-light rounded p-3">
                                        <h6 className="small mb-3">Configuration AdSense</h6>
                                        {editingProvider === provider.id ? (
                                            <AdSenseConfigForm
                                                config={provider.config}
                                                onSave={(config) => handleSaveConfig(provider, config)}
                                                onCancel={() => setEditingProvider(null)}
                                                saving={saving === provider.id}
                                            />
                                        ) : (
                                            <>
                                                <div className="mb-2">
                                                    <small className="text-muted">Publisher ID:</small>
                                                    <code className="ms-2">
                                                        {provider.config?.publisher_id || 'Non configure'}
                                                    </code>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setEditingProvider(provider.id)}
                                                >
                                                    <i className="fas fa-cog me-1"></i> Configurer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {provider.type === 'ad_manager' && (
                                    <div className="bg-light rounded p-3">
                                        <h6 className="small mb-3">Configuration Ad Manager</h6>
                                        {editingProvider === provider.id ? (
                                            <AdManagerConfigForm
                                                config={provider.config}
                                                onSave={(config) => handleSaveConfig(provider, config)}
                                                onCancel={() => setEditingProvider(null)}
                                                saving={saving === provider.id}
                                            />
                                        ) : (
                                            <>
                                                <div className="mb-2">
                                                    <small className="text-muted">Network Code:</small>
                                                    <code className="ms-2">
                                                        {provider.config?.network_code || 'Non configure'}
                                                    </code>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setEditingProvider(provider.id)}
                                                >
                                                    <i className="fas fa-cog me-1"></i> Configurer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {provider.type === 'custom' && (
                                    <div className="bg-light rounded p-3">
                                        <p className="small mb-0">
                                            <i className="fas fa-check-circle text-success me-2"></i>
                                            Les publicites personnalisees ne necessitent pas de configuration supplementaire.
                                        </p>
                                    </div>
                                )}

                                {provider.type === 'network' && (
                                    <div className="bg-light rounded p-3">
                                        <p className="small mb-0">
                                            <i className="fas fa-info-circle text-info me-2"></i>
                                            Collez le code du reseau directement dans chaque publicite.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Help Section */}
            <div className="card mt-4">
                <div className="card-header bg-white">
                    <h6 className="mb-0">
                        <i className="fas fa-question-circle me-2 text-info"></i>
                        Guide des fournisseurs
                    </h6>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <h6><i className="fas fa-image me-2 text-success"></i> Publicite Personnalisee</h6>
                            <p className="small text-muted">
                                Uploadez vos propres images et gerez les liens de destination directement.
                                Ideal pour les sponsors directs et les promotions internes.
                            </p>
                        </div>
                        <div className="col-md-6">
                            <h6><i className="fab fa-google me-2 text-primary"></i> Google AdSense</h6>
                            <p className="small text-muted">
                                Monetisez votre site avec des annonces Google automatiques.
                                Configurez votre Publisher ID et les slots seront geres par publicite.
                            </p>
                        </div>
                        <div className="col-md-6">
                            <h6><i className="fab fa-google-play me-2 text-success"></i> Google Ad Manager</h6>
                            <p className="small text-muted">
                                Solution avancee pour gerer plusieurs sources de revenus publicitaires
                                et optimiser le rendement.
                            </p>
                        </div>
                        <div className="col-md-6">
                            <h6><i className="fas fa-globe me-2 text-purple"></i> Reseau Tiers</h6>
                            <p className="small text-muted">
                                Integrez d'autres reseaux publicitaires en collant leur code HTML/JavaScript
                                directement dans vos publicites.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// AdSense Config Form Component
const AdSenseConfigForm = ({ config, onSave, onCancel, saving }) => {
    const [publisherId, setPublisherId] = useState(config?.publisher_id || '');

    return (
        <div>
            <div className="mb-3">
                <label className="form-label small">Publisher ID (data-ad-client)</label>
                <input
                    type="text"
                    className="form-control form-control-sm"
                    value={publisherId}
                    onChange={(e) => setPublisherId(e.target.value)}
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                />
            </div>
            <div className="d-flex gap-2">
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onSave({ publisher_id: publisherId })}
                    disabled={saving}
                >
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={onCancel}
                    disabled={saving}
                >
                    Annuler
                </button>
            </div>
        </div>
    );
};

// Ad Manager Config Form Component
const AdManagerConfigForm = ({ config, onSave, onCancel, saving }) => {
    const [networkCode, setNetworkCode] = useState(config?.network_code || '');

    return (
        <div>
            <div className="mb-3">
                <label className="form-label small">Network Code</label>
                <input
                    type="text"
                    className="form-control form-control-sm"
                    value={networkCode}
                    onChange={(e) => setNetworkCode(e.target.value)}
                    placeholder="XXXXXXXX"
                />
            </div>
            <div className="d-flex gap-2">
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onSave({ network_code: networkCode })}
                    disabled={saving}
                >
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={onCancel}
                    disabled={saving}
                >
                    Annuler
                </button>
            </div>
        </div>
    );
};

export default ProvidersSettings;
