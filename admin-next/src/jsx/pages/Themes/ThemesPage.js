import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import { api, getToken } from '../../../services/api';

const ThemesPage = () => {
    const {
        changePrimaryColor,
        changeSecondaryColor,
        changeNavigationHader,
        chnageHaderColor,
        chnageSidebarColor,
        changeSideBarStyle,
        changeSideBarLayout,
        changeBackground,
        changeContainerPosition,
        primaryColor,
        secondaryColor,
        navigationHader,
        haderColor,
        sidebarColor,
        sideBarStyle,
        sidebarLayout,
        background,
        containerPositionSize,
        colors,
        sideBarOption,
        layoutOption,
        backgroundOption,
        containerPosition,
    } = useContext(ThemeContext);

    const token = getToken();
    const [themes, setThemes] = useState([]);
    const [loadingThemes, setLoadingThemes] = useState(false);
    const [toast, setToast] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTheme, setEditingTheme] = useState(null);
    const [themeForm, setThemeForm] = useState({
        name: '', description: '', preview_image: '', version: '1.0.0', author: ''
    });
    const [savingTheme, setSavingTheme] = useState(false);

    const colorLabels = {
        color_1: '#6853E8', color_2: '#6610f2', color_3: '#6f42c1', color_4: '#354e84',
        color_5: '#4d9dea', color_6: '#20c997', color_7: '#7ac142', color_8: '#fd7e14',
        color_9: '#e74c3c', color_10: '#dc3545', color_11: '#f0ad4e', color_12: '#2F4858',
        color_13: '#1abc9c'
    };

    useEffect(() => {
        fetchThemes();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchThemes = async () => {
        setLoadingThemes(true);
        const res = await api.get('/themes', token);
        if (res.success) {
            setThemes(res.data || []);
        }
        setLoadingThemes(false);
    };

    const openCreateModal = () => {
        setEditingTheme(null);
        setThemeForm({ name: '', description: '', preview_image: '', version: '1.0.0', author: '' });
        setShowModal(true);
    };

    const openEditModal = (theme) => {
        setEditingTheme(theme);
        setThemeForm({
            name: theme.name || '',
            description: theme.description || '',
            preview_image: theme.preview_image || '',
            version: theme.version || '1.0.0',
            author: theme.author || ''
        });
        setShowModal(true);
    };

    const handleSaveTheme = async () => {
        if (!themeForm.name.trim()) {
            showToast('Le nom est requis', 'error');
            return;
        }
        setSavingTheme(true);
        let res;
        if (editingTheme) {
            res = await api.put(`/themes/${editingTheme.id}`, themeForm, token);
        } else {
            res = await api.post('/themes', themeForm, token);
        }
        if (res.success) {
            showToast(editingTheme ? 'Thème modifié' : 'Thème créé');
            setShowModal(false);
            fetchThemes();
        } else {
            showToast(res.message || 'Erreur', 'error');
        }
        setSavingTheme(false);
    };

    const handleActivate = async (id) => {
        const res = await api.put(`/themes/${id}/activate`, {}, token);
        if (res.success) {
            showToast('Thème activé');
            fetchThemes();
        } else {
            showToast(res.message || 'Erreur', 'error');
        }
    };

    const handleDuplicate = async (id) => {
        const res = await api.post(`/themes/${id}/duplicate`, {}, token);
        if (res.success) {
            showToast('Thème dupliqué');
            fetchThemes();
        } else {
            showToast(res.message || 'Erreur', 'error');
        }
    };

    const handleExport = async (id) => {
        const res = await api.get(`/themes/${id}/export`, token);
        if (res.success && res.data) {
            const json = JSON.stringify(res.data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `theme_${res.data.name || id}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            showToast(res.message || 'Erreur export', 'error');
        }
    };

    const handleDelete = async (theme) => {
        if (theme.is_active || theme.is_default) {
            showToast('Impossible de supprimer un thème actif ou par défaut', 'error');
            return;
        }
        if (!window.confirm(`Supprimer le thème "${theme.name}" ?`)) return;
        const res = await api.delete(`/themes/${theme.id}`, token);
        if (res.success) {
            showToast('Thème supprimé');
            fetchThemes();
        } else {
            showToast(res.message || 'Erreur', 'error');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            const res = await api.post('/themes/import', data, token);
            if (res.success) {
                showToast('Thème importé');
                fetchThemes();
            } else {
                showToast(res.message || 'Erreur import', 'error');
            }
        } catch {
            showToast('Fichier JSON invalide', 'error');
        }
        e.target.value = '';
    };

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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Thèmes</h2>
                    <p className="text-muted mb-0">Personnaliser l'apparence du panneau d'administration et du site</p>
                </div>
            </div>

            {/* ============ SECTION 1: Admin Appearance ============ */}
            <h5 className="mb-3"><i className="fas fa-desktop me-2" style={{ color: '#354e84' }}></i>Apparence admin</h5>
            <div className="row mb-5">
                {/* Layout */}
                <div className="col-lg-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="mb-0"><i className="fas fa-columns me-2" style={{ color: '#354e84' }}></i>Disposition</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-4">
                                <label className="form-label fw-bold">Layout</label>
                                <div className="d-flex gap-2">
                                    {layoutOption.map(opt => (
                                        <button key={opt.value} type="button"
                                            className={`btn btn-sm ${sidebarLayout.value === opt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => changeSideBarLayout(opt)}
                                            style={sidebarLayout.value === opt.value ? { background: '#7ac142', borderColor: '#7ac142' } : {}}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">Style sidebar</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {sideBarOption.map(opt => (
                                        <button key={opt.value} type="button"
                                            className={`btn btn-sm ${sideBarStyle.value === opt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => changeSideBarStyle(opt)}
                                            style={sideBarStyle.value === opt.value ? { background: '#7ac142', borderColor: '#7ac142' } : {}}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">Mode</label>
                                <div className="d-flex gap-2">
                                    {backgroundOption.map(opt => (
                                        <button key={opt.value} type="button"
                                            className={`btn btn-sm ${background.value === opt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => changeBackground(opt)}
                                            style={background.value === opt.value ? { background: '#7ac142', borderColor: '#7ac142' } : {}}>
                                            <i className={`fas fa-${opt.value === 'light' ? 'sun' : 'moon'} me-1`}></i>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="form-label fw-bold">Conteneur</label>
                                <div className="d-flex gap-2">
                                    {containerPosition.map(opt => (
                                        <button key={opt.value} type="button"
                                            className={`btn btn-sm ${containerPositionSize.value === opt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => changeContainerPosition(opt)}
                                            style={containerPositionSize.value === opt.value ? { background: '#7ac142', borderColor: '#7ac142' } : {}}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div className="col-lg-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="mb-0"><i className="fas fa-palette me-2" style={{ color: '#7ac142' }}></i>Couleurs</h5>
                        </div>
                        <div className="card-body">
                            {[
                                { label: 'Couleur primaire', current: primaryColor, onChange: changePrimaryColor },
                                { label: 'Couleur secondaire', current: secondaryColor, onChange: changeSecondaryColor },
                                { label: 'Navigation header', current: navigationHader, onChange: changeNavigationHader },
                                { label: 'Header', current: haderColor, onChange: chnageHaderColor },
                                { label: 'Sidebar', current: sidebarColor, onChange: chnageSidebarColor },
                            ].map((section, idx) => (
                                <div key={idx} className={idx < 4 ? 'mb-4' : ''}>
                                    <label className="form-label fw-bold">{section.label}</label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {colors.map(c => (
                                            <button key={c} type="button"
                                                className="btn btn-sm p-0 border-0"
                                                onClick={() => section.onChange(c)}
                                                title={c}
                                                style={{
                                                    width: '30px', height: '30px', borderRadius: '50%',
                                                    background: colorLabels[c] || '#999',
                                                    outline: section.current === c ? '3px solid #333' : 'none',
                                                    outlineOffset: '2px'
                                                }}>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ============ SECTION 2: Site Themes ============ */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0"><i className="fas fa-paint-brush me-2" style={{ color: '#7ac142' }}></i>Thèmes du site</h5>
                <div className="d-flex gap-2">
                    <label className="btn btn-outline-secondary btn-sm mb-0">
                        <i className="fas fa-file-import me-1"></i> Importer
                        <input type="file" accept=".json" className="d-none" onChange={handleImport} />
                    </label>
                    <button className="btn btn-primary btn-sm" onClick={openCreateModal} style={btnStyle}>
                        <i className="fas fa-plus me-1"></i> Nouveau thème
                    </button>
                </div>
            </div>

            {loadingThemes ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            ) : themes.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center py-5 text-muted">
                        <i className="fas fa-palette fa-3x mb-3"></i>
                        <p>Aucun thème de site. Créez-en un pour commencer.</p>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {themes.map(theme => (
                        <div key={theme.id} className="col-xl-4 col-md-6 mb-4">
                            <div className="card h-100" style={{ borderTop: `3px solid ${theme.is_active ? '#7ac142' : '#dee2e6'}` }}>
                                {theme.preview_image && (
                                    <img src={theme.preview_image} className="card-img-top" alt={theme.name}
                                        style={{ height: 160, objectFit: 'cover' }} />
                                )}
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="mb-0">{theme.name}</h5>
                                        <div className="d-flex gap-1">
                                            {theme.is_active && <span className="badge bg-success">Actif</span>}
                                            {theme.is_default && <span className="badge bg-info">Défaut</span>}
                                        </div>
                                    </div>
                                    {theme.description && <p className="text-muted small mb-2">{theme.description}</p>}
                                    <div className="text-muted small mb-3">
                                        {theme.author && <span className="me-3"><i className="fas fa-user me-1"></i>{theme.author}</span>}
                                        {theme.version && <span><i className="fas fa-tag me-1"></i>v{theme.version}</span>}
                                    </div>
                                    <div className="d-flex gap-1 flex-wrap">
                                        {!theme.is_active && (
                                            <button className="btn btn-sm btn-outline-success" onClick={() => handleActivate(theme.id)}>
                                                <i className="fas fa-check me-1"></i>Activer
                                            </button>
                                        )}
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(theme)}>
                                            <i className="fas fa-edit me-1"></i>Modifier
                                        </button>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleDuplicate(theme.id)}>
                                            <i className="fas fa-copy me-1"></i>Dupliquer
                                        </button>
                                        <button className="btn btn-sm btn-outline-info" onClick={() => handleExport(theme.id)}>
                                            <i className="fas fa-download me-1"></i>Exporter
                                        </button>
                                        {!theme.is_active && !theme.is_default && (
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(theme)}>
                                                <i className="fas fa-trash me-1"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ============ MODAL ============ */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editingTheme ? 'Modifier le thème' : 'Nouveau thème'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Nom *</label>
                                        <input type="text" className="form-control" value={themeForm.name}
                                            onChange={(e) => setThemeForm(prev => ({ ...prev, name: e.target.value }))} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea className="form-control" rows={3} value={themeForm.description}
                                            onChange={(e) => setThemeForm(prev => ({ ...prev, description: e.target.value }))} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">URL image preview</label>
                                        <input type="text" className="form-control" value={themeForm.preview_image}
                                            onChange={(e) => setThemeForm(prev => ({ ...prev, preview_image: e.target.value }))}
                                            placeholder="https://..." />
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Version</label>
                                            <input type="text" className="form-control" value={themeForm.version}
                                                onChange={(e) => setThemeForm(prev => ({ ...prev, version: e.target.value }))} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Auteur</label>
                                            <input type="text" className="form-control" value={themeForm.author}
                                                onChange={(e) => setThemeForm(prev => ({ ...prev, author: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                                    <button className="btn btn-primary" disabled={savingTheme}
                                        onClick={handleSaveTheme} style={btnStyle}>
                                        {savingTheme ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            <><i className="fas fa-save me-1"></i> {editingTheme ? 'Modifier' : 'Créer'}</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default ThemesPage;
