import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const SEVERITY_OPTIONS = [
    { value: 'critical', label: 'Critique', desc: 'Bannière rouge globale', color: '#d32f2f', bg: '#ffebee', icon: 'fa-exclamation-circle' },
    { value: 'high', label: 'Élevée', desc: 'Avis régional', color: '#e65100', bg: '#fff3e0', icon: 'fa-exclamation-triangle' },
    { value: 'informational', label: 'Informationnelle', desc: 'Mise à jour standard', color: '#1565c0', bg: '#e3f2fd', icon: 'fa-info-circle' },
];

const AlertEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const [form, setForm] = useState({
        title_fr: '',
        title_en: '',
        severity_level: 'informational',
        country: '',
        affected_regions: '',
        description_fr: '',
        description_en: '',
        responsible_authority: '',
        contact_info: '',
        broadcast_status: 'inactive',
        auto_expire_at: '',
        verification_status: 'unverified',
        priority: 'medium',
        alert_type: 'emergency',
    });

    useEffect(() => {
        if (isEditing) fetchAlert();
    }, [id]); // eslint-disable-line

    useEffect(() => {
        if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }
    }, [toast]);

    const fetchAlert = async () => {
        setLoading(true);
        const res = await api.get(`/vet-alerts/${id}`, token);
        if (res.success && res.data) {
            const a = res.data;
            setForm({
                title_fr: a.title_fr || '',
                title_en: a.title_en || '',
                severity_level: a.severity_level || 'informational',
                country: a.country || '',
                affected_regions: a.affected_regions || '',
                description_fr: a.description_fr || '',
                description_en: a.description_en || '',
                responsible_authority: a.responsible_authority || '',
                contact_info: a.contact_info || '',
                broadcast_status: a.broadcast_status || 'inactive',
                auto_expire_at: a.auto_expire_at ? a.auto_expire_at.slice(0, 16) : '',
                verification_status: a.verification_status || 'unverified',
                priority: a.priority || 'medium',
                alert_type: a.alert_type || 'emergency',
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
        if (!form.title_fr.trim()) {
            setToast({ type: 'error', message: 'Le titre de l\'alerte est requis' });
            return;
        }

        setSaving(true);
        const priorityMap = { critical: 'critical', high: 'high', informational: 'medium' };
        const payload = {
            ...form,
            priority: priorityMap[form.severity_level] || 'medium',
            status: form.broadcast_status === 'active' ? 'approved' : 'pending',
            auto_expire_at: form.auto_expire_at || null,
        };

        let res;
        if (isEditing) {
            res = await api.put(`/vet-alerts/${id}`, payload, token);
        } else {
            res = await api.post('/vet-alerts/admin', payload, token);
        }

        if (res.success) {
            setToast({ type: 'success', message: isEditing ? 'Alerte mise à jour' : 'Alerte créée' });
            setTimeout(() => navigate('/alerts/list'), 1000);
        } else {
            setToast({ type: 'error', message: res.message || 'Erreur' });
        }
        setSaving(false);
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

    return (
        <>
            {toast && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}
                     style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)} />
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3 pt-4">
                <div>
                    <h3 className="mb-0" style={{ fontWeight: 700 }}>
                        <i className="fas fa-broadcast-tower me-2" style={{ color: '#d32f2f' }} />
                        {isEditing ? 'Modifier l\'alerte' : 'Nouvelle alerte'}
                    </h3>
                </div>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/alerts/list')}>
                    <i className="fas fa-arrow-left me-1" />Retour
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row">
                    {/* Main Column */}
                    <div className="col-lg-8">
                        {/* Titre + Sévérité */}
                        <div className="card mb-3">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-heading me-2 text-danger" />Titre & Sévérité</h6>
                            </div>
                            <div className="card-body py-3">
                                <div className="row mb-2">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold mb-1">Titre (FR) <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control form-control-sm" name="title_fr" value={form.title_fr} onChange={handleChange}
                                               placeholder="Ex: Fièvre aphteuse en Afrique du Sud" required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold mb-1">Title (EN)</label>
                                        <input type="text" className="form-control form-control-sm" name="title_en" value={form.title_en} onChange={handleChange}
                                               placeholder="Ex: FMD in South Africa" />
                                    </div>
                                </div>
                                <label className="form-label small fw-bold mb-1">Niveau de sévérité</label>
                                <div className="d-flex gap-2">
                                    {SEVERITY_OPTIONS.map(opt => (
                                        <label key={opt.value} className="d-flex align-items-center gap-2 px-3 py-2 rounded border flex-fill"
                                               style={{ cursor: 'pointer', background: form.severity_level === opt.value ? opt.bg : '#fff',
                                                        borderColor: form.severity_level === opt.value ? opt.color : '#dee2e6', fontSize: '0.85rem' }}>
                                            <input type="radio" name="severity_level" value={opt.value}
                                                   checked={form.severity_level === opt.value} onChange={handleChange}
                                                   className="form-check-input m-0" />
                                            <span className="fw-bold" style={{ color: opt.color }}>
                                                <i className={`fas ${opt.icon} me-1`} />{opt.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Localisation + Autorité + Contact */}
                        <div className="card mb-3">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-globe-africa me-2 text-primary" />Localisation & Contact</h6>
                            </div>
                            <div className="card-body py-3">
                                <div className="row mb-2">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold mb-1">Portée géographique</label>
                                        <input type="text" className="form-control form-control-sm" name="country" value={form.country} onChange={handleChange}
                                               placeholder="Ex: Afrique subsaharienne" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold mb-1">Régions impactées</label>
                                        <input type="text" className="form-control form-control-sm" name="affected_regions" value={form.affected_regions} onChange={handleChange}
                                               placeholder="Ex: South Africa, Namibia" />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold mb-1">Autorité responsable</label>
                                        <input type="text" className="form-control form-control-sm" name="responsible_authority" value={form.responsible_authority} onChange={handleChange}
                                               placeholder="Ex: Ministry of Health, WHO" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold mb-1">Contact / Hotline</label>
                                        <input type="text" className="form-control form-control-sm" name="contact_info" value={form.contact_info} onChange={handleChange}
                                               placeholder="Hotline, email ou site officiel" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="card mb-3">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-align-left me-2 text-info" />Résumé & Mesures</h6>
                            </div>
                            <div className="card-body py-3">
                                <label className="form-label small fw-bold mb-1">Détails et instructions (FR)</label>
                                <textarea className="form-control form-control-sm mb-2" name="description_fr" value={form.description_fr} onChange={handleChange}
                                          rows="4" placeholder="Décrivez la situation et les mesures à prendre..." />
                                <label className="form-label small fw-bold mb-1">Summary & action steps (EN)</label>
                                <textarea className="form-control form-control-sm" name="description_en" value={form.description_en} onChange={handleChange}
                                          rows="3" placeholder="Describe the situation and recommended actions..." />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Diffusion */}
                        <div className="card mb-3">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-satellite-dish me-2 text-danger" />Diffusion</h6>
                            </div>
                            <div className="card-body py-3">
                                <div className="d-flex gap-2 mb-2">
                                    <label className={`btn btn-sm flex-fill text-center ${form.broadcast_status === 'active' ? 'btn-success' : 'btn-outline-secondary'}`}>
                                        <input type="radio" name="broadcast_status" value="active" className="d-none"
                                               checked={form.broadcast_status === 'active'} onChange={handleChange} />
                                        <i className="fas fa-broadcast-tower me-1" />ACTIVE
                                    </label>
                                    <label className={`btn btn-sm flex-fill text-center ${form.broadcast_status === 'inactive' ? 'btn-danger' : 'btn-outline-secondary'}`}>
                                        <input type="radio" name="broadcast_status" value="inactive" className="d-none"
                                               checked={form.broadcast_status === 'inactive'} onChange={handleChange} />
                                        <i className="fas fa-power-off me-1" />INACTIVE
                                    </label>
                                </div>
                                <label className="form-label small fw-bold mb-1">Expiration auto</label>
                                <input type="datetime-local" className="form-control form-control-sm" name="auto_expire_at"
                                       value={form.auto_expire_at} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Vérification */}
                        <div className="card mb-3">
                            <div className="card-header py-2">
                                <h6 className="mb-0"><i className="fas fa-check-double me-2 text-primary" />Vérification</h6>
                            </div>
                            <div className="card-body py-2">
                                <div className="d-flex flex-column gap-1">
                                    <label className={`d-flex align-items-center gap-2 px-3 py-2 rounded border`}
                                           style={{ cursor: 'pointer', background: form.verification_status === 'verified' ? '#e8f5e9' : '#fff',
                                                    borderColor: form.verification_status === 'verified' ? '#4caf50' : '#dee2e6' }}>
                                        <input type="radio" name="verification_status" value="verified"
                                               checked={form.verification_status === 'verified'} onChange={handleChange}
                                               className="form-check-input m-0" />
                                        <span className="fw-bold text-success small"><i className="fas fa-check-circle me-1" />Vérifiée</span>
                                    </label>
                                    <label className={`d-flex align-items-center gap-2 px-3 py-2 rounded border`}
                                           style={{ cursor: 'pointer', background: form.verification_status === 'unverified' ? '#fff3e0' : '#fff',
                                                    borderColor: form.verification_status === 'unverified' ? '#ff9800' : '#dee2e6' }}>
                                        <input type="radio" name="verification_status" value="unverified"
                                               checked={form.verification_status === 'unverified'} onChange={handleChange}
                                               className="form-check-input m-0" />
                                        <span className="fw-bold text-warning small"><i className="fas fa-question-circle me-1" />Non vérifiée</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Type */}
                        <div className="card mb-3">
                            <div className="card-body py-3">
                                <label className="form-label small fw-bold mb-1">Type d'alerte</label>
                                <select className="form-select form-select-sm" name="alert_type" value={form.alert_type} onChange={handleChange}>
                                    <option value="disease_outbreak">Foyer de maladie</option>
                                    <option value="emergency">Urgence</option>
                                    <option value="vaccination_campaign">Campagne de vaccination</option>
                                    <option value="food_safety">Sécurité alimentaire</option>
                                    <option value="wildlife">Faune sauvage</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="d-grid gap-2">
                            <button type="submit" className="btn text-white" disabled={saving}
                                    style={{ background: 'linear-gradient(135deg, #d32f2f, #e65100)', border: 'none' }}>
                                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Enregistrement...</>
                                    : <><i className="fas fa-save me-2" />{isEditing ? 'Mettre à jour' : 'Enregistrer l\'alerte'}</>}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/alerts/list')}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default AlertEditor;
