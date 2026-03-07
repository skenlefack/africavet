import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const AdvertisementEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [placements, setPlacements] = useState([]);
    const [providers, setProviders] = useState([]);
    const [toast, setToast] = useState(null);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaField, setMediaField] = useState('image_url');

    const [formData, setFormData] = useState({
        name: '',
        placement_id: '',
        provider_id: '',
        type: 'image',
        image_url: '',
        image_url_mobile: '',
        target_url: '',
        alt_text: '',
        ad_code: '',
        adsense_client: '',
        adsense_slot: '',
        status: 'draft',
        start_date: '',
        end_date: '',
        priority: 5,
        weight: 100,
        advertiser_name: '',
        advertiser_email: '',
        advertiser_phone: '',
        budget_type: 'unlimited',
        budget_value: '',
        notes: ''
    });

    useEffect(() => {
        fetchPlacements();
        fetchProviders();
        if (isEdit) {
            fetchAd();
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchAd = async () => {
        const res = await api.get(`/ads/${id}`, token);
        if (res.success) {
            const ad = res.data;
            setFormData({
                name: ad.name || '',
                placement_id: ad.placement_id || '',
                provider_id: ad.provider_id || '',
                type: ad.type || 'image',
                image_url: ad.image_url || '',
                image_url_mobile: ad.image_url_mobile || '',
                target_url: ad.target_url || '',
                alt_text: ad.alt_text || '',
                ad_code: ad.ad_code || '',
                adsense_client: ad.adsense_client || '',
                adsense_slot: ad.adsense_slot || '',
                status: ad.status || 'draft',
                start_date: ad.start_date ? ad.start_date.split('T')[0] : '',
                end_date: ad.end_date ? ad.end_date.split('T')[0] : '',
                priority: ad.priority || 5,
                weight: ad.weight || 100,
                advertiser_name: ad.advertiser_name || '',
                advertiser_email: ad.advertiser_email || '',
                advertiser_phone: ad.advertiser_phone || '',
                budget_type: ad.budget_type || 'unlimited',
                budget_value: ad.budget_value || '',
                notes: ad.notes || ''
            });
        }
        setLoading(false);
    };

    const fetchPlacements = async () => {
        const res = await api.get('/ads/placements', token);
        if (res.success) setPlacements(res.data || []);
    };

    const fetchProviders = async () => {
        const res = await api.get('/ads/providers', token);
        if (res.success) setProviders(res.data || []);
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || '' : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.placement_id || !formData.provider_id) {
            setToast({ message: 'Veuillez remplir les champs obligatoires', type: 'error' });
            return;
        }

        setSaving(true);

        const res = isEdit
            ? await api.put(`/ads/${id}`, formData, token)
            : await api.post('/ads', formData, token);

        if (res.success) {
            setToast({ message: isEdit ? 'Publicite mise a jour' : 'Publicite creee', type: 'success' });
            setTimeout(() => navigate('/ads'), 1000);
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }

        setSaving(false);
    };

    const handleMediaSelect = (url) => {
        setFormData(prev => ({
            ...prev,
            [mediaField]: url
        }));
        setShowMediaModal(false);
    };

    const getSelectedPlacement = () => {
        return placements.find(p => p.id === parseInt(formData.placement_id));
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
                        {isEdit ? 'Modifier la publicite' : 'Nouvelle publicite'}
                    </h2>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link to="/ads">Publicites</Link>
                            </li>
                            <li className="breadcrumb-item active">
                                {isEdit ? formData.name : 'Nouvelle'}
                            </li>
                        </ol>
                    </nav>
                </div>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/ads')}
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
                {/* Main Form */}
                <div className="col-lg-8">
                    {/* Tabs */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <ul className="nav nav-tabs card-header-tabs">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('general')}
                                    >
                                        <i className="fas fa-cog me-2"></i> General
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'content' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('content')}
                                    >
                                        <i className="fas fa-image me-2"></i> Contenu
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('schedule')}
                                    >
                                        <i className="fas fa-calendar me-2"></i> Planification
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'advertiser' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('advertiser')}
                                    >
                                        <i className="fas fa-user me-2"></i> Annonceur
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div className="card-body">
                            {/* Tab: General */}
                            {activeTab === 'general' && (
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label">Nom de la publicite *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Ex: Banniere Promo Janvier"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Emplacement *</label>
                                        <select
                                            className="form-select"
                                            name="placement_id"
                                            value={formData.placement_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Selectionner...</option>
                                            {placements.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name_fr || p.name} ({p.width}x{p.height})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Fournisseur *</label>
                                        <select
                                            className="form-select"
                                            name="provider_id"
                                            value={formData.provider_id}
                                            onChange={(e) => {
                                                handleChange(e);
                                                // Set default type based on provider
                                                const provider = providers.find(p => p.id === parseInt(e.target.value));
                                                if (provider) {
                                                    if (provider.type === 'adsense') {
                                                        setFormData(prev => ({ ...prev, type: 'adsense' }));
                                                    } else if (provider.type === 'network') {
                                                        setFormData(prev => ({ ...prev, type: 'html' }));
                                                    } else {
                                                        setFormData(prev => ({ ...prev, type: 'image' }));
                                                    }
                                                }
                                            }}
                                            required
                                        >
                                            <option value="">Selectionner...</option>
                                            {providers.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Type de contenu</label>
                                        <select
                                            className="form-select"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                        >
                                            <option value="image">Image</option>
                                            <option value="html">Code HTML</option>
                                            <option value="script">Script</option>
                                            <option value="adsense">Google AdSense</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Statut</label>
                                        <select
                                            className="form-select"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                        >
                                            <option value="draft">Brouillon</option>
                                            <option value="active">Active</option>
                                            <option value="paused">En pause</option>
                                            <option value="scheduled">Planifiee</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Notes internes</label>
                                        <textarea
                                            className="form-control"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            rows="3"
                                            placeholder="Notes pour l'administration..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab: Content */}
                            {activeTab === 'content' && (
                                <div className="row g-3">
                                    {formData.type === 'image' && (
                                        <>
                                            <div className="col-12">
                                                <label className="form-label">Image (Desktop)</label>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="image_url"
                                                        value={formData.image_url}
                                                        onChange={handleChange}
                                                        placeholder="URL de l'image"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary"
                                                        onClick={() => {
                                                            setMediaField('image_url');
                                                            setShowMediaModal(true);
                                                        }}
                                                    >
                                                        <i className="fas fa-image"></i>
                                                    </button>
                                                </div>
                                                {formData.image_url && (
                                                    <img
                                                        src={formData.image_url}
                                                        alt="Preview"
                                                        className="mt-2"
                                                        style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '4px' }}
                                                    />
                                                )}
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Image (Mobile) - Optionnel</label>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="image_url_mobile"
                                                        value={formData.image_url_mobile}
                                                        onChange={handleChange}
                                                        placeholder="URL de l'image mobile"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary"
                                                        onClick={() => {
                                                            setMediaField('image_url_mobile');
                                                            setShowMediaModal(true);
                                                        }}
                                                    >
                                                        <i className="fas fa-mobile-alt"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">URL de destination</label>
                                                <input
                                                    type="url"
                                                    className="form-control"
                                                    name="target_url"
                                                    value={formData.target_url}
                                                    onChange={handleChange}
                                                    placeholder="https://example.com/landing-page"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Texte alternatif</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="alt_text"
                                                    value={formData.alt_text}
                                                    onChange={handleChange}
                                                    placeholder="Description pour l'accessibilite"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {(formData.type === 'html' || formData.type === 'script') && (
                                        <div className="col-12">
                                            <label className="form-label">Code publicitaire</label>
                                            <textarea
                                                className="form-control font-monospace"
                                                name="ad_code"
                                                value={formData.ad_code}
                                                onChange={handleChange}
                                                rows="10"
                                                placeholder="Collez votre code HTML ou JavaScript ici..."
                                                style={{ fontSize: '0.85rem' }}
                                            />
                                            <small className="text-muted">
                                                Le code sera insere tel quel dans la page.
                                            </small>
                                        </div>
                                    )}

                                    {formData.type === 'adsense' && (
                                        <>
                                            <div className="col-md-6">
                                                <label className="form-label">Client ID (data-ad-client)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="adsense_client"
                                                    value={formData.adsense_client}
                                                    onChange={handleChange}
                                                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Slot ID (data-ad-slot)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="adsense_slot"
                                                    value={formData.adsense_slot}
                                                    onChange={handleChange}
                                                    placeholder="XXXXXXXXXX"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <div className="alert alert-info">
                                                    <i className="fas fa-info-circle me-2"></i>
                                                    Vous pouvez aussi utiliser un code AdSense complet en selectionnant le type "Code HTML".
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Tab: Schedule */}
                            {activeTab === 'schedule' && (
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Date de debut</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Date de fin</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Priorite (1-10)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            min="1"
                                            max="10"
                                        />
                                        <small className="text-muted">Plus haut = plus prioritaire</small>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Poids de rotation</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="weight"
                                            value={formData.weight}
                                            onChange={handleChange}
                                            min="1"
                                            max="1000"
                                        />
                                        <small className="text-muted">Probabilite relative en rotation</small>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Type de budget</label>
                                        <select
                                            className="form-select"
                                            name="budget_type"
                                            value={formData.budget_type}
                                            onChange={handleChange}
                                        >
                                            <option value="unlimited">Illimite</option>
                                            <option value="impressions">Limite d'impressions</option>
                                            <option value="clicks">Limite de clics</option>
                                            <option value="daily_impressions">Impressions par jour</option>
                                            <option value="daily_clicks">Clics par jour</option>
                                        </select>
                                    </div>
                                    {formData.budget_type !== 'unlimited' && (
                                        <div className="col-md-6">
                                            <label className="form-label">Valeur du budget</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="budget_value"
                                                value={formData.budget_value}
                                                onChange={handleChange}
                                                min="1"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab: Advertiser */}
                            {activeTab === 'advertiser' && (
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label">Nom de l'annonceur</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="advertiser_name"
                                            value={formData.advertiser_name}
                                            onChange={handleChange}
                                            placeholder="Nom de l'entreprise ou du contact"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="advertiser_email"
                                            value={formData.advertiser_email}
                                            onChange={handleChange}
                                            placeholder="contact@annonceur.com"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Telephone</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="advertiser_phone"
                                            value={formData.advertiser_phone}
                                            onChange={handleChange}
                                            placeholder="+33 1 23 45 67 89"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Preview Card */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0">Apercu</h6>
                        </div>
                        <div className="card-body">
                            {formData.type === 'image' && formData.image_url ? (
                                <div
                                    className="border rounded p-2 text-center"
                                    style={{
                                        minHeight: '100px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <img
                                        src={formData.image_url}
                                        alt={formData.alt_text || 'Preview'}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '200px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </div>
                            ) : formData.type === 'adsense' ? (
                                <div className="border rounded p-3 text-center bg-light">
                                    <i className="fab fa-google fa-3x text-muted mb-2"></i>
                                    <p className="mb-0 text-muted">Google AdSense</p>
                                    {formData.adsense_slot && (
                                        <small className="text-muted">Slot: {formData.adsense_slot}</small>
                                    )}
                                </div>
                            ) : formData.type === 'html' || formData.type === 'script' ? (
                                <div className="border rounded p-3 text-center bg-light">
                                    <i className="fas fa-code fa-3x text-muted mb-2"></i>
                                    <p className="mb-0 text-muted">Code {formData.type.toUpperCase()}</p>
                                    {formData.ad_code && (
                                        <small className="text-muted">{formData.ad_code.length} caracteres</small>
                                    )}
                                </div>
                            ) : (
                                <div className="border rounded p-3 text-center bg-light">
                                    <i className="fas fa-image fa-3x text-muted mb-2"></i>
                                    <p className="mb-0 text-muted">Aucun apercu</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Placement Info */}
                    {getSelectedPlacement() && (
                        <div className="card mb-4">
                            <div className="card-header bg-white">
                                <h6 className="mb-0">Emplacement</h6>
                            </div>
                            <div className="card-body">
                                <p className="mb-2">
                                    <strong>{getSelectedPlacement().name_fr || getSelectedPlacement().name}</strong>
                                </p>
                                <p className="mb-2 text-muted small">
                                    {getSelectedPlacement().location}
                                </p>
                                <div className="d-flex gap-3">
                                    <span className="badge bg-light text-dark">
                                        {getSelectedPlacement().width}x{getSelectedPlacement().height}px
                                    </span>
                                    <span className="badge bg-light text-dark">
                                        Max: {getSelectedPlacement().max_ads} pub(s)
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats (Edit mode only) */}
                    {isEdit && (
                        <div className="card">
                            <div className="card-header bg-white">
                                <h6 className="mb-0">Statistiques</h6>
                            </div>
                            <div className="card-body">
                                <Link to={`/ads/statistics?ad_id=${id}`} className="btn btn-outline-primary w-100">
                                    <i className="fas fa-chart-line me-2"></i>
                                    Voir les statistiques
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Media Modal */}
            {showMediaModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Selectionner une image</h5>
                                <button type="button" className="btn-close" onClick={() => setShowMediaModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted">
                                    Entrez l'URL de l'image ou uploadez-la via la bibliotheque de medias.
                                </p>
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="https://..."
                                        id="mediaUrl"
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            const url = document.getElementById('mediaUrl').value;
                                            if (url) handleMediaSelect(url);
                                        }}
                                    >
                                        Utiliser cette URL
                                    </button>
                                </div>
                                <hr />
                                <Link to="/media" className="btn btn-outline-primary">
                                    <i className="fas fa-images me-2"></i>
                                    Ouvrir la bibliotheque de medias
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdvertisementEditor;
