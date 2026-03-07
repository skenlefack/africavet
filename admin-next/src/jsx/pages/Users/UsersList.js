import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const UsersList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchUsers = async () => {
        const res = await api.get('/users', token);
        if (res.success) setUsers(res.data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cet utilisateur ?')) {
            const res = await api.delete(`/users/${id}`, token);
            if (res.success) {
                setToast({ message: 'Utilisateur supprimé', type: 'success' });
                fetchUsers();
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    const handleToggleStatus = async (user) => {
        const endpoint = user.is_active ? `/users/${user.id}/deactivate` : `/users/${user.id}/activate`;
        const res = await api.post(endpoint, {}, token);
        if (res.success) {
            setToast({ message: user.is_active ? 'Utilisateur désactivé' : 'Utilisateur activé', type: 'success' });
            fetchUsers();
        }
    };

    // Filtrage
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.last_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && user.is_active) ||
            (statusFilter === 'inactive' && !user.is_active);
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesStatus && matchesRole;
    });

    // Pagination
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, roleFilter, itemsPerPage]);

    // Compteurs
    const activeCount = users.filter(u => u.is_active).length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const editorCount = users.filter(u => u.role === 'editor').length;

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
            {/* Toast */}
            {toast && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                     style={{ top: '20px', right: '20px', zIndex: 9999 }}>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Utilisateurs</h2>
                    <p className="text-muted mb-0">{users.length} utilisateurs ({activeCount} actifs)</p>
                </div>
                <Link
                    to="/users/new"
                    className="btn btn-primary"
                    style={{
                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                        border: 'none'
                    }}
                >
                    <i className="fas fa-plus me-2"></i> Nouvel utilisateur
                </Link>
            </div>

            {/* Stats rapides */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card bg-light border-0">
                        <div className="card-body py-3 text-center">
                            <h4 className="mb-0">{users.length}</h4>
                            <small className="text-muted">Total</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success bg-opacity-10 border-0">
                        <div className="card-body py-3 text-center">
                            <h4 className="mb-0 text-success">{activeCount}</h4>
                            <small className="text-muted">Actifs</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-danger bg-opacity-10 border-0">
                        <div className="card-body py-3 text-center">
                            <h4 className="mb-0 text-danger">{adminCount}</h4>
                            <small className="text-muted">Admins</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning bg-opacity-10 border-0">
                        <div className="card-body py-3 text-center">
                            <h4 className="mb-0 text-warning">{editorCount}</h4>
                            <small className="text-muted">Éditeurs</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
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
                                    placeholder="Rechercher par nom, email..."
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
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">Tous les rôles</option>
                                <option value="admin">Administrateurs</option>
                                <option value="editor">Éditeurs</option>
                                <option value="user">Utilisateurs</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tous</option>
                                <option value="active">Actifs</option>
                                <option value="inactive">Inactifs</option>
                            </select>
                        </div>
                        <div className="col-md-2 text-end">
                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                {filteredUsers.length} résultat{filteredUsers.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th style={{ minWidth: '200px' }}>Utilisateur</th>
                                    <th>Email</th>
                                    <th>Rôle</th>
                                    <th>Statut</th>
                                    <th>Dernière connexion</th>
                                    <th className="text-end" style={{ width: '140px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedUsers.length > 0 ? (
                                    paginatedUsers.map((user) => (
                                        <tr key={user.id} className="align-middle">
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                        style={{
                                                            width: '42px',
                                                            height: '42px',
                                                            background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                                            color: 'white',
                                                            fontWeight: '600',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {(user.username || 'U').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="fw-semibold d-block">{user.username}</span>
                                                        {(user.first_name || user.last_name) && (
                                                            <small className="text-muted">
                                                                {user.first_name} {user.last_name}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.9rem' }}>{user.email}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    user.role === 'admin' ? 'bg-danger' :
                                                    user.role === 'editor' ? 'bg-warning text-dark' : 'bg-secondary'
                                                }`}>
                                                    {user.role === 'admin' ? 'Admin' :
                                                     user.role === 'editor' ? 'Éditeur' : 'Utilisateur'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                    {user.is_active ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td>
                                                {user.last_login ? (
                                                    <small className="text-muted">
                                                        {new Date(user.last_login).toLocaleDateString('fr-FR', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </small>
                                                ) : (
                                                    <small className="text-muted">Jamais</small>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => navigate(`/users/${user.id}`)}
                                                        title="Modifier"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className={`btn ${user.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                        onClick={() => handleToggleStatus(user)}
                                                        title={user.is_active ? 'Désactiver' : 'Activer'}
                                                    >
                                                        <i className={`fas fa-${user.is_active ? 'ban' : 'check'}`}></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleDelete(user.id)}
                                                        title="Supprimer"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-5">
                                            {searchQuery || statusFilter !== 'all' || roleFilter !== 'all' ? (
                                                <>
                                                    <i className="fas fa-search fa-3x mb-3 opacity-50"></i>
                                                    <p className="mb-2">Aucun utilisateur trouvé</p>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setStatusFilter('all');
                                                            setRoleFilter('all');
                                                        }}
                                                    >
                                                        Réinitialiser les filtres
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-users fa-3x mb-3 opacity-50"></i>
                                                    <p className="mb-2">Aucun utilisateur</p>
                                                    <Link to="/users/new" className="btn btn-primary">
                                                        Créer un utilisateur
                                                    </Link>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalItems > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        itemName="utilisateurs"
                        itemsPerPageOptions={[10, 25, 50]}
                    />
                )}
            </div>
        </>
    );
};

export default UsersList;
