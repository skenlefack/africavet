import React, { useState } from "react";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";
import "./pillars.scss";

const pillars = [
  {
    id: 1,
    icon: "newspaper-o",
    title: "S'informer",
    description: "Actualités vétérinaires africaines",
    link: "/categorie/news",
    color: "#1091FF",
    colorRgb: "16, 145, 255",
    stat: "800+",
    statLabel: "articles"
  },
  {
    id: 2,
    icon: "globe",
    title: "One Health",
    description: "Santé humaine, animale, environnement",
    link: "/categorie/one-health",
    color: "#00AB6C",
    colorRgb: "0, 171, 108",
    stat: "54",
    statLabel: "pays"
  },
  {
    id: 3,
    icon: "graduation-cap",
    title: "Se Former",
    description: "Formations et certifications",
    link: "/formations",
    color: "#FF6B35",
    colorRgb: "255, 107, 53",
    stat: "150+",
    statLabel: "cours"
  },
  {
    id: 4,
    icon: "briefcase",
    title: "Opportunités",
    description: "Emplois et appels d'offres",
    link: "/opportunites",
    color: "#8B5CF6",
    colorRgb: "139, 92, 246",
    stat: "400+",
    statLabel: "offres"
  },
  {
    id: 5,
    icon: "address-book",
    title: "Annuaire",
    description: "Annuaire Vétérinaire Panafricain",
    link: "/annuaire",
    color: "#EC4899",
    colorRgb: "236, 72, 153",
    stat: "5000+",
    statLabel: "pros"
  }
];

const PillarsSection = () => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section className="pillars-section">
      <div className="container">
        <div className="pillars-wrapper">
          {/* Animated background shapes */}
          <div className="pillars-bg-shapes">
            <div className="shape shape-1" />
            <div className="shape shape-2" />
            <div className="shape shape-3" />
          </div>

          {/* Left: 5 Pillars */}
          <div className="pillars-grid">
            <div className="pillars-header">
              <div className="pillars-badge">
                <FontAwesome name="star" /> Nos Services
              </div>
              <h2>Les 5 Piliers <span>AfricaVet</span></h2>
              <p>Votre écosystème complet pour la santé animale en Afrique</p>
            </div>
            <div className="pillars-cards">
              {pillars.map((pillar, index) => (
                <Link
                  to={pillar.link}
                  key={pillar.id}
                  className={`pillar-card ${hoveredId === pillar.id ? 'active' : ''}`}
                  style={{
                    '--pillar-color': pillar.color,
                    '--pillar-color-rgb': pillar.colorRgb,
                    '--card-delay': `${index * 0.08}s`
                  }}
                  onMouseEnter={() => setHoveredId(pillar.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="pillar-glow" />
                  <div className="pillar-icon">
                    <FontAwesome name={pillar.icon} />
                  </div>
                  <div className="pillar-content">
                    <h3>{pillar.title}</h3>
                    <p>{pillar.description}</p>
                  </div>
                  <div className="pillar-stat">
                    <span className="stat-value">{pillar.stat}</span>
                    <span className="stat-label">{pillar.statLabel}</span>
                  </div>
                  <div className="pillar-arrow">
                    <FontAwesome name="arrow-right" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Auth Section */}
          <div className="auth-section">
            <div className="auth-card">
              <div className="auth-header">
                <div className="auth-icon">
                  <FontAwesome name="user-circle" />
                  <div className="auth-pulse" />
                </div>
                <h3>Rejoignez AfricaVet</h3>
                <p>Accédez à du contenu exclusif et connectez-vous avec la communauté</p>
              </div>
              <div className="auth-features">
                <div className="auth-feature">
                  <FontAwesome name="check-circle" />
                  <span>Formations gratuites</span>
                </div>
                <div className="auth-feature">
                  <FontAwesome name="check-circle" />
                  <span>Alertes sanitaires</span>
                </div>
                <div className="auth-feature">
                  <FontAwesome name="check-circle" />
                  <span>Offres d'emploi</span>
                </div>
              </div>
              <div className="auth-buttons">
                <Link to="/inscription" className="btn-primary">
                  <FontAwesome name="user-plus" />
                  Créer un compte gratuit
                </Link>
                <Link to="/connexion" className="btn-secondary">
                  <FontAwesome name="sign-in" />
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PillarsSection;
