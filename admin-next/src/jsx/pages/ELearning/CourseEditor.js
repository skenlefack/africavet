import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import LessonEditor from './LessonEditor';

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [categories, setCategories] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [curriculum, setCurriculum] = useState([]);
    const [expandedModule, setExpandedModule] = useState(null);
    const [editingLesson, setEditingLesson] = useState(null);
    const [addingLessonToModule, setAddingLessonToModule] = useState(null);
    const [addingModule, setAddingModule] = useState(false);
    const [newModule, setNewModule] = useState({ title_fr: '', title_en: '', description_fr: '', sort_order: 0 });
    const [editingModule, setEditingModule] = useState(null);

    const [form, setForm] = useState({
        title_fr: '',
        title_en: '',
        description_fr: '',
        short_description_fr: '',
        thumbnail: '',
        level: 'beginner',
        category_id: '',
        status: 'draft',
        min_passing_score: 70,
        final_quiz_id: '',
        final_quiz_weight: 40,
        module_quizzes_weight: 60
    });

    useEffect(() => {
        fetchCategories();
        fetchQuizzes();
        if (isEditing) {
            fetchCourse();
            fetchCurriculum();
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCourse = async () => {
        const res = await api.get(`/elearning/courses/${id}`, token);
        if (res.success && res.data) {
            setForm({
                title_fr: res.data.title_fr || '',
                title_en: res.data.title_en || '',
                description_fr: res.data.description_fr || '',
                short_description_fr: res.data.short_description_fr || '',
                thumbnail: res.data.thumbnail || '',
                level: res.data.level || 'beginner',
                category_id: res.data.category_id || '',
                status: res.data.status || 'draft',
                min_passing_score: res.data.min_passing_score || 70,
                final_quiz_id: res.data.final_quiz_id || '',
                final_quiz_weight: res.data.final_quiz_weight || 40,
                module_quizzes_weight: res.data.module_quizzes_weight || 60
            });
        }
        setLoading(false);
    };

    const fetchCategories = async () => {
        const res = await api.get('/elearning/categories', token);
        if (res.success) setCategories(res.data || []);
    };

    const fetchQuizzes = async () => {
        const res = await api.get('/elearning/quizzes', token);
        if (res.success) setQuizzes(res.data || []);
    };

    const fetchCurriculum = async () => {
        const res = await api.get(`/elearning/courses/${id}/curriculum`, token);
        if (res.success) setCurriculum(res.data || []);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.upload('/upload/elearning/thumbnail', formData, token);
        if (res.success && res.data) {
            setForm(prev => ({ ...prev, thumbnail: res.data.url || res.data }));
            setToast({ message: 'Thumbnail uploadé', type: 'success' });
        } else {
            setToast({ message: res.message || 'Erreur upload', type: 'error' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title_fr.trim()) {
            setToast({ message: 'Le titre FR est requis', type: 'error' });
            return;
        }

        setSaving(true);
        const res = isEditing
            ? await api.put(`/elearning/courses/${id}`, form, token)
            : await api.post('/elearning/courses', form, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Cours modifié' : 'Cours créé', type: 'success' });
            if (!isEditing && res.data?.id) {
                setTimeout(() => navigate(`/elearning/courses/${res.data.id}`), 1000);
            }
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
    };

    // Module CRUD
    const handleSaveModule = async (e) => {
        e.preventDefault();
        if (!newModule.title_fr.trim()) return;

        const payload = { ...newModule, course_id: parseInt(id) };
        const res = editingModule
            ? await api.put(`/elearning/modules/${editingModule.id}`, payload, token)
            : await api.post(`/elearning/courses/${id}/modules`, payload, token);

        if (res.success) {
            setToast({ message: editingModule ? 'Module modifié' : 'Module ajouté', type: 'success' });
            setAddingModule(false);
            setEditingModule(null);
            setNewModule({ title_fr: '', title_en: '', description_fr: '', sort_order: 0 });
            fetchCurriculum();
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (window.confirm('Supprimer ce module et toutes ses leçons ?')) {
            const res = await api.delete(`/elearning/modules/${moduleId}`, token);
            if (res.success) {
                setToast({ message: 'Module supprimé', type: 'success' });
                fetchCurriculum();
            }
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (window.confirm('Supprimer cette leçon ?')) {
            const res = await api.delete(`/elearning/lessons/${lessonId}`, token);
            if (res.success) {
                setToast({ message: 'Leçon supprimée', type: 'success' });
                fetchCurriculum();
            }
        }
    };

    const handleLessonSaved = () => {
        setEditingLesson(null);
        setAddingLessonToModule(null);
        fetchCurriculum();
    };

    const levels = [
        { value: 'beginner', label: 'Débutant' },
        { value: 'intermediate', label: 'Intermédiaire' },
        { value: 'advanced', label: 'Avancé' },
        { value: 'expert', label: 'Expert' }
    ];

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
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1" style={{ fontWeight: '700' }}>
                            {isEditing ? 'Modifier le cours' : 'Nouveau cours'}
                        </h2>
                        <p className="text-muted mb-0">{form.title_fr || 'Créer un nouveau cours e-learning'}</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/elearning/courses" className="btn btn-outline-secondary">
                            <i className="fas fa-arrow-left me-2"></i> Retour
                        </Link>
                        <button type="submit" className="btn btn-primary" disabled={saving}
                            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                            {saving ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                            ) : (
                                <><i className="fas fa-save me-2"></i>{isEditing ? 'Enregistrer' : 'Créer'}</>
                            )}
                        </button>
                    </div>
                </div>

                <div className="row">
                    {/* Left Column - Main Content */}
                    <div className="col-lg-8">
                        {/* Basic Info */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="fas fa-info-circle me-2" style={{ color: '#7ac142' }}></i>Informations générales</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Titre FR *</label>
                                        <input type="text" className="form-control" name="title_fr" value={form.title_fr} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Titre EN</label>
                                        <input type="text" className="form-control" name="title_en" value={form.title_en} onChange={handleChange} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Description courte FR</label>
                                        <input type="text" className="form-control" name="short_description_fr" value={form.short_description_fr} onChange={handleChange}
                                            placeholder="Résumé du cours en une phrase" />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Description FR</label>
                                        <textarea className="form-control" name="description_fr" value={form.description_fr} onChange={handleChange}
                                            rows={5} placeholder="Description détaillée du cours..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grading */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="fas fa-chart-bar me-2" style={{ color: '#E67E22' }}></i>Notation & Évaluation</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">Score minimum (%)</label>
                                        <input type="number" className="form-control" name="min_passing_score"
                                            value={form.min_passing_score} onChange={handleChange} min="0" max="100" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Quiz final</label>
                                        <select className="form-select" name="final_quiz_id" value={form.final_quiz_id} onChange={handleChange}>
                                            <option value="">-- Aucun --</option>
                                            {quizzes.map(q => (
                                                <option key={q.id} value={q.id}>{q.title_fr || q.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Poids quiz final (%)</label>
                                        <input type="number" className="form-control" name="final_quiz_weight"
                                            value={form.final_quiz_weight} onChange={handleChange} min="0" max="100" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Poids quiz modules (%)</label>
                                        <input type="number" className="form-control" name="module_quizzes_weight"
                                            value={form.module_quizzes_weight} onChange={handleChange} min="0" max="100" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="col-lg-4">
                        {/* Thumbnail */}
                        <div className="card mb-4">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-image me-2" style={{ color: '#7ac142' }}></i>Thumbnail</h6>
                            </div>
                            <div className="card-body">
                                {form.thumbnail ? (
                                    <div className="position-relative mb-2">
                                        <img src={form.thumbnail} alt="Thumbnail" className="img-fluid rounded" style={{ maxHeight: '180px', width: '100%', objectFit: 'cover' }} />
                                        <button type="button" className="btn btn-danger btn-sm position-absolute" style={{ top: '5px', right: '5px' }}
                                            onClick={() => setForm(prev => ({ ...prev, thumbnail: '' }))}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border rounded d-flex align-items-center justify-content-center mb-2"
                                        style={{ height: '120px', background: '#f8f9fa', border: '2px dashed #dee2e6' }}>
                                        <i className="fas fa-image fa-2x text-muted opacity-50"></i>
                                    </div>
                                )}
                                <input type="file" className="form-control form-control-sm" accept="image/*" onChange={handleThumbnailUpload} />
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="card mb-4">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-cog me-2"></i>Paramètres</h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label small">Statut</label>
                                    <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                                        <option value="draft">Brouillon</option>
                                        <option value="published">Publié</option>
                                        <option value="archived">Archivé</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small">Niveau</label>
                                    <select className="form-select" name="level" value={form.level} onChange={handleChange}>
                                        {levels.map(l => (
                                            <option key={l.value} value={l.value}>{l.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small">Catégorie</label>
                                    <select className="form-select" name="category_id" value={form.category_id} onChange={handleChange}>
                                        <option value="">-- Aucune --</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name_fr || c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Curriculum Section - Only in edit mode */}
            {isEditing && (
                <div className="card mt-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0"><i className="fas fa-list-ol me-2" style={{ color: '#9B59B6' }}></i>Curriculum</h5>
                        <button type="button" className="btn btn-sm btn-primary"
                            onClick={() => { setAddingModule(true); setEditingModule(null); setNewModule({ title_fr: '', title_en: '', description_fr: '', sort_order: curriculum.length }); }}
                            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                            <i className="fas fa-plus me-1"></i> Ajouter un module
                        </button>
                    </div>
                    <div className="card-body">
                        {/* Add/Edit Module Form */}
                        {(addingModule || editingModule) && (
                            <div className="border rounded p-3 mb-3 bg-light">
                                <h6>{editingModule ? 'Modifier le module' : 'Nouveau module'}</h6>
                                <form onSubmit={handleSaveModule}>
                                    <div className="row g-2">
                                        <div className="col-md-5">
                                            <input type="text" className="form-control form-control-sm" placeholder="Titre FR *"
                                                value={newModule.title_fr} onChange={(e) => setNewModule(prev => ({ ...prev, title_fr: e.target.value }))} required />
                                        </div>
                                        <div className="col-md-4">
                                            <input type="text" className="form-control form-control-sm" placeholder="Titre EN"
                                                value={newModule.title_en} onChange={(e) => setNewModule(prev => ({ ...prev, title_en: e.target.value }))} />
                                        </div>
                                        <div className="col-md-1">
                                            <input type="number" className="form-control form-control-sm" placeholder="Ordre"
                                                value={newModule.sort_order} onChange={(e) => setNewModule(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))} />
                                        </div>
                                        <div className="col-md-2 d-flex gap-1">
                                            <button type="submit" className="btn btn-sm btn-success"><i className="fas fa-check"></i></button>
                                            <button type="button" className="btn btn-sm btn-outline-secondary"
                                                onClick={() => { setAddingModule(false); setEditingModule(null); }}>
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <textarea className="form-control form-control-sm" placeholder="Description FR (optionnel)"
                                            value={newModule.description_fr} onChange={(e) => setNewModule(prev => ({ ...prev, description_fr: e.target.value }))} rows={2} />
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Modules List */}
                        {curriculum.length > 0 ? (
                            <div className="accordion" id="curriculumAccordion">
                                {curriculum.map((mod, idx) => (
                                    <div key={mod.id} className="accordion-item border mb-2 rounded overflow-hidden">
                                        <div className="accordion-header">
                                            <div className="d-flex align-items-center p-3" style={{ background: '#f8f9fa' }}>
                                                <span className="badge bg-primary me-2" style={{ background: '#9B59B6' }}>{idx + 1}</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-link text-start text-decoration-none flex-grow-1 p-0"
                                                    onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                                                >
                                                    <strong>{mod.title_fr || mod.title}</strong>
                                                    <small className="text-muted ms-2">({(mod.lessons || []).length} leçons)</small>
                                                </button>
                                                <div className="d-flex gap-1">
                                                    <button type="button" className="btn btn-sm btn-outline-primary"
                                                        onClick={() => {
                                                            setEditingModule(mod);
                                                            setAddingModule(true);
                                                            setNewModule({ title_fr: mod.title_fr || '', title_en: mod.title_en || '', description_fr: mod.description_fr || '', sort_order: mod.sort_order || idx });
                                                        }}>
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteModule(mod.id)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {expandedModule === mod.id && (
                                            <div className="p-3">
                                                {/* Lessons */}
                                                {(mod.lessons || []).length > 0 ? (
                                                    <div className="list-group mb-3">
                                                        {mod.lessons.map((lesson, lIdx) => (
                                                            <div key={lesson.id}>
                                                                {editingLesson === lesson.id ? (
                                                                    <LessonEditor
                                                                        lesson={lesson}
                                                                        moduleId={mod.id}
                                                                        onSave={handleLessonSaved}
                                                                        onCancel={() => setEditingLesson(null)}
                                                                    />
                                                                ) : (
                                                                    <div className="list-group-item d-flex align-items-center">
                                                                        <span className="badge bg-light text-dark me-2">{lIdx + 1}</span>
                                                                        <i className={`fas fa-${
                                                                            lesson.content_type === 'video' ? 'video' :
                                                                            lesson.content_type === 'pdf' ? 'file-pdf' :
                                                                            lesson.content_type === 'pptx' ? 'file-powerpoint' :
                                                                            lesson.content_type === 'quiz' ? 'question-circle' :
                                                                            'file-alt'
                                                                        } me-2 text-muted`}></i>
                                                                        <div className="flex-grow-1">
                                                                            <strong className="small">{lesson.title_fr || lesson.title}</strong>
                                                                            {lesson.duration_minutes && (
                                                                                <small className="text-muted ms-2"><i className="fas fa-clock me-1"></i>{lesson.duration_minutes} min</small>
                                                                            )}
                                                                            {lesson.is_preview && <span className="badge bg-info ms-2" style={{ fontSize: '0.65rem' }}>Aperçu</span>}
                                                                        </div>
                                                                        <span className={`badge ${lesson.status === 'published' ? 'bg-success' : 'bg-warning'} me-2`} style={{ fontSize: '0.65rem' }}>
                                                                            {lesson.status === 'published' ? 'Publié' : 'Brouillon'}
                                                                        </span>
                                                                        <div className="btn-group btn-group-sm">
                                                                            <button type="button" className="btn btn-outline-primary" onClick={() => setEditingLesson(lesson.id)}>
                                                                                <i className="fas fa-edit"></i>
                                                                            </button>
                                                                            <button type="button" className="btn btn-outline-danger" onClick={() => handleDeleteLesson(lesson.id)}>
                                                                                <i className="fas fa-trash"></i>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-muted small mb-3">Aucune leçon dans ce module</p>
                                                )}

                                                {/* Add Lesson */}
                                                {addingLessonToModule === mod.id ? (
                                                    <LessonEditor
                                                        moduleId={mod.id}
                                                        onSave={handleLessonSaved}
                                                        onCancel={() => setAddingLessonToModule(null)}
                                                    />
                                                ) : (
                                                    <button type="button" className="btn btn-sm btn-outline-primary"
                                                        onClick={() => setAddingLessonToModule(mod.id)}>
                                                        <i className="fas fa-plus me-1"></i> Ajouter une leçon
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !addingModule && (
                                <div className="text-center py-4 text-muted">
                                    <i className="fas fa-list-ol fa-3x mb-3 opacity-50"></i>
                                    <p className="mb-2">Aucun module dans ce cours</p>
                                    <button type="button" className="btn btn-sm btn-primary"
                                        onClick={() => setAddingModule(true)}
                                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                                        <i className="fas fa-plus me-1"></i> Créer le premier module
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default CourseEditor;
