import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, getToken, API_BASE_URL } from '../../../services/api';
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

const ALL_COUNTRIES = [
    // Afrique
    'Afrique du Sud', 'Algérie', 'Angola', 'Bénin', 'Botswana', 'Burkina Faso', 'Burundi',
    'Cameroun', 'Cap-Vert', 'Centrafrique', 'Comores', 'Congo', 'Côte d\'Ivoire', 'Djibouti',
    'Égypte', 'Érythrée', 'Eswatini', 'Éthiopie', 'Gabon', 'Gambie', 'Ghana', 'Guinée',
    'Guinée-Bissau', 'Guinée équatoriale', 'Kenya', 'Lesotho', 'Libéria', 'Libye',
    'Madagascar', 'Malawi', 'Mali', 'Maroc', 'Maurice', 'Mauritanie', 'Mozambique',
    'Namibie', 'Niger', 'Nigéria', 'Ouganda', 'RD Congo', 'Rwanda', 'São Tomé-et-Príncipe',
    'Sénégal', 'Seychelles', 'Sierra Leone', 'Somalie', 'Soudan', 'Soudan du Sud',
    'Tanzanie', 'Tchad', 'Togo', 'Tunisie', 'Zambie', 'Zimbabwe',
    // Europe
    'Albanie', 'Allemagne', 'Andorre', 'Arménie', 'Autriche', 'Azerbaïdjan', 'Belgique',
    'Biélorussie', 'Bosnie-Herzégovine', 'Bulgarie', 'Chypre', 'Croatie', 'Danemark',
    'Espagne', 'Estonie', 'Finlande', 'France', 'Géorgie', 'Grèce', 'Hongrie', 'Irlande',
    'Islande', 'Italie', 'Kosovo', 'Lettonie', 'Liechtenstein', 'Lituanie', 'Luxembourg',
    'Macédoine du Nord', 'Malte', 'Moldavie', 'Monaco', 'Monténégro', 'Norvège', 'Pays-Bas',
    'Pologne', 'Portugal', 'République tchèque', 'Roumanie', 'Royaume-Uni', 'Russie',
    'Saint-Marin', 'Serbie', 'Slovaquie', 'Slovénie', 'Suède', 'Suisse', 'Ukraine', 'Vatican',
    // Amérique
    'Antigua-et-Barbuda', 'Argentine', 'Bahamas', 'Barbade', 'Belize', 'Bolivie', 'Brésil',
    'Canada', 'Chili', 'Colombie', 'Costa Rica', 'Cuba', 'Dominique', 'El Salvador',
    'Équateur', 'États-Unis', 'Grenade', 'Guatemala', 'Guyana', 'Haïti', 'Honduras',
    'Jamaïque', 'Mexique', 'Nicaragua', 'Panama', 'Paraguay', 'Pérou',
    'République dominicaine', 'Saint-Kitts-et-Nevis', 'Saint-Vincent-et-les-Grenadines',
    'Sainte-Lucie', 'Suriname', 'Trinité-et-Tobago', 'Uruguay', 'Venezuela',
    // Asie
    'Afghanistan', 'Arabie saoudite', 'Bahreïn', 'Bangladesh', 'Bhoutan', 'Birmanie',
    'Brunei', 'Cambodge', 'Chine', 'Corée du Nord', 'Corée du Sud', 'Émirats arabes unis',
    'Inde', 'Indonésie', 'Irak', 'Iran', 'Israël', 'Japon', 'Jordanie', 'Kazakhstan',
    'Kirghizistan', 'Koweït', 'Laos', 'Liban', 'Malaisie', 'Maldives', 'Mongolie', 'Népal',
    'Oman', 'Ouzbékistan', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Singapour',
    'Sri Lanka', 'Syrie', 'Tadjikistan', 'Taïwan', 'Thaïlande', 'Timor oriental',
    'Turkménistan', 'Turquie', 'Viêt Nam', 'Yémen',
    // Océanie
    'Australie', 'Fidji', 'Kiribati', 'Marshall', 'Micronésie', 'Nauru', 'Nouvelle-Zélande',
    'Palaos', 'Papouasie-Nouvelle-Guinée', 'Salomon', 'Samoa', 'Tonga', 'Tuvalu', 'Vanuatu',
];

// Searchable country select component
const SearchableCountrySelect = ({ value, onChange, hasError }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const filtered = search
        ? ALL_COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()))
        : ALL_COUNTRIES;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <div
                className={`form-select ${hasError ? 'is-invalid' : ''}`}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {value || '— Choisir un pays —'}
                </span>
                {value && (
                    <i className="fas fa-times text-muted ms-2" style={{ fontSize: '0.75rem' }}
                        onClick={(e) => { e.stopPropagation(); onChange(''); setSearch(''); }} />
                )}
            </div>
            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1050,
                    background: 'white', border: '1px solid #dee2e6', borderRadius: '0 0 6px 6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: 280, display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Rechercher un pays..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                    <div style={{ overflowY: 'auto', maxHeight: 220 }}>
                        {filtered.length === 0 ? (
                            <div className="text-muted text-center py-3" style={{ fontSize: '0.85rem' }}>Aucun pays trouvé</div>
                        ) : (
                            filtered.map(c => (
                                <div
                                    key={c}
                                    className="px-3 py-2"
                                    style={{
                                        cursor: 'pointer', fontSize: '0.9rem',
                                        background: c === value ? '#e8f5e9' : 'transparent',
                                        fontWeight: c === value ? 600 : 400,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = c === value ? '#e8f5e9' : '#f0f0f0'}
                                    onMouseLeave={e => e.currentTarget.style.background = c === value ? '#e8f5e9' : 'transparent'}
                                    onClick={() => { onChange(c); setIsOpen(false); setSearch(''); }}
                                >
                                    {c}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

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

    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isDirty, setIsDirty] = useState(false);
    const autoSaveRef = useRef(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const STEPS = [
        { id: 1, label: 'Identification', icon: 'fa-tag', fields: ['opportunity_type', 'title_fr', 'title_en', 'organization_name', 'tender_reference', 'source_url', 'application_url'] },
        { id: 2, label: 'Contenu', icon: 'fa-align-left', fields: ['description_fr', 'description_en'] },
        { id: 3, label: 'Métadonnées', icon: 'fa-sliders-h', fields: ['country', 'city', 'work_mode', 'contract_type', 'salary_min', 'deadline'] },
        { id: 4, label: 'Publication', icon: 'fa-paper-plane', fields: ['status', 'offer_status', 'is_featured'] },
    ];

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
        application_url: '',
        source_url: '',
        tender_reference: '',
        country: '',
        region: '',
        city: '',
        address: '',
        is_remote: false,
        work_mode: 'on_site',
        job_type: '',
        contract_type: '',
        work_rhythm: '',
        contract_duration: '',
        contract_start_date: '',
        contract_end_date: '',
        experience_required: '',
        experience_min_years: '',
        experience_max_years: '',
        education_required: '',
        languages_required: '',
        nationality_required: '',
        recruitment_scope: '',
        positions_count: 1,
        grade: '',
        department: '',
        salary_min: '',
        salary_max: '',
        salary_currency: '',
        salary_period: '',
        salary_type: '',
        deadline: '',
        deadline_timezone: 'UTC',
        status: 'draft',
        offer_status: 'open',
        is_featured: false,
        is_urgent: false,
        translation_status_en: 'not_started',
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
                application_url: d.application_url || '',
                source_url: d.source_url || '',
                tender_reference: d.tender_reference || '',
                country: d.country || '',
                region: d.region || '',
                city: d.city || '',
                address: d.address || '',
                is_remote: !!d.is_remote,
                work_mode: d.work_mode || 'on_site',
                job_type: d.job_type || '',
                contract_type: d.contract_type || '',
                work_rhythm: d.work_rhythm || '',
                contract_duration: d.contract_duration || '',
                contract_start_date: d.contract_start_date ? d.contract_start_date.split('T')[0] : '',
                contract_end_date: d.contract_end_date ? d.contract_end_date.split('T')[0] : '',
                experience_required: d.experience_required || '',
                experience_min_years: d.experience_min_years || '',
                experience_max_years: d.experience_max_years || '',
                education_required: d.education_required || '',
                languages_required: d.languages_required ? (typeof d.languages_required === 'string' ? d.languages_required : JSON.stringify(d.languages_required)) : '',
                nationality_required: d.nationality_required || '',
                recruitment_scope: d.recruitment_scope || '',
                positions_count: d.positions_count || 1,
                grade: d.grade || '',
                department: d.department || '',
                salary_min: d.salary_min || '',
                salary_max: d.salary_max || '',
                salary_currency: d.salary_currency || '',
                salary_period: d.salary_period || '',
                salary_type: d.salary_type || '',
                deadline: d.deadline ? d.deadline.split('T')[0] : '',
                deadline_timezone: d.deadline_timezone || 'UTC',
                status: d.status || 'draft',
                offer_status: d.offer_status || 'open',
                is_featured: !!d.is_featured,
                is_urgent: !!d.is_urgent,
                translation_status_en: d.translation_status_en || 'not_started',
            });
        } else {
            setToast({ type: 'error', message: 'Opportunité introuvable' });
        }
        setLoading(false);
    };

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setIsDirty(true);
        if (fieldErrors[key]) {
            setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
        }
    };

    const REQUIRED_FIELDS = {
        title_fr: { label: 'Titre (FR)', step: 1 },
        opportunity_type: { label: 'Type d\'opportunité', step: 1 },
        organization_name: { label: 'Organisation', step: 2 },
        description_fr: { label: 'Description (FR)', step: 2 },
        country: { label: 'Pays', step: 3 },
        deadline: { label: 'Date limite', step: 4 },
    };

    const validateForm = () => {
        const errors = {};
        const descFr = editorRefFr.current ? editorRefFr.current.getContent() : form.description_fr;
        Object.entries(REQUIRED_FIELDS).forEach(([field, { label }]) => {
            const val = field === 'description_fr' ? descFr : form[field];
            if (!val || (typeof val === 'string' && !val.trim())) {
                errors[field] = `${label} est obligatoire`;
            }
        });
        // Email validation
        if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
            errors.contact_email = 'Email invalide';
        }
        return errors;
    };

    // Auto-save draft every 60 seconds
    useEffect(() => {
        if (!isDirty || !isEditing || form.status === 'published') return;
        autoSaveRef.current = setTimeout(async () => {
            const data = {
                ...form,
                description_fr: editorRefFr.current ? editorRefFr.current.getContent() : form.description_fr,
                description_en: editorRefEn.current ? editorRefEn.current.getContent() : form.description_en,
            };
            await api.put(`/opportunities/${id}`, data, token);
            setIsDirty(false);
            setToast({ type: 'success', message: 'Sauvegarde automatique effectuée' });
        }, 60000);
        return () => clearTimeout(autoSaveRef.current);
    }, [isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

    // Warn before leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const handleFileUpload = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        setUploading(true);
        for (const file of selectedFiles) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch(`${API_BASE_URL}/upload/document`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                const data = await res.json();
                if (data.success) {
                    setFiles(prev => [...prev, {
                        url: data.data.url,
                        name: data.data.originalName,
                        size: data.data.size,
                        type: data.data.type,
                    }]);
                } else {
                    setToast({ type: 'error', message: `Erreur: ${file.name}` });
                }
            } catch {
                setToast({ type: 'error', message: `Erreur upload: ${file.name}` });
            }
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' o';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
        return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf': return 'fa-file-pdf text-danger';
            case 'word': return 'fa-file-word text-primary';
            case 'excel': return 'fa-file-excel text-success';
            case 'powerpoint': return 'fa-file-powerpoint text-warning';
            case 'video': return 'fa-file-video text-info';
            default: return 'fa-file text-secondary';
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            const firstErrorField = Object.keys(errors)[0];
            const firstErrorStep = REQUIRED_FIELDS[firstErrorField]?.step;
            if (firstErrorStep && firstErrorStep !== currentStep) {
                setCurrentStep(firstErrorStep);
            }
            const errorCount = Object.keys(errors).length;
            setToast({ type: 'error', message: `${errorCount} champ${errorCount > 1 ? 's' : ''} obligatoire${errorCount > 1 ? 's' : ''} manquant${errorCount > 1 ? 's' : ''}` });
            return;
        }
        setFieldErrors({});

        setSaving(true);

        // Get description from TinyMCE or fallback to form state
        const descFr = editorRefFr.current ? editorRefFr.current.getContent() : form.description_fr;
        const descEn = editorRefEn.current ? editorRefEn.current.getContent() : form.description_en;

        // Also try to get from TinyMCE global if ref lost
        const finalDescFr = descFr || (window.tinymce?.get?.('desc-fr')?.getContent?.()) || form.description_fr;
        const finalDescEn = descEn || (window.tinymce?.get?.('desc-en')?.getContent?.()) || form.description_en;

        const data = {
            ...form,
            status: isEditing ? form.status : 'published',
            attachments: files.length > 0 ? JSON.stringify(files) : null,
            description_fr: finalDescFr,
            description_en: finalDescEn,
            is_remote: form.work_mode === 'remote' || form.work_mode === 'home_based' ? 1 : 0,
            is_featured: form.is_featured ? 1 : 0,
            is_urgent: form.is_urgent ? 1 : 0,
            salary_min: form.salary_min ? Number(form.salary_min) : null,
            salary_max: form.salary_max ? Number(form.salary_max) : null,
            positions_count: form.positions_count ? Number(form.positions_count) : 1,
            experience_min_years: form.experience_min_years ? Number(form.experience_min_years) : null,
            experience_max_years: form.experience_max_years ? Number(form.experience_max_years) : null,
            languages_required: form.languages_required ? form.languages_required.split(',').map(l => l.trim()).filter(Boolean) : null,
        };

        let res;
        if (isEditing) {
            res = await api.put(`/opportunities/${id}`, data, token);
        } else {
            res = await api.post('/opportunities', data, token);
        }

        if (res.success) {
            setToast({ type: 'success', message: isEditing ? 'Opportunité mise à jour' : 'Opportunité publiée' });
            const newId = res.data?.id || id;
            setTimeout(() => navigate(`/opportunities/view/${newId}`), 1000);
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
        setSaving(false);
    };

    // Calculate completeness
    const getCompleteness = () => {
        const checks = [
            { ok: !!form.title_fr, label: 'Titre FR' },
            { ok: !!form.organization_name, label: 'Organisation' },
            { ok: !!form.country, label: 'Pays' },
            { ok: !!(editorRefFr.current ? editorRefFr.current.getContent() : form.description_fr), label: 'Description' },
            { ok: !!form.deadline || form.offer_status === 'continuous', label: 'Date limite' },
            { ok: !!form.contact_email, label: 'Email contact' },
            { ok: !!form.application_url, label: 'Lien candidature' },
            { ok: !!form.source_url, label: 'Source officielle' },
        ];
        const done = checks.filter(c => c.ok).length;
        return { score: Math.round((done / checks.length) * 100), checks };
    };

    const completeness = getCompleteness();

    // Save as draft (quick save without navigation)
    const handleSaveDraft = async () => {
        setSaving(true);
        const draftDescFr = editorRefFr.current ? editorRefFr.current.getContent() : (window.tinymce?.get?.('desc-fr')?.getContent?.()) || form.description_fr;
        const draftDescEn = editorRefEn.current ? editorRefEn.current.getContent() : (window.tinymce?.get?.('desc-en')?.getContent?.()) || form.description_en;
        const data = {
            ...form,
            status: form.status === 'published' ? form.status : 'draft',
            description_fr: draftDescFr,
            description_en: draftDescEn,
            is_remote: form.work_mode === 'remote' || form.work_mode === 'home_based' ? 1 : 0,
            is_featured: form.is_featured ? 1 : 0,
            is_urgent: form.is_urgent ? 1 : 0,
            salary_min: form.salary_min ? Number(form.salary_min) : null,
            salary_max: form.salary_max ? Number(form.salary_max) : null,
            positions_count: form.positions_count ? Number(form.positions_count) : 1,
            experience_min_years: form.experience_min_years ? Number(form.experience_min_years) : null,
            experience_max_years: form.experience_max_years ? Number(form.experience_max_years) : null,
            languages_required: form.languages_required ? form.languages_required.split(',').map(l => l.trim()).filter(Boolean) : null,
            attachments: files.length > 0 ? JSON.stringify(files) : null,
        };
        const res = isEditing
            ? await api.put(`/opportunities/${id}`, data, token)
            : await api.post('/opportunities', data, token);
        if (res.success) {
            setIsDirty(false);
            setToast({ type: 'success', message: 'Brouillon enregistré' });
            if (!isEditing && res.data?.id) {
                navigate(`/opportunities/edit/${res.data.id}`, { replace: true });
            }
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
            <div className="d-flex justify-content-between align-items-center mb-3">
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
                <div className="d-flex align-items-center gap-2">
                    {/* Completeness badge */}
                    <span className={`badge ${completeness.score >= 80 ? 'bg-success' : completeness.score >= 50 ? 'bg-warning text-dark' : 'bg-secondary'}`}
                        style={{ fontSize: '0.8rem' }}>
                        {completeness.score}% complet
                    </span>
                    <Link to={isEditing ? `/opportunities/view/${id}` : '/opportunities/list'} className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-arrow-left me-1"></i> Annuler
                    </Link>
                </div>
            </div>

            {/* Step Navigation */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        {STEPS.map((step, idx) => (
                            <React.Fragment key={step.id}>
                                <button
                                    type="button"
                                    className="btn d-flex align-items-center gap-2 px-3 py-2 border-0"
                                    onClick={() => setCurrentStep(step.id)}
                                    style={{
                                        background: currentStep === step.id ? 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' : 'transparent',
                                        color: currentStep === step.id ? 'white' : '#6c757d',
                                        borderRadius: '8px',
                                        fontWeight: currentStep === step.id ? 600 : 400,
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    <span className="d-flex align-items-center justify-content-center"
                                        style={{ width: 28, height: 28, borderRadius: '50%', background: currentStep === step.id ? 'rgba(255,255,255,0.2)' : '#f0f0f0', fontSize: '0.75rem', fontWeight: 700 }}>
                                        {step.id}
                                    </span>
                                    <span className="d-none d-md-inline">
                                        <i className={`fas ${step.icon} me-1`}></i>{step.label}
                                        {Object.keys(fieldErrors).some(f => REQUIRED_FIELDS[f]?.step === step.id) && (
                                            <i className="fas fa-exclamation-circle text-danger ms-1" style={{ fontSize: '0.7rem' }}></i>
                                        )}
                                    </span>
                                </button>
                                {idx < STEPS.length - 1 && (
                                    <div style={{ flex: 1, height: 2, background: step.id < currentStep ? '#7ac142' : '#e9ecef', margin: '0 4px' }} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row align-items-start">
                    <div className="col-lg-8">
                        {/* STEP 1: Identification — Type, Title, Organization, Contact */}
                        {currentStep === 1 && (<>
                        {/* Type & Title */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <h5 className="mb-0"><i className="fas fa-tag text-primary me-2"></i>Type & Titre</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Type d'opportunité <span className="text-danger">*</span></label>
                                    <select className={`form-select ${fieldErrors.opportunity_type ? 'is-invalid' : ''}`} value={form.opportunity_type}
                                        onChange={e => handleChange('opportunity_type', e.target.value)}>
                                        <option value="job">Emploi</option>
                                        <option value="tender">Appel d'offres</option>
                                        <option value="market">Marché</option>
                                    </select>
                                    {fieldErrors.opportunity_type && <div className="invalid-feedback">{fieldErrors.opportunity_type}</div>}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Titre (FR) <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${fieldErrors.title_fr ? 'is-invalid' : ''}`} value={form.title_fr}
                                        onChange={e => handleChange('title_fr', e.target.value)} />
                                    {fieldErrors.title_fr && <div className="invalid-feedback">{fieldErrors.title_fr}</div>}
                                </div>
                                <div>
                                    <label className="form-label">Titre (EN)</label>
                                    <input type="text" className="form-control" value={form.title_en}
                                        onChange={e => handleChange('title_en', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        </>)}

                        {/* STEP 2: Content — Description */}
                        {currentStep === 2 && (<>
                        {/* Description */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0"><i className="fas fa-align-left text-primary me-2"></i>Description <span className="text-danger">*</span></h5>
                                <div className="btn-group btn-group-sm">
                                    <button type="button" className={`btn ${activeLang === 'fr' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setActiveLang('fr')}>FR</button>
                                    <button type="button" className={`btn ${activeLang === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setActiveLang('en')}>EN</button>
                                </div>
                            </div>
                            <div className="card-body">
                                <div style={{ display: activeLang === 'fr' ? 'block' : 'none', border: fieldErrors.description_fr ? '2px solid #dc3545' : 'none', borderRadius: 6 }}>
                                    <Editor
                                        id="desc-fr"
                                        key={`desc-fr-${loading}`}
                                        onInit={(evt, editor) => (editorRefFr.current = editor)}
                                        initialValue={form.description_fr}
                                        init={TINYMCE_CONFIG}
                                        onEditorChange={(content) => setForm(prev => ({ ...prev, description_fr: content }))}
                                    />
                                </div>
                                {fieldErrors.description_fr && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{fieldErrors.description_fr}</div>}
                                <div style={{ display: activeLang === 'en' ? 'block' : 'none' }}>
                                    <Editor
                                        id="desc-en"
                                        key={`desc-en-${loading}`}
                                        onInit={(evt, editor) => (editorRefEn.current = editor)}
                                        initialValue={form.description_en}
                                        init={TINYMCE_CONFIG}
                                        onEditorChange={(content) => setForm(prev => ({ ...prev, description_en: content }))}
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
                                        <label className="form-label">Organisation <span className="text-danger">*</span></label>
                                        <input type="text" className={`form-control ${fieldErrors.organization_name ? 'is-invalid' : ''}`} value={form.organization_name}
                                            onChange={e => handleChange('organization_name', e.target.value)} />
                                        {fieldErrors.organization_name && <div className="invalid-feedback">{fieldErrors.organization_name}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Nom du contact</label>
                                        <input type="text" className="form-control" value={form.contact_name}
                                            onChange={e => handleChange('contact_name', e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Email contact</label>
                                        <input type="email" className={`form-control ${fieldErrors.contact_email ? 'is-invalid' : ''}`} value={form.contact_email}
                                            onChange={e => handleChange('contact_email', e.target.value)} />
                                        {fieldErrors.contact_email && <div className="invalid-feedback">{fieldErrors.contact_email}</div>}
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Téléphone</label>
                                        <input type="text" className="form-control" value={form.contact_phone}
                                            onChange={e => handleChange('contact_phone', e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Site web de l'organisation</label>
                                        <input type="url" className="form-control" value={form.website_url}
                                            onChange={e => handleChange('website_url', e.target.value)}
                                            placeholder="https://www.organisation.org" />
                                    </div>
                                </div>
                                <div className="row g-3 mt-1">
                                    <div className="col-md-4">
                                        <label className="form-label">Référence officielle</label>
                                        <input type="text" className="form-control" value={form.tender_reference}
                                            onChange={e => handleChange('tender_reference', e.target.value)}
                                            placeholder="Ex: VA/2026/001" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label"><i className="fas fa-external-link-alt me-1"></i>Lien source officielle</label>
                                        <input type="url" className="form-control" value={form.source_url}
                                            onChange={e => handleChange('source_url', e.target.value)}
                                            placeholder="https://recrutement.org/offre-123" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label"><i className="fas fa-paper-plane me-1"></i>Lien direct de candidature</label>
                                        <input type="url" className="form-control" value={form.application_url}
                                            onChange={e => handleChange('application_url', e.target.value)}
                                            placeholder="https://recrutement.org/postuler" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        </>)}

                        {/* STEP 3: Metadata — Location, Job details, Salary */}
                        {currentStep === 3 && (<>
                        {/* Location */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <h5 className="mb-0"><i className="fas fa-map-marker-alt text-primary me-2"></i>Localisation</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">Pays <span className="text-danger">*</span></label>
                                        <SearchableCountrySelect
                                            value={form.country}
                                            onChange={v => handleChange('country', v)}
                                            hasError={!!fieldErrors.country}
                                        />
                                        {fieldErrors.country && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{fieldErrors.country}</div>}
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
                                    <div className="col-md-4">
                                        <label className="form-label">Mode de travail</label>
                                        <select className="form-select" value={form.work_mode}
                                            onChange={e => handleChange('work_mode', e.target.value)}>
                                            <option value="on_site">Sur site</option>
                                            <option value="remote">À distance</option>
                                            <option value="hybrid">Hybride</option>
                                            <option value="home_based">Home-based</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Job-specific fields */}
                        {form.opportunity_type === 'job' && (
                            <>
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-0">
                                    <h5 className="mb-0"><i className="fas fa-briefcase text-primary me-2"></i>Contrat & Poste</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-3">
                                            <label className="form-label">Nature du contrat</label>
                                            <select className="form-select" value={form.contract_type}
                                                onChange={e => handleChange('contract_type', e.target.value)}>
                                                <option value="">— Choisir —</option>
                                                <option value="cdi">CDI</option>
                                                <option value="cdd">CDD</option>
                                                <option value="consultancy">Consultance</option>
                                                <option value="internship">Stage</option>
                                                <option value="volunteer">Bénévolat</option>
                                                <option value="temporary">Temporaire</option>
                                                <option value="freelance">Freelance</option>
                                                <option value="fellowship">Fellowship</option>
                                                <option value="other">Autre</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Rythme de travail</label>
                                            <select className="form-select" value={form.work_rhythm}
                                                onChange={e => handleChange('work_rhythm', e.target.value)}>
                                                <option value="">— Choisir —</option>
                                                <option value="full_time">Temps plein</option>
                                                <option value="part_time">Temps partiel</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Durée du contrat</label>
                                            <input type="text" className="form-control" placeholder="ex: 12 mois"
                                                value={form.contract_duration} onChange={e => handleChange('contract_duration', e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Nombre de postes</label>
                                            <input type="number" className="form-control" min="1" value={form.positions_count}
                                                onChange={e => handleChange('positions_count', e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Date début contrat</label>
                                            <input type="date" className="form-control" value={form.contract_start_date}
                                                onChange={e => handleChange('contract_start_date', e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Date fin contrat</label>
                                            <input type="date" className="form-control" value={form.contract_end_date}
                                                onChange={e => handleChange('contract_end_date', e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Grade / Niveau</label>
                                            <input type="text" className="form-control" placeholder="ex: P-3, NOB"
                                                value={form.grade} onChange={e => handleChange('grade', e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Département</label>
                                            <input type="text" className="form-control" value={form.department}
                                                onChange={e => handleChange('department', e.target.value)} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Recrutement</label>
                                            <select className="form-select" value={form.recruitment_scope}
                                                onChange={e => handleChange('recruitment_scope', e.target.value)}>
                                                <option value="">— Portée —</option>
                                                <option value="national">National</option>
                                                <option value="international">International</option>
                                                <option value="regional">Régional</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Nationalité requise</label>
                                            <input type="text" className="form-control" placeholder="ex: Pays CEDEAO"
                                                value={form.nationality_required} onChange={e => handleChange('nationality_required', e.target.value)} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Langues requises</label>
                                            <input type="text" className="form-control" placeholder="ex: Français, Anglais"
                                                value={form.languages_required} onChange={e => handleChange('languages_required', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-0">
                                    <h5 className="mb-0"><i className="fas fa-user-tie text-primary me-2"></i>Profil & Rémunération</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label">Expérience requise</label>
                                            <input type="text" className="form-control" placeholder="ex: 2-5 ans"
                                                value={form.experience_required} onChange={e => handleChange('experience_required', e.target.value)} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Exp. min (années)</label>
                                            <input type="number" className="form-control" min="0"
                                                value={form.experience_min_years} onChange={e => handleChange('experience_min_years', e.target.value)} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Exp. max (années)</label>
                                            <input type="number" className="form-control" min="0"
                                                value={form.experience_max_years} onChange={e => handleChange('experience_max_years', e.target.value)} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Formation requise</label>
                                            <input type="text" className="form-control" placeholder="ex: DVM, Master"
                                                value={form.education_required} onChange={e => handleChange('education_required', e.target.value)} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Brut / Net</label>
                                            <select className="form-select" value={form.salary_type}
                                                onChange={e => handleChange('salary_type', e.target.value)}>
                                                <option value="">— Préciser —</option>
                                                <option value="gross">Brut</option>
                                                <option value="net">Net</option>
                                                <option value="undisclosed">Non communiqué</option>
                                            </select>
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
                                                <option value="">— Devise —</option>
                                                <option value="XAF">XAF</option>
                                                <option value="XOF">XOF</option>
                                                <option value="EUR">EUR</option>
                                                <option value="USD">USD</option>
                                                <option value="GBP">GBP</option>
                                                <option value="CHF">CHF</option>
                                                <option value="KES">KES</option>
                                                <option value="ZAR">ZAR</option>
                                                <option value="NGN">NGN</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Période</label>
                                            <select className="form-select" value={form.salary_period}
                                                onChange={e => handleChange('salary_period', e.target.value)}>
                                                <option value="">— Période —</option>
                                                <option value="hour">Heure</option>
                                                <option value="day">Jour</option>
                                                <option value="month">Mois</option>
                                                <option value="year">An</option>
                                                <option value="project">Projet / Mission</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </>
                        )}
                        </>)}
                    </div>

                    {/* Sidebar — STEP 4: Publication (always visible on step 4, sticky on other steps) */}
                    <div className={currentStep === 4 ? 'col-lg-8' : 'col-lg-4'} style={{ position: 'sticky', top: '5rem', alignSelf: 'flex-start' }}>
                        {/* Publish - Double status */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <h6 className="mb-0"><i className="fas fa-cogs text-primary me-2"></i>Publication</h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Statut éditorial</label>
                                    <select className="form-select" value={form.status}
                                        onChange={e => handleChange('status', e.target.value)}>
                                        <option value="draft">Brouillon</option>
                                        <option value="pending">En attente</option>
                                        <option value="submitted">Soumis</option>
                                        <option value="verified">Vérifié</option>
                                        <option value="scheduled">Programmé</option>
                                        <option value="published">Publié</option>
                                        <option value="closed">Clôturé</option>
                                        <option value="archived">Archivé</option>
                                        <option value="rejected">Rejeté</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Statut de l'offre</label>
                                    <select className="form-select" value={form.offer_status}
                                        onChange={e => handleChange('offer_status', e.target.value)}>
                                        <option value="open">Ouverte</option>
                                        <option value="closing_soon">Clôture prochaine</option>
                                        <option value="expired">Expirée</option>
                                        <option value="filled">Pourvue</option>
                                        <option value="suspended">Suspendue</option>
                                        <option value="cancelled">Annulée</option>
                                        <option value="continuous">Candidatures continues</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Date limite <span className="text-danger">*</span></label>
                                    <input type="date" className={`form-control ${fieldErrors.deadline ? 'is-invalid' : ''}`} value={form.deadline}
                                        onChange={e => handleChange('deadline', e.target.value)} />
                                    {fieldErrors.deadline && <div className="invalid-feedback">{fieldErrors.deadline}</div>}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Fuseau horaire</label>
                                    <select className="form-select form-select-sm" value={form.deadline_timezone}
                                        onChange={e => handleChange('deadline_timezone', e.target.value)}>
                                        <option value="UTC">UTC</option>
                                        <option value="Africa/Douala">Afrique Centrale (WAT)</option>
                                        <option value="Africa/Dakar">Afrique Ouest (GMT)</option>
                                        <option value="Africa/Nairobi">Afrique Est (EAT)</option>
                                        <option value="Africa/Johannesburg">Afrique Sud (SAST)</option>
                                        <option value="Europe/Paris">Paris (CET)</option>
                                    </select>
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
                                <hr className="my-2" />
                                <div className="mb-2">
                                    <label className="form-label small">Traduction EN</label>
                                    <select className="form-select form-select-sm" value={form.translation_status_en}
                                        onChange={e => handleChange('translation_status_en', e.target.value)}>
                                        <option value="not_started">Non traduit</option>
                                        <option value="auto">Traduction auto</option>
                                        <option value="to_review">À réviser</option>
                                        <option value="translated">Traduit</option>
                                        <option value="validated">Validé</option>
                                        <option value="obsolete">Obsolète</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Fichiers joints */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0">
                                <h6 className="mb-0"><i className="fas fa-paperclip text-primary me-2"></i>Fichiers joints</h6>
                            </div>
                            <div className="card-body">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        border: '2px dashed #dee2e6',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#7ac142'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#dee2e6'}
                                >
                                    {uploading ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Upload en cours...</>
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2 d-block"></i>
                                            <small className="text-muted">Cliquez pour ajouter des fichiers<br />PDF, Word, Excel, Images (max 50 Mo)</small>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />

                                {files.length > 0 && (
                                    <div className="mt-3">
                                        {files.map((file, index) => (
                                            <div key={index} className="d-flex align-items-center justify-content-between py-2 px-2 mb-1" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                                <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
                                                    <i className={`fas ${getFileIcon(file.type)} me-2`}></i>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={file.name}>{file.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{formatFileSize(file.size)}</div>
                                                    </div>
                                                </div>
                                                <button type="button" className="btn btn-sm text-danger p-0 ms-2" onClick={() => removeFile(index)} title="Supprimer">
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bouton soumettre */}
                        <button type="submit" className="btn w-100 mb-4" disabled={saving}
                            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', color: 'white' }}>
                            {saving ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                            ) : (
                                <><i className={`fas ${isEditing ? 'fa-save' : 'fa-plus-circle'} me-2`}></i>{isEditing ? 'Enregistrer' : 'Créer'}</>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Fixed Action Bar */}
            <div className="position-fixed bottom-0 start-0 end-0 bg-white border-top shadow-lg py-3 px-4"
                style={{ zIndex: 1050 }}>
                <div className="d-flex justify-content-between align-items-center" style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div className="d-flex gap-2">
                        {currentStep > 1 && (
                            <button type="button" className="btn btn-outline-secondary"
                                onClick={() => setCurrentStep(currentStep - 1)}>
                                <i className="fas fa-chevron-left me-1"></i> Précédent
                            </button>
                        )}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        {isDirty && <span className="text-muted small"><i className="fas fa-circle text-warning me-1" style={{ fontSize: 8 }}></i>Non enregistré</span>}

                        <button type="button" className="btn btn-outline-primary" onClick={handleSaveDraft} disabled={saving}>
                            <i className="fas fa-save me-1"></i> Enregistrer
                        </button>

                        {currentStep < 4 ? (
                            <button type="button" className="btn btn-primary"
                                onClick={() => setCurrentStep(currentStep + 1)}
                                style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                                Suivant <i className="fas fa-chevron-right ms-1"></i>
                            </button>
                        ) : (
                            <button type="button" className="btn btn-success" onClick={handleSubmit} disabled={saving}>
                                {saving ? (
                                    <><span className="spinner-border spinner-border-sm me-1"></span> Publication...</>
                                ) : (
                                    <><i className="fas fa-paper-plane me-1"></i> {isEditing ? 'Mettre à jour' : 'Publier'}</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* Spacer for fixed bar */}
            <div style={{ height: 80 }} />
        </>
    );
};

export default OpportunityEditor;
