import React from "react";
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
    colorRgb: "16, 145, 255"
  },
  {
    id: 2,
    icon: "globe",
    title: "One Health",
    description: "Santé humaine, animale, environnement",
    link: "/categorie/one-health",
    color: "#00AB6C",
    colorRgb: "0, 171, 108"
  },
  {
    id: 3,
    icon: "graduation-cap",
    title: "Se Former",
    description: "Formations et certifications",
    link: "/categorie/formations",
    color: "#FF6B35",
    colorRgb: "255, 107, 53"
  },
  {
    id: 4,
    icon: "briefcase",
    title: "Opportunités",
    description: "Emplois et appels d'offres",
    link: "/categorie/opportunites",
    color: "#8B5CF6",
    colorRgb: "139, 92, 246"
  },
  {
    id: 5,
    icon: "address-book",
    title: "Annuaire Vétérinaire",
    description: "Annuaire Vétérinaire Panafricain",
    link: "/annuaire",
    color: "#EC4899",
    colorRgb: "236, 72, 153"
  }
];

const PillarsSection = () => {
  return (
    <section className="pillars-section">
      <div className="container">
        <div className="pillars-wrapper">
          {/* Left: 5 Pillars */}
          <div className="pillars-grid">
            <div className="pillars-header">
              <h2>Les 5 Piliers <span>AfricaVet</span></h2>
              <p>Votre écosystème complet pour la santé animale en Afrique</p>
            </div>
            <div className="pillars-cards">
              {pillars.map((pillar) => (
                <Link
                  to={pillar.link}
                  key={pillar.id}
                  className="pillar-card"
                  style={{
                    '--pillar-color': pillar.color,
                    '--pillar-color-rgb': pillar.colorRgb
                  }}
                >
                  <div className="pillar-icon">
                    <FontAwesome name={pillar.icon} />
                  </div>
                  <div className="pillar-content">
                    <h3>{pillar.title}</h3>
                    <p>{pillar.description}</p>
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
                </div>
                <h3>Rejoignez AfricaVet</h3>
                <p>Accédez à du contenu exclusif et connectez-vous avec la communauté</p>
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
