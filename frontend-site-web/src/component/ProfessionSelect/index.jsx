import React, { useState, useRef, useEffect } from "react";

const PROFESSIONS = [
  // --- Santé animale & Vétérinaire (prioritaires) ---
  { group: "Santé animale & Vétérinaire", items: [
    "Vétérinaire",
    "Vétérinaire praticien",
    "Vétérinaire spécialiste",
    "Vétérinaire rural",
    "Vétérinaire inspecteur",
    "Vétérinaire militaire",
    "Vétérinaire de faune sauvage",
    "Vétérinaire aviaire",
    "Vétérinaire équin",
    "Technicien vétérinaire",
    "Assistant vétérinaire",
    "Auxiliaire vétérinaire",
    "Infirmier vétérinaire",
    "Laborantin vétérinaire",
    "Para-vétérinaire",
    "Agent de santé animale communautaire",
    "Épidémiologiste vétérinaire",
    "Pathologiste vétérinaire",
    "Chirurgien vétérinaire",
    "Pharmacien vétérinaire",
    "Biologiste vétérinaire",
    "Thériogénologue",
  ]},
  // --- Élevage & Production animale ---
  { group: "Élevage & Production animale", items: [
    "Éleveur",
    "Agro-éleveur",
    "Pasteur / Agro-pasteur",
    "Aviculteur",
    "Apiculteur",
    "Aquaculteur / Pisciculteur",
    "Technicien d'élevage",
    "Zootechnicien",
    "Inséminateur",
    "Nutritionniste animal",
    "Conseiller en production animale",
  ]},
  // --- Santé publique & One Health ---
  { group: "Santé publique & One Health", items: [
    "Médecin",
    "Médecin de santé publique",
    "Épidémiologiste",
    "Spécialiste One Health",
    "Inspecteur sanitaire",
    "Hygiéniste",
    "Spécialiste en sécurité alimentaire",
    "Microbiologiste",
    "Parasitologue",
    "Toxicologue",
  ]},
  // --- Recherche & Enseignement ---
  { group: "Recherche & Enseignement", items: [
    "Chercheur",
    "Enseignant-chercheur",
    "Professeur d'université",
    "Doctorant / PhD",
    "Post-doctorant",
    "Directeur de recherche",
    "Technicien de laboratoire",
    "Responsable de laboratoire",
  ]},
  // --- Étudiants ---
  { group: "Étudiants", items: [
    "Étudiant en médecine vétérinaire",
    "Étudiant en sciences animales",
    "Étudiant en agronomie",
    "Étudiant en biologie",
    "Étudiant en santé publique",
    "Stagiaire",
  ]},
  // --- Institutions & Organisations ---
  { group: "Institutions & Organisations", items: [
    "Fonctionnaire des services vétérinaires",
    "Cadre au ministère de l'élevage",
    "Agent des eaux et forêts",
    "Responsable ONG / Association",
    "Consultant international",
    "Expert en développement rural",
    "Coordonnateur de projet",
    "Responsable programme santé animale",
  ]},
  // --- Industrie & Commerce ---
  { group: "Industrie & Commerce", items: [
    "Pharmacien",
    "Représentant pharmaceutique vétérinaire",
    "Responsable qualité agroalimentaire",
    "Industriel en alimentation animale",
    "Commerçant de bétail",
    "Importateur / Distributeur de produits vétérinaires",
    "Boucher / Abatteur",
  ]},
  // --- Autres ---
  { group: "Autres", items: [
    "Journaliste / Communicateur",
    "Informaticien / Développeur",
    "Juriste",
    "Économiste",
    "Sociologue",
    "Géographe / Cartographe",
    "Autre",
  ]},
];

// Flat list for search
const ALL_PROFESSIONS = PROFESSIONS.flatMap(g => g.items);

const ProfessionSelect = ({ value, onChange, name = "profession", required, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const select = (profession) => {
    onChange({ target: { name, value: profession } });
    setIsOpen(false);
    setSearch("");
  };

  // Filter by search
  const filteredGroups = search
    ? PROFESSIONS.map(g => ({
        ...g,
        items: g.items.filter(p => normalize(p).includes(normalize(search)))
      })).filter(g => g.items.length > 0)
    : PROFESSIONS;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "12px 40px 12px 14px",
          border: "2px solid #e2e8f0",
          borderRadius: "10px",
          background: disabled ? "#f1f5f9" : "#fff",
          textAlign: "left",
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: "0.95rem",
          color: value ? "#1e293b" : "#94a3b8",
          transition: "border-color 0.2s",
          borderColor: isOpen ? "#7ac142" : "#e2e8f0",
          outline: "none",
          appearance: "none"
        }}
      >
        {value || "Sélectionnez votre profession"}
        <span style={{
          position: "absolute", right: "14px", top: "50%",
          transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
          transition: "transform 0.2s", color: "#94a3b8", fontSize: "12px"
        }}>
          <i className="fa fa-chevron-down"></i>
        </span>
      </button>

      {required && !value && (
        <input tabIndex={-1} style={{ position: "absolute", opacity: 0, height: 0, width: 0 }}
          required value={value} onChange={() => {}} />
      )}

      {isOpen && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 1000,
          background: "#fff", borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)", border: "1px solid #e2e8f0",
          overflow: "hidden", animation: "profDropOpen 0.15s ease"
        }}>
          {/* Search */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ position: "relative" }}>
              <i className="fa fa-search" style={{
                position: "absolute", left: "12px", top: "50%",
                transform: "translateY(-50%)", color: "#94a3b8", fontSize: "13px"
              }}></i>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une profession..."
                style={{
                  width: "100%", padding: "10px 12px 10px 36px",
                  border: "1px solid #e2e8f0", borderRadius: "8px",
                  fontSize: "0.9rem", outline: "none", background: "#f8fafc"
                }}
                onFocus={(e) => e.target.style.borderColor = "#7ac142"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}
                  style={{ position: "absolute", right: "8px", top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}>
                  <i className="fa fa-times"></i>
                </button>
              )}
            </div>
          </div>

          {/* Grouped list */}
          <div style={{ maxHeight: "280px", overflowY: "auto" }}>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div key={group.group}>
                  <div style={{
                    padding: "8px 16px 4px", fontSize: "0.75rem", fontWeight: 700,
                    color: "#7ac142", textTransform: "uppercase", letterSpacing: "0.5px",
                    background: "#f8fafc", borderTop: "1px solid #f1f5f9",
                    position: "sticky", top: 0
                  }}>
                    {group.group}
                  </div>
                  {group.items.map((item) => (
                    <button key={item} type="button" onClick={() => select(item)}
                      style={{
                        display: "block", width: "100%", padding: "9px 16px 9px 24px",
                        border: "none",
                        background: item === value ? "#f0fdf4" : "transparent",
                        textAlign: "left", cursor: "pointer", fontSize: "0.88rem",
                        color: item === value ? "#15803d" : "#334155",
                        fontWeight: item === value ? 600 : 400,
                        transition: "background 0.1s"
                      }}
                      onMouseOver={(e) => { if (item !== value) e.target.style.background = "#f8fafc"; }}
                      onMouseOut={(e) => { if (item !== value) e.target.style.background = "transparent"; }}
                    >
                      {item === value && <i className="fa fa-check" style={{ marginRight: "8px", color: "#7ac142" }}></i>}
                      {item}
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>
                Aucune profession trouvée
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes profDropOpen {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProfessionSelect;
