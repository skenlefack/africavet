import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vetAlertsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '../../component/uiStyle/FontAwesome';

const ALERT_TYPES = [
  { value: 'maladie', label: 'Maladie', icon: 'bug' },
  { value: 'mortalite', label: 'Mortalit\u00e9', icon: 'heartbeat' },
  { value: 'intoxication', label: 'Intoxication', icon: 'flask' },
  { value: 'autre', label: 'Autre', icon: 'bell' },
];

const PRIORITIES = [
  { value: 'critical', label: 'Critique - Urgence imm\u00e9diate', color: '#d32f2f' },
  { value: 'high', label: '\u00c9lev\u00e9e - Situation pr\u00e9occupante', color: '#e65100' },
  { value: 'medium', label: 'Moyenne - Surveillance requise', color: '#f9a825' },
  { value: 'low', label: 'Faible - Information pr\u00e9ventive', color: '#2e7d32' },
];

const COUNTRIES = [
  'S\u00e9n\u00e9gal', "C\u00f4te d'Ivoire", 'Mali', 'Burkina Faso', 'Niger', 'Cameroun',
  'Tchad', 'Guin\u00e9e', 'Togo', 'B\u00e9nin', 'RDC', 'Congo', 'Gabon',
  'Madagascar', 'Maroc', 'Tunisie', 'Alg\u00e9rie', 'Mauritanie', 'Autre',
];

const VetAlertSubmitPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Form fields
  const [form, setForm] = useState({
    type: '',
    priority: 'medium',
    species: '',
    title: '',
    description: '',
    symptoms: '',
    country: '',
    region: '',
    city: '',
    contact_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    contact_email: user?.email || '',
    contact_phone: user?.phone || '',
  });

  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      alert('Vous ne pouvez pas ajouter plus de 5 photos.');
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`Le fichier "${file.name}" d\u00e9passe 10 MB et ne sera pas ajout\u00e9.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert(`Le fichier "${file.name}" n'est pas une image valide.`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setPhotos(prev => [...prev, ...validFiles]);
    setPhotoPreviews(prev => [...prev, ...newPreviews]);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotoRemove = (index) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!form.type) return 'Veuillez s\u00e9lectionner un type d\u2019alerte.';
    if (!form.title.trim()) return 'Veuillez saisir un titre pour l\u2019alerte.';
    if (!form.species.trim()) return 'Veuillez indiquer l\u2019esp\u00e8ce concern\u00e9e.';
    if (!form.description.trim()) return 'Veuillez d\u00e9crire la situation observ\u00e9e.';
    if (!form.country) return 'Veuillez s\u00e9lectionner le pays.';
    if (!form.contact_name.trim()) return 'Veuillez indiquer votre nom.';
    if (!form.contact_email.trim()) return 'Veuillez indiquer votre email.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      photos.forEach((photo, i) => {
        formData.append(`photo_${i}`, photo);
      });

      const res = await vetAlertsApi.submit(formData);

      if (res.success) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(res.message || '\u00c9chec de la soumission. Veuillez r\u00e9essayer.');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez r\u00e9essayer.');
    }

    setSubmitting(false);
  };

  // Success screen
  if (success) {
    return (
      <div className="vet-alert-submit-page">
        <section
          style={{
            background: 'linear-gradient(135deg, #d32f2f 0%, #880e4f 100%)',
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
              <Link to="/alertes-veterinaires" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                Alertes V\u00e9t\u00e9rinaires
              </Link>
              <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
              <span>Alerte soumise</span>
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
                Alerte soumise avec succ\u00e8s !
              </h2>
              <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>
                Votre alerte <strong>"{form.title}"</strong> a \u00e9t\u00e9 enregistr\u00e9e.
              </p>
              <p style={{ color: '#999', fontSize: '14px', marginBottom: '25px' }}>
                Notre \u00e9quipe va examiner votre signalement et le publier apr\u00e8s v\u00e9rification.
                Vous serez notifi\u00e9(e) par email \u00e0 <strong>{form.contact_email}</strong>.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/alertes-veterinaires" className="btn btn-outline-primary">
                  <FontAwesome name="arrow-left" /> Voir les alertes
                </Link>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setForm({
                      type: '', priority: 'medium', species: '', title: '',
                      description: '', symptoms: '', country: '', region: '', city: '',
                      contact_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
                      contact_email: user?.email || '', contact_phone: user?.phone || '',
                    });
                    setPhotos([]);
                    setPhotoPreviews([]);
                  }}
                  className="btn"
                  style={{ background: 'linear-gradient(135deg, #d32f2f 0%, #880e4f 100%)', color: '#fff', border: 'none' }}
                >
                  <FontAwesome name="plus" /> Soumettre une autre alerte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vet-alert-submit-page">
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #d32f2f 0%, #880e4f 100%)',
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
            <Link to="/alertes-veterinaires" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
              Alertes V\u00e9t\u00e9rinaires
            </Link>
            <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
            <span>Soumettre une alerte</span>
          </nav>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>
            <FontAwesome name="plus-circle" /> Soumettre une alerte v\u00e9t\u00e9rinaire
          </h1>
          <p style={{ opacity: 0.9, fontSize: '15px', maxWidth: '600px' }}>
            Signalez un cas suspect de maladie, mortalit\u00e9 ou intoxication animale pour aider la communaut\u00e9 v\u00e9t\u00e9rinaire.
          </p>
        </div>
      </section>

      <div className="container" style={{ padding: '30px 0 50px' }}>
        <div className="row">
          <div className="col-lg-8">
            {/* Error */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center" style={{ borderRadius: '10px' }}>
                <FontAwesome name="exclamation-circle" style={{ marginRight: '10px', fontSize: '18px' }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Alert Type & Priority */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body" style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#354e84' }}>
                    <FontAwesome name="tag" /> Type et priorit\u00e9
                  </h3>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                        Type d'alerte <span style={{ color: '#d32f2f' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">-- S\u00e9lectionnez --</option>
                        {ALERT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                        Niveau de priorit\u00e9 <span style={{ color: '#d32f2f' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: '8px' }}
                      >
                        {PRIORITIES.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mt-1">
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                        Esp\u00e8ce(s) concern\u00e9e(s) <span style={{ color: '#d32f2f' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="species"
                        value={form.species}
                        onChange={handleChange}
                        placeholder="Ex: Bovins, Ovins, Volailles..."
                        required
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                        Titre de l'alerte <span style={{ color: '#d32f2f' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="R\u00e9sum\u00e9 court de l'alerte"
                        required
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Symptoms */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body" style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#354e84' }}>
                    <FontAwesome name="file-text-o" /> D\u00e9tails de l'alerte
                  </h3>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                      Description de la situation <span style={{ color: '#d32f2f' }}>*</span>
                    </label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows={5}
                      value={form.description}
                      onChange={handleChange}
                      placeholder="D\u00e9crivez la situation observ\u00e9e en d\u00e9tail: nombre d'animaux, chronologie, circonstances..."
                      required
                      style={{ borderRadius: '8px', resize: 'vertical' }}
                    />
                  </div>

                  <div className="mb-0">
                    <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                      Sympt\u00f4mes observ\u00e9s
                    </label>
                    <textarea
                      className="form-control"
                      name="symptoms"
                      rows={4}
                      value={form.symptoms}
                      onChange={handleChange}
                      placeholder="D\u00e9crivez les sympt\u00f4mes observ\u00e9s chez les animaux affect\u00e9s..."
                      style={{ borderRadius: '8px', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body" style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#354e84' }}>
                    <FontAwesome name="map-marker" /> Localisation
                  </h3>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                        Pays <span style={{ color: '#d32f2f' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">-- S\u00e9lectionnez --</option>
                        {COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                        R\u00e9gion
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="region"
                        value={form.region}
                        onChange={handleChange}
                        placeholder="R\u00e9gion / Province"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                        Ville / Localit\u00e9
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Ville ou village"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body" style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#354e84' }}>
                    <FontAwesome name="camera" /> Photos
                  </h3>
                  <p style={{ color: '#666', fontSize: '13px', marginBottom: '15px' }}>
                    Ajoutez jusqu'\u00e0 5 photos pour illustrer la situation (max 10 MB par photo).
                  </p>

                  {/* Photo Previews */}
                  {photoPreviews.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {photoPreviews.map((preview, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            width: '100px',
                            height: '100px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '2px solid #e0e0e0',
                          }}
                        >
                          <img
                            src={preview}
                            alt={`Photo ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={() => handlePhotoRemove(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: '#d32f2f',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '22px',
                              height: '22px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            <FontAwesome name="times" />
                          </button>
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '0',
                              left: '0',
                              right: '0',
                              background: 'rgba(0,0,0,0.5)',
                              color: '#fff',
                              fontSize: '10px',
                              padding: '2px 4px',
                              textAlign: 'center',
                            }}
                          >
                            {(photos[idx]?.size / (1024 * 1024)).toFixed(1)} MB
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {photos.length < 5 && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoAdd}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ borderRadius: '8px' }}
                      >
                        <FontAwesome name="plus" /> Ajouter des photos ({photos.length}/5)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body" style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#354e84' }}>
                    <FontAwesome name="user" /> Vos coordonn\u00e9es
                  </h3>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                        Nom complet <span style={{ color: '#d32f2f' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="contact_name"
                        value={form.contact_name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        required
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                        Email <span style={{ color: '#d32f2f' }}>*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        name="contact_email"
                        value={form.contact_email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        required
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontWeight: '600', color: '#333' }}>
                        T\u00e9l\u00e9phone
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        name="contact_phone"
                        value={form.contact_phone}
                        onChange={handleChange}
                        placeholder="+221 XX XXX XX XX"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="d-flex gap-3">
                <Link
                  to="/alertes-veterinaires"
                  className="btn btn-outline-secondary"
                  style={{ borderRadius: '8px', padding: '10px 20px' }}
                >
                  <FontAwesome name="arrow-left" /> Annuler
                </Link>
                <button
                  type="submit"
                  className="btn flex-grow-1"
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #d32f2f 0%, #880e4f 100%)',
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
                      <FontAwesome name="paper-plane" /> Soumettre l'alerte
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Guidelines */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
              <div className="card-body" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                  <FontAwesome name="lightbulb-o" /> Conseils pour bien signaler
                </h4>
                <ul style={{ fontSize: '13px', color: '#555', lineHeight: '1.8', paddingLeft: '18px' }}>
                  <li>Soyez aussi pr\u00e9cis que possible dans la description de la situation.</li>
                  <li>Indiquez le nombre d'animaux touch\u00e9s si possible.</li>
                  <li>D\u00e9crivez les sympt\u00f4mes observ\u00e9s de mani\u00e8re d\u00e9taill\u00e9e.</li>
                  <li>Prenez des photos claires des animaux affect\u00e9s.</li>
                  <li>Pr\u00e9cisez la localisation exacte pour faciliter l'intervention.</li>
                  <li>Laissez des coordonn\u00e9es valides pour le suivi.</li>
                </ul>
              </div>
            </div>

            {/* Priority Guide */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
              <div className="card-body" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: '#354e84' }}>
                  <FontAwesome name="exclamation-triangle" /> Guide des priorit\u00e9s
                </h4>
                {PRIORITIES.map(p => (
                  <div key={p.value} className="d-flex align-items-start gap-2 mb-3">
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: p.color,
                        flexShrink: 0,
                        marginTop: '5px',
                      }}
                    ></div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#333' }}>{p.label.split(' - ')[0]}</strong>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: 0 }}>
                        {p.label.split(' - ')[1]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', borderLeft: '4px solid #d32f2f' }}>
              <div className="card-body" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px', color: '#d32f2f' }}>
                  <FontAwesome name="phone" /> Urgence v\u00e9t\u00e9rinaire ?
                </h4>
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '10px' }}>
                  En cas d'urgence imm\u00e9diate, contactez les services v\u00e9t\u00e9rinaires de votre r\u00e9gion
                  ou les autorit\u00e9s sanitaires locales.
                </p>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: 0 }}>
                  <FontAwesome name="envelope" /> contact@africavet.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetAlertSubmitPage;
