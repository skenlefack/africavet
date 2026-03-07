import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const ELearningDashboard = () => {
    const token = getToken();
    const [stats, setStats] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchData = async () => {
        const [statsRes, coursesRes] = await Promise.all([
            api.get('/elearning/stats', token),
            api.get('/elearning/courses', token)
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (coursesRes.success) setCourses(coursesRes.data || []);
        setLoading(false);
    };

    const modules = [
        { key: 'courses', label: 'Cours', icon: '📚', color: '#3498DB', path: '/elearning/courses', count: stats?.totalCourses || 0 },
        { key: 'modules', label: 'Modules', icon: '📖', color: '#9B59B6', path: '/elearning/modules', count: stats?.totalModules || 0 },
        { key: 'quizzes', label: 'Quiz', icon: '❓', color: '#E67E22', path: '/elearning/quizzes', count: stats?.totalQuizzes || 0 },
        { key: 'students', label: 'Étudiants', icon: '👨‍🎓', color: '#27AE60', path: '/elearning/students', count: stats?.totalStudents || 0 },
        { key: 'certificates', label: 'Certificats', icon: '🎓', color: '#F39C12', path: '/elearning/certificates', count: stats?.totalCertificates || 0 },
        { key: 'paths', label: 'Parcours', icon: '🛤️', color: '#1ABC9C', path: '/elearning/paths', count: stats?.totalPaths || 0 },
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
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div
                        className="card"
                        style={{
                            background: 'linear-gradient(135deg, #3498DB 0%, #9B59B6 50%, #354e84 100%)',
                            border: 'none',
                            borderRadius: '16px'
                        }}
                    >
                        <div className="card-body py-4">
                            <div className="d-flex align-items-center text-white">
                                <div
                                    className="me-4 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.2)'
                                    }}
                                >
                                    <span style={{ fontSize: '28px' }}>🎓</span>
                                </div>
                                <div>
                                    <h2 className="mb-1" style={{ fontWeight: '700' }}>
                                        E-Learning
                                    </h2>
                                    <p className="mb-0" style={{ opacity: 0.9 }}>
                                        Plateforme de formation vétérinaire en ligne
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="row mb-4">
                {modules.slice(0, 4).map((mod) => (
                    <div key={mod.key} className="col-md-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div
                                        className="me-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '12px',
                                            background: `${mod.color}20`,
                                            fontSize: '24px'
                                        }}
                                    >
                                        {mod.icon}
                                    </div>
                                    <div>
                                        <h3 className="mb-0" style={{ color: mod.color, fontWeight: '800' }}>
                                            {mod.count}
                                        </h3>
                                        <small className="text-muted">{mod.label}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modules Grid */}
            <div className="row g-4 mb-4">
                {modules.map((mod) => (
                    <div key={mod.key} className="col-md-4 col-lg-2">
                        <Link to={mod.path} style={{ textDecoration: 'none' }}>
                            <div className="card h-100 text-center" style={{ cursor: 'pointer' }}>
                                <div className="card-body py-4">
                                    <div
                                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: `${mod.color}20`,
                                            fontSize: '24px'
                                        }}
                                    >
                                        {mod.icon}
                                    </div>
                                    <h6 className="mb-1" style={{ fontWeight: '600', fontSize: '14px' }}>{mod.label}</h6>
                                    <span className="badge" style={{ background: `${mod.color}20`, color: mod.color }}>
                                        {mod.count}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Recent Courses */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Cours récents</h5>
                    <Link to="/elearning/courses/new" className="btn btn-primary btn-sm" style={{
                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                        border: 'none'
                    }}>
                        <i className="fas fa-plus me-2"></i> Nouveau cours
                    </Link>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Titre</th>
                                    <th>Catégorie</th>
                                    <th>Modules</th>
                                    <th>Étudiants</th>
                                    <th>Statut</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.length > 0 ? (
                                    courses.slice(0, 5).map((course) => (
                                        <tr key={course.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {course.thumbnail && (
                                                        <img
                                                            src={course.thumbnail}
                                                            alt=""
                                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', marginRight: '12px' }}
                                                        />
                                                    )}
                                                    <div>
                                                        <h6 className="mb-0">{course.title_fr || course.title}</h6>
                                                        <small className="text-muted">{course.duration || '0h'}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark">
                                                    {course.category_name || 'Non catégorisé'}
                                                </span>
                                            </td>
                                            <td>{course.modules_count || 0}</td>
                                            <td>{course.students_count || 0}</td>
                                            <td>
                                                <span className={`badge ${course.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                                                    {course.status === 'published' ? 'Publié' : 'Brouillon'}
                                                </span>
                                            </td>
                                            <td>
                                                <Link to={`/elearning/courses/${course.id}`} className="btn btn-sm btn-outline-primary">
                                                    <i className="fas fa-edit"></i>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-5">
                                            Aucun cours créé
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {courses.length > 5 && (
                    <div className="card-footer text-center">
                        <Link to="/elearning/courses" className="btn btn-outline-primary btn-sm">
                            Voir tous les cours
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="row mt-4">
                <div className="col-12">
                    <h5 className="mb-3">Actions rapides</h5>
                </div>
                <div className="col-md-3">
                    <div className="card">
                        <div className="card-body d-flex align-items-center">
                            <div
                                className="me-3 d-flex align-items-center justify-content-center"
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '10px',
                                    background: '#3498DB20'
                                }}
                            >
                                <i className="fas fa-plus" style={{ color: '#3498DB' }}></i>
                            </div>
                            <div>
                                <h6 className="mb-0" style={{ fontSize: '14px' }}>Nouveau cours</h6>
                                <Link to="/elearning/courses/new" className="text-muted small">Créer</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card">
                        <div className="card-body d-flex align-items-center">
                            <div
                                className="me-3 d-flex align-items-center justify-content-center"
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '10px',
                                    background: '#E67E2220'
                                }}
                            >
                                <i className="fas fa-question-circle" style={{ color: '#E67E22' }}></i>
                            </div>
                            <div>
                                <h6 className="mb-0" style={{ fontSize: '14px' }}>Nouveau quiz</h6>
                                <Link to="/elearning/quizzes/new" className="text-muted small">Créer</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card">
                        <div className="card-body d-flex align-items-center">
                            <div
                                className="me-3 d-flex align-items-center justify-content-center"
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '10px',
                                    background: '#F39C1220'
                                }}
                            >
                                <i className="fas fa-certificate" style={{ color: '#F39C12' }}></i>
                            </div>
                            <div>
                                <h6 className="mb-0" style={{ fontSize: '14px' }}>Certificats</h6>
                                <Link to="/elearning/certificates" className="text-muted small">Gérer</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card">
                        <div className="card-body d-flex align-items-center">
                            <div
                                className="me-3 d-flex align-items-center justify-content-center"
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '10px',
                                    background: '#27AE6020'
                                }}
                            >
                                <i className="fas fa-chart-bar" style={{ color: '#27AE60' }}></i>
                            </div>
                            <div>
                                <h6 className="mb-0" style={{ fontSize: '14px' }}>Statistiques</h6>
                                <Link to="/elearning/stats" className="text-muted small">Voir</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ELearningDashboard;
