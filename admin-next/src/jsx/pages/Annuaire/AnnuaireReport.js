import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const REASONS = [
  { value: 'incorrect_info', label: 'Informations incorrectes' },
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'duplicate', label: 'Doublon' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Autre' },
];

const AnnuaireReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = getToken();

  const [entry, setEntry] = useState(null);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await api.get(`/mapping/entries/${id}`, token);
        if (res.success) setEntry(res.data);
      } catch (err) {
        console.error('Error fetching entry:', err);
      }
    };
    fetchEntry();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) { setToast({ type: 'danger', message: 'Veuillez sélectionner un motif.' }); return; }
    if (description.length < 20) { setToast({ type: 'danger', message: 'La description doit contenir au moins 20 caractères.' }); return; }

    setLoading(true);
    try {
      const res = await api.post(`/mapping/entries/${id}/report`, { reason, description }, token);
      if (res.success) {
        setToast({ type: 'success', message: 'Signalement envoyé avec succès.' });
        setTimeout(() => navigate(`/annuaire/view/${id}`), 2000);
      }
    } catch (err) {
      setToast({ type: 'danger', message: err.message || 'Erreur lors du signalement.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 300 }}>
          <div className={`alert alert-${toast.type} alert-dismissible fade show`}>
            {toast.message}
            <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
          </div>
        </div>
      )}

      <div className="row page-titles">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/annuaire">Annuaire</Link></li>
          <li className="breadcrumb-item active">Signaler une entrée</li>
        </ol>
      </div>

      <div className="row">
        <div className="col-xl-8 col-lg-10 mx-auto">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <i className="fas fa-flag text-danger me-2"></i>
                Signaler une entrée
              </h4>
            </div>
            <div className="card-body">
              {entry && (
                <div className="alert alert-light mb-4">
                  <strong>Entrée :</strong> {entry.name_fr || entry.name_en || `#${id}`}
                  {entry.type && <span className="badge bg-secondary ms-2">{entry.type}</span>}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Motif du signalement <span className="text-danger">*</span></label>
                  <select className="form-select" value={reason} onChange={e => setReason(e.target.value)} required>
                    <option value="">Sélectionner un motif...</option>
                    {REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Description <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Décrivez le problème en détail (minimum 20 caractères)..."
                    minLength={20}
                    required
                  />
                  <small className="text-muted">{description.length}/20 caractères minimum</small>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-danger" disabled={loading}>
                    {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Envoi...</> : <><i className="fas fa-flag me-2"></i>Envoyer le signalement</>}
                  </button>
                  <Link to={`/annuaire/view/${id}`} className="btn btn-secondary">
                    <i className="fas fa-arrow-left me-2"></i>Annuler
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnuaireReport;
