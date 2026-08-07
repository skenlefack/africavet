import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import FontAwesome from "../uiStyle/FontAwesome";
import "./style.scss";

const DashboardSection = () => {
  const { t } = useTranslation();
  const [activeCard, setActiveCard] = useState(null);

  const dashboardItems = [
    {
      id: 1,
      icon: "address-book",
      title: t('nav.directory'),
      subtitle: t('home.panAfrican'),
      description: t('home.directoryDesc'),
      stats: { value: "5000+", label: "Professionals" },
      link: "/annuaire",
      color: "#EC4899",
      gradient: "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)"
    },
    {
      id: 2,
      icon: "graduation-cap",
      title: "E-Learning",
      subtitle: t('home.continuingEd'),
      description: t('home.learnDesc'),
      stats: { value: "150+", label: t('elearning.courses') },
      link: "/formations",
      color: "#FF6B35",
      gradient: "linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)"
    },
    {
      id: 3,
      icon: "briefcase",
      title: t('opportunities.title'),
      subtitle: "",
      description: t('home.opportunitiesDesc'),
      stats: { value: "200+", label: t('opportunities.jobs') },
      link: "/opportunites",
      color: "#8B5CF6",
      gradient: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)"
    },
    {
      id: 4,
      icon: "bell",
      title: t('alerts.title'),
      subtitle: "",
      description: t('home.alertsDesc'),
      stats: { value: "24/7", label: "Surveillance" },
      link: "/alertes-veterinaires",
      color: "#EF4444",
      gradient: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)"
    }
  ];

  return (
    <section className="dashboard-section">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <span className="header-badge">
              <FontAwesome name="th-large" /> {t('footer.services')} AfricaVET
            </span>
            <h2>{t('home.ecosystemTitle')} <span>{t('home.panAfrican')}</span></h2>
            <p>{t('home.ecosystemDesc')}</p>
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
                  {item.subtitle && <span>{item.subtitle}</span>}
                </h3>
                <p>{item.description}</p>
              </div>

              <div className="card-stats">
                <div className="stat-value">{item.stats.value}</div>
                <div className="stat-label">{item.stats.label}</div>
              </div>

              <div className="card-action">
                <span>{t('home.access')}</span>
                <FontAwesome name="arrow-right" />
              </div>
            </Link>
          ))}
        </div>

        <div className="dashboard-cta">
          <div className="cta-content">
            <FontAwesome name="rocket" />
            <div className="cta-text">
              <strong>{t('home.areProfessional')}</strong>
              <span>{t('home.joinDesc')}</span>
            </div>
          </div>
          <Link to="/inscription" className="cta-button">
            <FontAwesome name="user-plus" />
            {t('auth.createFreeAccount')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
