import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const LearningPathEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [pathCourses, setPathCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [courseSearch, setCourseSearch] = useState('');

    const [form, setForm] = useState({
        title_fr: '',
        title_en: '',
        description_fr: '',
        description_en: '',
        level: 'beginner',
        status: 'draft',
        grading_type: 'average',
        certificate_enabled: false,
        certificate_template_id: ''
    });

    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        fetchAllCourses();
        fetchTemplates();
        if (isEditing) {
            fetchPath();
            fetchPathCourses();
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPath = async () => {
        const res = await api.get(`/elearning/paths/${id}`, token);
        if (res.success && res.data) {
            const p = res.data;
            setForm({
                title_fr: p.title_fr || '',
                title_en: p.title_en || '',
                description_fr: p.description_fr || '',
                description_en: p.description_en || '',
                level: p.level || 'beginner',
                status: p.status || 'draft',
                grading_type: p.grading_type || 'average',
                certificate_enabled: p.certificate_enabled || false,
                certificate_template_id: p.certificate_template_id || ''
            });
        }
        setLoading(false);
    };

    const fetchPathCourses = async () => {
        const res = await api.get(`/elearning/paths/${id}/courses`, token);
        if (res.success) setPathCourses(res.data || []);
    };

    const fetchAllCourses = async () => {
        const res = await api.get('/elearning/courses', token);
        if (res.success) setAllCourses(res.data || []);
    };

    const fetchTemplates = async () => {
        const res = await api.get('/elearning/certificate-templates', token);
        if (res.success) setTemplates(res.data || []);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAddCourse = async (courseId) => {
        const res = await api.post(`/elearning/paths/${id}/courses`, {
            course_id: courseId,
            sort_order: pathCourses.length
        }, token);
        if (res.success) {
            setToast({ message: 'Cours ajouté au parcours', type: 'success' });
            fetchPathCourses();
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
    };

    const handleRemoveCourse = async (courseId) => {
        const res = await api.delete(`/elearning/paths/${id}/courses/${courseId}`, token);
        if (res.success) {
            setToast({ message: 'Cours retiré', type: 'success' });
            fetchPathCourses();
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
            ? await api.put(`/elearning/paths/${id}`, form, token)
            : await api.post('/elearning/paths', form, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Parcours modifié' : 'Parcours créé', type: 'success' });
            if (!isEditing && res.data?.id) {
                setTimeout(() => navigate(`/elearning/paths/${res.data.id}`), 1000);
            }
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
    };

    // Available courses not in path
    const pathCourseIds = pathCourses.map(c => c.id || c.course_id);
    const availableCourses = allCourses.filter(c => {
        const notInPath = !pathCourseIds.includes(c.id);
        const matchesSearch = !courseSearch || (c.title_fr || c.title || '').toLowerCase().includes(courseSearch.toLowerCase());
        return notInPath && matchesSearch;
    });

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
                            {isEditing ? 'Modifier le parcours' : 'Nouveau parcours'}
                        </h2>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/elearning/paths" className="btn btn-outline-secondary">
                            <i className="fas fa-arrow-left me-2"></i> Retour
                        </Link>
                        <button type="submit" className="btn btn-primary" disabled={saving}
                            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                            {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</> :
                                <><i className="fas fa-save me-2"></i>{isEditing ? 'Enregistrer' : 'Créer'}</>}
                        </button>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-8">
                        {/* Basic Info */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="fas fa-road me-2" style={{ color: '#1ABC9C' }}></i>Informations</h5>
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
                                    <div className="col-md-6">
                                        <label className="form-label">Description FR</label>
                                        <textarea className="form-control" name="description_fr" value={form.description_fr} onChange={handleChange} rows={4} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Description EN</label>
                                        <textarea className="form-control" name="description_en" value={form.description_en} onChange={handleChange} rows={4} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        <div className="card mb-4">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-cog me-2"></i>Paramètres</h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label small">Niveau</label>
                                    <select className="form-select" name="level" value={form.level} onChange={handleChange}>
                                        <option value="beginner">Débutant</option>
                                        <option value="intermediate">Intermédiaire</option>
                                        <option value="advanced">Avancé</option>
                                        <option value="expert">Expert</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small">Statut</label>
                                    <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                                        <option value="draft">Brouillon</option>
                                        <option value="published">Publié</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small">Type de notation</label>
                                    <select className="form-select" name="grading_type" value={form.grading_type} onChange={handleChange}>
                                        <option value="average">Moyenne</option>
                                        <option value="weighted">Pondérée</option>
                                        <option value="highest">Meilleur score</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-certificate me-2"></i>Certificat</h6>
                            </div>
                            <div className="card-body">
                                <div className="form-check mb-3">
                                    <input type="checkbox" className="form-check-input" id="certificate_enabled"
                                        name="certificate_enabled" checked={form.certificate_enabled} onChange={handleChange} />
                                    <label className="form-check-label" htmlFor="certificate_enabled">Délivrer un certificat</label>
                                </div>
                                {form.certificate_enabled && (
                                    <select className="form-select form-select-sm" name="certificate_template_id"
                                        value={form.certificate_template_id} onChange={handleChange}>
                                        <option value="">Template par défaut</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Course Management - Only in edit mode */}
            {isEditing && (
                <div className="card mt-4">
                    <div className="card-header">
                        <h5 className="mb-0"><i className="fas fa-list-ol me-2" style={{ color: '#3498DB' }}></i>Cours du parcours</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {/* Path courses */}
                            <div className="col-md-6">
                                <h6 className="mb-3">
                                    <i className="fas fa-check-circle text-success me-2"></i>
                                    Cours inclus ({pathCourses.length})
                                </h6>
                                {pathCourses.length > 0 ? (
                                    <div className="list-group">
                                        {pathCourses.map((c, idx) => (
                                            <div key={c.id || c.course_id} className="list-group-item d-flex align-items-center">
                                                <span className="badge bg-primary me-2">{idx + 1}</span>
                                                <div className="flex-grow-1">
                                                    <strong className="small">{c.title_fr || c.title || 'Cours'}</strong>
                                                    {c.level && <span className="badge bg-light text-dark ms-2" style={{ fontSize: '0.6rem' }}>{c.level}</span>}
                                                </div>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveCourse(c.id || c.course_id)}>
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted border rounded">
                                        <i className="fas fa-inbox fa-2x mb-2 opacity-50"></i>
                                        <p className="small mb-0">Aucun cours dans ce parcours</p>
                                    </div>
                                )}
                            </div>

                            {/* Available courses */}
                            <div className="col-md-6">
                                <h6 className="mb-3">
                                    <i className="fas fa-database text-info me-2"></i>
                                    Cours disponibles ({availableCourses.length})
                                </h6>
                                <div className="input-group input-group-sm mb-3">
                                    <span className="input-group-text"><i className="fas fa-search"></i></span>
                                    <input type="text" className="form-control" placeholder="Chercher un cours..."
                                        value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} />
                                </div>
                                <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {availableCourses.map(c => (
                                        <div key={c.id} className="list-group-item d-flex align-items-center">
                                            <div className="flex-grow-1">
                                                <strong className="small">{c.title_fr || c.title}</strong>
                                                <div>
                                                    <span className={`badge ${c.status === 'published' ? 'bg-success' : 'bg-warning'}`} style={{ fontSize: '0.6rem' }}>
                                                        {c.status === 'published' ? 'Publié' : 'Brouillon'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="btn btn-sm btn-outline-success" onClick={() => handleAddCourse(c.id)}>
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    ))}
                                    {availableCourses.length === 0 && (
                                        <div className="text-center py-3 text-muted">
                                            <small>Aucun cours disponible</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LearningPathEditor;
