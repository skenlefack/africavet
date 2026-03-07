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

const CampaignEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [scheduling, setScheduling] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeLang, setActiveLang] = useState('fr');
    const [sendProgress, setSendProgress] = useState(null);
    const progressInterval = useRef(null);
    const editorRefFr = useRef(null);
    const editorRefEn = useRef(null);

    // Data
    const [lists, setLists] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [posts, setPosts] = useState([]);
    const [subscribersCount, setSubscribersCount] = useState(0);

    const [form, setForm] = useState({
        subject_fr: '',
        subject_en: '',
        content_html_fr: '',
        content_html_en: '',
        template_id: '',
        list_ids: [],
        target_language: 'all',
        status: 'draft',
        scheduled_at: '',
        attachments: []
    });

    const [testEmail, setTestEmail] = useState('');

    useEffect(() => {
        fetchData();
        if (isEditing) fetchCampaign();
        return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchData = async () => {
        const [listsRes, tmplRes, postsRes, subsRes] = await Promise.all([
            api.get('/newsletter/lists', token),
            api.get('/newsletter/templates', token),
            api.get('/posts', token),
            api.get('/newsletter/subscribers', token)
        ]);
        if (listsRes.success) setLists(listsRes.data || []);
        if (tmplRes.success) setTemplates(tmplRes.data || []);
        if (postsRes.success) setPosts(postsRes.data || []);
        if (subsRes.success) {
            const active = (subsRes.data || []).filter(s => s.status === 'active');
            setSubscribersCount(active.length);
        }
    };

    const fetchCampaign = async () => {
        const res = await api.get(`/newsletter/campaigns/${id}`, token);
        if (res.success && res.data) {
            const c = res.data;
            setForm({
                subject_fr: c.subject_fr || c.subject || '',
                subject_en: c.subject_en || '',
                content_html_fr: c.content_html_fr || c.content || '',
                content_html_en: c.content_html_en || '',
                template_id: c.template_id || '',
                list_ids: c.list_ids || [],
                target_language: c.target_language || 'all',
                status: c.status || 'draft',
                scheduled_at: c.scheduled_at || '',
                attachments: c.attachments || []
            });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleListToggle = (listId) => {
        setForm(prev => {
            const ids = prev.list_ids.includes(listId)
                ? prev.list_ids.filter(id => id !== listId)
                : [...prev.list_ids, listId];
            return { ...prev, list_ids: ids };
        });
    };

    const handleTemplateSelect = async (templateId) => {
        setForm(prev => ({ ...prev, template_id: templateId }));
        if (templateId) {
            const tmpl = templates.find(t => t.id === parseInt(templateId));
            if (tmpl) {
                setForm(prev => ({
                    ...prev,
                    template_id: templateId,
                    content_html_fr: tmpl.content_html_fr || prev.content_html_fr,
                    content_html_en: tmpl.content_html_en || prev.content_html_en,
                    subject_fr: tmpl.subject_fr || prev.subject_fr,
                    subject_en: tmpl.subject_en || prev.subject_en
                }));
            }
        }
    };

    const handleInsertArticle = (post) => {
        const articleHtml = `<div style="border:1px solid #eee;border-radius:8px;padding:16px;margin:16px 0;">
            ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title_fr || post.title}" style="width:100%;max-height:200px;object-fit:cover;border-radius:6px;margin-bottom:12px;">` : ''}
            <h3 style="margin:0 0 8px;"><a href="https://africavet.com/article/${post.slug}">${activeLang === 'fr' ? (post.title_fr || post.title) : (post.title_en || post.title_fr || post.title)}</a></h3>
            <p style="color:#666;margin:0 0 12px;">${activeLang === 'fr' ? (post.excerpt_fr || '') : (post.excerpt_en || post.excerpt_fr || '')}</p>
            <a href="https://africavet.com/article/${post.slug}" style="color:#7ac142;font-weight:bold;">Lire la suite &rarr;</a>
        </div>`;
        const editor = activeLang === 'fr' ? editorRefFr.current : editorRefEn.current;
        if (editor) {
            editor.insertContent(articleHtml);
        } else {
            const field = `content_html_${activeLang}`;
            setForm(prev => ({ ...prev, [field]: prev[field] + articleHtml }));
        }
    };

    const handleAttachmentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.upload('/newsletter/attachments', formData, token);
        if (res.success && res.data) {
            setForm(prev => ({
                ...prev,
                attachments: [...prev.attachments, { name: file.name, url: res.data.url || res.data, size: file.size }]
            }));
            setToast({ message: 'Pièce jointe ajoutée', type: 'success' });
        } else {
            setToast({ message: res.message || 'Erreur upload', type: 'error' });
        }
    };

    const removeAttachment = (idx) => {
        setForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject_fr.trim()) {
            setToast({ message: 'Le sujet FR est requis', type: 'error' });
            return;
        }

        setSaving(true);
        const res = isEditing
            ? await api.put(`/newsletter/campaigns/${id}`, form, token)
            : await api.post('/newsletter/campaigns', form, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Campagne modifiée' : 'Campagne créée', type: 'success' });
            if (!isEditing && res.data?.id) {
                setTimeout(() => navigate(`/newsletter/campaigns/${res.data.id}`), 1000);
            }
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
    };

    const handleSendTest = async () => {
        if (!testEmail.trim()) { setToast({ message: 'Entrez un email', type: 'error' }); return; }
        const res = await api.post(`/newsletter/campaigns/${id}/test`, { email: testEmail }, token);
        if (res.success) setToast({ message: `Email test envoyé à ${testEmail}`, type: 'success' });
        else setToast({ message: res.message || 'Erreur', type: 'error' });
    };

    const handleSend = async () => {
        if (window.confirm(`Envoyer cette campagne à ${subscribersCount} abonnés actifs ?`)) {
            setSending(true);
            const res = await api.post(`/newsletter/campaigns/${id}/send`, {}, token);
            if (res.success) {
                setToast({ message: 'Envoi démarré', type: 'success' });
                // Start polling for progress
                progressInterval.current = setInterval(async () => {
                    const progRes = await api.get(`/newsletter/campaigns/${id}/progress`, token);
                    if (progRes.success && progRes.data) {
                        setSendProgress(progRes.data);
                        if (progRes.data.completed || progRes.data.progress >= 100) {
                            clearInterval(progressInterval.current);
                            progressInterval.current = null;
                            setSending(false);
                            setSendProgress(null);
                            setForm(prev => ({ ...prev, status: 'sent' }));
                            setToast({ message: 'Campagne envoyée avec succès', type: 'success' });
                        }
                    }
                }, 2000);
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
                setSending(false);
            }
        }
    };

    const handleSchedule = async () => {
        if (!form.scheduled_at) { setToast({ message: 'Sélectionnez une date', type: 'error' }); return; }
        setScheduling(true);
        const res = await api.post(`/newsletter/campaigns/${id}/schedule`, { scheduled_at: form.scheduled_at }, token);
        if (res.success) {
            setToast({ message: 'Campagne programmée', type: 'success' });
            setForm(prev => ({ ...prev, status: 'scheduled' }));
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setScheduling(false);
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
        toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code | fullscreen',
        toolbar_mode: 'wrap',
        contextmenu: 'link image table',
        paste_data_images: true,
        paste_enable_default_filters: true,
        paste_word_valid_elements: 'p,b,strong,i,em,u,s,sub,sup,ol,ul,li,a[href],h1,h2,h3,h4,h5,h6,table,tr,td,th,thead,tbody,img[src|alt|width|height],br,hr,span,blockquote,div',
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
                formData.append('folder', 'newsletter');

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

            {/* Send Progress */}
            {sendProgress && (
                <div className="alert alert-info">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong><i className="fas fa-paper-plane me-2"></i>Envoi en cours...</strong>
                        <span>{sendProgress.sent || 0} / {sendProgress.total || subscribersCount}</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                            style={{ width: `${sendProgress.progress || 0}%` }}></div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1" style={{ fontWeight: '700' }}>
                            {isEditing ? 'Modifier la campagne' : 'Nouvelle campagne'}
                        </h2>
                        <p className="text-muted mb-0">{form.subject_fr || 'Créer une campagne email'}</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/newsletter" className="btn btn-outline-secondary">
                            <i className="fas fa-arrow-left me-2"></i> Retour
                        </Link>
                        {isEditing && form.status === 'draft' && (
                            <button type="button" className="btn btn-success" onClick={handleSend} disabled={sending}>
                                {sending ? <><span className="spinner-border spinner-border-sm me-2"></span>Envoi...</> :
                                    <><i className="fas fa-paper-plane me-2"></i>Envoyer</>}
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary" disabled={saving}
                            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                            {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</> :
                                <><i className="fas fa-save me-2"></i>{isEditing ? 'Enregistrer' : 'Créer'}</>}
                        </button>
                    </div>
                </div>

                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        {/* Subject */}
                        <div className="card mb-4">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0"><i className="fas fa-heading me-2" style={{ color: '#354e84' }}></i>Sujet</h5>
                                <div className="btn-group btn-group-sm">
                                    <button type="button" className={`btn ${activeLang === 'fr' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setActiveLang('fr')}
                                        style={activeLang === 'fr' ? { background: '#7ac142', borderColor: '#7ac142' } : {}}>FR</button>
                                    <button type="button" className={`btn ${activeLang === 'en' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setActiveLang('en')}
                                        style={activeLang === 'en' ? { background: '#7ac142', borderColor: '#7ac142' } : {}}>EN</button>
                                </div>
                            </div>
                            <div className="card-body">
                                {activeLang === 'fr' ? (
                                    <input type="text" className="form-control" name="subject_fr" value={form.subject_fr}
                                        onChange={handleChange} placeholder="Sujet de l'email en français *" required />
                                ) : (
                                    <input type="text" className="form-control" name="subject_en" value={form.subject_en}
                                        onChange={handleChange} placeholder="Email subject in English" />
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="card mb-4">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0"><i className="fas fa-file-code me-2" style={{ color: '#7ac142' }}></i>Contenu ({activeLang.toUpperCase()})</h5>
                                <div className="d-flex gap-2">
                                    {/* Template select */}
                                    <select className="form-select form-select-sm" style={{ width: 'auto' }}
                                        value={form.template_id} onChange={(e) => handleTemplateSelect(e.target.value)}>
                                        <option value="">-- Charger un template --</option>
                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="card-body">
                                {activeLang === 'fr' ? (
                                    <Editor
                                        onInit={(evt, editor) => editorRefFr.current = editor}
                                        value={form.content_html_fr}
                                        onEditorChange={(content) => setForm(prev => ({ ...prev, content_html_fr: content }))}
                                        init={{ ...editorConfig, placeholder: 'Contenu de la newsletter...', license_key: 'gpl' }}
                                    />
                                ) : (
                                    <Editor
                                        onInit={(evt, editor) => editorRefEn.current = editor}
                                        value={form.content_html_en}
                                        onEditorChange={(content) => setForm(prev => ({ ...prev, content_html_en: content }))}
                                        init={{ ...editorConfig, placeholder: 'Newsletter content...', license_key: 'gpl' }}
                                    />
                                )}
                                <small className="text-muted">Utilisez les variables {'{nom}'}, {'{email}'} pour personnaliser.</small>
                            </div>
                        </div>

                        {/* Insert Article */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="fas fa-newspaper me-2" style={{ color: '#E67E22' }}></i>Insérer un article</h5>
                            </div>
                            <div className="card-body" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                {posts.slice(0, 20).map(post => (
                                    <div key={post.id} className="d-flex align-items-center justify-content-between border-bottom py-2">
                                        <div>
                                            <strong className="small">{post.title_fr || post.title}</strong>
                                            <small className="text-muted d-block">{post.created_at ? new Date(post.created_at).toLocaleDateString('fr-FR') : ''}</small>
                                        </div>
                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleInsertArticle(post)}>
                                            <i className="fas fa-plus me-1"></i> Insérer
                                        </button>
                                    </div>
                                ))}
                                {posts.length === 0 && <p className="text-muted text-center mb-0">Aucun article disponible</p>}
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="card mb-4">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0"><i className="fas fa-paperclip me-2"></i>Pièces jointes</h5>
                                <label className="btn btn-sm btn-outline-primary mb-0" style={{ cursor: 'pointer' }}>
                                    <i className="fas fa-upload me-1"></i> Ajouter
                                    <input type="file" className="d-none" onChange={handleAttachmentUpload} />
                                </label>
                            </div>
                            {form.attachments.length > 0 && (
                                <div className="card-body p-0">
                                    <div className="list-group list-group-flush">
                                        {form.attachments.map((att, idx) => (
                                            <div key={idx} className="list-group-item d-flex align-items-center">
                                                <i className="fas fa-file me-2 text-muted"></i>
                                                <div className="flex-grow-1">
                                                    <span className="small">{att.name}</span>
                                                    {att.size && <small className="text-muted ms-2">({(att.size / 1024).toFixed(1)} KB)</small>}
                                                </div>
                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeAttachment(idx)}>
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Status */}
                        <div className="card mb-4">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-info-circle me-2"></i>Statut</h6>
                            </div>
                            <div className="card-body">
                                <span className={`badge ${form.status === 'sent' ? 'bg-success' : form.status === 'scheduled' ? 'bg-info' : 'bg-warning'}`}>
                                    {form.status === 'sent' ? 'Envoyée' : form.status === 'scheduled' ? 'Programmée' : 'Brouillon'}
                                </span>
                            </div>
                        </div>

                        {/* Recipients */}
                        <div className="card mb-4">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-users me-2"></i>Destinataires</h6>
                            </div>
                            <div className="card-body">
                                <div className="text-center mb-3">
                                    <h3 className="mb-0" style={{ color: '#7ac142' }}>{subscribersCount}</h3>
                                    <small className="text-muted">abonnés actifs</small>
                                </div>

                                {/* Target lists */}
                                <label className="form-label small fw-bold">Listes cibles</label>
                                {lists.map(list => (
                                    <div key={list.id} className="form-check mb-1">
                                        <input type="checkbox" className="form-check-input" id={`list-${list.id}`}
                                            checked={form.list_ids.includes(list.id)}
                                            onChange={() => handleListToggle(list.id)} />
                                        <label className="form-check-label small" htmlFor={`list-${list.id}`}>
                                            <span className="me-1" style={{ color: list.color || '#7ac142' }}>&#9679;</span>
                                            {list.name} ({list.subscribers_count || 0})
                                        </label>
                                    </div>
                                ))}
                                {lists.length === 0 && <small className="text-muted">Aucune liste. Tous les abonnés actifs recevront l'email.</small>}

                                {/* Target language */}
                                <div className="mt-3">
                                    <label className="form-label small fw-bold">Langue cible</label>
                                    <select className="form-select form-select-sm" name="target_language" value={form.target_language} onChange={handleChange}>
                                        <option value="all">Tous</option>
                                        <option value="fr">Français uniquement</option>
                                        <option value="en">Anglais uniquement</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Schedule */}
                        {isEditing && form.status === 'draft' && (
                            <div className="card mb-4">
                                <div className="card-header py-2">
                                    <h6 className="mb-0"><i className="fas fa-clock me-2"></i>Programmation</h6>
                                </div>
                                <div className="card-body">
                                    <input type="datetime-local" className="form-control form-control-sm mb-2"
                                        value={form.scheduled_at} onChange={(e) => setForm(prev => ({ ...prev, scheduled_at: e.target.value }))} />
                                    <button type="button" className="btn btn-sm btn-info w-100" onClick={handleSchedule} disabled={scheduling}>
                                        {scheduling ? <span className="spinner-border spinner-border-sm"></span> :
                                            <><i className="fas fa-clock me-1"></i>Programmer</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Test Send */}
                        {isEditing && form.status === 'draft' && (
                            <div className="card mb-4">
                                <div className="card-header py-2">
                                    <h6 className="mb-0"><i className="fas fa-flask me-2"></i>Envoi test</h6>
                                </div>
                                <div className="card-body">
                                    <div className="input-group input-group-sm">
                                        <input type="email" className="form-control" placeholder="email@test.com"
                                            value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
                                        <button type="button" className="btn btn-outline-primary" onClick={handleSendTest}>
                                            <i className="fas fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preview */}
                        <div className="card">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-eye me-2"></i>Aperçu</h6>
                            </div>
                            <div className="card-body">
                                <div className="bg-light rounded p-3">
                                    <div className="border-bottom pb-2 mb-2">
                                        <small className="text-muted">Sujet:</small>
                                        <p className="mb-0 fw-bold small">{form[`subject_${activeLang}`] || 'Aucun sujet'}</p>
                                    </div>
                                    <small className="text-muted">Contenu:</small>
                                    <div className="small" style={{ maxHeight: '150px', overflow: 'hidden' }}
                                        dangerouslySetInnerHTML={{ __html: form[`content_html_${activeLang}`] ? form[`content_html_${activeLang}`].substring(0, 500) : '<em>Aucun contenu</em>' }}>
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

export default CampaignEditor;
