import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const QuestionsList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const questionTypes = [
        { value: 'mcq', label: 'QCM', color: '#3498DB' },
        { value: 'true_false', label: 'Vrai/Faux', color: '#27AE60' },
        { value: 'multiple_select', label: 'Sélection multiple', color: '#9B59B6' },
        { value: 'matching', label: 'Association', color: '#E67E22' },
        { value: 'fill_blank', label: 'Texte à trous', color: '#1ABC9C' },
        { value: 'short_answer', label: 'Réponse courte', color: '#E74C3C' }
    ];

    const difficulties = [
        { value: 'easy', label: 'Facile', color: 'success' },
        { value: 'medium', label: 'Moyen', color: 'warning' },
        { value: 'hard', label: 'Difficile', color: 'danger' }
    ];

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        const res = await api.get('/elearning/questions', token);
        if (res.success) setQuestions(res.data || []);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette question ?')) {
            const res = await api.delete(`/elearning/questions/${id}`, token);
            if (res.success) {
                setToast({ message: 'Question supprimée', type: 'success' });
                setQuestions(prev => prev.filter(q => q.id !== id));
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    const getTypeBadge = (type) => {
        const t = questionTypes.find(qt => qt.value === type);
        if (!t) return <span className="badge bg-secondary">{type}</span>;
        return <span className="badge" style={{ background: t.color, color: '#fff' }}>{t.label}</span>;
    };

    const getDifficultyBadge = (difficulty) => {
        const d = difficulties.find(df => df.value === difficulty);
        if (!d) return <span className="badge bg-secondary">{difficulty}</span>;
        return <span className={`badge bg-${d.color}`}>{d.label}</span>;
    };

    // Filtering
    const filteredQuestions = questions.filter(q => {
        const text = (q.question_text_fr || q.question_text || '').toLowerCase();
        const matchesSearch = text.includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || q.question_type === typeFilter;
        const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
        return matchesSearch && matchesType && matchesDifficulty;
    });

    // Pagination
    const totalItems = filteredQuestions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter, difficultyFilter, itemsPerPage]);

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

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Banque de questions</h2>
                    <p className="text-muted mb-0">{questions.length} questions</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/elearning" className="btn btn-outline-secondary">
                        <i className="fas fa-arrow-left me-2"></i> Retour
                    </Link>
                    <Link to="/elearning/questions/new" className="btn btn-primary"
                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                        <i className="fas fa-plus me-2"></i> Nouvelle question
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input type="text" className="form-control border-start-0" placeholder="Rechercher..."
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                {searchQuery && (
                                    <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearchQuery('')}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                                <option value="all">Tous les types</option>
                                {questionTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
                                <option value="all">Toutes les difficultés</option>
                                {difficulties.map(d => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2 text-end">
                            <span className="text-muted small">{filteredQuestions.length} résultat{filteredQuestions.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th style={{ width: '45%' }}>Question</th>
                                    <th>Type</th>
                                    <th>Difficulté</th>
                                    <th>Points</th>
                                    <th>Actif</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedQuestions.map(q => (
                                    <tr key={q.id}>
                                        <td>
                                            <div style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {q.question_text_fr || q.question_text || '-'}
                                            </div>
                                        </td>
                                        <td>{getTypeBadge(q.question_type)}</td>
                                        <td>{getDifficultyBadge(q.difficulty)}</td>
                                        <td>{q.points || 1}</td>
                                        <td>
                                            {q.is_active !== false ? (
                                                <i className="fas fa-check-circle text-success"></i>
                                            ) : (
                                                <i className="fas fa-times-circle text-muted"></i>
                                            )}
                                        </td>
                                        <td>
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-primary" onClick={() => navigate(`/elearning/questions/${q.id}`)}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-outline-danger" onClick={() => handleDelete(q.id)}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedQuestions.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            <i className="fas fa-question-circle fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0">Aucune question trouvée</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {totalItems > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        itemName="questions"
                    />
                )}
            </div>
        </>
    );
};

export default QuestionsList;
