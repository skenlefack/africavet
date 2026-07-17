import React, { useState, useRef, useEffect } from "react";

const AFRICAN_COUNTRIES = [
  "Afrique du Sud", "Algérie", "Angola", "Bénin", "Botswana",
  "Burkina Faso", "Burundi", "Cameroun", "Cap-Vert", "Centrafrique",
  "Comores", "Congo", "Côte d'Ivoire", "Djibouti", "Égypte",
  "Érythrée", "Eswatini", "Éthiopie", "Gabon", "Gambie",
  "Ghana", "Guinée", "Guinée équatoriale", "Guinée-Bissau", "Kenya",
  "Lesotho", "Liberia", "Libye", "Madagascar", "Malawi",
  "Mali", "Maroc", "Maurice", "Mauritanie", "Mozambique",
  "Namibie", "Niger", "Nigeria", "Ouganda", "RD Congo",
  "Rwanda", "São Tomé-et-Príncipe", "Sénégal", "Seychelles", "Sierra Leone",
  "Somalie", "Soudan", "Soudan du Sud", "Tanzanie", "Tchad",
  "Togo", "Tunisie", "Zambie", "Zimbabwe",
];

const AfricanCountrySelect = ({ value, onChange, name = "country", required, disabled, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtered = search
    ? AFRICAN_COUNTRIES.filter(c => normalize(c).includes(normalize(search)))
    : AFRICAN_COUNTRIES;

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

  const select = (country) => {
    onChange({ target: { name, value: country } });
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} style={{ position: "relative", ...style }}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: "100%", padding: "12px 40px 12px 14px",
          border: "2px solid #e2e8f0", borderRadius: "10px",
          background: disabled ? "#f1f5f9" : "#fff",
          textAlign: "left", cursor: disabled ? "not-allowed" : "pointer",
          fontSize: "0.95rem", color: value ? "#1e293b" : "#94a3b8",
          borderColor: isOpen ? "#7ac142" : "#e2e8f0",
          outline: "none", appearance: "none", transition: "border-color 0.2s"
        }}
      >
        {value || "Sélectionnez un pays africain"}
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
          overflow: "hidden", animation: "acDropOpen 0.15s ease"
        }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ position: "relative" }}>
              <i className="fa fa-search" style={{
                position: "absolute", left: "12px", top: "50%",
                transform: "translateY(-50%)", color: "#94a3b8", fontSize: "13px"
              }}></i>
              <input ref={inputRef} type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un pays..."
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
          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            {filtered.length > 0 ? filtered.map((country) => (
              <button key={country} type="button" onClick={() => select(country)}
                style={{
                  display: "block", width: "100%", padding: "10px 16px",
                  border: "none", background: country === value ? "#f0fdf4" : "transparent",
                  textAlign: "left", cursor: "pointer", fontSize: "0.9rem",
                  color: country === value ? "#15803d" : "#334155",
                  fontWeight: country === value ? 600 : 400, transition: "background 0.1s"
                }}
                onMouseOver={(e) => { if (country !== value) e.target.style.background = "#f8fafc"; }}
                onMouseOut={(e) => { if (country !== value) e.target.style.background = "transparent"; }}
              >
                {country === value && <i className="fa fa-check" style={{ marginRight: "8px", color: "#7ac142" }}></i>}
                {country}
              </button>
            )) : (
              <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>
                Aucun pays trouvé
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes acDropOpen {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export { AFRICAN_COUNTRIES };
export default AfricanCountrySelect;
