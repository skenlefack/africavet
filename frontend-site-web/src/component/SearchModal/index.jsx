import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SearchModal = ({ onClose }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (search.trim()) {
      onClose();
      navigate(`/recherche?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "15vh",
        animation: "fadeInSearch 0.2s ease"
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%",
        maxWidth: "640px",
        padding: "0 1rem",
        animation: "slideDownSearch 0.25s ease"
      }}>
        <form onSubmit={submitHandler}>
          <div style={{
            display: "flex",
            background: "#fff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "0 1.2rem",
              color: "#7ac142"
            }}>
              <i className="fas fa-search" style={{ fontSize: "1.2rem" }}></i>
            </div>
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Rechercher des articles, opportunités, formations..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "1.2rem 0",
                fontSize: "1.1rem",
                background: "transparent"
              }}
            />
            <button
              type="submit"
              style={{
                border: "none",
                background: search.trim() ? "linear-gradient(135deg, #7ac142, #354e84)" : "#e2e8f0",
                color: search.trim() ? "#fff" : "#94a3b8",
                padding: "0 1.5rem",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: search.trim() ? "pointer" : "default",
                transition: "all 0.2s"
              }}
            >
              Rechercher
            </button>
          </div>
        </form>

        <div className="text-center mt-3">
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <i className="fas fa-times me-1"></i> Fermer (Echap)
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInSearch {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDownSearch {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SearchModal;
