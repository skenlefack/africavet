import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const ModulesList = () => {
    const token = getToken();
    const [modules, setModules] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    useEffect(() => {
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchData = async () => {
        const [coursesRes] = await Promise.all([
            api.get('/elearning/courses', token)
        ]);
        if (coursesRes.success) {
            const coursesList = coursesRes.data || [];
            setCourses(coursesList);
            // Fetch modules for all courses
            const allModules = [];
            for (const course of coursesList) {
                const modRes = await api.get(`/elearning/courses/${course.id}/modules`, token);
                if (modRes.success && modRes.data) {
                    modRes.data.forEach(m => {
                        allModules.push({ ...m, course_title: course.title_fr || course.title, course_id: course.id });
                    });
                }
            }
            setModules(allModules);
        }
        setLoading(false);
    };

    const handleDelete = async (moduleId) => {
        if (window.confirm('Supprimer ce module et toutes ses leçons ?')) {
            const res = await api.delete(`/elearning/modules/${moduleId}`, token);
            if (res.success) {
                setToast({ message: 'Module supprimé', type: 'success' });
                setModules(prev => prev.filter(m => m.id !== moduleId));
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    // Filtering
    const filteredModules = modules.filter(mod => {
        const title = (mod.title_fr || mod.title || '').toLowerCase();
        const matchesSearch = title.includes(searchQuery.toLowerCase());
        const matchesCourse = courseFilter === 'all' || mod.course_id === parseInt(courseFilter);
        return matchesSearch && matchesCourse;
    });

    // Pagination
    const totalItems = filteredModules.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedModules = filteredModules.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, courseFilter, itemsPerPage]);

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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Modules</h2>
                    <p className="text-muted mb-0">{modules.length} modules au total</p>
                </div>
                <Link to="/elearning" className="btn btn-outline-secondary">
                    <i className="fas fa-arrow-left me-2"></i> Retour
                </Link>
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
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Rechercher un module..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearchQuery('')}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select className="form-select" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                                <option value="all">Tous les cours</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.title_fr || c.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 text-end">
                            <span className="text-muted small">{filteredModules.length} résultat{filteredModules.length !== 1 ? 's' : ''}</span>
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
                                    <th>#</th>
                                    <th>Titre</th>
                                    <th>Cours</th>
                                    <th>Leçons</th>
                                    <th>Quiz</th>
                                    <th>Durée</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedModules.map((mod, idx) => (
                                    <tr key={mod.id}>
                                        <td>{startIndex + idx + 1}</td>
                                        <td>
                                            <strong>{mod.title_fr || mod.title}</strong>
                                            {mod.title_en && <small className="text-muted d-block">{mod.title_en}</small>}
                                        </td>
                                        <td>
                                            <Link to={`/elearning/courses/${mod.course_id}`} className="text-decoration-none">
                                                {mod.course_title}
                                            </Link>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark">
                                                <i className="fas fa-file-alt me-1"></i>{mod.lessons_count || (mod.lessons || []).length || 0}
                                            </span>
                                        </td>
                                        <td>
                                            {mod.quiz_id ? (
                                                <span className="badge bg-info"><i className="fas fa-check me-1"></i>Oui</span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            {mod.duration ? `${mod.duration}h` : mod.duration_minutes ? `${mod.duration_minutes} min` : '-'}
                                        </td>
                                        <td>
                                            <span className={`badge ${mod.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                                                {mod.status === 'published' ? 'Publié' : 'Brouillon'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="btn-group btn-group-sm">
                                                <Link to={`/elearning/courses/${mod.course_id}`} className="btn btn-outline-primary" title="Modifier dans le cours">
                                                    <i className="fas fa-edit"></i>
                                                </Link>
                                                <button className="btn btn-outline-danger" onClick={() => handleDelete(mod.id)} title="Supprimer">
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedModules.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted">
                                            <i className="fas fa-book fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0">Aucun module trouvé</p>
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
                        itemName="modules"
                    />
                )}
            </div>
        </>
    );
};

export default ModulesList;
