import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import { Editor } from '@tinymce/tinymce-react';
import 'tinymce/tinymce';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/table';
import 'tinymce/plugins/code';

const AFRICAN_COUNTRIES = [
    'Algérie', 'Angola', 'Bénin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroun',
    'Cap-Vert', 'Centrafrique', 'Comores', 'Congo', 'Côte d\'Ivoire', 'Djibouti',
    'Égypte', 'Érythrée', 'Eswatini', 'Éthiopie', 'Gabon', 'Gambie', 'Ghana',
    'Guinée', 'Guinée-Bissau', 'Guinée équatoriale', 'Kenya', 'Lesotho', 'Libéria',
    'Libye', 'Madagascar', 'Malawi', 'Mali', 'Maroc', 'Maurice', 'Mauritanie',
    'Mozambique', 'Namibie', 'Niger', 'Nigéria', 'Ouganda', 'RD Congo', 'Rwanda',
    'São Tomé-et-Príncipe', 'Sénégal', 'Seychelles', 'Sierra Leone', 'Somalie',
    'Soudan', 'Soudan du Sud', 'Tanzanie', 'Tchad', 'Togo', 'Tunisie', 'Zambie', 'Zimbabwe',
];

const TINYMCE_CONFIG = {
    license_key: 'gpl',
    height: 300,
    menubar: false,
    plugins: 'advlist autolink lists link charmap preview wordcount table code',
    toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | link table | code',
    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; }',
    branding: false,
    promotion: false,
    skin: false,
    content_css: false,
};

const OpportunityEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const editorRefFr = useRef(null);
    const editorRefEn = useRef(null);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeLang, setActiveLang] = useState('fr');

    const [form, setForm] = useState({
        opportunity_type: 'job',
        title_fr: '',
        title_en: '',
        description_fr: '',
        description_en: '',
        organization_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        website_url: '',
        country: 'Cameroun',
        region: '',
        city: '',
        address: '',
        is_remote: false,
        job_type: 'full_time',
        experience_required: '',
        education_required: '',
        salary_min: '',
        salary_max: '',
        salary_currency: 'XAF',
        salary_period: 'month',
        deadline: '',
        status: 'pending',
        is_featured: false,
        is_urgent: false,
    });

    useEffect(() => {
        if (isEditing) fetchOpportunity();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchOpportunity = async () => {
        setLoading(true);
        const res = await api.get(`/opportunities/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                opportunity_type: d.opportunity_type || 'job',
                title_fr: d.title_fr || '',
                title_en: d.title_en || '',
                description_fr: d.description_fr || '',
                description_en: d.description_en || '',
                organization_name: d.organization_name || '',
                contact_name: d.contact_name || '',
                contact_email: d.contact_email || '',
                contact_phone: d.contact_phone || '',
                website_url: d.website_url || '',
                country: d.country || 'Cameroun',
                region: d.region || '',
                city: d.city || '',
                address: d.address || '',
                is_remote: !!d.is_remote,
                job_type: d.job_type || 'full_time',
                experience_required: d.experience_required || '',
                education_required: d.education_required || '',
                salary_min: d.salary_min || '',
                salary_max: d.salary_max || '',
                salary_currency: d.salary_currency || 'XAF',
                salary_period: d.salary_period || 'month',
                deadline: d.deadline ? d.deadline.split('T')[0] : '',
                status: d.status || 'pending',
                is_featured: !!d.is_featured,
                is_urgent: !!d.is_urgent,
            });
        } else {
            setToast({ type: 'error', message: 'Opportunité introuvable' });
        }
        setLoading(false);
    };

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title_fr.trim()) {
            setToast({ type: 'error', message: 'Le titre (FR) est obligatoire' });
            return;
        }

        setSaving(true);

        const data = {
            ...form,
            description_fr: editorRefFr.current ? editorRefFr.current.getContent() : form.description_fr,
            description_en: editorRefEn.current ? editorRefEn.current.getContent() : form.description_en,
            is_remote: form.is_remote ? 1 : 0,
            is_featured: form.is_featured ? 1 : 0,
            is_urgent: form.is_urgent ? 1 : 0,
            salary_min: form.salary_min ? Number(form.salary_min) : null,
            salary_max: form.salary_max ? Number(form.salary_max) : null,
        };

        let res;
        if (isEditing) {
            res = await api.put(`/opportunities/${id}`, data, token);
        } else {
            res = await api.post('/opportunities', data, token);
        }

        if (res.success) {
            setToast({ type: 'success', message: isEditing ? 'Opportunité mise à jour' : 'Opportunité créée' });
            const newId = res.data?.id || id;
            setTimeout(() => navigate(`/opportunities/view/${newId}`), 1000);
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
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
                    style={{ top: 20, right: 20, zIndex: 9999, minWidth: 300 }}>
                    <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-1">
                            <li className="breadcrumb-item"><Link to="/opportunities">Opportunités</Link></li>
                            <li className="breadcrumb-item active">{isEditing ? 'Modifier' : 'Nouvelle'}</li>
                        </ol>
                    </nav>
                    <h2 className="mb-0" style={{ fontWeight: 700 }}>
                        <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'} text-primary me-2`}></i>
                        {isEditing ? 'Modifier l\'opportunité' : 'Nouvelle opportunité'}
                    </h2>
                </div>
                <Link to={isEditing ? `/opportunities/view/${id}` : '/opportunities/list'} className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1"></i> Annuler
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-lg-8">
                        {/* Type & Title */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <h5 className="mb-0"><i className="fas fa-tag text-primary me-2"></i>Type & Titre</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Type d'opportunité *</label>
                                    <select className="form-select" value={form.opportunity_type}
                                        onChange={e => handleChange('opportunity_type', e.target.value)}>
                                        <option value="job">Emploi</option>
                                        <option value="tender">Appel d'offres</option>
                                        <option value="market">Marché</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Titre (FR) *</label>
                                    <input type="text" className="form-control" value={form.title_fr}
                                        onChange={e => handleChange('title_fr', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="form-label">Titre (EN)</label>
                                    <input type="text" className="form-control" value={form.title_en}
                                        onChange={e => handleChange('title_en', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0"><i className="fas fa-align-left text-primary me-2"></i>Description</h5>
                                <div className="btn-group btn-group-sm">
                                    <button type="button" className={`btn ${activeLang === 'fr' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setActiveLang('fr')}>FR</button>
                                    <button type="button" className={`btn ${activeLang === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setActiveLang('en')}>EN</button>
                                </div>
                            </div>
                            <div className="card-body">
                                <div style={{ display: activeLang === 'fr' ? 'block' : 'none' }}>
                                    <Editor
                                        onInit={(evt, editor) => (editorRefFr.current = editor)}
                                        initialValue={form.description_fr}
                                        init={TINYMCE_CONFIG}
                                    />
                                </div>
                                <div style={{ display: activeLang === 'en' ? 'block' : 'none' }}>
                                    <Editor
                                        onInit={(evt, editor) => (editorRefEn.current = editor)}
                                        initialValue={form.description_en}
                                        init={TINYMCE_CONFIG}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Organization & Contact */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <h5 className="mb-0"><i className="fas fa-building text-primary me-2"></i>Organisation & Contact</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Organisation</label>
                                        <input type="text" className="form-control" value={form.organization_name}
                                            onChange={e => handleChange('organization_name', e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Nom du contact</label>
                                        <input type="text" className="form-control" value={form.contact_name}
                                            onChange={e => handleChange('contact_name', e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Email contact</label>
                                        <input type="email" className="form-control" value={form.contact_email}
                                            onChange={e => handleChange('contact_email', e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Téléphone</label>
                                        <input type="text" className="form-control" value={form.contact_phone}
                                            onChange={e => handleChange('contact_phone', e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Site web</label>
                                        <input type="url" className="form-control" value={form.website_url}
                                            onChange={e => handleChange('website_url', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <h5 className="mb-0"><i className="fas fa-map-marker-alt text-primary me-2"></i>Localisation</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">Pays</label>
                                        <select className="form-select" value={form.country}
                                            onChange={e => handleChange('country', e.target.value)}>
                                            <option value="">— Choisir —</option>
                                            {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Région</label>
                                        <input type="text" className="form-control" value={form.region}
                                            onChange={e => handleChange('region', e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Ville</label>
                                        <input type="text" className="form-control" value={form.city}
                                            onChange={e => handleChange('city', e.target.value)} />
                                    </div>
                                    <div className="col-md-8">
                                        <label className="form-label">Adresse</label>
                                        <input type="text" className="form-control" value={form.address}
                                            onChange={e => handleChange('address', e.target.value)} />
                                    </div>
                                    <div className="col-md-4 d-flex align-items-end">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="isRemote"
                                                checked={form.is_remote} onChange={e => handleChange('is_remote', e.target.checked)} />
                                            <label className="form-check-label" htmlFor="isRemote">Télétravail possible</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Job-specific fields */}
                        {form.opportunity_type === 'job' && (
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-0">
                                    <h5 className="mb-0"><i className="fas fa-briefcase text-primary me-2"></i>Détails du poste</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label">Type de contrat</label>
                                            <select className="form-select" value={form.job_type}
                                                onChange={e => handleChange('job_type', e.target.value)}>
                                                <option value="full_time">Temps plein</option>
                                                <option value="part_time">Temps partiel</option>
                                                <option value="contract">Contrat</option>
                                                <option value="internship">Stage</option>
                                                <option value="volunteer">Bénévolat</option>
                                                <option value="freelance">Freelance</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Expérience requise</label>
                                            <input type="text" className="form-control" placeholder="ex: 2-5 ans"
                                                value={form.experience_required} onChange={e => handleChange('experience_required', e.target.value)} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Formation requise</label>
                                            <input type="text" className="form-control" placeholder="ex: DVM, Master"
                                                value={form.education_required} onChange={e => handleChange('education_required', e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Salaire min</label>
                                            <input type="number" className="form-control" value={form.salary_min}
                                                onChange={e => handleChange('salary_min', e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Salaire max</label>
                                            <input type="number" className="form-control" value={form.salary_max}
                                                onChange={e => handleChange('salary_max', e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Devise</label>
                                            <select className="form-select" value={form.salary_currency}
                                                onChange={e => handleChange('salary_currency', e.target.value)}>
                                                <option value="XAF">XAF</option>
                                                <option value="XOF">XOF</option>
                                                <option value="EUR">EUR</option>
                                                <option value="USD">USD</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Période</label>
                                            <select className="form-select" value={form.salary_period}
                                                onChange={e => handleChange('salary_period', e.target.value)}>
                                                <option value="hour">Heure</option>
                                                <option value="day">Jour</option>
                                                <option value="month">Mois</option>
                                                <option value="year">An</option>
                                                <option value="project">Projet</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Publish */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <h6 className="mb-0"><i className="fas fa-cogs text-primary me-2"></i>Publication</h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Statut</label>
                                    <select className="form-select" value={form.status}
                                        onChange={e => handleChange('status', e.target.value)}>
                                        <option value="draft">Brouillon</option>
                                        <option value="pending">En attente</option>
                                        <option value="published">Publiée</option>
                                        <option value="closed">Clôturée</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Date limite</label>
                                    <input type="date" className="form-control" value={form.deadline}
                                        onChange={e => handleChange('deadline', e.target.value)} />
                                </div>
                                <div className="form-check mb-2">
                                    <input className="form-check-input" type="checkbox" id="isFeatured"
                                        checked={form.is_featured} onChange={e => handleChange('is_featured', e.target.checked)} />
                                    <label className="form-check-label" htmlFor="isFeatured">
                                        <i className="fas fa-star text-warning me-1"></i> En vedette
                                    </label>
                                </div>
                                <div className="form-check mb-3">
                                    <input className="form-check-input" type="checkbox" id="isUrgent"
                                        checked={form.is_urgent} onChange={e => handleChange('is_urgent', e.target.checked)} />
                                    <label className="form-check-label" htmlFor="isUrgent">
                                        <i className="fas fa-bolt text-danger me-1"></i> Urgent
                                    </label>
                                </div>
                                <button type="submit" className="btn w-100" disabled={saving}
                                    style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', color: 'white' }}>
                                    {saving ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                                    ) : (
                                        <><i className={`fas ${isEditing ? 'fa-save' : 'fa-plus-circle'} me-2`}></i>{isEditing ? 'Enregistrer' : 'Créer'}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default OpportunityEditor;
