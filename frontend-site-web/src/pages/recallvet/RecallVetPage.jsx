import React from "react";
import { Link } from "react-router-dom";
import FontAwesome from "../../component/uiStyle/FontAwesome";
import "./recallvet.scss";

const modules = {
  clinique: [
    { icon: "stethoscope", name: "Dossiers médicaux", desc: "Historique complet par animal : anamnèse, examens, diagnostics, traitements, allergies, vaccinations, poids" },
    { icon: "notes-medical", name: "Consultations", desc: "Notes cliniques structurées avec aide IA intégrée pour l'aide au diagnostic" },
    { icon: "calendar-check-o", name: "Rendez-vous", desc: "Calendrier intelligent avec rappels automatiques (SMS, WhatsApp, Email)" },
    { icon: "flask", name: "Laboratoire", desc: "Demandes d'analyses, suivi des résultats, comparaison aux valeurs de référence" },
    { icon: "medkit", name: "Pharmacie", desc: "Stock en temps réel, codes ATCvet, alertes d'expiration, suivi des substances contrôlées" },
  ],
  elevage: [
    { icon: "map-marker", name: "Fermes & troupeaux", desc: "Profils de ferme avec score de biosécurité, cartographie GPS, suivi de capacité" },
    { icon: "line-chart", name: "Épidémiologie", desc: "Carte interactive des foyers, zones de protection, déclarations OIE/WAHIS automatisées" },
    { icon: "institution", name: "Portail gouvernemental", desc: "Accès lecture seule pour les services vétérinaires officiels — surveillance en temps réel" },
  ],
  commercial: [
    { icon: "file-text-o", name: "Facturation", desc: "Factures conformes OHADA, paiements mobile money, multi-devises (FCFA par défaut)" },
    { icon: "bullhorn", name: "CRM & Marketing", desc: "Campagnes SMS/WhatsApp/Email, coupons, programme de fidélité (Bronze/Argent/Or)" },
    { icon: "smile-o", name: "Satisfaction (NPS)", desc: "Score NPS, enquêtes post-visite, avis clients, intégration Google Reviews" },
    { icon: "dashboard", name: "Tableaux de bord", desc: "KPIs en temps réel : CA, consultations, patients actifs, tendances" },
  ],
  transversal: [
    { icon: "wifi", name: "Mode hors ligne", desc: "Travaillez sans internet, synchronisation automatique au retour du réseau" },
    { icon: "globe", name: "Multi-pays", desc: "Devises, langues (FR/EN/AR), fuseaux horaires — un seul compte pour tout le réseau" },
    { icon: "mobile", name: "Portail client", desc: "Vos éleveurs accèdent à leurs données via un simple code SMS — aucune app à installer" },
    { icon: "tasks", name: "Gestion des tâches", desc: "Tableau Kanban pour organiser le travail de l'équipe" },
    { icon: "bell", name: "Notifications", desc: "Rappels vaccins, alertes stock, confirmations RDV — par SMS, WhatsApp, Email ou Push" },
  ],
};

const reasons = [
  { icon: "wifi", title: "Fonctionne hors ligne", desc: "Mode offline complet avec synchronisation intelligente. Idéal pour les visites en brousse et les zones à faible couverture réseau.", color: "#1091FF" },
  { icon: "certificate", title: "Conforme aux normes internationales", desc: "Déclarations OIE/WAHIS intégrées, comptabilité OHADA, traçabilité complète avec journal d'audit.", color: "#00AB6C" },
  { icon: "th-large", title: "Cabinet + Élevage dans un seul outil", desc: "Que vous soigniez des chiens en ville ou des troupeaux de 500 bovins, RecallVET s'adapte.", color: "#FF6B35" },
  { icon: "universal-access", title: "Accessible à tous", desc: "Connexion par SMS pour les éleveurs, interface trilingue (FR/EN/AR), compatible mobile et desktop.", color: "#8B5CF6" },
  { icon: "magic", title: "Intelligence artificielle", desc: "Aide au diagnostic intégrée dans les consultations pour des décisions cliniques plus rapides.", color: "#EC4899" },
  { icon: "cloud", title: "Déploiement flexible", desc: "Solution cloud ou installation locale, de la clinique solo au réseau de 100+ cabinets.", color: "#F59E0B" },
];

const audiences = [
  { icon: "user-md", title: "Vétérinaires praticiens", desc: "Gérez vos consultations, prescriptions et suivis patients" },
  { icon: "building", title: "Propriétaires de cabinets", desc: "Pilotez votre activité avec des tableaux de bord et la facturation intégrée" },
  { icon: "paw", title: "Éleveurs & coopératives", desc: "Suivez vos troupeaux, scores de biosécurité et calendriers vaccinaux" },
  { icon: "shield", title: "Services vétérinaires d'État", desc: "Surveillez l'épidémiologie et les déclarations sanitaires en temps réel" },
];

const ModuleCard = ({ icon, name, desc }) => (
  <div className="rv-module-card">
    <div className="rv-module-icon">
      <FontAwesome name={icon} />
    </div>
    <div className="rv-module-text">
      <h4>{name}</h4>
      <p>{desc}</p>
    </div>
  </div>
);

const RecallVetPage = () => {
  return (
    <div className="recallvet-page">
      {/* Hero */}
      <section className="rv-hero">
        <div className="rv-hero-shapes">
          <div className="rv-shape rv-shape-1" />
          <div className="rv-shape rv-shape-2" />
          <div className="rv-shape rv-shape-3" />
        </div>
        <div className="container">
          <div className="rv-hero-content">
            <div className="rv-hero-badge">
              <FontAwesome name="star" /> +250 cabinets nous font confiance &middot; 4.9/5 &eacute;toiles
            </div>
            <h1>
              <span className="rv-brand">RecallVET</span>
              <br />
              Le logiciel v&eacute;t&eacute;rinaire tout-en-un con&ccedil;u pour l'Afrique
            </h1>
            <p className="rv-hero-sub">
              G&eacute;rez votre cabinet, vos fermes et vos troupeaux depuis une seule plateforme
              &mdash; m&ecirc;me sans connexion internet.
            </p>
            <div className="rv-hero-ctas">
              <a href="https://recallvet.com" target="_blank" rel="noopener noreferrer" className="rv-btn rv-btn-primary">
                <FontAwesome name="rocket" /> Essayer gratuitement
              </a>
              <a href="mailto:contact@recallvet.com" className="rv-btn rv-btn-outline">
                <FontAwesome name="play-circle" /> Demander une d&eacute;mo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problème */}
      <section className="rv-problem">
        <div className="container">
          <div className="rv-problem-box">
            <div className="rv-problem-icon">
              <FontAwesome name="exclamation-triangle" />
            </div>
            <div className="rv-problem-text">
              <h2>Vous jonglez entre carnets papier, tableurs Excel et applications qui ne marchent pas hors ligne ?</h2>
              <p>
                En Afrique, les v&eacute;t&eacute;rinaires font face &agrave; des d&eacute;fis uniques : zones rurales sans internet fiable,
                r&eacute;glementations OIE &agrave; respecter, gestion mixte cabinet + &eacute;levages, et des &eacute;leveurs qui n'ont
                qu'un t&eacute;l&eacute;phone basique. <strong>RecallVET a &eacute;t&eacute; pens&eacute; pour r&eacute;soudre exactement ces probl&egrave;mes.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 18 Modules */}
      <section className="rv-modules">
        <div className="container">
          <div className="rv-section-header">
            <span className="rv-badge">18 modules int&eacute;gr&eacute;s</span>
            <h2>Tout ce dont votre pratique a besoin, dans un seul outil</h2>
          </div>

          <div className="rv-module-group">
            <h3><FontAwesome name="heartbeat" /> Gestion clinique</h3>
            <div className="rv-module-grid">
              {modules.clinique.map((m, i) => <ModuleCard key={i} {...m} />)}
            </div>
          </div>

          <div className="rv-module-group">
            <h3><FontAwesome name="leaf" /> Gestion des &eacute;levages</h3>
            <div className="rv-module-grid">
              {modules.elevage.map((m, i) => <ModuleCard key={i} {...m} />)}
            </div>
          </div>

          <div className="rv-module-group">
            <h3><FontAwesome name="bar-chart" /> Gestion commerciale</h3>
            <div className="rv-module-grid">
              {modules.commercial.map((m, i) => <ModuleCard key={i} {...m} />)}
            </div>
          </div>

          <div className="rv-module-group">
            <h3><FontAwesome name="cogs" /> Fonctionnalit&eacute;s transversales</h3>
            <div className="rv-module-grid">
              {modules.transversal.map((m, i) => <ModuleCard key={i} {...m} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi RecallVET */}
      <section className="rv-reasons">
        <div className="container">
          <div className="rv-section-header">
            <span className="rv-badge">Avantages</span>
            <h2>6 raisons de choisir RecallVET</h2>
          </div>
          <div className="rv-reasons-grid">
            {reasons.map((r, i) => (
              <div key={i} className="rv-reason-card" style={{ '--accent': r.color }}>
                <div className="rv-reason-icon">
                  <FontAwesome name={r.icon} />
                </div>
                <h4>{r.title}</h4>
                <p>{r.desc}</p>
                <div className="rv-reason-number">{String(i + 1).padStart(2, '0')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* À qui s'adresse RecallVET */}
      <section className="rv-audience">
        <div className="container">
          <div className="rv-section-header">
            <span className="rv-badge">&Agrave; qui s'adresse RecallVET ?</span>
            <h2>Une solution pour chaque acteur de la sant&eacute; animale</h2>
          </div>
          <div className="rv-audience-grid">
            {audiences.map((a, i) => (
              <div key={i} className="rv-audience-card">
                <div className="rv-audience-icon">
                  <FontAwesome name={a.icon} />
                </div>
                <h4>{a.title}</h4>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="rv-cta-final">
        <div className="rv-cta-shapes">
          <div className="rv-shape rv-shape-1" />
          <div className="rv-shape rv-shape-2" />
        </div>
        <div className="container">
          <div className="rv-cta-content">
            <h2>Pr&ecirc;t &agrave; moderniser votre pratique v&eacute;t&eacute;rinaire ?</h2>
            <p>Rejoignez les +250 cabinets qui font d&eacute;j&agrave; confiance &agrave; RecallVET.</p>
            <div className="rv-cta-buttons">
              <a href="https://recallvet.com" target="_blank" rel="noopener noreferrer" className="rv-btn rv-btn-white">
                <FontAwesome name="rocket" /> D&eacute;marrer maintenant
              </a>
              <a href="mailto:contact@recallvet.com" className="rv-btn rv-btn-ghost">
                <FontAwesome name="calendar" /> Planifier une d&eacute;mo
              </a>
              <a href="mailto:contact@recallvet.com" className="rv-btn rv-btn-ghost">
                <FontAwesome name="envelope" /> Nous contacter
              </a>
            </div>
            <div className="rv-footer-tagline">
              Petits soins &middot; Grand sourire &#128062;
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RecallVetPage;
