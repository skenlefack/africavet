import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const CoursesList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);

    useEffect(() => {
        fetchCourses();
        fetchCategories();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCourses = async () => {
        const res = await api.get('/elearning/courses', token);
        if (res.success) setCourses(res.data || []);
        setLoading(false);
    };

    const fetchCategories = async () => {
        const res = await api.get('/elearning/categories', token);
        if (res.success) setCategories(res.data || []);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce cours ?')) {
            const res = await api.delete(`/elearning/courses/${id}`, token);
            if (res.success) {
                setToast({ message: 'Cours supprimé', type: 'success' });
                fetchCourses();
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    const handleToggleStatus = async (course) => {
        const newStatus = course.status === 'published' ? 'draft' : 'published';
        const res = await api.put(`/elearning/courses/${course.id}`, { status: newStatus }, token);
        if (res.success) {
            setToast({ message: newStatus === 'published' ? 'Cours publié' : 'Cours dépublié', type: 'success' });
            fetchCourses();
        }
    };

    // Filtrage
    const filteredCourses = courses.filter(course => {
        const title = (course.title_fr || course.title || '').toLowerCase();
        const description = (course.description_fr || '').toLowerCase();
        const search = searchQuery.toLowerCase();
        const matchesSearch = title.includes(search) || description.includes(search);
        const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || course.category_id === parseInt(categoryFilter);
        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Pagination
    const totalItems = filteredCourses.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, categoryFilter, itemsPerPage]);

    // Compteurs
    const publishedCount = courses.filter(c => c.status === 'published').length;
    const draftCount = courses.filter(c => c.status === 'draft').length;
    const totalStudents = courses.reduce((sum, c) => sum + (c.students_count || 0), 0);

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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Cours</h2>
                    <p className="text-muted mb-0">{courses.length} cours ({totalStudents} étudiants inscrits)</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/elearning" className="btn btn-outline-secondary">
                        <i className="fas fa-arrow-left me-2"></i> Retour
                    </Link>
                    <Link to="/elearning/courses/new" className="btn btn-primary" style={{
                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                        border: 'none'
                    }}>
                        <i className="fas fa-plus me-2"></i> Nouveau cours
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card bg-light border-0">
                        <div className="card-body py-3 text-center">
                            <h4 className="mb-0">{courses.length}</h4>
                            <small className="text-muted">Total cours</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success bg-opacity-10 border-0">
                        <div className="card-body py-3 text-center">
                            <h4 className="mb-0 text-success">{publishedCount}</h4>
                            <small className="text-muted">Publiés</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning bg-opacity-10 border-0">
                        <div className="card-body py-3 text-center">
                            <h4 className="mb-0 text-warning">{draftCount}</h4>
                            <small className="text-muted">Brouillons</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info bg-opacity-10 border-0">
                        <div className="card-body py-3 text-center">
                            <h4 className="mb-0 text-info">{totalStudents}</h4>
                            <small className="text-muted">Étudiants</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="d-flex flex-wrap gap-2 mb-3">
                        <button
                            className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setStatusFilter('all')}
                            style={statusFilter === 'all' ? { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' } : {}}
                        >
                            Tous ({courses.length})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'published' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setStatusFilter('published')}
                        >
                            Publiés ({publishedCount})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'draft' ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => setStatusFilter('draft')}
                        >
                            Brouillons ({draftCount})
                        </button>
                    </div>
                    <div className="row g-3 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Rechercher un cours..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        className="btn btn-outline-secondary border-start-0"
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="all">Toutes les catégories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name_fr || cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 text-end">
                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                {filteredCourses.length} résultat{filteredCourses.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des cours */}
            <div className="row g-4">
                {paginatedCourses.map(course => (
                    <div key={course.id} className="col-md-4">
                        <div className="card h-100 shadow-sm">
                            {course.thumbnail ? (
                                <img
                                    src={course.thumbnail}
                                    alt={course.title_fr || course.title}
                                    className="card-img-top"
                                    style={{ height: '180px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div
                                    className="card-img-top d-flex align-items-center justify-content-center"
                                    style={{
                                        height: '180px',
                                        background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
                                    }}
                                >
                                    <i className="fas fa-graduation-cap fa-4x text-muted opacity-50"></i>
                                </div>
                            )}
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className={`badge ${course.status === 'published' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                        {course.status === 'published' ? 'Publié' : 'Brouillon'}
                                    </span>
                                    {course.category_name && (
                                        <span className="badge bg-light text-dark">{course.category_name}</span>
                                    )}
                                </div>
                                <h5 className="card-title mb-2">{course.title_fr || course.title}</h5>
                                {course.description_fr && (
                                    <p className="card-text small text-muted mb-3" style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {course.description_fr}
                                    </p>
                                )}
                                <div className="d-flex gap-3 text-muted" style={{ fontSize: '0.85rem' }}>
                                    <span><i className="fas fa-book me-1"></i> {course.modules_count || 0} modules</span>
                                    <span><i className="fas fa-users me-1"></i> {course.students_count || 0}</span>
                                    {course.duration && (
                                        <span><i className="fas fa-clock me-1"></i> {course.duration}h</span>
                                    )}
                                </div>
                            </div>
                            <div className="card-footer bg-transparent">
                                <div className="btn-group w-100 btn-group-sm">
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => navigate(`/elearning/courses/${course.id}`)}
                                    >
                                        <i className="fas fa-edit me-1"></i> Modifier
                                    </button>
                                    <button
                                        className={`btn ${course.status === 'published' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                        onClick={() => handleToggleStatus(course)}
                                    >
                                        <i className={`fas fa-${course.status === 'published' ? 'eye-slash' : 'eye'}`}></i>
                                    </button>
                                    <button
                                        className="btn btn-outline-danger"
                                        onClick={() => handleDelete(course.id)}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {paginatedCourses.length === 0 && (
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5 text-muted">
                                {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' ? (
                                    <>
                                        <i className="fas fa-search fa-3x mb-3 opacity-50"></i>
                                        <p className="mb-2">Aucun cours trouvé</p>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setStatusFilter('all');
                                                setCategoryFilter('all');
                                            }}
                                        >
                                            Réinitialiser les filtres
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-graduation-cap fa-3x mb-3 opacity-50"></i>
                                        <p className="mb-2">Aucun cours</p>
                                        <Link to="/elearning/courses/new" className="btn btn-primary">
                                            Créer un cours
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
                <div className="card mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        itemName="cours"
                        itemsPerPageOptions={[9, 18, 36]}
                    />
                </div>
            )}
        </>
    );
};

export default CoursesList;
