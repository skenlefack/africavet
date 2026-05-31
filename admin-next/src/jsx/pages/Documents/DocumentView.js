import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken, API_BASE_URL } from '../../../services/api';

const DocumentView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const [loading, setLoading] = useState(true);
    const [doc, setDoc] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchDocument();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchDocument = async () => {
        const res = await api.get(`/documents/${id}`, token);
        if (res.success) {
            setDoc(res.data);
        } else {
            setToast({ message: 'Document non trouve', type: 'error' });
        }
        setLoading(false);
    };

    const handleStatusChange = async (status) => {
        const res = await api.put(`/documents/${id}/status`, { status }, token);
        if (res.success) {
            setToast({ message: `Statut change en "${status}"`, type: 'success' });
            fetchDocument();
        }
    };

    const handleToggleFeatured = async () => {
        const res = await api.put(`/documents/${id}/featured`, {}, token);
        if (res.success) {
            setToast({ message: res.message, type: 'success' });
            fetchDocument();
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Supprimer definitivement ce document et son fichier ?')) {
            const res = await api.delete(`/documents/${id}`, token);
            if (res.success) {
                setToast({ message: 'Document supprime', type: 'success' });
                setTimeout(() => navigate('/documents/list'), 1000);
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '-';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' Mo';
        if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' Ko';
        return bytes + ' o';
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

    const getStatusBadge = (status) => {
        const badges = {
            published: { class: 'bg-success', label: 'Publie' },
            draft: { class: 'bg-warning text-dark', label: 'Brouillon' },
            archived: { class: 'bg-secondary', label: 'Archive' }
        };
        return badges[status] || { class: 'bg-secondary', label: status };
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

    if (!doc) {
        return (
            <div className="text-center py-5">
                <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4>Document non trouve</h4>
                <Link to="/documents/list" className="btn btn-primary mt-3">
                    Retour a la liste
                </Link>
            </div>
        );
    }

    const downloadUrl = `${API_BASE_URL.replace('/api', '')}/api/documents/${doc.id}/download`;

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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>{doc.title_fr}</h2>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link to="/documents/list">Documents</Link></li>
                            <li className="breadcrumb-item active">Details</li>
                        </ol>
                    </nav>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/documents/list')}>
                        <i className="fas fa-arrow-left me-2"></i> Retour
                    </button>
                    <button className="btn btn-outline-primary" onClick={() => navigate(`/documents/edit/${doc.id}`)}>
                        <i className="fas fa-edit me-2"></i> Modifier
                    </button>
                    <a
                        href={downloadUrl}
                        className="btn btn-primary"
                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="fas fa-download me-2"></i> Telecharger
                    </a>
                </div>
            </div>

            <div className="row">
                {/* Main content */}
                <div className="col-lg-8">
                    {/* File Preview */}
                    {doc.file_type === 'pdf' && doc.file_path && (
                        <div className="card mb-4">
                            <div className="card-header bg-white">
                                <h6 className="mb-0"><i className="fas fa-eye me-2"></i> Apercu du document</h6>
                            </div>
                            <div className="card-body p-0">
                                <iframe
                                    src={`${API_BASE_URL.replace('/api', '')}${doc.file_path}`}
                                    width="100%"
                                    height="500px"
                                    style={{ border: 'none' }}
                                    title="Document Preview"
                                />
                            </div>
                        </div>
                    )}

                    {/* Non-PDF file info */}
                    {doc.file_type !== 'pdf' && (
                        <div className="card mb-4">
                            <div className="card-body text-center py-5">
                                <i className={`fas fa-${getFileIcon(doc.file_type)} fa-5x mb-3`} style={{ color: '#354e84' }}></i>
                                <h5>{doc.file_name}</h5>
                                <p className="text-muted">
                                    {(doc.file_type || '').toUpperCase()} - {formatSize(doc.file_size)}
                                </p>
                                <a
                                    href={downloadUrl}
                                    className="btn btn-primary"
                                    style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <i className="fas fa-download me-2"></i> Telecharger le fichier
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {(doc.description_fr || doc.description_en) && (
                        <div className="card mb-4">
                            <div className="card-header bg-white">
                                <h6 className="mb-0"><i className="fas fa-align-left me-2"></i> Description</h6>
                            </div>
                            <div className="card-body">
                                {doc.description_fr && (
                                    <div className="mb-3">
                                        <span className="badge bg-primary mb-2">FR</span>
                                        <p style={{ whiteSpace: 'pre-wrap' }}>{doc.description_fr}</p>
                                    </div>
                                )}
                                {doc.description_en && (
                                    <div>
                                        <span className="badge bg-info mb-2">EN</span>
                                        <p style={{ whiteSpace: 'pre-wrap' }}>{doc.description_en}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Related documents */}
                    {doc.related?.length > 0 && (
                        <div className="card mb-4">
                            <div className="card-header bg-white">
                                <h6 className="mb-0"><i className="fas fa-link me-2"></i> Documents similaires</h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <tbody>
                                            {doc.related.map(rel => (
                                                <tr key={rel.id} className="align-middle">
                                                    <td>
                                                        <Link to={`/documents/view/${rel.id}`} className="text-decoration-none">
                                                            <i className={`fas fa-${getFileIcon(rel.file_type)} me-2`}></i>
                                                            {rel.title_fr}
                                                        </Link>
                                                    </td>
                                                    <td className="text-muted">{formatSize(rel.file_size)}</td>
                                                    <td className="text-end text-muted">
                                                        <i className="fas fa-download me-1"></i>{rel.download_count || 0}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Status & Actions */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0">Statut & Actions</h6>
                        </div>
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <span>Statut</span>
                                <span className={`badge ${getStatusBadge(doc.status).class}`}>
                                    {getStatusBadge(doc.status).label}
                                </span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <span>Vedette</span>
                                <button
                                    className={`btn btn-sm ${doc.is_featured ? 'btn-warning' : 'btn-outline-secondary'}`}
                                    onClick={handleToggleFeatured}
                                >
                                    <i className="fas fa-star me-1"></i>
                                    {doc.is_featured ? 'Oui' : 'Non'}
                                </button>
                            </div>
                            <hr />
                            <div className="d-grid gap-2">
                                {doc.status !== 'published' && (
                                    <button className="btn btn-success btn-sm" onClick={() => handleStatusChange('published')}>
                                        <i className="fas fa-check me-2"></i> Publier
                                    </button>
                                )}
                                {doc.status !== 'draft' && (
                                    <button className="btn btn-outline-warning btn-sm" onClick={() => handleStatusChange('draft')}>
                                        <i className="fas fa-edit me-2"></i> Remettre en brouillon
                                    </button>
                                )}
                                {doc.status !== 'archived' && (
                                    <button className="btn btn-outline-secondary btn-sm" onClick={() => handleStatusChange('archived')}>
                                        <i className="fas fa-archive me-2"></i> Archiver
                                    </button>
                                )}
                                <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>
                                    <i className="fas fa-trash me-2"></i> Supprimer
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-info-circle me-2"></i> Informations</h6>
                        </div>
                        <div className="card-body">
                            <table className="table table-sm table-borderless mb-0">
                                <tbody>
                                    <tr>
                                        <td className="text-muted">Fichier</td>
                                        <td className="fw-semibold">{doc.file_name}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Type</td>
                                        <td>
                                            <i className={`fas fa-${getFileIcon(doc.file_type)} me-1`}></i>
                                            {(doc.file_type || '').toUpperCase()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Taille</td>
                                        <td>{formatSize(doc.file_size)}</td>
                                    </tr>
                                    {doc.category_name_fr && (
                                        <tr>
                                            <td className="text-muted">Categorie</td>
                                            <td>
                                                <span className="badge" style={{ background: (doc.category_color || '#354e84') + '20', color: doc.category_color || '#354e84' }}>
                                                    <i className={`fas ${doc.category_icon || 'fa-folder'} me-1`}></i>
                                                    {doc.category_name_fr}
                                                </span>
                                            </td>
                                        </tr>
                                    )}
                                    {doc.country_code && (
                                        <tr>
                                            <td className="text-muted">Pays</td>
                                            <td><i className="fas fa-globe-africa me-1"></i> {doc.country_code}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="text-muted">Langue</td>
                                        <td>{({ fr: 'Francais', en: 'Anglais', ar: 'Arabe', pt: 'Portugais', sw: 'Swahili' })[doc.language] || doc.language}</td>
                                    </tr>
                                    {doc.year_published && (
                                        <tr>
                                            <td className="text-muted">Annee</td>
                                            <td>{doc.year_published}</td>
                                        </tr>
                                    )}
                                    {doc.author && (
                                        <tr>
                                            <td className="text-muted">Auteur</td>
                                            <td>{doc.author}</td>
                                        </tr>
                                    )}
                                    {doc.source_url && (
                                        <tr>
                                            <td className="text-muted">Source</td>
                                            <td>
                                                <a href={doc.source_url} target="_blank" rel="noopener noreferrer" className="text-truncate d-block" style={{ maxWidth: '200px' }}>
                                                    {doc.source_url}
                                                </a>
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="text-muted">Ajoute par</td>
                                        <td>{doc.uploaded_by_username || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Cree le</td>
                                        <td>{new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Modifie le</td>
                                        <td>{new Date(doc.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Download stats */}
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0"><i className="fas fa-chart-line me-2"></i> Statistiques</h6>
                        </div>
                        <div className="card-body text-center">
                            <h2 className="fw-bold mb-0" style={{ color: '#7ac142' }}>{doc.download_count || 0}</h2>
                            <p className="text-muted">telechargements au total</p>
                        </div>
                    </div>

                    {/* Tags */}
                    {doc.tags && (
                        <div className="card">
                            <div className="card-header bg-white">
                                <h6 className="mb-0"><i className="fas fa-tags me-2"></i> Tags</h6>
                            </div>
                            <div className="card-body">
                                <div className="d-flex flex-wrap gap-2">
                                    {(Array.isArray(doc.tags) ? doc.tags : JSON.parse(doc.tags || '[]')).map((tag, i) => (
                                        <span key={i} className="badge bg-light text-dark">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DocumentView;
