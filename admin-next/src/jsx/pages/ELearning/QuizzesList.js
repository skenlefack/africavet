import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const QuizzesList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    useEffect(() => {
        fetchQuizzes();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchQuizzes = async () => {
        const res = await api.get('/elearning/quizzes', token);
        if (res.success) setQuizzes(res.data || []);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce quiz ?')) {
            const res = await api.delete(`/elearning/quizzes/${id}`, token);
            if (res.success) {
                setToast({ message: 'Quiz supprimé', type: 'success' });
                setQuizzes(prev => prev.filter(q => q.id !== id));
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    const getTypeBadge = (type) => {
        const types = {
            module: { label: 'Module', color: '#9B59B6' },
            final: { label: 'Final', color: '#E74C3C' },
            practice: { label: 'Pratique', color: '#27AE60' },
            assessment: { label: 'Évaluation', color: '#3498DB' }
        };
        const t = types[type] || { label: type || 'Standard', color: '#6c757d' };
        return <span className="badge" style={{ background: t.color }}>{t.label}</span>;
    };

    // Filtering
    const filteredQuizzes = quizzes.filter(q => {
        const title = (q.title_fr || q.title || '').toLowerCase();
        const matchesSearch = title.includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalItems = filteredQuizzes.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedQuizzes = filteredQuizzes.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, itemsPerPage]);

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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Quiz</h2>
                    <p className="text-muted mb-0">{quizzes.length} quiz au total</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/elearning" className="btn btn-outline-secondary">
                        <i className="fas fa-arrow-left me-2"></i> Retour
                    </Link>
                    <Link to="/elearning/quizzes/new" className="btn btn-primary"
                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                        <i className="fas fa-plus me-2"></i> Nouveau quiz
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input type="text" className="form-control border-start-0" placeholder="Rechercher un quiz..."
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">Tous les statuts</option>
                                <option value="published">Publié</option>
                                <option value="draft">Brouillon</option>
                            </select>
                        </div>
                        <div className="col-md-4 text-end">
                            <span className="text-muted small">{filteredQuizzes.length} résultat{filteredQuizzes.length !== 1 ? 's' : ''}</span>
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
                                    <th>Titre</th>
                                    <th>Type</th>
                                    <th>Questions</th>
                                    <th>Score min.</th>
                                    <th>Temps</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedQuizzes.map(q => (
                                    <tr key={q.id}>
                                        <td>
                                            <strong>{q.title_fr || q.title}</strong>
                                            {q.title_en && <small className="text-muted d-block">{q.title_en}</small>}
                                        </td>
                                        <td>{getTypeBadge(q.quiz_type)}</td>
                                        <td>
                                            <span className="badge bg-light text-dark">
                                                <i className="fas fa-question-circle me-1"></i>{q.questions_count || 0}
                                            </span>
                                        </td>
                                        <td>{q.passing_score || 70}%</td>
                                        <td>{q.time_limit ? `${q.time_limit} min` : 'Illimité'}</td>
                                        <td>
                                            <span className={`badge ${q.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                                                {q.status === 'published' ? 'Publié' : 'Brouillon'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-primary" onClick={() => navigate(`/elearning/quizzes/${q.id}`)}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-outline-danger" onClick={() => handleDelete(q.id)}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedQuizzes.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">
                                            <i className="fas fa-question-circle fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0">Aucun quiz trouvé</p>
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
                        itemName="quiz"
                    />
                )}
            </div>
        </>
    );
};

export default QuizzesList;
