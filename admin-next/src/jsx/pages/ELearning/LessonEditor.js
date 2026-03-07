import React, { useState, useEffect, useRef } from 'react';
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

const LessonEditor = ({ lesson, moduleId, onSave, onCancel }) => {
    const token = getToken();
    const isEditing = !!(lesson && lesson.id);

    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);

    const [form, setForm] = useState({
        title_fr: '',
        title_en: '',
        content_type: 'text',
        content_text_fr: '',
        content_text_en: '',
        video_url: '',
        video_file: '',
        pdf_file: '',
        pptx_file: '',
        quiz_id: '',
        duration_minutes: '',
        is_preview: false,
        status: 'draft',
        sort_order: 0
    });

    const [videoMode, setVideoMode] = useState('url');
    const [quizzes, setQuizzes] = useState([]);
    const editorRefFr = useRef(null);
    const editorRefEn = useRef(null);

    useEffect(() => {
        fetchQuizzes();
        if (lesson) {
            setForm({
                title_fr: lesson.title_fr || '',
                title_en: lesson.title_en || '',
                content_type: lesson.content_type || 'text',
                content_text_fr: lesson.content_text_fr || '',
                content_text_en: lesson.content_text_en || '',
                video_url: lesson.video_url || '',
                video_file: lesson.video_file || '',
                pdf_file: lesson.pdf_file || '',
                pptx_file: lesson.pptx_file || '',
                quiz_id: lesson.quiz_id || '',
                duration_minutes: lesson.duration_minutes || '',
                is_preview: lesson.is_preview || false,
                status: lesson.status || 'draft',
                sort_order: lesson.sort_order || 0
            });
            if (lesson.video_file) setVideoMode('upload');
        }
    }, [lesson]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchQuizzes = async () => {
        const res = await api.get('/elearning/quizzes', token);
        if (res.success) setQuizzes(res.data || []);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileUpload = async (e, fileType) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        const endpoint = fileType === 'video'
            ? '/upload/elearning/video'
            : fileType === 'pdf'
            ? '/upload/elearning/pdf'
            : '/upload/elearning/pptx';

        // Use XHR for progress tracking
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}${endpoint}`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(percent);
            }
        };

        xhr.onload = () => {
            setUploading(false);
            setUploadProgress(0);
            try {
                const result = JSON.parse(xhr.responseText);
                if (result.success && result.data) {
                    const url = result.data.url || result.data;
                    if (fileType === 'video') {
                        setForm(prev => ({ ...prev, video_file: url }));
                    } else if (fileType === 'pdf') {
                        setForm(prev => ({ ...prev, pdf_file: url }));
                    } else {
                        setForm(prev => ({ ...prev, pptx_file: url }));
                    }
                    setToast({ message: 'Fichier uploadé', type: 'success' });
                } else {
                    setToast({ message: result.message || 'Erreur upload', type: 'error' });
                }
            } catch {
                setToast({ message: 'Erreur lors du traitement', type: 'error' });
            }
        };

        xhr.onerror = () => {
            setUploading(false);
            setUploadProgress(0);
            setToast({ message: 'Erreur de connexion', type: 'error' });
        };

        xhr.send(formData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title_fr.trim()) {
            setToast({ message: 'Le titre FR est requis', type: 'error' });
            return;
        }

        setSaving(true);
        const payload = { ...form, module_id: moduleId };

        const res = isEditing
            ? await api.put(`/elearning/lessons/${lesson.id}`, payload, token)
            : await api.post('/elearning/lessons', payload, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Leçon modifiée' : 'Leçon créée', type: 'success' });
            if (onSave) onSave(res.data);
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
    };

    // TinyMCE configuration
    const editorConfig = {
        height: 300,
        min_height: 250,
        max_height: 500,
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
                formData.append('folder', 'elearning');

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

    const contentTypes = [
        { value: 'text', label: 'Texte', icon: 'fa-file-alt' },
        { value: 'video', label: 'Vidéo', icon: 'fa-video' },
        { value: 'pdf', label: 'PDF', icon: 'fa-file-pdf' },
        { value: 'pptx', label: 'Présentation', icon: 'fa-file-powerpoint' },
        { value: 'quiz', label: 'Quiz', icon: 'fa-question-circle' }
    ];

    return (
        <div className="border rounded p-3 bg-white">
            {toast && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                        <i className={`fas fa-${isEditing ? 'edit' : 'plus-circle'} me-2`} style={{ color: '#7ac142' }}></i>
                        {isEditing ? 'Modifier la leçon' : 'Nouvelle leçon'}
                    </h6>
                    <div className="d-flex gap-2">
                        {onCancel && (
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onCancel}>
                                Annuler
                            </button>
                        )}
                        <button type="submit" className="btn btn-sm btn-primary" disabled={saving}
                            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                            {saving ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                        </button>
                    </div>
                </div>

                {/* Titles */}
                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <label className="form-label small">Titre FR *</label>
                        <input type="text" className="form-control" name="title_fr" value={form.title_fr} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label small">Titre EN</label>
                        <input type="text" className="form-control" name="title_en" value={form.title_en} onChange={handleChange} />
                    </div>
                </div>

                {/* Content Type */}
                <div className="mb-3">
                    <label className="form-label small">Type de contenu</label>
                    <div className="d-flex gap-2 flex-wrap">
                        {contentTypes.map(ct => (
                            <button
                                key={ct.value}
                                type="button"
                                className={`btn btn-sm ${form.content_type === ct.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setForm(prev => ({ ...prev, content_type: ct.value }))}
                                style={form.content_type === ct.value ? { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' } : {}}
                            >
                                <i className={`fas ${ct.icon} me-1`}></i> {ct.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content based on type */}
                {form.content_type === 'text' && (
                    <div className="mb-3">
                        <div className="mb-3">
                            <label className="form-label small">Contenu FR</label>
                            <Editor
                                onInit={(evt, editor) => editorRefFr.current = editor}
                                value={form.content_text_fr}
                                onEditorChange={(content) => setForm(prev => ({ ...prev, content_text_fr: content }))}
                                init={{ ...editorConfig, placeholder: 'Contenu de la leçon en français...', license_key: 'gpl' }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small">Contenu EN</label>
                            <Editor
                                onInit={(evt, editor) => editorRefEn.current = editor}
                                value={form.content_text_en}
                                onEditorChange={(content) => setForm(prev => ({ ...prev, content_text_en: content }))}
                                init={{ ...editorConfig, placeholder: 'Lesson content in English...', license_key: 'gpl' }}
                            />
                        </div>
                    </div>
                )}

                {form.content_type === 'video' && (
                    <div className="mb-3">
                        <div className="d-flex gap-2 mb-2">
                            <button type="button" className={`btn btn-sm ${videoMode === 'url' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setVideoMode('url')}>
                                <i className="fas fa-link me-1"></i> URL
                            </button>
                            <button type="button" className={`btn btn-sm ${videoMode === 'upload' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setVideoMode('upload')}>
                                <i className="fas fa-upload me-1"></i> Upload
                            </button>
                        </div>
                        {videoMode === 'url' ? (
                            <input type="url" className="form-control" name="video_url" value={form.video_url}
                                onChange={handleChange} placeholder="https://youtube.com/watch?v=... ou URL vidéo" />
                        ) : (
                            <div>
                                {form.video_file && (
                                    <div className="alert alert-info py-2 mb-2">
                                        <i className="fas fa-video me-2"></i>
                                        <a href={form.video_file} target="_blank" rel="noreferrer">{form.video_file.split('/').pop()}</a>
                                        <button type="button" className="btn btn-sm btn-outline-danger ms-2"
                                            onClick={() => setForm(prev => ({ ...prev, video_file: '' }))}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                )}
                                <input type="file" className="form-control" accept="video/*"
                                    onChange={(e) => handleFileUpload(e, 'video')} disabled={uploading} />
                                {uploading && (
                                    <div className="progress mt-2" style={{ height: '8px' }}>
                                        <div className="progress-bar bg-success" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {form.content_type === 'pdf' && (
                    <div className="mb-3">
                        {form.pdf_file && (
                            <div className="alert alert-info py-2 mb-2">
                                <i className="fas fa-file-pdf me-2 text-danger"></i>
                                <a href={form.pdf_file} target="_blank" rel="noreferrer">{form.pdf_file.split('/').pop()}</a>
                                <button type="button" className="btn btn-sm btn-outline-danger ms-2"
                                    onClick={() => setForm(prev => ({ ...prev, pdf_file: '' }))}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        )}
                        <input type="file" className="form-control" accept=".pdf"
                            onChange={(e) => handleFileUpload(e, 'pdf')} disabled={uploading} />
                        {uploading && (
                            <div className="progress mt-2" style={{ height: '8px' }}>
                                <div className="progress-bar bg-success" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        )}
                    </div>
                )}

                {form.content_type === 'pptx' && (
                    <div className="mb-3">
                        {form.pptx_file && (
                            <div className="alert alert-info py-2 mb-2">
                                <i className="fas fa-file-powerpoint me-2 text-warning"></i>
                                <a href={form.pptx_file} target="_blank" rel="noreferrer">{form.pptx_file.split('/').pop()}</a>
                                <button type="button" className="btn btn-sm btn-outline-danger ms-2"
                                    onClick={() => setForm(prev => ({ ...prev, pptx_file: '' }))}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        )}
                        <input type="file" className="form-control" accept=".pptx,.ppt"
                            onChange={(e) => handleFileUpload(e, 'pptx')} disabled={uploading} />
                        {uploading && (
                            <div className="progress mt-2" style={{ height: '8px' }}>
                                <div className="progress-bar bg-success" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        )}
                    </div>
                )}

                {form.content_type === 'quiz' && (
                    <div className="mb-3">
                        <label className="form-label small">Quiz associé</label>
                        <select className="form-select" name="quiz_id" value={form.quiz_id} onChange={handleChange}>
                            <option value="">-- Sélectionner un quiz --</option>
                            {quizzes.map(q => (
                                <option key={q.id} value={q.id}>{q.title_fr || q.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Settings */}
                <div className="row g-3 mb-3">
                    <div className="col-md-3">
                        <label className="form-label small">Durée (min)</label>
                        <input type="number" className="form-control" name="duration_minutes"
                            value={form.duration_minutes} onChange={handleChange} min="0" />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small">Ordre</label>
                        <input type="number" className="form-control" name="sort_order"
                            value={form.sort_order} onChange={handleChange} min="0" />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small">Statut</label>
                        <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                            <option value="draft">Brouillon</option>
                            <option value="published">Publié</option>
                        </select>
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                        <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="is_preview"
                                name="is_preview" checked={form.is_preview} onChange={handleChange} />
                            <label className="form-check-label small" htmlFor="is_preview">Aperçu gratuit</label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default LessonEditor;
