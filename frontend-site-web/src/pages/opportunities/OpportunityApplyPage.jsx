import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { opportunitiesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import FileUpload from '../../component/shared/FileUpload';

const TYPE_CONFIG = {
  emploi: { label: 'Emploi', color: '#2196F3', icon: 'briefcase' },
  appel_offre: { label: "Appel d'offres", color: '#FF9800', icon: 'gavel' },
  marche: { label: 'March\u00e9', color: '#9C27B0', icon: 'handshake-o' },
  bourse: { label: 'Bourse', color: '#4CAF50', icon: 'graduation-cap' },
};

const OpportunityApplyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [additionalDocs, setAdditionalDocs] = useState([]);
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    loadOpportunity();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const loadOpportunity = async () => {
    setLoading(true);
    const res = await opportunitiesApi.getById(id);
    if (res.success && res.data) {
      // Check if the opportunity deadline has passed
      if (res.data.deadline && new Date(res.data.deadline) < new Date()) {
        setError('La date limite de candidature pour cette opportunit\u00e9 est d\u00e9pass\u00e9e.');
      }
      setOpportunity(res.data);
    } else {
      setError('Opportunit\u00e9 introuvable.');
    }
    setLoading(false);
  };

  const handleAddDoc = (file) => {
    if (additionalDocs.length >= 5) {
      alert('Vous ne pouvez pas ajouter plus de 5 documents suppl\u00e9mentaires.');
      return;
    }
    setAdditionalDocs(prev => [...prev, file]);
  };

  const handleRemoveDoc = (index) => {
    setAdditionalDocs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coverLetter.trim()) {
      setError('Veuillez r\u00e9diger une lettre de motivation.');
      return;
    }

    if (!cvFile) {
      setError('Veuillez joindre votre CV.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cover_letter', coverLetter);
      formData.append('motivation', motivation);
      formData.append('cv', cvFile);
      additionalDocs.forEach((doc, i) => {
        formData.append(`document_${i}`, doc);
      });
      // Include user info
      if (user) {
        formData.append('applicant_name', `${user.first_name || ''} ${user.last_name || ''}`.trim());
        formData.append('applicant_email', user.email || '');
      }

      const res = await opportunitiesApi.apply(id, formData, token);

      if (res.success) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(res.message || '\u00c9chec de l\'envoi de la candidature. Veuillez r\u00e9essayer.');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez r\u00e9essayer.');
    }

    setSubmitting(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Chargement..." />;
  }

  if (!opportunity) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '60px', color: '#ddd', marginBottom: '20px' }}>
          <FontAwesome name="exclamation-triangle" />
        </div>
        <h2 style={{ color: '#666' }}>Opportunit\u00e9 introuvable</h2>
        <Link to="/opportunites" className="btn btn-primary mt-3">
          <FontAwesome name="arrow-left" /> Retour aux opportunit\u00e9s
        </Link>
      </div>
    );
  }

  const config = TYPE_CONFIG[opportunity.type] || { label: opportunity.type || 'Autre', color: '#607D8B', icon: 'file-text-o' };
  const displayTitle = opportunity.title_fr || opportunity.title || 'Sans titre';

  // Success State
  if (success) {
    return (
      <div className="opportunity-apply-page">
        <section
          style={{
            background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
            padding: '30px 0',
            color: '#fff',
          }}
        >
          <div className="container">
            <nav style={{ marginBottom: '15px', fontSize: '14px' }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                <FontAwesome name="home" /> Accueil
              </Link>
              <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
              <Link to="/opportunites" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                Opportunit\u00e9s
              </Link>
              <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
              <span>Candidature envoy\u00e9e</span>
            </nav>
          </div>
        </section>

        <div className="container" style={{ padding: '60px 0' }}>
          <div className="row justify-content-center">
            <div className="col-lg-6 text-center">
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <FontAwesome name="check" style={{ fontSize: '36px', color: '#4CAF50' }} />
              </div>
              <h2 style={{ fontWeight: '700', color: '#333', marginBottom: '10px' }}>
                Candidature envoy\u00e9e avec succ\u00e8s !
              </h2>
              <p style={{ color: '#666', fontSize: '16px', marginBottom: '25px' }}>
                Votre candidature pour <strong>{displayTitle}</strong> a \u00e9t\u00e9 soumise.
                Vous recevrez une confirmation par email \u00e0 <strong>{user?.email}</strong>.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to={`/opportunites/${id}`} className="btn btn-outline-primary">
                  <FontAwesome name="arrow-left" /> Voir l'offre
                </Link>
                <Link
                  to="/opportunites"
                  className="btn"
                  style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', color: '#fff', border: 'none' }}
                >
                  Autres opportunit\u00e9s
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="opportunity-apply-page">
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
          padding: '30px 0',
          color: '#fff',
        }}
      >
        <div className="container">
          <nav style={{ marginBottom: '15px', fontSize: '14px' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
              <FontAwesome name="home" /> Accueil
            </Link>
            <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
            <Link to="/opportunites" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
              Opportunit\u00e9s
            </Link>
            <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
            <Link to={`/opportunites/${id}`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
              {displayTitle.length > 40 ? displayTitle.substring(0, 40) + '...' : displayTitle}
            </Link>
            <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
            <span>Postuler</span>
          </nav>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>
            <FontAwesome name="paper-plane" /> Postuler
          </h1>
        </div>
      </section>

      <div className="container" style={{ padding: '30px 0 50px' }}>
        <div className="row">
          <div className="col-lg-8">
            {/* Opportunity Summary */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
              <div className="card-body" style={{ padding: '20px' }}>
                <div className="d-flex align-items-start gap-3">
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      backgroundColor: config.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '20px',
                      flexShrink: 0,
                    }}
                  >
                    <FontAwesome name={config.icon} />
                  </div>
                  <div>
                    <span className="badge mb-1" style={{ backgroundColor: config.color, color: '#fff', fontSize: '11px' }}>
                      {config.label}
                    </span>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
                      {displayTitle}
                    </h4>
                    <div className="d-flex flex-wrap gap-3" style={{ fontSize: '13px', color: '#666' }}>
                      {opportunity.organization && <span><FontAwesome name="building-o" /> {opportunity.organization}</span>}
                      {opportunity.country && <span><FontAwesome name="map-marker" /> {opportunity.country}</span>}
                      {opportunity.deadline && <span><FontAwesome name="calendar" /> Limite: {formatDate(opportunity.deadline)}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center" style={{ borderRadius: '10px' }}>
                <FontAwesome name="exclamation-circle" style={{ marginRight: '10px', fontSize: '18px' }} />
                {error}
              </div>
            )}

            {/* Application Form */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
              <div className="card-body" style={{ padding: '25px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#354e84' }}>
                  <FontAwesome name="edit" /> Formulaire de candidature
                </h3>

                <form onSubmit={handleSubmit}>
                  {/* Cover Letter */}
                  <div className="mb-4">
                    <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                      Lettre de motivation <span style={{ color: '#d32f2f' }}>*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows={8}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Pr\u00e9sentez-vous et expliquez pourquoi vous \u00eates int\u00e9ress\u00e9(e) par cette opportunit\u00e9..."
                      required
                      style={{ borderRadius: '8px', resize: 'vertical' }}
                    />
                    <small className="text-muted">
                      D\u00e9taillez votre exp\u00e9rience et vos motivations.
                    </small>
                  </div>

                  {/* Motivation */}
                  <div className="mb-4">
                    <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                      Pourquoi souhaitez-vous postuler ?
                    </label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="Qu'est-ce qui vous motive dans cette offre ?"
                      style={{ borderRadius: '8px', resize: 'vertical' }}
                    />
                  </div>

                  {/* CV Upload */}
                  <div className="mb-4">
                    <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                      Curriculum Vitae (CV) <span style={{ color: '#d32f2f' }}>*</span>
                    </label>
                    <FileUpload
                      onFileSelect={(file) => setCvFile(file)}
                      accept=".pdf,.doc,.docx"
                      maxSize={10}
                      label="T\u00e9l\u00e9charger votre CV"
                      currentFile={cvFile}
                      onRemove={() => setCvFile(null)}
                    />
                    <small className="text-muted">
                      Formats accept\u00e9s : PDF, DOC, DOCX (max 10 MB)
                    </small>
                  </div>

                  {/* Additional Documents */}
                  <div className="mb-4">
                    <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                      Documents suppl\u00e9mentaires
                    </label>
                    <p style={{ color: '#666', fontSize: '13px', marginBottom: '10px' }}>
                      Ajoutez des documents compl\u00e9mentaires (dipl\u00f4mes, certifications, lettres de recommandation...). Maximum 5 fichiers.
                    </p>

                    {additionalDocs.map((doc, index) => (
                      <div key={index} className="d-flex align-items-center gap-2 mb-2 p-2 border rounded" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
                        <FontAwesome name="file-o" style={{ color: '#666' }} />
                        <span className="flex-grow-1" style={{ fontSize: '14px', color: '#333' }}>{doc.name}</span>
                        <small style={{ color: '#999' }}>{(doc.size / (1024 * 1024)).toFixed(1)} MB</small>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveDoc(index)}
                          style={{ borderRadius: '6px' }}
                        >
                          <FontAwesome name="trash" />
                        </button>
                      </div>
                    ))}

                    {additionalDocs.length < 5 && (
                      <FileUpload
                        onFileSelect={handleAddDoc}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        maxSize={10}
                        label="Ajouter un document"
                      />
                    )}
                  </div>

                  {/* Submit */}
                  <div className="d-flex gap-3 pt-3" style={{ borderTop: '1px solid #f0f0f0' }}>
                    <Link
                      to={`/opportunites/${id}`}
                      className="btn btn-outline-secondary"
                      style={{ borderRadius: '8px', padding: '10px 20px' }}
                    >
                      <FontAwesome name="arrow-left" /> Annuler
                    </Link>
                    <button
                      type="submit"
                      className="btn flex-grow-1"
                      disabled={submitting || (error && error.includes('d\u00e9pass\u00e9e'))}
                      style={{
                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        padding: '10px 20px',
                        opacity: submitting ? 0.7 : 1,
                      }}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <FontAwesome name="paper-plane" /> Envoyer ma candidature
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar with tips */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
              <div className="card-body" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                  <FontAwesome name="lightbulb-o" /> Conseils
                </h4>
                <ul style={{ fontSize: '13px', color: '#555', lineHeight: '1.8', paddingLeft: '18px' }}>
                  <li>R\u00e9digez une lettre de motivation personnalis\u00e9e pour cette offre sp\u00e9cifique.</li>
                  <li>Mettez en avant votre exp\u00e9rience dans le domaine v\u00e9t\u00e9rinaire.</li>
                  <li>Assurez-vous que votre CV est \u00e0 jour et au format PDF.</li>
                  <li>Ajoutez vos dipl\u00f4mes et certifications pertinentes.</li>
                  <li>V\u00e9rifiez vos coordonn\u00e9es avant d'envoyer.</li>
                </ul>
              </div>
            </div>

            {/* User info card */}
            {user && (
              <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <div className="card-body" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                    <FontAwesome name="user" /> Vos informations
                  </h4>
                  <div style={{ fontSize: '14px', color: '#555' }}>
                    <p className="mb-2">
                      <strong>Nom :</strong> {user.first_name} {user.last_name}
                    </p>
                    <p className="mb-2">
                      <strong>Email :</strong> {user.email}
                    </p>
                    {user.phone && (
                      <p className="mb-0">
                        <strong>T\u00e9l\u00e9phone :</strong> {user.phone}
                      </p>
                    )}
                  </div>
                  <Link to="/profil" className="btn btn-outline-primary btn-sm mt-3 w-100" style={{ borderRadius: '8px' }}>
                    <FontAwesome name="pencil" /> Modifier mon profil
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityApplyPage;
