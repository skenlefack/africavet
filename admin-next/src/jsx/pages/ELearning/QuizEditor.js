import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const QuizEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]);
    const [questionSearch, setQuestionSearch] = useState('');

    const [form, setForm] = useState({
        title_fr: '',
        title_en: '',
        description_fr: '',
        description_en: '',
        quiz_type: 'module',
        time_limit: '',
        passing_score: 70,
        max_attempts: 0,
        shuffle_questions: false,
        shuffle_options: false,
        show_results: true,
        show_correct_answers: true,
        status: 'draft'
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchAllQuestions();
        if (isEditing) {
            fetchQuiz();
            fetchQuizQuestions();
        }
    }, [id]);

    const fetchQuiz = async () => {
        const res = await api.get(`/elearning/quizzes/${id}`, token);
        if (res.success && res.data) {
            const q = res.data;
            setForm({
                title_fr: q.title_fr || '',
                title_en: q.title_en || '',
                description_fr: q.description_fr || '',
                description_en: q.description_en || '',
                quiz_type: q.quiz_type || 'module',
                time_limit: q.time_limit || '',
                passing_score: q.passing_score || 70,
                max_attempts: q.max_attempts || 0,
                shuffle_questions: q.shuffle_questions || false,
                shuffle_options: q.shuffle_options || false,
                show_results: q.show_results !== false,
                show_correct_answers: q.show_correct_answers !== false,
                status: q.status || 'draft'
            });
        }
        setLoading(false);
    };

    const fetchQuizQuestions = async () => {
        const res = await api.get(`/elearning/quizzes/${id}/questions`, token);
        if (res.success) setQuizQuestions(res.data || []);
    };

    const fetchAllQuestions = async () => {
        const res = await api.get('/elearning/questions', token);
        if (res.success) setAllQuestions(res.data || []);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAddQuestion = async (questionId) => {
        const res = await api.post(`/elearning/quizzes/${id}/questions`, {
            question_id: questionId,
            sort_order: quizQuestions.length
        }, token);
        if (res.success) {
            setToast({ message: 'Question ajoutée', type: 'success' });
            fetchQuizQuestions();
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
    };

    const handleRemoveQuestion = async (questionId) => {
        const res = await api.delete(`/elearning/quizzes/${id}/questions/${questionId}`, token);
        if (res.success) {
            setToast({ message: 'Question retirée', type: 'success' });
            fetchQuizQuestions();
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
            ? await api.put(`/elearning/quizzes/${id}`, form, token)
            : await api.post('/elearning/quizzes', form, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Quiz modifié' : 'Quiz créé', type: 'success' });
            if (!isEditing && res.data?.id) {
                setTimeout(() => navigate(`/elearning/quizzes/${res.data.id}`), 1000);
            }
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
    };

    // Questions available to add (not already in quiz)
    const quizQuestionIds = quizQuestions.map(q => q.id || q.question_id);
    const availableQuestions = allQuestions.filter(q => {
        const notInQuiz = !quizQuestionIds.includes(q.id);
        const matchesSearch = !questionSearch || (q.question_text_fr || '').toLowerCase().includes(questionSearch.toLowerCase());
        return notInQuiz && matchesSearch;
    });

    const getTypeBadge = (type) => {
        const types = { mcq: 'QCM', true_false: 'V/F', multiple_select: 'Multi', matching: 'Assoc.', fill_blank: 'Trous', short_answer: 'Courte' };
        return <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>{types[type] || type}</span>;
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
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1" style={{ fontWeight: '700' }}>
                            {isEditing ? 'Modifier le quiz' : 'Nouveau quiz'}
                        </h2>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/elearning/quizzes" className="btn btn-outline-secondary">
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
                    {/* Main */}
                    <div className="col-lg-8">
                        {/* Basic Info */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="fas fa-info-circle me-2" style={{ color: '#E67E22' }}></i>Informations</h5>
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
                                        <textarea className="form-control" name="description_fr" value={form.description_fr} onChange={handleChange} rows={3} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Description EN</label>
                                        <textarea className="form-control" name="description_en" value={form.description_en} onChange={handleChange} rows={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="fas fa-cog me-2" style={{ color: '#3498DB' }}></i>Paramètres</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">Type de quiz</label>
                                        <select className="form-select" name="quiz_type" value={form.quiz_type} onChange={handleChange}>
                                            <option value="module">Module</option>
                                            <option value="final">Final</option>
                                            <option value="practice">Pratique</option>
                                            <option value="assessment">Évaluation</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Temps limite (min)</label>
                                        <input type="number" className="form-control" name="time_limit" value={form.time_limit}
                                            onChange={handleChange} min="0" placeholder="0 = illimité" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Score minimum (%)</label>
                                        <input type="number" className="form-control" name="passing_score" value={form.passing_score}
                                            onChange={handleChange} min="0" max="100" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Tentatives max</label>
                                        <input type="number" className="form-control" name="max_attempts" value={form.max_attempts}
                                            onChange={handleChange} min="0" placeholder="0 = illimité" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Statut</label>
                                        <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                                            <option value="draft">Brouillon</option>
                                            <option value="published">Publié</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row g-3 mt-2">
                                    <div className="col-md-3">
                                        <div className="form-check">
                                            <input type="checkbox" className="form-check-input" id="shuffle_questions"
                                                name="shuffle_questions" checked={form.shuffle_questions} onChange={handleChange} />
                                            <label className="form-check-label small" htmlFor="shuffle_questions">Mélanger questions</label>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-check">
                                            <input type="checkbox" className="form-check-input" id="shuffle_options"
                                                name="shuffle_options" checked={form.shuffle_options} onChange={handleChange} />
                                            <label className="form-check-label small" htmlFor="shuffle_options">Mélanger options</label>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-check">
                                            <input type="checkbox" className="form-check-input" id="show_results"
                                                name="show_results" checked={form.show_results} onChange={handleChange} />
                                            <label className="form-check-label small" htmlFor="show_results">Afficher résultats</label>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-check">
                                            <input type="checkbox" className="form-check-input" id="show_correct_answers"
                                                name="show_correct_answers" checked={form.show_correct_answers} onChange={handleChange} />
                                            <label className="form-check-label small" htmlFor="show_correct_answers">Montrer bonnes réponses</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Summary */}
                    <div className="col-lg-4">
                        <div className="card">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-chart-pie me-2"></i>Résumé</h6>
                            </div>
                            <div className="card-body text-center">
                                <div className="row g-2">
                                    <div className="col-6">
                                        <h4 className="mb-0" style={{ color: '#3498DB' }}>{quizQuestions.length}</h4>
                                        <small className="text-muted">Questions</small>
                                    </div>
                                    <div className="col-6">
                                        <h4 className="mb-0" style={{ color: '#E67E22' }}>{form.passing_score}%</h4>
                                        <small className="text-muted">Score min.</small>
                                    </div>
                                    <div className="col-6">
                                        <h4 className="mb-0" style={{ color: '#27AE60' }}>{form.time_limit || '∞'}</h4>
                                        <small className="text-muted">Minutes</small>
                                    </div>
                                    <div className="col-6">
                                        <h4 className="mb-0" style={{ color: '#9B59B6' }}>{form.max_attempts || '∞'}</h4>
                                        <small className="text-muted">Tentatives</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Questions Management - Only in edit mode */}
            {isEditing && (
                <div className="card mt-4">
                    <div className="card-header">
                        <h5 className="mb-0"><i className="fas fa-list me-2" style={{ color: '#9B59B6' }}></i>Gestion des questions</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {/* Current questions */}
                            <div className="col-md-6">
                                <h6 className="mb-3">
                                    <i className="fas fa-check-circle text-success me-2"></i>
                                    Questions du quiz ({quizQuestions.length})
                                </h6>
                                {quizQuestions.length > 0 ? (
                                    <div className="list-group">
                                        {quizQuestions.map((q, idx) => (
                                            <div key={q.id || q.question_id} className="list-group-item d-flex align-items-center">
                                                <span className="badge bg-primary me-2">{idx + 1}</span>
                                                <div className="flex-grow-1">
                                                    <small>{q.question_text_fr || q.question_text || 'Question'}</small>
                                                    <div>{getTypeBadge(q.question_type)} <span className="text-muted ms-1" style={{ fontSize: '0.7rem' }}>{q.points || 1} pts</span></div>
                                                </div>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveQuestion(q.id || q.question_id)}>
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted border rounded">
                                        <i className="fas fa-inbox fa-2x mb-2 opacity-50"></i>
                                        <p className="small mb-0">Aucune question ajoutée</p>
                                    </div>
                                )}
                            </div>

                            {/* Available questions */}
                            <div className="col-md-6">
                                <h6 className="mb-3">
                                    <i className="fas fa-database text-info me-2"></i>
                                    Banque de questions ({availableQuestions.length})
                                </h6>
                                <div className="input-group input-group-sm mb-3">
                                    <span className="input-group-text"><i className="fas fa-search"></i></span>
                                    <input type="text" className="form-control" placeholder="Chercher une question..."
                                        value={questionSearch} onChange={(e) => setQuestionSearch(e.target.value)} />
                                </div>
                                <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {availableQuestions.slice(0, 50).map(q => (
                                        <div key={q.id} className="list-group-item d-flex align-items-center">
                                            <div className="flex-grow-1">
                                                <small>{q.question_text_fr || q.question_text || 'Question'}</small>
                                                <div>{getTypeBadge(q.question_type)} <span className="text-muted ms-1" style={{ fontSize: '0.7rem' }}>{q.points || 1} pts</span></div>
                                            </div>
                                            <button className="btn btn-sm btn-outline-success" onClick={() => handleAddQuestion(q.id)}>
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    ))}
                                    {availableQuestions.length === 0 && (
                                        <div className="text-center py-3 text-muted">
                                            <small>Aucune question disponible</small>
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

export default QuizEditor;
