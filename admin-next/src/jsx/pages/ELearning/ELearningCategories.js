import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const ELearningCategories = () => {
    const token = getToken();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [editing, setEditing] = useState(null);
    const [adding, setAdding] = useState(false);

    const [form, setForm] = useState({
        name_fr: '',
        name_en: '',
        description_fr: '',
        parent_id: '',
        sort_order: 0
    });

    useEffect(() => {
        fetchCategories();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCategories = async () => {
        const res = await api.get('/elearning/categories', token);
        if (res.success) setCategories(res.data || []);
        setLoading(false);
    };

    const resetForm = () => {
        setForm({ name_fr: '', name_en: '', description_fr: '', parent_id: '', sort_order: 0 });
        setEditing(null);
        setAdding(false);
    };

    const handleEdit = (cat) => {
        setEditing(cat);
        setAdding(true);
        setForm({
            name_fr: cat.name_fr || cat.name || '',
            name_en: cat.name_en || '',
            description_fr: cat.description_fr || '',
            parent_id: cat.parent_id || '',
            sort_order: cat.sort_order || 0
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name_fr.trim()) {
            setToast({ message: 'Le nom FR est requis', type: 'error' });
            return;
        }

        const res = editing
            ? await api.put(`/elearning/categories/${editing.id}`, form, token)
            : await api.post('/elearning/categories', form, token);

        if (res.success) {
            setToast({ message: editing ? 'Catégorie modifiée' : 'Catégorie créée', type: 'success' });
            resetForm();
            fetchCategories();
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette catégorie ?')) {
            const res = await api.delete(`/elearning/categories/${id}`, token);
            if (res.success) {
                setToast({ message: 'Catégorie supprimée', type: 'success' });
                setCategories(prev => prev.filter(c => c.id !== id));
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    // Build hierarchy
    const rootCategories = categories.filter(c => !c.parent_id);
    const getChildren = (parentId) => categories.filter(c => c.parent_id === parentId);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    const renderCategory = (cat, depth = 0) => (
        <React.Fragment key={cat.id}>
            <tr>
                <td>
                    <div style={{ paddingLeft: `${depth * 24}px` }} className="d-flex align-items-center">
                        {depth > 0 && <i className="fas fa-level-up-alt fa-rotate-90 text-muted me-2" style={{ fontSize: '0.8rem' }}></i>}
                        <strong>{cat.name_fr || cat.name}</strong>
                    </div>
                </td>
                <td className="text-muted small">{cat.name_en || '-'}</td>
                <td className="text-muted small">{cat.description_fr || '-'}</td>
                <td>
                    <span className="badge bg-light text-dark">{cat.courses_count || 0}</span>
                </td>
                <td>{cat.sort_order || 0}</td>
                <td>
                    <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => handleEdit(cat)}>
                            <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => handleDelete(cat.id)}>
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            {getChildren(cat.id).map(child => renderCategory(child, depth + 1))}
        </React.Fragment>
    );

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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Catégories E-Learning</h2>
                    <p className="text-muted mb-0">{categories.length} catégories</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/elearning" className="btn btn-outline-secondary">
                        <i className="fas fa-arrow-left me-2"></i> Retour
                    </Link>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setAdding(true); }}
                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                        <i className="fas fa-plus me-2"></i> Nouvelle catégorie
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {adding && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className={`fas fa-${editing ? 'edit' : 'plus-circle'} me-2`} style={{ color: '#7ac142' }}></i>
                            {editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                        </h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label">Nom FR *</label>
                                    <input type="text" className="form-control" value={form.name_fr}
                                        onChange={(e) => setForm(prev => ({ ...prev, name_fr: e.target.value }))} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Nom EN</label>
                                    <input type="text" className="form-control" value={form.name_en}
                                        onChange={(e) => setForm(prev => ({ ...prev, name_en: e.target.value }))} />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Parent</label>
                                    <select className="form-select" value={form.parent_id}
                                        onChange={(e) => setForm(prev => ({ ...prev, parent_id: e.target.value }))}>
                                        <option value="">-- Racine --</option>
                                        {categories.filter(c => !editing || c.id !== editing.id).map(c => (
                                            <option key={c.id} value={c.id}>{c.name_fr || c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Ordre</label>
                                    <input type="number" className="form-control" value={form.sort_order}
                                        onChange={(e) => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Description FR</label>
                                    <textarea className="form-control" value={form.description_fr}
                                        onChange={(e) => setForm(prev => ({ ...prev, description_fr: e.target.value }))} rows={2} />
                                </div>
                                <div className="col-12">
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-success">
                                            <i className="fas fa-check me-1"></i> {editing ? 'Modifier' : 'Créer'}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Nom FR</th>
                                    <th>Nom EN</th>
                                    <th>Description</th>
                                    <th>Cours</th>
                                    <th>Ordre</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rootCategories.map(cat => renderCategory(cat))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            <i className="fas fa-tags fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0">Aucune catégorie</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ELearningCategories;
