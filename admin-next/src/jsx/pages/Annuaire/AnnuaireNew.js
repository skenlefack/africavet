import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import AnnuaireForm from './AnnuaireForm';

const AnnuaireNew = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const handleSubmit = async (data, photoFile) => {
        setSaving(true);
        try {
            const entryType = data.type;
            delete data.type;

            const endpoint = entryType === 'expert' ? '/mapping/experts' : '/mapping/organizations';
            const res = await api.post(endpoint, data, token);

            if (res.success) {
                const newId = res.data?.id || res.data?.insertId;

                // Upload photo if provided
                if (photoFile && newId) {
                    const formData = new FormData();
                    formData.append('photo', photoFile);
                    await api.upload(`/mapping/${entryType === 'expert' ? 'experts' : 'organizations'}/${newId}/photo`, formData, token);
                }

                setToast({ message: 'Entrée créée avec succès !', type: 'success' });
                setTimeout(() => {
                    if (newId) {
                        navigate(`/annuaire/view/${newId}`);
                    } else {
                        navigate('/annuaire/list');
                    }
                }, 1000);
            } else {
                setToast({ message: res.message || 'Erreur lors de la création', type: 'error' });
            }
        } catch (err) {
            setToast({ message: 'Erreur de connexion', type: 'error' });
        }
        setSaving(false);
    };

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
                            <li className="breadcrumb-item active">Nouvelle entrée</li>
                        </ol>
                    </nav>
                    <h2 className="mb-0" style={{ fontWeight: 700 }}>
                        <i className="fas fa-plus-circle text-primary me-2"></i>
                        Nouvel établissement / expert
                    </h2>
                </div>
                <Link to="/annuaire/list" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1"></i> Annuler
                </Link>
            </div>

            <AnnuaireForm onSubmit={handleSubmit} saving={saving} />
        </>
    );
};

export default AnnuaireNew;
