import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const STATUS_BADGES = {
    pending: { label: 'En attente', bg: 'warning', icon: 'clock' },
    approved: { label: 'Approuvé', bg: 'success', icon: 'check-circle' },
    rejected: { label: 'Rejeté', bg: 'danger', icon: 'times-circle' },
    revision_requested: { label: 'Révision demandée', bg: 'info', icon: 'redo' },
};

const STEP_LABELS = {
    draft: 'Brouillon', submitted: 'Soumis', fact_check: 'Vérification des faits',
    scientific_review: 'Relecture scientifique', editorial_review: 'Relecture éditoriale',
    seo_check: 'Vérification SEO', approved: 'Approuvé', rejected: 'Rejeté',
    in_review: 'En révision', revision_requested: 'Révision demandée', published: 'Publié',
};

const PostReviewHistory = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionNote, setActionNote] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchReviews(); }, [id]);

    const fetchReviews = async () => {
        setLoading(true);
        const token = getToken();
        const res = await api.get(`/post-workflow/${id}/reviews`, token);
        if (res.success) setData(res.data);
        setLoading(false);
    };

    const handleAction = async (action) => {
        if (action === 'reject' && !actionNote.trim()) {
            setToast({ type: 'danger', message: 'Motif de rejet obligatoire' });
            setTimeout(() => setToast(null), 3000);
            return;
        }
        const token = getToken();
        const res = await api.post(`/post-workflow/${id}/${action}`, { notes: actionNote }, token);
        if (res.success) {
            setToast({ type: 'success', message: res.message });
            setActionNote('');
            fetchReviews();
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
        setTimeout(() => setToast(null), 3000);
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
    if (!data) return <div className="text-center py-5 text-muted">Données introuvables</div>;

    const { post, reviews, current_status } = data;
    const statusInfo = STATUS_BADGES[current_status] || { label: STEP_LABELS[current_status] || current_status, bg: 'secondary', icon: 'circle' };

    return (
        <div className="row">
            {toast && (
                <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
                    <div className={`alert alert-${toast.type} alert-dismissible shadow`}>
                        {toast.message}
                        <button type="button" className="btn-close" onClick={() => setToast(null)} />
                    </div>
                </div>
            )}

            <div className="col-12 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                        <i className="fas fa-history me-2" style={{ color: '#354e84' }}></i>
                        Historique des revues
                    </h4>
                    <Link to="/posts" className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-arrow-left me-1"></i>Retour
                    </Link>
                </div>
            </div>

            {/* Current status */}
            <div className="col-12 mb-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-body d-flex align-items-center gap-3">
                        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, #7ac142, #354e84)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
                            <i className={`fas fa-${statusInfo.icon}`}></i>
                        </div>
                        <div className="flex-grow-1">
                            <h5 className="mb-1">{post?.title_fr || `Article #${id}`}</h5>
                            <span className={`badge bg-${statusInfo.bg}`}>{statusInfo.label}</span>
                        </div>
                        <Link to={`/posts/${id}`} className="btn btn-outline-primary btn-sm">
                            <i className="fas fa-edit me-1"></i>Éditer
                        </Link>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="col-md-8">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0">
                        <h5 className="mb-0"><i className="fas fa-stream me-2 text-primary"></i>Historique ({reviews.length})</h5>
                    </div>
                    <div className="card-body">
                        {reviews.length === 0 ? (
                            <p className="text-muted text-center py-3">Aucune revue pour cet article</p>
                        ) : (
                            <div style={{ position: 'relative', paddingLeft: 30 }}>
                                <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: '#e9ecef' }} />
                                {reviews.map((review, idx) => {
                                    const rStatus = STATUS_BADGES[review.status] || { label: review.status, bg: 'secondary', icon: 'circle' };
                                    return (
                                        <div key={review.id} className="mb-4" style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: -22, top: 4, width: 16, height: 16, borderRadius: '50%', border: '2px solid #fff', zIndex: 1 }}
                                                className={`bg-${rStatus.bg}`} />
                                            <div className="card border-0" style={{ background: '#f8f9fa' }}>
                                                <div className="card-body py-2 px-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <div>
                                                            <strong className="me-2">{review.reviewer_name || 'Système'}</strong>
                                                            <span className={`badge bg-${rStatus.bg} me-1`} style={{ fontSize: '0.7rem' }}>{rStatus.label}</span>
                                                            <span className="badge bg-light text-dark" style={{ fontSize: '0.7rem' }}>
                                                                {STEP_LABELS[review.step] || review.step}
                                                            </span>
                                                            {review.validation_level && (
                                                                <span className="badge bg-info ms-1" style={{ fontSize: '0.65rem' }}>{review.validation_level}</span>
                                                            )}
                                                        </div>
                                                        <small className="text-muted">
                                                            {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </small>
                                                    </div>
                                                    {review.notes && <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>{review.notes}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0">
                        <h5 className="mb-0"><i className="fas fa-cogs me-2 text-primary"></i>Actions</h5>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label">Note / commentaire</label>
                            <textarea className="form-control" rows={3} value={actionNote}
                                onChange={e => setActionNote(e.target.value)}
                                placeholder="Ajouter une note..." />
                        </div>

                        {current_status === 'draft' && (
                            <button className="btn btn-primary w-100 mb-2" onClick={() => handleAction('submit')}>
                                <i className="fas fa-paper-plane me-1"></i>Soumettre pour revue
                            </button>
                        )}
                        {['submitted', 'in_review'].includes(current_status) && (
                            <>
                                <button className="btn btn-success w-100 mb-2" onClick={() => handleAction('approve')}>
                                    <i className="fas fa-check me-1"></i>Approuver
                                </button>
                                <button className="btn btn-danger w-100 mb-2" onClick={() => handleAction('reject')}>
                                    <i className="fas fa-times me-1"></i>Rejeter
                                </button>
                            </>
                        )}
                        {current_status === 'rejected' && (
                            <button className="btn btn-warning w-100 mb-2" onClick={() => handleAction('submit')}>
                                <i className="fas fa-redo me-1"></i>Resoumettre
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostReviewHistory;
