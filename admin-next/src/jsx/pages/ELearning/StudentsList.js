import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const StudentsList = () => {
    const token = getToken();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    useEffect(() => {
        fetchEnrollments();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchEnrollments = async () => {
        const res = await api.get('/elearning/enrollments', token);
        if (res.success) setEnrollments(res.data || []);
        setLoading(false);
    };

    const getStatusBadge = (status) => {
        const statuses = {
            active: { label: 'Actif', color: 'success' },
            completed: { label: 'Terminé', color: 'primary' },
            suspended: { label: 'Suspendu', color: 'warning' },
            expired: { label: 'Expiré', color: 'secondary' }
        };
        const s = statuses[status] || { label: status || 'Inconnu', color: 'secondary' };
        return <span className={`badge bg-${s.color}`}>{s.label}</span>;
    };

    // Filtering
    const filtered = enrollments.filter(e => {
        const name = (e.user_name || e.user_email || '').toLowerCase();
        const course = (e.course_title || '').toLowerCase();
        const search = searchQuery.toLowerCase();
        const matchesSearch = name.includes(search) || course.includes(search);
        const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, itemsPerPage]);

    // Stats
    const activeCount = enrollments.filter(e => e.status === 'active').length;
    const completedCount = enrollments.filter(e => e.status === 'completed').length;

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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Étudiants</h2>
                    <p className="text-muted mb-0">{enrollments.length} inscriptions</p>
                </div>
                <Link to="/elearning" className="btn btn-outline-secondary">
                    <i className="fas fa-arrow-left me-2"></i> Retour
                </Link>
            </div>

            {/* Stats */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card bg-light border-0">
                        <div className="card-body py-3 text-center">
                            <h4 className="mb-0">{enrollments.length}</h4>
                            <small className="text-muted">Total inscriptions</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success bg-opacity-10 border-0">
                        <div className="card-body py-3 text-center">
                            <h4 className="mb-0 text-success">{activeCount}</h4>
                            <small className="text-muted">En cours</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-primary bg-opacity-10 border-0">
                        <div className="card-body py-3 text-center">
                            <h4 className="mb-0 text-primary">{completedCount}</h4>
                            <small className="text-muted">Terminés</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info bg-opacity-10 border-0">
                        <div className="card-body py-3 text-center">
                            <h4 className="mb-0 text-info">
                                {enrollments.length > 0 ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length) : 0}%
                            </h4>
                            <small className="text-muted">Progression moy.</small>
                        </div>
                    </div>
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
                                <input type="text" className="form-control border-start-0" placeholder="Rechercher par nom ou cours..."
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">Tous les statuts</option>
                                <option value="active">Actif</option>
                                <option value="completed">Terminé</option>
                                <option value="suspended">Suspendu</option>
                                <option value="expired">Expiré</option>
                            </select>
                        </div>
                        <div className="col-md-4 text-end">
                            <span className="text-muted small">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
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
                                    <th>Étudiant</th>
                                    <th>Cours</th>
                                    <th>Progression</th>
                                    <th>Date inscription</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(e => (
                                    <tr key={e.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="me-2 d-flex align-items-center justify-content-center"
                                                    style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#7ac14220', color: '#7ac142', fontWeight: '600' }}>
                                                    {(e.user_name || e.user_email || '?')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <strong className="small">{e.user_name || 'N/A'}</strong>
                                                    <small className="text-muted d-block">{e.user_email || ''}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <Link to={`/elearning/courses/${e.course_id}`} className="text-decoration-none small">
                                                {e.course_title || 'Cours'}
                                            </Link>
                                        </td>
                                        <td style={{ minWidth: '150px' }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="progress flex-grow-1" style={{ height: '8px' }}>
                                                    <div
                                                        className={`progress-bar ${(e.progress || 0) >= 100 ? 'bg-success' : (e.progress || 0) >= 50 ? 'bg-info' : 'bg-warning'}`}
                                                        style={{ width: `${Math.min(e.progress || 0, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <small className="text-muted" style={{ minWidth: '35px' }}>{e.progress || 0}%</small>
                                            </div>
                                        </td>
                                        <td>
                                            <small>{e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString('fr-FR') : '-'}</small>
                                        </td>
                                        <td>{getStatusBadge(e.status)}</td>
                                    </tr>
                                ))}
                                {paginated.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            <i className="fas fa-user-graduate fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0">Aucune inscription trouvée</p>
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
                        itemName="inscriptions"
                    />
                )}
            </div>
        </>
    );
};

export default StudentsList;
