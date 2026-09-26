import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken, API_BASE_URL } from '../../../services/api';

const AuthorsList = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterActive, setFilterActive] = useState('all');
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchAuthors(); }, []);

    const fetchAuthors = async () => {
        setLoading(true);
        const token = getToken();
        const res = await api.get('/authors', token);
        if (res.success) setAuthors(res.data || []);
        setLoading(false);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Désactiver l'auteur "${name}" ?`)) return;
        const token = getToken();
        const res = await api.delete(`/authors/${id}`, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Auteur désactivé' });
            fetchAuthors();
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
        setTimeout(() => setToast(null), 3000);
    };

    const filtered = authors.filter(a => {
        if (filterActive === 'active' && !a.is_active) return false;
        if (filterActive === 'inactive' && a.is_active) return false;
        if (search && !a.name.toLowerCase().includes(search.toLowerCase()) &&
            !(a.email || '').toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="row">
            {toast && (
                <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
                    <div className={`alert alert-${toast.type} alert-dismissible shadow`}>
                        {toast.message}
                        <button type="button" className="btn-close" onClick={() => setToast(null)} />
                    </div>
                </div>
            )}

            <div className="col-12">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h4 className="mb-0"><i className="fas fa-user-pen me-2" style={{ color: '#354e84' }}></i>Auteurs</h4>
                        <Link to="/authors/new" className="btn btn-sm text-white" style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}>
                            <i className="fas fa-plus me-1"></i>Ajouter un auteur
                        </Link>
                    </div>
                    <div className="card-body">
                        <div className="row g-2 mb-3">
                            <div className="col-md-6">
                                <input type="text" className="form-control" placeholder="Rechercher par nom ou email..."
                                    value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <select className="form-select" value={filterActive} onChange={e => setFilterActive(e.target.value)}>
                                    <option value="all">Tous</option>
                                    <option value="active">Actifs</option>
                                    <option value="inactive">Inactifs</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-5 text-muted">Aucun auteur trouvé</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th style={{ width: 50 }}></th>
                                            <th>Nom</th>
                                            <th>Email</th>
                                            <th>Rôle</th>
                                            <th className="text-center">Articles</th>
                                            <th className="text-center">Statut</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(author => (
                                            <tr key={author.id}>
                                                <td>
                                                    {author.avatar ? (
                                                        <img src={`${API_BASE_URL.replace('/api', '')}${author.avatar}`}
                                                            alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7ac142, #354e84)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                                                            {author.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td><strong>{author.name}</strong></td>
                                                <td className="text-muted">{author.email || '—'}</td>
                                                <td>
                                                    <span className="badge bg-light text-dark">{author.role || 'auteur'}</span>
                                                </td>
                                                <td className="text-center">{author.articles_count || 0}</td>
                                                <td className="text-center">
                                                    <span className={`badge ${author.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                        {author.is_active ? 'Actif' : 'Inactif'}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <Link to={`/authors/${author.id}/edit`} className="btn btn-sm btn-outline-primary me-1">
                                                        <i className="fas fa-edit"></i>
                                                    </Link>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(author.id, author.name)}>
                                                        <i className="fas fa-ban"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthorsList;
