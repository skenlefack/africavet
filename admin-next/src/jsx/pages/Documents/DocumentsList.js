import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const DocumentsList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [toast, setToast] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        fetchDocuments();
        fetchCategories();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchDocuments = async () => {
        const res = await api.get('/documents/admin/list?limit=5000', token);
        if (res.success) setDocuments(res.data || []);
        setLoading(false);
    };

    const fetchCategories = async () => {
        const res = await api.get('/documents/admin/categories', token);
        if (res.success) setCategories(res.data || []);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer definitivement ce document et son fichier ?')) {
            const res = await api.delete(`/documents/${id}`, token);
            if (res.success) {
                setToast({ message: 'Document supprime', type: 'success' });
                fetchDocuments();
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    const handleStatusChange = async (id, status) => {
        const res = await api.put(`/documents/${id}/status`, { status }, token);
        if (res.success) {
            setToast({ message: `Statut change en "${status}"`, type: 'success' });
            fetchDocuments();
        }
    };

    // Bulk actions
    const handleBulkAction = async (action) => {
        if (selectedIds.length === 0) return;
        if (action === 'delete' && !window.confirm(`Supprimer ${selectedIds.length} document(s) ?`)) return;

        let success = 0;
        for (const id of selectedIds) {
            let res;
            if (action === 'delete') {
                res = await api.delete(`/documents/${id}`, token);
            } else {
                res = await api.put(`/documents/${id}/status`, { status: action }, token);
            }
            if (res.success) success++;
        }

        setToast({ message: `${success} document(s) traite(s)`, type: 'success' });
        setSelectedIds([]);
        fetchDocuments();
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedDocs.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedDocs.map(d => d.id));
        }
    };

    // Filtering
    const filteredDocs = documents.filter(doc => {
        const title = ((doc.title_fr || '') + ' ' + (doc.title_en || '') + ' ' + (doc.author || '')).toLowerCase();
        const matchesSearch = !searchQuery || title.includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || doc.category_id === parseInt(categoryFilter);
        const matchesType = typeFilter === 'all' || doc.file_type === typeFilter;
        return matchesSearch && matchesStatus && matchesCategory && matchesType;
    });

    // Pagination
    const totalItems = filteredDocs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDocs = filteredDocs.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, categoryFilter, typeFilter, itemsPerPage]);

    // Counters
    const publishedCount = documents.filter(d => d.status === 'published').length;
    const draftCount = documents.filter(d => d.status === 'draft').length;
    const archivedCount = documents.filter(d => d.status === 'archived').length;

    // Unique file types
    const fileTypes = [...new Set(documents.map(d => d.file_type).filter(Boolean))].sort();

    const getStatusBadge = (status) => {
        const badges = {
            published: { class: 'bg-success', label: 'Publie' },
            draft: { class: 'bg-warning text-dark', label: 'Brouillon' },
            archived: { class: 'bg-secondary', label: 'Archive' }
        };
        return badges[status] || { class: 'bg-secondary', label: status };
    };

    const getFileIcon = (type) => {
        const icons = {
            pdf: 'file-pdf', doc: 'file-word', docx: 'file-word',
            xls: 'file-excel', xlsx: 'file-excel',
            ppt: 'file-powerpoint', pptx: 'file-powerpoint',
            zip: 'file-archive', rar: 'file-archive',
            jpg: 'file-image', jpeg: 'file-image', png: 'file-image', gif: 'file-image', webp: 'file-image'
        };
        return icons[type?.toLowerCase()] || 'file';
    };

    const formatSize = (bytes) => {
        if (!bytes) return '-';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' Mo';
        if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' Ko';
        return bytes + ' o';
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

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Documents</h2>
                    <p className="text-muted mb-0">{documents.length} documents au total</p>
                </div>
                <Link to="/documents/new" className="btn btn-primary" style={{
                    background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none'
                }}>
                    <i className="fas fa-plus me-2"></i> Ajouter un document
                </Link>
            </div>

            {/* Status filter buttons */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="d-flex flex-wrap gap-2">
                        <button
                            className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setStatusFilter('all')}
                            style={statusFilter === 'all' ? { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' } : {}}
                        >
                            <i className="fas fa-layer-group me-1"></i> Tous ({documents.length})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'published' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setStatusFilter('published')}
                        >
                            <i className="fas fa-check-circle me-1"></i> Publies ({publishedCount})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'draft' ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => setStatusFilter('draft')}
                        >
                            <i className="fas fa-edit me-1"></i> Brouillons ({draftCount})
                        </button>
                        <button
                            className={`btn btn-sm ${statusFilter === 'archived' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                            onClick={() => setStatusFilter('archived')}
                        >
                            <i className="fas fa-archive me-1"></i> Archives ({archivedCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and filters */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Rechercher un document..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearchQuery('')}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                <option value="all">Toutes les categories</option>
                                {categories.filter(c => !c.parent_id).map(c => (
                                    <React.Fragment key={c.id}>
                                        <option value={c.id}>{c.name_fr}</option>
                                        {categories.filter(sub => sub.parent_id === c.id).map(sub => (
                                            <option key={sub.id} value={sub.id}>&nbsp;&nbsp;&nbsp;&nbsp;{sub.name_fr}</option>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                                <option value="all">Tous types</option>
                                {fileTypes.map(t => (
                                    <option key={t} value={t}>{t.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 text-end">
                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                {filteredDocs.length} resultat{filteredDocs.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk actions */}
            {selectedIds.length > 0 && (
                <div className="card mb-3">
                    <div className="card-body py-2">
                        <div className="d-flex align-items-center gap-3">
                            <span className="fw-semibold">{selectedIds.length} selectionne(s)</span>
                            <button className="btn btn-sm btn-success" onClick={() => handleBulkAction('published')}>
                                <i className="fas fa-check me-1"></i> Publier
                            </button>
                            <button className="btn btn-sm btn-secondary" onClick={() => handleBulkAction('archived')}>
                                <i className="fas fa-archive me-1"></i> Archiver
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleBulkAction('delete')}>
                                <i className="fas fa-trash me-1"></i> Supprimer
                            </button>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedIds([])}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document table */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={paginatedDocs.length > 0 && selectedIds.length === paginatedDocs.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th>Titre</th>
                                    <th>Categorie</th>
                                    <th>Type</th>
                                    <th>Taille</th>
                                    <th className="text-center">Telechargements</th>
                                    <th>Statut</th>
                                    <th>Date</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDocs.length > 0 ? (
                                    paginatedDocs.map(doc => (
                                        <tr key={doc.id} className="align-middle">
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={selectedIds.includes(doc.id)}
                                                    onChange={() => toggleSelect(doc.id)}
                                                />
                                            </td>
                                            <td>
                                                <div style={{ maxWidth: '250px' }}>
                                                    <Link to={`/documents/view/${doc.id}`} className="text-decoration-none fw-semibold" style={{ fontSize: '0.9rem' }}>
                                                        {doc.title_fr}
                                                    </Link>
                                                    {doc.country_code && (
                                                        <small className="d-block text-muted">
                                                            <i className="fas fa-globe-africa me-1"></i>{doc.country_code}
                                                        </small>
                                                    )}
                                                    {doc.is_featured === 1 && (
                                                        <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>
                                                            <i className="fas fa-star me-1"></i>Vedette
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {doc.category_name_fr ? (
                                                    <span className="badge" style={{ background: '#e3f2fd', color: '#1976d2', fontWeight: '500' }}>
                                                        {doc.category_name_fr}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="text-muted">
                                                    <i className={`fas fa-${getFileIcon(doc.file_type)} me-1`}></i>
                                                    {(doc.file_type || '').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                {formatSize(doc.file_size)}
                                            </td>
                                            <td className="text-center fw-semibold">
                                                {doc.download_count || 0}
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(doc.status).class}`}>
                                                    {getStatusBadge(doc.status).label}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.85rem' }} className="text-muted">
                                                {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="text-end">
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-info"
                                                        onClick={() => navigate(`/documents/view/${doc.id}`)}
                                                        title="Voir"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => navigate(`/documents/edit/${doc.id}`)}
                                                        title="Modifier"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    {doc.status !== 'published' ? (
                                                        <button
                                                            className="btn btn-outline-success"
                                                            onClick={() => handleStatusChange(doc.id, 'published')}
                                                            title="Publier"
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => handleStatusChange(doc.id, 'archived')}
                                                            title="Archiver"
                                                        >
                                                            <i className="fas fa-archive"></i>
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleDelete(doc.id)}
                                                        title="Supprimer"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center text-muted py-5">
                                            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || typeFilter !== 'all' ? (
                                                <>
                                                    <i className="fas fa-search fa-3x mb-3 opacity-50"></i>
                                                    <p className="mb-2">Aucun document trouve</p>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setStatusFilter('all');
                                                            setCategoryFilter('all');
                                                            setTypeFilter('all');
                                                        }}
                                                    >
                                                        Reinitialiser les filtres
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-file-alt fa-3x mb-3 opacity-50"></i>
                                                    <p className="mb-2">Aucun document</p>
                                                    <Link to="/documents/new" className="btn btn-primary">
                                                        Ajouter un document
                                                    </Link>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {totalItems > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        itemName="documents"
                        itemsPerPageOptions={[10, 25, 50, 100]}
                    />
                )}
            </div>
        </>
    );
};

export default DocumentsList;
