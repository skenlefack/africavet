import React, { useState, useEffect } from 'react';
import { api, getToken, API_BASE_URL } from '../../../services/api';

const AFRICAN_COUNTRIES = [
    'Algérie','Angola','Bénin','Botswana','Burkina Faso','Burundi','Cameroun','Cap-Vert',
    'Centrafrique','Comores','Congo','Côte d\'Ivoire','Djibouti','Égypte','Érythrée','Eswatini',
    'Éthiopie','Gabon','Gambie','Ghana','Guinée','Guinée-Bissau','Guinée équatoriale','Kenya',
    'Lesotho','Libéria','Libye','Madagascar','Malawi','Mali','Maroc','Maurice','Mauritanie',
    'Mozambique','Namibie','Niger','Nigéria','Ouganda','RD Congo','Rwanda','Sao Tomé-et-Príncipe',
    'Sénégal','Seychelles','Sierra Leone','Somalie','Soudan','Soudan du Sud','Tanzanie','Tchad',
    'Togo','Tunisie','Zambie','Zimbabwe'
];

const EDUCATION_LEVELS = [
    { value: 'high_school', label: 'Baccalauréat' },
    { value: 'bachelor', label: 'Licence' },
    { value: 'master', label: 'Master' },
    { value: 'doctorate', label: 'Doctorat' },
    { value: 'post_doctorate', label: 'Post-doctorat' },
    { value: 'professional_certificate', label: 'Certificat professionnel' },
    { value: 'other', label: 'Autre' },
];

const ProfilePage = () => {
    const token = getToken();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('info');

    // Info tab
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', phone: '', bio: '', avatar: '',
        country: '', city: '', preferred_language: 'fr'
    });

    // Professional tab
    const [proForm, setProForm] = useState({
        profession: '', specialization: '', skills: [],
        years_experience: '', education_level: ''
    });
    const [skillInput, setSkillInput] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [currentCv, setCurrentCv] = useState(null);
    const [uploadingCv, setUploadingCv] = useState(false);
    const [savingPro, setSavingPro] = useState(false);

    // Notifications tab
    const [notifPrefs, setNotifPrefs] = useState(null);
    const [notifLoading, setNotifLoading] = useState(false);
    const [savingNotifs, setSavingNotifs] = useState(false);

    // Password tab
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '', newPassword: '', confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchProfile = async () => {
        const res = await api.get('/auth/profile', token);
        if (res.success && res.data) {
            const u = res.data;
            setForm({
                first_name: u.first_name || '', last_name: u.last_name || '',
                email: u.email || '', phone: u.phone || '',
                bio: u.bio || '', avatar: u.avatar || '',
                country: u.country || '', city: u.city || '',
                preferred_language: u.preferred_language || 'fr'
            });
            setProForm({
                profession: u.profession || '', specialization: u.specialization || '',
                skills: u.skills ? (typeof u.skills === 'string' ? JSON.parse(u.skills) : u.skills) : [],
                years_experience: u.years_experience || '',
                education_level: u.education_level || ''
            });
            if (u.cv_filename) {
                setCurrentCv({ filename: u.cv_filename });
            }
        }
        setLoading(false);
    };

    // =============== INFO TAB ===============
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitInfo = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = await api.put('/auth/profile', form, token);
        if (res.success) {
            showToast('Profil mis à jour');
        } else {
            showToast(res.message || 'Erreur', 'error');
        }
        setSaving(false);
    };

    // =============== PROFESSIONAL TAB ===============
    const handleProChange = (e) => {
        const { name, value } = e.target;
        setProForm(prev => ({ ...prev, [name]: value }));
    };

    const addSkill = () => {
        const skill = skillInput.trim();
        if (skill && !proForm.skills.includes(skill)) {
            setProForm(prev => ({ ...prev, skills: [...prev.skills, skill] }));
        }
        setSkillInput('');
    };

    const removeSkill = (skill) => {
        setProForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    const handleSubmitPro = async (e) => {
        e.preventDefault();
        setSavingPro(true);
        const data = {
            profession: proForm.profession,
            specialization: proForm.specialization,
            skills: JSON.stringify(proForm.skills),
            years_experience: proForm.years_experience || null,
            education_level: proForm.education_level || null
        };
        const res = await api.put('/auth/profile', data, token);
        if (res.success) {
            showToast('Informations professionnelles mises à jour');
        } else {
            showToast(res.message || 'Erreur', 'error');
        }
        setSavingPro(false);
    };

    const handleUploadCv = async () => {
        if (!cvFile) return;
        setUploadingCv(true);
        const fd = new FormData();
        fd.append('cv', cvFile);
        const res = await api.upload('/auth/profile/cv', fd, token);
        if (res.success) {
            showToast('CV uploadé avec succès');
            setCurrentCv({ filename: cvFile.name });
            setCvFile(null);
        } else {
            showToast(res.message || 'Erreur upload CV', 'error');
        }
        setUploadingCv(false);
    };

    const handleDeleteCv = async () => {
        if (!window.confirm('Supprimer votre CV ?')) return;
        const res = await api.delete('/auth/profile/cv', token);
        if (res.success) {
            showToast('CV supprimé');
            setCurrentCv(null);
        } else {
            showToast(res.message || 'Erreur', 'error');
        }
    };

    // =============== NOTIFICATIONS TAB ===============
    const fetchNotifPrefs = async () => {
        if (notifPrefs) return;
        setNotifLoading(true);
        const res = await api.get('/auth/notification-preferences', token);
        if (res.success && res.data) {
            setNotifPrefs(res.data);
        } else {
            setNotifPrefs({
                email_opportunities: true, email_vet_alerts: true,
                email_elearning: true, email_newsletter: true,
                inapp_opportunities: true, inapp_vet_alerts: true,
                inapp_elearning: true, inapp_newsletter: true,
                email_frequency: 'daily'
            });
        }
        setNotifLoading(false);
    };

    const toggleNotif = (key) => {
        setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveNotifs = async () => {
        setSavingNotifs(true);
        const res = await api.put('/auth/notification-preferences', notifPrefs, token);
        if (res.success) {
            showToast('Préférences de notification mises à jour');
        } else {
            showToast(res.message || 'Erreur', 'error');
        }
        setSavingNotifs(false);
    };

    // =============== PASSWORD TAB ===============
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
            return;
        }

        setChangingPassword(true);
        const res = await api.put('/auth/password', {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        }, token);

        if (res.success) {
            showToast('Mot de passe modifié');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            showToast(res.message || 'Erreur', 'error');
        }
        setChangingPassword(false);
    };

    // Handle tab switch
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'notifications') fetchNotifPrefs();
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

    const btnStyle = { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' };

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
                            {[
                                { key: 'info', icon: 'fa-user', label: 'Informations' },
                                { key: 'professional', icon: 'fa-briefcase', label: 'Professionnel' },
                                { key: 'notifications', icon: 'fa-bell', label: 'Notifications' },
                                { key: 'password', icon: 'fa-lock', label: 'Mot de passe' },
                            ].map(tab => (
                                <button key={tab.key}
                                    className={`list-group-item list-group-item-action ${activeTab === tab.key ? 'active' : ''}`}
                                    onClick={() => handleTabChange(tab.key)}>
                                    <i className={`fas ${tab.icon} me-2`}></i> {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="col-lg-8">
                    {/* ============ INFO TAB ============ */}
                    {activeTab === 'info' && (
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Informations personnelles</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmitInfo}>
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
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Email</label>
                                            <input type="email" className="form-control" name="email"
                                                value={form.email} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Téléphone</label>
                                            <input type="text" className="form-control" name="phone"
                                                value={form.phone} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Pays</label>
                                            <select className="form-select" name="country"
                                                value={form.country} onChange={handleChange}>
                                                <option value="">-- Sélectionner --</option>
                                                {AFRICAN_COUNTRIES.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Ville</label>
                                            <input type="text" className="form-control" name="city"
                                                value={form.city} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Langue préférée</label>
                                        <div className="d-flex gap-3">
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="preferred_language"
                                                    id="lang_fr" value="fr"
                                                    checked={form.preferred_language === 'fr'} onChange={handleChange} />
                                                <label className="form-check-label" htmlFor="lang_fr">Français</label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="preferred_language"
                                                    id="lang_en" value="en"
                                                    checked={form.preferred_language === 'en'} onChange={handleChange} />
                                                <label className="form-check-label" htmlFor="lang_en">English</label>
                                            </div>
                                        </div>
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
                                    <button type="submit" className="btn btn-primary" disabled={saving} style={btnStyle}>
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

                    {/* ============ PROFESSIONAL TAB ============ */}
                    {activeTab === 'professional' && (
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Informations professionnelles</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmitPro}>
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Profession</label>
                                            <input type="text" className="form-control" name="profession"
                                                value={proForm.profession} onChange={handleProChange}
                                                placeholder="Ex: Vétérinaire" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Spécialisation</label>
                                            <input type="text" className="form-control" name="specialization"
                                                value={proForm.specialization} onChange={handleProChange}
                                                placeholder="Ex: Animaux de compagnie" />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Compétences</label>
                                        <div className="d-flex gap-2 mb-2">
                                            <input type="text" className="form-control" value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyDown={handleSkillKeyDown}
                                                placeholder="Tapez une compétence puis Entrée" />
                                            <button type="button" className="btn btn-outline-primary" onClick={addSkill}>
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <div className="d-flex flex-wrap gap-2">
                                            {proForm.skills.map((skill, i) => (
                                                <span key={i} className="badge bg-primary d-flex align-items-center gap-1"
                                                    style={{ fontSize: '0.85rem', padding: '6px 10px' }}>
                                                    {skill}
                                                    <button type="button" className="btn-close btn-close-white ms-1"
                                                        style={{ fontSize: '0.6rem' }}
                                                        onClick={() => removeSkill(skill)}></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Années d'expérience</label>
                                            <input type="number" className="form-control" name="years_experience"
                                                value={proForm.years_experience} onChange={handleProChange}
                                                min="0" max="60" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Niveau d'études</label>
                                            <select className="form-select" name="education_level"
                                                value={proForm.education_level} onChange={handleProChange}>
                                                <option value="">-- Sélectionner --</option>
                                                {EDUCATION_LEVELS.map(l => (
                                                    <option key={l.value} value={l.value}>{l.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary" disabled={savingPro} style={btnStyle}>
                                        {savingPro ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                                        ) : (
                                            <><i className="fas fa-save me-2"></i>Enregistrer</>
                                        )}
                                    </button>
                                </form>

                                {/* CV Section */}
                                <hr className="my-4" />
                                <h6 className="mb-3"><i className="fas fa-file-pdf me-2"></i>Curriculum Vitae</h6>
                                {currentCv && (
                                    <div className="d-flex align-items-center gap-3 mb-3 p-3 border rounded">
                                        <i className="fas fa-file-alt fa-2x text-primary"></i>
                                        <div className="flex-grow-1">
                                            <strong>{currentCv.filename}</strong>
                                        </div>
                                        <a href={`${API_BASE_URL}/auth/profile/cv/download`}
                                            className="btn btn-sm btn-outline-primary" target="_blank" rel="noreferrer">
                                            <i className="fas fa-download me-1"></i> Télécharger
                                        </a>
                                        <button className="btn btn-sm btn-outline-danger" onClick={handleDeleteCv}>
                                            <i className="fas fa-trash me-1"></i> Supprimer
                                        </button>
                                    </div>
                                )}
                                <div className="d-flex gap-2 align-items-center">
                                    <input type="file" className="form-control" accept=".pdf,.doc,.docx"
                                        onChange={(e) => setCvFile(e.target.files[0])} />
                                    <button className="btn btn-primary" disabled={!cvFile || uploadingCv}
                                        onClick={handleUploadCv} style={btnStyle}>
                                        {uploadingCv ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            <><i className="fas fa-upload me-1"></i> Upload</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ NOTIFICATIONS TAB ============ */}
                    {activeTab === 'notifications' && (
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Préférences de notification</h5>
                            </div>
                            <div className="card-body">
                                {notifLoading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Chargement...</span>
                                        </div>
                                    </div>
                                ) : notifPrefs ? (
                                    <>
                                        <h6 className="mb-3"><i className="fas fa-envelope me-2"></i>Notifications par email</h6>
                                        <div className="mb-4">
                                            {[
                                                { key: 'email_opportunities', label: 'Opportunités (emplois, appels d\'offres)' },
                                                { key: 'email_vet_alerts', label: 'Alertes vétérinaires' },
                                                { key: 'email_elearning', label: 'E-Learning (nouveaux cours, certificats)' },
                                                { key: 'email_newsletter', label: 'Newsletter' },
                                            ].map(item => (
                                                <div key={item.key} className="form-check form-switch mb-2">
                                                    <input className="form-check-input" type="checkbox" id={item.key}
                                                        checked={!!notifPrefs[item.key]}
                                                        onChange={() => toggleNotif(item.key)} />
                                                    <label className="form-check-label" htmlFor={item.key}>{item.label}</label>
                                                </div>
                                            ))}
                                        </div>

                                        <h6 className="mb-3"><i className="fas fa-bell me-2"></i>Notifications in-app</h6>
                                        <div className="mb-4">
                                            {[
                                                { key: 'inapp_opportunities', label: 'Opportunités' },
                                                { key: 'inapp_vet_alerts', label: 'Alertes vétérinaires' },
                                                { key: 'inapp_elearning', label: 'E-Learning' },
                                                { key: 'inapp_newsletter', label: 'Newsletter' },
                                            ].map(item => (
                                                <div key={item.key} className="form-check form-switch mb-2">
                                                    <input className="form-check-input" type="checkbox" id={item.key}
                                                        checked={!!notifPrefs[item.key]}
                                                        onChange={() => toggleNotif(item.key)} />
                                                    <label className="form-check-label" htmlFor={item.key}>{item.label}</label>
                                                </div>
                                            ))}
                                        </div>

                                        <h6 className="mb-3"><i className="fas fa-clock me-2"></i>Fréquence</h6>
                                        <div className="mb-4">
                                            <select className="form-select" style={{ maxWidth: 250 }}
                                                value={notifPrefs.email_frequency || 'daily'}
                                                onChange={(e) => setNotifPrefs(prev => ({ ...prev, email_frequency: e.target.value }))}>
                                                <option value="instant">Instantané</option>
                                                <option value="daily">Quotidien</option>
                                                <option value="weekly">Hebdomadaire</option>
                                                <option value="never">Jamais</option>
                                            </select>
                                        </div>

                                        <button className="btn btn-primary" disabled={savingNotifs}
                                            onClick={handleSaveNotifs} style={btnStyle}>
                                            {savingNotifs ? (
                                                <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                                            ) : (
                                                <><i className="fas fa-save me-2"></i>Enregistrer les préférences</>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-muted">Impossible de charger les préférences.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ============ PASSWORD TAB ============ */}
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
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Nouveau mot de passe</label>
                                        <input type="password" className="form-control"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                            required minLength={6} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirmer le nouveau mot de passe</label>
                                        <input type="password" className="form-control"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            required minLength={6} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={changingPassword} style={btnStyle}>
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
