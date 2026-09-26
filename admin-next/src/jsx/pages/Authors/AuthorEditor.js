import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken, API_BASE_URL } from '../../../services/api';

const AuthorEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [form, setForm] = useState({
        name: '', email: '', bio_fr: '', bio_en: '', role: 'auteur', is_active: true
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isEdit) fetchAuthor();
    }, [id]);

    const fetchAuthor = async () => {
        setLoading(true);
        const token = getToken();
        const res = await api.get(`/authors/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                name: d.name || '', email: d.email || '',
                bio_fr: d.bio_fr || '', bio_en: d.bio_en || '',
                role: d.role || 'auteur', is_active: d.is_active
            });
            if (d.avatar) setAvatarPreview(`${API_BASE_URL.replace('/api', '')}${d.avatar}`);
        }
        setLoading(false);
    };

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setToast({ type: 'danger', message: 'Le nom est obligatoire' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        setSaving(true);
        const token = getToken();
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => formData.append(k, v));
        if (avatarFile) formData.append('avatar', avatarFile);

        let res;
        if (isEdit) {
            res = await api.upload(`/authors/${id}`, formData, token, 'PUT');
        } else {
            res = await api.upload('/authors', formData, token);
        }

        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Auteur mis à jour' : 'Auteur créé' });
            setTimeout(() => navigate('/authors'), 1500);
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
        setSaving(false);
        setTimeout(() => setToast(null), 3000);
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

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
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">
                        <i className="fas fa-user-pen me-2" style={{ color: '#354e84' }}></i>
                        {isEdit ? 'Modifier l\'auteur' : 'Nouvel auteur'}
                    </h4>
                    <Link to="/authors" className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-arrow-left me-1"></i>Retour
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-8">
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-0">
                                    <h5 className="mb-0"><i className="fas fa-id-card me-2 text-primary"></i>Informations</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Nom complet <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" value={form.name}
                                                onChange={e => handleChange('name', e.target.value)} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email</label>
                                            <input type="email" className="form-control" value={form.email}
                                                onChange={e => handleChange('email', e.target.value)} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Rôle</label>
                                            <select className="form-select" value={form.role} onChange={e => handleChange('role', e.target.value)}>
                                                <option value="auteur">Auteur</option>
                                                <option value="editeur">Éditeur</option>
                                                <option value="correspondant">Correspondant</option>
                                                <option value="relecteur">Relecteur</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Statut</label>
                                            <select className="form-select" value={form.is_active ? '1' : '0'}
                                                onChange={e => handleChange('is_active', e.target.value === '1')}>
                                                <option value="1">Actif</option>
                                                <option value="0">Inactif</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-0">
                                    <h5 className="mb-0"><i className="fas fa-pen me-2 text-primary"></i>Biographie</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Bio (FR)</label>
                                        <textarea className="form-control" rows={4} value={form.bio_fr}
                                            onChange={e => handleChange('bio_fr', e.target.value)}
                                            placeholder="Biographie en français..." />
                                    </div>
                                    <div>
                                        <label className="form-label">Bio (EN)</label>
                                        <textarea className="form-control" rows={4} value={form.bio_en}
                                            onChange={e => handleChange('bio_en', e.target.value)}
                                            placeholder="Biography in English..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-0">
                                    <h5 className="mb-0"><i className="fas fa-camera me-2 text-primary"></i>Avatar</h5>
                                </div>
                                <div className="card-body text-center">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} />
                                    ) : (
                                        <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, #7ac142, #354e84)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 40, fontWeight: 700 }}>
                                            {form.name ? form.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                    )}
                                    <input type="file" className="form-control form-control-sm" accept="image/*"
                                        onChange={handleAvatarChange} />
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <button type="submit" className="btn w-100 text-white mb-2" disabled={saving}
                                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}>
                                        {saving ? (
                                            <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</>
                                        ) : (
                                            <><i className="fas fa-save me-1"></i>{isEdit ? 'Mettre à jour' : 'Créer l\'auteur'}</>
                                        )}
                                    </button>
                                    <Link to="/authors" className="btn btn-outline-secondary w-100">Annuler</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthorEditor;
