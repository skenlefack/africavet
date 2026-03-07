import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const GroupEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [groupUsers, setGroupUsers] = useState([]);

    const [form, setForm] = useState({
        name: '',
        description: '',
        color: '#7ac142',
        is_system: false
    });

    useEffect(() => {
        fetchPermissions();
        if (isEditing) {
            fetchGroup();
            fetchGroupUsers();
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchGroup = async () => {
        const res = await api.get(`/groups/${id}`, token);
        if (res.success && res.data) {
            const group = res.data;
            setForm({
                name: group.name || '',
                description: group.description || '',
                color: group.color || '#7ac142',
                is_system: group.is_system || false
            });
            if (group.permissions) {
                setSelectedPermissions(group.permissions.map(p => p.id));
            }
        }
        setLoading(false);
    };

    const fetchPermissions = async () => {
        const res = await api.get('/permissions', token);
        if (res.success) setPermissions(res.data || []);
    };

    const fetchGroupUsers = async () => {
        const res = await api.get(`/groups/${id}/users`, token);
        if (res.success) setGroupUsers(res.data || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            setToast({ message: 'Le nom du groupe est requis', type: 'error' });
            return;
        }

        setSaving(true);
        const data = { ...form, permissions: selectedPermissions };

        const res = isEditing
            ? await api.put(`/groups/${id}`, data, token)
            : await api.post('/groups', data, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Groupe modifié' : 'Groupe créé', type: 'success' });
            if (!isEditing && res.data?.id) {
                setTimeout(() => navigate(`/groups/${res.data.id}`), 1000);
            }
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
    };

    const togglePermission = (permId) => {
        setSelectedPermissions(prev =>
            prev.includes(permId)
                ? prev.filter(id => id !== permId)
                : [...prev, permId]
        );
    };

    const selectAllInCategory = (categoryPerms) => {
        const permIds = categoryPerms.map(p => p.id);
        const allSelected = permIds.every(id => selectedPermissions.includes(id));

        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(id => !permIds.includes(id)));
        } else {
            setSelectedPermissions(prev => [...new Set([...prev, ...permIds])]);
        }
    };

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, perm) => {
        const category = perm.category || 'Général';
        if (!acc[category]) acc[category] = [];
        acc[category].push(perm);
        return acc;
    }, {});

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

            <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1" style={{ fontWeight: '700' }}>
                            {isEditing ? 'Modifier le groupe' : 'Nouveau groupe'}
                        </h2>
                        <p className="text-muted mb-0">
                            {form.name || 'Définir les permissions pour ce groupe'}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/groups" className="btn btn-outline-secondary">
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
                                    {isEditing ? 'Enregistrer' : 'Créer le groupe'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="row">
                    {/* Main Content - Permissions */}
                    <div className="col-lg-8">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Permissions</h5>
                                <span className="badge bg-primary">{selectedPermissions.length} sélectionnées</span>
                            </div>
                            <div className="card-body">
                                {Object.keys(groupedPermissions).length > 0 ? (
                                    <div className="row">
                                        {Object.entries(groupedPermissions).map(([category, perms]) => (
                                            <div key={category} className="col-md-6 mb-4">
                                                <div className="border rounded p-3 h-100">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <h6 className="text-uppercase text-muted small mb-0">
                                                            <i className="fas fa-folder me-2"></i>
                                                            {category}
                                                        </h6>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-link p-0"
                                                            onClick={() => selectAllInCategory(perms)}
                                                        >
                                                            {perms.every(p => selectedPermissions.includes(p.id)) ? 'Désélectionner' : 'Tout sélectionner'}
                                                        </button>
                                                    </div>
                                                    {perms.map(perm => (
                                                        <div key={perm.id} className="form-check mb-2">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id={`perm-${perm.id}`}
                                                                checked={selectedPermissions.includes(perm.id)}
                                                                onChange={() => togglePermission(perm.id)}
                                                            />
                                                            <label className="form-check-label" htmlFor={`perm-${perm.id}`}>
                                                                <span className="fw-medium">{perm.name}</span>
                                                                {perm.description && (
                                                                    <small className="text-muted d-block">{perm.description}</small>
                                                                )}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-4">
                                        <i className="fas fa-lock fa-3x mb-3"></i>
                                        <p>Aucune permission disponible</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Group Info */}
                        <div className="card mb-3">
                            <div className="card-header py-2">
                                <h6 className="mb-0">Informations</h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Nom du groupe *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ex: Éditeurs"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={2}
                                        placeholder="Description du groupe..."
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Couleur</label>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="color"
                                            className="form-control form-control-color"
                                            value={form.color}
                                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.color}
                                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Users in Group */}
                        {isEditing && (
                            <div className="card">
                                <div className="card-header py-2 d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Membres</h6>
                                    <span className="badge bg-secondary">{groupUsers.length}</span>
                                </div>
                                <div className="card-body p-0">
                                    {groupUsers.length > 0 ? (
                                        <ul className="list-group list-group-flush">
                                            {groupUsers.slice(0, 5).map(user => (
                                                <li key={user.id} className="list-group-item d-flex align-items-center">
                                                    <div
                                                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                                            color: 'white',
                                                            fontSize: '12px',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="small fw-medium">{user.username}</div>
                                                        <div className="text-muted" style={{ fontSize: '11px' }}>{user.email}</div>
                                                    </div>
                                                </li>
                                            ))}
                                            {groupUsers.length > 5 && (
                                                <li className="list-group-item text-center text-muted small">
                                                    +{groupUsers.length - 5} autres membres
                                                </li>
                                            )}
                                        </ul>
                                    ) : (
                                        <div className="text-center text-muted py-3 small">
                                            Aucun membre dans ce groupe
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </>
    );
};

export default GroupEditor;
