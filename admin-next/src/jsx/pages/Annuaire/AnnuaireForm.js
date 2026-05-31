import React, { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

// Import TinyMCE self-hosted
import 'tinymce/tinymce';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/autoresize';

const AFRICAN_COUNTRIES = [
    { code2: 'DZ', code3: 'DZA', nom_fr: 'Algérie' }, { code2: 'AO', code3: 'AGO', nom_fr: 'Angola' },
    { code2: 'BJ', code3: 'BEN', nom_fr: 'Bénin' }, { code2: 'BW', code3: 'BWA', nom_fr: 'Botswana' },
    { code2: 'BF', code3: 'BFA', nom_fr: 'Burkina Faso' }, { code2: 'BI', code3: 'BDI', nom_fr: 'Burundi' },
    { code2: 'CV', code3: 'CPV', nom_fr: 'Cap-Vert' }, { code2: 'CM', code3: 'CMR', nom_fr: 'Cameroun' },
    { code2: 'CF', code3: 'CAF', nom_fr: 'Centrafrique' }, { code2: 'TD', code3: 'TCD', nom_fr: 'Tchad' },
    { code2: 'KM', code3: 'COM', nom_fr: 'Comores' }, { code2: 'CG', code3: 'COG', nom_fr: 'Congo' },
    { code2: 'CD', code3: 'COD', nom_fr: 'RD Congo' }, { code2: 'CI', code3: 'CIV', nom_fr: "Côte d'Ivoire" },
    { code2: 'DJ', code3: 'DJI', nom_fr: 'Djibouti' }, { code2: 'EG', code3: 'EGY', nom_fr: 'Égypte' },
    { code2: 'GQ', code3: 'GNQ', nom_fr: 'Guinée équatoriale' }, { code2: 'ER', code3: 'ERI', nom_fr: 'Érythrée' },
    { code2: 'SZ', code3: 'SWZ', nom_fr: 'Eswatini' }, { code2: 'ET', code3: 'ETH', nom_fr: 'Éthiopie' },
    { code2: 'GA', code3: 'GAB', nom_fr: 'Gabon' }, { code2: 'GM', code3: 'GMB', nom_fr: 'Gambie' },
    { code2: 'GH', code3: 'GHA', nom_fr: 'Ghana' }, { code2: 'GN', code3: 'GIN', nom_fr: 'Guinée' },
    { code2: 'GW', code3: 'GNB', nom_fr: 'Guinée-Bissau' }, { code2: 'KE', code3: 'KEN', nom_fr: 'Kenya' },
    { code2: 'LS', code3: 'LSO', nom_fr: 'Lesotho' }, { code2: 'LR', code3: 'LBR', nom_fr: 'Liberia' },
    { code2: 'LY', code3: 'LBY', nom_fr: 'Libye' }, { code2: 'MG', code3: 'MDG', nom_fr: 'Madagascar' },
    { code2: 'MW', code3: 'MWI', nom_fr: 'Malawi' }, { code2: 'ML', code3: 'MLI', nom_fr: 'Mali' },
    { code2: 'MR', code3: 'MRT', nom_fr: 'Mauritanie' }, { code2: 'MU', code3: 'MUS', nom_fr: 'Maurice' },
    { code2: 'MA', code3: 'MAR', nom_fr: 'Maroc' }, { code2: 'MZ', code3: 'MOZ', nom_fr: 'Mozambique' },
    { code2: 'NA', code3: 'NAM', nom_fr: 'Namibie' }, { code2: 'NE', code3: 'NER', nom_fr: 'Niger' },
    { code2: 'NG', code3: 'NGA', nom_fr: 'Nigeria' }, { code2: 'RW', code3: 'RWA', nom_fr: 'Rwanda' },
    { code2: 'ST', code3: 'STP', nom_fr: 'São Tomé-et-Príncipe' }, { code2: 'SN', code3: 'SEN', nom_fr: 'Sénégal' },
    { code2: 'SC', code3: 'SYC', nom_fr: 'Seychelles' }, { code2: 'SL', code3: 'SLE', nom_fr: 'Sierra Leone' },
    { code2: 'SO', code3: 'SOM', nom_fr: 'Somalie' }, { code2: 'ZA', code3: 'ZAF', nom_fr: 'Afrique du Sud' },
    { code2: 'SS', code3: 'SSD', nom_fr: 'Soudan du Sud' }, { code2: 'SD', code3: 'SDN', nom_fr: 'Soudan' },
    { code2: 'TZ', code3: 'TZA', nom_fr: 'Tanzanie' }, { code2: 'TG', code3: 'TGO', nom_fr: 'Togo' },
    { code2: 'TN', code3: 'TUN', nom_fr: 'Tunisie' }, { code2: 'UG', code3: 'UGA', nom_fr: 'Ouganda' },
    { code2: 'ZM', code3: 'ZMB', nom_fr: 'Zambie' }, { code2: 'ZW', code3: 'ZWE', nom_fr: 'Zimbabwe' },
];

const ORGANIZATION_TYPES = [
    { value: 'clinic', label: 'Clinique vétérinaire' },
    { value: 'hospital', label: 'Hôpital vétérinaire' },
    { value: 'laboratory', label: 'Laboratoire' },
    { value: 'pharmacy', label: 'Pharmacie vétérinaire' },
    { value: 'distributor', label: 'Distributeur' },
    { value: 'school', label: 'École / Université' },
    { value: 'institution', label: 'Institution gouvernementale' },
    { value: 'ngo', label: 'ONG / Projet' },
    { value: 'association', label: 'Association professionnelle' },
    { value: 'research', label: 'Centre de recherche' },
    { value: 'other', label: 'Autre' },
];

const EXPERT_CATEGORIES = [
    { value: 'veterinarian', label: 'Vétérinaire' },
    { value: 'researcher', label: 'Chercheur' },
    { value: 'professor', label: 'Professeur / Enseignant' },
    { value: 'technician', label: 'Technicien' },
    { value: 'paraprofessional', label: 'Paraprofessionnel' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'other', label: 'Autre' },
];

const SPECIES_OPTIONS = [
    'Bovins', 'Ovins-Caprins', 'Volailles', 'Porcins',
    'Compagnie (chiens/chats)', 'Équins', 'Aquaculture',
    'Faune sauvage', 'Apiculture', 'Camélidés',
];

const SERVICE_OPTIONS = [
    'Consultation', 'Chirurgie', 'Vaccination', 'Analyses laboratoire',
    'Imagerie médicale', 'Hospitalisation', 'Urgences', 'Reproduction',
    'Nutrition animale', 'Formation', 'Conseil', 'Insémination artificielle',
    'Inspection sanitaire', 'Vente de médicaments', 'Déparasitage',
];

const TINYMCE_CONFIG = {
    height: 300,
    menubar: false,
    plugins: 'advlist autolink lists link image charmap preview searchreplace visualblocks code fullscreen media table help wordcount autoresize',
    toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code',
    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; }',
    skin: false,
    content_css: false,
    promotion: false,
    branding: false,
};

const TagInput = ({ value = [], onChange, options = [], placeholder = 'Ajouter...' }) => {
    const [input, setInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const addTag = (tag) => {
        if (tag && !value.includes(tag)) {
            onChange([...value, tag]);
        }
        setInput('');
        setShowSuggestions(false);
    };

    const removeTag = (idx) => {
        onChange(value.filter((_, i) => i !== idx));
    };

    const suggestions = options.filter(o => !value.includes(o) && o.toLowerCase().includes(input.toLowerCase()));

    return (
        <div className="position-relative">
            <div className="form-control d-flex flex-wrap gap-1 align-items-center" style={{ minHeight: 38, height: 'auto', cursor: 'text' }}>
                {value.map((tag, idx) => (
                    <span key={idx} className="badge bg-primary d-inline-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
                        {tag}
                        <i className="fas fa-times" style={{ cursor: 'pointer', fontSize: '10px' }} onClick={() => removeTag(idx)}></i>
                    </span>
                ))}
                <input
                    type="text"
                    className="border-0 flex-grow-1"
                    style={{ outline: 'none', minWidth: 100, fontSize: '14px' }}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); addTag(input.trim()); }
                        if (e.key === 'Backspace' && !input && value.length) removeTag(value.length - 1);
                    }}
                    placeholder={value.length === 0 ? placeholder : ''}
                />
            </div>
            {showSuggestions && input && suggestions.length > 0 && (
                <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
                    {suggestions.slice(0, 8).map((s, i) => (
                        <div key={i} className="px-3 py-2 cursor-pointer" style={{ cursor: 'pointer' }}
                             onMouseDown={() => addTag(s)}>
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AnnuaireForm = ({ initialData = {}, onSubmit, saving = false, isEditing = false }) => {
    const descFrRef = useRef(null);
    const descEnRef = useRef(null);

    const isExpert = initialData._entryType === 'expert' || initialData.first_name !== undefined;

    const [entryType, setEntryType] = useState(initialData._entryType || (isExpert ? 'expert' : 'organization'));
    const [activeSection, setActiveSection] = useState(0);
    const [langTab, setLangTab] = useState('fr');

    const parseJsonField = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
        return [];
    };

    const [form, setForm] = useState({
        // Common
        name: initialData.name || '',
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        acronym: initialData.acronym || '',
        type: initialData.type || initialData.organization_type || '',
        category: initialData.category || '',
        // Contact
        country: initialData.country || '',
        country_code: initialData.country_code || '',
        city: initialData.city || '',
        address: initialData.address || '',
        region: initialData.region || '',
        contact_email: initialData.contact_email || initialData.email || '',
        contact_phone: initialData.contact_phone || initialData.phone || '',
        whatsapp: initialData.whatsapp || '',
        website: initialData.website || '',
        // Activities
        services: parseJsonField(initialData.services),
        species_treated: parseJsonField(initialData.species_treated),
        specialties: parseJsonField(initialData.specialties),
        specialization: initialData.specialization || '',
        skills: parseJsonField(initialData.skills),
        // Description
        description: initialData.description || initialData.biography || '',
        description_en: initialData.description_en || '',
        mission: initialData.mission || '',
        // Options
        submission_status: initialData.submission_status || 'draft',
        is_active: initialData.is_active !== undefined ? !!initialData.is_active : false,
        available_24_7: !!initialData.available_24_7,
        show_email: initialData.show_email !== 0,
        show_phone: initialData.show_phone !== 0,
        license_number: initialData.license_number || '',
        coverage_area: initialData.coverage_area || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        founded_year: initialData.founded_year || '',
        years_experience: initialData.years_experience || '',
    });

    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleCountryChange = (countryName) => {
        const country = AFRICAN_COUNTRIES.find(c => c.nom_fr === countryName);
        setForm(prev => ({
            ...prev,
            country: countryName,
            country_code: country ? country.code3 : ''
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setPhotoPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const validate = () => {
        const errs = {};
        const isOrg = entryType === 'organization';

        if (isOrg && !form.name.trim()) errs.name = 'Le nom est obligatoire';
        if (!isOrg && !form.first_name.trim() && !form.last_name.trim()) errs.first_name = 'Le nom est obligatoire';
        if (!form.country) errs.country = 'Le pays est obligatoire';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (status) => {
        if (!validate()) {
            setActiveSection(0);
            return;
        }

        const descFr = descFrRef.current?.getContent() || form.description;
        const descEn = descEnRef.current?.getContent() || form.description_en;

        const data = {
            type: entryType,
            submission_status: status || form.submission_status,
            is_active: status === 'approved' ? true : form.is_active,
        };

        if (entryType === 'organization') {
            Object.assign(data, {
                name: form.name,
                acronym: form.acronym,
                organization_type: form.type,
                description: descFr,
                description_en: descEn,
                mission: form.mission,
                contact_email: form.contact_email,
                contact_phone: form.contact_phone,
                website: form.website,
                whatsapp: form.whatsapp,
                country: form.country,
                country_code: form.country_code,
                city: form.city,
                address: form.address,
                region: form.region,
                services: form.services,
                species_treated: form.species_treated,
                specialties: form.specialties,
                available_24_7: form.available_24_7,
                show_email: form.show_email,
                show_phone: form.show_phone,
                license_number: form.license_number,
                coverage_area: form.coverage_area,
                latitude: form.latitude,
                longitude: form.longitude,
                founded_year: form.founded_year ? parseInt(form.founded_year) : null,
            });
        } else {
            Object.assign(data, {
                first_name: form.first_name,
                last_name: form.last_name,
                title: form.type, // reuse type field for expert title
                category: form.category,
                specialization: form.specialization,
                biography: descFr,
                email: form.contact_email,
                phone: form.contact_phone,
                website: form.website,
                whatsapp: form.whatsapp,
                country: form.country,
                country_code: form.country_code,
                city: form.city,
                address: form.address,
                region: form.region,
                skills: form.skills,
                show_email: form.show_email,
                show_phone: form.show_phone,
                years_experience: form.years_experience ? parseInt(form.years_experience) : null,
                latitude: form.latitude,
                longitude: form.longitude,
            });
        }

        onSubmit(data, photoFile);
    };

    const sections = [
        { title: 'Identité', icon: 'fa-id-card' },
        { title: 'Coordonnées', icon: 'fa-map-marker-alt' },
        { title: 'Activités', icon: 'fa-cogs' },
        { title: 'Description', icon: 'fa-align-left' },
        { title: 'Médias', icon: 'fa-images' },
        { title: 'Options', icon: 'fa-sliders-h' },
    ];

    return (
        <>
            {/* Section Nav */}
            <div className="card mb-4">
                <div className="card-body py-2">
                    <div className="d-flex flex-wrap gap-1">
                        {sections.map((sec, idx) => (
                            <button
                                key={idx}
                                className={`btn btn-sm ${activeSection === idx ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setActiveSection(idx)}
                            >
                                <i className={`fas ${sec.icon} me-1`}></i> {sec.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Section 0: Identité */}
            {activeSection === 0 && (
                <div className="card mb-4">
                    <div className="card-header bg-white">
                        <h5 className="mb-0"><i className="fas fa-id-card text-primary me-2"></i>Type & Identité</h5>
                    </div>
                    <div className="card-body">
                        {!isEditing && (
                            <div className="mb-4">
                                <label className="form-label fw-semibold">Type d'entrée *</label>
                                <div className="d-flex gap-3">
                                    <div
                                        className={`card flex-fill cursor-pointer ${entryType === 'organization' ? 'border-primary' : ''}`}
                                        style={{ cursor: 'pointer', borderWidth: entryType === 'organization' ? 2 : 1 }}
                                        onClick={() => setEntryType('organization')}
                                    >
                                        <div className="card-body text-center py-3">
                                            <i className={`fas fa-building fa-2x mb-2 ${entryType === 'organization' ? 'text-primary' : 'text-muted'}`}></i>
                                            <h6 className="mb-0">Organisation</h6>
                                            <small className="text-muted">Clinique, labo, association...</small>
                                        </div>
                                    </div>
                                    <div
                                        className={`card flex-fill cursor-pointer ${entryType === 'expert' ? 'border-primary' : ''}`}
                                        style={{ cursor: 'pointer', borderWidth: entryType === 'expert' ? 2 : 1 }}
                                        onClick={() => setEntryType('expert')}
                                    >
                                        <div className="card-body text-center py-3">
                                            <i className={`fas fa-user-md fa-2x mb-2 ${entryType === 'expert' ? 'text-primary' : 'text-muted'}`}></i>
                                            <h6 className="mb-0">Expert</h6>
                                            <small className="text-muted">Vétérinaire, chercheur...</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {entryType === 'organization' ? (
                            <div className="row g-3">
                                <div className="col-md-8">
                                    <label className="form-label fw-semibold">Nom de l'organisation *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        value={form.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Nom complet de l'organisation"
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Sigle</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.acronym}
                                        onChange={(e) => handleChange('acronym', e.target.value)}
                                        placeholder="Ex: OIE, FAO"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Type d'organisation</label>
                                    <select className="form-select" value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
                                        <option value="">Sélectionner...</option>
                                        {ORGANIZATION_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                {form.founded_year !== undefined && (
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Année de fondation</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={form.founded_year}
                                            onChange={(e) => handleChange('founded_year', e.target.value)}
                                            placeholder="Ex: 1990"
                                            min="1800" max={new Date().getFullYear()}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Prénom *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                                        value={form.first_name}
                                        onChange={(e) => handleChange('first_name', e.target.value)}
                                    />
                                    {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Nom de famille *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.last_name}
                                        onChange={(e) => handleChange('last_name', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Catégorie</label>
                                    <select className="form-select" value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
                                        <option value="">Sélectionner...</option>
                                        {EXPERT_CATEGORIES.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Années d'expérience</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.years_experience}
                                        onChange={(e) => handleChange('years_experience', e.target.value)}
                                        min="0" max="70"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Section 1: Coordonnées */}
            {activeSection === 1 && (
                <div className="card mb-4">
                    <div className="card-header bg-white">
                        <h5 className="mb-0"><i className="fas fa-map-marker-alt text-danger me-2"></i>Coordonnées</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Pays *</label>
                                <select
                                    className={`form-select ${errors.country ? 'is-invalid' : ''}`}
                                    value={form.country}
                                    onChange={(e) => handleCountryChange(e.target.value)}
                                >
                                    <option value="">Sélectionner un pays...</option>
                                    {AFRICAN_COUNTRIES.map(c => (
                                        <option key={c.code2} value={c.nom_fr}>{c.nom_fr}</option>
                                    ))}
                                </select>
                                {errors.country && <div className="invalid-feedback">{errors.country}</div>}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Ville</label>
                                <input type="text" className="form-control" value={form.city}
                                       onChange={(e) => handleChange('city', e.target.value)} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Adresse</label>
                                <input type="text" className="form-control" value={form.address}
                                       onChange={(e) => handleChange('address', e.target.value)} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Région</label>
                                <input type="text" className="form-control" value={form.region}
                                       onChange={(e) => handleChange('region', e.target.value)} />
                            </div>
                            <div className="col-12"><hr className="my-2" /></div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Email</label>
                                <input type="email" className="form-control" value={form.contact_email}
                                       onChange={(e) => handleChange('contact_email', e.target.value)} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Téléphone</label>
                                <input type="text" className="form-control" value={form.contact_phone}
                                       onChange={(e) => handleChange('contact_phone', e.target.value)}
                                       placeholder="+221 77 000 0000" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">WhatsApp</label>
                                <input type="text" className="form-control" value={form.whatsapp}
                                       onChange={(e) => handleChange('whatsapp', e.target.value)}
                                       placeholder="+221 77 000 0000" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Site web</label>
                                <input type="url" className="form-control" value={form.website}
                                       onChange={(e) => handleChange('website', e.target.value)}
                                       placeholder="https://" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Section 2: Activités */}
            {activeSection === 2 && (
                <div className="card mb-4">
                    <div className="card-header bg-white">
                        <h5 className="mb-0"><i className="fas fa-cogs text-success me-2"></i>Activités & Spécialités</h5>
                    </div>
                    <div className="card-body">
                        {entryType === 'expert' && (
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Spécialisation principale</label>
                                <input type="text" className="form-control" value={form.specialization}
                                       onChange={(e) => handleChange('specialization', e.target.value)}
                                       placeholder="Ex: Chirurgie vétérinaire, Épidémiologie..." />
                            </div>
                        )}
                        {entryType === 'expert' ? (
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Compétences</label>
                                <TagInput
                                    value={form.skills}
                                    onChange={(val) => handleChange('skills', val)}
                                    options={SERVICE_OPTIONS}
                                    placeholder="Ajouter une compétence..."
                                />
                            </div>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Services proposés</label>
                                    <TagInput
                                        value={form.services}
                                        onChange={(val) => handleChange('services', val)}
                                        options={SERVICE_OPTIONS}
                                        placeholder="Ajouter un service..."
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Espèces traitées</label>
                                    <TagInput
                                        value={form.species_treated}
                                        onChange={(val) => handleChange('species_treated', val)}
                                        options={SPECIES_OPTIONS}
                                        placeholder="Ajouter une espèce..."
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Spécialités</label>
                                    <TagInput
                                        value={form.specialties}
                                        onChange={(val) => handleChange('specialties', val)}
                                        options={[]}
                                        placeholder="Ajouter une spécialité..."
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Section 3: Description */}
            {activeSection === 3 && (
                <div className="card mb-4">
                    <div className="card-header bg-white">
                        <h5 className="mb-0"><i className="fas fa-align-left text-info me-2"></i>Description</h5>
                    </div>
                    <div className="card-body">
                        {/* Language tabs */}
                        <ul className="nav nav-tabs mb-3">
                            <li className="nav-item">
                                <button className={`nav-link ${langTab === 'fr' ? 'active' : ''}`} onClick={() => setLangTab('fr')}>
                                    <span className="badge bg-primary me-1">FR</span> Français
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${langTab === 'en' ? 'active' : ''}`} onClick={() => setLangTab('en')}>
                                    <span className="badge bg-secondary me-1">EN</span> English
                                </button>
                            </li>
                        </ul>

                        {langTab === 'fr' && (
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    {entryType === 'expert' ? 'Biographie (FR)' : 'Description (FR)'}
                                </label>
                                <Editor
                                    onInit={(evt, editor) => descFrRef.current = editor}
                                    initialValue={form.description}
                                    init={TINYMCE_CONFIG}
                                />
                            </div>
                        )}
                        {langTab === 'en' && (
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    {entryType === 'expert' ? 'Biography (EN)' : 'Description (EN)'}
                                </label>
                                <Editor
                                    onInit={(evt, editor) => descEnRef.current = editor}
                                    initialValue={form.description_en}
                                    init={TINYMCE_CONFIG}
                                />
                            </div>
                        )}

                        {entryType === 'organization' && (
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Mission</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={form.mission}
                                    onChange={(e) => handleChange('mission', e.target.value)}
                                    placeholder="Décrivez la mission de l'organisation..."
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Section 4: Médias */}
            {activeSection === 4 && (
                <div className="card mb-4">
                    <div className="card-header bg-white">
                        <h5 className="mb-0"><i className="fas fa-images text-warning me-2"></i>Médias</h5>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                {entryType === 'expert' ? 'Photo de profil' : 'Logo'}
                            </label>
                            <input type="file" className="form-control" accept="image/*" onChange={handlePhotoChange} />
                            {photoPreview && (
                                <img src={photoPreview} alt="Preview" className="mt-2 rounded" style={{ maxHeight: 150 }} />
                            )}
                            {!photoPreview && initialData.photo && (
                                <div className="mt-2">
                                    <small className="text-muted">Fichier actuel : {initialData.photo}</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Section 5: Options */}
            {activeSection === 5 && (
                <div className="card mb-4">
                    <div className="card-header bg-white">
                        <h5 className="mb-0"><i className="fas fa-sliders-h text-secondary me-2"></i>Options</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Statut</label>
                                <select className="form-select" value={form.submission_status}
                                        onChange={(e) => handleChange('submission_status', e.target.value)}>
                                    <option value="draft">Brouillon</option>
                                    <option value="pending">En attente</option>
                                    <option value="approved">Approuvé</option>
                                    <option value="rejected">Rejeté</option>
                                </select>
                            </div>
                            {entryType === 'organization' && (
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">N° Licence / Agrément</label>
                                    <input type="text" className="form-control" value={form.license_number}
                                           onChange={(e) => handleChange('license_number', e.target.value)} />
                                </div>
                            )}
                            {entryType === 'organization' && (
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Zone de couverture</label>
                                    <input type="text" className="form-control" value={form.coverage_area}
                                           onChange={(e) => handleChange('coverage_area', e.target.value)}
                                           placeholder="Ex: Dakar et environs" />
                                </div>
                            )}
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Latitude</label>
                                <input type="text" className="form-control" value={form.latitude}
                                       onChange={(e) => handleChange('latitude', e.target.value)} placeholder="Ex: 14.6937" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Longitude</label>
                                <input type="text" className="form-control" value={form.longitude}
                                       onChange={(e) => handleChange('longitude', e.target.value)} placeholder="Ex: -17.4441" />
                            </div>
                            <div className="col-12">
                                <hr className="my-2" />
                                <div className="d-flex flex-wrap gap-4 mt-2">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" checked={form.show_email}
                                               onChange={(e) => handleChange('show_email', e.target.checked)} id="showEmail" />
                                        <label className="form-check-label" htmlFor="showEmail">Afficher l'email</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" checked={form.show_phone}
                                               onChange={(e) => handleChange('show_phone', e.target.checked)} id="showPhone" />
                                        <label className="form-check-label" htmlFor="showPhone">Afficher le téléphone</label>
                                    </div>
                                    {entryType === 'organization' && (
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox" checked={form.available_24_7}
                                                   onChange={(e) => handleChange('available_24_7', e.target.checked)} id="avail247" />
                                            <label className="form-check-label" htmlFor="avail247">Disponible 24/7</label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="card">
                <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div className="d-flex gap-2">
                        {activeSection > 0 && (
                            <button className="btn btn-outline-secondary" onClick={() => setActiveSection(activeSection - 1)}>
                                <i className="fas fa-arrow-left me-1"></i> Précédent
                            </button>
                        )}
                        {activeSection < sections.length - 1 && (
                            <button className="btn btn-outline-primary" onClick={() => setActiveSection(activeSection + 1)}>
                                Suivant <i className="fas fa-arrow-right ms-1"></i>
                            </button>
                        )}
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleSubmit('draft')}
                            disabled={saving}
                        >
                            <i className="fas fa-save me-1"></i> Brouillon
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleSubmit('approved')}
                            disabled={saving}
                            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}
                        >
                            {saving ? (
                                <><span className="spinner-border spinner-border-sm me-1"></span> Enregistrement...</>
                            ) : (
                                <><i className="fas fa-check me-1"></i> {isEditing ? 'Enregistrer' : 'Publier'}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AnnuaireForm;
