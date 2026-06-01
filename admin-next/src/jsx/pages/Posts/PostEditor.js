import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken, API_BASE_URL } from '../../../services/api';
import { Editor } from '@tinymce/tinymce-react';

// Import TinyMCE self-hosted
import 'tinymce/tinymce';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/skins/ui/oxide/skin.min.css';

// Plugins
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/autoresize';

const PostEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;
    const editorRefFr = useRef(null);
    const editorRefEn = useRef(null);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [posts, setPosts] = useState([]);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('content');
    const [activeLang, setActiveLang] = useState('fr');
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [media, setMedia] = useState([]);

    const [formData, setFormData] = useState({
        title_fr: '',
        title_en: '',
        slug: '',
        content_fr: '',
        content_en: '',
        excerpt_fr: '',
        excerpt_en: '',
        category_ids: [],
        featured_image: '',
        image_caption: '',
        status: 'draft',
        meta_title_fr: '',
        meta_title_en: '',
        meta_description_fr: '',
        meta_description_en: '',
        meta_keywords_fr: '',
        meta_keywords_en: ''
    });

    useEffect(() => {
        fetchCategories();
        fetchPosts();
        if (isEditing) {
            fetchPost();
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Close category dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showCategoryDropdown && !e.target.closest('.dropdown')) {
                setShowCategoryDropdown(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showCategoryDropdown]);

    const fetchPost = async () => {
        const res = await api.get(`/posts/${id}`, token);
        if (res.success && res.data) {
            // Handle category_ids - could be array or single category_id
            let categoryIds = [];
            if (res.data.category_ids && Array.isArray(res.data.category_ids)) {
                categoryIds = res.data.category_ids;
            } else if (res.data.category_id) {
                categoryIds = [res.data.category_id];
            }

            setFormData({
                title_fr: res.data.title_fr || res.data.title || '',
                title_en: res.data.title_en || '',
                slug: res.data.slug || '',
                content_fr: res.data.content_fr || res.data.content || '',
                content_en: res.data.content_en || '',
                excerpt_fr: res.data.excerpt_fr || res.data.excerpt || '',
                excerpt_en: res.data.excerpt_en || '',
                category_ids: categoryIds,
                featured_image: res.data.featured_image || '',
                image_caption: res.data.image_caption || '',
                status: res.data.status || 'draft',
                meta_title_fr: res.data.meta_title_fr || '',
                meta_title_en: res.data.meta_title_en || '',
                meta_description_fr: res.data.meta_description_fr || '',
                meta_description_en: res.data.meta_description_en || '',
                meta_keywords_fr: res.data.meta_keywords_fr || '',
                meta_keywords_en: res.data.meta_keywords_en || ''
            });
        }
        setLoading(false);
    };

    const fetchCategories = async () => {
        const res = await api.get('/categories', token);
        if (res.success) setCategories(res.data || []);
    };

    const fetchPosts = async () => {
        const res = await api.get('/posts', token);
        if (res.success) setPosts(res.data || []);
    };

    const fetchMedia = async () => {
        const res = await api.get('/media', token);
        if (res.success) setMedia(res.data || []);
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'title_fr' && !isEditing) {
                updated.slug = generateSlug(value);
            }
            return updated;
        });
    };

    const handleEditorChange = (content, lang) => {
        setFormData(prev => ({
            ...prev,
            [`content_${lang}`]: content
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title_fr && !formData.title_en) {
            setToast({ message: 'Veuillez saisir un titre', type: 'error' });
            return;
        }

        setSaving(true);

        try {
            const res = isEditing
                ? await api.put(`/posts/${id}`, formData, token)
                : await api.post('/posts', formData, token);

            if (res.success) {
                setToast({ message: isEditing ? 'Article mis a jour' : 'Article cree', type: 'success' });
                setTimeout(() => navigate('/posts'), 1000);
            } else {
                setToast({ message: res.message || 'Erreur lors de la sauvegarde', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Erreur de connexion', type: 'error' });
        }

        setSaving(false);
    };

    const openMediaPicker = () => {
        fetchMedia();
        setShowMediaPicker(true);
    };

    const selectImage = (url) => {
        setFormData(prev => ({ ...prev, featured_image: url }));
        setShowMediaPicker(false);
    };

    // TinyMCE configuration
    const editorConfig = {
        height: 420,
        min_height: 380,
        max_height: 600,
        autoresize_bottom_margin: 10,
        menubar: false,
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
            'quickbars', 'autoresize'
        ],
        skin: false,
        content_css: false,
        toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | table | fullscreen',
        toolbar_mode: 'wrap',
        contextmenu: 'link image table',
        paste_data_images: true,
        paste_enable_default_filters: true,
        paste_word_valid_elements: 'p,b,strong,i,em,u,s,sub,sup,ol,ul,li,a[href],h1,h2,h3,h4,h5,h6,table,tr,td,th,thead,tbody,img[src|alt|width|height],br,hr,span,blockquote',
        paste_retain_style_properties: 'color,background-color,font-size,font-family,text-decoration',
        paste_merge_formats: true,
        paste_convert_word_fake_lists: true,
        image_advtab: true,
        image_caption: true,
        automatic_uploads: true,
        images_upload_url: `${API_BASE_URL}/media/upload`,
        images_upload_credentials: true,
        file_picker_types: 'image media',
        images_upload_handler: async (blobInfo, progress) => {
            return new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('files', blobInfo.blob(), blobInfo.filename());
                formData.append('folder', 'posts');

                fetch(`${API_BASE_URL}/media/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success && result.data && result.data.length > 0) {
                        // Backend returns array, get first item's URL
                        resolve(result.data[0].url);
                    } else {
                        reject('Erreur lors de l\'upload');
                    }
                })
                .catch((err) => {
                    console.error('Upload error:', err);
                    reject('Erreur de connexion');
                });
            });
        },
        link_list: posts.map(p => ({
            title: p.title_fr || p.title,
            value: `/article/${p.slug}`
        })),
        link_default_target: '_blank',
        link_assume_external_targets: true,
        content_style: `
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 15px;
                line-height: 1.6;
                color: #333;
                padding: 12px;
            }
            img { max-width: 100%; height: auto; border-radius: 6px; }
            a { color: #7ac142; }
            table { border-collapse: collapse; width: 100%; }
            table td, table th { border: 1px solid #ddd; padding: 8px; }
        `,
        branding: false,
        promotion: false,
        statusbar: true,
        resize: true,
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
        quickbars_insert_toolbar: 'quickimage quicktable',
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'content', icon: 'fa-file-alt', label: 'Contenu' },
        { id: 'media', icon: 'fa-image', label: 'Media' },
        { id: 'seo', icon: 'fa-search', label: 'SEO' },
    ];

    return (
        <div className="post-editor">
            {/* Toast */}
            {toast && (
                <div
                    className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                    style={{ top: '20px', right: '20px', zIndex: 9999, borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}
                >
                    <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
                            <div className="modal-header border-0 py-2">
                                <h6 className="modal-title"><i className="fas fa-images me-2" style={{ color: '#7ac142' }}></i>Mediatheque</h6>
                                <button type="button" className="btn-close" onClick={() => setShowMediaPicker(false)}></button>
                            </div>
                            <div className="modal-body py-2">
                                {media.length > 0 ? (
                                    <div className="row g-2">
                                        {media.map((item) => (
                                            <div key={item.id} className="col-3">
                                                <img
                                                    src={item.url}
                                                    alt={item.filename}
                                                    className="img-fluid rounded"
                                                    style={{ aspectRatio: '1', objectFit: 'cover', width: '100%', cursor: 'pointer' }}
                                                    onClick={() => selectImage(item.url)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        <i className="fas fa-folder-open fa-2x mb-2 opacity-50"></i>
                                        <p className="mb-0 small">Aucune image</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header compact */}
            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                <h6 className="mb-0 fw-bold">
                    <i className={`fas fa-${isEditing ? 'edit' : 'plus-circle'} me-2`} style={{ color: '#7ac142' }}></i>
                    {isEditing ? 'Modifier l\'article' : 'Nouvel article'}
                </h6>
                <div className="d-flex gap-2">
                    <Link to="/posts" className="btn btn-light btn-sm">
                        <i className="fas fa-arrow-left me-1"></i>Retour
                    </Link>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="btn btn-sm text-white"
                        disabled={saving}
                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}
                    >
                        {saving ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                </div>
            </div>

            {/* Title + Slug + Status - Always visible */}
            <div className="card border-0 mb-2" style={{ borderRadius: '10px' }}>
                <div className="card-body p-2">
                    <div className="row g-2 align-items-end">
                        <div className="col-md-5">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <label className="form-label small text-muted mb-0">Titre</label>
                                <div className="btn-group btn-group-sm">
                                    <button
                                        type="button"
                                        className={`btn btn-xs ${activeLang === 'fr' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setActiveLang('fr')}
                                        style={{
                                            padding: '1px 8px',
                                            fontSize: '0.7rem',
                                            ...(activeLang === 'fr' ? { background: '#7ac142', borderColor: '#7ac142' } : {})
                                        }}
                                    >
                                        FR
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-xs ${activeLang === 'en' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setActiveLang('en')}
                                        style={{
                                            padding: '1px 8px',
                                            fontSize: '0.7rem',
                                            ...(activeLang === 'en' ? { background: '#7ac142', borderColor: '#7ac142' } : {})
                                        }}
                                    >
                                        EN
                                    </button>
                                </div>
                            </div>
                            <input
                                type="text"
                                className="form-control form-control-sm border-0 bg-light"
                                name={`title_${activeLang}`}
                                value={formData[`title_${activeLang}`]}
                                onChange={handleChange}
                                placeholder={activeLang === 'fr' ? "Titre de l'article..." : "Article title..."}
                                style={{ borderRadius: '6px' }}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small text-muted mb-1">URL</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-0 small">/article/</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm border-0 bg-light"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small text-muted mb-1">
                                Categories
                                {formData.category_ids && formData.category_ids.length > 0 && (
                                    <span className="badge bg-success ms-1" style={{ fontSize: '0.65rem' }}>{formData.category_ids.length}</span>
                                )}
                            </label>
                            <div
                                className="dropdown"
                            >
                                <button
                                    type="button"
                                    className="btn btn-sm btn-light border-0 bg-light w-100 text-start d-flex justify-content-between align-items-center"
                                    data-bs-toggle="dropdown"
                                    style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                >
                                    <span className="text-truncate">
                                        {formData.category_ids && formData.category_ids.length > 0
                                            ? `${formData.category_ids.length} categorie(s)`
                                            : 'Selectionner...'}
                                    </span>
                                    <i className="fas fa-chevron-down ms-1" style={{ fontSize: '0.6rem' }}></i>
                                </button>
                                {showCategoryDropdown && (
                                    <div
                                        className="position-absolute bg-white rounded shadow-sm p-2 mt-1"
                                        style={{
                                            zIndex: 1000,
                                            minWidth: '200px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            border: '1px solid #eee'
                                        }}
                                    >
                                        {categories.map(cat => (
                                            <div key={cat.id} className="form-check py-1">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={`cat-${cat.id}`}
                                                    checked={formData.category_ids?.includes(cat.id) || false}
                                                    onChange={(e) => {
                                                        const catId = cat.id;
                                                        setFormData(prev => {
                                                            const currentIds = prev.category_ids || [];
                                                            if (e.target.checked) {
                                                                return { ...prev, category_ids: [...currentIds, catId] };
                                                            } else {
                                                                return { ...prev, category_ids: currentIds.filter(id => id !== catId) };
                                                            }
                                                        });
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <label
                                                    className="form-check-label small"
                                                    htmlFor={`cat-${cat.id}`}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {cat.name_fr || cat.name}
                                                </label>
                                            </div>
                                        ))}
                                        {categories.length === 0 && (
                                            <div className="text-muted small py-2 text-center">Aucune categorie</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-md-1">
                            <select
                                className="form-select form-select-sm border-0 bg-light"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                style={{ borderRadius: '6px' }}
                            >
                                <option value="draft">Brouillon</option>
                                <option value="published">Publie</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <ul className="nav nav-pills nav-fill mb-2 p-1 bg-light rounded" style={{ borderRadius: '8px' }}>
                {tabs.map(tab => (
                    <li key={tab.id} className="nav-item">
                        <button
                            type="button"
                            className={`nav-link py-1 px-2 ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                ...(activeTab === tab.id ? { background: '#7ac142', color: 'white' } : { color: '#666' })
                            }}
                        >
                            <i className={`fas ${tab.icon} me-1`}></i>{tab.label}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Tab Content */}
            <div className="card border-0" style={{ borderRadius: '10px' }}>
                <div className="card-body p-2">

                    {/* CONTENT TAB */}
                    {activeTab === 'content' && (
                        <>
                            {/* Excerpt - Above Editor */}
                            <div className="mb-2">
                                <label className="form-label small text-muted mb-1">
                                    <i className="fas fa-quote-left me-1"></i>
                                    {activeLang === 'fr' ? 'Extrait / Resume (FR)' : 'Excerpt / Summary (EN)'}
                                </label>
                                <textarea
                                    className="form-control form-control-sm border-0 bg-light"
                                    name={`excerpt_${activeLang}`}
                                    value={formData[`excerpt_${activeLang}`]}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder={activeLang === 'fr' ? 'Resume court de l\'article en francais...' : 'Short summary in English...'}
                                    style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                />
                            </div>

                            {/* Tip - Between Excerpt and Editor */}
                            <div className="mb-2 text-end">
                                <small className="text-muted">
                                    <i className="fas fa-lightbulb me-1" style={{ color: '#7ac142' }}></i>Coller Word + images directement
                                </small>
                            </div>

                            {/* Editor */}
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label small text-muted mb-0">
                                        <i className="fas fa-file-alt me-1"></i>
                                        {activeLang === 'fr' ? 'Contenu de l\'article (FR)' : 'Article Content (EN)'}
                                    </label>
                                    <span className={`badge ${activeLang === 'fr' ? 'bg-primary' : 'bg-info'}`} style={{ fontSize: '0.65rem' }}>
                                        {activeLang === 'fr' ? 'Version Francaise' : 'English Version'}
                                    </span>
                                </div>
                                {activeLang === 'fr' ? (
                                    <Editor
                                        onInit={(evt, editor) => editorRefFr.current = editor}
                                        value={formData.content_fr}
                                        onEditorChange={(content) => handleEditorChange(content, 'fr')}
                                        init={{ ...editorConfig, placeholder: 'Redigez votre article en francais...', license_key: 'gpl' }}
                                    />
                                ) : (
                                    <Editor
                                        onInit={(evt, editor) => editorRefEn.current = editor}
                                        value={formData.content_en}
                                        onEditorChange={(content) => handleEditorChange(content, 'en')}
                                        init={{ ...editorConfig, placeholder: 'Write your article in English...', license_key: 'gpl' }}
                                    />
                                )}
                            </div>
                        </>
                    )}

                    {/* MEDIA TAB */}
                    {activeTab === 'media' && (
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small text-muted mb-2">
                                    <i className="fas fa-image me-1" style={{ color: '#7ac142' }}></i>Image a la une
                                </label>
                                {formData.featured_image ? (
                                    <div className="position-relative">
                                        <img
                                            src={formData.featured_image}
                                            alt="Featured"
                                            className="img-fluid rounded"
                                            style={{ maxHeight: '180px', width: '100%', objectFit: 'cover' }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm position-absolute"
                                            style={{ top: '8px', right: '8px' }}
                                            onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-light btn-sm position-absolute"
                                            style={{ bottom: '8px', right: '8px' }}
                                            onClick={openMediaPicker}
                                        >
                                            <i className="fas fa-exchange-alt"></i> Changer
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className="border-dashed rounded d-flex flex-column align-items-center justify-content-center p-4"
                                        style={{ cursor: 'pointer', background: 'rgba(122,193,66,0.05)', border: '2px dashed rgba(122,193,66,0.3)', minHeight: '150px' }}
                                        onClick={openMediaPicker}
                                    >
                                        <i className="fas fa-cloud-upload-alt fa-2x mb-2" style={{ color: '#7ac142' }}></i>
                                        <span className="text-muted small">Cliquer pour choisir une image</span>
                                    </div>
                                )}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small text-muted mb-2">
                                    <i className="fas fa-link me-1" style={{ color: '#7ac142' }}></i>Ou URL directe
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm border-0 bg-light"
                                    name="featured_image"
                                    value={formData.featured_image}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    style={{ borderRadius: '6px' }}
                                />
                                <label className="form-label small text-muted mb-2 mt-3">
                                    <i className="fas fa-pen-fancy me-1" style={{ color: '#7ac142' }}></i>Légende de l'image
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm border-0 bg-light"
                                    name="image_caption"
                                    value={formData.image_caption}
                                    onChange={handleChange}
                                    placeholder="Ex: Photo © AFP / Un troupeau dans le Sahel"
                                    style={{ borderRadius: '6px' }}
                                />
                                <div className="mt-3 p-3 rounded" style={{ background: 'rgba(122,193,66,0.08)' }}>
                                    <small className="text-muted">
                                        <i className="fas fa-info-circle me-1" style={{ color: '#7ac142' }}></i>
                                        <strong>Conseil:</strong> Utilisez des images de 1200x630px pour un affichage optimal sur les reseaux sociaux.
                                    </small>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEO TAB */}
                    {activeTab === 'seo' && (
                        <>
                            {/* SEO Header */}
                            <div className="d-flex justify-content-end align-items-center mb-3">
                                <span className="badge bg-light text-muted">
                                    <i className="fas fa-globe me-1"></i>Referencement {activeLang.toUpperCase()}
                                </span>
                            </div>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small text-muted mb-1">
                                        <i className="fas fa-heading me-1"></i>Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm border-0 bg-light"
                                        name={`meta_title_${activeLang}`}
                                        value={formData[`meta_title_${activeLang}`]}
                                        onChange={handleChange}
                                        placeholder="Titre pour Google (60 caracteres max)"
                                        style={{ borderRadius: '6px' }}
                                    />
                                    <small className="text-muted">{(formData[`meta_title_${activeLang}`] || '').length}/60</small>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small text-muted mb-1">
                                        <i className="fas fa-tags me-1"></i>Mots-cles
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm border-0 bg-light"
                                        name={`meta_keywords_${activeLang}`}
                                        value={formData[`meta_keywords_${activeLang}`]}
                                        onChange={handleChange}
                                        placeholder="mot1, mot2, mot3"
                                        style={{ borderRadius: '6px' }}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small text-muted mb-1">
                                        <i className="fas fa-align-left me-1"></i>Meta Description
                                    </label>
                                    <textarea
                                        className="form-control form-control-sm border-0 bg-light"
                                        name={`meta_description_${activeLang}`}
                                        value={formData[`meta_description_${activeLang}`]}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Description pour les moteurs de recherche (160 caracteres max)"
                                        style={{ borderRadius: '6px' }}
                                    />
                                    <small className="text-muted">{(formData[`meta_description_${activeLang}`] || '').length}/160</small>
                                </div>

                                {/* Preview Google */}
                                <div className="col-12">
                                    <label className="form-label small text-muted mb-1">
                                        <i className="fab fa-google me-1"></i>Apercu Google
                                    </label>
                                    <div className="p-3 rounded" style={{ background: '#f8f9fa' }}>
                                        <div style={{ color: '#1a0dab', fontSize: '18px', marginBottom: '3px' }}>
                                            {formData[`meta_title_${activeLang}`] || formData[`title_${activeLang}`] || 'Titre de l\'article'}
                                        </div>
                                        <div style={{ color: '#006621', fontSize: '14px', marginBottom: '3px' }}>
                                            africavet.com/article/{formData.slug || 'url-article'}
                                        </div>
                                        <div style={{ color: '#545454', fontSize: '13px' }}>
                                            {formData[`meta_description_${activeLang}`] || formData[`excerpt_${activeLang}`] || 'Description de l\'article...'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .tox-tinymce {
                    border-radius: 8px !important;
                    border: 1px solid #e9ecef !important;
                }
                .tox .tox-toolbar__primary {
                    background: #f8f9fa !important;
                }
                .tox .tox-statusbar {
                    border-top: 1px solid #e9ecef !important;
                }
                .nav-pills .nav-link:not(.active):hover {
                    background: rgba(122,193,66,0.1);
                }
            `}</style>
        </div>
    );
};

export default PostEditor;
