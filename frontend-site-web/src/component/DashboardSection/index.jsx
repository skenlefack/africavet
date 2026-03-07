import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";
import "./style.scss";

const dashboardItems = [
  {
    id: 1,
    icon: "address-book",
    title: "Annuaire Vétérinaire",
    subtitle: "Panafricain",
    description: "Trouvez des professionnels de la santé animale",
    stats: { value: "5000+", label: "Professionnels" },
    link: "/annuaire",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)"
  },
  {
    id: 2,
    icon: "graduation-cap",
    title: "E-Learning",
    subtitle: "Formation continue",
    description: "Cours et certifications en ligne",
    stats: { value: "150+", label: "Formations" },
    link: "/e-learning",
    color: "#FF6B35",
    gradient: "linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)"
  },
  {
    id: 3,
    icon: "briefcase",
    title: "Opportunités",
    subtitle: "& Emploi",
    description: "Offres d'emploi et appels d'offres",
    stats: { value: "200+", label: "Offres actives" },
    link: "/categorie/opportunites",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)"
  },
  {
    id: 4,
    icon: "bell",
    title: "Alertes",
    subtitle: "Sanitaires",
    description: "Alertes épidémiologiques en temps réel",
    stats: { value: "24/7", label: "Surveillance" },
    link: "/alertes",
    color: "#EF4444",
    gradient: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)"
  }
];

const DashboardSection = () => {
  const [activeCard, setActiveCard] = useState(null);

  return (
    <section className="dashboard-section">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <span className="header-badge">
              <FontAwesome name="th-large" /> Services AfricaVet
            </span>
            <h2>Votre Écosystème <span>Professionnel</span></h2>
            <p>Accédez à tous les outils et ressources pour les professionnels de la santé animale en Afrique</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {dashboardItems.map((item) => (
            <Link
              to={item.link}
              key={item.id}
              className={`dashboard-card ${activeCard === item.id ? 'active' : ''}`}
              onMouseEnter={() => setActiveCard(item.id)}
              onMouseLeave={() => setActiveCard(null)}
              style={{ '--card-color': item.color, '--card-gradient': item.gradient }}
            >
              <div className="card-bg">
                <div className="card-pattern"></div>
              </div>

              <div className="card-icon">
                <FontAwesome name={item.icon} />
              </div>

              <div className="card-content">
                <h3>
                  {item.title}
                  <span>{item.subtitle}</span>
                </h3>
                <p>{item.description}</p>
              </div>

              <div className="card-stats">
                <div className="stat-value">{item.stats.value}</div>
                <div className="stat-label">{item.stats.label}</div>
              </div>

              <div className="card-action">
                <span>Accéder</span>
                <FontAwesome name="arrow-right" />
              </div>
            </Link>
          ))}
        </div>

        <div className="dashboard-cta">
          <div className="cta-content">
            <FontAwesome name="rocket" />
            <div className="cta-text">
              <strong>Vous êtes professionnel ?</strong>
              <span>Rejoignez la communauté et accédez à tous les services</span>
            </div>
          </div>
          <Link to="/inscription" className="cta-button">
            <FontAwesome name="user-plus" />
            Créer un compte gratuit
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
