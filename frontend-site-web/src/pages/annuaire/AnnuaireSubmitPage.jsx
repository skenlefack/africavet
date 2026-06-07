import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import FileUpload from '../../component/shared/FileUpload';
import { useAuth } from '../../context/AuthContext';
import { annuaireApi, apiUpload } from '../../services/api';

const SPECIALITIES = [
  'Veterinaire',
  'Zootechnicien',
  'Parasitologue',
  'Epidemiologiste',
  'Nutritionniste animal',
  'Chirurgien veterinaire',
  'Pathologiste',
  'Pharmacologue',
  'Biologiste',
  'Agronome',
  'Autre',
];

const ORGANIZATION_TYPES = [
  'Clinique veterinaire',
  'Laboratoire',
  'ONG',
  'Universite',
  'Centre de recherche',
  'Association professionnelle',
  'Industrie pharmaceutique',
  'Fournisseur',
  'Institution gouvernementale',
  'Autre',
];

const COUNTRIES = [
  'Senegal', 'Cote d\'Ivoire', 'Cameroun', 'Mali', 'Burkina Faso',
  'Guinee', 'Benin', 'Togo', 'Niger', 'RD Congo',
  'Madagascar', 'Gabon', 'Tchad', 'Maroc', 'Tunisie', 'Algerie',
  'Kenya', 'Nigeria', 'Ethiopie', 'Ghana', 'Afrique du Sud', 'Autre',
];

const AnnuaireSubmitPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState('');
  const [formData, setFormData] = useState({
    // Expert fields
    name: user?.name || '',
    specialization: '',
    skills: '',
    years_experience: '',
    bio: '',
    // Education as text
    education_text: '',
    // Experience as text
    experience_text: '',
    // Organization fields
    organization_type: '',
    description: '',
    services: '',
    website: '',
    founded_year: '',
    mission: '',
    // Common fields
    country: '',
    city: '',
    address: '',
    email: user?.email || '',
    phone: '',
    show_email: true,
    show_phone: true,
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!type) {
      setError('Veuillez selectionner un type d\'inscription.');
      setLoading(false);
      return;
    }

    if (!formData.name.trim()) {
      setError('Le nom est obligatoire.');
      setLoading(false);
      return;
    }

    if (!formData.country) {
      setError('Le pays est obligatoire.');
      setLoading(false);
      return;
    }

    try {
      // Build submission data
      const submitData = {
        type,
        name: formData.name.trim(),
        country: formData.country,
        city: formData.city.trim(),
        address: formData.address.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        show_email: formData.show_email,
        show_phone: formData.show_phone,
      };

      if (type === 'expert') {
        submitData.specialization = formData.specialization;
        submitData.skills = formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        submitData.years_experience = formData.years_experience ? parseInt(formData.years_experience) : null;
        submitData.bio = formData.bio.trim();
        submitData.education_text = formData.education_text.trim();
        submitData.experience_text = formData.experience_text.trim();
      } else {
        submitData.organization_type = formData.organization_type;
        submitData.description = formData.description.trim();
        submitData.services = formData.services
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        submitData.website = formData.website.trim();
        submitData.founded_year = formData.founded_year ? parseInt(formData.founded_year) : null;
        submitData.mission = formData.mission.trim();
      }

      const response = await annuaireApi.submit(submitData, token);

      if (response.success) {
        // If there's a photo, upload it separately
        if (photo && response.data?.id) {
          const photoData = new FormData();
          photoData.append('photo', photo);
          await apiUpload(`/mapping/${response.data.id}/photo`, photoData, token);
        }
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(response.message || 'Erreur lors de la soumission.');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="container text-center" style={{ padding: '80px 20px', maxWidth: '550px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#e8f5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <FontAwesome name="check" style={{ color: '#7ac142', fontSize: '36px' }} />
        </div>
        <h2 style={{ color: '#333', fontWeight: '700', marginBottom: '12px' }}>
          Inscription soumise !
        </h2>
        <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
          Votre demande d'inscription a l'annuaire a ete envoyee avec succes.
          Notre equipe va examiner votre profil et vous recevrez une confirmation par email.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link
            to="/annuaire"
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 28px',
              fontWeight: '600',
            }}
          >
            <FontAwesome name="address-book" style={{ marginRight: '8px' }} />
            Voir l'annuaire
          </Link>
          <Link
            to="/"
            className="btn btn-outline-secondary"
            style={{ borderRadius: '8px', padding: '12px 28px', fontWeight: '600' }}
          >
            Accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef', padding: '12px 0' }}>
        <div className="container">
          <nav style={{ fontSize: '13px', color: '#666' }}>
            <Link to="/" style={{ color: '#7ac142', textDecoration: 'none' }}>Accueil</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link to="/annuaire" style={{ color: '#7ac142', textDecoration: 'none' }}>Annuaire</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#333' }}>Inscription</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
          padding: '40px 0',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <h1 style={{ color: '#fff', fontWeight: '800', fontSize: '30px', marginBottom: '8px' }}>
            <FontAwesome name="user-plus" style={{ marginRight: '12px' }} />
            S'inscrire dans l'annuaire
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', margin: 0 }}>
            Remplissez le formulaire ci-dessous pour figurer dans l'annuaire AfricaVET
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container" style={{ padding: '40px 15px 60px', maxWidth: '800px' }}>
        {error && (
          <div className="alert alert-danger" style={{ borderRadius: '10px', marginBottom: '24px' }}>
            <FontAwesome name="exclamation-circle" style={{ marginRight: '8px' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Type selection */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '20px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '700',
                    marginRight: '10px',
                  }}
                >
                  1
                </span>
                Type d'inscription
              </h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <div
                    onClick={() => setType('expert')}
                    style={{
                      padding: '24px',
                      border: type === 'expert' ? '2px solid #7ac142' : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: type === 'expert' ? 'rgba(122,193,66,0.05)' : '#fff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <FontAwesome
                      name="user-md"
                      style={{
                        fontSize: '36px',
                        color: type === 'expert' ? '#7ac142' : '#999',
                        display: 'block',
                        marginBottom: '12px',
                      }}
                    />
                    <h6 style={{ fontWeight: '700', color: type === 'expert' ? '#7ac142' : '#333', marginBottom: '4px' }}>
                      Expert
                    </h6>
                    <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
                      Veterinaire, chercheur, consultant...
                    </p>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div
                    onClick={() => setType('organization')}
                    style={{
                      padding: '24px',
                      border: type === 'organization' ? '2px solid #354e84' : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: type === 'organization' ? 'rgba(53,78,132,0.05)' : '#fff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <FontAwesome
                      name="building"
                      style={{
                        fontSize: '36px',
                        color: type === 'organization' ? '#354e84' : '#999',
                        display: 'block',
                        marginBottom: '12px',
                      }}
                    />
                    <h6 style={{ fontWeight: '700', color: type === 'organization' ? '#354e84' : '#333', marginBottom: '4px' }}>
                      Organisation
                    </h6>
                    <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
                      Clinique, labo, ONG, universite...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Show the rest only when type is selected */}
          {type && (
            <>
              {/* Step 2: Specific fields */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                  <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '20px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '700',
                        marginRight: '10px',
                      }}
                    >
                      2
                    </span>
                    {type === 'expert' ? 'Informations de l\'expert' : 'Informations de l\'organisation'}
                  </h5>

                  {/* Name */}
                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                      {type === 'expert' ? 'Nom complet' : 'Nom de l\'organisation'} <span style={{ color: '#e74c3c' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={type === 'expert' ? 'Dr. Jean Dupont' : 'Clinique Veterinaire Exemple'}
                      required
                      disabled={loading}
                      style={{ borderRadius: '8px', padding: '10px 14px' }}
                    />
                  </div>

                  {/* Expert-specific fields */}
                  {type === 'expert' && (
                    <>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                            Specialisation
                          </label>
                          <select
                            className="form-control"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            disabled={loading}
                            style={{ borderRadius: '8px', padding: '10px 14px' }}
                          >
                            <option value="">Choisir une specialite</option>
                            {SPECIALITIES.map((spec) => (
                              <option key={spec} value={spec}>{spec}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                            Annees d'experience
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="years_experience"
                            value={formData.years_experience}
                            onChange={handleChange}
                            placeholder="Ex: 10"
                            min="0"
                            max="60"
                            disabled={loading}
                            style={{ borderRadius: '8px', padding: '10px 14px' }}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                          Competences <small style={{ color: '#888', fontWeight: '400' }}>(separees par des virgules)</small>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          placeholder="Ex: Chirurgie, Diagnostic, Epidemiologie, Nutrition animale"
                          disabled={loading}
                          style={{ borderRadius: '8px', padding: '10px 14px' }}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                          Biographie
                        </label>
                        <textarea
                          className="form-control"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows="4"
                          placeholder="Decrivez votre parcours, vos experiences et vos domaines d'expertise..."
                          disabled={loading}
                          style={{ borderRadius: '8px', padding: '10px 14px', resize: 'vertical' }}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                          Experience professionnelle
                        </label>
                        <textarea
                          className="form-control"
                          name="experience_text"
                          value={formData.experience_text}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Listez vos experiences professionnelles principales..."
                          disabled={loading}
                          style={{ borderRadius: '8px', padding: '10px 14px', resize: 'vertical' }}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                          Formation
                        </label>
                        <textarea
                          className="form-control"
                          name="education_text"
                          value={formData.education_text}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Listez vos diplomes et formations (ex: Doctorat en Medecine Veterinaire - Universite de Dakar, 2015)"
                          disabled={loading}
                          style={{ borderRadius: '8px', padding: '10px 14px', resize: 'vertical' }}
                        />
                      </div>
                    </>
                  )}

                  {/* Organization-specific fields */}
                  {type === 'organization' && (
                    <>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                            Type d'organisation
                          </label>
                          <select
                            className="form-control"
                            name="organization_type"
                            value={formData.organization_type}
                            onChange={handleChange}
                            disabled={loading}
                            style={{ borderRadius: '8px', padding: '10px 14px' }}
                          >
                            <option value="">Choisir un type</option>
                            {ORGANIZATION_TYPES.map((orgType) => (
                              <option key={orgType} value={orgType}>{orgType}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                            Annee de fondation
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="founded_year"
                            value={formData.founded_year}
                            onChange={handleChange}
                            placeholder="Ex: 2010"
                            min="1900"
                            max="2026"
                            disabled={loading}
                            style={{ borderRadius: '8px', padding: '10px 14px' }}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                          Description
                        </label>
                        <textarea
                          className="form-control"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows="4"
                          placeholder="Decrivez votre organisation, ses activites et son domaine d'intervention..."
                          disabled={loading}
                          style={{ borderRadius: '8px', padding: '10px 14px', resize: 'vertical' }}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                          Services proposes <small style={{ color: '#888', fontWeight: '400' }}>(separes par des virgules)</small>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="services"
                          value={formData.services}
                          onChange={handleChange}
                          placeholder="Ex: Consultation, Chirurgie, Vaccination, Laboratoire"
                          disabled={loading}
                          style={{ borderRadius: '8px', padding: '10px 14px' }}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                          Mission
                        </label>
                        <textarea
                          className="form-control"
                          name="mission"
                          value={formData.mission}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Decrivez la mission de votre organisation..."
                          disabled={loading}
                          style={{ borderRadius: '8px', padding: '10px 14px', resize: 'vertical' }}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                          Site web
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://www.exemple.com"
                          disabled={loading}
                          style={{ borderRadius: '8px', padding: '10px 14px' }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Step 3: Location & Contact */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                  <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '20px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '700',
                        marginRight: '10px',
                      }}
                    >
                      3
                    </span>
                    Localisation et contact
                  </h5>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                        Pays <span style={{ color: '#e74c3c' }}>*</span>
                      </label>
                      <select
                        className="form-control"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        style={{ borderRadius: '8px', padding: '10px 14px' }}
                      >
                        <option value="">Selectionner un pays</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                        Ville
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Ex: Dakar"
                        disabled={loading}
                        style={{ borderRadius: '8px', padding: '10px 14px' }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                      Adresse
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Adresse complete"
                      disabled={loading}
                      style={{ borderRadius: '8px', padding: '10px 14px' }}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                        Email de contact
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contact@exemple.com"
                        disabled={loading}
                        style={{ borderRadius: '8px', padding: '10px 14px' }}
                      />
                      <div className="form-check mt-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="show_email"
                          name="show_email"
                          checked={formData.show_email}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="show_email" style={{ fontSize: '13px', color: '#666' }}>
                          Afficher l'email publiquement
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>
                        Telephone
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+221 77 123 45 67"
                        disabled={loading}
                        style={{ borderRadius: '8px', padding: '10px 14px' }}
                      />
                      <div className="form-check mt-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="show_phone"
                          name="show_phone"
                          checked={formData.show_phone}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="show_phone" style={{ fontSize: '13px', color: '#666' }}>
                          Afficher le telephone publiquement
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Photo */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                  <h5 style={{ color: '#354e84', fontWeight: '700', marginBottom: '20px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '700',
                        marginRight: '10px',
                      }}
                    >
                      4
                    </span>
                    {type === 'expert' ? 'Photo de profil' : 'Logo'}
                  </h5>

                  <FileUpload
                    accept=".jpg,.jpeg,.png,.webp"
                    maxSize={5}
                    label={type === 'expert' ? 'Choisir une photo' : 'Choisir un logo'}
                    currentFile={photo}
                    onFileSelect={setPhoto}
                    onRemove={() => setPhoto(null)}
                  />
                  <small className="text-muted d-block mt-2">
                    Formats acceptes : JPG, PNG, WebP. Taille maximale : 5 Mo.
                  </small>
                </div>
              </div>

              {/* Submit */}
              <div className="d-flex justify-content-between align-items-center">
                <Link
                  to="/annuaire"
                  className="btn btn-outline-secondary"
                  style={{ borderRadius: '8px', padding: '12px 24px', fontWeight: '600' }}
                >
                  <FontAwesome name="arrow-left" style={{ marginRight: '8px' }} />
                  Annuler
                </Link>
                <button
                  type="submit"
                  className="btn"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 36px',
                    fontWeight: '700',
                    fontSize: '15px',
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <FontAwesome name="paper-plane" style={{ marginRight: '8px' }} />
                      Soumettre l'inscription
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </>
  );
};

export default AnnuaireSubmitPage;
