import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const GroupsList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchGroups = async () => {
        const res = await api.get('/groups', token);
        if (res.success) setGroups(res.data || []);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce groupe ?')) {
            const res = await api.delete(`/groups/${id}`, token);
            if (res.success) {
                setToast({ message: 'Groupe supprimé', type: 'success' });
                fetchGroups();
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    // Filtrage
    const filteredGroups = groups.filter(group => {
        const name = (group.name || '').toLowerCase();
        const description = (group.description || '').toLowerCase();
        const search = searchQuery.toLowerCase();
        return name.includes(search) || description.includes(search);
    });

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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Groupes & Permissions</h2>
                    <p className="text-muted mb-0">{groups.length} groupes</p>
                </div>
                <Link to="/groups/new" className="btn btn-primary" style={{
                    background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                    border: 'none'
                }}>
                    <i className="fas fa-plus me-2"></i> Nouveau groupe
                </Link>
            </div>

            {/* Recherche */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Rechercher un groupe..."
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
                        <div className="col-md-6 text-end">
                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                {filteredGroups.length} groupe{filteredGroups.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {filteredGroups.map(group => (
                    <div key={group.id} className="col-md-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                                width: '45px',
                                                height: '45px',
                                                background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                                color: 'white'
                                            }}
                                        >
                                            <i className="fas fa-users"></i>
                                        </div>
                                        <div>
                                            <h5 className="card-title mb-0">{group.name}</h5>
                                            <small className="text-muted">{group.users_count || 0} utilisateurs</small>
                                        </div>
                                    </div>
                                    <div className="btn-group btn-group-sm">
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={() => navigate(`/groups/${group.id}`)}
                                            title="Modifier"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() => handleDelete(group.id)}
                                            title="Supprimer"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                {group.description && (
                                    <p className="text-muted small mb-3">{group.description}</p>
                                )}
                                <div>
                                    <small className="text-muted d-block mb-2">
                                        <i className="fas fa-key me-1"></i> Permissions:
                                    </small>
                                    <div className="d-flex flex-wrap gap-1">
                                        {group.permissions?.slice(0, 4).map(perm => (
                                            <span key={perm.id} className="badge bg-light text-dark" style={{ fontSize: '0.7rem' }}>
                                                {perm.name}
                                            </span>
                                        ))}
                                        {group.permissions?.length > 4 && (
                                            <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                                                +{group.permissions.length - 4}
                                            </span>
                                        )}
                                        {(!group.permissions || group.permissions.length === 0) && (
                                            <span className="text-muted small fst-italic">Aucune permission</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer bg-transparent border-top-0 pt-0">
                                <button
                                    className="btn btn-sm btn-outline-primary w-100"
                                    onClick={() => navigate(`/groups/${group.id}`)}
                                >
                                    <i className="fas fa-cog me-2"></i> Gérer les permissions
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredGroups.length === 0 && (
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5 text-muted">
                                {searchQuery ? (
                                    <>
                                        <i className="fas fa-search fa-3x mb-3 opacity-50"></i>
                                        <p className="mb-2">Aucun groupe trouvé pour "{searchQuery}"</p>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            Effacer la recherche
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-users-cog fa-3x mb-3 opacity-50"></i>
                                        <p className="mb-2">Aucun groupe créé</p>
                                        <Link to="/groups/new" className="btn btn-primary">
                                            Créer un groupe
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default GroupsList;
