import React, { useState, useEffect, useRef } from 'react';
import { api, getToken } from '../../../services/api';

const MediaLibrary = () => {
    const token = getToken();
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef(null);

    const fetchMedia = async () => {
        const res = await api.get('/media', token);
        if (res.success) setMedia(res.data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchMedia();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);

            const res = await api.upload('/media/upload', formData, token);
            if (res.success) {
                setToast({ message: `${files[i].name} uploadé`, type: 'success' });
            } else {
                setToast({ message: `Erreur: ${files[i].name}`, type: 'error' });
            }
        }

        setUploading(false);
        fetchMedia();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce fichier ?')) {
            const res = await api.delete(`/media/${id}`, token);
            if (res.success) {
                setToast({ message: 'Fichier supprimé', type: 'success' });
                setSelectedMedia(null);
                fetchMedia();
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        setToast({ message: 'URL copiée!', type: 'success' });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isImage = (url) => {
        return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
    };

    const filteredMedia = media.filter(item => {
        const name = (item.filename || item.original_name || '').toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

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
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Médiathèque</h2>
                    <p className="text-muted mb-0">{media.length} fichiers</p>
                </div>
                <div className="d-flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                        style={{ display: 'none' }}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        style={{
                            background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                            border: 'none'
                        }}
                    >
                        {uploading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Upload...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-upload me-2"></i> Upload
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text"><i className="fas fa-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 text-end">
                            <div className="btn-group">
                                <button
                                    className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <i className="fas fa-th"></i>
                                </button>
                                <button
                                    className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <i className="fas fa-list"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Media Grid/List */}
                <div className={selectedMedia ? 'col-lg-8' : 'col-12'}>
                    {viewMode === 'grid' ? (
                        <div className="row g-3">
                            {filteredMedia.map((item) => (
                                <div key={item.id} className="col-6 col-md-4 col-lg-3">
                                    <div
                                        className={`card h-100 ${selectedMedia?.id === item.id ? 'border-primary' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedMedia(item)}
                                    >
                                        <div className="card-body p-2">
                                            {isImage(item.url) ? (
                                                <img
                                                    src={item.url}
                                                    alt={item.filename}
                                                    className="img-fluid rounded"
                                                    style={{ aspectRatio: '1', objectFit: 'cover', width: '100%' }}
                                                />
                                            ) : (
                                                <div
                                                    className="bg-light rounded d-flex align-items-center justify-content-center"
                                                    style={{ aspectRatio: '1' }}
                                                >
                                                    <i className="fas fa-file fa-3x text-muted"></i>
                                                </div>
                                            )}
                                            <p className="small text-truncate mt-2 mb-0">
                                                {item.original_name || item.filename}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Nom</th>
                                            <th>Type</th>
                                            <th>Taille</th>
                                            <th>Date</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMedia.map((item) => (
                                            <tr
                                                key={item.id}
                                                className={selectedMedia?.id === item.id ? 'table-primary' : ''}
                                                onClick={() => setSelectedMedia(item)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td style={{ width: '60px' }}>
                                                    {isImage(item.url) ? (
                                                        <img
                                                            src={item.url}
                                                            alt=""
                                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                                        />
                                                    ) : (
                                                        <i className="fas fa-file fa-2x text-muted"></i>
                                                    )}
                                                </td>
                                                <td>{item.original_name || item.filename}</td>
                                                <td><small>{item.mime_type}</small></td>
                                                <td><small>{formatFileSize(item.size)}</small></td>
                                                <td><small>{new Date(item.created_at).toLocaleDateString('fr-FR')}</small></td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {filteredMedia.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-images fa-3x mb-3"></i>
                            <p>Aucun fichier trouvé</p>
                        </div>
                    )}
                </div>

                {/* Sidebar - Selected Media Details */}
                {selectedMedia && (
                    <div className="col-lg-4">
                        <div className="card sticky-top" style={{ top: '100px' }}>
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Détails</h5>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setSelectedMedia(null)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="card-body">
                                {isImage(selectedMedia.url) && (
                                    <img
                                        src={selectedMedia.url}
                                        alt={selectedMedia.filename}
                                        className="img-fluid rounded mb-3"
                                    />
                                )}
                                <dl className="mb-0">
                                    <dt>Nom</dt>
                                    <dd className="text-break">{selectedMedia.original_name || selectedMedia.filename}</dd>

                                    <dt>Type</dt>
                                    <dd>{selectedMedia.mime_type}</dd>

                                    <dt>Taille</dt>
                                    <dd>{formatFileSize(selectedMedia.size)}</dd>

                                    <dt>Date</dt>
                                    <dd>{new Date(selectedMedia.created_at).toLocaleString('fr-FR')}</dd>

                                    <dt>URL</dt>
                                    <dd>
                                        <div className="input-group input-group-sm">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={selectedMedia.url}
                                                readOnly
                                            />
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={() => copyToClipboard(selectedMedia.url)}
                                            >
                                                <i className="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </dd>
                                </dl>
                                <div className="d-grid gap-2 mt-3">
                                    <a
                                        href={selectedMedia.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        <i className="fas fa-external-link-alt me-2"></i> Ouvrir
                                    </a>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDelete(selectedMedia.id)}
                                    >
                                        <i className="fas fa-trash me-2"></i> Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MediaLibrary;
