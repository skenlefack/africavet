import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const UserEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [groups, setGroups] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [showGroupsModal, setShowGroupsModal] = useState(false);

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'subscriber',
        status: 'active',
        bio: '',
        avatar: ''
    });

    useEffect(() => {
        fetchGroups();
        if (isEditing) {
            fetchUser();
            fetchUserGroups();
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchUser = async () => {
        const res = await api.get(`/users/${id}`, token);
        if (res.success && res.data) {
            const user = res.data;
            setForm({
                username: user.username || '',
                email: user.email || '',
                password: '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                role: user.role || 'subscriber',
                status: user.status || 'active',
                bio: user.bio || '',
                avatar: user.avatar || ''
            });
        }
        setLoading(false);
    };

    const fetchGroups = async () => {
        const res = await api.get('/groups', token);
        if (res.success) setGroups(res.data || []);
    };

    const fetchUserGroups = async () => {
        const res = await api.get(`/groups/user/${id}`, token);
        if (res.success) setUserGroups(res.data?.map(g => g.id) || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.username.trim() || !form.email.trim()) {
            setToast({ message: 'Nom d\'utilisateur et email requis', type: 'error' });
            return;
        }

        if (!isEditing && !form.password) {
            setToast({ message: 'Mot de passe requis pour un nouvel utilisateur', type: 'error' });
            return;
        }

        setSaving(true);
        const dataToSend = { ...form };
        if (isEditing && !form.password) {
            delete dataToSend.password;
        }

        const res = isEditing
            ? await api.put(`/users/${id}`, dataToSend, token)
            : await api.post('/users', dataToSend, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Utilisateur modifié' : 'Utilisateur créé', type: 'success' });
            if (!isEditing && res.data?.id) {
                setTimeout(() => navigate(`/users/${res.data.id}`), 1000);
            }
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
    };

    const handleToggleGroup = (groupId) => {
        setUserGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleSaveGroups = async () => {
        const res = await api.put(`/groups/user/${id}/groups`, { groups: userGroups }, token);
        if (res.success) {
            setToast({ message: 'Groupes mis à jour', type: 'success' });
            setShowGroupsModal(false);
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
    };

    const handleVerifyEmail = async () => {
        const res = await api.put(`/users/${id}/verify-email`, {}, token);
        if (res.success) {
            setToast({ message: 'Email vérifié avec succès', type: 'success' });
            fetchUser();
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
    };

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

            {/* Groups Modal */}
            {showGroupsModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-shield-alt me-2"></i>
                                    Groupes de {form.username}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowGroupsModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted small mb-3">
                                    Sélectionnez les groupes auxquels cet utilisateur appartient
                                </p>
                                <div className="list-group">
                                    {groups.map(group => (
                                        <label
                                            key={group.id}
                                            className={`list-group-item list-group-item-action d-flex align-items-center ${
                                                userGroups.includes(group.id) ? 'active' : ''
                                            }`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <input
                                                type="checkbox"
                                                className="form-check-input me-3"
                                                checked={userGroups.includes(group.id)}
                                                onChange={() => handleToggleGroup(group.id)}
                                            />
                                            <div className="flex-grow-1">
                                                <strong>{group.name}</strong>
                                                <small className="d-block text-muted">
                                                    {group.permission_count || 0} permissions
                                                </small>
                                            </div>
                                            {group.is_system && (
                                                <span className="badge bg-warning">Système</span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowGroupsModal(false)}>
                                    Annuler
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveGroups}>
                                    <i className="fas fa-save me-2"></i> Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1" style={{ fontWeight: '700' }}>
                            {isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                        </h2>
                        <p className="text-muted mb-0">
                            {form.username ? `@${form.username}` : 'Créer un nouveau compte utilisateur'}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/users" className="btn btn-outline-secondary">
                            <i className="fas fa-arrow-left me-2"></i> Retour
                        </Link>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                            style={{
                                background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                border: 'none'
                            }}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save me-2"></i>
                                    {isEditing ? 'Enregistrer' : 'Créer l\'utilisateur'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="row">
                    {/* Main Form */}
                    <div className="col-lg-8">
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">Informations de base</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Nom d'utilisateur *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={form.username}
                                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                                placeholder="johndoe"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Email *</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="john@example.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Prénom</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={form.first_name}
                                                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                                placeholder="John"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Nom</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={form.last_name}
                                                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Mot de passe {isEditing ? '(laisser vide pour ne pas modifier)' : '*'}
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="••••••••"
                                        required={!isEditing}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Biographie</label>
                                    <textarea
                                        className="form-control"
                                        value={form.bio}
                                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                        rows={3}
                                        placeholder="Une courte biographie..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Role & Status */}
                        <div className="card mb-3">
                            <div className="card-header py-2">
                                <h6 className="mb-0">Rôle et statut</h6>
                            </div>
                            <div className="card-body py-2">
                                <div className="row">
                                    <div className="col-6">
                                        <label className="form-label small mb-1">Rôle</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={form.role}
                                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        >
                                            <option value="admin">Administrateur</option>
                                            <option value="editor">Éditeur</option>
                                            <option value="author">Auteur</option>
                                            <option value="contributor">Contributeur</option>
                                            <option value="subscriber">Abonné</option>
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small mb-1">Statut</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={form.status}
                                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        >
                                            <option value="active">Actif</option>
                                            <option value="inactive">Inactif</option>
                                            <option value="banned">Banni</option>
                                        </select>
                                    </div>
                                </div>
                                {isEditing && (
                                    <div className="d-flex gap-2 mt-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm flex-fill"
                                            onClick={() => setShowGroupsModal(true)}
                                        >
                                            <i className="fas fa-shield-alt me-1"></i> Groupes
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-success btn-sm flex-fill"
                                            onClick={handleVerifyEmail}
                                        >
                                            <i className="fas fa-check me-1"></i> Vérifier email
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Avatar */}
                        <div className="card">
                            <div className="card-header py-2">
                                <h6 className="mb-0">Avatar</h6>
                            </div>
                            <div className="card-body py-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            background: form.avatar
                                                ? `url(${form.avatar}) center/cover`
                                                : 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                            color: 'white',
                                            fontSize: '24px',
                                            fontWeight: '700'
                                        }}
                                    >
                                        {!form.avatar && (form.first_name?.[0] || form.username?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={form.avatar}
                                        onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                                        placeholder="URL de l'avatar"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default UserEditor;
