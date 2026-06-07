import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../../../services/AuthService';

// Icons
const icons = {
    posts: '📝',
    users: '👥',
    categories: '📁',
    media: '🖼️',
    pages: '📄',
    annuaire: '🗺️',
    elearning: '🎓',
    clinics: '🏥',
    labs: '🔬',
    pharmacies: '💊',
};

const StatCard = ({ title, value, icon, color, link }) => (
    <Link to={link} className="col-xl-3 col-lg-4 col-md-6 col-sm-6" style={{ textDecoration: 'none' }}>
        <div className="card" style={{ borderLeft: `4px solid ${color}`, cursor: 'pointer' }}>
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <div
                        className="me-3 d-flex align-items-center justify-content-center"
                        style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '14px',
                            background: `${color}20`,
                            fontSize: '24px'
                        }}
                    >
                        {icon}
                    </div>
                    <div>
                        <h2 className="mb-0" style={{ color: color, fontWeight: '800' }}>{value}</h2>
                        <span className="text-muted" style={{ fontSize: '13px' }}>{title}</span>
                    </div>
                </div>
            </div>
        </div>
    </Link>
);

const QuickAction = ({ title, description, icon, color, link }) => (
    <Link to={link} className="col-xl-4 col-lg-6" style={{ textDecoration: 'none' }}>
        <div className="card h-100" style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
            <div className="card-body d-flex align-items-center">
                <div
                    className="me-3 d-flex align-items-center justify-content-center"
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
                        fontSize: '28px'
                    }}
                >
                    {icon}
                </div>
                <div>
                    <h5 className="mb-1" style={{ fontWeight: '600' }}>{title}</h5>
                    <p className="mb-0 text-muted" style={{ fontSize: '13px' }}>{description}</p>
                </div>
            </div>
        </div>
    </Link>
);

function AfricaVetDashboard() {
    const [stats, setStats] = useState({
        posts: 0,
        users: 0,
        categories: 0,
        media: 0,
        pages: 0,
        organizations: 0,
        courses: 0,
    });
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchRecentPosts();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get('/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentPosts = async () => {
        try {
            const response = await axiosInstance.get('/posts?limit=5&sort=-created_at');
            if (response.data.success) {
                setRecentPosts(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching recent posts:', error);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div
                        className="card"
                        style={{
                            background: 'linear-gradient(135deg, #7ac142 0%, #4a7a5a 50%, #354e84 100%)',
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
                                    <span style={{ fontSize: '28px' }}>🐾</span>
                                </div>
                                <div>
                                    <h2 className="mb-1" style={{ fontWeight: '700' }}>
                                        Bienvenue sur AfricaVET
                                    </h2>
                                    <p className="mb-0" style={{ opacity: 0.9 }}>
                                        Panneau d'administration - Gérez votre plateforme vétérinaire panafricaine
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row">
                <StatCard
                    title="Articles"
                    value={loading ? '...' : stats.posts?.total || 0}
                    icon={icons.posts}
                    color="#27AE60"
                    link="/posts"
                />
                <StatCard
                    title="Utilisateurs"
                    value={loading ? '...' : stats.users?.total || 0}
                    icon={icons.users}
                    color="#3498DB"
                    link="/users"
                />
                <StatCard
                    title="Catégories"
                    value={loading ? '...' : stats.categories?.total || 0}
                    icon={icons.categories}
                    color="#E67E22"
                    link="/categories"
                />
                <StatCard
                    title="Médias"
                    value={loading ? '...' : stats.media?.total || 0}
                    icon={icons.media}
                    color="#9B59B6"
                    link="/media"
                />
            </div>

            {/* Quick Actions */}
            <div className="row mt-2">
                <div className="col-12">
                    <h4 className="mb-3" style={{ fontWeight: '600' }}>Actions rapides</h4>
                </div>
                <QuickAction
                    title="Nouvel article"
                    description="Créer et publier un article"
                    icon="✍️"
                    color="#27AE60"
                    link="/posts/new"
                />
                <QuickAction
                    title="Annuaire Panafricain"
                    description="Gérer les établissements vétérinaires"
                    icon="🗺️"
                    color="#0d9488"
                    link="/annuaire"
                />
                <QuickAction
                    title="E-Learning"
                    description="Gérer les cours et formations"
                    icon="🎓"
                    color="#3498DB"
                    link="/elearning"
                />
            </div>

            {/* Recent Posts & Stats */}
            <div className="row mt-4">
                {/* Recent Posts */}
                <div className="col-xl-8 col-lg-7">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="card-title mb-0">Articles récents</h4>
                            <Link to="/posts" className="btn btn-primary btn-sm">Voir tout</Link>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>Titre</th>
                                            <th>Catégorie</th>
                                            <th>Statut</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentPosts.length > 0 ? (
                                            recentPosts.map((post) => (
                                                <tr key={post.id}>
                                                    <td>
                                                        <Link to={`/posts/${post.id}`} className="text-dark fw-semibold">
                                                            {post.title?.substring(0, 40)}...
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        <span className="badge" style={{ background: '#0d948820', color: '#0d9488' }}>
                                                            {post.category_name || 'Sans catégorie'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${post.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                                                            {post.status === 'published' ? 'Publié' : 'Brouillon'}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted" style={{ fontSize: '13px' }}>
                                                        {new Date(post.created_at).toLocaleDateString('fr-FR')}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center text-muted py-4">
                                                    Aucun article récent
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Annuaire Stats */}
                <div className="col-xl-4 col-lg-5">
                    <div className="card h-100">
                        <div className="card-header">
                            <h4 className="card-title mb-0">Annuaire Panafricain</h4>
                        </div>
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-3 p-3" style={{ background: '#f8fafc', borderRadius: '12px' }}>
                                <span style={{ fontSize: '24px', marginRight: '12px' }}>🏥</span>
                                <div className="flex-grow-1">
                                    <h6 className="mb-0">Cliniques & Hôpitaux</h6>
                                </div>
                                <span className="badge" style={{ background: '#27AE6020', color: '#27AE60' }}>
                                    {stats.organizations?.clinics || 0}
                                </span>
                            </div>
                            <div className="d-flex align-items-center mb-3 p-3" style={{ background: '#f8fafc', borderRadius: '12px' }}>
                                <span style={{ fontSize: '24px', marginRight: '12px' }}>🔬</span>
                                <div className="flex-grow-1">
                                    <h6 className="mb-0">Laboratoires</h6>
                                </div>
                                <span className="badge" style={{ background: '#3498DB20', color: '#3498DB' }}>
                                    {stats.organizations?.labs || 0}
                                </span>
                            </div>
                            <div className="d-flex align-items-center mb-3 p-3" style={{ background: '#f8fafc', borderRadius: '12px' }}>
                                <span style={{ fontSize: '24px', marginRight: '12px' }}>💊</span>
                                <div className="flex-grow-1">
                                    <h6 className="mb-0">Pharmacies</h6>
                                </div>
                                <span className="badge" style={{ background: '#9B59B620', color: '#9B59B6' }}>
                                    {stats.organizations?.pharmacies || 0}
                                </span>
                            </div>
                            <div className="d-flex align-items-center p-3" style={{ background: '#f8fafc', borderRadius: '12px' }}>
                                <span style={{ fontSize: '24px', marginRight: '12px' }}>🎓</span>
                                <div className="flex-grow-1">
                                    <h6 className="mb-0">Écoles & Formation</h6>
                                </div>
                                <span className="badge" style={{ background: '#F39C1220', color: '#F39C12' }}>
                                    {stats.organizations?.schools || 0}
                                </span>
                            </div>
                            <Link to="/annuaire" className="btn btn-primary w-100 mt-3" style={{
                                background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                border: 'none'
                            }}>
                                Gérer l'annuaire
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AfricaVetDashboard;
