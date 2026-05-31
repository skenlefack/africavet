import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api, getToken, API_BASE_URL } from '../../../services/api';

const MediaLibrary = () => {
    const token = getToken();
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [sourceMode, setSourceMode] = useState('files'); // 'db' or 'files'
    const [searchQuery, setSearchQuery] = useState('');
    const [folderFilter, setFolderFilter] = useState('');
    const [folders, setFolders] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 0 });
    const fileInputRef = useRef(null);
    const LIMIT = 40;

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            if (sourceMode === 'files') {
                const params = new URLSearchParams({ page, limit: LIMIT });
                if (searchQuery) params.append('search', searchQuery);
                if (folderFilter) params.append('folder', folderFilter);
                const res = await api.get(`/media/scan?${params}`, token);
                if (res.success) {
                    setMedia(res.data || []);
                    setPagination(res.pagination || {});
                    if (res.folders) setFolders(res.folders);
                }
            } else {
                const params = new URLSearchParams({ page, limit: LIMIT });
                if (searchQuery) params.append('search', searchQuery);
                const res = await api.get(`/media?${params}`, token);
                if (res.success) {
                    setMedia(res.data || []);
                    setPagination(res.pagination || {});
                }
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }, [sourceMode, page, searchQuery, folderFilter, token]);

    useEffect(() => { fetchMedia(); }, [fetchMedia]);
    useEffect(() => { setPage(1); }, [sourceMode, searchQuery, folderFilter]);

    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        let ok = 0;
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('files', files[i]);
            const res = await api.upload('/media/upload', formData, token);
            if (res.success) ok++;
            else setToast({ message: `Erreur: ${files[i].name}`, type: 'error' });
        }
        if (ok > 0) setToast({ message: `${ok} fichier(s) uploadé(s)`, type: 'success' });
        setUploading(false);
        fetchMedia();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce fichier ?')) return;
        const res = await api.delete(`/media/${id}`, token);
        if (res.success) {
            setToast({ message: 'Fichier supprimé', type: 'success' });
            setSelectedMedia(null);
            fetchMedia();
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
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

    const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url || '');

    const getImageSrc = (item) => {
        const url = item.url || '';
        if (url.startsWith('http')) return url;
        const base = API_BASE_URL.replace(/\/api\/?$/, '');
        return `${base}${url}`;
    };

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    return (
        <>
            {/* Toast */}
            {toast && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                     style={{ top: '20px', right: '20px', zIndex: 9999 }}>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)} />
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>
                        <i className="fas fa-images me-2" style={{ color: '#7ac142' }}></i>
                        Médiathèque
                    </h2>
                    <p className="text-muted mb-0">
                        {pagination.total || 0} fichiers
                        {sourceMode === 'files' ? ' (sur le serveur)' : ' (en base de données)'}
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleUpload} multiple
                           accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx" style={{ display: 'none' }} />
                    <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                        {uploading ? (
                            <><span className="spinner-border spinner-border-sm me-2" /> Upload...</>
                        ) : (
                            <><i className="fas fa-upload me-2" /> Upload</>
                        )}
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="row align-items-center g-2">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text"><i className="fas fa-search"></i></span>
                                <input type="text" className="form-control" placeholder="Rechercher..."
                                       value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-3">
                            {sourceMode === 'files' && folders.length > 0 && (
                                <select className="form-select" value={folderFilter}
                                        onChange={(e) => setFolderFilter(e.target.value)}>
                                    <option value="">Tous les dossiers</option>
                                    {folders.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            )}
                        </div>
                        <div className="col-md-5 text-end d-flex justify-content-end gap-2">
                            {/* Source toggle */}
                            <div className="btn-group">
                                <button className={`btn btn-sm ${sourceMode === 'files' ? 'btn-success' : 'btn-outline-secondary'}`}
                                        onClick={() => setSourceMode('files')} title="Tous les fichiers du serveur">
                                    <i className="fas fa-hdd me-1"></i> Fichiers
                                </button>
                                <button className={`btn btn-sm ${sourceMode === 'db' ? 'btn-success' : 'btn-outline-secondary'}`}
                                        onClick={() => setSourceMode('db')} title="Fichiers enregistrés en base">
                                    <i className="fas fa-database me-1"></i> Base
                                </button>
                            </div>
                            {/* View toggle */}
                            <div className="btn-group">
                                <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setViewMode('grid')}>
                                    <i className="fas fa-th"></i>
                                </button>
                                <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setViewMode('list')}>
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
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="row g-3">
                            {media.map((item, idx) => (
                                <div key={item.id || idx} className="col-6 col-md-4 col-lg-3">
                                    <div className={`card h-100 ${selectedMedia?.url === item.url ? 'border-primary shadow' : ''}`}
                                         style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                         onClick={() => setSelectedMedia(item)}>
                                        <div className="card-body p-2">
                                            {isImage(item.url) ? (
                                                <img src={getImageSrc(item)} alt={item.filename}
                                                     className="img-fluid rounded"
                                                     style={{ aspectRatio: '1', objectFit: 'cover', width: '100%' }}
                                                     onError={(e) => { e.target.style.display = 'none'; }} />
                                            ) : (
                                                <div className="bg-light rounded d-flex align-items-center justify-content-center"
                                                     style={{ aspectRatio: '1' }}>
                                                    <i className="fas fa-file fa-3x text-muted"></i>
                                                </div>
                                            )}
                                            <p className="small text-truncate mt-2 mb-0"
                                               title={item.original_name || item.filename}>
                                                {item.original_name || item.filename}
                                            </p>
                                            {item.folder && item.folder !== 'root' && (
                                                <span className="badge bg-light text-secondary" style={{ fontSize: '10px' }}>
                                                    {item.folder}
                                                </span>
                                            )}
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
                                            <th style={{ width: 60 }}></th>
                                            <th>Nom</th>
                                            <th>Dossier</th>
                                            <th>Taille</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {media.map((item, idx) => (
                                            <tr key={item.id || idx}
                                                className={selectedMedia?.url === item.url ? 'table-primary' : ''}
                                                onClick={() => setSelectedMedia(item)} style={{ cursor: 'pointer' }}>
                                                <td>
                                                    {isImage(item.url) ? (
                                                        <img src={getImageSrc(item)} alt=""
                                                             style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                                             onError={(e) => { e.target.style.display = 'none'; }} />
                                                    ) : (
                                                        <i className="fas fa-file fa-2x text-muted"></i>
                                                    )}
                                                </td>
                                                <td className="text-truncate" style={{ maxWidth: 250 }}>
                                                    {item.original_name || item.filename}
                                                </td>
                                                <td><small className="text-muted">{item.folder || '-'}</small></td>
                                                <td><small>{formatFileSize(item.size)}</small></td>
                                                <td><small>{new Date(item.created_at).toLocaleDateString('fr-FR')}</small></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {!loading && media.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-images fa-3x mb-3"></i>
                            <p>Aucun fichier trouvé</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <nav className="mt-4 d-flex justify-content-center">
                            <ul className="pagination">
                                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                </li>
                                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                                    let p;
                                    if (pagination.pages <= 7) p = i + 1;
                                    else if (page <= 4) p = i + 1;
                                    else if (page >= pagination.pages - 3) p = pagination.pages - 6 + i;
                                    else p = page - 3 + i;
                                    return (
                                        <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                                        </li>
                                    );
                                })}
                                <li className={`page-item ${page >= pagination.pages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}>
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>

                {/* Sidebar - Selected Media Details */}
                {selectedMedia && (
                    <div className="col-lg-4">
                        <div className="card sticky-top" style={{ top: '100px' }}>
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Détails</h5>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedMedia(null)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="card-body">
                                {isImage(selectedMedia.url) && (
                                    <img src={getImageSrc(selectedMedia)} alt={selectedMedia.filename}
                                         className="img-fluid rounded mb-3"
                                         onError={(e) => { e.target.src = ''; e.target.alt = 'Image non disponible'; }} />
                                )}
                                <dl className="mb-0">
                                    <dt>Nom</dt>
                                    <dd className="text-break">{selectedMedia.original_name || selectedMedia.filename}</dd>
                                    {selectedMedia.folder && (
                                        <><dt>Dossier</dt><dd>{selectedMedia.folder}</dd></>
                                    )}
                                    <dt>Type</dt>
                                    <dd>{selectedMedia.mime_type}</dd>
                                    <dt>Taille</dt>
                                    <dd>{formatFileSize(selectedMedia.size)}</dd>
                                    <dt>Date</dt>
                                    <dd>{new Date(selectedMedia.created_at).toLocaleString('fr-FR')}</dd>
                                    <dt>URL</dt>
                                    <dd>
                                        <div className="input-group input-group-sm">
                                            <input type="text" className="form-control" value={selectedMedia.url} readOnly />
                                            <button className="btn btn-outline-secondary"
                                                    onClick={() => copyToClipboard(selectedMedia.url)}>
                                                <i className="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </dd>
                                </dl>
                                <div className="d-grid gap-2 mt-3">
                                    <a href={getImageSrc(selectedMedia)} target="_blank" rel="noopener noreferrer"
                                       className="btn btn-outline-primary btn-sm">
                                        <i className="fas fa-external-link-alt me-2"></i> Ouvrir
                                    </a>
                                    {sourceMode === 'db' && selectedMedia.id && (
                                        <button className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDelete(selectedMedia.id)}>
                                            <i className="fas fa-trash me-2"></i> Supprimer
                                        </button>
                                    )}
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
