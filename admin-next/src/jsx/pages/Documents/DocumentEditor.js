import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken, API_BASE_URL } from '../../../services/api';

// African countries list
const AFRICAN_COUNTRIES = [
    { code: 'DZ', name: 'Algerie' }, { code: 'AO', name: 'Angola' }, { code: 'BJ', name: 'Benin' },
    { code: 'BW', name: 'Botswana' }, { code: 'BF', name: 'Burkina Faso' }, { code: 'BI', name: 'Burundi' },
    { code: 'CV', name: 'Cap-Vert' }, { code: 'CM', name: 'Cameroun' }, { code: 'CF', name: 'Centrafrique' },
    { code: 'TD', name: 'Tchad' }, { code: 'KM', name: 'Comores' }, { code: 'CG', name: 'Congo' },
    { code: 'CD', name: 'RD Congo' }, { code: 'CI', name: "Cote d'Ivoire" }, { code: 'DJ', name: 'Djibouti' },
    { code: 'EG', name: 'Egypte' }, { code: 'GQ', name: 'Guinee equatoriale' }, { code: 'ER', name: 'Erythree' },
    { code: 'SZ', name: 'Eswatini' }, { code: 'ET', name: 'Ethiopie' }, { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambie' }, { code: 'GH', name: 'Ghana' }, { code: 'GN', name: 'Guinee' },
    { code: 'GW', name: 'Guinee-Bissau' }, { code: 'KE', name: 'Kenya' }, { code: 'LS', name: 'Lesotho' },
    { code: 'LR', name: 'Liberia' }, { code: 'LY', name: 'Libye' }, { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malawi' }, { code: 'ML', name: 'Mali' }, { code: 'MR', name: 'Mauritanie' },
    { code: 'MU', name: 'Maurice' }, { code: 'MA', name: 'Maroc' }, { code: 'MZ', name: 'Mozambique' },
    { code: 'NA', name: 'Namibie' }, { code: 'NE', name: 'Niger' }, { code: 'NG', name: 'Nigeria' },
    { code: 'RW', name: 'Rwanda' }, { code: 'ST', name: 'Sao Tome-et-Principe' }, { code: 'SN', name: 'Senegal' },
    { code: 'SC', name: 'Seychelles' }, { code: 'SL', name: 'Sierra Leone' }, { code: 'SO', name: 'Somalie' },
    { code: 'ZA', name: 'Afrique du Sud' }, { code: 'SS', name: 'Soudan du Sud' }, { code: 'SD', name: 'Soudan' },
    { code: 'TZ', name: 'Tanzanie' }, { code: 'TG', name: 'Togo' }, { code: 'TN', name: 'Tunisie' },
    { code: 'UG', name: 'Ouganda' }, { code: 'ZM', name: 'Zambie' }, { code: 'ZW', name: 'Zimbabwe' }
];

const DocumentEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const fileInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [toast, setToast] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedThumbnail, setSelectedThumbnail] = useState(null);
    const [existingFile, setExistingFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const [formData, setFormData] = useState({
        title_fr: '',
        title_en: '',
        description_fr: '',
        description_en: '',
        category_id: '',
        country_code: '',
        organization_id: '',
        language: 'fr',
        year_published: '',
        author: '',
        source_url: '',
        tags: '',
        status: 'draft',
        is_featured: false
    });

    useEffect(() => {
        fetchCategories();
        if (isEdit) fetchDocument();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchDocument = async () => {
        const res = await api.get(`/documents/${id}`, token);
        if (res.success) {
            const doc = res.data;
            setFormData({
                title_fr: doc.title_fr || '',
                title_en: doc.title_en || '',
                description_fr: doc.description_fr || '',
                description_en: doc.description_en || '',
                category_id: doc.category_id || '',
                country_code: doc.country_code || '',
                organization_id: doc.organization_id || '',
                language: doc.language || 'fr',
                year_published: doc.year_published || '',
                author: doc.author || '',
                source_url: doc.source_url || '',
                tags: doc.tags ? (Array.isArray(doc.tags) ? doc.tags.join(', ') : (typeof doc.tags === 'string' ? doc.tags : '')) : '',
                status: doc.status || 'draft',
                is_featured: doc.is_featured === 1
            });
            setExistingFile({
                name: doc.file_name,
                size: doc.file_size,
                type: doc.file_type,
                path: doc.file_path
            });
        }
        setLoading(false);
    };

    const fetchCategories = async () => {
        const res = await api.get('/documents/admin/categories', token);
        if (res.success) setCategories(res.data || []);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleThumbnailSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) setSelectedThumbnail(file);
    };

    const handleSubmit = async (submitStatus) => {
        if (!formData.title_fr) {
            setToast({ message: 'Le titre en francais est requis', type: 'error' });
            return;
        }
        if (!formData.category_id) {
            setToast({ message: 'La categorie est requise', type: 'error' });
            return;
        }
        if (!isEdit && !selectedFile) {
            setToast({ message: 'Le fichier est requis', type: 'error' });
            return;
        }

        setSaving(true);

        // Build FormData for multipart upload
        const fd = new FormData();
        if (selectedFile) fd.append('file', selectedFile);

        // Append all text fields
        const finalStatus = submitStatus || formData.status;
        fd.append('title_fr', formData.title_fr);
        fd.append('title_en', formData.title_en);
        fd.append('description_fr', formData.description_fr);
        fd.append('description_en', formData.description_en);
        fd.append('category_id', formData.category_id);
        fd.append('country_code', formData.country_code);
        fd.append('language', formData.language);
        fd.append('status', finalStatus);
        fd.append('is_featured', formData.is_featured ? '1' : '0');
        if (formData.organization_id) fd.append('organization_id', formData.organization_id);
        if (formData.year_published) fd.append('year_published', formData.year_published);
        if (formData.author) fd.append('author', formData.author);
        if (formData.source_url) fd.append('source_url', formData.source_url);
        if (formData.tags) {
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
            fd.append('tags', JSON.stringify(tagsArray));
        }

        let res;
        if (isEdit) {
            res = await api.upload(`/documents/${id}/update`, fd, token);
        } else {
            res = await api.upload('/documents', fd, token);
        }

        if (res.success) {
            setToast({ message: isEdit ? 'Document mis a jour' : 'Document cree', type: 'success' });
            setTimeout(() => navigate('/documents/list'), 1000);
        } else {
            setToast({ message: res.message || 'Erreur lors de la sauvegarde', type: 'error' });
        }

        setSaving(false);
    };

    const formatSize = (bytes) => {
        if (!bytes) return '-';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' Mo';
        if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' Ko';
        return bytes + ' o';
    };

    const getFileIcon = (type) => {
        const icons = {
            pdf: 'file-pdf', doc: 'file-word', docx: 'file-word',
            xls: 'file-excel', xlsx: 'file-excel',
            ppt: 'file-powerpoint', pptx: 'file-powerpoint',
            zip: 'file-archive', rar: 'file-archive'
        };
        return icons[type?.toLowerCase()] || 'file';
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
                        {isEdit ? 'Modifier le document' : 'Nouveau document'}
                    </h2>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link to="/documents/list">Documents</Link></li>
                            <li className="breadcrumb-item active">
                                {isEdit ? formData.title_fr || 'Modifier' : 'Nouveau'}
                            </li>
                        </ol>
                    </nav>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/documents/list')}>
                        <i className="fas fa-times me-2"></i> Annuler
                    </button>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => handleSubmit('draft')}
                        disabled={saving}
                    >
                        <i className="fas fa-save me-2"></i> Sauvegarder brouillon
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleSubmit('published')}
                        disabled={saving}
                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}
                    >
                        {saving ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span> Enregistrement...</>
                        ) : (
                            <><i className="fas fa-check me-2"></i> Publier</>
                        )}
                    </button>
                </div>
            </div>

            <div className="row">
                {/* Main column */}
                <div className="col-lg-8">
                    {/* Titles */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-heading me-2"></i> Titre du document</h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Titre (Francais) *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title_fr"
                                        value={formData.title_fr}
                                        onChange={handleChange}
                                        placeholder="Titre du document en francais"
                                        required
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Titre (Anglais)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title_en"
                                        value={formData.title_en}
                                        onChange={handleChange}
                                        placeholder="Document title in English"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-align-left me-2"></i> Description</h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Description (Francais)</label>
                                    <textarea
                                        className="form-control"
                                        name="description_fr"
                                        value={formData.description_fr}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Description du document en francais..."
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Description (Anglais)</label>
                                    <textarea
                                        className="form-control"
                                        name="description_en"
                                        value={formData.description_en}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Document description in English..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* File upload */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-upload me-2"></i> Fichier {!isEdit && '*'}</h6>
                        </div>
                        <div className="card-body">
                            {/* Drop zone */}
                            <div
                                className={`border-2 border-dashed rounded p-4 text-center ${dragOver ? 'border-primary bg-light' : 'border-secondary'}`}
                                style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleFileDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="d-none"
                                    onChange={handleFileSelect}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.gif,.webp"
                                />
                                {selectedFile ? (
                                    <div>
                                        <i className={`fas fa-${getFileIcon(selectedFile.name.split('.').pop())} fa-3x mb-2`} style={{ color: '#7ac142' }}></i>
                                        <p className="mb-1 fw-semibold">{selectedFile.name}</p>
                                        <small className="text-muted">{formatSize(selectedFile.size)} - {selectedFile.type}</small>
                                        <div className="mt-2">
                                            <button className="btn btn-sm btn-outline-danger" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                                                <i className="fas fa-times me-1"></i> Retirer
                                            </button>
                                        </div>
                                    </div>
                                ) : existingFile ? (
                                    <div>
                                        <i className={`fas fa-${getFileIcon(existingFile.type)} fa-3x mb-2 text-primary`}></i>
                                        <p className="mb-1 fw-semibold">{existingFile.name}</p>
                                        <small className="text-muted">{formatSize(existingFile.size)} - {(existingFile.type || '').toUpperCase()}</small>
                                        <p className="text-muted small mt-2 mb-0">Cliquez ou deposez un fichier pour remplacer</p>
                                    </div>
                                ) : (
                                    <div>
                                        <i className="fas fa-cloud-upload-alt fa-3x mb-2 text-muted"></i>
                                        <p className="mb-1">Glissez-deposez un fichier ici</p>
                                        <p className="text-muted small mb-0">ou cliquez pour selectionner</p>
                                        <small className="text-muted">PDF, Word, Excel, PowerPoint, ZIP, RAR, Images (max 50 Mo)</small>
                                    </div>
                                )}
                            </div>

                            {/* PDF Preview */}
                            {existingFile?.type === 'pdf' && existingFile?.path && (
                                <div className="mt-3">
                                    <label className="form-label">Apercu PDF</label>
                                    <iframe
                                        src={`${API_BASE_URL.replace('/api', '')}${existingFile.path}`}
                                        width="100%"
                                        height="400px"
                                        style={{ border: '1px solid #ddd', borderRadius: '4px' }}
                                        title="PDF Preview"
                                    />
                                </div>
                            )}

                            {/* Thumbnail upload */}
                            <div className="mt-3">
                                <label className="form-label">Miniature (optionnel)</label>
                                <input
                                    ref={thumbnailInputRef}
                                    type="file"
                                    className="form-control"
                                    onChange={handleThumbnailSelect}
                                    accept="image/*"
                                />
                                {selectedThumbnail && (
                                    <small className="text-muted">
                                        {selectedThumbnail.name} ({formatSize(selectedThumbnail.size)})
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Category */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-folder me-2"></i> Categorie *</h6>
                        </div>
                        <div className="card-body">
                            <select
                                className="form-select"
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selectionner une categorie...</option>
                                {categories.filter(c => !c.parent_id).map(cat => (
                                    <React.Fragment key={cat.id}>
                                        <option value={cat.id} style={{ fontWeight: 'bold' }}>
                                            {cat.name_fr}
                                        </option>
                                        {categories.filter(sub => sub.parent_id === cat.id).map(sub => (
                                            <option key={sub.id} value={sub.id}>
                                                &nbsp;&nbsp;&nbsp;&nbsp;{sub.name_fr}
                                            </option>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Country */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-globe-africa me-2"></i> Pays</h6>
                        </div>
                        <div className="card-body">
                            <select
                                className="form-select"
                                name="country_code"
                                value={formData.country_code}
                                onChange={handleChange}
                            >
                                <option value="">Tous les pays / International</option>
                                {AFRICAN_COUNTRIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-info-circle me-2"></i> Metadonnees</h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Langue du document</label>
                                <select className="form-select" name="language" value={formData.language} onChange={handleChange}>
                                    <option value="fr">Francais</option>
                                    <option value="en">Anglais</option>
                                    <option value="ar">Arabe</option>
                                    <option value="pt">Portugais</option>
                                    <option value="sw">Swahili</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Annee de publication</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="year_published"
                                    value={formData.year_published}
                                    onChange={handleChange}
                                    min="1900"
                                    max="2099"
                                    placeholder="Ex: 2024"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Auteur</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleChange}
                                    placeholder="Nom de l'auteur ou organisation"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">URL source</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    name="source_url"
                                    value={formData.source_url}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="mb-0">
                                <label className="form-label">Tags (separes par virgule)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="Ex: legislation, OIE, vaccination"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status & Featured */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-cog me-2"></i> Publication</h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Statut</label>
                                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                    <option value="draft">Brouillon</option>
                                    <option value="published">Publie</option>
                                    <option value="archived">Archive</option>
                                </select>
                            </div>
                            <div className="form-check form-switch">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    name="is_featured"
                                    checked={formData.is_featured}
                                    onChange={handleChange}
                                    id="is_featured"
                                />
                                <label className="form-check-label" htmlFor="is_featured">
                                    <i className="fas fa-star text-warning me-1"></i> Document mis en avant
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DocumentEditor;
