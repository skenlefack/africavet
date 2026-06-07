import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";
import { vetAlertsApi } from "../../services/api";
import "./pillars.scss";

const pillars = [
  { id: 1, icon: "newspaper-o", title: "S'informer", description: "Actualités vétérinaires africaines", link: "/categorie/news", color: "#1091FF", colorRgb: "16, 145, 255", stat: "800+", statLabel: "articles" },
  { id: 2, icon: "globe", title: "One Health", description: "Santé humaine, animale, environnement", link: "/categorie/one-health", color: "#00AB6C", colorRgb: "0, 171, 108", stat: "54", statLabel: "pays" },
  { id: 3, icon: "graduation-cap", title: "Se Former", description: "Formations et certifications", link: "/formations", color: "#FF6B35", colorRgb: "255, 107, 53", stat: "150+", statLabel: "cours" },
  { id: 4, icon: "briefcase", title: "Opportunités", description: "Emplois et appels d'offres", link: "/opportunites", color: "#8B5CF6", colorRgb: "139, 92, 246", stat: "400+", statLabel: "offres" },
  { id: 5, icon: "address-book", title: "Annuaire", description: "Annuaire Vétérinaire Panafricain", link: "/annuaire", color: "#EC4899", colorRgb: "236, 72, 153", stat: "5000+", statLabel: "pros" },
];

const severityConfig = {
  critical: { icon: "exclamation-circle", color: "#d32f2f", bg: "rgba(211,47,47,0.1)", label: "CRITIQUE" },
  high: { icon: "exclamation-triangle", color: "#e65100", bg: "rgba(230,81,0,0.1)", label: "ÉLEVÉE" },
  informational: { icon: "info-circle", color: "#1565c0", bg: "rgba(21,101,192,0.1)", label: "INFO" },
};

const PillarsSection = () => {
  const [hoveredId, setHoveredId] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const res = await vetAlertsApi.getAll({ limit: 6 });
      if (res.success) setAlerts(res.data || []);
    } catch (e) { /* silent */ }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <section className="pillars-section">
      <div className="container">
        {/* Main Pillars Card */}
        <div className="pillars-wrapper">
          <div className="pillars-bg-shapes">
            <div className="shape shape-1" />
            <div className="shape shape-2" />
            <div className="shape shape-3" />
          </div>

          <div className="pillars-grid">
            <div className="pillars-header">
              <div className="pillars-badge"><FontAwesome name="star" /> Nos Services</div>
              <h2>Les 5 Piliers <span>AfricaVET</span></h2>
              <p>Votre écosystème complet pour la santé animale en Afrique</p>
            </div>
            <div className="pillars-cards">
              {pillars.map((pillar, index) => (
                <Link to={pillar.link} key={pillar.id}
                  className={`pillar-card ${hoveredId === pillar.id ? 'active' : ''}`}
                  style={{ '--pillar-color': pillar.color, '--pillar-color-rgb': pillar.colorRgb, '--card-delay': `${index * 0.08}s` }}
                  onMouseEnter={() => setHoveredId(pillar.id)} onMouseLeave={() => setHoveredId(null)}>
                  <div className="pillar-glow" />
                  <div className="pillar-icon"><FontAwesome name={pillar.icon} /></div>
                  <div className="pillar-content">
                    <h3>{pillar.title}</h3>
                    <p>{pillar.description}</p>
                  </div>
                  <div className="pillar-stat">
                    <span className="stat-value">{pillar.stat}</span>
                    <span className="stat-label">{pillar.statLabel}</span>
                  </div>
                  <div className="pillar-arrow"><FontAwesome name="arrow-right" /></div>
                </Link>
              ))}
            </div>
          </div>

          {/* Alerts Sidebar (replaces auth) */}
          <div className="alerts-sidebar">
            <div className="alerts-card">
              <div className="alerts-header">
                <div className="alerts-icon-pulse">
                  <FontAwesome name="exclamation-triangle" />
                </div>
                <h3>Alertes sanitaires</h3>
              </div>
              {alerts.length > 0 ? (
                <div className="alerts-ticker">
                  {alerts.slice(0, 4).map((alert, i) => {
                    const sev = severityConfig[alert.severity_level] || severityConfig.informational;
                    return (
                      <Link to={`/alertes-veterinaires/${alert.id}`} key={alert.id} className="alert-ticker-item"
                            style={{ animationDelay: `${i * 0.1}s` }}>
                        <span className="alert-sev-dot" style={{ background: sev.color }} />
                        <div className="alert-ticker-text">
                          <span className="alert-ticker-title">{(alert.title_fr || '').substring(0, 50)}{(alert.title_fr || '').length > 50 ? '...' : ''}</span>
                          <span className="alert-ticker-meta">
                            <span style={{ color: sev.color, fontWeight: 600, fontSize: '9px' }}>{sev.label}</span>
                            {alert.country && <> · {alert.country}</>}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="alerts-empty">
                  <FontAwesome name="check-circle" />
                  <span>Aucune alerte en cours</span>
                </div>
              )}
              <Link to="/alertes-veterinaires" className="alerts-see-all">
                Voir toutes les alertes <FontAwesome name="arrow-right" />
              </Link>
            </div>
          </div>
        </div>

        {/* Auth Bar - Below Pillars */}
        <div className="auth-bar">
          <div className="auth-bar-left">
            <div className="auth-bar-icon">
              <FontAwesome name="user-circle" />
            </div>
            <div className="auth-bar-text">
              <strong>Rejoignez AfricaVET</strong>
              <span>Formations gratuites · Alertes sanitaires · Offres d'emploi</span>
            </div>
          </div>
          <div className="auth-bar-actions">
            <Link to="/inscription" className="auth-bar-btn primary">
              <FontAwesome name="user-plus" /> Créer un compte gratuit
            </Link>
            <Link to="/connexion" className="auth-bar-btn secondary">
              <FontAwesome name="sign-in" /> Se connecter
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PillarsSection;
