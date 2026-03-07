import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const NewsletterPage = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Dashboard
    const [stats, setStats] = useState(null);

    // Lists
    const [lists, setLists] = useState([]);
    const [editingList, setEditingList] = useState(null);
    const [addingList, setAddingList] = useState(false);
    const [listForm, setListForm] = useState({ name: '', color: '#7ac142', is_public: true, is_default: false, double_optin: false });

    // Subscribers
    const [subscribers, setSubscribers] = useState([]);
    const [subSearch, setSubSearch] = useState('');
    const [subStatusFilter, setSubStatusFilter] = useState('all');
    const [subListFilter, setSubListFilter] = useState('all');
    const [subLangFilter, setSubLangFilter] = useState('all');
    const [subPage, setSubPage] = useState(1);
    const [subPerPage, setSubPerPage] = useState(20);
    const [selectedSubs, setSelectedSubs] = useState([]);
    const importRef = useRef(null);

    // Campaigns
    const [campaigns, setCampaigns] = useState([]);
    const [campStatusFilter, setCampStatusFilter] = useState('all');
    const [campPage, setCampPage] = useState(1);
    const [campPerPage, setCampPerPage] = useState(10);

    // Templates
    const [templates, setTemplates] = useState([]);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [addingTemplate, setAddingTemplate] = useState(false);
    const [templateForm, setTemplateForm] = useState({ name: '', subject_fr: '', subject_en: '', content_html_fr: '', content_html_en: '' });

    // Settings
    const [settings, setSettings] = useState({ from_name: '', from_email: '', reply_to: '', track_opens: true, track_clicks: true, batch_size: 50, batch_delay: 1000 });
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        fetchAll();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchAll = async () => {
        const [statsRes, listsRes, subsRes, campsRes, tmplRes, settRes] = await Promise.all([
            api.get('/newsletter/stats', token),
            api.get('/newsletter/lists', token),
            api.get('/newsletter/subscribers', token),
            api.get('/newsletter/campaigns', token),
            api.get('/newsletter/templates', token),
            api.get('/newsletter/settings', token)
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (listsRes.success) setLists(listsRes.data || []);
        if (subsRes.success) setSubscribers(subsRes.data || []);
        if (campsRes.success) setCampaigns(campsRes.data || []);
        if (tmplRes.success) setTemplates(tmplRes.data || []);
        if (settRes.success && settRes.data) setSettings(prev => ({ ...prev, ...settRes.data }));
        setLoading(false);
    };

    const showToast = (message, type = 'success') => setToast({ message, type });

    // ===== LISTS =====
    const resetListForm = () => { setListForm({ name: '', color: '#7ac142', is_public: true, is_default: false, double_optin: false }); setEditingList(null); setAddingList(false); };

    const handleSaveList = async (e) => {
        e.preventDefault();
        if (!listForm.name.trim()) { showToast('Le nom est requis', 'error'); return; }
        const res = editingList
            ? await api.put(`/newsletter/lists/${editingList.id}`, listForm, token)
            : await api.post('/newsletter/lists', listForm, token);
        if (res.success) { showToast(editingList ? 'Liste modifiée' : 'Liste créée'); resetListForm(); fetchAll(); }
        else showToast(res.message || 'Erreur', 'error');
    };

    const handleDeleteList = async (id) => {
        if (window.confirm('Supprimer cette liste ?')) {
            const res = await api.delete(`/newsletter/lists/${id}`, token);
            if (res.success) { showToast('Liste supprimée'); setLists(prev => prev.filter(l => l.id !== id)); }
        }
    };

    // ===== SUBSCRIBERS =====
    const handleDeleteSubscriber = async (id) => {
        if (window.confirm('Supprimer cet abonné ?')) {
            const res = await api.delete(`/newsletter/subscribers/${id}`, token);
            if (res.success) { showToast('Abonné supprimé'); setSubscribers(prev => prev.filter(s => s.id !== id)); }
        }
    };

    const handleToggleSubStatus = async (sub) => {
        const newStatus = sub.status === 'active' ? 'unsubscribed' : 'active';
        const res = await api.put(`/newsletter/subscribers/${sub.id}`, { status: newStatus }, token);
        if (res.success) { showToast(newStatus === 'active' ? 'Abonné réactivé' : 'Abonné désactivé'); fetchAll(); }
    };

    const handleBulkAction = async (action) => {
        if (selectedSubs.length === 0) return;
        if (action === 'delete' && !window.confirm(`Supprimer ${selectedSubs.length} abonnés ?`)) return;
        for (const id of selectedSubs) {
            if (action === 'delete') await api.delete(`/newsletter/subscribers/${id}`, token);
            else if (action === 'activate') await api.put(`/newsletter/subscribers/${id}`, { status: 'active' }, token);
            else if (action === 'deactivate') await api.put(`/newsletter/subscribers/${id}`, { status: 'unsubscribed' }, token);
        }
        showToast('Action en masse effectuée');
        setSelectedSubs([]);
        fetchAll();
    };

    const handleImportCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.upload('/newsletter/subscribers/import', formData, token);
        if (res.success) { showToast(`${res.data?.imported || 0} abonnés importés`); fetchAll(); }
        else showToast(res.message || 'Erreur import', 'error');
        if (importRef.current) importRef.current.value = '';
    };

    const handleExportSubscribers = () => {
        const active = subscribers.filter(s => s.status === 'active');
        const csv = ['Email,Nom,Langue,Date inscription']
            .concat(active.map(s => `${s.email},${s.name || ''},${s.language || ''},${s.created_at || ''}`))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'subscribers.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Filter subscribers
    const filteredSubs = subscribers.filter(s => {
        const matchSearch = (s.email || '').toLowerCase().includes(subSearch.toLowerCase()) || (s.name || '').toLowerCase().includes(subSearch.toLowerCase());
        const matchStatus = subStatusFilter === 'all' || s.status === subStatusFilter;
        const matchList = subListFilter === 'all' || (s.list_ids || []).includes(parseInt(subListFilter));
        const matchLang = subLangFilter === 'all' || s.language === subLangFilter;
        return matchSearch && matchStatus && matchList && matchLang;
    });
    const subTotalPages = Math.ceil(filteredSubs.length / subPerPage);
    const paginatedSubs = filteredSubs.slice((subPage - 1) * subPerPage, subPage * subPerPage);

    useEffect(() => { setSubPage(1); }, [subSearch, subStatusFilter, subListFilter, subLangFilter, subPerPage]);

    // Filter campaigns
    const filteredCamps = campaigns.filter(c => campStatusFilter === 'all' || c.status === campStatusFilter);
    const campTotalPages = Math.ceil(filteredCamps.length / campPerPage);
    const paginatedCamps = filteredCamps.slice((campPage - 1) * campPerPage, campPage * campPerPage);

    // ===== TEMPLATES =====
    const resetTemplateForm = () => { setTemplateForm({ name: '', subject_fr: '', subject_en: '', content_html_fr: '', content_html_en: '' }); setEditingTemplate(null); setAddingTemplate(false); };

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        if (!templateForm.name.trim()) { showToast('Le nom est requis', 'error'); return; }
        const res = editingTemplate
            ? await api.put(`/newsletter/templates/${editingTemplate.id}`, templateForm, token)
            : await api.post('/newsletter/templates', templateForm, token);
        if (res.success) { showToast(editingTemplate ? 'Template modifié' : 'Template créé'); resetTemplateForm(); fetchAll(); }
        else showToast(res.message || 'Erreur', 'error');
    };

    const handleDuplicateTemplate = async (tmpl) => {
        const res = await api.post('/newsletter/templates', { ...tmpl, id: undefined, name: `${tmpl.name} (copie)` }, token);
        if (res.success) { showToast('Template dupliqué'); fetchAll(); }
    };

    const handleDeleteTemplate = async (id) => {
        if (window.confirm('Supprimer ce template ?')) {
            const res = await api.delete(`/newsletter/templates/${id}`, token);
            if (res.success) { showToast('Template supprimé'); setTemplates(prev => prev.filter(t => t.id !== id)); }
        }
    };

    // ===== SETTINGS =====
    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        const res = await api.put('/newsletter/settings', settings, token);
        if (res.success) showToast('Paramètres enregistrés');
        else showToast(res.message || 'Erreur', 'error');
        setSavingSettings(false);
    };

    // ===== CAMPAIGNS =====
    const handleDeleteCampaign = async (id) => {
        if (window.confirm('Supprimer cette campagne ?')) {
            const res = await api.delete(`/newsletter/campaigns/${id}`, token);
            if (res.success) { showToast('Campagne supprimée'); setCampaigns(prev => prev.filter(c => c.id !== id)); }
        }
    };

    const handleSendCampaign = async (campaign) => {
        const activeCount = subscribers.filter(s => s.status === 'active').length;
        if (window.confirm(`Envoyer "${campaign.subject || campaign.subject_fr}" à ${activeCount} abonnés ?`)) {
            const res = await api.post(`/newsletter/campaigns/${campaign.id}/send`, {}, token);
            if (res.success) { showToast('Campagne envoyée'); fetchAll(); }
            else showToast(res.message || 'Erreur', 'error');
        }
    };

    const tabs = [
        { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
        { id: 'lists', icon: 'fa-list', label: 'Listes' },
        { id: 'subscribers', icon: 'fa-users', label: 'Abonnés' },
        { id: 'campaigns', icon: 'fa-envelope', label: 'Campagnes' },
        { id: 'templates', icon: 'fa-file-code', label: 'Templates' },
        { id: 'settings', icon: 'fa-cog', label: 'Paramètres' }
    ];

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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Newsletter</h2>
                    <p className="text-muted mb-0">Gestion des abonnés, campagnes et templates</p>
                </div>
                <Link to="/newsletter/campaigns/new" className="btn btn-primary"
                    style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                    <i className="fas fa-plus me-2"></i> Nouvelle campagne
                </Link>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                {tabs.map(tab => (
                    <li key={tab.id} className="nav-item">
                        <button className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}>
                            <i className={`fas ${tab.icon} me-2`}></i> {tab.label}
                        </button>
                    </li>
                ))}
            </ul>

            {/* ===== DASHBOARD TAB ===== */}
            {activeTab === 'dashboard' && (
                <>
                    <div className="row g-3 mb-4">
                        <div className="col-md-2">
                            <div className="card text-center"><div className="card-body">
                                <i className="fas fa-users fa-2x mb-2" style={{ color: '#7ac142' }}></i>
                                <h3 className="mb-0">{stats?.totalSubscribers || subscribers.length}</h3>
                                <small className="text-muted">Abonnés</small>
                            </div></div>
                        </div>
                        <div className="col-md-2">
                            <div className="card text-center"><div className="card-body">
                                <i className="fas fa-check-circle fa-2x mb-2 text-success"></i>
                                <h3 className="mb-0">{stats?.activeSubscribers || subscribers.filter(s => s.status === 'active').length}</h3>
                                <small className="text-muted">Actifs</small>
                            </div></div>
                        </div>
                        <div className="col-md-2">
                            <div className="card text-center"><div className="card-body">
                                <i className="fas fa-envelope fa-2x mb-2" style={{ color: '#354e84' }}></i>
                                <h3 className="mb-0">{stats?.totalCampaigns || campaigns.length}</h3>
                                <small className="text-muted">Campagnes</small>
                            </div></div>
                        </div>
                        <div className="col-md-2">
                            <div className="card text-center"><div className="card-body">
                                <i className="fas fa-paper-plane fa-2x mb-2 text-info"></i>
                                <h3 className="mb-0">{stats?.sentCampaigns || campaigns.filter(c => c.status === 'sent').length}</h3>
                                <small className="text-muted">Envoyées</small>
                            </div></div>
                        </div>
                        <div className="col-md-2">
                            <div className="card text-center"><div className="card-body">
                                <i className="fas fa-eye fa-2x mb-2 text-warning"></i>
                                <h3 className="mb-0">{stats?.avgOpenRate ? `${stats.avgOpenRate}%` : '-'}</h3>
                                <small className="text-muted">Taux ouverture</small>
                            </div></div>
                        </div>
                        <div className="col-md-2">
                            <div className="card text-center"><div className="card-body">
                                <i className="fas fa-mouse-pointer fa-2x mb-2 text-danger"></i>
                                <h3 className="mb-0">{stats?.avgClickRate ? `${stats.avgClickRate}%` : '-'}</h3>
                                <small className="text-muted">Taux clic</small>
                            </div></div>
                        </div>
                    </div>
                    {/* Recent activity */}
                    <div className="card">
                        <div className="card-header"><h5 className="mb-0">Campagnes récentes</h5></div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead><tr><th>Sujet</th><th>Statut</th><th>Destinataires</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {campaigns.slice(0, 5).map(c => (
                                            <tr key={c.id}>
                                                <td><Link to={`/newsletter/campaigns/${c.id}`} className="text-decoration-none">{c.subject || c.subject_fr || '-'}</Link></td>
                                                <td><span className={`badge ${c.status === 'sent' ? 'bg-success' : c.status === 'draft' ? 'bg-warning' : 'bg-info'}`}>{c.status === 'sent' ? 'Envoyée' : c.status === 'draft' ? 'Brouillon' : 'Programmée'}</span></td>
                                                <td>{c.recipients_count || '-'}</td>
                                                <td><small>{c.sent_at ? new Date(c.sent_at).toLocaleDateString('fr-FR') : c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '-'}</small></td>
                                            </tr>
                                        ))}
                                        {campaigns.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">Aucune campagne</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ===== LISTS TAB ===== */}
            {activeTab === 'lists' && (
                <>
                    <div className="d-flex justify-content-end mb-3">
                        <button className="btn btn-primary btn-sm" onClick={() => { resetListForm(); setAddingList(true); }}
                            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                            <i className="fas fa-plus me-1"></i> Nouvelle liste
                        </button>
                    </div>

                    {addingList && (
                        <div className="card mb-4">
                            <div className="card-body">
                                <form onSubmit={handleSaveList}>
                                    <div className="row g-3 align-items-end">
                                        <div className="col-md-3">
                                            <label className="form-label small">Nom *</label>
                                            <input type="text" className="form-control" value={listForm.name}
                                                onChange={(e) => setListForm(p => ({ ...p, name: e.target.value }))} required />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label small">Couleur</label>
                                            <input type="color" className="form-control form-control-color" value={listForm.color}
                                                onChange={(e) => setListForm(p => ({ ...p, color: e.target.value }))} />
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-check"><input type="checkbox" className="form-check-input" checked={listForm.is_public}
                                                onChange={(e) => setListForm(p => ({ ...p, is_public: e.target.checked }))} id="list_public" />
                                                <label className="form-check-label small" htmlFor="list_public">Publique</label></div>
                                            <div className="form-check"><input type="checkbox" className="form-check-input" checked={listForm.is_default}
                                                onChange={(e) => setListForm(p => ({ ...p, is_default: e.target.checked }))} id="list_default" />
                                                <label className="form-check-label small" htmlFor="list_default">Par défaut</label></div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-check"><input type="checkbox" className="form-check-input" checked={listForm.double_optin}
                                                onChange={(e) => setListForm(p => ({ ...p, double_optin: e.target.checked }))} id="list_optin" />
                                                <label className="form-check-label small" htmlFor="list_optin">Double opt-in</label></div>
                                        </div>
                                        <div className="col-md-3 d-flex gap-2">
                                            <button type="submit" className="btn btn-success btn-sm"><i className="fas fa-check me-1"></i>Enregistrer</button>
                                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetListForm}>Annuler</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="row g-4">
                        {lists.map(list => (
                            <div key={list.id} className="col-md-4">
                                <div className="card h-100" style={{ borderTop: `4px solid ${list.color || '#7ac142'}` }}>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h6 className="mb-0">{list.name}</h6>
                                            <div className="d-flex gap-1">
                                                {list.is_default && <span className="badge bg-success" style={{ fontSize: '0.6rem' }}>Défaut</span>}
                                                {list.is_public && <span className="badge bg-info" style={{ fontSize: '0.6rem' }}>Public</span>}
                                            </div>
                                        </div>
                                        <p className="text-muted small mb-2">{list.subscribers_count || 0} abonnés</p>
                                        {list.double_optin && <span className="badge bg-light text-dark" style={{ fontSize: '0.6rem' }}>Double opt-in</span>}
                                    </div>
                                    <div className="card-footer bg-transparent">
                                        <div className="btn-group w-100 btn-group-sm">
                                            <button className="btn btn-outline-primary" onClick={() => {
                                                setEditingList(list); setAddingList(true);
                                                setListForm({ name: list.name || '', color: list.color || '#7ac142', is_public: list.is_public !== false, is_default: list.is_default || false, double_optin: list.double_optin || false });
                                            }}><i className="fas fa-edit"></i></button>
                                            <button className="btn btn-outline-danger" onClick={() => handleDeleteList(list.id)}><i className="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {lists.length === 0 && (
                            <div className="col-12"><div className="card"><div className="card-body text-center py-5 text-muted">
                                <i className="fas fa-list fa-3x mb-3 opacity-50"></i><p>Aucune liste</p>
                            </div></div></div>
                        )}
                    </div>
                </>
            )}

            {/* ===== SUBSCRIBERS TAB ===== */}
            {activeTab === 'subscribers' && (
                <>
                    <div className="card mb-4">
                        <div className="card-body py-3">
                            <div className="row g-3 align-items-center">
                                <div className="col-md-3">
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text"><i className="fas fa-search"></i></span>
                                        <input type="text" className="form-control" placeholder="Rechercher..." value={subSearch} onChange={(e) => setSubSearch(e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <select className="form-select form-select-sm" value={subStatusFilter} onChange={(e) => setSubStatusFilter(e.target.value)}>
                                        <option value="all">Tous statuts</option>
                                        <option value="active">Actifs</option>
                                        <option value="unsubscribed">Désabonnés</option>
                                        <option value="bounced">Bounced</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <select className="form-select form-select-sm" value={subListFilter} onChange={(e) => setSubListFilter(e.target.value)}>
                                        <option value="all">Toutes listes</option>
                                        {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-1">
                                    <select className="form-select form-select-sm" value={subLangFilter} onChange={(e) => setSubLangFilter(e.target.value)}>
                                        <option value="all">Langue</option>
                                        <option value="fr">FR</option>
                                        <option value="en">EN</option>
                                    </select>
                                </div>
                                <div className="col-md-4 d-flex gap-2 justify-content-end">
                                    {selectedSubs.length > 0 && (
                                        <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-success" onClick={() => handleBulkAction('activate')}><i className="fas fa-check"></i> Activer</button>
                                            <button className="btn btn-outline-warning" onClick={() => handleBulkAction('deactivate')}><i className="fas fa-ban"></i></button>
                                            <button className="btn btn-outline-danger" onClick={() => handleBulkAction('delete')}><i className="fas fa-trash"></i></button>
                                        </div>
                                    )}
                                    <input type="file" ref={importRef} className="d-none" accept=".csv" onChange={handleImportCSV} />
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => importRef.current?.click()}>
                                        <i className="fas fa-upload me-1"></i>Import
                                    </button>
                                    <button className="btn btn-outline-secondary btn-sm" onClick={handleExportSubscribers}>
                                        <i className="fas fa-download me-1"></i>Export
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '30px' }}>
                                                <input type="checkbox" className="form-check-input"
                                                    checked={selectedSubs.length === paginatedSubs.length && paginatedSubs.length > 0}
                                                    onChange={(e) => setSelectedSubs(e.target.checked ? paginatedSubs.map(s => s.id) : [])} />
                                            </th>
                                            <th>Email</th>
                                            <th>Nom</th>
                                            <th>Langue</th>
                                            <th>Statut</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedSubs.map(sub => (
                                            <tr key={sub.id}>
                                                <td>
                                                    <input type="checkbox" className="form-check-input"
                                                        checked={selectedSubs.includes(sub.id)}
                                                        onChange={(e) => setSelectedSubs(prev => e.target.checked ? [...prev, sub.id] : prev.filter(id => id !== sub.id))} />
                                                </td>
                                                <td><i className="fas fa-envelope me-2 text-muted"></i>{sub.email}</td>
                                                <td>{sub.name || '-'}</td>
                                                <td><span className="badge bg-light text-dark">{(sub.language || 'fr').toUpperCase()}</span></td>
                                                <td>
                                                    <span className={`badge ${sub.status === 'active' ? 'bg-success' : sub.status === 'bounced' ? 'bg-danger' : 'bg-secondary'}`}>
                                                        {sub.status === 'active' ? 'Actif' : sub.status === 'bounced' ? 'Bounced' : 'Désabonné'}
                                                    </span>
                                                </td>
                                                <td><small>{sub.created_at ? new Date(sub.created_at).toLocaleDateString('fr-FR') : '-'}</small></td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button className={`btn ${sub.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                            onClick={() => handleToggleSubStatus(sub)}>
                                                            <i className={`fas fa-${sub.status === 'active' ? 'ban' : 'check'}`}></i>
                                                        </button>
                                                        <button className="btn btn-outline-danger" onClick={() => handleDeleteSubscriber(sub.id)}>
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {paginatedSubs.length === 0 && <tr><td colSpan="7" className="text-center py-5 text-muted">Aucun abonné trouvé</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {filteredSubs.length > 0 && (
                            <Pagination currentPage={subPage} totalPages={subTotalPages} totalItems={filteredSubs.length}
                                itemsPerPage={subPerPage} onPageChange={setSubPage} onItemsPerPageChange={setSubPerPage} itemName="abonnés" />
                        )}
                    </div>
                </>
            )}

            {/* ===== CAMPAIGNS TAB ===== */}
            {activeTab === 'campaigns' && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex gap-2">
                            {['all', 'draft', 'sent', 'scheduled'].map(s => (
                                <button key={s} className={`btn btn-sm ${campStatusFilter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => { setCampStatusFilter(s); setCampPage(1); }}
                                    style={campStatusFilter === s ? { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' } : {}}>
                                    {s === 'all' ? 'Toutes' : s === 'draft' ? 'Brouillons' : s === 'sent' ? 'Envoyées' : 'Programmées'}
                                </button>
                            ))}
                        </div>
                        <Link to="/newsletter/campaigns/new" className="btn btn-primary btn-sm"
                            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                            <i className="fas fa-plus me-1"></i> Nouvelle campagne
                        </Link>
                    </div>

                    <div className="card">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead><tr><th>Sujet</th><th>Statut</th><th>Destinataires</th><th>Ouvertures</th><th>Clics</th><th>Date</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {paginatedCamps.map(c => (
                                            <tr key={c.id}>
                                                <td><strong className="small">{c.subject || c.subject_fr || '-'}</strong></td>
                                                <td>
                                                    <span className={`badge ${c.status === 'sent' ? 'bg-success' : c.status === 'draft' ? 'bg-warning' : c.status === 'sending' ? 'bg-info' : 'bg-secondary'}`}>
                                                        {c.status === 'sent' ? 'Envoyée' : c.status === 'draft' ? 'Brouillon' : c.status === 'sending' ? 'En cours...' : c.status === 'scheduled' ? 'Programmée' : c.status}
                                                    </span>
                                                    {c.status === 'sending' && c.progress !== undefined && (
                                                        <div className="progress mt-1" style={{ height: '4px' }}>
                                                            <div className="progress-bar bg-info" style={{ width: `${c.progress}%` }}></div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>{c.recipients_count || '-'}</td>
                                                <td>{c.open_rate ? `${c.open_rate}%` : '-'}</td>
                                                <td>{c.click_rate ? `${c.click_rate}%` : '-'}</td>
                                                <td><small>{c.sent_at ? new Date(c.sent_at).toLocaleDateString('fr-FR') : c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '-'}</small></td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button className="btn btn-outline-primary" onClick={() => navigate(`/newsletter/campaigns/${c.id}`)}><i className="fas fa-edit"></i></button>
                                                        {c.status === 'draft' && (
                                                            <button className="btn btn-outline-success" onClick={() => handleSendCampaign(c)}><i className="fas fa-paper-plane"></i></button>
                                                        )}
                                                        <button className="btn btn-outline-danger" onClick={() => handleDeleteCampaign(c.id)}><i className="fas fa-trash"></i></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {paginatedCamps.length === 0 && <tr><td colSpan="7" className="text-center py-5 text-muted">Aucune campagne trouvée</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {filteredCamps.length > 0 && (
                            <Pagination currentPage={campPage} totalPages={campTotalPages} totalItems={filteredCamps.length}
                                itemsPerPage={campPerPage} onPageChange={setCampPage} onItemsPerPageChange={setCampPerPage} itemName="campagnes" />
                        )}
                    </div>
                </>
            )}

            {/* ===== TEMPLATES TAB ===== */}
            {activeTab === 'templates' && (
                <>
                    <div className="d-flex justify-content-end mb-3">
                        <button className="btn btn-primary btn-sm" onClick={() => { resetTemplateForm(); setAddingTemplate(true); }}
                            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                            <i className="fas fa-plus me-1"></i> Nouveau template
                        </button>
                    </div>

                    {addingTemplate && (
                        <div className="card mb-4">
                            <div className="card-header"><h6 className="mb-0">{editingTemplate ? 'Modifier le template' : 'Nouveau template'}</h6></div>
                            <div className="card-body">
                                <form onSubmit={handleSaveTemplate}>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label small">Nom *</label>
                                            <input type="text" className="form-control" value={templateForm.name}
                                                onChange={(e) => setTemplateForm(p => ({ ...p, name: e.target.value }))} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small">Sujet FR</label>
                                            <input type="text" className="form-control" value={templateForm.subject_fr}
                                                onChange={(e) => setTemplateForm(p => ({ ...p, subject_fr: e.target.value }))} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small">Sujet EN</label>
                                            <input type="text" className="form-control" value={templateForm.subject_en}
                                                onChange={(e) => setTemplateForm(p => ({ ...p, subject_en: e.target.value }))} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small">Contenu HTML FR</label>
                                            <textarea className="form-control" value={templateForm.content_html_fr}
                                                onChange={(e) => setTemplateForm(p => ({ ...p, content_html_fr: e.target.value }))} rows={6} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small">Contenu HTML EN</label>
                                            <textarea className="form-control" value={templateForm.content_html_en}
                                                onChange={(e) => setTemplateForm(p => ({ ...p, content_html_en: e.target.value }))} rows={6} />
                                        </div>
                                        <div className="col-12 d-flex gap-2">
                                            <button type="submit" className="btn btn-success btn-sm"><i className="fas fa-check me-1"></i>Enregistrer</button>
                                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetTemplateForm}>Annuler</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="row g-4">
                        {templates.map(tmpl => (
                            <div key={tmpl.id} className="col-md-4">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h6 className="mb-1">{tmpl.name}</h6>
                                        <p className="small text-muted mb-2">{tmpl.subject_fr || 'Pas de sujet'}</p>
                                        {tmpl.subject_en && <small className="text-muted d-block">EN: {tmpl.subject_en}</small>}
                                    </div>
                                    <div className="card-footer bg-transparent">
                                        <div className="btn-group w-100 btn-group-sm">
                                            <button className="btn btn-outline-primary" onClick={() => {
                                                setEditingTemplate(tmpl); setAddingTemplate(true);
                                                setTemplateForm({ name: tmpl.name || '', subject_fr: tmpl.subject_fr || '', subject_en: tmpl.subject_en || '', content_html_fr: tmpl.content_html_fr || '', content_html_en: tmpl.content_html_en || '' });
                                            }}><i className="fas fa-edit"></i></button>
                                            <button className="btn btn-outline-info" onClick={() => handleDuplicateTemplate(tmpl)}><i className="fas fa-copy"></i></button>
                                            <button className="btn btn-outline-danger" onClick={() => handleDeleteTemplate(tmpl.id)}><i className="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {templates.length === 0 && (
                            <div className="col-12"><div className="card"><div className="card-body text-center py-5 text-muted">
                                <i className="fas fa-file-code fa-3x mb-3 opacity-50"></i><p>Aucun template</p>
                            </div></div></div>
                        )}
                    </div>
                </>
            )}

            {/* ===== SETTINGS TAB ===== */}
            {activeTab === 'settings' && (
                <div className="card">
                    <div className="card-header"><h5 className="mb-0"><i className="fas fa-cog me-2"></i>Paramètres Newsletter</h5></div>
                    <div className="card-body">
                        <form onSubmit={handleSaveSettings}>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label">Nom expéditeur</label>
                                    <input type="text" className="form-control" value={settings.from_name}
                                        onChange={(e) => setSettings(p => ({ ...p, from_name: e.target.value }))} placeholder="AfricaVet" />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Email expéditeur</label>
                                    <input type="email" className="form-control" value={settings.from_email}
                                        onChange={(e) => setSettings(p => ({ ...p, from_email: e.target.value }))} placeholder="newsletter@africavet.com" />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Email de réponse</label>
                                    <input type="email" className="form-control" value={settings.reply_to}
                                        onChange={(e) => setSettings(p => ({ ...p, reply_to: e.target.value }))} placeholder="contact@africavet.com" />
                                </div>
                            </div>

                            <hr className="my-4" />
                            <h6>Tracking</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-3">
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="track_opens" checked={settings.track_opens}
                                            onChange={(e) => setSettings(p => ({ ...p, track_opens: e.target.checked }))} />
                                        <label className="form-check-label" htmlFor="track_opens">Tracker les ouvertures</label>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="track_clicks" checked={settings.track_clicks}
                                            onChange={(e) => setSettings(p => ({ ...p, track_clicks: e.target.checked }))} />
                                        <label className="form-check-label" htmlFor="track_clicks">Tracker les clics</label>
                                    </div>
                                </div>
                            </div>

                            <h6>Configuration d'envoi par lots</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-3">
                                    <label className="form-label small">Taille du lot</label>
                                    <input type="number" className="form-control" value={settings.batch_size}
                                        onChange={(e) => setSettings(p => ({ ...p, batch_size: parseInt(e.target.value) || 50 }))} min="1" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small">Délai entre lots (ms)</label>
                                    <input type="number" className="form-control" value={settings.batch_delay}
                                        onChange={(e) => setSettings(p => ({ ...p, batch_delay: parseInt(e.target.value) || 1000 }))} min="0" />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={savingSettings}
                                style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                                {savingSettings ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</> :
                                    <><i className="fas fa-save me-2"></i>Enregistrer les paramètres</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default NewsletterPage;
