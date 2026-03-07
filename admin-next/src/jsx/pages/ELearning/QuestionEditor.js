import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const QuestionEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const [form, setForm] = useState({
        question_text_fr: '',
        question_text_en: '',
        question_type: 'mcq',
        difficulty: 'medium',
        points: 1,
        explanation_fr: '',
        explanation_en: '',
        is_active: true,
        // Type-specific data
        options: [{ text_fr: '', text_en: '', is_correct: false }],
        correct_answer: true, // for true_false
        matching_pairs: [{ left_fr: '', left_en: '', right_fr: '', right_en: '' }],
        blank_text_fr: '',
        blank_answers: [''],
        short_answer: ''
    });

    const questionTypes = [
        { value: 'mcq', label: 'QCM', icon: 'fa-list-ol' },
        { value: 'true_false', label: 'Vrai/Faux', icon: 'fa-toggle-on' },
        { value: 'multiple_select', label: 'Sélection multiple', icon: 'fa-check-double' },
        { value: 'matching', label: 'Association', icon: 'fa-arrows-alt-h' },
        { value: 'fill_blank', label: 'Texte à trous', icon: 'fa-pen' },
        { value: 'short_answer', label: 'Réponse courte', icon: 'fa-keyboard' }
    ];

    useEffect(() => {
        if (isEditing) fetchQuestion();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchQuestion = async () => {
        const res = await api.get(`/elearning/questions/${id}`, token);
        if (res.success && res.data) {
            const q = res.data;
            setForm({
                question_text_fr: q.question_text_fr || '',
                question_text_en: q.question_text_en || '',
                question_type: q.question_type || 'mcq',
                difficulty: q.difficulty || 'medium',
                points: q.points || 1,
                explanation_fr: q.explanation_fr || '',
                explanation_en: q.explanation_en || '',
                is_active: q.is_active !== false,
                options: q.options || [{ text_fr: '', text_en: '', is_correct: false }],
                correct_answer: q.correct_answer !== undefined ? q.correct_answer : true,
                matching_pairs: q.matching_pairs || [{ left_fr: '', left_en: '', right_fr: '', right_en: '' }],
                blank_text_fr: q.blank_text_fr || '',
                blank_answers: q.blank_answers || [''],
                short_answer: q.short_answer || ''
            });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // MCQ/Multiple Select options
    const addOption = () => {
        setForm(prev => ({ ...prev, options: [...prev.options, { text_fr: '', text_en: '', is_correct: false }] }));
    };

    const removeOption = (idx) => {
        setForm(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }));
    };

    const updateOption = (idx, field, value) => {
        setForm(prev => {
            const options = [...prev.options];
            options[idx] = { ...options[idx], [field]: value };
            // For MCQ (radio), only one correct answer
            if (field === 'is_correct' && prev.question_type === 'mcq' && value) {
                options.forEach((o, i) => { if (i !== idx) o.is_correct = false; });
            }
            return { ...prev, options };
        });
    };

    // Matching pairs
    const addPair = () => {
        setForm(prev => ({ ...prev, matching_pairs: [...prev.matching_pairs, { left_fr: '', left_en: '', right_fr: '', right_en: '' }] }));
    };

    const removePair = (idx) => {
        setForm(prev => ({ ...prev, matching_pairs: prev.matching_pairs.filter((_, i) => i !== idx) }));
    };

    const updatePair = (idx, field, value) => {
        setForm(prev => {
            const pairs = [...prev.matching_pairs];
            pairs[idx] = { ...pairs[idx], [field]: value };
            return { ...prev, matching_pairs: pairs };
        });
    };

    // Fill blank answers
    const addBlankAnswer = () => {
        setForm(prev => ({ ...prev, blank_answers: [...prev.blank_answers, ''] }));
    };

    const removeBlankAnswer = (idx) => {
        setForm(prev => ({ ...prev, blank_answers: prev.blank_answers.filter((_, i) => i !== idx) }));
    };

    const updateBlankAnswer = (idx, value) => {
        setForm(prev => {
            const answers = [...prev.blank_answers];
            answers[idx] = value;
            return { ...prev, blank_answers: answers };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.question_text_fr.trim()) {
            setToast({ message: 'Le texte de la question FR est requis', type: 'error' });
            return;
        }

        setSaving(true);
        const payload = { ...form };

        const res = isEditing
            ? await api.put(`/elearning/questions/${id}`, payload, token)
            : await api.post('/elearning/questions', payload, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Question modifiée' : 'Question créée', type: 'success' });
            setTimeout(() => navigate('/elearning/questions'), 1000);
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
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
                            {isEditing ? 'Modifier la question' : 'Nouvelle question'}
                        </h2>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/elearning/questions" className="btn btn-outline-secondary">
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
                        {/* Question Text */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="fas fa-question-circle me-2" style={{ color: '#3498DB' }}></i>Question</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Question FR *</label>
                                        <textarea className="form-control" name="question_text_fr" value={form.question_text_fr}
                                            onChange={handleChange} rows={3} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Question EN</label>
                                        <textarea className="form-control" name="question_text_en" value={form.question_text_en}
                                            onChange={handleChange} rows={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Type Selection */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="fas fa-list me-2" style={{ color: '#9B59B6' }}></i>Type de question</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {questionTypes.map(qt => (
                                        <button key={qt.value} type="button"
                                            className={`btn btn-sm ${form.question_type === qt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setForm(prev => ({ ...prev, question_type: qt.value }))}
                                            style={form.question_type === qt.value ? { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' } : {}}>
                                            <i className={`fas ${qt.icon} me-1`}></i> {qt.label}
                                        </button>
                                    ))}
                                </div>

                                {/* MCQ Options */}
                                {form.question_type === 'mcq' && (
                                    <div>
                                        <label className="form-label small fw-bold">Options (radio - une seule réponse correcte)</label>
                                        {form.options.map((opt, idx) => (
                                            <div key={idx} className="d-flex gap-2 align-items-center mb-2">
                                                <input type="radio" name="mcq_correct" checked={opt.is_correct}
                                                    onChange={() => updateOption(idx, 'is_correct', true)} className="form-check-input" />
                                                <input type="text" className="form-control form-control-sm" placeholder="Option FR"
                                                    value={opt.text_fr} onChange={(e) => updateOption(idx, 'text_fr', e.target.value)} />
                                                <input type="text" className="form-control form-control-sm" placeholder="Option EN"
                                                    value={opt.text_en} onChange={(e) => updateOption(idx, 'text_en', e.target.value)} />
                                                {form.options.length > 1 && (
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeOption(idx)}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addOption}>
                                            <i className="fas fa-plus me-1"></i> Ajouter une option
                                        </button>
                                    </div>
                                )}

                                {/* True/False */}
                                {form.question_type === 'true_false' && (
                                    <div>
                                        <label className="form-label small fw-bold">Réponse correcte</label>
                                        <div className="d-flex gap-3">
                                            <div className="form-check">
                                                <input type="radio" className="form-check-input" name="tf_answer" checked={form.correct_answer === true}
                                                    onChange={() => setForm(prev => ({ ...prev, correct_answer: true }))} />
                                                <label className="form-check-label">Vrai</label>
                                            </div>
                                            <div className="form-check">
                                                <input type="radio" className="form-check-input" name="tf_answer" checked={form.correct_answer === false}
                                                    onChange={() => setForm(prev => ({ ...prev, correct_answer: false }))} />
                                                <label className="form-check-label">Faux</label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Multiple Select */}
                                {form.question_type === 'multiple_select' && (
                                    <div>
                                        <label className="form-label small fw-bold">Options (checkboxes - plusieurs réponses possibles)</label>
                                        {form.options.map((opt, idx) => (
                                            <div key={idx} className="d-flex gap-2 align-items-center mb-2">
                                                <input type="checkbox" className="form-check-input" checked={opt.is_correct}
                                                    onChange={(e) => updateOption(idx, 'is_correct', e.target.checked)} />
                                                <input type="text" className="form-control form-control-sm" placeholder="Option FR"
                                                    value={opt.text_fr} onChange={(e) => updateOption(idx, 'text_fr', e.target.value)} />
                                                <input type="text" className="form-control form-control-sm" placeholder="Option EN"
                                                    value={opt.text_en} onChange={(e) => updateOption(idx, 'text_en', e.target.value)} />
                                                {form.options.length > 1 && (
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeOption(idx)}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addOption}>
                                            <i className="fas fa-plus me-1"></i> Ajouter une option
                                        </button>
                                    </div>
                                )}

                                {/* Matching */}
                                {form.question_type === 'matching' && (
                                    <div>
                                        <label className="form-label small fw-bold">Paires d'association</label>
                                        {form.matching_pairs.map((pair, idx) => (
                                            <div key={idx} className="row g-2 mb-2 align-items-center">
                                                <div className="col-md-3">
                                                    <input type="text" className="form-control form-control-sm" placeholder="Gauche FR"
                                                        value={pair.left_fr} onChange={(e) => updatePair(idx, 'left_fr', e.target.value)} />
                                                </div>
                                                <div className="col-md-3">
                                                    <input type="text" className="form-control form-control-sm" placeholder="Gauche EN"
                                                        value={pair.left_en} onChange={(e) => updatePair(idx, 'left_en', e.target.value)} />
                                                </div>
                                                <div className="col-auto"><i className="fas fa-arrows-alt-h text-muted"></i></div>
                                                <div className="col-md-3">
                                                    <input type="text" className="form-control form-control-sm" placeholder="Droite FR"
                                                        value={pair.right_fr} onChange={(e) => updatePair(idx, 'right_fr', e.target.value)} />
                                                </div>
                                                <div className="col">
                                                    <input type="text" className="form-control form-control-sm" placeholder="Droite EN"
                                                        value={pair.right_en} onChange={(e) => updatePair(idx, 'right_en', e.target.value)} />
                                                </div>
                                                {form.matching_pairs.length > 1 && (
                                                    <div className="col-auto">
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removePair(idx)}>
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addPair}>
                                            <i className="fas fa-plus me-1"></i> Ajouter une paire
                                        </button>
                                    </div>
                                )}

                                {/* Fill in the blank */}
                                {form.question_type === 'fill_blank' && (
                                    <div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Texte avec blancs (utilisez ___ pour les trous)</label>
                                            <textarea className="form-control" name="blank_text_fr" value={form.blank_text_fr}
                                                onChange={handleChange} rows={3} placeholder="Le ___ est un animal ___." />
                                        </div>
                                        <label className="form-label small fw-bold">Réponses acceptées</label>
                                        {form.blank_answers.map((ans, idx) => (
                                            <div key={idx} className="d-flex gap-2 mb-2">
                                                <input type="text" className="form-control form-control-sm" placeholder={`Réponse ${idx + 1}`}
                                                    value={ans} onChange={(e) => updateBlankAnswer(idx, e.target.value)} />
                                                {form.blank_answers.length > 1 && (
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeBlankAnswer(idx)}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addBlankAnswer}>
                                            <i className="fas fa-plus me-1"></i> Ajouter une réponse
                                        </button>
                                    </div>
                                )}

                                {/* Short Answer */}
                                {form.question_type === 'short_answer' && (
                                    <div>
                                        <label className="form-label small fw-bold">Réponse attendue</label>
                                        <input type="text" className="form-control" name="short_answer" value={form.short_answer}
                                            onChange={handleChange} placeholder="Réponse correcte attendue" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Explanation */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="fas fa-lightbulb me-2" style={{ color: '#F39C12' }}></i>Explication</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Explication FR</label>
                                        <textarea className="form-control" name="explanation_fr" value={form.explanation_fr}
                                            onChange={handleChange} rows={3} placeholder="Explication de la réponse correcte..." />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Explication EN</label>
                                        <textarea className="form-control" name="explanation_en" value={form.explanation_en}
                                            onChange={handleChange} rows={3} placeholder="Explanation of the correct answer..." />
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
                                    <label className="form-label small">Difficulté</label>
                                    <select className="form-select" name="difficulty" value={form.difficulty} onChange={handleChange}>
                                        <option value="easy">Facile</option>
                                        <option value="medium">Moyen</option>
                                        <option value="hard">Difficile</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small">Points</label>
                                    <input type="number" className="form-control" name="points" value={form.points}
                                        onChange={handleChange} min="1" />
                                </div>
                                <div className="form-check">
                                    <input type="checkbox" className="form-check-input" id="is_active"
                                        name="is_active" checked={form.is_active} onChange={handleChange} />
                                    <label className="form-check-label" htmlFor="is_active">Question active</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default QuestionEditor;
