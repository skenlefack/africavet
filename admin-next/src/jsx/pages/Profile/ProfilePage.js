import React, { useState, useEffect } from 'react';
import { api, getToken } from '../../../services/api';

const ProfilePage = () => {
    const token = getToken();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('info');

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        bio: '',
        avatar: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchProfile = async () => {
        const res = await api.get('/auth/profile', token);
        if (res.success && res.data) {
            const u = res.data;
            setForm({
                first_name: u.first_name || '',
                last_name: u.last_name || '',
                email: u.email || '',
                phone: u.phone || '',
                bio: u.bio || '',
                avatar: u.avatar || ''
            });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = await api.put('/auth/profile', form, token);
        if (res.success) {
            setToast({ message: 'Profil mis à jour', type: 'success' });
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setToast({ message: 'Les mots de passe ne correspondent pas', type: 'error' });
            return;
        }
        if (passwordForm.new_password.length < 6) {
            setToast({ message: 'Le mot de passe doit contenir au moins 6 caractères', type: 'error' });
            return;
        }

        setChangingPassword(true);
        const res = await api.put('/auth/password', {
            current_password: passwordForm.current_password,
            new_password: passwordForm.new_password
        }, token);

        if (res.success) {
            setToast({ message: 'Mot de passe modifié', type: 'success' });
            setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setChangingPassword(false);
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
            {toast && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                     style={{ top: '20px', right: '20px', zIndex: 9999 }}>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Mon Profil</h2>
                    <p className="text-muted mb-0">{form.first_name} {form.last_name}</p>
                </div>
            </div>

            <div className="row">
                {/* Sidebar */}
                <div className="col-lg-4">
                    <div className="card mb-4">
                        <div className="card-body text-center">
                            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                style={{
                                    width: '100px', height: '100px',
                                    background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                    fontSize: '36px', color: '#fff', fontWeight: '700'
                                }}>
                                {form.avatar ? (
                                    <img src={form.avatar} alt="Avatar" className="rounded-circle" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                ) : (
                                    (form.first_name?.[0] || '') + (form.last_name?.[0] || '')
                                )}
                            </div>
                            <h5 className="mb-1">{form.first_name} {form.last_name}</h5>
                            <p className="text-muted mb-0">{form.email}</p>
                        </div>
                    </div>

                    <div className="card">
                        <div className="list-group list-group-flush">
                            <button className={`list-group-item list-group-item-action ${activeTab === 'info' ? 'active' : ''}`}
                                onClick={() => setActiveTab('info')}>
                                <i className="fas fa-user me-2"></i> Informations
                            </button>
                            <button className={`list-group-item list-group-item-action ${activeTab === 'password' ? 'active' : ''}`}
                                onClick={() => setActiveTab('password')}>
                                <i className="fas fa-lock me-2"></i> Mot de passe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="col-lg-8">
                    {activeTab === 'info' && (
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Informations personnelles</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Prénom</label>
                                            <input type="text" className="form-control" name="first_name"
                                                value={form.first_name} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Nom</label>
                                            <input type="text" className="form-control" name="last_name"
                                                value={form.last_name} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" name="email"
                                            value={form.email} onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Téléphone</label>
                                        <input type="text" className="form-control" name="phone"
                                            value={form.phone} onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Bio</label>
                                        <textarea className="form-control" name="bio" rows={3}
                                            value={form.bio} onChange={handleChange}
                                            placeholder="Quelques mots sur vous..." />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">URL Avatar</label>
                                        <input type="text" className="form-control" name="avatar"
                                            value={form.avatar} onChange={handleChange}
                                            placeholder="https://..." />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={saving}
                                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                                        {saving ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                                        ) : (
                                            <><i className="fas fa-save me-2"></i>Enregistrer</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'password' && (
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Modifier le mot de passe</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handlePasswordChange}>
                                    <div className="mb-3">
                                        <label className="form-label">Mot de passe actuel</label>
                                        <input type="password" className="form-control"
                                            value={passwordForm.current_password}
                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                                            required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Nouveau mot de passe</label>
                                        <input type="password" className="form-control"
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                                            required minLength={6} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirmer le nouveau mot de passe</label>
                                        <input type="password" className="form-control"
                                            value={passwordForm.confirm_password}
                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                                            required minLength={6} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={changingPassword}
                                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                                        {changingPassword ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Modification...</>
                                        ) : (
                                            <><i className="fas fa-key me-2"></i>Changer le mot de passe</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProfilePage;
