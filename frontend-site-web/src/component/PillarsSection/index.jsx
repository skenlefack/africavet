import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";
import { opportunitiesApi } from "../../services/api";
import "./pillars.scss";

const pillars = [
  { id: 1, icon: "newspaper-o", title: "S'informer", description: "Actualités vétérinaires africaines", link: "/categorie/news", color: "#1091FF", colorRgb: "16, 145, 255", stat: "800+", statLabel: "articles" },
  { id: 2, icon: "globe", title: "One Health", description: "Santé humaine, animale, environnement", link: "/categorie/one-health", color: "#00AB6C", colorRgb: "0, 171, 108", stat: "54", statLabel: "pays" },
  { id: 3, icon: "graduation-cap", title: "Se Former", description: "Formations et certifications", link: "/formations", color: "#FF6B35", colorRgb: "255, 107, 53", stat: "150+", statLabel: "cours" },
  { id: 4, icon: "briefcase", title: "Opportunités", description: "Emplois et appels d'offres", link: "/opportunites", color: "#8B5CF6", colorRgb: "139, 92, 246", stat: "400+", statLabel: "offres" },
  { id: 5, icon: "address-book", title: "Annuaire", description: "Annuaire Vétérinaire Panafricain", link: "/annuaire", color: "#EC4899", colorRgb: "236, 72, 153", stat: "5000+", statLabel: "pros" },
];

const typeConfig = {
  job: { icon: "briefcase", color: "#8B5CF6", label: "Emploi" },
  tender: { icon: "file-text", color: "#1091FF", label: "Appel d'offres" },
  market: { icon: "shopping-cart", color: "#00AB6C", label: "Marché" },
};

const PillarsSection = () => {
  const [hoveredId, setHoveredId] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef(null);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      const res = await opportunitiesApi.getAll({ limit: 8, sort: 'newest', public: 1 });
      if (res.success) setOpportunities(res.data || []);
    } catch (e) { /* silent */ }
  };

  const startAutoSlide = useCallback(() => {
    if (slideInterval.current) clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % Math.max(1, opportunities.length));
    }, 4000);
  }, [opportunities.length]);

  useEffect(() => {
    if (opportunities.length > 1) startAutoSlide();
    return () => { if (slideInterval.current) clearInterval(slideInterval.current); };
  }, [opportunities.length, startAutoSlide]);

  const goToSlide = (idx) => {
    setCurrentSlide(idx);
    startAutoSlide();
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
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

          {/* Opportunities Slider Sidebar */}
          <div className="opps-sidebar">
            <div className="opps-card">
              <div className="opps-header">
                <div className="opps-icon-pulse">
                  <FontAwesome name="briefcase" />
                </div>
                <div>
                  <h3>Opportunités</h3>
                  <span className="opps-count">{opportunities.length} récentes</span>
                </div>
              </div>

              {opportunities.length > 0 ? (
                <div className="opps-slider">
                  <div className="opps-slide-track" style={{ transform: `translateY(-${currentSlide * 230}px)` }}>
                    {opportunities.map((opp) => {
                      const type = typeConfig[opp.opportunity_type] || typeConfig.job;
                      const title = opp.title_fr || opp.title_en || 'Opportunité';
                      const days = getDaysRemaining(opp.deadline);
                      return (
                        <div className="opps-slide" key={opp.id}>
                          <div className="opps-slide-top">
                            <span className="opps-type-badge" style={{ background: type.color }}>
                              <FontAwesome name={type.icon} /> {type.label}
                            </span>
                            {days && <span className={`opps-deadline ${days <= 7 ? 'urgent' : ''}`}>{days}j</span>}
                          </div>
                          <h4 className="opps-title">{title}</h4>
                          <div className="opps-meta">
                            {opp.organization_name && <span><FontAwesome name="building" /> {opp.organization_name}</span>}
                            {opp.country && <span><FontAwesome name="map-marker" /> {opp.country}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="opps-dots">
                    {opportunities.map((_, idx) => (
                      <button key={idx} className={`opps-dot ${idx === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(idx)} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="opps-empty">
                  <FontAwesome name="briefcase" />
                  <span>Chargement...</span>
                </div>
              )}

              <Link to="/opportunites" className="opps-see-all">
                Voir toutes les opportunités <FontAwesome name="arrow-right" />
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
