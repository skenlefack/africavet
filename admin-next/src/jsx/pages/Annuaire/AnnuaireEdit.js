import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import AnnuaireForm from './AnnuaireForm';

const AnnuaireEdit = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = getToken();

    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchEntry();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchEntry = async () => {
        setLoading(true);

        // Try the type from query params first
        const typeHint = searchParams.get('type');

        if (typeHint === 'expert') {
            const res = await api.get(`/mapping/admin/${id}?type=expert`, token);
            if (res.success) {
                setEntry({ ...res.data, _entryType: 'expert' });
                setLoading(false);
                return;
            }
        } else if (typeHint === 'organization') {
            const res = await api.get(`/mapping/admin/${id}?type=organization`, token);
            if (res.success) {
                setEntry({ ...res.data, _entryType: 'organization' });
                setLoading(false);
                return;
            }
        }

        // Fallback: try organization first, then expert
        let res = await api.get(`/mapping/admin/${id}?type=organization`, token);
        if (res.success) {
            setEntry({ ...res.data, _entryType: 'organization' });
        } else {
            res = await api.get(`/mapping/admin/${id}?type=expert`, token);
            if (res.success) {
                setEntry({ ...res.data, _entryType: 'expert' });
            } else {
                setToast({ message: 'Entrée introuvable', type: 'error' });
            }
        }
        setLoading(false);
    };

    const handleSubmit = async (data, photoFile) => {
        setSaving(true);
        try {
            const res = await api.put(`/mapping/admin/${id}`, data, token);

            if (res.success) {
                // Upload photo if provided
                if (photoFile) {
                    const entryType = data.type;
                    const formData = new FormData();
                    formData.append('photo', photoFile);
                    await api.upload(
                        `/mapping/${entryType === 'expert' ? 'experts' : 'organizations'}/${id}/photo`,
                        formData,
                        token
                    );
                }

                setToast({ message: 'Modifications enregistrées', type: 'success' });
                setTimeout(() => navigate(`/annuaire/view/${id}`), 1000);
            } else {
                setToast({ message: res.message || 'Erreur lors de la mise à jour', type: 'error' });
            }
        } catch (err) {
            setToast({ message: 'Erreur de connexion', type: 'error' });
        }
        setSaving(false);
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

    if (!entry) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h4>Entrée introuvable</h4>
                    <Link to="/annuaire/list" className="btn btn-primary mt-3">
                        <i className="fas fa-arrow-left me-2"></i>Retour à la liste
                    </Link>
                </div>
            </div>
        );
    }

    const displayName = entry.name || [entry.first_name, entry.last_name].filter(Boolean).join(' ');

    return (
        <>
            {toast && (
                <div
                    className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                    style={{ top: 20, right: 20, zIndex: 9999, minWidth: 300 }}
                >
                    <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-1">
                            <li className="breadcrumb-item"><Link to="/annuaire">Annuaire</Link></li>
                            <li className="breadcrumb-item"><Link to={`/annuaire/view/${id}`}>{displayName}</Link></li>
                            <li className="breadcrumb-item active">Modifier</li>
                        </ol>
                    </nav>
                    <h2 className="mb-0" style={{ fontWeight: 700 }}>
                        <i className="fas fa-edit text-primary me-2"></i>
                        Modifier : {displayName}
                    </h2>
                </div>
                <Link to={`/annuaire/view/${id}`} className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1"></i> Annuler
                </Link>
            </div>

            <AnnuaireForm
                initialData={entry}
                onSubmit={handleSubmit}
                saving={saving}
                isEditing
            />
        </>
    );
};

export default AnnuaireEdit;
