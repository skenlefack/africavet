import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FontAwesome from "../../component/uiStyle/FontAwesome";
import LoadingSpinner from "../../component/shared/LoadingSpinner";
import TabNav from "../../component/shared/TabNav";
import FileUpload from "../../component/shared/FileUpload";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";
import "./profile.scss";

const PROFESSIONS = [
  { value: "", label: "Selectionnez une profession" },
  { value: "veterinaire", label: "Veterinaire" },
  { value: "technicien_veterinaire", label: "Technicien veterinaire" },
  { value: "para_veterinaire", label: "Para-veterinaire" },
  { value: "eleveur", label: "Eleveur" },
  { value: "chercheur", label: "Chercheur" },
  { value: "enseignant", label: "Enseignant" },
  { value: "etudiant", label: "Etudiant" },
  { value: "pharmacien", label: "Pharmacien" },
  { value: "agronome", label: "Agronome" },
  { value: "autre", label: "Autre" },
];

const EDUCATION_LEVELS = [
  { value: "", label: "Selectionnez un niveau" },
  { value: "bac", label: "Baccalaureat" },
  { value: "licence", label: "Licence / Bachelor" },
  { value: "master", label: "Master" },
  { value: "doctorat", label: "Doctorat / PhD" },
  { value: "post_doc", label: "Post-Doctorat" },
  { value: "diplome_veterinaire", label: "Diplome veterinaire" },
  { value: "autre", label: "Autre" },
];

const COUNTRIES = [
  "Senegal", "Mali", "Cote d'Ivoire", "Burkina Faso", "Niger", "Cameroun",
  "Maroc", "Tunisie", "Algerie", "Guinee", "Tchad", "Togo", "Benin",
  "Mauritanie", "Gabon", "Congo", "RD Congo", "Madagascar", "Kenya",
  "Ethiopie", "Nigeria", "Ghana", "Afrique du Sud", "Autre",
];

const TABS = [
  { value: "personal", label: "Info personnelles", icon: "fa fa-user" },
  { value: "professional", label: "Professionnel", icon: "fa fa-briefcase" },
  { value: "cv", label: "CV", icon: "fa fa-file-text" },
  { value: "password", label: "Mot de passe", icon: "fa fa-lock" },
  { value: "notifications", label: "Notifications", icon: "fa fa-bell" },
];

const ProfilePage = () => {
  const { user, token, updateProfile: ctxUpdateProfile, setUser } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Personal info form
  const [personalForm, setPersonalForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Professional form
  const [professionalForm, setProfessionalForm] = useState({
    profession: "",
    specialization: "",
    country: "",
    city: "",
    years_experience: "",
    education_level: "",
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    email_opportunities: true,
    email_vet_alerts: true,
    email_elearning: true,
    inapp_opportunities: true,
    inapp_vet_alerts: true,
    inapp_elearning: true,
    inapp_system: true,
    email_frequency: "daily",
  });

  // CV state
  const [currentCV, setCurrentCV] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);

  // Show toast
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Populate forms from user data
  useEffect(() => {
    if (user) {
      setPersonalForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setAvatarPreview(user.avatar || null);
      setProfessionalForm({
        profession: user.profession || "",
        specialization: user.specialization || "",
        country: user.country || "",
        city: user.city || "",
        years_experience: user.years_experience || "",
        education_level: user.education_level || "",
      });
      setSkills(user.skills ? (Array.isArray(user.skills) ? user.skills : user.skills.split(",").map(s => s.trim()).filter(Boolean)) : []);
      setCurrentCV(user.cv_filename || null);
    }
  }, [user]);

  // Load notification preferences
  useEffect(() => {
    if (activeTab === "notifications" && token) {
      loadNotifPrefs();
    }
  }, [activeTab, token]);

  const loadNotifPrefs = async () => {
    setLoading(true);
    try {
      const response = await authApi.getNotificationPrefs(token);
      if (response.success && response.data) {
        setNotifPrefs(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error("Error loading notification prefs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar selection
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("L'image ne doit pas depasser 5 MB", "error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("Veuillez selectionner une image valide", "error");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Save personal info
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...personalForm };
      delete data.email; // email is readonly
      const response = await ctxUpdateProfile(data);
      if (response.success) {
        showToast("Informations personnelles mises a jour avec succes");
      } else {
        showToast(response.message || "Erreur lors de la sauvegarde", "error");
      }
    } catch {
      showToast("Une erreur est survenue", "error");
    } finally {
      setSaving(false);
    }
  };

  // Save professional info
  const handleSaveProfessional = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...professionalForm,
        skills: skills.join(", "),
      };
      const response = await ctxUpdateProfile(data);
      if (response.success) {
        showToast("Informations professionnelles mises a jour avec succes");
      } else {
        showToast(response.message || "Erreur lors de la sauvegarde", "error");
      }
    } catch {
      showToast("Une erreur est survenue", "error");
    } finally {
      setSaving(false);
    }
  };

  // Skills tag handling
  const handleSkillKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim().replace(/,/g, "");
      if (newSkill && !skills.includes(newSkill)) {
        setSkills(prev => [...prev, newSkill]);
      }
      setSkillInput("");
    } else if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      setSkills(prev => prev.slice(0, -1));
    }
  };

  const removeSkill = (index) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  // Upload CV
  const handleCVSelect = (file) => {
    setCvFile(file);
  };

  const handleCVUpload = async () => {
    if (!cvFile) return;
    setCvUploading(true);
    try {
      const formData = new FormData();
      formData.append("cv", cvFile);
      const response = await authApi.uploadCV(formData, token);
      if (response.success) {
        setCurrentCV(response.data?.filename || cvFile.name);
        setCvFile(null);
        setUser(prev => ({ ...prev, cv_filename: response.data?.filename || cvFile.name }));
        showToast("CV telecharge avec succes");
      } else {
        showToast(response.message || "Erreur lors du telechargement", "error");
      }
    } catch {
      showToast("Une erreur est survenue", "error");
    } finally {
      setCvUploading(false);
    }
  };

  const handleCVDelete = async () => {
    if (!window.confirm("Etes-vous sur de vouloir supprimer votre CV ?")) return;
    setSaving(true);
    try {
      const response = await authApi.deleteCV(token);
      if (response.success) {
        setCurrentCV(null);
        setCvFile(null);
        setUser(prev => ({ ...prev, cv_filename: null }));
        showToast("CV supprime avec succes");
      } else {
        showToast(response.message || "Erreur lors de la suppression", "error");
      }
    } catch {
      showToast("Une erreur est survenue", "error");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast("Les mots de passe ne correspondent pas", "error");
      return;
    }
    if (passwordForm.new_password.length < 6) {
      showToast("Le mot de passe doit contenir au moins 6 caracteres", "error");
      return;
    }
    setSaving(true);
    try {
      const response = await authApi.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      }, token);
      if (response.success) {
        setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
        showToast("Mot de passe modifie avec succes");
      } else {
        showToast(response.message || "Erreur lors du changement de mot de passe", "error");
      }
    } catch {
      showToast("Une erreur est survenue", "error");
    } finally {
      setSaving(false);
    }
  };

  // Save notification preferences
  const handleSaveNotifPrefs = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await authApi.updateNotificationPrefs(notifPrefs, token);
      if (response.success) {
        showToast("Preferences de notifications mises a jour");
      } else {
        showToast(response.message || "Erreur lors de la sauvegarde", "error");
      }
    } catch {
      showToast("Une erreur est survenue", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <LoadingSpinner fullPage text="Chargement du profil..." />;
  }

  return (
    <div className="profile-page">
      <div className="container">
        {/* Toast notification */}
        {toast && (
          <div className={`profile-toast ${toast.type}`}>
            <FontAwesome name={toast.type === "success" ? "check-circle" : "exclamation-circle"} />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="toast-close">
              <FontAwesome name="times" />
            </button>
          </div>
        )}

        {/* Page header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar-wrapper" onClick={() => avatarInputRef.current?.click()}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    <FontAwesome name="user" />
                  </div>
                )}
                <div className="avatar-overlay">
                  <FontAwesome name="camera" />
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  style={{ display: "none" }}
                />
              </div>
              <div className="profile-user-info">
                <h1>{user.first_name} {user.last_name}</h1>
                <p className="profile-email"><FontAwesome name="envelope" /> {user.email}</p>
                {user.profession && <span className="profile-badge"><FontAwesome name="briefcase" /> {user.profession}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab content */}
        <div className="profile-tab-content">

          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3><FontAwesome name="user" /> Informations personnelles</h3>
                <p>Gerez vos informations de base</p>
              </div>
              <form onSubmit={handleSavePersonal}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="profile-form-group">
                      <label htmlFor="first_name">Prenom</label>
                      <input
                        type="text"
                        id="first_name"
                        value={personalForm.first_name}
                        onChange={(e) => setPersonalForm(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="Votre prenom"
                        required
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="profile-form-group">
                      <label htmlFor="last_name">Nom</label>
                      <input
                        type="text"
                        id="last_name"
                        value={personalForm.last_name}
                        onChange={(e) => setPersonalForm(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Votre nom"
                        required
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="profile-form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        value={personalForm.email}
                        readOnly
                        disabled
                        className="input-readonly"
                      />
                      <small className="text-muted">L'email ne peut pas etre modifie</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="profile-form-group">
                      <label htmlFor="phone">Telephone</label>
                      <input
                        type="tel"
                        id="phone"
                        value={personalForm.phone}
                        onChange={(e) => setPersonalForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+221 77 000 00 00"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
                <div className="profile-form-actions">
                  <button type="submit" className="btn-profile-save" disabled={saving}>
                    {saving ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                    ) : (
                      <><FontAwesome name="check" /> Enregistrer</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Professional Tab */}
          {activeTab === "professional" && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3><FontAwesome name="briefcase" /> Informations professionnelles</h3>
                <p>Detaillez votre parcours et vos competences</p>
              </div>
              <form onSubmit={handleSaveProfessional}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="profile-form-group">
                      <label htmlFor="profession">Profession</label>
                      <select
                        id="profession"
                        value={professionalForm.profession}
                        onChange={(e) => setProfessionalForm(prev => ({ ...prev, profession: e.target.value }))}
                        disabled={saving}
                      >
                        {PROFESSIONS.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="profile-form-group">
                      <label htmlFor="specialization">Specialisation</label>
                      <input
                        type="text"
                        id="specialization"
                        value={professionalForm.specialization}
                        onChange={(e) => setProfessionalForm(prev => ({ ...prev, specialization: e.target.value }))}
                        placeholder="Ex: Sante animale, Aviculture..."
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="profile-form-group">
                      <label htmlFor="country">Pays</label>
                      <select
                        id="country"
                        value={professionalForm.country}
                        onChange={(e) => setProfessionalForm(prev => ({ ...prev, country: e.target.value }))}
                        disabled={saving}
                      >
                        <option value="">Selectionnez un pays</option>
                        {COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="profile-form-group">
                      <label htmlFor="city">Ville</label>
                      <input
                        type="text"
                        id="city"
                        value={professionalForm.city}
                        onChange={(e) => setProfessionalForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Votre ville"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="profile-form-group">
                      <label htmlFor="years_experience">Annees d'experience</label>
                      <input
                        type="number"
                        id="years_experience"
                        min="0"
                        max="50"
                        value={professionalForm.years_experience}
                        onChange={(e) => setProfessionalForm(prev => ({ ...prev, years_experience: e.target.value }))}
                        placeholder="0"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="profile-form-group">
                      <label htmlFor="education_level">Niveau d'etudes</label>
                      <select
                        id="education_level"
                        value={professionalForm.education_level}
                        onChange={(e) => setProfessionalForm(prev => ({ ...prev, education_level: e.target.value }))}
                        disabled={saving}
                      >
                        {EDUCATION_LEVELS.map(l => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="profile-form-group">
                  <label>Competences</label>
                  <div className="skills-input-container">
                    <div className="skills-tags">
                      {skills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                          <button type="button" onClick={() => removeSkill(index)} className="skill-remove">
                            <FontAwesome name="times" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        placeholder={skills.length === 0 ? "Tapez une competence et appuyez Entree" : "Ajouter..."}
                        className="skill-text-input"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <small className="text-muted">Appuyez sur Entree ou virgule pour ajouter une competence</small>
                </div>
                <div className="profile-form-actions">
                  <button type="submit" className="btn-profile-save" disabled={saving}>
                    {saving ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                    ) : (
                      <><FontAwesome name="check" /> Enregistrer</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CV Tab */}
          {activeTab === "cv" && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3><FontAwesome name="file-text" /> Curriculum Vitae</h3>
                <p>Telechargez votre CV pour postuler aux opportunites</p>
              </div>
              <div className="cv-section">
                {currentCV && !cvFile && (
                  <div className="cv-current">
                    <div className="cv-file-info">
                      <div className="cv-file-icon">
                        <FontAwesome name="file-pdf-o" />
                      </div>
                      <div className="cv-file-details">
                        <span className="cv-filename">{currentCV}</span>
                        <span className="cv-status"><FontAwesome name="check-circle" /> CV actuel</span>
                      </div>
                    </div>
                    <div className="cv-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setCvFile("replace")}
                      >
                        <FontAwesome name="refresh" /> Remplacer
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleCVDelete}
                        disabled={saving}
                      >
                        <FontAwesome name="trash" /> Supprimer
                      </button>
                    </div>
                  </div>
                )}

                {(!currentCV || cvFile === "replace") && (
                  <div className="cv-upload-area">
                    <FileUpload
                      onFileSelect={handleCVSelect}
                      accept=".pdf,.doc,.docx"
                      maxSize={10}
                      label="Choisir un fichier CV"
                      currentFile={cvFile && cvFile !== "replace" ? cvFile : null}
                      onRemove={() => setCvFile(null)}
                    />
                    {cvFile && cvFile !== "replace" && (
                      <div className="cv-upload-actions mt-3">
                        <button
                          type="button"
                          className="btn-profile-save"
                          onClick={handleCVUpload}
                          disabled={cvUploading}
                        >
                          {cvUploading ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>Telechargement...</>
                          ) : (
                            <><FontAwesome name="upload" /> Telecharger le CV</>
                          )}
                        </button>
                        {currentCV && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary ms-2"
                            onClick={() => setCvFile(null)}
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!currentCV && !cvFile && (
                  <div className="cv-empty-state">
                    <div className="cv-empty-icon">
                      <FontAwesome name="cloud-upload" />
                    </div>
                    <h4>Aucun CV telecharge</h4>
                    <p>Telechargez votre CV pour pouvoir postuler rapidement aux opportunites</p>
                    <FileUpload
                      onFileSelect={handleCVSelect}
                      accept=".pdf,.doc,.docx"
                      maxSize={10}
                      label="Choisir un fichier CV"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3><FontAwesome name="lock" /> Changer le mot de passe</h3>
                <p>Assurez la securite de votre compte</p>
              </div>
              <form onSubmit={handleChangePassword}>
                <div className="row justify-content-center">
                  <div className="col-md-8 col-lg-6">
                    <div className="profile-form-group">
                      <label htmlFor="current_password">Mot de passe actuel</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          id="current_password"
                          value={passwordForm.current_password}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                          placeholder="Votre mot de passe actuel"
                          required
                          disabled={saving}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        >
                          <FontAwesome name={showPasswords.current ? "eye-slash" : "eye"} />
                        </button>
                      </div>
                    </div>
                    <div className="profile-form-group">
                      <label htmlFor="new_password">Nouveau mot de passe</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          id="new_password"
                          value={passwordForm.new_password}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                          placeholder="Minimum 6 caracteres"
                          required
                          minLength={6}
                          disabled={saving}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          <FontAwesome name={showPasswords.new ? "eye-slash" : "eye"} />
                        </button>
                      </div>
                    </div>
                    <div className="profile-form-group">
                      <label htmlFor="confirm_password">Confirmer le nouveau mot de passe</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          id="confirm_password"
                          value={passwordForm.confirm_password}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                          placeholder="Confirmez le mot de passe"
                          required
                          minLength={6}
                          disabled={saving}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          <FontAwesome name={showPasswords.confirm ? "eye-slash" : "eye"} />
                        </button>
                      </div>
                      {passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password && (
                        <small className="text-danger">Les mots de passe ne correspondent pas</small>
                      )}
                    </div>
                    <div className="profile-form-actions">
                      <button type="submit" className="btn-profile-save" disabled={saving}>
                        {saving ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Modification...</>
                        ) : (
                          <><FontAwesome name="lock" /> Changer le mot de passe</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3><FontAwesome name="bell" /> Preferences de notifications</h3>
                <p>Choisissez quelles notifications vous souhaitez recevoir</p>
              </div>
              {loading ? (
                <LoadingSpinner text="Chargement des preferences..." />
              ) : (
                <form onSubmit={handleSaveNotifPrefs}>
                  <div className="notif-prefs-section">
                    <h4 className="notif-section-title">
                      <FontAwesome name="envelope" /> Notifications par email
                    </h4>
                    <div className="notif-toggle-list">
                      <div className="notif-toggle-item">
                        <div className="notif-toggle-info">
                          <span className="notif-toggle-label">Opportunites d'emploi</span>
                          <span className="notif-toggle-desc">Nouvelles offres correspondant a votre profil</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={notifPrefs.email_opportunities}
                            onChange={(e) => setNotifPrefs(prev => ({ ...prev, email_opportunities: e.target.checked }))}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notif-toggle-item">
                        <div className="notif-toggle-info">
                          <span className="notif-toggle-label">Alertes veterinaires</span>
                          <span className="notif-toggle-desc">Alertes sanitaires et epidemiologiques</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={notifPrefs.email_vet_alerts}
                            onChange={(e) => setNotifPrefs(prev => ({ ...prev, email_vet_alerts: e.target.checked }))}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notif-toggle-item">
                        <div className="notif-toggle-info">
                          <span className="notif-toggle-label">E-Learning</span>
                          <span className="notif-toggle-desc">Nouvelles formations et mises a jour de cours</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={notifPrefs.email_elearning}
                            onChange={(e) => setNotifPrefs(prev => ({ ...prev, email_elearning: e.target.checked }))}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="notif-frequency">
                      <label htmlFor="email_frequency">Frequence des emails</label>
                      <select
                        id="email_frequency"
                        value={notifPrefs.email_frequency}
                        onChange={(e) => setNotifPrefs(prev => ({ ...prev, email_frequency: e.target.value }))}
                      >
                        <option value="realtime">Temps reel</option>
                        <option value="daily">Quotidien (resume)</option>
                        <option value="weekly">Hebdomadaire (resume)</option>
                        <option value="never">Jamais</option>
                      </select>
                    </div>
                  </div>

                  <div className="notif-prefs-section">
                    <h4 className="notif-section-title">
                      <FontAwesome name="bell" /> Notifications dans l'application
                    </h4>
                    <div className="notif-toggle-list">
                      <div className="notif-toggle-item">
                        <div className="notif-toggle-info">
                          <span className="notif-toggle-label">Opportunites</span>
                          <span className="notif-toggle-desc">Notifications en temps reel des nouvelles offres</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={notifPrefs.inapp_opportunities}
                            onChange={(e) => setNotifPrefs(prev => ({ ...prev, inapp_opportunities: e.target.checked }))}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notif-toggle-item">
                        <div className="notif-toggle-info">
                          <span className="notif-toggle-label">Alertes veterinaires</span>
                          <span className="notif-toggle-desc">Alertes sanitaires en temps reel</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={notifPrefs.inapp_vet_alerts}
                            onChange={(e) => setNotifPrefs(prev => ({ ...prev, inapp_vet_alerts: e.target.checked }))}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notif-toggle-item">
                        <div className="notif-toggle-info">
                          <span className="notif-toggle-label">E-Learning</span>
                          <span className="notif-toggle-desc">Progression de cours et rappels</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={notifPrefs.inapp_elearning}
                            onChange={(e) => setNotifPrefs(prev => ({ ...prev, inapp_elearning: e.target.checked }))}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notif-toggle-item">
                        <div className="notif-toggle-info">
                          <span className="notif-toggle-label">Systeme</span>
                          <span className="notif-toggle-desc">Mises a jour de la plateforme et maintenance</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={notifPrefs.inapp_system}
                            onChange={(e) => setNotifPrefs(prev => ({ ...prev, inapp_system: e.target.checked }))}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="profile-form-actions">
                    <button type="submit" className="btn-profile-save" disabled={saving}>
                      {saving ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                      ) : (
                        <><FontAwesome name="check" /> Enregistrer les preferences</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
