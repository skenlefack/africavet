import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

const PageEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('fr');
    const [pages, setPages] = useState([]); // For parent selection
    const editorRefFr = useRef(null);
    const editorRefEn = useRef(null);

    const [form, setForm] = useState({
        title_fr: '',
        title_en: '',
        slug: '',
        content_fr: '',
        content_en: '',
        excerpt_fr: '',
        excerpt_en: '',
        template: 'default',
        parent_id: '',
        status: 'draft',
        featured_image: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        show_title: true,
        show_breadcrumb: true,
        sort_order: 0
    });

    useEffect(() => {
        fetchPages();
        if (isEditing) {
            fetchPage();
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPages = async () => {
        const res = await api.get('/pages', token);
        if (res.success) {
            // Exclude current page from parent options
            setPages((res.data || []).filter(p => p.id !== parseInt(id)));
        }
    };

    const fetchPage = async () => {
        const res = await api.get(`/pages/${id}`, token);
        if (res.success && res.data) {
            const page = res.data;
            setForm({
                title_fr: page.title_fr || page.title || '',
                title_en: page.title_en || '',
                slug: page.slug || '',
                content_fr: page.content_fr || page.content || '',
                content_en: page.content_en || '',
                excerpt_fr: page.excerpt_fr || page.excerpt || '',
                excerpt_en: page.excerpt_en || '',
                template: page.template || 'default',
                parent_id: page.parent_id || '',
                status: page.status || 'draft',
                featured_image: page.featured_image || '',
                meta_title: page.meta_title || '',
                meta_description: page.meta_description || '',
                meta_keywords: page.meta_keywords || '',
                show_title: page.show_title !== false,
                show_breadcrumb: page.show_breadcrumb !== false,
                sort_order: page.sort_order || 0
            });
        }
        setLoading(false);
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setForm(prev => ({
            ...prev,
            title_fr: title,
            slug: prev.slug || generateSlug(title)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        // Prepare data - use title_fr as main title for backend compatibility
        const data = {
            title: form.title_fr,
            title_fr: form.title_fr,
            title_en: form.title_en,
            slug: form.slug,
            content: form.content_fr,
            content_fr: form.content_fr,
            content_en: form.content_en,
            excerpt: form.excerpt_fr,
            excerpt_fr: form.excerpt_fr,
            excerpt_en: form.excerpt_en,
            template: form.template,
            parent_id: form.parent_id || null,
            status: form.status,
            featured_image: form.featured_image,
            meta_title: form.meta_title,
            meta_description: form.meta_description,
            meta_keywords: form.meta_keywords,
            show_title: form.show_title,
            show_breadcrumb: form.show_breadcrumb,
            sort_order: form.sort_order
        };

        const res = isEditing
            ? await api.put(`/pages/${id}`, data, token)
            : await api.post('/pages', data, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Page mise à jour' : 'Page créée', type: 'success' });
            if (!isEditing && res.data?.id) {
                setTimeout(() => navigate(`/pages/${res.data.id}`), 1000);
            }
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
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
        images_upload_handler: async (blobInfo) => {
            return new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('files', blobInfo.blob(), blobInfo.filename());
                formData.append('folder', 'pages');

                fetch(`${API_BASE_URL}/media/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success && result.data && result.data.length > 0) {
                        resolve(result.data[0].url);
                    } else {
                        reject('Erreur lors de l\'upload');
                    }
                })
                .catch(() => reject('Erreur de connexion'));
            });
        },
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
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1" style={{ fontWeight: '700' }}>
                            {isEditing ? 'Modifier la page' : 'Nouvelle page'}
                        </h2>
                        <p className="text-muted mb-0">
                            {form.title_fr || 'Sans titre'}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/pages" className="btn btn-outline-secondary">
                            <i className="fas fa-arrow-left me-2"></i> Retour
                        </Link>
                        {isEditing && (
                            <Link to={`/pagebuilder/${id}`} className="btn btn-outline-info">
                                <i className="fas fa-magic me-2"></i> Page Builder
                            </Link>
                        )}
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
                                    {isEditing ? 'Mettre à jour' : 'Créer'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        <div className="card mb-4">
                            <div className="card-header">
                                <ul className="nav nav-tabs card-header-tabs">
                                    <li className="nav-item">
                                        <button
                                            type="button"
                                            className={`nav-link ${activeTab === 'fr' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('fr')}
                                        >
                                            Français
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            type="button"
                                            className={`nav-link ${activeTab === 'en' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('en')}
                                        >
                                            English
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-body">
                                {activeTab === 'fr' ? (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">Titre (FR) *</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={form.title_fr}
                                                onChange={handleTitleChange}
                                                required
                                                placeholder="Titre de la page"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Extrait (FR)</label>
                                            <textarea
                                                className="form-control"
                                                value={form.excerpt_fr}
                                                onChange={(e) => setForm({ ...form, excerpt_fr: e.target.value })}
                                                rows={2}
                                                placeholder="Courte description..."
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Contenu (FR)</label>
                                            <Editor
                                                onInit={(evt, editor) => editorRefFr.current = editor}
                                                value={form.content_fr}
                                                onEditorChange={(content) => setForm(prev => ({ ...prev, content_fr: content }))}
                                                init={{ ...editorConfig, placeholder: 'Contenu de la page...', license_key: 'gpl' }}
                                            />
                                            <small className="text-muted">
                                                Pour un contenu avancé avec sections, utilisez le Page Builder
                                            </small>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">Title (EN)</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={form.title_en}
                                                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                                                placeholder="Page title"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Excerpt (EN)</label>
                                            <textarea
                                                className="form-control"
                                                value={form.excerpt_en}
                                                onChange={(e) => setForm({ ...form, excerpt_en: e.target.value })}
                                                rows={2}
                                                placeholder="Short description..."
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Content (EN)</label>
                                            <Editor
                                                onInit={(evt, editor) => editorRefEn.current = editor}
                                                value={form.content_en}
                                                onEditorChange={(content) => setForm(prev => ({ ...prev, content_en: content }))}
                                                init={{ ...editorConfig, placeholder: 'Page content...', license_key: 'gpl' }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* SEO */}
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">SEO</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Meta Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.meta_title}
                                        onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                                        placeholder="Titre pour les moteurs de recherche"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Meta Description</label>
                                    <textarea
                                        className="form-control"
                                        value={form.meta_description}
                                        onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                                        rows={2}
                                        placeholder="Description pour les moteurs de recherche"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Meta Keywords</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.meta_keywords}
                                        onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
                                        placeholder="mot-clé1, mot-clé2, mot-clé3"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Publication */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">Publication</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Statut</label>
                                    <select
                                        className="form-select"
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="draft">Brouillon</option>
                                        <option value="published">Publié</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Slug *</label>
                                    <div className="input-group">
                                        <span className="input-group-text">/</span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.slug}
                                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hierarchy */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">Hiérarchie</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Page parente</label>
                                    <select
                                        className="form-select"
                                        value={form.parent_id}
                                        onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                                    >
                                        <option value="">-- Aucune (racine) --</option>
                                        {pages.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.title_fr || p.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Ordre</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.sort_order}
                                        onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Template */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">Template</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Modèle de page</label>
                                    <select
                                        className="form-select"
                                        value={form.template}
                                        onChange={(e) => setForm({ ...form, template: e.target.value })}
                                    >
                                        <option value="default">Par défaut</option>
                                        <option value="full-width">Pleine largeur</option>
                                        <option value="sidebar-left">Sidebar gauche</option>
                                        <option value="sidebar-right">Sidebar droite</option>
                                        <option value="landing">Landing page</option>
                                    </select>
                                </div>
                                <div className="form-check mb-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="showTitle"
                                        checked={form.show_title}
                                        onChange={(e) => setForm({ ...form, show_title: e.target.checked })}
                                    />
                                    <label className="form-check-label" htmlFor="showTitle">
                                        Afficher le titre
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="showBreadcrumb"
                                        checked={form.show_breadcrumb}
                                        onChange={(e) => setForm({ ...form, show_breadcrumb: e.target.checked })}
                                    />
                                    <label className="form-check-label" htmlFor="showBreadcrumb">
                                        Afficher le fil d'Ariane
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Image mise en avant</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.featured_image}
                                        onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
                                        placeholder="URL de l'image"
                                    />
                                </div>
                                {form.featured_image && (
                                    <img
                                        src={form.featured_image}
                                        alt="Preview"
                                        className="img-fluid rounded"
                                        style={{ maxHeight: '200px', objectFit: 'cover', width: '100%' }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default PageEditor;
