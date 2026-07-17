import React, { useState } from "react";
import { Link } from "react-router-dom";
import FontAwesome from "../../component/uiStyle/FontAwesome";
import CountrySelect from "../../component/CountrySelect";
import { contactApi } from "../../services/api";

const TEAM_SIZES = [
  "1 vétérinaire (solo)",
  "2-5 vétérinaires",
  "6-15 vétérinaires",
  "16-50 vétérinaires",
  "+50 vétérinaires / réseau",
];

const ACTIVITIES = [
  "Cabinet / Clinique vétérinaire",
  "Élevage bovin",
  "Élevage avicole",
  "Élevage ovin / caprin",
  "Aquaculture / Pisciculture",
  "Élevage mixte",
  "Services vétérinaires d'État",
  "Coopérative / ONG",
  "Enseignement / Recherche",
  "Autre",
];

const DemoRequestPage = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", organization: "",
    country: "", activity: "", teamSize: "", message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const details = [
      `Organisation : ${formData.organization || "Non renseigné"}`,
      `Pays : ${formData.country}`,
      `Activité : ${formData.activity}`,
      `Taille de l'équipe : ${formData.teamSize}`,
      formData.phone ? `Téléphone : ${formData.phone}` : null,
      "",
      formData.message || "Aucun message complémentaire."
    ].filter(Boolean).join("\n");

    const res = await contactApi.submit({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: "Demande de démo RecallVET",
      message: details
    });

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.message || "Une erreur est survenue. Veuillez réessayer.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)" }}>
        <div className="container" style={{ maxWidth: "550px", textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto 24px",
            background: "linear-gradient(135deg, #7ac142 0%, #354e84 100%)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FontAwesome name="check" style={{ color: "#fff", fontSize: "36px" }} />
          </div>
          <h2 style={{ color: "#354e84", fontWeight: 800, marginBottom: "12px" }}>Demande envoyée !</h2>
          <p style={{ color: "#666", lineHeight: 1.7, marginBottom: "8px" }}>
            Merci <strong>{formData.name}</strong>, votre demande de démonstration RecallVET a bien été transmise à notre équipe.
          </p>
          <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "30px" }}>
            Un conseiller vous contactera sous 24-48h à l'adresse <strong>{formData.email}</strong> pour planifier votre démo personnalisée.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/recallvet" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "linear-gradient(135deg, #7ac142 0%, #354e84 100%)",
              color: "#fff", padding: "12px 24px", borderRadius: "10px",
              fontWeight: 600, textDecoration: "none" }}>
              <FontAwesome name="arrow-left" /> Retour à RecallVET
            </Link>
            <Link to="/" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#fff", color: "#354e84", padding: "12px 24px",
              borderRadius: "10px", fontWeight: 600, textDecoration: "none",
              border: "2px solid #354e84" }}>
              <FontAwesome name="home" /> Accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "80vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #354e84 0%, #2a4070 40%, #7ac142 100%)",
        padding: "3rem 0 2.5rem" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <Link to="/recallvet" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none",
            fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
            <FontAwesome name="arrow-left" /> Retour à RecallVET
          </Link>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.8rem", marginBottom: "8px" }}>
            <FontAwesome name="calendar" style={{ marginRight: "10px" }} />
            Demander une démo RecallVET
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: "1rem", lineHeight: 1.6 }}>
            Remplissez ce formulaire et notre équipe vous contactera pour une démonstration personnalisée
            adaptée à votre activité.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: "800px", padding: "2rem 15px 3rem" }}>
        <div className="row">
          {/* Form */}
          <div className="col-lg-8">
            <div style={{ background: "#fff", borderRadius: "16px", padding: "30px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px",
                  padding: "12px 16px", marginBottom: "20px", color: "#dc2626", fontSize: "0.9rem" }}>
                  <FontAwesome name="exclamation-circle" style={{ marginRight: "8px" }} />{error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label style={labelStyle}>Nom complet *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                      placeholder="Dr. Amadou Diallo" required disabled={loading} style={inputStyle} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label style={labelStyle}>Email professionnel *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder="amadou@cabinet-vet.com" required disabled={loading} style={inputStyle} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label style={labelStyle}>Téléphone / WhatsApp</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="+221 77 123 45 67" disabled={loading} style={inputStyle} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label style={labelStyle}>Organisation / Cabinet *</label>
                    <input type="text" name="organization" value={formData.organization} onChange={handleChange}
                      placeholder="Clinique Vétérinaire du Sahel" required disabled={loading} style={inputStyle} />
                  </div>
                </div>

                <div className="mb-3">
                  <label style={labelStyle}>Pays *</label>
                  <CountrySelect value={formData.country} onChange={handleChange}
                    name="country" required disabled={loading} />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label style={labelStyle}>Type d'activité *</label>
                    <select name="activity" value={formData.activity} onChange={handleChange}
                      required disabled={loading} style={inputStyle}>
                      <option value="">Sélectionnez</option>
                      {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label style={labelStyle}>Taille de l'équipe *</label>
                    <select name="teamSize" value={formData.teamSize} onChange={handleChange}
                      required disabled={loading} style={inputStyle}>
                      <option value="">Sélectionnez</option>
                      {TEAM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label style={labelStyle}>Message complémentaire</label>
                  <textarea name="message" value={formData.message} onChange={handleChange}
                    placeholder="Décrivez vos besoins, vos attentes, ou vos questions sur RecallVET..."
                    rows={4} disabled={loading} style={{ ...inputStyle, resize: "vertical" }} />
                </div>

                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "14px", border: "none", borderRadius: "12px",
                  background: loading ? "#94a3b8" : "linear-gradient(135deg, #7ac142 0%, #354e84 100%)",
                  color: "#fff", fontWeight: 700, fontSize: "1rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 14px rgba(122, 193, 66, 0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
                }}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm"></span> Envoi en cours...</>
                  ) : (
                    <><FontAwesome name="paper-plane" /> Envoyer ma demande de démo</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4 mt-4 mt-lg-0">
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
              <h5 style={{ fontWeight: 700, color: "#354e84", marginBottom: "16px", fontSize: "1rem" }}>
                <FontAwesome name="gift" style={{ color: "#7ac142", marginRight: "8px" }} />
                Ce que vous obtiendrez
              </h5>
              {[
                "Démo personnalisée de 30 min",
                "Présentation adaptée à votre activité",
                "Réponses à toutes vos questions",
                "Devis sur mesure",
                "Essai gratuit de 14 jours"
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px",
                  padding: "8px 0", borderBottom: i < 4 ? "1px solid #f1f5f9" : "none" }}>
                  <FontAwesome name="check-circle" style={{ color: "#7ac142", fontSize: "14px", flexShrink: 0 }} />
                  <span style={{ color: "#555", fontSize: "0.88rem" }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "linear-gradient(135deg, #354e84 0%, #2a4070 100%)",
              borderRadius: "16px", padding: "24px", color: "#fff" }}>
              <h5 style={{ fontWeight: 700, marginBottom: "12px", fontSize: "1rem" }}>
                <FontAwesome name="phone" style={{ marginRight: "8px" }} />
                Besoin d'aide ?
              </h5>
              <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "rgba(255,255,255,0.8)", marginBottom: "16px" }}>
                Notre équipe est disponible pour répondre à vos questions par email.
              </p>
              <a href="mailto:info@africavet.com" style={{
                display: "flex", alignItems: "center", gap: "8px", color: "#7ac142",
                textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
                <FontAwesome name="envelope" /> info@africavet.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block", marginBottom: "6px", fontWeight: 600,
  fontSize: "0.88rem", color: "#374151"
};

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "2px solid #e2e8f0",
  borderRadius: "10px", fontSize: "0.95rem", outline: "none",
  transition: "border-color 0.2s", background: "#fff"
};

export default DemoRequestPage;
