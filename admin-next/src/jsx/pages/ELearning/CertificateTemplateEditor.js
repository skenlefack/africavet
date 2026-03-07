import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const CertificateTemplateEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const [form, setForm] = useState({
        name: '',
        description: '',
        background_image: '',
        primary_color: '#354e84',
        secondary_color: '#7ac142',
        logo_url: '',
        signatory_name: '',
        signatory_title: '',
        signatory_signature: '',
        is_default: false
    });

    useEffect(() => {
        if (isEditing) fetchTemplate();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchTemplate = async () => {
        const res = await api.get(`/elearning/certificate-templates/${id}`, token);
        if (res.success && res.data) {
            const t = res.data;
            setForm({
                name: t.name || '',
                description: t.description || '',
                background_image: t.background_image || '',
                primary_color: t.primary_color || '#354e84',
                secondary_color: t.secondary_color || '#7ac142',
                logo_url: t.logo_url || '',
                signatory_name: t.signatory_name || '',
                signatory_title: t.signatory_title || '',
                signatory_signature: t.signatory_signature || '',
                is_default: t.is_default || false
            });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.upload('/upload/elearning/certificate', formData, token);
        if (res.success && res.data) {
            setForm(prev => ({ ...prev, [field]: res.data.url || res.data }));
            setToast({ message: 'Image uploadée', type: 'success' });
        } else {
            setToast({ message: res.message || 'Erreur upload', type: 'error' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setToast({ message: 'Le nom est requis', type: 'error' });
            return;
        }

        setSaving(true);
        const res = isEditing
            ? await api.put(`/elearning/certificate-templates/${id}`, form, token)
            : await api.post('/elearning/certificate-templates', form, token);

        if (res.success) {
            setToast({ message: isEditing ? 'Template modifié' : 'Template créé', type: 'success' });
            setTimeout(() => navigate('/elearning/certificates'), 1000);
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
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

            <form onSubmit={handleSubmit}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1" style={{ fontWeight: '700' }}>
                            {isEditing ? 'Modifier le template' : 'Nouveau template de certificat'}
                        </h2>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/elearning/certificates" className="btn btn-outline-secondary">
                            <i className="fas fa-arrow-left me-2"></i> Retour
                        </Link>
                        <button type="submit" className="btn btn-primary" disabled={saving}
                            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                            {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</> :
                                <><i className="fas fa-save me-2"></i>{isEditing ? 'Enregistrer' : 'Créer'}</>}
                        </button>
                    </div>
                </div>

                <div className="row">
                    {/* Main */}
                    <div className="col-lg-8">
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="fas fa-info-circle me-2" style={{ color: '#F39C12' }}></i>Informations</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <label className="form-label">Nom du template *</label>
                                        <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">&nbsp;</label>
                                        <div className="form-check mt-2">
                                            <input type="checkbox" className="form-check-input" id="is_default"
                                                name="is_default" checked={form.is_default} onChange={handleChange} />
                                            <label className="form-check-label" htmlFor="is_default">Template par défaut</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Description</label>
                                        <textarea className="form-control" name="description" value={form.description}
                                            onChange={handleChange} rows={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Background & Logo */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="fas fa-image me-2" style={{ color: '#3498DB' }}></i>Images</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Image de fond</label>
                                        {form.background_image && (
                                            <div className="mb-2 position-relative">
                                                <img src={form.background_image} alt="Background" className="img-fluid rounded" style={{ maxHeight: '150px', width: '100%', objectFit: 'cover' }} />
                                                <button type="button" className="btn btn-sm btn-danger position-absolute" style={{ top: '5px', right: '5px' }}
                                                    onClick={() => setForm(prev => ({ ...prev, background_image: '' }))}>
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        )}
                                        <input type="file" className="form-control form-control-sm" accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'background_image')} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Logo</label>
                                        {form.logo_url && (
                                            <div className="mb-2 position-relative">
                                                <img src={form.logo_url} alt="Logo" className="img-fluid rounded" style={{ maxHeight: '80px' }} />
                                                <button type="button" className="btn btn-sm btn-danger position-absolute" style={{ top: '5px', right: '5px' }}
                                                    onClick={() => setForm(prev => ({ ...prev, logo_url: '' }))}>
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        )}
                                        <input type="file" className="form-control form-control-sm" accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'logo_url')} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Signatory */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="fas fa-pen-nib me-2" style={{ color: '#9B59B6' }}></i>Signataire</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Nom du signataire</label>
                                        <input type="text" className="form-control" name="signatory_name" value={form.signatory_name} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Titre du signataire</label>
                                        <input type="text" className="form-control" name="signatory_title" value={form.signatory_title} onChange={handleChange} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Signature (image)</label>
                                        {form.signatory_signature && (
                                            <div className="mb-2">
                                                <img src={form.signatory_signature} alt="Signature" style={{ maxHeight: '60px' }} className="rounded" />
                                                <button type="button" className="btn btn-sm btn-outline-danger ms-2"
                                                    onClick={() => setForm(prev => ({ ...prev, signatory_signature: '' }))}>
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        )}
                                        <input type="file" className="form-control form-control-sm" accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'signatory_signature')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Colors */}
                        <div className="card mb-4">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-palette me-2"></i>Couleurs</h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label small">Couleur principale</label>
                                    <div className="d-flex gap-2 align-items-center">
                                        <input type="color" className="form-control form-control-color" name="primary_color"
                                            value={form.primary_color} onChange={handleChange} />
                                        <input type="text" className="form-control form-control-sm" value={form.primary_color}
                                            onChange={(e) => setForm(prev => ({ ...prev, primary_color: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small">Couleur secondaire</label>
                                    <div className="d-flex gap-2 align-items-center">
                                        <input type="color" className="form-control form-control-color" name="secondary_color"
                                            value={form.secondary_color} onChange={handleChange} />
                                        <input type="text" className="form-control form-control-sm" value={form.secondary_color}
                                            onChange={(e) => setForm(prev => ({ ...prev, secondary_color: e.target.value }))} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="card">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-eye me-2"></i>Aperçu</h6>
                            </div>
                            <div className="card-body p-2">
                                <div className="rounded p-3 text-center" style={{
                                    background: form.background_image ? `url(${form.background_image}) center/cover` : `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})`,
                                    minHeight: '200px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    color: '#fff'
                                }}>
                                    {form.logo_url && <img src={form.logo_url} alt="Logo" style={{ maxHeight: '30px', margin: '0 auto 10px' }} />}
                                    <h6 style={{ fontWeight: '700', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>CERTIFICAT</h6>
                                    <small style={{ opacity: 0.9 }}>de réussite</small>
                                    <div className="mt-2" style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                        {form.signatory_name && <div>{form.signatory_name}</div>}
                                        {form.signatory_title && <div><em>{form.signatory_title}</em></div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default CertificateTemplateEditor;
